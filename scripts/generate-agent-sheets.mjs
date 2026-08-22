/**
 * Generate the five Agent Squad sheets without changing Pixel Agents' native
 * animation silhouettes. Each role inherits a proven upstream character's
 * walk, seated typing, reading, back and side poses. We only change pixels
 * already inside that silhouette: clothing, tie, glasses and small accents.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const FRAME_W = 16;
const FRAME_H = 32;
const FRAME_COUNT = 7;
const DIRECTION_COUNT = 3;
const CHAR_DIR = path.resolve('webview-ui/public/assets/characters');

const agents = [
  { file: 'char_6.png', base: 'char_0.png', name: 'Planner', hair: '#33241f', jacket: '#3d4453', shirt: '#b7c8dc', pants: '#30343d', tie: '#79557a', accent: '#f0eee4' },
  { file: 'char_7.png', base: 'char_3.png', name: 'Deep', hair: '#806047', jacket: '#92a184', shirt: '#b7c3a9', pants: '#665d43', tie: '#405e4d', accent: '#d6ded8', glasses: true, shortSleeves: true },
  { file: 'char_8.png', base: 'char_4.png', name: 'Quick', hair: '#68472c', jacket: '#9bc6e7', shirt: '#b9d9ef', pants: '#25272b', tie: '#273e66', accent: '#d8b36a', rolledSleeves: true },
  { file: 'char_9.png', base: 'char_2.png', name: 'Swift', hair: '#24201d', jacket: '#d3a0d5', shirt: '#e3b8e5', pants: '#414249', tie: '#833c57', accent: '#3a4d58' },
  { file: 'char_10.png', base: 'char_5.png', name: 'Final Boss', hair: '#302722', jacket: '#ded5bd', shirt: '#f0e8d2', pants: '#35363c', tie: '#263e70', accent: '#b5413f', glasses: true },
];

function rgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255, 255];
}

function shade(hex, factor) {
  const [r, g, b] = rgb(hex);
  const channel = (value) => Math.max(0, Math.min(255, Math.round(value * factor)));
  return [channel(r), channel(g), channel(b), 255];
}

function pixelIndex(png, x, y) {
  return (y * png.width + x) << 2;
}

function paintOpaque(png, x, y, hex, factor = 1) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const index = pixelIndex(png, x, y);
  if (png.data[index + 3] === 0) return;
  const sourceLight = png.data[index] + png.data[index + 1] + png.data[index + 2];
  if (sourceLight < 28) return; // preserve the original one-pixel outline
  // Carry the upstream pixel's lightness into the new colour. This preserves
  // hand-drawn shadows and highlights instead of flattening clothing to one tone.
  const sourceTone = sourceLight < 150 ? 0.68 : sourceLight < 330 ? 0.84 : sourceLight < 540 ? 1 : 1.12;
  const [r, g, b, a] = shade(hex, sourceTone * factor);
  png.data[index] = r;
  png.data[index + 1] = g;
  png.data[index + 2] = b;
  png.data[index + 3] = a;
}

function paintArea(png, ox, oy, x1, y1, x2, y2, hex) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      paintOpaque(png, ox + x, oy + y, hex);
    }
  }
}

function tintHair(png, agent, ox, oy) {
  for (let y = 0; y <= 12; y++) {
    for (let x = 0; x < FRAME_W; x++) {
      const px = ox + x;
      const py = oy + y;
      const index = pixelIndex(png, px, py);
      if (png.data[index + 3] === 0) continue;
      const r = png.data[index];
      const g = png.data[index + 1];
      const b = png.data[index + 2];
      const light = r + g + b;
      const likelySkin = r > g + 14 && g > b + 8 && light > 360;
      if (!likelySkin) paintOpaque(png, px, py, agent.hair);
    }
  }
}

function addGlasses(png, ox, oy, row) {
  if (row === 1) return;
  const y = oy + 13;
  if (row === 0) {
    for (const x of [5, 6, 9, 10]) paintOpaque(png, ox + x, y, '#20242b');
    paintOpaque(png, ox + 7, y, '#20242b');
    paintOpaque(png, ox + 8, y, '#20242b');
    paintOpaque(png, ox + 6, y, '#d7e5e7', 1.05);
    paintOpaque(png, ox + 9, y, '#d7e5e7', 1.05);
  } else {
    paintOpaque(png, ox + 10, y, '#20242b');
    paintOpaque(png, ox + 11, y, '#20242b');
  }
}

function addRoleDetails(png, agent, ox, oy, row, frame) {
  if (row === 0) {
    // Collar and belt remain readable at native scale.
    paintOpaque(png, ox + 7, oy + 17, agent.shirt, 1.12);
    paintOpaque(png, ox + 9, oy + 17, agent.shirt, 1.12);
    paintOpaque(png, ox + 5, oy + 23, '#20242b');
    paintOpaque(png, ox + 10, oy + 23, '#20242b');
    paintOpaque(png, ox + 8, oy + 23, '#b48a4b', 1.05);

    if (agent.name === 'Planner') {
      paintOpaque(png, ox + 6, oy + 19, '#2c303a');
      paintOpaque(png, ox + 10, oy + 19, '#697080');
      paintOpaque(png, ox + 10, oy + 20, agent.accent, 1.1); // pocket square
    } else if (agent.name === 'Deep') {
      paintOpaque(png, ox + 8, oy + 19, '#8fa46d'); // patterned tie
      paintOpaque(png, ox + 12, oy + 21, '#20242b'); // watch
    } else if (agent.name === 'Quick') {
      paintOpaque(png, ox + 9, oy + 20, agent.tie); // loose, angled tie
      paintOpaque(png, ox + 3, oy + 20, '#e2eef5', 1.08);
      paintOpaque(png, ox + 12, oy + 20, '#e2eef5', 1.08);
    } else if (agent.name === 'Swift') {
      paintOpaque(png, ox + 8, oy + 19, '#bd8d55');
      paintOpaque(png, ox + 8, oy + 21, '#bd8d55');
      paintOpaque(png, ox + 10, oy + 20, '#263742'); // calculator edge
    } else if (agent.name === 'Final Boss') {
      paintOpaque(png, ox + 8, oy + 19, '#7890b8'); // dotted tie
      paintOpaque(png, ox + 10, oy + 20, '#c8b891'); // shirt pocket
    }
  }

  if (frame >= 5) {
    paintOpaque(png, ox + 12, oy + 19, agent.accent, 1.08);
    paintOpaque(png, ox + 13, oy + 20, agent.accent, 0.8);
  }
}

function styleFrame(png, agent, row, frame) {
  const ox = frame * FRAME_W;
  const oy = row * FRAME_H;

  tintHair(png, agent, ox, oy);

  // Native sprites place the torso at y=17..23 in standing and seated frames.
  // We recolour only its center, leaving hands, hair, face and contour untouched.
  if (row === 0) {
    paintArea(png, ox, oy, 4, 17, 11, 23, agent.jacket);
    paintArea(png, ox, oy, 7, 17, 9, 22, agent.shirt);
    for (let y = 18; y <= 21; y++) paintOpaque(png, ox + 8, oy + y, agent.tie);
  } else if (row === 1) {
    paintArea(png, ox, oy, 4, 16, 11, 23, agent.jacket);
  } else {
    paintArea(png, ox, oy, 4, 17, 11, 23, agent.jacket);
    paintArea(png, ox, oy, 7, 17, 9, 21, agent.shirt);
    paintOpaque(png, ox + 9, oy + 19, agent.tie);
    paintOpaque(png, ox + 9, oy + 20, agent.tie);
  }

  // Recolour the upper sleeves as well as the torso. Hands sit lower in the
  // upstream art, so limiting this to y=17..20 preserves their skin pixels.
  paintArea(png, ox, oy, 2, 17, 4, 20, agent.jacket);
  paintArea(png, ox, oy, 11, 17, 13, 20, agent.jacket);

  // Keep the source sheet's shorter seated legs. Only tint existing trouser
  // pixels, so no frame can grow below the upstream animation's alpha bounds.
  paintArea(png, ox, oy, 4, 23, 11, 29, agent.pants);

  if (agent.glasses) addGlasses(png, ox, oy, row);
  if (agent.shortSleeves && row === 0) {
    paintOpaque(png, ox + 3, oy + 20, agent.shirt, 1.05);
    paintOpaque(png, ox + 12, oy + 20, agent.shirt, 1.05);
  }
  if (agent.rolledSleeves && row === 0) {
    paintOpaque(png, ox + 3, oy + 20, '#dcebf5');
    paintOpaque(png, ox + 12, oy + 20, '#dcebf5');
  }
  addRoleDetails(png, agent, ox, oy, row, frame);
}

for (const agent of agents) {
  const source = PNG.sync.read(fs.readFileSync(path.join(CHAR_DIR, agent.base)));
  for (let row = 0; row < DIRECTION_COUNT; row++) {
    for (let frame = 0; frame < FRAME_COUNT; frame++) styleFrame(source, agent, row, frame);
  }
  fs.writeFileSync(path.join(CHAR_DIR, agent.file), PNG.sync.write(source));
}

console.log(`Generated ${agents.length} silhouette-preserving character sheets in ${CHAR_DIR}`);
