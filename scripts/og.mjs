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

// A .ts import from a build script works because Node strips types natively
// from 22.18 (this repo needs Node 22+, and CI resolves `node-version: '22'`
// to current). Worth it: the About image used to hardcode "Twelve years" while
// the About page it previews computed the real figure two files away — the
// same claim, maintained twice, wrong once. It is a span rather than a
// duration now, for the reasons on `careerStartYear`, and a card has no room
// to name the career break beside a years figure — which is exactly the
// context a duration needs and a start year does not.
import { careerStartYear } from '../src/data/experience.ts';

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
  { slug: 'default', eyebrow: 'Senior backend and full-stack engineer', title: 'Jay Stewart' },
  {
    slug: 'work',
    eyebrow: 'Case studies',
    title: 'Two systems and a practice, written up properly',
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
  {
    slug: 'work-agent-operated-codebase',
    eyebrow: 'Case study · In production',
    title: 'An agent-operated production codebase',
    note: 'The practice, the gates, and where the context layer rotted',
  },
  {
    slug: 'about',
    eyebrow: 'About',
    title: `Backend engineering since ${careerStartYear()}`,
    note: 'From e-commerce for Dyson to production SaaS, either side of a six-year break',
  },
  { slug: 'philosophy', eyebrow: 'Philosophy', title: 'How I think about building things' },
  { slug: 'notes', eyebrow: 'Notes', title: 'Shorter pieces' },
  {
    slug: 'notes-when-building-becomes-free',
    eyebrow: 'Note · Working with agents',
    title: 'When building is free, judgment is the job',
  },
  {
    slug: 'notes-development-environment-is-a-server',
    eyebrow: 'Note · Infrastructure',
    title: 'My development environment is a server',
  },
  {
    slug: 'notes-a-compiler-for-agent-context',
    eyebrow: 'Note · Open source',
    title: 'A compiler for agent context',
  },
  {
    slug: 'contract',
    eyebrow: 'Contract',
    title: 'Available for a three-to-six-month contract',
    note: 'Senior TypeScript, Next.js and Postgres · outside IR35',
  },
  { slug: 'contact', eyebrow: 'Contact', title: 'Let’s talk' },
  { slug: '404', eyebrow: '404', title: 'That page does not exist' },
];

/**
 * Horizontal padding, and why it is not the round 80 it used to be.
 *
 * A 1200x630 image is the OG standard, and most surfaces show all of it. The
 * LinkedIn mobile app does not: its Featured card renders the preview in a box
 * of roughly 1.65:1, and fills it by matching height and cropping the sides.
 * Measured off a real phone screenshot on 2026-08-16 — card image box 676x409,
 * and solving the source-to-screen mapping from known ink positions put the
 * crop at 76-79px per side, or about 13% of the width.
 *
 * The old padding was 80px, which is the crop almost to the pixel. Every image
 * therefore rendered on LinkedIn with its eyebrow, headline and footer flush
 * against the edges and the outermost glyphs shaved — "jaystewart.dev" losing
 * its j, "Shorter pieces" starting hard against the frame.
 *
 * 136px keeps roughly 55px of visible margin after that crop, and simply looks
 * a little more generous everywhere else. `scripts/check-og-safe-area.mjs`
 * asserts every generated image against it, because this is exactly the class
 * of thing that looks fine in an image viewer and is wrong in the only place
 * anyone sees it.
 */
const PAD_X = 136;

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
        padding: `72px ${PAD_X}px`,
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
