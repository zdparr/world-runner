import { useEffect, useState } from 'react';
import { api } from './api';
import { Login } from './components/Login';
import { Hello } from './components/Hello';

type AuthState = 'checking' | 'in' | 'out';

export function App() {
  const [auth, setAuth] = useState<AuthState>('checking');

  useEffect(() => {
    api
      .me()
      .then((r) => setAuth(r.authenticated ? 'in' : 'out'))
      .catch(() => setAuth('out'));
  }, []);

  if (auth === 'checking') {
    return (
      <div className="grid min-h-dvh place-items-center">
        <span className="font-story text-parchment-faint italic">Lighting the lamps…</span>
      </div>
    );
  }

  if (auth === 'out') return <Login onSuccess={() => setAuth('in')} />;

  return (
    <Hello
      onLogout={async () => {
        await api.logout().catch(() => {});
        setAuth('out');
      }}
    />
  );
}
