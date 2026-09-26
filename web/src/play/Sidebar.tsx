import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ATTRIBUTES, characterXpToNext, skillXpToNext, type CampaignState, type StateEvent } from '@narrator/shared';
import { api } from '../api';
import { Button, cx } from '../components/ui';
import { MapTab } from './MapView';

export const TABS = ['Character', 'Inventory', 'Relationships', 'Missions', 'Map', 'Log'] as const;
export type Tab = (typeof TABS)[number];

export function Sidebar({ campaignId, state, tab, onTab }: { campaignId: string; state: CampaignState; tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <TabBar tab={tab} onTab={onTab} />
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'Character' && <CharacterTab state={state} />}
        {tab === 'Inventory' && <InventoryTab state={state} />}
        {tab === 'Relationships' && <RelationshipsTab state={state} />}
        {tab === 'Missions' && <MissionsTab state={state} />}
        {tab === 'Map' && <MapTab map={state.map} currentId={state.character?.currentLocationId ?? null} />}
        {tab === 'Log' && (
          <>
            <StorySoFar campaignId={campaignId} state={state} />
            <LogTab campaignId={campaignId} />
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- tab bar

const tabClass = (active: boolean) =>
  cx(
    '-mb-px shrink-0 border-b-2 px-1.5 py-3 text-[0.7rem] font-semibold tracking-[0.05em] whitespace-nowrap uppercase transition',
    active ? 'border-brass text-brass' : 'border-transparent text-parchment-faint hover:text-parchment',
  );

/**
 * The section tabs in one row when they fit; otherwise (a narrow panel, e.g. on a phone) a
 * hamburger menu. A hidden copy of the row is measured to decide, so it adapts to any width.
 */
function TabBar({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  const bar = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useLayoutEffect(() => {
    const el = bar.current;
    if (!el) return;
    const check = () => setCollapsed((probe.current?.scrollWidth ?? 0) > el.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const choose = (t: Tab) => {
    onTab(t);
    setMenuOpen(false);
  };

  return (
    <div ref={bar} className="relative shrink-0 border-b border-ink-700">
      {/* Measuring copy: never visible, never focusable. */}
      <div ref={probe} aria-hidden className="pointer-events-none invisible absolute top-0 left-0 flex gap-0.5 px-3">
        {TABS.map((t) => (
          <span key={t} className={tabClass(false)}>
            {t}
          </span>
        ))}
      </div>

      {collapsed ? (
        <>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label="Sections"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-[0.7rem] font-semibold tracking-[0.06em] text-brass uppercase"
          >
            <HamburgerIcon />
            <span className="flex-1">{tab}</span>
            <span className={cx('text-parchment-faint transition', menuOpen && 'rotate-180')} aria-hidden>
              ▾
            </span>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <ul role="menu" className="absolute inset-x-2 top-full z-20 mt-1 overflow-hidden rounded-lg border border-ink-600 bg-ink-900 py-1 shadow-xl shadow-black/40">
                {TABS.map((t) => (
                  <li key={t}>
                    <button
                      role="menuitem"
                      onClick={() => choose(t)}
                      className={cx(
                        'w-full px-4 py-2.5 text-left text-sm transition',
                        t === tab ? 'bg-brass/10 text-brass' : 'text-parchment-dim hover:bg-ink-800 hover:text-parchment',
                      )}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <nav role="tablist" className="flex justify-between gap-0.5 px-3">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => onTab(t)} className={tabClass(tab === t)}>
              {t}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={cx('size-4', className)} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}

// ---------------------------------------------------------------- bits

function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2 flex items-baseline justify-between text-[0.68rem] font-semibold tracking-[0.16em] text-parchment-faint uppercase">
        <span>{title}</span>
        {right}
      </h3>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="font-story text-sm text-parchment-faint italic">{children}</p>;
}

/** A filled bar for 0..max values. */
function Meter({ value, max, tone = 'bg-brass', label }: { value: number; max: number; tone?: string; label?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} className="h-1.5 overflow-hidden rounded-full bg-ink-700">
      <div className={cx('h-full rounded-full transition-[width] duration-500', tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** A bar for -100..100 values, filling out from the centre. */
function Balance({ value, label }: { value: number; label: string }) {
  const pct = Math.min(100, Math.abs(value)) / 2;
  return (
    <div className="grid grid-cols-[4.2rem_1fr_2.2rem] items-center gap-2 text-xs">
      <span className="text-parchment-faint">{label}</span>
      <div role="meter" aria-label={label} aria-valuenow={value} aria-valuemin={-100} aria-valuemax={100} className="relative h-1.5 rounded-full bg-ink-700">
        <div className="absolute inset-y-0 left-1/2 w-px bg-ink-600" />
        <div
          className={cx('absolute inset-y-0 rounded-full transition-all duration-500', value >= 0 ? 'left-1/2 bg-verdigris' : 'right-1/2 bg-ember')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={cx('text-right tabular-nums', value > 0 ? 'text-verdigris' : value < 0 ? 'text-ember' : 'text-parchment-faint')}>
        {value > 0 ? `+${value}` : value}
      </span>
    </div>
  );
}

function Chip({ children, tone = 'text-parchment-dim border-ink-600' }: { children: ReactNode; tone?: string }) {
  return <span className={cx('inline-block rounded-full border px-2 py-0.5 text-[0.7rem] leading-tight', tone)}>{children}</span>;
}

// ---------------------------------------------------------------- tabs

function CharacterTab({ state }: { state: CampaignState }) {
  const pc = state.character;
  if (!pc) return <Empty>No character yet.</Empty>;
  const toNext = characterXpToNext(pc.level);
  return (
    <>
      <div className="mb-5">
        <h2 className="font-story text-xl text-parchment">{pc.name}</h2>
        <p className="text-sm text-parchment-dim">
          Level {pc.level}
          {pc.archetype && <> · {pc.archetype}</>}
        </p>
        {state.location && <p className="mt-1 text-xs text-parchment-faint">at {state.location.name}</p>}
        {state.campaign.ruleset === 'ascension' && <p className="mt-1 text-xs text-parchment-faint">Day {state.campaign.gameDay}</p>}
      </div>

      <Section title="Vitals">
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-parchment-faint">Health</span>
              <span className="tabular-nums text-parchment">
                {pc.hp} / {pc.maxHp}
              </span>
            </div>
            <Meter value={pc.hp} max={pc.maxHp} tone={pc.hp / pc.maxHp <= 0.3 ? 'bg-ember' : 'bg-ember/80'} label="Health" />
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-parchment-faint">Experience</span>
              <span className="tabular-nums text-parchment">
                {pc.xp} / {toNext}
              </span>
            </div>
            <Meter value={pc.xp} max={toNext} label="Experience" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-parchment-faint">Purse</span>
            <span className="font-semibold tabular-nums text-brass-bright">
              {pc.money.toLocaleString()} {state.campaign.currencyName}
            </span>
          </div>
        </div>
      </Section>

      {state.campaign.ruleset === 'ascension' && (
        <Section
          title="Attributes"
          right={
            pc.unspentStatPoints > 0 ? (
              <Chip tone="border-sky-400/60 text-sky-300">
                {pc.unspentStatPoints} unspent point{pc.unspentStatPoints === 1 ? '' : 's'}
              </Chip>
            ) : undefined
          }
        >
          <dl className="grid grid-cols-5 gap-1.5 text-center">
            {ATTRIBUTES.map((a) => (
              <div key={a} className="rounded-md border border-ink-700 bg-ink-950/40 px-1 py-1.5">
                <dt className="text-[0.6rem] tracking-[0.12em] text-parchment-faint uppercase">{a.slice(0, 3)}</dt>
                <dd className="font-semibold tabular-nums text-parchment" title={a[0]!.toUpperCase() + a.slice(1)}>
                  {pc.attributes[a] ?? 0}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {pc.statusEffects.length > 0 && (
        <Section title="Conditions">
          <div className="flex flex-wrap gap-1.5">
            {pc.statusEffects.map((s) => (
              <Chip key={s.name} tone="border-ember/50 text-ember">
                <span title={s.description || undefined}>
                  {s.name}
                  {s.turnsRemaining ? ` · ${s.turnsRemaining}t` : ''}
                </span>
              </Chip>
            ))}
          </div>
        </Section>
      )}

      <Section title="Skills">
        {state.skills.length === 0 ? (
          <Empty>No skills yet.</Empty>
        ) : (
          <ul className="space-y-3">
            {state.skills.map((s) => (
              <li key={s.id} title={s.description || undefined}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="text-parchment">{s.name}</span>
                  <span className="text-xs text-parchment-faint">
                    <span className="font-semibold text-brass">Lv {s.level}</span> · {s.xp}/{skillXpToNext(s.level)}
                  </span>
                </div>
                <Meter value={s.xp} max={skillXpToNext(s.level)} tone="bg-brass/70" label={`${s.name} progress`} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

function InventoryTab({ state }: { state: CampaignState }) {
  if (state.items.length === 0) return <Empty>Empty pockets.</Empty>;
  const equipped = state.items.filter((i) => i.equipped);
  const pack = state.items.filter((i) => !i.equipped);
  const list = (items: CampaignState['items']) => (
    <ul className="space-y-1.5">
      {items.map((i) => (
        <li key={i.id}>
          <details className="group rounded-md border border-ink-700 bg-ink-950/40 px-3 py-2 open:border-ink-600">
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2 text-sm">
              <span className="text-parchment">{i.name}</span>
              {i.quantity > 1 && <span className="text-xs tabular-nums text-parchment-faint">×{i.quantity}</span>}
            </summary>
            {i.description && <p className="mt-2 font-story text-sm leading-relaxed text-parchment-dim">{i.description}</p>}
            {i.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {i.tags.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            )}
          </details>
        </li>
      ))}
    </ul>
  );
  return (
    <>
      {equipped.length > 0 && <Section title="Equipped">{list(equipped)}</Section>}
      {pack.length > 0 && <Section title="Pack">{list(pack)}</Section>}
    </>
  );
}

function RelationshipsTab({ state }: { state: CampaignState }) {
  if (state.relationships.length === 0) return <Empty>No one knows you yet. Give it time.</Empty>;
  return (
    <ul className="space-y-3">
      {state.relationships.map((r) => (
        <li key={r.id} className="rounded-md border border-ink-700 bg-ink-950/40 p-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className={cx('text-sm', r.npcAlive ? 'text-parchment' : 'text-parchment-faint line-through')}>{r.npcName}</span>
            <Chip tone="border-brass/40 text-brass">{r.status}</Chip>
          </div>
          <div className="space-y-1.5">
            <Balance label="Affinity" value={r.affinity} />
            <Balance label="Trust" value={r.trust} />
          </div>
          {r.historyNotes && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-parchment-faint hover:text-parchment">History</summary>
              <p className="mt-1 font-story text-sm leading-relaxed whitespace-pre-line text-parchment-dim">{r.historyNotes}</p>
            </details>
          )}
        </li>
      ))}
    </ul>
  );
}

const MISSION_GROUPS = [
  { status: 'active', title: 'Active' },
  { status: 'offered', title: 'Offered' },
  { status: 'completed', title: 'Completed' },
  { status: 'failed', title: 'Failed' },
] as const;

function MissionsTab({ state }: { state: CampaignState }) {
  if (state.missions.length === 0) return <Empty>No missions yet. Someone in this world needs something done.</Empty>;
  return (
    <>
      {MISSION_GROUPS.map(({ status, title }) => {
        const missions = state.missions.filter((m) => m.status === status);
        if (missions.length === 0) return null;
        return (
          <Section key={status} title={title}>
            <ul className="space-y-3">
              {missions.map((m) => (
                <li key={m.id} className={cx('rounded-md border p-3', status === 'active' ? 'border-brass/40 bg-brass/5' : 'border-ink-700 bg-ink-950/40')}>
                  <p className={cx('font-story', status === 'failed' ? 'text-parchment-faint line-through' : 'text-parchment')}>
                    {m.title}
                    {m.recurrence === 'daily' && (
                      <span className="ml-2 align-middle">
                        <Chip tone="border-sky-400/50 text-sky-300">{status === 'completed' ? 'Daily · done today' : 'Daily'}</Chip>
                      </span>
                    )}
                  </p>
                  {m.giverName && <p className="text-xs text-parchment-faint">from {m.giverName}</p>}
                  {(status === 'active' || status === 'offered') && m.description && (
                    <p className="mt-2 text-sm leading-relaxed text-parchment-dim">{m.description}</p>
                  )}
                  {m.objectives.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {m.objectives.map((o) => (
                        <li key={o.id} className="flex gap-2 text-sm">
                          <span aria-hidden className={o.done ? 'text-verdigris' : 'text-parchment-faint'}>
                            {o.done ? '✓' : '○'}
                          </span>
                          <span className={o.done ? 'text-parchment-faint line-through' : 'text-parchment-dim'}>{o.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        );
      })}
    </>
  );
}

/** The rolling summary the narrator reads in place of older turns, with a manual refresh. */
function StorySoFar({ campaignId, state }: { campaignId: string; state: CampaignState }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const update = useMutation({
    mutationFn: () => api.updateMemory(campaignId),
    onSuccess: () => Promise.all(['state', 'events'].map((k) => queryClient.invalidateQueries({ queryKey: [k, campaignId] }))),
  });
  const summary = state.campaign.rollingSummary.trim();
  const result = update.data;

  return (
    <Section
      title="Story so far"
      right={
        state.memoryEnabled && state.campaign.turnCount > 0 ? (
          <button
            onClick={() => update.mutate()}
            disabled={update.isPending}
            className="text-[0.66rem] tracking-[0.08em] text-parchment-faint normal-case transition hover:text-brass disabled:opacity-60"
          >
            {update.isPending ? 'Updating…' : 'Update now'}
          </button>
        ) : undefined
      }
    >
      {summary ? (
        <div className="rounded-lg border border-ink-700 bg-ink-950/40 p-3">
          <p className={cx('font-story text-sm leading-relaxed whitespace-pre-line text-parchment-dim', !open && 'line-clamp-6')}>{summary}</p>
          <button onClick={() => setOpen((o) => !o)} className="mt-2 text-xs text-brass/80 hover:text-brass">
            {open ? 'Show less' : 'Read all'}
          </button>
        </div>
      ) : (
        <Empty>
          {state.memoryEnabled
            ? `Nothing summarized yet. Every ${state.campaign.summaryInterval} turns, older scenes are folded into a summary the narrator keeps in mind.`
            : 'Memory upkeep is off until ANTHROPIC_API_KEY is set on the server.'}
        </Empty>
      )}
      {update.isError && <p className="mt-2 text-xs text-ember">{update.error.message}</p>}
      {result && (
        <p className="mt-2 text-xs text-parchment-faint">
          {[
            result.summary
              ? `Folded turns ${result.summary.fromTurn === result.summary.toTurn ? result.summary.fromTurn : `${result.summary.fromTurn}–${result.summary.toTurn}`} into the summary.`
              : 'The recent turns are all still in view; nothing to fold.',
            result.condensed.length > 0 ? `Condensed notes for ${result.condensed.join(', ')}.` : '',
          ]
            .filter(Boolean)
            .join(' ')}
        </p>
      )}
    </Section>
  );
}

function LogTab({ campaignId }: { campaignId: string }) {
  const events = useInfiniteQuery({
    queryKey: ['events', campaignId],
    queryFn: ({ pageParam }) => api.events(campaignId, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) => last.nextBefore ?? undefined,
  });
  if (events.isPending) return <Empty>Reading the ledger…</Empty>;
  if (events.isError) return <p className="text-sm text-ember">{events.error.message}</p>;

  // Pages are newest-first; within a page, events are oldest-first. Show newest at the top.
  const all = events.data.pages.flatMap((p) => [...p.items].reverse());
  if (all.length === 0) return <Empty>Nothing has changed yet. Every gain, loss, and roll will be recorded here.</Empty>;
  const byTurn = new Map<number, StateEvent[]>();
  for (const e of all) byTurn.set(e.turnNumber, [...(byTurn.get(e.turnNumber) ?? []), e]);

  return (
    <>
      {[...byTurn].map(([turn, list]) => (
        <Section key={turn} title={`Turn ${turn}`}>
          <ul className="space-y-1">
            {list.map((e) => (
              <li key={e.id} className={cx('text-sm', e.eventType.startsWith('memory_') ? 'text-parchment-faint italic' : 'text-parchment-dim')}>
                {e.humanReadable}
              </li>
            ))}
          </ul>
        </Section>
      ))}
      {events.hasNextPage && (
        <Button variant="subtle" disabled={events.isFetchingNextPage} onClick={() => events.fetchNextPage()}>
          {events.isFetchingNextPage ? 'Loading…' : 'Older entries'}
        </Button>
      )}
    </>
  );
}
