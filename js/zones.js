// Field zone maps (`zones` fields): the field as a grid of tiles, seen with the audience side
// at the bottom, the red half on the left and the blue half on the right.
// Stored as a string with one base-36 character per tap: the tile index row * cols + col,
// row 0 = the far side. 'a5' = tiles 10 and 5. `max: 1` keeps a single tile (tap again to clear).
// `edge: true` allows only the tiles along the field wall.

import { h } from './ui.js';

const dims = f => [f.cols || 6, f.rows || 6];

export const cellsOf = v => (typeof v === 'string' ? [...v].map(c => parseInt(c, 36)).filter(n => n >= 0) : []);

// Tile names: columns A.. left (red) to right (blue), rows 1.. counting up from the audience side.
export function cellName(f, i) {
  const [c, r] = dims(f);
  return String.fromCharCode(65 + (i % c)) + (r - Math.floor(i / c));
}

export const zoneText = (f, v) => cellsOf(v).map(i => cellName(f, i)).join(' ');

function onEdge(f, i) {
  const [c, r] = dims(f);
  const x = i % c, y = Math.floor(i / c);
  return x === 0 || y === 0 || x === c - 1 || y === r - 1;
}
const allowed = (f, i) => !f.edge || onEdge(f, i);

// Taps per tile, over one value or several matches' values.
export function zoneCounts(f, values) {
  const [c, r] = dims(f);
  const n = new Array(c * r).fill(0);
  for (const v of values) for (const i of cellsOf(v)) if (i < n.length) n[i]++;
  return n;
}

// The map: each tile shaded by its share of the busiest tile, with its count.
// With onTap the tiles are buttons.
export function zoneGrid(f, n, { onTap, mark } = {}) {
  const [c] = dims(f);
  const top = Math.max(1, ...n);
  const side = i => { const x = i % c; return x < c / 2 - 0.5 ? ' red' : x > c / 2 - 0.5 ? ' blue' : ''; };
  return h('div', { class: 'zone-map' },
    h('div', { class: 'zone-edge' }, h('span', { class: 'zr' }, 'Red'), 'far side', h('span', { class: 'zb' }, 'Blue')),
    h('div', { class: 'zone-grid', style: `grid-template-columns: repeat(${c}, 1fr)` }, n.map((k, i) => {
      const ok = allowed(f, i);
      return h(onTap ? 'button' : 'div', {
        class: 'zone' + side(i) + (k ? ' hot' : '') + (ok ? '' : ' off'),
        style: `--heat: ${k ? (0.35 + 0.65 * k / top).toFixed(2) : 0}`,
        title: cellName(f, i), 'aria-label': cellName(f, i) + (k ? `: ${k}` : ''),
        disabled: onTap && !ok ? true : null,
        onclick: onTap && ok ? () => onTap(i) : null,
      }, h('span', {}, k ? (mark || k) : ''));
    })),
    h('div', { class: 'zone-wall' }, 'Audience side'));
}

// The scout form's field.
export function zoneField(f, d, changed) {
  const box = h('div', {});
  const one = f.max === 1;
  const undo = one ? null : h('button', { class: 'btn small', onclick: () => {
    d[f.id] = (d[f.id] || '').slice(0, -1); changed(); draw();
  } }, 'Undo');
  const tap = i => {
    const ch = i.toString(36);
    if (one) d[f.id] = d[f.id] === ch ? '' : ch;
    else if ((d[f.id] || '').length < (f.max || 30)) d[f.id] = (d[f.id] || '') + ch;
    changed(); draw();
  };
  const draw = () => {
    box.replaceChildren(zoneGrid(f, zoneCounts(f, [d[f.id]]), { onTap: tap, mark: one ? '●' : null }));
    if (undo) undo.disabled = !d[f.id];
  };
  draw();
  return h('div', { class: 'field col' },
    h('div', { class: 'row' }, h('div', { class: 'f-label' }, f.label, f.hint ? h('small', {}, f.hint) : null), undo),
    box);
}
