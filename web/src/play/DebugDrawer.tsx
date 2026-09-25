import { useQuery } from '@tanstack/react-query';
import type { ContextSlice, ToolCallRecord, TurnDebugManifest } from '@narrator/shared';
import { api } from '../api';
import { cx } from '../components/ui';

/** Everything the narrator saw and did on one turn: the proof that selective context works. */
export function DebugDrawer({ campaignId, turn }: { campaignId: string; turn: number }) {
  const debug = useQuery({ queryKey: ['debug', campaignId, turn], queryFn: () => api.turnDebug(campaignId, turn), staleTime: Infinity });

  if (debug.isPending) return <Frame>Loading turn {turn}…</Frame>;
  if (debug.isError) return <Frame>{debug.error.message}</Frame>;

  const d = debug.data;
  const manifest = d.contextManifest as TurnDebugManifest;
  const calls = d.toolCalls as ToolCallRecord[];
  const totalIn = d.inputTokens + d.cacheReadTokens + d.cacheCreationTokens;
  const cachePct = totalIn > 0 ? Math.round((d.cacheReadTokens / totalIn) * 100) : 0;

  return (
    <Frame>
      <dl className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <Stat label="Input" value={d.inputTokens} hint="uncached" />
        <Stat label="Cache read" value={d.cacheReadTokens} tone={d.cacheReadTokens > 0 ? 'text-verdigris' : 'text-parchment-faint'} hint={`${cachePct}% of input`} />
        <Stat label="Cache write" value={d.cacheCreationTokens} />
        <Stat label="Output" value={d.outputTokens} />
        <Stat label="Rounds" value={manifest.rounds?.length ?? 0} />
        <Stat label="Latency" value={`${(d.latencyMs / 1000).toFixed(1)}s`} />
      </dl>
      <p className="mt-1 text-[0.7rem] text-parchment-faint">{d.model}</p>

      <Heading>Always in context</Heading>
      <SliceTable slices={manifest.core} />

      <Heading>Pre-fetched from your message</Heading>
      {manifest.prefetched.length === 0 ? <None>Nothing: no known names were mentioned.</None> : <SliceTable slices={manifest.prefetched} />}

      <Heading>Loaded by the narrator (tools)</Heading>
      {manifest.loadedByTools.length === 0 ? (
        <None>No lookups this turn.</None>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {manifest.loadedByTools.map((l, i) => (
            <li key={i} className="rounded border border-verdigris/40 px-2 py-0.5 font-mono text-[0.7rem] text-verdigris">
              {l.tool}
              {hasArgs(l.input) && <span className="text-parchment-faint">({compact(l.input)})</span>}
            </li>
          ))}
        </ul>
      )}

      <Heading>Left out</Heading>
      <ul className="flex flex-wrap gap-1.5">
        {manifest.notIncluded.map((n) => (
          <li key={n} className="rounded border border-ink-600 px-2 py-0.5 text-[0.7rem] text-parchment-faint">
            {n}
          </li>
        ))}
      </ul>

      <Heading>Tool calls</Heading>
      {calls.length === 0 ? (
        <None>None.</None>
      ) : (
        <ol className="space-y-1.5">
          {calls.map((c, i) => (
            <li key={i}>
              <details className="rounded border border-ink-700 bg-ink-950/60">
                <summary className="flex cursor-pointer items-center gap-2 px-2 py-1.5 font-mono text-[0.72rem]">
                  <span className="text-parchment-faint">r{c.round}</span>
                  <span className={c.ok ? 'text-parchment' : 'text-ember'}>{c.name}</span>
                  {!c.ok && <span className="text-ember">error</span>}
                  <span className="ml-auto text-parchment-faint">{c.ms}ms</span>
                </summary>
                <div className="space-y-2 border-t border-ink-700 p-2">
                  <Json label="input" value={c.input} />
                  <Json label="result" value={parseMaybe(c.result)} />
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-lg border border-ink-700 bg-ink-950/70 p-3 font-ui text-sm text-parchment-dim">{children}</div>;
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h4 className="mt-4 mb-1.5 text-[0.66rem] font-semibold tracking-[0.16em] text-parchment-faint uppercase">{children}</h4>;
}

function None({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-parchment-faint italic">{children}</p>;
}

function Stat({ label, value, hint, tone = 'text-parchment' }: { label: string; value: number | string; hint?: string; tone?: string }) {
  return (
    <div className="rounded border border-ink-700 px-2 py-1.5">
      <dt className="text-[0.62rem] tracking-wider text-parchment-faint uppercase">{label}</dt>
      <dd className={cx('font-mono text-sm tabular-nums', tone)}>{typeof value === 'number' ? value.toLocaleString() : value}</dd>
      {hint && <dd className="text-[0.62rem] text-parchment-faint">{hint}</dd>}
    </div>
  );
}

function SliceTable({ slices }: { slices: ContextSlice[] }) {
  return (
    <table className="w-full text-left text-xs">
      <tbody>
        {slices.map((s, i) => (
          <tr key={i} className="border-t border-ink-800 first:border-0">
            <td className="py-1 pr-2 font-mono text-parchment">{s.slice}</td>
            <td className="py-1 pr-2 text-parchment-dim">{describe(s.detail)}</td>
            <td className="py-1 pr-2 text-parchment-faint">{s.reason}</td>
            <td className="py-1 text-right font-mono text-parchment-faint tabular-nums">~{s.approxTokens}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Json({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <div className="mb-0.5 text-[0.62rem] tracking-wider text-parchment-faint uppercase">{label}</div>
      <pre className="scroll-thin max-h-56 overflow-auto rounded bg-ink-900 p-2 font-mono text-[0.7rem] leading-relaxed whitespace-pre-wrap text-parchment-dim">
        {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function parseMaybe(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function hasArgs(input: unknown) {
  return typeof input === 'object' && input !== null && Object.keys(input).length > 0;
}

function compact(input: unknown) {
  return Object.values(input as Record<string, unknown>)
    .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
    .join(', ');
}

function describe(detail: unknown): string {
  if (detail === undefined || detail === null) return '';
  if (typeof detail === 'string') return detail;
  if (typeof detail === 'object' && 'count' in detail) {
    const { count, turns } = detail as { count: number; turns?: unknown };
    return typeof turns === 'string' && turns !== 'none' ? `${count} messages (turns ${turns})` : `${count} messages`;
  }
  return JSON.stringify(detail);
}
