import { useState, type FormEvent } from 'react';
import { api } from '../api';

export function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.login({ password });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-ink-600/70 bg-ink-900/80 p-8 shadow-2xl shadow-black/50 backdrop-blur"
      >
        <h1 className="text-center font-display text-3xl tracking-[0.2em] text-brass">NARRATOR</h1>
        <p className="mt-2 text-center font-story text-sm text-parchment-dim italic">
          Speak the word, and the tale resumes.
        </p>

        <label htmlFor="password" className="mt-8 block text-xs font-medium tracking-wider text-parchment-faint uppercase">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-md border border-ink-600 bg-ink-950 px-3 py-2.5 text-parchment placeholder:text-parchment-faint focus:border-brass focus:outline-none"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-ember">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-6 w-full rounded-md bg-brass py-2.5 font-semibold text-ink-950 transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'Opening the book…' : 'Enter'}
        </button>
      </form>
    </main>
  );
}
