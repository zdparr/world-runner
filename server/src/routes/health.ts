import type { FastifyPluginAsync } from 'fastify';
import type { HealthResponse } from '@narrator/shared';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  // Render's health check. Returns 503 when Postgres is unreachable so a broken deploy never goes live.
  // Render polls this every few seconds; keep successful checks out of the logs.
  const logLevel = app.log.level === 'silent' ? 'silent' : 'warn';
  app.get('/healthz', { logLevel }, async (request, reply) => {
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
