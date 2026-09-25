/**
 * Local UI development without API calls: runs the real app, but the narrator is a scripted fake
 * that calls real tools (so the sidebar, toasts, log, and debug drawer all have something to show),
 * and memory upkeep uses a fake utility model.
 *
 *   npx tsx server/scripts/demo-server.ts        (uses DATABASE_URL, APP_PASSWORD, ... from .env)
 *
 * Not part of the production bundle.
 */
import type Anthropic from '@anthropic-ai/sdk';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';
import { createDb } from '../src/db/client';
import { loadDotEnv } from '../src/env';
import type { UtilityFn } from '../src/engine/memory';
import type { ModelStream, StreamFn } from '../src/engine/narrator';

type Reply = { text?: string; tools?: { name: string; input: unknown }[] };

/** Text of a message, whether plain or split into blocks (the engine adds a cache marker that way). */
function textOf(m: Anthropic.MessageParam): string {
  if (typeof m.content === 'string') return m.content;
  return m.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
}

const isToolResults = (m: Anthropic.MessageParam) => typeof m.content !== 'string' && m.content.some((b) => b.type === 'tool_result');

/** The player's latest message (the last user message that isn't tool results). */
function lastUserText(params: Anthropic.MessageStreamParams): string {
  for (let i = params.messages.length - 1; i >= 0; i--) {
    const m = params.messages[i]!;
    if (m.role === 'user' && !isToolResults(m)) return textOf(m);
  }
  return '';
}

function toolResults(params: Anthropic.MessageStreamParams): { name: string; content: unknown }[] {
  const last = params.messages.at(-1);
  const prev = params.messages.at(-2);
  if (!last || typeof last.content === 'string' || !prev || typeof prev.content === 'string') return [];
  const uses = prev.content.filter((b): b is Anthropic.ToolUseBlockParam => b.type === 'tool_use');
  return last.content
    .filter((b): b is Anthropic.ToolResultBlockParam => b.type === 'tool_result')
    .map((r) => {
      const name = uses.find((u) => u.id === r.tool_use_id)?.name ?? '?';
      try {
        return { name, content: JSON.parse(String(r.content)) };
      } catch {
        return { name, content: r.content };
      }
    });
}

/** Decide the fake narrator's next move from the conversation so far. */
function script(params: Anthropic.MessageStreamParams): Reply {
  const said = lastUserText(params).toLowerCase();
  const results = toolResults(params);
  const firstRound = !isToolResults(params.messages.at(-1)!);

  if (firstRound) {
    if (/\b(ooc:|\()/.test(said)) return { text: '*(Out of character)* This is the demo narrator. It answers every question the same way: with enthusiasm and no real knowledge.' };
    const destination = /\b(?:go|head|walk|travel|return)(?:s)? (?:back )?to (?:the )?([^.!?]+)/i.exec(lastUserText(params));
    if (destination) return { tools: [{ name: 'move_player', input: { location_name: destination[1]!.trim() } }] };
    if (/pack|carry|inventory|bag|have on me/.test(said)) return { tools: [{ name: 'get_inventory', input: {} }] };
    if (/buy|pay|coin|gold|money/.test(said)) {
      return { text: 'You reach for your purse. ', tools: [{ name: 'get_money', input: {} }, { name: 'adjust_money', input: { delta: -3, reason: 'a round of drinks' } }] };
    }
    return {
      text: 'You steady yourself and try. ',
      tools: [
        { name: 'skill_check', input: { skill_name: 'Perception', difficulty: 'medium', action: 'reading the room' } },
        { name: 'adjust_relationship', input: { npc_name: 'Brakka', trust_delta: 2, affinity_delta: 1, note: 'Shared a quiet word by the fire' } },
        { name: 'grant_xp', input: { amount: 15, reason: 'keen eyes' } },
      ],
    };
  }

  const moved = results.find((r) => r.name === 'move_player');
  if (moved) {
    const place = (moved.content as { nowAt?: { name?: string } })?.nowAt?.name;
    return { text: place ? `You make your way to **${place}**. The air changes as you step inside.

What do you do?` : `You can't find the way there. (${String(moved.content)})` };
  }
  const inventory = results.find((r) => r.name === 'get_inventory')?.content as { items?: { name: string; quantity: number; equipped: boolean }[] } | undefined;
  if (inventory?.items) {
    const lines = inventory.items.map((i) => `- **${i.name}**${i.quantity > 1 ? ` ×${i.quantity}` : ''}${i.equipped ? ' *(equipped)*' : ''}`);
    return { text: `You set your pack down and take stock:\n\n${lines.join('\n')}\n\nEverything is where you left it. What now?` };
  }
  const spent = results.find((r) => r.name === 'adjust_money')?.content as { balance?: number } | undefined;
  if (spent?.balance !== undefined) {
    return { text: `The coins clink onto the bar, leaving you **${spent.balance} gold**. Brakka slides three foaming mugs your way and winks.\n\n"On the house next time," she lies.` };
  }
  const check = results.find((r) => r.name === 'skill_check')?.content as { outcome?: string } | undefined;
  const outcome = check?.outcome ?? 'success';
  const beat = {
    success: 'Everything snaps into focus: the guard who keeps glancing at the north door, the ash on the windowsill, the way the fire gutters when the wind shifts.',
    partial: 'You catch most of it (the ash on the windowsill, the guard glancing north), but you are staring, and someone has noticed.',
    fail: 'The room is a blur of noise and firelight. Whatever was there to see, you missed it.',
  }[outcome];
  return { text: `${beat}\n\nBrakka catches your eye across the room and raises her mug. *"Hold the gate,"* she mouths.\n\nWhat do you do?` };
}

function fakeStream(): StreamFn {
  let calls = 0;
  return (params) => {
    calls++;
    const reply = script(params);
    const content: Anthropic.ContentBlock[] = [];
    if (reply.text) content.push({ type: 'text', text: reply.text, citations: null } as Anthropic.TextBlock);
    reply.tools?.forEach((t, i) => content.push({ type: 'tool_use', id: `toolu_demo_${calls}_${i}`, name: t.name, input: t.input } as Anthropic.ToolUseBlock));
    const message = {
      id: `msg_demo_${calls}`,
      type: 'message',
      role: 'assistant',
      model: params.model,
      content,
      stop_reason: reply.tools?.length ? 'tool_use' : 'end_turn',
      stop_sequence: null,
      // Plausible numbers so the debug drawer has something to show (the first call "writes" the cache).
      usage: { input_tokens: 900, output_tokens: 160, cache_creation_input_tokens: calls === 1 ? 5400 : 0, cache_read_input_tokens: calls === 1 ? 0 : 5400 },
    } as unknown as Anthropic.Message;
    const listeners: ((d: string) => void)[] = [];
    const stream: ModelStream = {
      on: (_e, l) => listeners.push(l),
      finalMessage: async () => {
        for (const word of (reply.text ?? '').split(/(?<=\s)/)) {
          await new Promise((r) => setTimeout(r, 18));
          listeners.forEach((l) => l(word));
        }
        return message;
      },
    };
    return stream;
  };
}

/** A fake utility model: stitches summaries from first sentences, keeps the latest notes as "condensed". */
const fakeUtility: UtilityFn = async ({ system, prompt }) => {
  await new Promise((r) => setTimeout(r, 800));
  const usage = { inputTokens: Math.ceil(prompt.length / 4), outputTokens: 120 };
  if (system.includes('bullets')) {
    const notes = prompt.match(/^- .+$/gm) ?? [];
    return { text: notes.slice(-4).join('\n') || '- They have met.', ...usage };
  }
  const previous = /# Current summary\n\n([\s\S]*?)\n\n# Transcript/.exec(prompt)?.[1] ?? '';
  const beats = [...prompt.matchAll(/\] Narrator:\n([^\n]*?[.!?])/g)].map((m) => m[1]);
  const kept = previous.startsWith('(None') ? '' : previous.replace(/\n\nWhere things stand:[\s\S]*$/, '');
  const text = [kept, `(Demo summary) ${beats.join(' ')}`, 'Where things stand: the demo narrator waits for your next move.'];
  return { text: text.filter(Boolean).join('\n\n'), ...usage };
};

async function main() {
  loadDotEnv();
  const config = loadConfig();
  const { db, pool, ping } = createDb(config.DATABASE_URL);
  const app = await buildApp({ config, db, pingDb: ping, stream: fakeStream(), utility: fakeUtility });
  app.addHook('onClose', () => pool.end());
  await app.listen({ port: config.PORT, host: config.HOST });
  app.log.warn('Demo server: the narrator is a scripted fake. No API calls are made.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
