import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { Login } from './components/Login';
import { Spinner } from './components/ui';
import { CampaignsPage } from './pages/CampaignsPage';
import { CharacterBuilder } from './pages/CharacterBuilder';

type AuthState = 'checking' | 'in' | 'out';

export function App() {
  const [auth, setAuth] = useState<AuthState>('checking');
  const queryClient = useQueryClient();

  useEffect(() => {
    api
      .me()
      .then((r) => setAuth(r.authenticated ? 'in' : 'out'))
      .catch(() => setAuth('out'));
    const onUnauthorized = () => setAuth('out');
    window.addEventListener('narrator:unauthorized', onUnauthorized);
    return () => window.removeEventListener('narrator:unauthorized', onUnauthorized);
  }, []);

  if (auth === 'checking') return <Spinner label="Lighting the lamps…" />;
  if (auth === 'out') return <Login onSuccess={() => setAuth('in')} />;

  async function logout() {
    await api.logout().catch(() => {});
    queryClient.clear();
    setAuth('out');
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-ink-700/80 bg-ink-950/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-lg tracking-[0.2em] text-brass hover:text-brass-bright">
            NARRATOR
          </Link>
          <button onClick={logout} className="text-sm text-parchment-faint transition hover:text-parchment">
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<CampaignsPage />} />
          <Route path="/campaigns/:campaignId/character" element={<CharacterBuilder />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
