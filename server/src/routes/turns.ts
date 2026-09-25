import type { FastifyInstance } from 'fastify';
import { TurnRequest, type TurnStreamEvent } from '@narrator/shared';
import { assertCanTakeTurn, claimCampaign, runTurn, type EngineDeps } from '../engine/turn';
import { undoLastTurn } from '../engine/undo';
import { parseWith } from '../http/errors';

const HEARTBEAT_MS = 15_000;

/** Turn routes. Registered inside the verified-campaign scope. */
export function registerTurnRoutes(app: FastifyInstance, engine: Omit<EngineDeps, 'log'>): void {
  /**
   * Play a turn. Validation failures answer with plain JSON; once the turn starts, the response
   * becomes a Server-Sent Events stream of TurnStreamEvents ending in `done` or `error`.
   */
  app.post('/turns', async (request, reply) => {
    const { content } = parseWith(TurnRequest, request.body);
    const deps: EngineDeps = { ...engine, log: request.log };
    const release = claimCampaign(request.campaignId);
    let stream;
    try {
      stream = await assertCanTakeTurn(deps, request.campaignId);
    } catch (err) {
      release();
      throw err;
    }

    reply.hijack();
    const res = reply.raw;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // don't let a proxy buffer the stream
    });
    // If the player closes the tab mid-turn, the turn still finishes and is saved.
    let open = true;
    res.on('close', () => {
      open = false;
    });
    const send = (event: TurnStreamEvent) => {
      if (open) res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
    };
    // Adaptive thinking can pause output for a while; comments keep idle proxies from closing the stream.
    const heartbeat = setInterval(() => open && res.write(': keep-alive\n\n'), HEARTBEAT_MS);

    try {
      await runTurn(deps, stream, request.campaignId, content, send);
    } finally {
      clearInterval(heartbeat);
      release();
      if (open) res.end();
    }
  });

  app.post('/turns/undo', async (request) => {
    const release = claimCampaign(request.campaignId);
    try {
      return await undoLastTurn(app.db, request.campaignId);
    } finally {
      release();
    }
  });
}
