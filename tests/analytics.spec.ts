import { expect, test } from '@playwright/test';

import { routes } from './routes.ts';

/**
 * The beacon reports from `jaystewart.co.uk` and nowhere else.
 *
 * This suite runs against a production build served from localhost, which is
 * exactly the condition the host guard exists for — so the interesting
 * assertion is a negative one: nothing leaves the page. That covers the three
 * ways the project could fill up with traffic that is not real visitors, all
 * of which serve the site from a host that is not the apex domain: a developer
 * running `pnpm preview`, CI running these very tests, and anybody who forks
 * the repository and deploys it under their own name.
 *
 * It is worth a browser test rather than a source assertion because the guard
 * has to survive the build. An Astro directive that stopped inlining the
 * script, or a bundler that hoisted it, would leave `analytics.test.ts` green
 * while changing what visitors actually run.
 */

const POSTHOG = /posthog\.com/;

test('no route reports to PostHog when served from localhost', async ({ page }) => {
  const captured: string[] = [];
  page.on('request', (request) => {
    if (POSTHOG.test(request.url())) captured.push(request.url());
  });

  for (const route of routes) {
    await page.goto(route);
    // The beacon fires synchronously during parse, but the click and
    // visibility handlers it installs are the part that could leak later.
    await page.waitForLoadState('networkidle');
  }

  expect(captured, 'the host guard should keep every non-production build silent').toEqual([]);
});

test('the mailto and outbound handlers stay silent off-production too', async ({ page }) => {
  const captured: string[] = [];
  page.on('request', (request) => {
    if (POSTHOG.test(request.url())) captured.push(request.url());
  });

  // A synthetic click still runs the anchor's activation behaviour, so the
  // outbound dispatch below genuinely navigates — to the live LinkedIn profile,
  // whose settling time then decided whether the `networkidle` wait returned
  // inside the timeout. That is what made this test flaky rather than failing:
  // the assertion depended on a third-party site nobody here controls.
  //
  // Aborting everything that leaves the origin makes the navigation fail
  // immediately instead. It does not weaken the check: the delegated listener
  // runs synchronously before any request is issued, and `page.on('request')`
  // fires before route handling, so a beacon is still observed on its way to
  // being aborted. Verified both ways before this line was written.
  await page.route(/^https?:\/\/(?!(?:localhost|127\.0\.0\.1)[:/])/, (route) => route.abort());

  await page.goto('/contact/');

  // Clicking a mailto would hand the page to the mail client, so drive the
  // delegated listener directly instead — it is registered on the document and
  // does not care where the event came from.
  await page.evaluate(() => {
    document
      .querySelector<HTMLAnchorElement>('a[href^="mailto:"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    document
      .querySelector<HTMLAnchorElement>('a[href^="http"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
  });

  await page.waitForLoadState('networkidle');
  expect(captured).toEqual([]);
});

test('the built page carries the beacon inline rather than as a request', async ({ page }) => {
  // The reason posthog-js was ruled out: the Lighthouse gate asserts zero
  // unused JavaScript and a 400KB budget. If the beacon ever became an
  // external script, that decision would have been silently reversed.
  const scripts = await page.goto('/').then(() => page.locator('script[src]').count());
  expect(scripts, 'the site ships no external script').toBe(0);

  const html = await page.content();
  expect(html).toContain('sendBeacon');
});
