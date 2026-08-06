import { expect, test } from '@playwright/test';

import { routes } from './routes.ts';

/**
 * Layout checks at the widths real visitors actually use.
 *
 * The accessibility suite runs at desktop size, which is exactly why a table
 * that overflowed the viewport on a phone survived: nothing in CI ever looked
 * at the site narrow. A document that scrolls sideways is not a cosmetic
 * problem — content slides out from under the sticky header and the reader has
 * no way to know what they are missing.
 *
 * 320px is the narrowest viewport worth supporting (an iPhone SE in portrait
 * is 375px; 320px is the old floor and a useful margin). Anything that fits
 * there fits everywhere.
 */

const widths = [320, 390];

for (const width of widths) {
  test.describe(`${width}px viewport`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const route of routes) {
      test(`${route} does not scroll sideways`, async ({ page }) => {
        await page.goto(route);

        const { scrollWidth, clientWidth, offenders } = await page.evaluate(() => {
          const doc = document.documentElement;

          // Name the widest boxes crossing the right edge, so a failure says
          // which element to fix rather than only that something is too wide.
          const offenders = [...document.querySelectorAll<HTMLElement>('main *')]
            .filter((el) => {
              const rect = el.getBoundingClientRect();
              // An element inside its own scroll container is contained, not
              // an offender — that is precisely the fix for this class of bug.
              const scroller = el.parentElement?.closest('main *');
              const clipped = scroller && getComputedStyle(scroller).overflowX !== 'visible';
              return !clipped && rect.width > 0 && rect.right > doc.clientWidth + 1;
            })
            .map((el) => `${el.tagName.toLowerCase()}.${el.className || '(no class)'}`)
            .slice(0, 5);

          return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth, offenders };
        });

        expect(
          scrollWidth,
          `${route} overflows by ${scrollWidth - clientWidth}px — ${
            offenders.join(', ') || 'no single element identified'
          }`,
        ).toBeLessThanOrEqual(clientWidth);
      });
    }
  });
}

test.describe('wide tables', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('scroll within their own container, reachable from the keyboard', async ({ page }) => {
    await page.goto('/audit/');

    const scroller = page.getByRole('region', { name: 'Example drift report' });

    // The premise of the container: the table really is wider than the phone.
    // If this ever stops being true the container is dead weight and should go.
    const { canScroll } = await scroller.evaluate((el) => ({
      canScroll: el.scrollWidth > el.clientWidth,
    }));
    expect(canScroll, 'the table should be wider than the viewport').toBe(true);

    // And the scroll must be operable without a pointer. A table of plain text
    // holds nothing focusable, so the container itself is the only tab stop
    // that can reach the columns off-screen.
    await scroller.focus();
    await expect(scroller).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  });
});
