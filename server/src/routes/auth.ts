import type { FastifyPluginAsync } from 'fastify';
import { LoginRequest, type MeResponse } from '@narrator/shared';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionValue, passwordMatches } from '../auth';

export const authRoutes: FastifyPluginAsync = async (app) => {
  const { APP_PASSWORD, NODE_ENV } = app.config;
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'lax' as const,
  };

  app.post('/login', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = LoginRequest.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
    }
    if (!passwordMatches(parsed.data.password, APP_PASSWORD)) {
      request.log.info('Login failed');
      return reply.code(401).send({ error: 'Wrong password' });
    }
    reply.setCookie(SESSION_COOKIE, createSessionValue(APP_PASSWORD), {
      ...cookieOptions,
      signed: true,
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return { authenticated: true } satisfies MeResponse;
  });

  app.post('/logout', async (_request, reply) => {
    reply.clearCookie(SESSION_COOKIE, cookieOptions);
    return { authenticated: false } satisfies MeResponse;
  });

  app.get('/me', async (request) => ({ authenticated: request.isAuthenticated }) satisfies MeResponse);
};
