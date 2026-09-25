import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@narrator/shared';
import { cx } from '../components/ui';
import { DebugDrawer } from './DebugDrawer';

export const isOoc = (text: string) => /^\s*(ooc:|\()/i.test(text);

export function Narration({ text, streaming = false }: { text: string; streaming?: boolean }) {
  return (
    <div className="story">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      {streaming && <span aria-hidden className="animate-caret ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-brass" />}
    </div>
  );
}

export function PlayerLine({ text, faded = false }: { text: string; faded?: boolean }) {
  const ooc = isOoc(text);
  return (
    <div className={cx('border-l-2 pl-4', ooc ? 'border-ink-600' : 'border-brass/60', faded && 'opacity-60')}>
      <p className="mb-0.5 text-[0.66rem] font-semibold tracking-[0.18em] text-parchment-faint uppercase">{ooc ? 'Out of character' : 'You'}</p>
      <p className={cx('leading-relaxed whitespace-pre-wrap', ooc ? 'text-parchment-dim italic' : 'text-parchment')}>{text}</p>
    </div>
  );
}

/** One saved turn: the player's message and the narrator's reply, with the debug drawer. */
export function TurnBlock({ campaignId, turn, player, narrator }: { campaignId: string; turn: number; player?: Message; narrator?: Message }) {
  const [debugOpen, setDebugOpen] = useState(false);
  return (
    <article className="space-y-5">
      {player && <PlayerLine text={player.content} />}
      {narrator && (
        <div>
          <Narration text={narrator.content} />
          <div className="mt-2 flex items-center gap-3 text-[0.7rem] text-parchment-faint">
            <span>Turn {turn}</span>
            <button onClick={() => setDebugOpen((o) => !o)} aria-expanded={debugOpen} className="transition hover:text-parchment">
              {debugOpen ? 'Hide debug' : 'Debug'}
            </button>
          </div>
          {debugOpen && <DebugDrawer campaignId={campaignId} turn={turn} />}
        </div>
      )}
    </article>
  );
}

/** Group a flat message list into turns. */
export function groupTurns(messages: Message[]) {
  const turns = new Map<number, { player?: Message; narrator?: Message }>();
  for (const m of messages) {
    const t = turns.get(m.turnNumber) ?? {};
    if (m.role === 'player') t.player = m;
    else t.narrator = m;
    turns.set(m.turnNumber, t);
  }
  return [...turns].map(([turn, t]) => ({ turn, ...t }));
}
