#!/usr/bin/env node
/**
 * Generate a social preview image for every page, at build time.
 *
 * Why generate rather than hand-design one: a single shared image means every
 * link to the site unfurls identically, so a case study and the contact page
 * look like the same page in a Slack thread. Per-page images cost nothing at
 * runtime — they are PNGs written once during the build — and make a shared
 * link legible.
 *
 * Why satori and resvg rather than a headless browser: no browser to install,
 * no network, deterministic output, and it runs in about a second for the whole
 * site. Fonts are read from scripts/assets as TTF buffers, so rendering does
 * not depend on what happens to be installed on the build machine — a
 * screenshot approach in CI would silently substitute a fallback font and
 * nobody would notice until the image was already public.
 *
 * Runs automatically before `astro build`. Output goes to public/og/.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/og');

const fonts = [
  {
    name: 'Fraunces',
    data: readFileSync(join(root, 'scripts/assets/Fraunces.ttf')),
    weight: 600,
    style: 'normal',
  },
  {
    name: 'Inter',
    data: readFileSync(join(root, 'scripts/assets/Inter.ttf')),
    weight: 400,
    style: 'normal',
  },
];

// Must track src/lib/palette.ts. The OG image is rendered outside the browser,
// so it cannot read the stylesheet's custom properties.
const colour = {
  paper: '#0e1013',
  band: '#1b1e25',
  ink: '#e8e6e0',
  muted: '#a2a7b0',
  accent: '#4ecba5',
  line: '#262a32',
};

/** Every page that needs an image, and the text on it. */
const pages = [
  { slug: 'default', eyebrow: 'Backend and platform engineer', title: 'Jay Stewart' },
  {
    slug: 'work',
    eyebrow: 'Case studies',
    title: 'Two systems, written up properly',
  },
  {
    slug: 'work-agendaprofe',
    eyebrow: 'Case study · In production',
    title: 'AgendaProfe',
    note: 'Scheduling, payments and live video teaching',
  },
  {
    slug: 'work-realtime-transit',
    eyebrow: 'Case study · Running, pre-launch',
    title: 'Live positions for an unmapped bus network',
  },
  { slug: 'about', eyebrow: 'About', title: 'Twelve years of backend engineering' },
  { slug: 'philosophy', eyebrow: 'Philosophy', title: 'How I think about building things' },
  {
    slug: 'working-with-agents',
    eyebrow: 'Working with agents',
    title: 'The generation is the easy half',
  },
  { slug: 'notes', eyebrow: 'Notes', title: 'Shorter pieces' },
  {
    slug: 'notes-development-environment-is-a-server',
    eyebrow: 'Note · Infrastructure',
    title: 'My development environment is a server',
  },
  {
    slug: 'notes-when-cost-is-the-architecture',
    eyebrow: 'Note · Cost engineering',
    title: 'When cost is the architecture',
  },
  {
    slug: 'notes-a-compiler-for-agent-context',
    eyebrow: 'Note · Open source',
    title: 'A compiler for agent context',
  },
  { slug: 'contact', eyebrow: 'Contact', title: 'Let’s talk' },
  { slug: '404', eyebrow: '404', title: 'That page does not exist' },
];

/**
 * The layout, as a plain object tree. satori accepts React elements; this is
 * the same shape without needing JSX in a build script.
 */
function template({ eyebrow, title, note }) {
  const el = (type, props, children) => ({
    type,
    props: { ...props, ...(children ? { children } : {}) },
  });

  return el(
    'div',
    {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: colour.paper,
        padding: '72px 80px',
        fontFamily: 'Inter',
      },
    },
    [
      el(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: colour.accent,
          },
        },
        [
          el('div', {
            style: { width: 34, height: 3, backgroundColor: colour.accent },
          }),
          el('div', {}, eyebrow),
        ],
      ),

      el('div', { style: { display: 'flex', flexDirection: 'column' } }, [
        el(
          'div',
          {
            style: {
              fontFamily: 'Fraunces',
              fontSize: title.length > 40 ? 68 : 86,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              color: colour.ink,
            },
          },
          title,
        ),
        ...(note
          ? [el('div', { style: { marginTop: 22, fontSize: 30, color: colour.muted } }, note)]
          : []),
      ]),

      el(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: `1px solid ${colour.line}`,
            paddingTop: 28,
            fontSize: 26,
            color: colour.muted,
          },
        },
        [el('div', {}, 'jaystewart.dev'), el('div', {}, 'Bristol, UK')],
      ),
    ],
  );
}

mkdirSync(outDir, { recursive: true });

for (const page of pages) {
  const svg = await satori(template(page), { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();

  writeFileSync(join(outDir, `${page.slug}.png`), png);
  console.log(`og  ${page.slug}.png  ${(png.length / 1024).toFixed(0)} KB`);
}

console.log(`\nwrote ${pages.length} images to public/og/`);

/* -------------------------------------------------------------------------- */
/* Icons                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The favicon is a monogram rather than a logo. At 16px a logo is mud; a single
 * letterform in the display face is still recognisable, and it is the same
 * typeface the site is set in, so the tab matches the page.
 */
const iconSvg = (size, radius) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${radius}" fill="${colour.paper}"/>
  <text x="32" y="46" font-family="Fraunces" font-size="44" font-weight="600"
        fill="${colour.accent}" text-anchor="middle">J</text>
</svg>`;

const fontFiles = [join(root, 'scripts/assets/Fraunces.ttf')];
const publicDir = join(root, 'public');

// An SVG favicon so it stays sharp at any size and follows no raster grid,
// plus a PNG for Apple touch icons, which do not accept SVG.
writeFileSync(join(publicDir, 'favicon.svg'), `${iconSvg(64, 12).trim()}\n`);

for (const [name, size, radius] of [
  ['apple-touch-icon.png', 180, 0],
  ['icon-192.png', 192, 36],
  ['icon-512.png', 512, 96],
]) {
  const png = new Resvg(iconSvg(size, radius), {
    fitTo: { mode: 'width', value: size },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Fraunces' },
  })
    .render()
    .asPng();

  writeFileSync(join(publicDir, name), png);
  console.log(`icon ${name}  ${(png.length / 1024).toFixed(0)} KB`);
}
