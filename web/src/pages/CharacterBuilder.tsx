import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CharacterSheet, CharacterSheetSave, Location, StatusEffect } from '@narrator/shared';
import { ApiRequestError, api } from '../api';
import { Button, ErrorNote, Input, Label, NumberInput, Panel, Select, Spinner, Textarea, cx } from '../components/ui';

// ---------------------------------------------------------------- draft model

interface DraftCharacter {
  name: string;
  archetype: string;
  bio: string;
  currentLocationId: string | null;
  money: number;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  statusEffects: StatusEffect[];
}

interface DraftSkill {
  key: string;
  id?: string;
  name: string;
  level: number;
  xp: number;
  description: string;
}

interface DraftItem {
  key: string;
  id?: string;
  name: string;
  description: string;
  quantity: number;
  tagsText: string;
  equipped: boolean;
  properties: Record<string, unknown>;
}

interface Draft {
  character: DraftCharacter;
  skills: DraftSkill[];
  items: DraftItem[];
}

const ARCHETYPES = ['rogue', 'fighter', 'sailor', 'scholar', 'priest', 'bard', 'mercenary', 'smuggler', 'noble', 'healer'];

let keySeq = 0;
const newKey = () => `k${++keySeq}`;

function draftFrom(sheet: CharacterSheet, locations: Location[]): Draft {
  const c = sheet.character;
  return {
    character: c
      ? {
          name: c.name,
          archetype: c.archetype,
          bio: c.bio,
          currentLocationId: c.currentLocationId,
          money: c.money,
          level: c.level,
          xp: c.xp,
          hp: c.hp,
          maxHp: c.maxHp,
          statusEffects: c.statusEffects,
        }
      : {
          name: '',
          archetype: '',
          bio: '',
          currentLocationId: locations[0]?.id ?? null,
          money: 25,
          level: 1,
          xp: 0,
          hp: 10,
          maxHp: 10,
          statusEffects: [],
        },
    skills: sheet.skills.map((s) => ({ key: s.id, id: s.id, name: s.name, level: s.level, xp: s.xp, description: s.description })),
    items: sheet.items.map((i) => ({
      key: i.id,
      id: i.id,
      name: i.name,
      description: i.description,
      quantity: i.quantity,
      tagsText: i.tags.join(', '),
      equipped: i.equipped,
      properties: i.properties,
    })),
  };
}

const int = (n: number, fallback: number) => (Number.isFinite(n) ? n : fallback);

function toPayload(d: Draft): CharacterSheetSave {
  const c = d.character;
  return {
    character: {
      ...c,
      name: c.name.trim(),
      archetype: c.archetype.trim(),
      money: int(c.money, 0),
      level: int(c.level, 1),
      xp: int(c.xp, 0),
      hp: int(c.hp, 1),
      maxHp: int(c.maxHp, 1),
    },
    skills: d.skills.map(({ id, name, level, xp, description }) => ({
      ...(id ? { id } : {}),
      name: name.trim(),
      level: int(level, 1),
      xp,
      description,
    })),
    items: d.items.map(({ id, name, description, quantity, tagsText, equipped, properties }) => ({
      ...(id ? { id } : {}),
      name: name.trim(),
      description,
      quantity: int(quantity, 1),
      tags: tagsText
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      equipped,
      properties,
    })),
  };
}

/** Problems worth flagging before the server sees them. */
function problemsOf(d: Draft): string[] {
  const out: string[] = [];
  if (!d.character.name.trim()) out.push('Your character needs a name.');
  if (int(d.character.hp, 0) > int(d.character.maxHp, 0)) out.push('HP cannot be higher than max HP.');
  if (d.skills.some((s) => !s.name.trim())) out.push('Every skill needs a name.');
  if (d.items.some((i) => !i.name.trim())) out.push('Every item needs a name.');
  for (const [rows, label] of [
    [d.skills, 'skills'],
    [d.items, 'items'],
  ] as const) {
    const names = rows.map((r) => r.name.trim().toLowerCase()).filter(Boolean);
    const dup = names.find((n, i) => names.indexOf(n) !== i);
    if (dup) out.push(`Two ${label} share the name "${dup}".`);
  }
  return out;
}

// ---------------------------------------------------------------- page

export function CharacterBuilder() {
  const { campaignId = '' } = useParams();
  const campaign = useQuery({ queryKey: ['campaign', campaignId], queryFn: () => api.campaign(campaignId) });
  const locations = useQuery({ queryKey: ['locations', campaignId], queryFn: () => api.locations(campaignId) });
  const sheet = useQuery({ queryKey: ['sheet', campaignId], queryFn: () => api.sheet(campaignId) });

  const error = campaign.error ?? locations.error ?? sheet.error;
  if (error) {
    return (
      <div className="space-y-4">
        <BackLink />
        <ErrorNote>{error instanceof ApiRequestError && error.status === 404 ? 'That campaign no longer exists.' : error.message}</ErrorNote>
      </div>
    );
  }
  if (!campaign.data || !locations.data || !sheet.data) return <Spinner label="Opening the ledger…" />;

  return (
    <Builder
      key={campaignId}
      campaignId={campaignId}
      campaignName={campaign.data.name}
      currency={campaign.data.currencyName}
      locations={locations.data}
      sheet={sheet.data}
    />
  );
}

function BackLink({ dirty = false }: { dirty?: boolean }) {
  return (
    <Link
      to="/"
      onClick={(e) => {
        if (dirty && !window.confirm('Leave without saving your changes?')) e.preventDefault();
      }}
      className="text-sm text-parchment-faint transition hover:text-parchment"
    >
      ← Campaigns
    </Link>
  );
}

function Builder({
  campaignId,
  campaignName,
  currency,
  locations,
  sheet,
}: {
  campaignId: string;
  campaignName: string;
  currency: string;
  locations: Location[];
  sheet: CharacterSheet;
}) {
  const queryClient = useQueryClient();
  const initial = useMemo(() => draftFrom(sheet, locations), [sheet, locations]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const isNew = sheet.character === null;

  const baseline = useRef(JSON.stringify(toPayload(initial)));
  const dirty = JSON.stringify(toPayload(draft)) !== baseline.current;
  const problems = problemsOf(draft);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = useMutation({
    mutationFn: () => api.saveSheet(campaignId, toPayload(draft)),
    onSuccess: (saved) => {
      const next = draftFrom(saved, locations);
      baseline.current = JSON.stringify(toPayload(next));
      setDraft(next);
      setSavedAt(Date.now());
      queryClient.setQueryData(['sheet', campaignId], saved);
      void queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const setCharacter = (patch: Partial<DraftCharacter>) => setDraft((d) => ({ ...d, character: { ...d.character, ...patch } }));
  const setSkill = (key: string, patch: Partial<DraftSkill>) =>
    setDraft((d) => ({ ...d, skills: d.skills.map((s) => (s.key === key ? { ...s, ...patch } : s)) }));
  const setItem = (key: string, patch: Partial<DraftItem>) =>
    setDraft((d) => ({ ...d, items: d.items.map((i) => (i.key === key ? { ...i, ...patch } : i)) }));

  const c = draft.character;
  const location = locations.find((l) => l.id === c.currentLocationId);
  const header = [
    c.name.trim() || 'Unnamed',
    `Lv ${int(c.level, 1)}${c.archetype.trim() ? ` ${c.archetype.trim()}` : ''}`,
    `HP ${int(c.hp, 0)}/${int(c.maxHp, 0)}`,
    `Loc: ${location?.name ?? 'nowhere yet'}`,
  ].join(' — ');

  return (
    <div className="space-y-6 pb-28">
      <div>
        <BackLink dirty={dirty} />
        <p className="mt-4 text-xs tracking-[0.2em] text-parchment-faint uppercase">{campaignName}</p>
        <h1 className="mt-1 font-display text-2xl tracking-[0.1em] text-parchment sm:text-3xl">
          {isNew && !savedAt ? 'Who are you?' : c.name.trim() || 'Your character'}
        </h1>
        {isNew && !savedAt && (
          <p className="mt-1 font-story text-parchment-dim italic">Write the person you'll play. The world will remember them.</p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        {/* ------------------------------------------------ identity */}
        <Panel title="Identity">
          <div className="space-y-4">
            <div>
              <Label htmlFor="pc-name">Name</Label>
              <Input
                id="pc-name"
                autoFocus={isNew}
                value={c.name}
                maxLength={120}
                placeholder="Kael"
                onChange={(e) => setCharacter({ name: e.target.value })}
                className="font-story text-xl"
              />
            </div>
            <div>
              <Label htmlFor="pc-archetype" hint="rogue, sailor, disgraced noble…">
                Archetype
              </Label>
              <Input
                id="pc-archetype"
                list="archetypes"
                value={c.archetype}
                maxLength={60}
                onChange={(e) => setCharacter({ archetype: e.target.value })}
              />
              <datalist id="archetypes">
                {ARCHETYPES.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
            <div>
              <Label htmlFor="pc-bio" hint="The narrator reads this">
                Background
              </Label>
              <Textarea
                id="pc-bio"
                rows={6}
                value={c.bio}
                placeholder="Where they come from, what they want, what they're running from."
                onChange={(e) => setCharacter({ bio: e.target.value })}
                className="font-story"
              />
            </div>
            <div>
              <Label htmlFor="pc-location">Starting location</Label>
              <Select
                id="pc-location"
                value={c.currentLocationId ?? ''}
                onChange={(e) => setCharacter({ currentLocationId: e.target.value || null })}
              >
                <option value="">Nowhere yet</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </Select>
              {location?.description && (
                <p className="mt-2 font-story text-sm leading-relaxed text-parchment-faint italic">{location.description}</p>
              )}
              {locations.length === 0 && (
                <p className="mt-2 text-sm text-parchment-faint">This world has no locations yet.</p>
              )}
            </div>
          </div>
        </Panel>

        {/* ------------------------------------------------ vitals */}
        <div className="space-y-6">
          <Panel title="Vitals">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pc-level">Level</Label>
                <NumberInput id="pc-level" min={1} max={100} value={c.level} onChange={(level) => setCharacter({ level })} />
              </div>
              <div>
                <Label htmlFor="pc-money" hint={currency}>
                  Money
                </Label>
                <NumberInput id="pc-money" min={0} value={c.money} onChange={(money) => setCharacter({ money })} />
              </div>
              <div>
                <Label htmlFor="pc-hp">HP</Label>
                <NumberInput id="pc-hp" min={0} max={10_000} value={c.hp} onChange={(hp) => setCharacter({ hp })} />
              </div>
              <div>
                <Label htmlFor="pc-maxhp">Max HP</Label>
                <NumberInput
                  id="pc-maxhp"
                  min={1}
                  max={10_000}
                  value={c.maxHp}
                  onChange={(maxHp) =>
                    // Starting at full health is the common case: keep HP in step while it matches.
                    setCharacter(c.hp === c.maxHp ? { maxHp, hp: maxHp } : { maxHp })
                  }
                />
              </div>
            </div>
          </Panel>

          <Panel title="How the narrator sees you">
            <p className="rounded-md border border-ink-700 bg-ink-950/70 px-3 py-2.5 font-mono text-xs leading-relaxed text-parchment-dim">
              {header}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-parchment-faint">
              This one line goes into every turn. Your skills, pack, and purse stay out of the story until they matter, and the
              narrator looks them up when they do.
            </p>
          </Panel>
        </div>
      </div>

      {/* -------------------------------------------------- skills */}
      <Panel
        title="Skills"
        action={
          <Button
            variant="ghost"
            onClick={() =>
              setDraft((d) => ({ ...d, skills: [...d.skills, { key: newKey(), name: '', level: 1, xp: 0, description: '' }] }))
            }
          >
            + Add skill
          </Button>
        }
      >
        {draft.skills.length === 0 ? (
          <p className="font-story text-sm text-parchment-faint italic">
            No skills yet. What are you good at? Picking locks, reading people, sailing in the dark?
          </p>
        ) : (
          <ul className="space-y-3">
            <li className="hidden grid-cols-[1fr_5.5rem_2fr_2.5rem] gap-3 text-xs tracking-wider text-parchment-faint uppercase sm:grid">
              <span>Skill</span>
              <span>Level</span>
              <span>Description</span>
            </li>
            {draft.skills.map((s) => (
              <li key={s.key} className="grid grid-cols-[1fr_5.5rem_2.5rem] gap-3 sm:grid-cols-[1fr_5.5rem_2fr_2.5rem]">
                <Input
                  aria-label="Skill name"
                  value={s.name}
                  maxLength={120}
                  placeholder="Lockpicking"
                  autoFocus={!s.id && !s.name}
                  onChange={(e) => setSkill(s.key, { name: e.target.value })}
                />
                <NumberInput aria-label="Skill level" min={0} max={100} value={s.level} onChange={(level) => setSkill(s.key, { level })} />
                <Input
                  aria-label="Skill description"
                  value={s.description}
                  placeholder="What it covers"
                  onChange={(e) => setSkill(s.key, { description: e.target.value })}
                  className="col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto"
                />
                <RemoveButton label={`Remove ${s.name || 'skill'}`} onClick={() => setDraft((d) => ({ ...d, skills: d.skills.filter((x) => x.key !== s.key) }))} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* -------------------------------------------------- inventory */}
      <Panel
        title="Pack"
        action={
          <Button
            variant="ghost"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                items: [...d.items, { key: newKey(), name: '', description: '', quantity: 1, tagsText: '', equipped: false, properties: {} }],
              }))
            }
          >
            + Add item
          </Button>
        }
      >
        {draft.items.length === 0 ? (
          <p className="font-story text-sm text-parchment-faint italic">Empty pockets. Most people carry at least a knife and a bad decision.</p>
        ) : (
          <ul className="space-y-4">
            {draft.items.map((i) => (
              <li key={i.key} className="rounded-lg border border-ink-700 bg-ink-950/40 p-3">
                <div className="grid grid-cols-[1fr_4.5rem_2.5rem] gap-3 sm:grid-cols-[1.4fr_4.5rem_1fr_auto_2.5rem]">
                  {/* Explicit placement: mobile is [name | qty | x] over [tags | equipped], desktop is one row. */}
                  <Input
                    aria-label="Item name"
                    value={i.name}
                    maxLength={120}
                    placeholder="Oilcloth coat"
                    autoFocus={!i.id && !i.name}
                    onChange={(e) => setItem(i.key, { name: e.target.value })}
                    className="col-start-1 row-start-1"
                  />
                  <NumberInput className="col-start-2 row-start-1" aria-label="Quantity" min={1} max={100_000} value={i.quantity} onChange={(quantity) => setItem(i.key, { quantity })} />
                  <Input
                    aria-label="Tags"
                    value={i.tagsText}
                    placeholder="tags: weapon, tool"
                    onChange={(e) => setItem(i.key, { tagsText: e.target.value })}
                    className="col-start-1 row-start-2 sm:col-start-3 sm:row-start-1"
                  />
                  <label
                    className={cx(
                      'col-span-2 col-start-2 row-start-2 flex cursor-pointer items-center gap-2 rounded-md border px-3 text-sm whitespace-nowrap transition sm:col-span-1 sm:col-start-4 sm:row-start-1',
                      i.equipped ? 'border-brass/60 text-brass' : 'border-ink-600 text-parchment-faint hover:text-parchment',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={i.equipped}
                      onChange={(e) => setItem(i.key, { equipped: e.target.checked })}
                      className="size-3.5 accent-brass"
                    />
                    Equipped
                  </label>
                  <RemoveButton
                    label={`Remove ${i.name || 'item'}`}
                    onClick={() => setDraft((d) => ({ ...d, items: d.items.filter((x) => x.key !== i.key) }))}
                    className="col-start-3 row-start-1 sm:col-start-5"
                  />
                </div>
                <Textarea
                  aria-label="Item description"
                  rows={2}
                  value={i.description}
                  placeholder="What it looks like, what it's for, why you still have it"
                  onChange={(e) => setItem(i.key, { description: e.target.value })}
                  className="mt-3 font-story text-sm"
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* -------------------------------------------------- save bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink-700 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <div className="min-w-0 flex-1 text-sm">
            {save.isError ? (
              <span className="text-ember">{save.error.message}</span>
            ) : problems.length > 0 && (dirty || isNew) ? (
              <span className="text-ember/90">{problems[0]}</span>
            ) : dirty ? (
              <span className="text-parchment-dim">Unsaved changes</span>
            ) : savedAt ? (
              <span className="text-verdigris">Saved.</span>
            ) : (
              <span className="text-parchment-faint">{isNew ? 'Nothing saved yet' : 'All changes saved'}</span>
            )}
          </div>
          {dirty && (
            <Button variant="subtle" onClick={() => setDraft(draftFrom(sheet, locations))} disabled={save.isPending}>
              Discard
            </Button>
          )}
          <Button variant="primary" disabled={!dirty || problems.length > 0 || save.isPending} onClick={() => save.mutate()}>
            {save.isPending ? 'Saving…' : isNew && !savedAt ? 'Create character' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RemoveButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx('grid h-10 w-10 place-items-center rounded-md text-lg text-parchment-faint transition hover:bg-ember/10 hover:text-ember', className)}
    >
      ×
    </button>
  );
}
