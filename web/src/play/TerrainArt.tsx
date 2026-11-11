import { memo, useId, useMemo } from 'react';
import type { MapPoint } from '@narrator/shared';
import type { MapArt, Pt } from './mapArt';

// Colours for the drawn map, tuned to the ink-and-candlelight palette.
const SEA = '#0f1b20';
const SHALLOWS = '#183239';
const LAND = '#29231a';
const COAST = '#8a7d66';
const RIVER = '#3f6f7a';
const BORDER = '#b5a88f';
const MOUNTAIN_LIT = '#4a4031';
const MOUNTAIN_SHADE = '#2f281e';
const MOUNTAIN_EDGE = '#8a7d66';
const SNOW = '#d9cfbb';
const HILL = '#6b5f4b';
const TREE = '#34442f';
const TREE_EDGE = '#202b1c';
const MARSH = '#4f7466';

/** Stable pseudo-random number in [0, 1) from a string, so the map is drawn the same every time. */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

/** Natural-looking edges: each pass bends every segment's midpoint a little to one side. */
function roughen(pts: Pt[], closed: boolean, seed: string, amp: number, passes = 3): Pt[] {
  let cur = pts;
  for (let pass = 0; pass < passes; pass++) {
    const out: Pt[] = [];
    const n = cur.length;
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const a = cur[i]!;
      const b = cur[(i + 1) % n]!;
      out.push(a);
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy);
      if (len < 1.2) continue;
      const d = Math.min(1.6, len * amp) * (hash01(`${seed}:${pass}:${i}`) * 2 - 1);
      out.push([(a[0] + b[0]) / 2 - (dy / len) * d, (a[1] + b[1]) / 2 + (dx / len) * d]);
    }
    if (!closed) out.push(cur[n - 1]!);
    cur = out;
  }
  return cur;
}

/** A smooth curve through the points (Catmull-Rom as cubic Béziers), in layout pixels. */
function smoothPath(pts: MapPoint[], closed: boolean): string {
  const n = pts.length;
  if (n < 2) return '';
  const at = (i: number) => (closed ? pts[((i % n) + n) % n]! : pts[Math.max(0, Math.min(n - 1, i))]!);
  const f = (v: number) => v.toFixed(1);
  let d = `M ${f(pts[0]!.x)} ${f(pts[0]!.y)}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return closed ? `${d} Z` : d;
}

const polygonPath = (pts: MapPoint[]) => `M ${pts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')} Z`;

function inside(p: Pt, poly: Pt[]): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Points scattered through an area on a jittered grid (`step` hours apart). */
function scatter(area: Pt[], step: number, seed: string): { p: Pt; r: number }[] {
  const xs = area.map((p) => p[0]);
  const ys = area.map((p) => p[1]);
  const out: { p: Pt; r: number }[] = [];
  for (let x = Math.min(...xs); x <= Math.max(...xs); x += step) {
    for (let y = Math.min(...ys); y <= Math.max(...ys); y += step) {
      const key = `${seed}:${x.toFixed(1)}:${y.toFixed(1)}`;
      const p: Pt = [x + (hash01(`${key}x`) - 0.5) * step * 0.9, y + (hash01(`${key}y`) - 0.5) * step * 0.9];
      if (inside(p, area)) out.push({ p, r: hash01(`${key}r`) });
    }
  }
  return out;
}

/** Peaks along a mountain chain, every `step` hours, in a ragged double row. */
function alongRange(line: Pt[], step: number, seed: string): { p: Pt; r: number }[] {
  const out: { p: Pt; r: number }[] = [];
  let k = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i]!;
    const [bx, by] = line[i + 1]!;
    const len = Math.hypot(bx - ax, by - ay);
    const nx = -(by - ay) / len;
    const ny = (bx - ax) / len;
    for (let t = 0; t < len; t += step, k++) {
      const side = (k % 2 === 0 ? 1 : -1) * (1.1 + hash01(`${seed}${k}s`) * 1.3);
      const along = t / len;
      out.push({
        p: [ax + (bx - ax) * along + nx * side, ay + (by - ay) * along + ny * side],
        r: hash01(`${seed}${k}r`),
      });
    }
  }
  return out;
}

interface Glyph {
  kind: 'mountain' | 'peak' | 'hill' | 'broadleaf' | 'pine' | 'marsh';
  x: number;
  y: number;
  r: number;
}

function GlyphShape({ g, px }: { g: Glyph; px: number }) {
  const t = `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`;
  switch (g.kind) {
    case 'mountain':
    case 'peak': {
      const big = g.kind === 'peak';
      const w = px * (big ? 2.6 : 1.3 + g.r * 0.6);
      const h = w * (big ? 1.25 : 0.95 + g.r * 0.25);
      const top = -w * 0.12;
      return (
        <g transform={t}>
          <path d={`M ${-w} 0 L ${top} ${-h} L ${w * 0.15} 0 Z`} fill={MOUNTAIN_LIT} />
          <path d={`M ${w * 0.15} 0 L ${top} ${-h} L ${w} 0 Z`} fill={MOUNTAIN_SHADE} />
          {big && <path d={`M ${top - w * 0.3} ${-h * 0.7} L ${top} ${-h} L ${top + w * 0.28} ${-h * 0.7} L ${top} ${-h * 0.78} Z`} fill={SNOW} />}
          <path d={`M ${-w} 0 L ${top} ${-h} L ${w} 0`} fill="none" stroke={MOUNTAIN_EDGE} strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        </g>
      );
    }
    case 'hill': {
      const w = px * (1 + g.r * 0.5);
      return (
        <path
          transform={t}
          d={`M ${-w} 0 Q 0 ${-w * 1.1} ${w} 0 M ${-w * 0.35} ${-w * 0.25} Q ${w * 0.1} ${-w * 0.65} ${w * 0.45} ${-w * 0.3}`}
          fill="none"
          stroke={HILL}
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      );
    }
    case 'broadleaf': {
      const s = px * (0.55 + g.r * 0.25);
      return (
        <g transform={t}>
          <line x1="0" y1="0" x2="0" y2={-s * 0.9} stroke={TREE_EDGE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cy={-s * 1.3} r={s * 0.75} fill={TREE} stroke={TREE_EDGE} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </g>
      );
    }
    case 'pine': {
      const s = px * (0.5 + g.r * 0.25);
      return <path transform={t} d={`M 0 ${-s * 2.4} L ${s * 0.75} 0 L ${-s * 0.75} 0 Z`} fill={TREE} stroke={TREE_EDGE} strokeWidth="1" vectorEffect="non-scaling-stroke" />;
    }
    case 'marsh': {
      const s = px * 0.5;
      return (
        <path
          transform={t}
          d={`M ${-s} 0 L ${s} 0 M ${-s * 0.5} 0 L ${-s * 0.7} ${-s * 0.9} M 0 0 L 0 ${-s * 1.2} M ${s * 0.5} 0 L ${s * 0.7} ${-s * 0.9}`}
          fill="none"
          stroke={MARSH}
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
        />
      );
    }
  }
}

/**
 * The drawn land under a to-scale map: sea, coasts, realms and their frontiers, rivers, mountains,
 * hills, forests, marshes, and the names of realms and seas. `project` turns world hours into layout pixels.
 */
export const TerrainArt = memo(function TerrainArt({
  art,
  project,
  px,
  width,
  height,
}: {
  art: MapArt;
  project: (p: MapPoint) => MapPoint;
  /** Layout pixels per hour of travel. */
  px: number;
  width: number;
  height: number;
}) {
  const uid = useId().replace(/:/g, '');
  const drawn = useMemo(() => {
    const P = (p: Pt) => project({ x: p[0], y: p[1] });
    const land = art.land.map((poly, i) => smoothPath(roughen(poly, true, `land${i}`, 0.1).map(P), true));
    const rivers = art.rivers.map((line, i) => smoothPath(roughen(line, false, `river${i}`, 0.12, 2).map(P), false));
    const borders = art.borders.map((line, i) => smoothPath(roughen(line, false, `border${i}`, 0.08, 2).map(P), false));
    const realms = art.realms.map((r) => ({ ...r, d: polygonPath(r.area.map(P)) }));

    const glyphs: Glyph[] = [];
    const add = (kind: Glyph['kind'], items: { p: Pt; r: number }[]) => {
      for (const { p, r } of items) {
        const q = P(p);
        glyphs.push({ kind, x: q.x, y: q.y, r });
      }
    };
    art.hills.forEach((area, i) => add('hill', scatter(area, 3.2, `hill${i}`)));
    art.marshes.forEach((area, i) => add('marsh', scatter(area, 2.2, `marsh${i}`)));
    art.forests.forEach((f, i) => add(f.kind, scatter(f.area, 2.1, `forest${i}`)));
    art.ranges.forEach((line, i) => add('mountain', alongRange(line, 2.6, `range${i}`)));
    add('peak', art.peaks.map((p) => ({ p, r: 1 })));
    // Draw from the top of the map down, so nearer (southern) shapes overlap the ones behind them.
    glyphs.sort((a, b) => a.y - b.y);
    return { land, rivers, borders, realms, glyphs, labels: art.labels.map((l) => ({ ...l, ...P(l.at) })) };
  }, [art, project]);

  const clip = `land-${uid}`;
  return (
    <g aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          {drawn.land.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </clipPath>
      </defs>
      <rect x={-width} y={-height} width={width * 3} height={height * 3} fill={SEA} />
      {/* Shallow water hugging every shore. */}
      {drawn.land.map((d, i) => (
        <path key={`s${i}`} d={d} fill="none" stroke={SHALLOWS} strokeWidth={px * 3.2} strokeLinejoin="round" opacity="0.55" />
      ))}
      {drawn.land.map((d, i) => (
        <path key={`s2${i}`} d={d} fill="none" stroke={SHALLOWS} strokeWidth={px * 1.4} strokeLinejoin="round" opacity="0.8" />
      ))}
      {drawn.land.map((d, i) => (
        <path key={`l${i}`} d={d} fill={LAND} />
      ))}

      <g clipPath={`url(#${clip})`}>
        {drawn.realms.map((r) => (
          <path
            key={r.name}
            d={r.d}
            fill={r.color}
            fillOpacity={r.outline ? 0.16 : 0.07}
            stroke={r.outline ? r.color : 'none'}
            strokeOpacity="0.6"
            strokeDasharray={r.outline ? '2 3' : undefined}
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {drawn.borders.map((d, i) => (
          <path key={`b${i}`} d={d} fill="none" stroke={BORDER} strokeOpacity="0.4" strokeWidth="1.6" strokeDasharray="7 5" vectorEffect="non-scaling-stroke" />
        ))}
      </g>

      {drawn.land.map((d, i) => (
        <path key={`c${i}`} d={d} fill="none" stroke={COAST} strokeWidth="1.3" strokeOpacity="0.85" vectorEffect="non-scaling-stroke" />
      ))}
      {drawn.rivers.map((d, i) => (
        <path key={`r${i}`} d={d} fill="none" stroke={RIVER} strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      ))}

      <g clipPath={`url(#${clip})`}>
        {drawn.glyphs.map((g, i) => (
          <GlyphShape key={i} g={g} px={px} />
        ))}
      </g>

      {drawn.labels.map((l) => {
        const realm = l.kind === 'realm';
        const size = px * (realm ? 3.6 : l.kind === 'sea' ? 2.6 : 1.4);
        return (
          <text
            key={l.text}
            x={l.x}
            y={l.y}
            transform={l.rotate ? `rotate(${l.rotate} ${l.x} ${l.y})` : undefined}
            textAnchor="middle"
            fontSize={size}
            letterSpacing={realm ? size * 0.35 : size * 0.08}
            className={realm ? 'font-display' : 'font-story italic'}
            fill={realm ? '#e9dfcb' : l.kind === 'feature' ? '#b5a88f' : '#7fa3ad'}
            fillOpacity={realm ? 0.22 : 0.55}
          >
            {l.text}
          </text>
        );
      })}
    </g>
  );
});
