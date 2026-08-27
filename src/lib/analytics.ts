/**
 * PostHog reporting configuration.
 *
 * These values live here rather than inside the component that uses them for
 * one reason: the failure mode of getting them wrong is silent. A project key
 * that is valid but belongs to a different project reports real traffic into
 * somebody else's dashboard, and nothing anywhere goes red — the beacon
 * succeeds, the build passes, the site looks identical. `analytics.test.ts`
 * pins them so that mistake has to be made deliberately.
 */

export const analytics = {
  /**
   * Project `jaystewart.dev` (538067) in the `Jay Stewart` organisation.
   * The project keeps that name after the 2026-08-27 move to
   * `jaystewart.co.uk` — it is PostHog's own label for project 538067,
   * not a hostname, and renaming it there is a separate deliberate act.
   * `host` below is the one that had to move, and did.
   *
   * A PostHog project key is publishable by design — it authorises writing
   * events and nothing else, and cannot read a single one back — so it belongs
   * in the source of a public repository rather than in a secret. It is
   * embedded rather than injected at build time so that a local build and the
   * deployed site run identical code; what keeps local traffic out of the
   * project is `host` below, not the absence of a key.
   */
  key: 'phc_C7rkiC39p4sjKrA6UijjvxGYsXnCpfWkbWAuPu2oUoJR',

  /** PostHog's capture endpoint for the US cloud region. */
  endpoint: 'https://us.i.posthog.com/i/v0/e/',

  /**
   * The only hostname that reports. `pnpm dev`, `pnpm preview`, the Playwright
   * suites and any fork all resolve to something else and stay silent, so the
   * project holds real traffic only and the numbers never have to be caveated.
   */
  host: 'jaystewart.co.uk',

  /**
   * A visit ends after this long without a pageview. PostHog's own definition,
   * matched deliberately: if this site's idea of a session disagreed with the
   * one PostHog's web-analytics views assume, every duration and bounce figure
   * would be quietly wrong rather than obviously wrong.
   */
  sessionIdleMs: 30 * 60 * 1000,

  /** And no visit runs longer than this, however long the tab stays open. */
  sessionMaxMs: 24 * 60 * 60 * 1000,
} as const;

/**
 * Campaign parameters lifted from the query string onto every pageview.
 *
 * PostHog parses these in `posthog-js`, on the client, and not during
 * ingestion — so a beacon that does not send them produces a project with no
 * attribution at all, where every campaign click is indistinguishable from
 * direct traffic. The names are PostHog's canonical ones, which is what makes
 * them show up in the built-in channel and campaign breakdowns rather than as
 * custom properties nobody has configured.
 */
export const campaignParams = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
  'li_fat_id',
] as const;
