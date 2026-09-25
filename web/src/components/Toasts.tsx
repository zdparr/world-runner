import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { cx } from './ui';

export type ToastTone = 'gold' | 'xp' | 'bond' | 'harm' | 'quest' | 'neutral';

interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
}

const ToastContext = createContext<(text: string, tone?: ToastTone) => void>(() => {});

export const useToast = () => useContext(ToastContext);

/** Map a state event type to a toast colour. */
export function toneFor(eventType: string): ToastTone {
  if (eventType === 'money') return 'gold';
  if (['xp', 'level_up', 'skill_xp', 'skill_level', 'skill_check'].includes(eventType)) return 'xp';
  if (eventType === 'relationship') return 'bond';
  if (['hp', 'status', 'item_removed'].includes(eventType)) return 'harm';
  if (eventType.startsWith('mission')) return 'quest';
  return 'neutral';
}

const TONE: Record<ToastTone, string> = {
  gold: 'border-brass/60 text-brass-bright',
  xp: 'border-brass/40 text-parchment',
  bond: 'border-verdigris/60 text-verdigris',
  harm: 'border-ember/60 text-ember',
  quest: 'border-parchment-dim/50 text-parchment',
  neutral: 'border-ink-600 text-parchment-dim',
};

const LIFETIME_MS = 4_500;
const MAX_VISIBLE = 5;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((text: string, tone: ToastTone = 'neutral') => {
    const id = nextId.current++;
    setToasts((all) => [...all, { id, text, tone }].slice(-MAX_VISIBLE));
    window.setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), LIFETIME_MS);
  }, []);

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-16 z-50 flex flex-col items-center gap-2 px-4 sm:top-auto sm:right-6 sm:bottom-6 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              'animate-toast pointer-events-auto rounded-lg border bg-ink-900/95 px-4 py-2 text-sm font-medium shadow-xl shadow-black/40 backdrop-blur',
              TONE[t.tone],
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
