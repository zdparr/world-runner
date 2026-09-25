import type { FastifyPluginAsync } from 'fastify';
import type { HealthResponse } from '@narrator/shared';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  // Render's health check. Returns 503 when Postgres is unreachable so a broken deploy never goes live.
  app.get('/healthz', { logLevel: 'warn' }, async (request, reply) => {
    let db: HealthResponse['db'] = 'up';
    try {
      await app.pingDb();
    } catch (err) {
      db = 'down';
      request.log.warn({ err }, 'Health check: database unreachable');
    }
    const body: HealthResponse = { ok: db === 'up', db, uptimeSeconds: Math.round(process.uptime()) };
    return reply.code(body.ok ? 200 : 503).send(body);
  });
};
