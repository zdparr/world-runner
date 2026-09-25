import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// Small shared primitives so every screen uses the same ink-and-brass look.

function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(' ');
}

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtle';

const BUTTON: Record<ButtonVariant, string> = {
  primary: 'bg-brass text-ink-950 hover:bg-brass-bright font-semibold',
  ghost: 'border border-ink-600 text-parchment-dim hover:border-brass/60 hover:text-parchment',
  danger: 'border border-ember/50 text-ember hover:bg-ember/10',
  subtle: 'text-parchment-faint hover:text-parchment',
};

export function Button({
  variant = 'ghost',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40',
        BUTTON[variant],
        className,
      )}
    />
  );
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-xl border border-ink-600/70 bg-ink-900/70 p-5 shadow-xl shadow-black/30 sm:p-6', className)}>
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-sm tracking-[0.18em] text-brass uppercase">{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Label({ htmlFor, children, hint }: { htmlFor?: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-medium tracking-wider text-parchment-faint uppercase">
      <span>{children}</span>
      {hint && <span className="normal-case tracking-normal">{hint}</span>}
    </label>
  );
}

const FIELD =
  'w-full rounded-md border border-ink-600 bg-ink-950/80 px-3 py-2 text-parchment placeholder:text-parchment-faint/70 focus:border-brass focus:outline-none';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(FIELD, className)} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(FIELD, 'resize-y leading-relaxed', className)} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(FIELD, 'appearance-none bg-ink-950', className)} />;
}

/** Integer input that tolerates an empty field while typing and clamps on blur. */
export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 1_000_000,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'min' | 'max' | 'type'> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      {...props}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={Number.isNaN(value) ? '' : value}
      onChange={(e) => onChange(e.target.value === '' ? Number.NaN : Math.trunc(Number(e.target.value)))}
      onBlur={() => onChange(Math.min(max, Math.max(min, Number.isNaN(value) ? min : value)))}
      className={cx(FIELD, 'tabular-nums', className)}
    />
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return <p className="py-16 text-center font-story text-parchment-faint italic">{label}</p>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-md border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">
      {children}
    </p>
  );
}

export { cx };
