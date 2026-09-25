import { Suspense, lazy, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { Login } from './components/Login';
import { ToastProvider } from './components/Toasts';
import { Spinner, cx } from './components/ui';
import { CampaignsPage } from './pages/CampaignsPage';
import { CharacterBuilder } from './pages/CharacterBuilder';
// The play screen carries the markdown renderer; load it only when needed.
const PlayPage = lazy(() => import('./pages/PlayPage').then((m) => ({ default: m.PlayPage })));

type AuthState = 'checking' | 'in' | 'out';

export function App() {
  const [auth, setAuth] = useState<AuthState>('checking');
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  // The play screen fills the viewport and scrolls its own panes.
  const fullBleed = /^\/campaigns\/[^/]+\/play$/.test(pathname);

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
    <ToastProvider>
      <div className={cx('flex flex-col', fullBleed ? 'h-dvh' : 'min-h-dvh')}>
        <header className="shrink-0 border-b border-ink-700/80 bg-ink-950/60 backdrop-blur">
          <div className={cx('mx-auto flex items-center justify-between px-4 sm:px-6', fullBleed ? 'py-2' : 'max-w-5xl py-3')}>
            <Link to="/" className="font-display text-lg tracking-[0.2em] text-brass hover:text-brass-bright">
              NARRATOR
            </Link>
            <button onClick={logout} className="text-sm text-parchment-faint transition hover:text-parchment">
              Log out
            </button>
          </div>
        </header>
        <main className={cx('w-full flex-1', fullBleed ? 'min-h-0' : 'mx-auto max-w-5xl px-4 py-8 sm:px-6')}>
          <Routes>
            <Route path="/" element={<CampaignsPage />} />
            <Route path="/campaigns/:campaignId/character" element={<CharacterBuilder />} />
            <Route
              path="/campaigns/:campaignId/play"
              element={
                <Suspense fallback={<Spinner label="Opening the book…" />}>
                  <PlayPage />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}
