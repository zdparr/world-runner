import { useEffect, useState } from 'react';
import { skillTier, type CampaignState } from '@narrator/shared';
import { Button, Input, Label, Textarea, cx } from '../components/ui';
import { TIME_SKIP_PREFIX } from './Story';

const DURATIONS = ['An afternoon', '1 day', '3 days', '1 week', '2 weeks', '1 month', '2 months'] as const;
const MAX_FOCUS = 3;

/** The player's request, as the message the narrator receives (the narrator prompt knows the format). */
export function timeSkipMessage(opts: { duration: string; focus: string[]; teacher: string; notes: string }): string {
  const parts = [`${TIME_SKIP_PREFIX}: ${opts.duration.toLowerCase()}.`];
  if (opts.focus.length > 0) {
    const [main, ...side] = opts.focus;
    const skills = [`${main} (main focus)`, ...side.map((s) => `${s} (on the side)`)].join(', ');
    parts.push(`Training: ${skills}${opts.teacher.trim() ? `, with ${opts.teacher.trim()}` : ''}.`);
  }
  if (opts.notes.trim()) parts.push(`Also: ${opts.notes.trim()}`);
  return parts.join(' ');
}

/**
 * Skip ahead through mundane time: pick a span, what to train, and anything else the character does.
 * The narrator runs the montage (pass_time works out the gains) and picks the story back up.
 */
export function TimeSkipDialog({ open, skills, onClose, onSubmit }: { open: boolean; skills: CampaignState['skills']; onClose: () => void; onSubmit: (text: string) => void }) {
  const [duration, setDuration] = useState<string>('1 week');
  const [focus, setFocus] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [teacher, setTeacher] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (name: string) =>
    setFocus((f) => (f.includes(name) ? f.filter((n) => n !== name) : f.length >= MAX_FOCUS ? f : [...f, name]));
  const addNew = () => {
    const name = newSkill.trim().replace(/\b\w/g, (c) => c.toUpperCase());
    if (!name || focus.some((f) => f.toLowerCase() === name.toLowerCase()) || focus.length >= MAX_FOCUS) return;
    setFocus((f) => [...f, name]);
    setNewSkill('');
  };
  const known = new Set(skills.map((s) => s.name.toLowerCase()));
  const extra = focus.filter((f) => !known.has(f.toLowerCase()));
  const message = timeSkipMessage({ duration, focus, teacher, notes });
  const submit = () => {
    onSubmit(message);
    setFocus([]);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-label="Time skip"
        className="scroll-thin relative max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-ink-600 bg-ink-900 p-5 shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-sm tracking-[0.18em] text-sky-300 uppercase">⏩ Time skip</h2>
            <p className="mt-1 text-sm text-parchment-dim">Pass quiet time training or working. The narrator plays out the montage, then picks the story back up.</p>
          </div>
          <button onClick={onClose} className="p-1 text-parchment-faint hover:text-parchment" aria-label="Close">
            ✕
          </button>
        </div>

        <Label>How long</Label>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              aria-pressed={duration === d}
              className={cx(
                'rounded-full border px-3 py-1 text-sm transition',
                duration === d ? 'border-sky-400/70 bg-sky-400/10 text-sky-200' : 'border-ink-600 text-parchment-dim hover:border-sky-400/40',
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <Label hint={`up to ${MAX_FOCUS}; the first is the main focus`}>Train</Label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {[...skills.map((s) => ({ name: s.name, level: s.level as number | null })), ...extra.map((name) => ({ name, level: null }))].map((s) => {
            const at = focus.indexOf(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => toggle(s.name)}
                aria-pressed={at >= 0}
                className={cx(
                  'rounded-md border px-2.5 py-1 text-left text-sm transition',
                  at === 0 ? 'border-brass bg-brass/15 text-brass-bright' : at > 0 ? 'border-brass/50 bg-brass/5 text-parchment' : 'border-ink-600 text-parchment-dim hover:border-brass/40',
                )}
              >
                {s.name}
                <span className="ml-1.5 text-[0.7rem] text-parchment-faint">
                  {s.level === null ? 'new' : `${s.level} · ${skillTier(s.level)}`}
                  {at === 0 ? ' · main' : at > 0 ? ' · side' : ''}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mb-4 flex gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addNew();
              }
            }}
            placeholder="Learn something new…"
            aria-label="New skill to learn"
            className="py-1.5 text-sm"
          />
          <Button onClick={addNew} disabled={!newSkill.trim() || focus.length >= MAX_FOCUS}>
            Add
          </Button>
        </div>

        <Label htmlFor="skip-teacher" hint="speeds training up; past level 10 you need one">
          Teacher
        </Label>
        <Input
          id="skip-teacher"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          placeholder="Optional: someone in the story who can teach you"
          className="mb-4 text-sm"
        />

        <Label htmlFor="skip-notes">Anything else</Label>
        <Textarea
          id="skip-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Work nights at the tavern, keep a low profile, look into the rumors about the mill…"
          className="mb-4 text-sm"
        />

        <p className="mb-4 rounded-md border border-ink-700 bg-ink-950/50 px-3 py-2 font-story text-sm text-parchment-dim italic">{message}</p>

        <div className="flex justify-end gap-2">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            Skip ahead
          </Button>
        </div>
      </div>
    </div>
  );
}
