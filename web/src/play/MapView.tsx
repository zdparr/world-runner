import { useMemo, useState } from 'react';
import type { CampaignState, MapLocation } from '@narrator/shared';
import { cx } from '../components/ui';

type MapData = CampaignState['map'];

interface Placed {
  loc: MapLocation;
  x: number;
  y: number;
  depth: number;
}

// ---------------------------------------------------------------- layout

/** Stable pseudo-random number in [0, 1) from a string (so the map looks the same every visit). */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

/**
 * A small force-directed layout: places repel each other, while sub-locations are pulled close to
 * their parent and places the character has travelled between are pulled loosely together.
 * Deterministic, and cheap for the few dozen places a campaign has.
 */
function layout(map: MapData): { placed: Placed[]; width: number; height: number } {
  const locs = map.locations;
  if (locs.length === 0) return { placed: [], width: 0, height: 0 };
  const index = new Map(locs.map((l, i) => [l.id, i]));
  const depthOf = (l: MapLocation, seen = new Set<string>()): number => {
    if (!l.parentLocationId || seen.has(l.id)) return 0;
    seen.add(l.id);
    const parent = locs[index.get(l.parentLocationId)!];
    return parent ? 1 + depthOf(parent, seen) : 0;
  };

  const n = locs.length;
  const pos = locs.map((l, i) => {
    const angle = (2 * Math.PI * i) / n + hash01(l.id) * 0.6;
    const r = 60 + 40 * hash01(`${l.id}r`) + 10 * n;
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
  const springs: { a: number; b: number; length: number; strength: number }[] = [];
  for (const l of locs) {
    const p = l.parentLocationId ? index.get(l.parentLocationId) : undefined;
    if (p !== undefined) springs.push({ a: index.get(l.id)!, b: p, length: 55, strength: 0.08 });
  }
  for (const t of map.travels) {
    const a = index.get(t.fromId);
    const b = index.get(t.toId);
    if (a !== undefined && b !== undefined) springs.push({ a, b, length: 120, strength: 0.02 });
  }

  for (let step = 0; step < 300; step++) {
    const cool = 1 - step / 300;
    const force = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i]!.x - pos[j]!.x;
        const dy = pos[i]!.y - pos[j]!.y;
        const d2 = Math.max(dx * dx + dy * dy, 25);
        const f = 5_000 / d2;
        const d = Math.sqrt(d2);
        force[i]!.x += (dx / d) * f;
        force[i]!.y += (dy / d) * f;
        force[j]!.x -= (dx / d) * f;
        force[j]!.y -= (dy / d) * f;
      }
    }
    for (const s of springs) {
      const dx = pos[s.b]!.x - pos[s.a]!.x;
      const dy = pos[s.b]!.y - pos[s.a]!.y;
      const d = Math.max(Math.hypot(dx, dy), 1);
      const f = (d - s.length) * s.strength;
      force[s.a]!.x += (dx / d) * f;
      force[s.a]!.y += (dy / d) * f;
      force[s.b]!.x -= (dx / d) * f;
      force[s.b]!.y -= (dy / d) * f;
    }
    for (let i = 0; i < n; i++) {
      // Gentle pull to the centre keeps unconnected places from drifting off.
      force[i]!.x -= pos[i]!.x * 0.01;
      force[i]!.y -= pos[i]!.y * 0.01;
      const cap = 12 * cool + 0.5;
      pos[i]!.x += Math.max(-cap, Math.min(cap, force[i]!.x));
      pos[i]!.y += Math.max(-cap, Math.min(cap, force[i]!.y));
    }
  }

  // A minimum canvas keeps a small world from being blown up to fill the frame; the places are centred in it.
  const PAD_X = 70;
  const PAD_Y = 36;
  const MIN_W = 420;
  const MIN_H = 280;
  const xs = pos.map((p) => p.x);
  const ys = pos.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const spanX = Math.max(...xs) - minX;
  const spanY = Math.max(...ys) - minY;
  const width = Math.max(spanX + 2 * PAD_X, MIN_W);
  const height = Math.max(spanY + 2 * PAD_Y, MIN_H);
  const placed = locs.map((loc, i) => ({
    loc,
    x: pos[i]!.x - minX + (width - spanX) / 2,
    y: pos[i]!.y - minY + (height - spanY) / 2,
    depth: depthOf(loc),
  }));
  return { placed, width, height };
}

// ---------------------------------------------------------------- view

export function MapView({
  map,
  currentId,
  selectedId,
  onSelect,
  className,
}: {
  map: MapData;
  currentId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const { placed, width, height } = useMemo(() => layout(map), [map]);
  const at = new Map(placed.map((p) => [p.loc.id, p]));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cx('w-full select-none', className)}
      role="img"
      aria-label="Map of known locations"
    >
      <defs>
        <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-ink-700" />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#map-grid)" opacity="0.6" />

      {/* Sub-locations hang off their parent. */}
      {placed
        .filter((p) => p.loc.parentLocationId && at.has(p.loc.parentLocationId))
        .map((p) => {
          const parent = at.get(p.loc.parentLocationId!)!;
          return <line key={`p-${p.loc.id}`} x1={parent.x} y1={parent.y} x2={p.x} y2={p.y} className="stroke-ink-600" strokeWidth="1.5" />;
        })}

      {/* Roads the character has actually travelled; busier roads are drawn heavier. */}
      {map.travels.map((t) => {
        const a = at.get(t.fromId);
        const b = at.get(t.toId);
        if (!a || !b) return null;
        return (
          <line
            key={`t-${t.fromId}-${t.toId}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className="stroke-brass/60"
            strokeWidth={Math.min(1 + t.count * 0.5, 3)}
            strokeDasharray="5 4"
          />
        );
      })}

      {placed.map(({ loc, x, y, depth }) => {
        const here = loc.id === currentId;
        const selected = loc.id === selectedId;
        const r = depth === 0 ? 8 : 6;
        return (
          <g
            key={loc.id}
            transform={`translate(${x} ${y})`}
            onClick={() => onSelect(loc.id)}
            className="cursor-pointer outline-none"
            role="button"
            aria-label={`${loc.name}${here ? ' (you are here)' : ''}`}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(loc.id)}
          >
            {here && <circle r={r + 7} className="animate-pulse fill-brass/15 stroke-brass/50" strokeWidth="1" />}
            {selected && !here && <circle r={r + 5} className="fill-none stroke-parchment-dim" strokeWidth="1" strokeDasharray="2 2" />}
            <circle
              r={r}
              className={cx(
                here ? 'fill-brass stroke-brass-bright' : loc.visited ? 'fill-ink-700 stroke-parchment-dim' : 'fill-ink-900 stroke-ink-600',
              )}
              strokeWidth="1.5"
              strokeDasharray={loc.visited || here ? undefined : '2 2'}
            />
            <text
              y={r + 14}
              textAnchor="middle"
              className={cx(
                'font-story text-[12px]',
                here ? 'fill-brass-bright' : loc.visited ? 'fill-parchment' : 'fill-parchment-faint',
                selected && 'underline',
              )}
            >
              {loc.name.length > 24 ? `${loc.name.slice(0, 23)}…` : loc.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MapLegend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.7rem] text-parchment-faint">
      <li className="flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full bg-brass" /> You are here
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full border border-parchment-dim bg-ink-700" /> Visited
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block size-2.5 rounded-full border border-dashed border-ink-600" /> Not yet visited
      </li>
      <li className="flex items-center gap-1.5">
        <span className="inline-block w-4 border-t border-dashed border-brass/70" /> Travelled
      </li>
    </ul>
  );
}

/** Details for one place: description, who you know there, and what it contains. */
export function PlaceDetails({ map, id, currentId }: { map: MapData; id: string; currentId: string | null }) {
  const loc = map.locations.find((l) => l.id === id);
  if (!loc) return null;
  const parent = map.locations.find((l) => l.id === loc.parentLocationId);
  const children = map.locations.filter((l) => l.parentLocationId === loc.id);
  return (
    <div className="space-y-2 rounded-lg border border-ink-700 bg-ink-950/40 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-story text-base text-parchment">{loc.name}</h4>
        <span className={cx('shrink-0 text-[0.7rem]', loc.id === currentId ? 'text-brass' : 'text-parchment-faint')}>
          {loc.id === currentId ? 'You are here' : loc.visited ? 'Visited' : 'Not yet visited'}
        </span>
      </div>
      {parent && <p className="text-xs text-parchment-faint">Inside {parent.name}</p>}
      {loc.description && <p className="font-story text-sm leading-relaxed text-parchment-dim">{loc.description}</p>}
      {loc.knownNpcs.length > 0 && (
        <p className="text-xs text-parchment-dim">
          <span className="text-parchment-faint">People you know here: </span>
          {loc.knownNpcs.join(', ')}
        </p>
      )}
      {children.length > 0 && (
        <p className="text-xs text-parchment-dim">
          <span className="text-parchment-faint">Within: </span>
          {children.map((c) => c.name).join(', ')}
        </p>
      )}
      {loc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {loc.tags.map((t) => (
            <span key={t} className="rounded-full border border-ink-600 px-2 py-0.5 text-[0.65rem] text-parchment-faint">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** The Map tab: the map, a legend, and details for the selected place (the current one by default). */
export function MapTab({ map, currentId }: { map: MapData; currentId: string | null }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const shown = selected ?? currentId ?? map.locations[0]?.id ?? null;

  if (map.locations.length === 0) {
    return <p className="font-story text-sm text-parchment-faint italic">No places are known yet. They will appear here as the story finds them.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border border-ink-700 bg-ink-950/50">
        <MapView map={map} currentId={currentId} selectedId={shown} onSelect={setSelected} className="max-h-80" />
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 rounded border border-ink-600 bg-ink-900/90 px-2 py-0.5 text-[0.7rem] text-parchment-faint transition hover:border-brass/60 hover:text-parchment"
        >
          Expand
        </button>
      </div>
      <MapLegend />
      {shown && <PlaceDetails map={map} id={shown} currentId={currentId} />}

      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-8" onClick={() => setExpanded(false)}>
          <div
            role="dialog"
            aria-label="Map"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-full w-full max-w-5xl flex-col gap-3 overflow-hidden rounded-xl border border-ink-600 bg-ink-900 p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm tracking-[0.16em] text-parchment uppercase">Map</h3>
              <button onClick={() => setExpanded(false)} className="p-1 text-parchment-faint hover:text-parchment" aria-label="Close map">
                ✕
              </button>
            </div>
            <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto md:grid-cols-[1fr_18rem]">
              <div className="rounded-lg border border-ink-700 bg-ink-950/50">
                <MapView map={map} currentId={currentId} selectedId={shown} onSelect={setSelected} className="max-h-[70dvh]" />
              </div>
              <div className="space-y-3">
                <MapLegend />
                {shown && <PlaceDetails map={map} id={shown} currentId={currentId} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
