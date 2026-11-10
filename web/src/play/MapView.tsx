import { useMemo, useState } from 'react';
import { HOURS_PER_DAY, describeHours, describeRoute, distance, type CampaignState, type MapLocation, type MapPoint } from '@narrator/shared';
import { cx } from '../components/ui';

type MapData = CampaignState['map'];

/** One dot on the map, with any places inside it that have no position of their own (listed under its name). */
interface Placed {
  loc: MapLocation;
  x: number;
  y: number;
  depth: number;
  subs: { loc: MapLocation; indent: number }[];
}

interface Layout {
  placed: Placed[];
  width: number;
  height: number;
  /** Pixels per hour of travel, when the map is drawn to scale (some places have positions). */
  scale: number | null;
  /** Far-off places were drawn closer than they really are (directions stay true). */
  compressed: boolean;
  /** Which dot each place is drawn as (itself, or the town it is listed under). */
  nodeOf: Map<string, string>;
}

/** A place's own position, or its nearest positioned parent's (a tavern sits where its town does). */
export function positionOf(map: MapData, id: string): MapPoint | null {
  const byId = new Map(map.locations.map((l) => [l.id, l]));
  const seen = new Set<string>();
  for (let cur = byId.get(id); cur && !seen.has(cur.id); cur = cur.parentLocationId ? byId.get(cur.parentLocationId) : undefined) {
    seen.add(cur.id);
    if (cur.position) return cur.position;
  }
  return null;
}

// ---------------------------------------------------------------- layout

/** Stable pseudo-random number in [0, 1) from a string (so the map looks the same every visit). */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10_000) / 10_000;
}

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

function layout(map: MapData): Layout {
  const locs = map.locations;
  if (locs.length === 0) return { placed: [], width: 0, height: 0, scale: null, compressed: false, nodeOf: new Map() };
  if (locs.some((l) => l.position)) return scaledLayout(map);
  return webLayout(map);
}

/**
 * For worlds with no positions: a small force-directed layout. Places repel each other, while
 * sub-locations are pulled close to their parent and places the character has travelled between are
 * pulled loosely together. Deterministic, and cheap for the few dozen places a campaign has.
 */
function webLayout(map: MapData): Layout {
  const locs = map.locations;
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
  relax(pos, springs, locs.map(() => true), 300, 5_000, 0.01);

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
    subs: [],
  }));
  return { placed, width, height, scale: null, compressed: false, nodeOf: new Map(locs.map((l) => [l.id, l.id])) };
}

/** Springs pull, everything repels, and only `free` points move. */
function relax(
  pos: MapPoint[],
  springs: { a: number; b: number; length: number; strength: number }[],
  free: boolean[],
  steps: number,
  repulsion: number,
  gravity: number,
) {
  const n = pos.length;
  for (let step = 0; step < steps; step++) {
    const cool = 1 - step / steps;
    const force = pos.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = pos[i]!.x - pos[j]!.x;
        const dy = pos[i]!.y - pos[j]!.y;
        const d2 = Math.max(dx * dx + dy * dy, 25);
        const f = repulsion / d2;
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
      if (!free[i]) continue;
      // Gentle pull to the centre keeps unconnected places from drifting off.
      force[i]!.x -= pos[i]!.x * gravity;
      force[i]!.y -= pos[i]!.y * gravity;
      const cap = 12 * cool + 0.5;
      pos[i]!.x += Math.max(-cap, Math.min(cap, force[i]!.x));
      pos[i]!.y += Math.max(-cap, Math.min(cap, force[i]!.y));
    }
  }
}

/** Spacing the scale aims for between a place and its nearest neighbour, in pixels. */
const TARGET_NEIGHBOUR_PX = 80;
const MAX_SPAN_PX = 1200;
/** How far label-avoidance may push a positioned place from where it really is, in pixels. */
const MAX_NUDGE_PX = 26;
/** Beyond this many neighbour-spacings from the middle of the map, distances are compressed. */
const TRUE_SCALE_RADIUS = 3;
const NAME_PX = 6.3;
const SUB_PX = 5.5;
const SUB_LINE = 13;
const dotRadius = (depth: number) => (depth === 0 ? 8 : 6);

/** The space a dot and its labels take up, relative to the dot. */
function box(p: Pick<Placed, 'loc' | 'depth' | 'subs'>) {
  const r = dotRadius(p.depth);
  const name = truncate(p.loc.name, 24).length * NAME_PX;
  const subs = p.subs.map((s) => (truncate(s.loc.name, 26).length + 2) * SUB_PX + s.indent * 8);
  const half = Math.max(name, ...subs, 2 * r) / 2 + 5;
  return { left: -half, right: half, top: -r - 4, bottom: r + 18 + SUB_LINE * p.subs.length };
}

/**
 * North-up layout from real positions (x east, y north, in hours on foot). Places inside a positioned
 * place with no position of their own are listed under it instead of drawn as dots. Close places are
 * to scale; far ones are drawn closer along their true bearing, so the local area stays readable.
 * Places with no position anywhere in their ancestry float near the places they connect to.
 */
function scaledLayout(map: MapData): Layout {
  const locs = map.locations;
  const byId = new Map(locs.map((l) => [l.id, l]));

  // Which dot each place belongs to: its own if it has a position, else its nearest positioned ancestor's.
  const host = (l: MapLocation): MapLocation | null => {
    const seen = new Set<string>();
    for (let cur: MapLocation | undefined = l; cur && !seen.has(cur.id); cur = cur.parentLocationId ? byId.get(cur.parentLocationId) : undefined) {
      seen.add(cur.id);
      if (cur.position) return cur;
    }
    return null;
  };
  const nodeOf = new Map<string, string>();
  for (const l of locs) nodeOf.set(l.id, host(l)?.id ?? l.id);
  const nodes = locs.filter((l) => nodeOf.get(l.id) === l.id);
  const depthOf = (l: MapLocation) => {
    let d = 0;
    const seen = new Set<string>();
    for (let cur = l; cur.parentLocationId && !seen.has(cur.id); d++) {
      seen.add(cur.id);
      const parent = byId.get(cur.parentLocationId);
      if (!parent) break;
      cur = parent;
    }
    return d;
  };
  // Listed under their dot in tree order: a room is indented under the tavern it is in.
  const subsOf = (node: MapLocation) => {
    const out: { loc: MapLocation; indent: number }[] = [];
    const walk = (parentId: string, indent: number) => {
      for (const c of locs.filter((l) => l.parentLocationId === parentId && nodeOf.get(l.id) === node.id && l.id !== node.id)) {
        out.push({ loc: c, indent });
        walk(c.id, indent + 1);
      }
    };
    walk(node.id, 0);
    return out;
  };

  // True positions, then compressed beyond the local radius around the map's middle (medians resist outliers).
  const pts = nodes.filter((l) => l.position).map((l) => l.position!);
  const median = (v: number[]) => [...v].sort((a, b) => a - b)[Math.floor(v.length / 2)]!;
  const focus = { x: median(pts.map((p) => p.x)), y: median(pts.map((p) => p.y)) };
  const nn = pts
    .map((p, i) => Math.min(...pts.filter((_, j) => j !== i).map((q) => distance(p, q))))
    .filter((d) => Number.isFinite(d) && d > 0);
  const spacing = nn.length > 0 ? median(nn) : 1;
  const radius = spacing * TRUE_SCALE_RADIUS;
  let compressed = false;
  const warp = (p: MapPoint): MapPoint => {
    const d = distance(focus, p);
    if (d <= radius) return p;
    if (d > radius * 1.05) compressed = true;
    const k = (radius * (1 + Math.log(d / radius))) / d;
    return { x: focus.x + (p.x - focus.x) * k, y: focus.y + (p.y - focus.y) * k };
  };
  const warped = nodes.map((l) => (l.position ? warp(l.position) : null));
  const wpts = warped.filter((p): p is MapPoint => p !== null);
  const span = Math.max(Math.max(...wpts.map((p) => p.x)) - Math.min(...wpts.map((p) => p.x)), Math.max(...wpts.map((p) => p.y)) - Math.min(...wpts.map((p) => p.y)), 1e-6);
  const scale = Math.min(TARGET_NEIGHBOUR_PX / spacing, MAX_SPAN_PX / span);

  // Screen coordinates: x east, y down (so north is up).
  const anchor = warped.map((p) => (p ? { x: p.x * scale, y: -p.y * scale } : null));
  const centre = { x: focus.x * scale, y: -focus.y * scale };
  const index = new Map(nodes.map((l, i) => [l.id, i]));
  const pos = nodes.map((l, i) => {
    if (anchor[i]) return { ...anchor[i]! };
    const angle = 2 * Math.PI * hash01(l.id);
    return { x: centre.x + Math.cos(angle) * 60, y: centre.y + Math.sin(angle) * 60 };
  });

  // Unplaced dots: pulled to their parent and to places they were travelled to from; everything else repels them.
  const springs: { a: number; b: number; length: number; strength: number }[] = [];
  for (const l of nodes) {
    const p = l.parentLocationId ? index.get(nodeOf.get(l.parentLocationId)!) : undefined;
    if (p !== undefined && p !== index.get(l.id)) springs.push({ a: index.get(l.id)!, b: p, length: 55, strength: 0.08 });
  }
  for (const t of map.travels) {
    const a = index.get(nodeOf.get(t.fromId) ?? '');
    const b = index.get(nodeOf.get(t.toId) ?? '');
    if (a !== undefined && b !== undefined && a !== b) springs.push({ a, b, length: 100, strength: 0.02 });
  }
  const free = nodes.map((_, i) => !anchor[i]);
  if (free.some(Boolean)) relax(pos, springs, free, 200, 3_000, 0);

  // Keep labels apart: push overlapping boxes along their shallower overlap. Positioned places may
  // only drift a little from where they really are.
  const drafts = nodes.map((loc) => ({ loc, depth: depthOf(loc), subs: subsOf(loc) }));
  const boxes = drafts.map(box);
  for (let step = 0; step < 120; step++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        const ox = Math.min(pos[i]!.x + a.right, pos[j]!.x + b.right) - Math.max(pos[i]!.x + a.left, pos[j]!.x + b.left);
        const oy = Math.min(pos[i]!.y + a.bottom, pos[j]!.y + b.bottom) - Math.max(pos[i]!.y + a.top, pos[j]!.y + b.top);
        if (ox <= 0 || oy <= 0) continue;
        moved = true;
        if (ox < oy) {
          const s = (pos[i]!.x <= pos[j]!.x ? -1 : 1) * (ox / 2 + 0.5);
          pos[i]!.x += s;
          pos[j]!.x -= s;
        } else {
          const s = (pos[i]!.y <= pos[j]!.y ? -1 : 1) * (oy / 2 + 0.5);
          pos[i]!.y += s;
          pos[j]!.y -= s;
        }
      }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = anchor[i];
      if (!a) continue;
      const dx = pos[i]!.x - a.x;
      const dy = pos[i]!.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d > MAX_NUDGE_PX) {
        pos[i]!.x = a.x + (dx / d) * MAX_NUDGE_PX;
        pos[i]!.y = a.y + (dy / d) * MAX_NUDGE_PX;
      }
    }
    if (!moved) break;
  }

  // Fit the boxes, leaving room for the compass rose (top right) and the scale bar (bottom left).
  const PAD = 14;
  const PAD_TOP = 50;
  const PAD_BOTTOM = 40;
  const MIN_W = 420;
  const MIN_H = 300;
  const minX = Math.min(...pos.map((p, i) => p.x + boxes[i]!.left));
  const maxX = Math.max(...pos.map((p, i) => p.x + boxes[i]!.right));
  const minY = Math.min(...pos.map((p, i) => p.y + boxes[i]!.top));
  const maxY = Math.max(...pos.map((p, i) => p.y + boxes[i]!.bottom));
  const width = Math.max(maxX - minX + 2 * PAD, MIN_W);
  const height = Math.max(maxY - minY + PAD_TOP + PAD_BOTTOM, MIN_H);
  const offX = (width - (maxX - minX)) / 2 - minX;
  const offY = PAD_TOP + (height - PAD_TOP - PAD_BOTTOM - (maxY - minY)) / 2 - minY;
  const placed = drafts.map((d, i) => ({ ...d, x: pos[i]!.x + offX, y: pos[i]!.y + offY }));
  return { placed, width, height, scale, compressed, nodeOf };
}

/** A round scale-bar length (in hours) that draws at a readable width. */
function scaleBar(scale: number): { px: number; label: string } {
  const steps = [0.5, 1, 2, 4, 8, 16, 24, 40, 80, 160, 320, 800, 1600];
  const hours = steps.find((h) => h * scale >= 60) ?? steps[steps.length - 1]!;
  const label = hours >= HOURS_PER_DAY ? `${hours / HOURS_PER_DAY} day${hours === HOURS_PER_DAY ? '' : 's'} on foot` : `${describeHours(hours)} on foot`;
  return { px: hours * scale, label };
}

/** Size of the window a zoomed map shows around the focused place, in layout pixels. */
const ZOOM_W = 520;
const ZOOM_H = 380;
/** Where off-screen markers sit, inside the window's edge (more at the bottom, which holds the scale bar). */
const EDGE_INSET = 16;
const EDGE_INSET_BOTTOM = 36;

/**
 * Where the ray from the window's centre toward `p` leaves the window (inset), and its unit direction.
 * Used to point at places beyond the edge of a zoomed map.
 */
function edgePoint(vb: { x: number; y: number; w: number; h: number }, p: MapPoint) {
  const cx0 = vb.x + vb.w / 2;
  const cy0 = vb.y + vb.h / 2;
  const dx = p.x - cx0;
  const dy = p.y - cy0;
  const len = Math.hypot(dx, dy) || 1;
  const hx = vb.w / 2 - EDGE_INSET;
  const hy = dy > 0 ? vb.h / 2 - EDGE_INSET_BOTTOM : vb.h / 2 - EDGE_INSET;
  const t = Math.min(Math.abs(dx) > 1e-6 ? hx / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-6 ? hy / Math.abs(dy) : Infinity);
  return { x: cx0 + dx * t, y: cy0 + dy * t, ux: dx / len, uy: dy / len };
}

// ---------------------------------------------------------------- view

export function MapView({
  map,
  currentId,
  selectedId,
  onSelect,
  zoomTo,
  className,
}: {
  map: MapData;
  currentId: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Show only the area around this place (on a to-scale map), with arrows toward places beyond the edge. */
  zoomTo?: string | null;
  className?: string;
}) {
  const { placed, width, height, scale, compressed, nodeOf } = useMemo(() => layout(map), [map]);
  const at = new Map(placed.map((p) => [p.loc.id, p]));
  const currentNode = currentId ? nodeOf.get(currentId) : undefined;

  // The visible window: the whole map, or (zoomed) a window around the focused place, kept inside the map.
  const focus = scale !== null && zoomTo ? at.get(nodeOf.get(zoomTo) ?? '') : undefined;
  const zoomed = focus !== undefined && (width > ZOOM_W * 1.15 || height > ZOOM_H * 1.15);
  const vb = zoomed
    ? {
        x: Math.max(0, Math.min(width - Math.min(ZOOM_W, width), focus.x - ZOOM_W / 2)),
        y: Math.max(0, Math.min(height - Math.min(ZOOM_H, height), focus.y - ZOOM_H / 2)),
        w: Math.min(ZOOM_W, width),
        h: Math.min(ZOOM_H, height),
      }
    : { x: 0, y: 0, w: width, h: height };
  const inView = (p: Placed) => p.x >= vb.x + 4 && p.x <= vb.x + vb.w - 4 && p.y >= vb.y + 4 && p.y <= vb.y + vb.h - 4;
  // Off-screen places, nearest first, so close neighbours win when markers would crowd an edge.
  const beyond = zoomed
    ? placed
        .filter((p) => !inView(p))
        .map((p) => ({ p, d: Math.hypot(p.x - focus.x, p.y - focus.y), e: edgePoint(vb, p) }))
        .sort((a, b) => a.d - b.d)
        .filter((m, i, all) => all.slice(0, i).every((o) => Math.abs(o.e.x - m.e.x) > 70 || Math.abs(o.e.y - m.e.y) > 22))
    : [];

  // Roads the character has actually travelled, between the dots they belong to; busier roads are drawn heavier.
  const roads = new Map<string, { a: Placed; b: Placed; count: number }>();
  for (const t of map.travels) {
    const a = at.get(nodeOf.get(t.fromId) ?? '');
    const b = at.get(nodeOf.get(t.toId) ?? '');
    if (!a || !b || a === b) continue;
    const key = [a.loc.id, b.loc.id].sort().join(':');
    const road = roads.get(key) ?? { a, b, count: 0 };
    road.count += t.count;
    roads.set(key, road);
  }

  const activate = (id: string) => (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onSelect(id);
    }
  };

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={cx('w-full select-none', className)}
      role="img"
      aria-label={zoomed ? 'Map of the places around you' : 'Map of known locations'}
    >
      <defs>
        <pattern id="map-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-ink-700" />
        </pattern>
      </defs>
      <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="url(#map-grid)" opacity="0.6" />

      {scale !== null && (
        <>
          {/* North is up. */}
          <g transform={`translate(${vb.x + vb.w - 30} ${vb.y + 32})`} aria-hidden="true">
            <circle r="15" className="fill-ink-950/70 stroke-ink-600" strokeWidth="1" />
            <path d="M 0 -12 L 4 0 L 0 -2 L -4 0 Z" className="fill-brass" />
            <path d="M 0 12 L 4 0 L 0 2 L -4 0 Z" className="fill-ink-600" />
            <text y="-18" textAnchor="middle" className="fill-parchment-dim font-display text-[10px]">
              N
            </text>
          </g>
          {(() => {
            const bar = scaleBar(scale);
            return (
              <g transform={`translate(${vb.x + 16} ${vb.y + vb.h - 16})`} aria-label={`Scale: ${bar.label}${compressed ? '; distant places are drawn closer than they are' : ''}`}>
                <path d={`M 0 -4 L 0 0 L ${bar.px} 0 L ${bar.px} -4`} fill="none" className="stroke-parchment-faint" strokeWidth="1.5" />
                <text x={bar.px / 2} y="-7" textAnchor="middle" className="fill-parchment-faint text-[10px]">
                  {bar.label}
                </text>
                {compressed && !zoomed && (
                  <text x={bar.px + 10} y="0" className="fill-parchment-faint text-[10px] italic">
                    Distant places are drawn closer than they are
                  </text>
                )}
              </g>
            );
          })()}
        </>
      )}

      {/* Sub-locations without a place of their own on the map hang off their parent. */}
      {placed
        .filter((p) => p.loc.parentLocationId && at.has(nodeOf.get(p.loc.parentLocationId) ?? '') && nodeOf.get(p.loc.parentLocationId) !== p.loc.id)
        .filter((p) => !p.loc.position || scale === null)
        .map((p) => {
          const parent = at.get(nodeOf.get(p.loc.parentLocationId!)!)!;
          return <line key={`p-${p.loc.id}`} x1={parent.x} y1={parent.y} x2={p.x} y2={p.y} className="stroke-ink-600" strokeWidth="1.5" />;
        })}

      {[...roads.values()].map(({ a, b, count }) => (
        <line
          key={`t-${a.loc.id}-${b.loc.id}`}
          x1={a.x}
          y1={a.y}
          x2={b.x}
          y2={b.y}
          className="stroke-brass/60"
          strokeWidth={Math.min(1 + count * 0.5, 3)}
          strokeDasharray="5 4"
        />
      ))}

      {placed.map(({ loc, x, y, depth, subs }) => {
        const here = loc.id === currentNode;
        const selected = loc.id === selectedId;
        const visited = loc.visited || subs.some((s) => s.loc.visited);
        const r = dotRadius(depth);
        return (
          <g key={loc.id} transform={`translate(${x} ${y})`}>
            <g
              onClick={() => onSelect(loc.id)}
              className="cursor-pointer outline-none"
              role="button"
              aria-label={`${loc.name}${loc.id === currentId ? ' (you are here)' : ''}`}
              tabIndex={0}
              onKeyDown={activate(loc.id)}
            >
              {here && <circle r={r + 7} className="animate-pulse fill-brass/15 stroke-brass/50" strokeWidth="1" />}
              {selected && !here && <circle r={r + 5} className="fill-none stroke-parchment-dim" strokeWidth="1" strokeDasharray="2 2" />}
              <circle
                r={r}
                className={cx(here ? 'fill-brass stroke-brass-bright' : visited ? 'fill-ink-700 stroke-parchment-dim' : 'fill-ink-900 stroke-ink-600')}
                strokeWidth="1.5"
                strokeDasharray={visited || here ? undefined : '2 2'}
              />
              <text
                y={r + 14}
                textAnchor="middle"
                className={cx(
                  'font-story text-[12px]',
                  loc.id === currentId ? 'fill-brass-bright' : loc.visited ? 'fill-parchment' : 'fill-parchment-faint',
                  selected && 'underline',
                )}
              >
                {truncate(loc.name, 24)}
              </text>
            </g>
            {/* Places inside this one, listed under its name. */}
            {subs.map((s, k) => (
              <text
                key={s.loc.id}
                y={r + 14 + SUB_LINE * (k + 1)}
                textAnchor="middle"
                onClick={() => onSelect(s.loc.id)}
                onKeyDown={activate(s.loc.id)}
                role="button"
                tabIndex={0}
                aria-label={`${s.loc.name}, in ${loc.name}${s.loc.id === currentId ? ' (you are here)' : ''}`}
                className={cx(
                  'cursor-pointer font-story text-[10.5px] outline-none',
                  s.loc.id === currentId ? 'fill-brass-bright' : s.loc.visited ? 'fill-parchment-dim' : 'fill-parchment-faint',
                  s.loc.id === selectedId && 'underline',
                )}
              >
                {`${'  '.repeat(s.indent)}· ${truncate(s.loc.name, 26)}`}
              </text>
            ))}
          </g>
        );
      })}

      {/* Places beyond the edge of a zoomed map: an arrow pointing their way, with the name. */}
      {beyond.map(({ p, e }) => {
        const angle = (Math.atan2(e.uy, e.ux) * 180) / Math.PI;
        const anchor = e.ux > 0.35 ? 'end' : e.ux < -0.35 ? 'start' : 'middle';
        const lx = e.x - e.ux * 10;
        const ly = e.y - e.uy * 10 + (e.uy > 0.35 ? -2 : e.uy < -0.35 ? 8 : 3);
        return (
          <g
            key={`edge-${p.loc.id}`}
            onClick={() => onSelect(p.loc.id)}
            onKeyDown={activate(p.loc.id)}
            role="button"
            tabIndex={0}
            aria-label={`${p.loc.name}, off the edge of the map`}
            className="cursor-pointer outline-none"
          >
            <path d="M 5 0 L -4 -4 L -4 4 Z" transform={`translate(${e.x} ${e.y}) rotate(${angle})`} className="fill-parchment-faint" />
            <text x={lx} y={ly} textAnchor={anchor} className={cx('font-story text-[10px]', p.loc.id === selectedId ? 'fill-parchment underline' : 'fill-parchment-faint')}>
              {truncate(p.loc.name, 16)}
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
  const at = positionOf(map, loc.id);
  const from = currentId && currentId !== loc.id ? positionOf(map, currentId) : null;
  const currentName = map.locations.find((l) => l.id === currentId)?.name;
  const fromHere = at && from && currentName ? describeRoute(from, at) : null;
  const nearby = at
    ? map.locations
        .filter((l) => l.position && l.id !== loc.id && l.parentLocationId !== loc.id && distance(at, l.position) >= 0.25)
        .map((l) => ({ l, d: distance(at, l.position!) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 4)
    : [];
  return (
    <div className="space-y-2 rounded-lg border border-ink-700 bg-ink-950/40 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="font-story text-base text-parchment">{loc.name}</h4>
        <span className={cx('shrink-0 text-[0.7rem]', loc.id === currentId ? 'text-brass' : 'text-parchment-faint')}>
          {loc.id === currentId ? 'You are here' : loc.visited ? 'Visited' : 'Not yet visited'}
        </span>
      </div>
      {parent && <p className="text-xs text-parchment-faint">Inside {parent.name}</p>}
      {fromHere && fromHere !== 'right here' && (
        <p className="text-xs text-parchment-dim">
          <span className="text-parchment-faint">From {currentName}: </span>
          {fromHere}
        </p>
      )}
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
      {nearby.length > 0 && (
        <p className="text-xs text-parchment-dim">
          <span className="text-parchment-faint">Nearby: </span>
          {nearby.map(({ l }) => `${l.name} (${describeRoute(at!, l.position!)})`).join(', ')}
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
        <MapView map={map} currentId={currentId} selectedId={shown} onSelect={setSelected} zoomTo={currentId} className="max-h-80" />
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
