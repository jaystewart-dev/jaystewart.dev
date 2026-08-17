#!/usr/bin/env node
/**
 * Assert that every generated social image survives the tightest crop a real
 * surface applies to it.
 *
 * Why this exists. A 1200x630 OG image is a standard, and most places show all
 * of it — which makes it easy to design one in an image viewer, see it look
 * correct, and ship something that is wrong everywhere it actually gets seen.
 * The LinkedIn mobile app renders a Featured card's preview in a box of about
 * 1.65:1 and fills it by matching height and cropping the sides. Measured off
 * a phone screenshot on 2026-08-16: a 676x409 card image box, and solving the
 * source-to-screen mapping from known ink positions put the crop at 76-79px
 * per side of a 1200px image — about 13% of the width.
 *
 * The template's padding at the time was 80px. So the crop removed the entire
 * margin: every image rendered with its eyebrow, headline and footer flush to
 * the frame and the outermost glyphs shaved. Nothing in the build noticed,
 * because nothing was looking.
 *
 * This script looks. It decodes each PNG, finds the bounding box of everything
 * that is not the background colour, and fails if any ink falls inside the
 * band LinkedIn throws away, plus a margin.
 *
 * Usage: node scripts/check-og-safe-area.mjs [dir]   (default public/og)
 */

import { Buffer } from 'node:buffer';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

/** Measured LinkedIn mobile Featured crop, per side, on a 1200px-wide image. */
const CROP_PX = 79;
/** Visible margin required inside the crop, so the design does not merely survive. */
const MARGIN_PX = 40;

const SAFE_LEFT = CROP_PX + MARGIN_PX;
const SAFE_RIGHT = 1200 - CROP_PX - MARGIN_PX;

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = process.argv[2] ? resolve(process.argv[2]) : join(root, 'public/og');

/** Minimal PNG reader — enough for the non-interlaced RGB/RGBA resvg writes. */
function decode(buf) {
  let i = 8;
  let width, height, colourType;
  const idat = [];

  while (i < buf.length) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString('ascii', i + 4, i + 8);
    const data = buf.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colourType = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    }
    i += 12 + len;
  }

  const bpp = { 0: 1, 2: 3, 4: 2, 6: 4 }[colourType];
  if (!bpp) throw new Error(`unsupported PNG colour type ${colourType}`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);

  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    const row = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : Buffer.alloc(stride);

    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? row[x - bpp] : 0;
      const b = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      row[x] = value & 0xff;
    }
  }

  return { width, height, bpp, pixels: out, stride };
}

/** Bounding box of every pixel that differs from the top-left background. */
function inkBounds({ width, height, bpp, pixels, stride }) {
  const bg = [pixels[0], pixels[1], pixels[2]];
  let minX = width;
  let maxX = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = y * stride + x * bpp;
      const delta =
        Math.abs(pixels[o] - bg[0]) +
        Math.abs(pixels[o + 1] - bg[1]) +
        Math.abs(pixels[o + 2] - bg[2]);
      if (delta > 30) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  return { minX, maxX };
}

const files = readdirSync(dir).filter((f) => f.endsWith('.png'));
if (files.length === 0) {
  console.error(`No PNGs in ${dir} — run \`pnpm assets\` first.`);
  process.exit(1);
}

const failures = [];

for (const file of files) {
  const image = decode(readFileSync(join(dir, file)));

  if (image.width !== 1200 || image.height !== 630) {
    failures.push(`${file}: ${image.width}x${image.height}, expected 1200x630`);
    continue;
  }

  const { minX, maxX } = inkBounds(image);
  const ok = minX >= SAFE_LEFT && maxX <= SAFE_RIGHT;
  const label = ok ? 'ok  ' : 'FAIL';
  console.log(
    `${label} ${file.padEnd(46)} ink x ${String(minX).padStart(4)}→${String(maxX).padStart(4)}`,
  );

  if (!ok) {
    failures.push(
      `${file}: ink x ${minX}→${maxX} escapes the safe band ${SAFE_LEFT}→${SAFE_RIGHT}. ` +
        `LinkedIn's mobile Featured card crops ${CROP_PX}px from each side, so this is clipped where it matters.`,
    );
  }
}

console.log(
  `\n${files.length} images checked against x ${SAFE_LEFT}→${SAFE_RIGHT} ` +
    `(${CROP_PX}px measured crop + ${MARGIN_PX}px margin).`,
);

if (failures.length > 0) {
  console.error(`\n${failures.length} image(s) outside the safe area:\n`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log('All social images stay inside the crop.');
