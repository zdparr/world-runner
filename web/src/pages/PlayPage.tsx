import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { StateChange, TurnStreamEvent } from '@narrator/shared';
import { ApiRequestError, api } from '../api';
import { toneFor, useToast } from '../components/Toasts';
import { Button, ErrorNote, Spinner, cx } from '../components/ui';
import { Sidebar, type Tab } from '../play/Sidebar';
import { Narration, PlayerLine, TurnBlock, groupTurns } from '../play/Story';

interface PendingTurn {
  player: string;
  narration: string;
  /** Short notes on what the narrator is doing ("Perception check: success"). */
  activity: string[];
  changes: StateChange[];
  error: { message: string; retryable: boolean } | null;
  done: boolean;
  /** Set when the turn finishes, so the saved copy can take over once history reloads. */
  turnNumber: number | null;
}

/** A readable note for the tool calls worth surfacing while a turn streams. */
function activityFor(event: Extract<TurnStreamEvent, { type: 'tool' }>): string | null {
  const input = (event.input ?? {}) as Record<string, string>;
  switch (event.name) {
    case 'skill_check': {
      if (!event.ok) return null;
      try {
        const r = JSON.parse(event.summary) as { outcome: string };
        return `${input.skill_name} check (${input.difficulty}): ${r.outcome}`;
      } catch {
        return `${input.skill_name} check`;
      }
    }
    case 'get_inventory':
      return 'Checking your pack';
    case 'get_money':
      return 'Counting your purse';
    case 'get_skills':
      return 'Weighing your skills';
    case 'get_relationship':
      return `Recalling ${input.npc_name}`;
    case 'search_lore':
      return `Recalling lore: ${input.query}`;
    case 'search_past_events':
      return 'Searching memory';
    default:
      return null;
  }
}

export function PlayPage() {
  const { campaignId = '' } = useParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  const state = useQuery({ queryKey: ['state', campaignId], queryFn: () => api.state(campaignId) });
  const history = useInfiniteQuery({
    queryKey: ['messages', campaignId],
    queryFn: ({ pageParam }) => api.messages(campaignId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextBefore ?? undefined,
  });

  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<PendingTurn | null>(null);
  const [tab, setTab] = useState<Tab>('Character');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Pages arrive newest-first, each holding messages oldest-first.
  const messages = history.data ? [...history.data.pages].reverse().flatMap((p) => p.items) : [];
  const turns = groupTurns(messages);
  const busy = pending !== null && !pending.error && !pending.done;

  // Follow the story as it grows, unless the player has scrolled up to reread.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, pending?.narration, pending?.activity.length, pending?.error]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  // Autosize the composer.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [draft]);

  const refresh = () =>
    Promise.all(
      ['state', 'messages', 'events', 'campaigns'].map((k) => queryClient.invalidateQueries({ queryKey: k === 'campaigns' ? [k] : [k, campaignId] })),
    );

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setDraft('');
    stickToBottom.current = true;
    setPending({ player: content, narration: '', activity: [], changes: [], error: null, done: false, turnNumber: null });
    const update = (fn: (p: PendingTurn) => PendingTurn) => setPending((p) => (p ? fn(p) : p));

    const fail = (message: string, retryable: boolean) => {
      update((p) => ({ ...p, error: { message, retryable } }));
      // Nothing was saved: put the words back so they can be sent again or edited.
      setDraft((d) => d || content);
      void queryClient.invalidateQueries({ queryKey: ['state', campaignId] });
    };

    try {
      await api.playTurn(campaignId, content, (event) => {
        switch (event.type) {
          case 'text':
            update((p) => ({ ...p, narration: p.narration + event.delta }));
            break;
          case 'tool': {
            const note = activityFor(event);
            if (note) update((p) => ({ ...p, activity: [...p.activity, note] }));
            break;
          }
          case 'state_change':
            if (event.change.eventType !== 'skill_check') toast(event.change.humanReadable, toneFor(event.change.eventType));
            update((p) => ({ ...p, changes: [...p.changes, event.change] }));
            break;
          case 'done':
            update((p) => ({ ...p, narration: event.narration, done: true, turnNumber: event.turnNumber }));
            void refresh().then(() => setPending(null));
            // Memory upkeep (summary, condensed notes) finishes a few seconds after the turn: pick it up.
            for (const delay of [6_000, 20_000]) {
              window.setTimeout(() => {
                for (const k of ['state', 'events']) void queryClient.invalidateQueries({ queryKey: [k, campaignId] });
              }, delay);
            }
            break;
          case 'error':
            fail(event.message, event.retryable);
            break;
        }
      });
    } catch (err) {
      fail(err instanceof Error ? err.message : 'Could not reach the server', !(err instanceof ApiRequestError && err.status < 500));
    }
  }

  const undo = useMutation({
    mutationFn: () => api.undo(campaignId),
    onSuccess: async (result) => {
      const undonePlayer = turns.find((t) => t.turn === result.undoneTurn)?.player?.content;
      setConfirmUndo(false);
      await refresh();
      toast(`Turn ${result.undoneTurn} undone`, 'neutral');
      // Offer the undone words back for a rewrite.
      if (undonePlayer && !draft) setDraft(undonePlayer);
    },
  });

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send(draft);
    }
  }

  if (state.isError) return <ErrorNote>{state.error.message}</ErrorNote>;
  if (!state.data || history.isPending) return <Spinner label="Opening the book…" />;
  const s = state.data;

  if (!s.character) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-16 text-center">
        <h1 className="font-display text-2xl tracking-[0.1em] text-parchment">{s.campaign.name}</h1>
        <p className="font-story text-parchment-dim">Every story needs someone to happen to. Build your character first.</p>
        <Link to={`/campaigns/${campaignId}/character`} className="inline-block rounded-md bg-brass px-4 py-2 font-semibold text-ink-950 hover:bg-brass-bright">
          Build character
        </Link>
      </div>
    );
  }

  const lastTurn = s.campaign.turnCount;
  // Once history includes the finished turn, the in-flight copy steps aside.
  const live = pending && !(pending.done && turns.some((t) => t.turn === pending.turnNumber)) ? pending : null;
  const empty = turns.length === 0 && !live;

  const sidebar = <Sidebar campaignId={campaignId} state={s} tab={tab} onTab={setTab} />;

  return (
    <div className="flex h-full min-h-0">
      {/* ------------------------------------------------ story column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center gap-3 border-b border-ink-700/80 px-4 py-2.5 sm:px-6">
          <Link to="/" className="text-sm text-parchment-faint hover:text-parchment" aria-label="Back to campaigns">
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-story text-parchment">{s.campaign.name}</h1>
            <p className="truncate text-xs text-parchment-faint">
              {s.character.name}
              {s.location && ` · ${s.location.name}`}
            </p>
          </div>
          {confirmUndo ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden text-xs text-parchment-dim sm:inline">Undo turn {lastTurn}?</span>
              <Button variant="danger" className="px-2.5 py-1" disabled={undo.isPending} onClick={() => undo.mutate()}>
                {undo.isPending ? 'Undoing…' : 'Undo'}
              </Button>
              <Button variant="subtle" className="px-2 py-1" onClick={() => setConfirmUndo(false)}>
                Keep
              </Button>
            </div>
          ) : (
            <Button
              variant="subtle"
              className="px-2 py-1"
              disabled={lastTurn === 0 || busy}
              title="Revert the last turn: the story and every state change"
              onClick={() => setConfirmUndo(true)}
            >
              ↶ Undo
            </Button>
          )}
          <Button variant="ghost" className="px-2.5 py-1 lg:hidden" onClick={() => setSheetOpen(true)}>
            Sheet
          </Button>
        </div>
        {undo.isError && (
          <div className="px-4 pt-2 sm:px-6">
            <ErrorNote>{undo.error.message}</ErrorNote>
          </div>
        )}

        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          }}
          className="scroll-thin min-h-0 flex-1 overflow-y-auto"
        >
          <div className="mx-auto max-w-2xl space-y-10 px-4 py-8 sm:px-6">
            {history.hasNextPage && (
              <div className="text-center">
                <Button variant="subtle" disabled={history.isFetchingNextPage} onClick={() => history.fetchNextPage()}>
                  {history.isFetchingNextPage ? 'Turning back the pages…' : 'Earlier in the story'}
                </Button>
              </div>
            )}

            {empty && (
              <div className="py-10 text-center">
                <p className="text-xs tracking-[0.2em] text-parchment-faint uppercase">Chapter One</p>
                <h2 className="mt-2 font-display text-2xl tracking-[0.1em] text-parchment">{s.location?.name ?? s.campaign.name}</h2>
                {s.location?.description && <p className="mx-auto mt-4 max-w-md font-story leading-relaxed text-parchment-dim italic">{s.location.description}</p>}
                <Button variant="primary" className="mt-8" onClick={() => void send('Begin the story.')}>
                  Begin the story
                </Button>
                <p className="mt-3 text-xs text-parchment-faint">or write your first move below</p>
              </div>
            )}

            {turns.map((t) => (
              <TurnBlock key={t.turn} campaignId={campaignId} turn={t.turn} player={t.player} narrator={t.narrator} />
            ))}

            {live && (
              <article className="space-y-5" aria-live="polite">
                <PlayerLine text={live.player} faded={Boolean(live.error)} />
                {live.activity.length > 0 && !live.error && (
                  <ul className="space-y-0.5 text-xs text-parchment-faint italic">
                    {live.activity.map((a, i) => (
                      <li key={i}>· {a}</li>
                    ))}
                  </ul>
                )}
                {live.error ? (
                  <div className="space-y-3">
                    <ErrorNote>{live.error.message}</ErrorNote>
                    <div className="flex gap-2">
                      {live.error.retryable && (
                        <Button variant="primary" onClick={() => void send(live.player)}>
                          Try again
                        </Button>
                      )}
                      <Button variant="subtle" onClick={() => setPending(null)}>
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ) : live.narration ? (
                  <Narration text={live.narration} streaming={!live.done} />
                ) : (
                  <p className="font-story text-parchment-faint italic">The narrator considers…</p>
                )}
              </article>
            )}
          </div>
        </div>

        {/* ---------------------------------------------- composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="shrink-0 border-t border-ink-700/80 bg-ink-950/70 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6"
        >
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={draft}
              disabled={busy}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={busy ? 'The narrator is writing…' : 'What do you do?'}
              aria-label="Your action"
              className="scroll-thin min-h-11 flex-1 resize-none rounded-lg border border-ink-600 bg-ink-900 px-3.5 py-2.5 font-story text-parchment placeholder:text-parchment-faint/70 focus:border-brass focus:outline-none disabled:opacity-60"
            />
            <Button type="submit" variant="primary" className="h-11" disabled={busy || !draft.trim()}>
              Send
            </Button>
          </div>
          <p className="mx-auto mt-1.5 hidden max-w-2xl text-[0.68rem] text-parchment-faint sm:block">
            Enter to send · Shift+Enter for a new line · Start with <span className="font-mono">OOC:</span> to talk to the narrator
          </p>
        </form>
      </div>

      {/* ------------------------------------------------ sidebar (desktop) */}
      <aside className="hidden w-[23rem] shrink-0 border-l border-ink-700/80 bg-ink-900/50 lg:block">{sidebar}</aside>

      {/* ------------------------------------------------ bottom sheet (mobile) */}
      <div className={cx('fixed inset-0 z-40 lg:hidden', sheetOpen ? '' : 'pointer-events-none')} aria-hidden={!sheetOpen}>
        <div
          onClick={() => setSheetOpen(false)}
          className={cx('absolute inset-0 bg-black/60 transition-opacity', sheetOpen ? 'opacity-100' : 'opacity-0')}
        />
        <div
          role="dialog"
          aria-label="Character sheet"
          className={cx(
            'absolute inset-x-0 bottom-0 flex h-[78dvh] flex-col rounded-t-2xl border-t border-ink-600 bg-ink-900 shadow-2xl transition-transform duration-300',
            sheetOpen ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="relative flex h-10 shrink-0 items-center justify-center">
            <span className="h-1 w-10 rounded-full bg-ink-600" aria-hidden />
            <button onClick={() => setSheetOpen(false)} className="absolute right-2 p-2 text-parchment-faint hover:text-parchment" aria-label="Close">
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1">{sidebar}</div>
        </div>
      </div>
    </div>
  );
}
