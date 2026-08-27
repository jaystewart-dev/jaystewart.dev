// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The canonical origin. Every absolute URL on the site (canonical links, OG
// tags, sitemap entries, JSON-LD @id values) is derived from this one value,
// so a domain change is a one-line change.
export const SITE = 'https://jaystewart.co.uk';

export default defineConfig({
  site: SITE,
  // Directory-style URLs (/work/agendaprofe/) rather than /work/agendaprofe.html.
  // GitHub Pages serves index.html for a directory request, so this is the
  // format that gives clean URLs on a static host with no rewrite layer.
  trailingSlash: 'always',
  build: { format: 'directory' },
  // /working-with-agents/ was a short-form version of the agent-operated case
  // study — the same argument, told twice, competing with itself. The case
  // study is the version that keeps its figures counted, so it is the one that
  // survived. The old URL redirects rather than 404s because it has been linked
  // from outside the site.
  // /audit/ and /audit/sample/ sold the agent-readiness audit. That offer was
  // written for a buyer, and the route since 2026-08-23 is a contract, whose
  // reader is a hiring manager or a contract recruiter — so the pages were
  // selling the wrong thing to the wrong person. Removed 2026-08-25. They
  // redirect rather than 404 for the same reason as the line above: the
  // audit's argument still exists, as the note the tool came out of, and both
  // URLs have been public since launch.
  redirects: {
    '/working-with-agents/': '/work/agent-operated-codebase/',
    '/audit/': '/notes/a-compiler-for-agent-context/',
    '/audit/sample/': '/notes/a-compiler-for-agent-context/',
  },
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  // No prefetch: every route on this site is a handful of kilobytes of HTML,
  // and speculative fetching would spend more bandwidth than it saves.
  prefetch: false,
});
