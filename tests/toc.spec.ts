import { expect, test, type Page } from '@playwright/test';

/**
 * The contents list tracks the reader's position.
 *
 * A contents list that never moves is a map with no "you are here" — on a
 * 4,000-word case study the reader loses the thread of where they are, which is
 * the one thing the list exists to tell them. These tests are the assertion
 * that the tracking survives: it is scroll-position arithmetic measured against
 * the sticky header, and that is exactly the kind of code a later layout change
 * breaks silently.
 *
 * Both kinds of page carrying a contents list are covered, because the
 * mechanism lives in one shared component and a regression there hits every
 * long page at once.
 */

const pages = ['/work/agent-operated-codebase/', '/notes/when-building-becomes-free/'];

/** The entries of the desktop rail. The mobile list holds the same links. */
const rail = (page: Page) => page.locator('nav [data-toc-link]');

const currentText = async (page: Page) =>
  (await page.locator('nav [data-toc-link][aria-current]').first().textContent())?.trim();

const atBottom = (page: Page) =>
  page.evaluate(
    () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2,
  );

for (const route of pages) {
  test.describe(route, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(route);
      // Smooth scrolling is right for a reader and useless for a test: without
      // this, every assertion races an animation that is still running.
      await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });
    });

    test('nothing is current until the reader reaches the first section', async ({ page }) => {
      await expect(page.locator('[data-toc-link][aria-current]')).toHaveCount(0);
    });

    test('the current section follows the scroll position', async ({ page }) => {
      const links = rail(page);
      const count = await links.count();
      expect(count, 'the page should have a contents list').toBeGreaterThan(2);

      const last = (await links.last().textContent())?.trim();

      // Clicking an entry scrolls its heading onto the same line the highlight
      // is measured against, so each click should leave its own entry current —
      // except at the foot of the page, where the last section wins because
      // nothing below it can scroll into view.
      for (let index = 0; index < count; index += 1) {
        const text = (await links.nth(index).textContent())?.trim();
        await links.nth(index).click();

        const expected = (await atBottom(page)) ? last : text;
        await expect.poll(() => currentText(page)).toBe(expected);
      }
    });

    test('the last section is current at the bottom of the page', async ({ page }) => {
      const links = rail(page);
      const last = (await links.last().textContent())?.trim();

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect.poll(() => currentText(page)).toBe(last);
    });

    test('the mobile list marks the same section as the rail', async ({ page }) => {
      const target = (await rail(page).nth(1).getAttribute('href'))!;
      await page.setViewportSize({ width: 390, height: 800 });
      await page.evaluate((hash) => {
        document.querySelector(hash)!.scrollIntoView();
      }, target);

      // Both variants ship on every page and CSS picks which one is visible, so
      // the highlight has to be applied to both or it is missing at one width.
      const marked = page.locator('[data-toc-link][aria-current]');
      await expect(marked).toHaveCount(2);

      const [railText, listText] = await marked.allTextContents();
      expect(railText.trim()).toBe(listText.trim());
    });
  });
}
