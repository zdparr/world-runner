import { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HIGHLIGHT_EVENT_TYPES, skillTier, type Message, type TurnHighlight } from '@narrator/shared';
import { cx } from '../components/ui';
import { DebugDrawer } from './DebugDrawer';

export const isOoc = (text: string) => /^\s*(ooc:|\()/i.test(text);
export const TIME_SKIP_PREFIX = '⏩ Time skip';
export const isTimeSkip = (text: string) => text.trimStart().startsWith(TIME_SKIP_PREFIX);

type HastNode = { type: string; value?: string; tagName?: string; properties?: { className?: unknown }; children?: HastNode[] };

const textOf = (node: HastNode): string => node.value ?? (node.children ?? []).map(textOf).join('');

/**
 * An in-world interface message: a fenced block tagged `system` (any world may use one; the narrator
 * prompt explains when). Lines like "[ LEVEL UP ]" are styled as headers.
 */
function SystemPanel({ text }: { text: string }) {
  const lines = text.replace(/\n$/, '').split('\n');
  return (
    <div className="system-panel" role="note" aria-label="System message">
      {lines.map((line, i) => (
        <div key={i} className={/^\s*\[.*\]\s*$/.test(line) ? 'system-header' : undefined}>
          {line || ' '}
        </div>
      ))}
    </div>
  );
}

const markdownComponents: Components = {
  pre({ node, children, ...rest }) {
    const code = (node as HastNode | undefined)?.children?.[0];
    const classes = code?.tagName === 'code' ? code.properties?.className : undefined;
    if (Array.isArray(classes) && classes.includes('language-system')) return <SystemPanel text={textOf(code!)} />;
    return <pre {...rest}>{children}</pre>;
  },
};

export function Narration({ text, streaming = false }: { text: string; streaming?: boolean }) {
  return (
    <div className="story">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {text}
      </ReactMarkdown>
      {streaming && <span aria-hidden className="animate-caret ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-brass" />}
    </div>
  );
}

export function PlayerLine({ text, faded = false }: { text: string; faded?: boolean }) {
  const ooc = isOoc(text);
  const skip = isTimeSkip(text);
  return (
    <div className={cx('border-l-2 pl-4', ooc ? 'border-ink-600' : skip ? 'border-sky-400/60' : 'border-brass/60', faded && 'opacity-60')}>
      <p className={cx('mb-0.5 text-[0.66rem] font-semibold tracking-[0.18em] uppercase', skip ? 'text-sky-300/80' : 'text-parchment-faint')}>
        {ooc ? 'Out of character' : skip ? 'Time skip' : 'You'}
      </p>
      <p className={cx('leading-relaxed whitespace-pre-wrap', ooc ? 'text-parchment-dim italic' : 'text-parchment')}>{text}</p>
    </div>
  );
}

const OUTCOME_TONE: Record<string, string> = {
  success: 'border-verdigris/50 text-verdigris',
  partial: 'border-brass/50 text-brass-bright',
  fail: 'border-ember/50 text-ember',
};

const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);

function CheckChip({ d }: { d: Record<string, unknown> }) {
  const outcome = String(d.outcome ?? '');
  const parts = [
    typeof d.skillBonus === 'number' && d.skillBonus !== 0 ? `${signed(d.skillBonus)} skill` : null,
    typeof d.attributeBonus === 'number' && d.attributeBonus !== 0 ? `${signed(d.attributeBonus)} ${String(d.attribute ?? 'attr').slice(0, 3)}` : null,
    typeof d.levelBonus === 'number' && d.levelBonus !== 0 ? `${signed(d.levelBonus)} lvl` : null,
  ].filter(Boolean);
  const math = `d20 ${d.roll}${parts.length ? ` ${parts.join(' ')}` : ''} = ${d.total} vs ${d.dc}`;
  return (
    <li className={cx('inline-flex flex-wrap items-center gap-x-1.5 rounded-md border bg-ink-950/40 px-2 py-1', OUTCOME_TONE[outcome] ?? 'border-ink-600')}>
      <span className="font-semibold">{String(d.skill)}</span>
      <span className="text-parchment-faint">· {String(d.difficulty)} ·</span>
      <span className="tabular-nums text-parchment-dim" title="The roll and what was added to it">{math}</span>
      <span className="font-semibold uppercase tracking-wider">{outcome}</span>
      {Boolean(d.decisive) && (
        <span className="rounded-sm bg-brass/15 px-1 text-brass-bright" title="Without this training, the same roll would have gone worse">
          ✦ training decided it
        </span>
      )}
      {d.trained === false && <span className="text-parchment-faint italic">untrained</span>}
    </li>
  );
}

/** The rolls and growth of one turn, under its narration: so the player sees what their training is doing. */
export function Highlights({ items }: { items: TurnHighlight[] }) {
  const shown = items.filter((h) => (HIGHLIGHT_EVENT_TYPES as readonly string[]).includes(h.eventType));
  if (shown.length === 0) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5 text-[0.72rem]" aria-label="Rolls and progress this turn">
      {shown.map((h, i) => {
        const d = h.details;
        switch (h.eventType) {
          case 'skill_check':
            return <CheckChip key={i} d={d} />;
          case 'skill_level': {
            const level = Number(d.level);
            const before = Number(d.levelBefore);
            const newTier = skillTier(level) !== skillTier(before) ? skillTier(level) : null;
            return (
              <li key={i} className="rounded-md border border-brass/50 bg-brass/10 px-2 py-1 text-brass-bright">
                ▲ {String(d.skill)} {before} → {level}
                {newTier && <span className="ml-1 font-semibold">· now {newTier}</span>}
              </li>
            );
          }
          case 'level_up':
            return (
              <li key={i} className="rounded-md border border-brass/60 bg-brass/15 px-2 py-1 font-semibold text-brass-bright">
                ★ {h.humanReadable}
              </li>
            );
          case 'time_skip':
            return (
              <li key={i} className="rounded-md border border-sky-400/40 bg-sky-400/5 px-2 py-1 text-sky-200">
                {h.humanReadable}
              </li>
            );
          default:
            return (
              <li key={i} className="rounded-md border border-ink-600 px-2 py-1 text-parchment-dim">
                {h.humanReadable}
              </li>
            );
        }
      })}
    </ul>
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
          {narrator.highlights && <Highlights items={narrator.highlights} />}
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
