// Renders a world's drawn map (web/src/play/mapArt) with its placed locations to an SVG, using the
// app's own TerrainArt, for checking a map by eye. A tool for authoring maps, not part of the app.
//
//   npx tsx scripts/preview-map.tsx <worldId> <out.svg>
//   firefox --headless --screenshot out.png --window-size 1400,1400 file:///abs/path/out.svg
import { writeFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TerrainArt } from '../web/src/play/TerrainArt';
import { findMapArt } from '../web/src/play/mapArt';
import { TEMPLATES as WORLDS } from '../server/src/db/seed/templates';

const [worldId, outFile] = process.argv.slice(2) as [string, string];
const world = WORLDS.find((w) => w.id === worldId);
if (!world) throw new Error(`No world "${worldId}". Known: ${WORLDS.map((w) => w.id).join(', ')}`);
const art = findMapArt(world.mapArt ?? worldId);
if (!art) throw new Error(`No map art "${world.mapArt ?? worldId}" registered in web/src/play/mapArt/index.ts`);

const PX = art.px ?? 8; // MapView's zoom for this map
const places = world.locations.filter((l) => l.map).map((l) => ({ name: l.name, x: l.map!.x, y: l.map!.y }));
const { minX, maxX, minY, maxY } = art.bounds;
const width = (maxX - minX) * PX;
const height = (maxY - minY) * PX;
const project = (p: { x: number; y: number }) => ({ x: (p.x - minX) * PX, y: (maxY - p.y) * PX });

const terrain = renderToStaticMarkup(<TerrainArt art={art} project={project} px={PX} width={width} height={height} />);
const pins = places
  .map((p) => {
    const q = project(p);
    return `<circle cx="${q.x}" cy="${q.y}" r="5" fill="#e8c26a" stroke="#000" stroke-width="1.5"/><text x="${q.x + 8}" y="${q.y + 4}" font-family="sans-serif" font-size="13" fill="#f3e9d2" stroke="#000" stroke-width="3" paint-order="stroke">${p.name.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
  })
  .join('\n');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#0f1b20;font-family:Georgia,serif">${terrain}${pins}</svg>`;
writeFileSync(outFile, svg);
console.log(`${outFile}: ${width}x${height}px, ${places.length} placed places, ${world.locations.length - places.length} unplaced (inside a parent or not yet placed)`);
