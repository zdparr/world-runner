import { existsSync } from 'node:fs';
import Fastify, { type FastifyInstance, type FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import fastifyStatic from '@fastify/static';
import type { Config } from './config';
import type { Db } from './db/client';
import { createAnthropicStream } from './engine/anthropic';
import type { StreamFn } from './engine/narrator';
import type { EngineDeps } from './engine/turn';
import { HttpError, httpErrorFromPg } from './http/errors';
import { SESSION_COOKIE, isSessionValueValid } from './auth';
import { webDistDir } from './paths';
import { authRoutes } from './routes/auth';
import { campaignRoutes } from './routes/campaigns';
import { healthRoutes } from './routes/health';
import { helloRoutes } from './routes/hello';

export interface AppDeps {
  config: Config;
  db: Db;
  pingDb: () => Promise<void>;
  /** Model stream for the narrator. Omit to build one from ANTHROPIC_API_KEY; tests pass a scripted fake. */
  stream?: StreamFn | null;
  /** Serve the built SPA from web/dist. Off in tests. */
  serveWeb?: boolean;
}

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
    db: Db;
    pingDb: () => Promise<void>;
    engine: Omit<EngineDeps, 'log'>;
  }
  interface FastifyRequest {
    isAuthenticated: boolean;
  }
}

// API routes reachable without a session.
const PUBLIC_API_ROUTES = new Set(['/api/auth/login', '/api/auth/logout', '/api/auth/me']);

const HASHED_ASSET = /[\\/]assets[\\/]/;

function pathOf(url: string): string {
  return url.split('?')[0] ?? '';
}

function readSession(request: FastifyRequest, password: string): boolean {
  const raw = request.cookies[SESSION_COOKIE];
  if (!raw) return false;
  const unsigned = request.unsignCookie(raw);
  return unsigned.valid && unsigned.value !== null && isSessionValueValid(unsigned.value, password);
}

export async function buildApp({ config, db, pingDb, stream, serveWeb = true }: AppDeps): Promise<FastifyInstance> {
  const app = Fastify({
    trustProxy: true, // Render terminates TLS in front of us.
    logger: {
      level: config.NODE_ENV === 'test' ? 'silent' : config.LOG_LEVEL,
      redact: {
        paths: [
          'req.headers.cookie',
          'req.headers.authorization',
          'res.headers["set-cookie"]',
          '*.password',
          '*.APP_PASSWORD',
          '*.SESSION_SECRET',
          '*.ANTHROPIC_API_KEY',
        ],
        censor: '[redacted]',
      },
      transport:
        config.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
  });

  app.decorate('config', config);
  app.decorate('db', db);
  app.decorate('pingDb', pingDb);
  app.decorate('engine', {
    db,
    stream: stream !== undefined ? stream : config.ANTHROPIC_API_KEY ? createAnthropicStream(config.ANTHROPIC_API_KEY) : null,
    model: config.NARRATOR_MODEL,
    effort: config.NARRATOR_EFFORT,
  });
  app.decorateRequest('isAuthenticated', false);

  await app.register(cookie, { secret: config.SESSION_SECRET });
  await app.register(rateLimit, { global: false });

  app.addHook('onRequest', async (request, reply) => {
    request.isAuthenticated = readSession(request, config.APP_PASSWORD);
    const path = pathOf(request.url);
    if (path.startsWith('/api/') && !PUBLIC_API_ROUTES.has(path) && !request.isAuthenticated) {
      return reply.code(401).send({ error: 'Not authenticated' });
    }
  });

  // Must be set before routes are registered: each plugin captures the handler in effect when it loads.
  app.setErrorHandler<Error & { statusCode?: number }>((err, request, reply) => {
    const mapped = err instanceof HttpError ? err : httpErrorFromPg(err);
    if (mapped) {
      return reply.code(mapped.statusCode).send({ error: mapped.message, details: mapped.details });
    }
    // Fastify's own client errors (bad JSON, body too large, rate limit) carry a 4xx statusCode.
    const status = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    if (status >= 500) request.log.error({ err }, 'Unhandled error');
    return reply.code(status).send({ error: status >= 500 ? 'Internal server error' : err.message });
  });

  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(helloRoutes, { prefix: '/api' });
  await app.register(campaignRoutes, { prefix: '/api/campaigns' });

  const webAvailable = serveWeb && existsSync(webDistDir);
  if (webAvailable) {
    await app.register(fastifyStatic, {
      root: webDistDir,
      wildcard: false,
      setHeaders(res, filePath) {
        // Vite fingerprints everything under /assets; index.html must always revalidate.
        res.header('Cache-Control', HASHED_ASSET.test(filePath) ? 'public, max-age=31536000, immutable' : 'no-cache');
      },
    });
  } else if (serveWeb) {
    app.log.warn({ webDistDir }, 'web/dist not found; run `npm run build` to serve the frontend');
  }

  app.setNotFoundHandler((request, reply) => {
    const path = pathOf(request.url);
    // SPA fallback: unknown non-API GETs get index.html so client-side routes survive a reload.
    // Paths that look like files (e.g. a stale /assets/index-abc.js) get a real 404, not HTML.
    const looksLikeFile = /\.[a-z0-9]+$/i.test(path);
    if (webAvailable && request.method === 'GET' && !path.startsWith('/api/') && !looksLikeFile) {
      return reply.header('Cache-Control', 'no-cache').sendFile('index.html');
    }
    return reply.code(404).send({ error: 'Not found' });
  });

  return app;
}
