import { useEffect, useState } from 'react';
import type { HealthResponse, HelloResponse } from '@narrator/shared';
import { api } from '../api';

// Phase 1 landing page: confirms the session, the API, and the database are all wired up.
export function Hello({ onLogout }: { onLogout: () => void }) {
  const [hello, setHello] = useState<HelloResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.hello().then(setHello, (e: Error) => setError(e.message));
    fetch('/healthz')
      .then((r) => r.json() as Promise<HealthResponse>)
      .then(setHealth, () => setHealth(null));
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <span className="font-display text-lg tracking-[0.2em] text-brass">NARRATOR</span>
        <button onClick={onLogout} className="text-sm text-parchment-faint transition hover:text-parchment">
          Log out
        </button>
      </header>

      <section className="flex flex-1 flex-col justify-center py-16">
        <p className="font-story text-2xl leading-relaxed text-parchment sm:text-3xl">
          {error ? (
            <span className="text-ember">{error}</span>
          ) : (
            (hello?.message ?? <span className="text-parchment-faint italic">…</span>)
          )}
        </p>
        <div className="mt-8 h-px w-24 bg-gradient-to-r from-brass/70 to-transparent" />
        <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-parchment-faint">Server</dt>
          <dd className="text-parchment-dim">{hello ? new Date(hello.serverTime).toLocaleString() : '…'}</dd>
          <dt className="text-parchment-faint">Database</dt>
          <dd className={health?.db === 'up' ? 'text-verdigris' : 'text-ember'}>
            {health ? (health.db === 'up' ? 'Connected' : 'Unreachable') : '…'}
          </dd>
        </dl>
      </section>
    </main>
  );
}
