import type { FastifyPluginAsync } from 'fastify';
import type { HelloResponse } from '@narrator/shared';

// Phase 1 smoke-test route: proves auth and API wiring end to end.
export const helloRoutes: FastifyPluginAsync = async (app) => {
  app.get('/hello', async () => {
    const body: HelloResponse = {
      message: 'The narrator is awake. The world is waiting to be written.',
      serverTime: new Date().toISOString(),
    };
    return body;
  });
};
