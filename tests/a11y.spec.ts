import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accessibility checks across every route, in both themes.
 *
 * Automated auditing catches perhaps a third of real accessibility problems, so
 * this is a floor rather than a certificate. The keyboard and landmark tests
 * below cover the things axe cannot see: whether the skip link actually moves
 * focus, whether focus is visible, and whether the page has the structure a
 * screen-reader user navigates by.
 *
 * Both themes are tested because a contrast regression can exist in one and not
 * the other, and only ever showing up for readers on dark mode is precisely the
 * kind of bug that survives for months.
 */

const routes = [
  '/',
  '/work/',
  '/work/agendaprofe/',
  '/work/realtime-transit/',
  '/notes/',
  '/notes/development-environment-is-a-server/',
  '/notes/when-cost-is-the-architecture/',
  '/notes/a-compiler-for-agent-context/',
  '/about/',
  '/philosophy/',
  '/working-with-agents/',
  '/contact/',
  '/404.html',
];

const themes = ['light', 'dark'] as const;

for (const theme of themes) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme });

    for (const route of routes) {
      test(`${route} has no detectable violations`, async ({ page }) => {
        await page.goto(route);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        expect(results.violations).toEqual([]);
      });
    }
  });
}

test.describe('keyboard and structure', () => {
  test('the skip link is the first stop and moves focus to the content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skip = page.locator('.skip-link');
    await expect(skip).toBeFocused();
    // It must be visible once focused — an invisible skip link is worse than
    // none, because it silently swallows the first Tab.
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page.locator('#main')).toBeFocused();
  });

  test('every page has one h1 and the landmarks a screen reader navigates by', async ({
    page,
  }) => {
    for (const route of routes) {
      await page.goto(route);

      await expect(page.locator('h1'), `${route} should have exactly one h1`).toHaveCount(1);
      await expect(page.locator('main#main')).toHaveCount(1);

      // Roles, not tags. A `<header>` nested inside `<article>` is a sectioning
      // header, not a banner landmark — case studies have both, and only the
      // outer one should be announced as the site banner.
      await expect(page.getByRole('banner'), `${route} banner`).toHaveCount(1);
      await expect(page.getByRole('contentinfo'), `${route} contentinfo`).toHaveCount(1);
      await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1);
    }
  });

  test('the theme toggle is reachable, operable and announces its action', async ({ page }) => {
    await page.goto('/');

    const toggle = page.getByRole('button', { name: /switch to (dark|light) theme/i });
    await expect(toggle).toBeVisible();

    const before = await toggle.getAttribute('aria-label');
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
    // The label describes what pressing it will do, so it must invert.
    await expect(toggle).not.toHaveAttribute('aria-label', before!);
  });

  test('the theme choice survives a reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /switch to/i }).click();
    const chosen = await page.locator('html').getAttribute('data-theme');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', chosen!);
  });

  test('headings descend without skipping a level', async ({ page }) => {
    for (const route of routes) {
      await page.goto(route);

      const levels = await page
        .locator('h1, h2, h3, h4, h5, h6')
        .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName[1])));

      for (let i = 1; i < levels.length; i += 1) {
        expect(
          levels[i] - levels[i - 1],
          `${route}: h${levels[i - 1]} is followed by h${levels[i]}`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});
