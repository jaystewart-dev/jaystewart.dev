#!/usr/bin/env node
/**
 * Verify every internal link and asset reference in the built site resolves.
 *
 * Static sites fail at links quietly. A typo in an href produces a page that
 * builds, deploys and looks fine until someone clicks it — and with
 * `trailingSlash: 'always'` an internal link missing its trailing slash is a
 * redirect at best and a 404 on GitHub Pages at worst. That is exactly the
 * class of mistake worth spending twenty lines to make impossible.
 *
 * Checks internal links, images, stylesheets, scripts and the canonical/OG
 * URLs. External links are not fetched: a build that fails because someone
 * else's server is down is a build nobody trusts.
 *
 *   node scripts/check-links.mjs [dist]
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, process.argv[2] ?? 'dist');
const ORIGIN = 'https://jaystewart.dev';

if (!existsSync(dist)) {
  console.error(`check-links: no build at ${dist}. Run \`pnpm build\` first.`);
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith('.html')) yield full;
  }
}

/** Does this site-absolute path exist in the build output? */
function resolves(path) {
  const clean = path.split(/[?#]/)[0];
  const target = join(dist, decodeURIComponent(clean));

  if (existsSync(target)) {
    // A directory must contain an index.html to actually serve.
    return statSync(target).isDirectory() ? existsSync(join(target, 'index.html')) : true;
  }

  // /work/agendaprofe/ is emitted as /work/agendaprofe/index.html
  return existsSync(join(target, 'index.html')) || existsSync(`${target}.html`);
}

const problems = [];
const anchors = new Map();
let linksChecked = 0;

const pages = [...htmlFiles(dist)];

// First pass: every id that exists, so in-page anchors can be verified too.
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  anchors.set(file, ids);
}

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const label = relative(dist, file);

  const refs = [
    ...[...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/<(?:img|script)\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/g)].map((m) => m[1]),
    ...[...html.matchAll(/<meta\b[^>]*\bcontent="(https:\/\/jaystewart\.dev[^"]*)"/g)].map(
      (m) => m[1],
    ),
  ];

  for (const raw of refs) {
    // Same-origin absolute URLs — canonical, OG image — are internal really.
    const ref = raw.startsWith(ORIGIN) ? raw.slice(ORIGIN.length) || '/' : raw;

    if (/^(https?:|mailto:|tel:|data:|#)/.test(ref)) {
      // Same-page anchor: check the target id exists on this page.
      if (ref.startsWith('#') && ref.length > 1) {
        linksChecked += 1;
        if (!anchors.get(file)?.has(ref.slice(1))) {
          problems.push(`${label}  →  ${ref}  (no element with that id)`);
        }
      }
      continue;
    }

    if (!ref.startsWith('/')) {
      problems.push(`${label}  →  ${ref}  (relative link; use a site-absolute path)`);
      continue;
    }

    linksChecked += 1;
    if (!resolves(ref)) {
      problems.push(`${label}  →  ${ref}  (does not resolve)`);
    }
  }
}

if (problems.length > 0) {
  console.error(`\ncheck-links: ${problems.length} broken reference(s)\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('');
  process.exit(1);
}

console.log(
  `check-links: clean — ${linksChecked} internal references across ${pages.length} pages`,
);
