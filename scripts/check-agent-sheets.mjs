import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const CHAR_DIR = path.resolve('webview-ui/public/assets/characters');
const pairs = [
  ['char_6.png', 'char_0.png'],
  ['char_7.png', 'char_3.png'],
  ['char_8.png', 'char_4.png'],
  ['char_9.png', 'char_2.png'],
  ['char_10.png', 'char_5.png'],
];

function alphaMask(png) {
  const mask = [];
  for (let i = 3; i < png.data.length; i += 4) mask.push(png.data[i] > 0 ? 1 : 0);
  return mask;
}

function frameBottom(png, row, frame) {
  let bottom = -1;
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 16; x++) {
      const px = frame * 16 + x;
      const py = row * 32 + y;
      if (png.data[(py * png.width + px) * 4 + 3] > 0) bottom = y;
    }
  }
  return bottom;
}

for (const [customName, baseName] of pairs) {
  const custom = PNG.sync.read(fs.readFileSync(path.join(CHAR_DIR, customName)));
  const base = PNG.sync.read(fs.readFileSync(path.join(CHAR_DIR, baseName)));
  assert.equal(custom.width, 112, `${customName}: expected 112px sheet width`);
  assert.equal(custom.height, 96, `${customName}: expected 96px sheet height`);
  assert.deepEqual(alphaMask(custom), alphaMask(base), `${customName}: silhouette changed`);
  for (const row of [0, 1, 2]) {
    for (const frame of [3, 4]) {
      assert.equal(
        frameBottom(custom, row, frame),
        frameBottom(base, row, frame),
        `${customName}: seated frame ${row}/${frame} grew`,
      );
    }
  }
}

console.log('Verified 5 sheets: dimensions, silhouettes and seated-frame bounds match upstream.');
