# jaystewart.dev

Source for [jaystewart.dev](https://jaystewart.dev) — engineering case studies
and notes.

The site is deliberately small: static HTML, no client-side framework, and
about a kilobyte of inline JavaScript for the theme toggle. Everything below
explains why it is built the way it is, because the repository is public and is
therefore part of the portfolio.

## Stack

| Layer       | Choice                    | Why                                                                                                                        |
| ----------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Framework   | Astro 7                   | Real HTML per route. The previous site was a client-rendered SPA that served crawlers an empty div.                        |
| Content     | MDX + content collections | Long-form case studies with embedded diagram components, validated by a schema at build time.                              |
| Styling     | Tailwind CSS 4            | CSS-first config. One set of semantic colour tokens whose values swap by theme, so no component carries a `dark:` variant. |
| Type-safety | TypeScript strict         | Including `.astro` frontmatter.                                                                                            |
| Hosting     | GitHub Pages              | Static output, deployed by GitHub Actions.                                                                                 |

No UI library, no icon package, no analytics, no client router.

## Architecture

```
src/
  content/          case studies and notes as MDX, schema-validated
  data/             site identity, experience, generated metrics
  components/       presentational Astro components, no client JS
    diagrams/       CSS architecture diagrams — real text, not images
  layouts/          Base (meta, JSON-LD), CaseStudy
  lib/              contrast maths, palette, metric resolution
  pages/            routes; [...slug] for collections
  styles/global.css design system: palette, base, components, prose
scripts/
  count-metrics.mjs recount figures from the source repositories
  og.mjs            generate social images and icons
  check-stealth.mjs fail the build on names that must not be published
  check-links.mjs   fail the build on broken internal references
tests/
  a11y.spec.ts      axe + keyboard tests, every route, both themes
```

### Three decisions worth explaining

**Figures are generated, not typed.** The previous site quoted "261 API
endpoints" and "794 tests". Both were true when written and both had drifted by
the time anyone read them. `scripts/count-metrics.mjs` counts from the real
repositories into `src/data/metrics.json` with a `countedAt` date the footer
renders. Content references a figure by key, so a renamed counter fails the
build rather than rendering `undefined`.

It runs locally and never in CI — the source repositories are private and are
not checked out on the runner, and a build that can only happen on one laptop
is not a build.

**The palette is tested.** `src/lib/contrast.test.ts` asserts every colour
pairing the design relies on against WCAG thresholds, in both themes, and
asserts that the values in `palette.ts` actually appear in `global.css` so the
two cannot drift. This caught a real defect during the build: the dark theme's
section band was a 1.04:1 step from the page background, effectively invisible.

**Names that cannot be published are checked by hash.** One case study
describes a company that has not announced itself. That constraint binds the
source, not just the rendered page — an MDX draft or an image filename leaks as
effectively as body copy. `scripts/check-stealth.mjs` scans file contents and
paths, tokenising camelCase and punctuation, and matches truncated SHA-256
digests rather than storing the words in plaintext in a public repository. It
runs in CI against both the source tree and `dist/`.

## Local development

```sh
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # static output to dist/ (regenerates OG images first)
pnpm preview        # serve the production build
```

Node 22+, pnpm 11+.

## Verification

```sh
pnpm verify         # typecheck, lint, unit tests, stealth check, build, links
pnpm test:a11y      # axe + keyboard, 13 routes × 2 themes
pnpm test:lh        # Lighthouse budgets
```

`pnpm test:a11y` and `pnpm test:lh` need a browser:

```sh
pnpm exec playwright install --with-deps chromium
export CHROME_PATH=$(node -e "console.log(require('playwright-core').chromium.executablePath())")
```

Current results: Lighthouse 100 across performance, accessibility, best
practices and SEO on every audited route (99 performance on one), no axe
violations in either theme, and no framework runtime in the output.

## Updating content

**A case study or note** — add an `.mdx` file under `src/content/`. The schema
in `src/content.config.ts` is the contract; a missing field fails the build.
Diagram components (`Diagram`, `Row`, `Node`, `Arrow`) and `Figure` are
injected, so no imports are needed in the file.

**Figures** — `cp .metrics-sources.example.json .metrics-sources.json`, point
each key at a local checkout, then `pnpm metrics`. Commit the regenerated
`src/data/metrics.json`.

**A social image** — add an entry to the `pages` array in `scripts/og.mjs`.
The slug is the URL path with slashes replaced by hyphens, which is how
`Base.astro` finds it.

**Screenshots** — drop the image into `src/assets/media/`, import it, and pass
it to `<Figure src={…} alt="…" />`. Until then `Figure` renders a correctly
sized placeholder, so adding the real image shifts nothing.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`: build, stealth
check, link check, then publish to GitHub Pages. `public/CNAME` holds the
custom domain.

DNS for the apex domain needs `A` records to `185.199.108.153`,
`185.199.109.153`, `185.199.110.153` and `185.199.111.153` (plus the
equivalent `AAAA` records), with "Enforce HTTPS" enabled in the repository's
Pages settings.

## Licence

Code is MIT. Written content and case studies are © Jay Stewart — please do not
republish them as your own.
