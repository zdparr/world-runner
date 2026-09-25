import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CampaignListItem } from '@narrator/shared';
import { api } from '../api';
import { Button, ErrorNote, Input, Label, Panel, Spinner, cx } from '../components/ui';

const BLANK = 'blank';

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

export function CampaignsPage() {
  const campaigns = useQuery({ queryKey: ['campaigns'], queryFn: api.campaigns });
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl tracking-[0.12em] text-parchment sm:text-3xl">Your Campaigns</h1>
          <p className="mt-1 font-story text-parchment-dim italic">Every world you have begun, waiting where you left it.</p>
        </div>
        {!creating && (
          <Button variant="primary" onClick={() => setCreating(true)}>
            New campaign
          </Button>
        )}
      </div>

      {creating && <NewCampaign onCancel={() => setCreating(false)} />}

      {campaigns.isPending ? (
        <Spinner />
      ) : campaigns.isError ? (
        <ErrorNote>{campaigns.error.message}</ErrorNote>
      ) : campaigns.data.length === 0 ? (
        !creating && (
          <Panel>
            <p className="font-story text-parchment-dim">No campaigns yet. Start one, and build the character you'll play.</p>
          </Panel>
        )
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {campaigns.data.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function NewCampaign({ onCancel }: { onCancel: () => void }) {
  const templates = useQuery({ queryKey: ['templates'], queryFn: api.templates });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [picked, setWorld] = useState<string | null>(null);
  // Until the player picks, default to the first template (or a blank world if there are none).
  const world = picked ?? templates.data?.[0]?.id ?? BLANK;
  const [includeCharacter, setIncludeCharacter] = useState(false);

  const create = useMutation({
    mutationFn: () =>
      world === BLANK
        ? api.createCampaign({ name })
        : api.createFromTemplate({ templateId: world, name, includeCharacter }),
    onSuccess: async (campaign) => {
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      navigate(`/campaigns/${campaign.id}/character`);
    },
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (name.trim()) create.mutate();
  }

  const options = [
    ...(templates.data ?? []).map((t) => ({ id: t.id, name: t.name, description: t.description })),
    { id: BLANK, name: 'Blank world', description: 'An empty world. You write the setting, places, and people yourself.' },
  ];

  return (
    <Panel title="Begin a new tale">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <Label htmlFor="campaign-name">Campaign name</Label>
          <Input
            id="campaign-name"
            autoFocus
            value={name}
            maxLength={120}
            placeholder="The Salt and the Crown"
            onChange={(e) => setName(e.target.value)}
            className="font-story text-lg"
          />
        </div>

        <fieldset>
          <Label>World</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((o) => (
              <label
                key={o.id}
                className={cx(
                  'cursor-pointer rounded-lg border p-4 transition',
                  world === o.id ? 'border-brass/70 bg-brass/5' : 'border-ink-600 hover:border-ink-600/100 hover:bg-ink-800/50',
                )}
              >
                <input type="radio" name="world" value={o.id} checked={world === o.id} onChange={() => setWorld(o.id)} className="sr-only" />
                <span className={cx('font-story text-lg', world === o.id ? 'text-brass-bright' : 'text-parchment')}>{o.name}</span>
                <span className="mt-1 block text-sm leading-relaxed text-parchment-dim">{o.description}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {world !== BLANK && (
          <label className="flex items-start gap-3 text-sm text-parchment-dim">
            <input
              type="checkbox"
              checked={includeCharacter}
              onChange={(e) => setIncludeCharacter(e.target.checked)}
              className="mt-0.5 size-4 accent-brass"
            />
            <span>
              Start with the world's pre-made character instead of building my own.
              <span className="block text-parchment-faint">You can still edit them afterwards.</span>
            </span>
          </label>
        )}

        {create.isError && <ErrorNote>{create.error.message}</ErrorNote>}

        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={!name.trim() || create.isPending}>
            {create.isPending ? 'Writing the first page…' : includeCharacter && world !== BLANK ? 'Create campaign' : 'Create and build character'}
          </Button>
          <Button variant="subtle" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function CampaignCard({ campaign }: { campaign: CampaignListItem }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'view' | 'rename' | 'delete'>('view');
  const [name, setName] = useState(campaign.name);
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['campaigns'] });

  const rename = useMutation({
    mutationFn: () => api.updateCampaign(campaign.id, { name }),
    onSuccess: async () => {
      await refresh();
      setMode('view');
    },
  });
  const remove = useMutation({ mutationFn: () => api.deleteCampaign(campaign.id), onSuccess: refresh });
  const error = rename.error ?? remove.error;

  return (
    <li className="flex flex-col rounded-xl border border-ink-600/70 bg-ink-900/70 p-5 shadow-lg shadow-black/20">
      {mode === 'rename' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) rename.mutate();
          }}
          className="flex gap-2"
        >
          <Input autoFocus value={name} maxLength={120} onChange={(e) => setName(e.target.value)} aria-label="Campaign name" />
          <Button type="submit" variant="primary" disabled={!name.trim() || rename.isPending}>
            Save
          </Button>
          <Button
            variant="subtle"
            onClick={() => {
              setName(campaign.name);
              setMode('view');
            }}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <h2 className="font-story text-xl text-parchment">{campaign.name}</h2>
      )}

      <p className="mt-2 text-sm text-parchment-dim">
        {campaign.characterName ? (
          <>
            Playing as <span className="text-parchment">{campaign.characterName}</span>
          </>
        ) : (
          <span className="text-brass/90 italic">No character yet</span>
        )}
      </p>
      <p className="mt-1 text-xs text-parchment-faint">
        {campaign.turnCount === 0 ? 'Not started' : `${campaign.turnCount} turns`} · updated {relativeTime(campaign.updatedAt)}
      </p>

      {error && (
        <div className="mt-3">
          <ErrorNote>{error.message}</ErrorNote>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
        {mode === 'delete' ? (
          <>
            <span className="text-sm text-ember">Delete this campaign and everything in it?</span>
            <Button variant="danger" disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? 'Deleting…' : 'Delete forever'}
            </Button>
            <Button variant="subtle" onClick={() => setMode('view')}>
              Keep it
            </Button>
          </>
        ) : (
          <>
            {campaign.characterName && (
              <Link
                to={`/campaigns/${campaign.id}/play`}
                className="rounded-md bg-brass px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brass-bright"
              >
                {campaign.turnCount === 0 ? 'Begin' : 'Continue'}
              </Link>
            )}
            <Link
              to={`/campaigns/${campaign.id}/character`}
              className={cx(
                'rounded-md px-3.5 py-2 text-sm transition',
                campaign.characterName
                  ? 'border border-ink-600 text-parchment-dim hover:border-brass/60 hover:text-parchment'
                  : 'bg-brass font-semibold text-ink-950 hover:bg-brass-bright',
              )}
            >
              {campaign.characterName ? 'Character' : 'Build character'}
            </Link>
            <span className="flex-1" />
            {mode === 'view' && (
              <>
                <Button variant="subtle" onClick={() => setMode('rename')}>
                  Rename
                </Button>
                <Button variant="subtle" className="hover:text-ember" onClick={() => setMode('delete')}>
                  Delete
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </li>
  );
}
