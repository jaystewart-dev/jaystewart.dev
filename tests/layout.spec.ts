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

test.describe('the footer meets the page', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  /**
   * The footer is a band, and opens with a margin so it is not welded to body
   * copy sitting on paper. A page whose own last section is a band does not
   * want that margin: it renders as a stripe of paper between two identical
   * bands, which reads as a seam rather than as breathing room.
   *
   * `Base` takes `flushFooter` for exactly this, and the prop is the kind of
   * thing the next page to end on a band forgets. So rather than trusting the
   * six pages that set it today, this derives the answer from what actually
   * paints: if the last full-bleed block on the page is the band colour, the
   * gap above the footer must be zero, and if it is not, the gap must be there.
   */
  for (const route of routes) {
    test(`${route} has no stripe of paper above the footer`, async ({ page }) => {
      await page.goto(route);

      const { gap, endsOnBand, band } = await page.evaluate(() => {
        const main = document.querySelector('main')!;
        const footer = document.querySelector('footer')!;
        const band = getComputedStyle(document.documentElement)
          .getPropertyValue('--c-band')
          .trim();

        // Walk the last-child chain for the deepest block that both paints a
        // background and spans the page — a centred card that happens to be
        // band-coloured leaves paper either side of it, so it does not close
        // the page the way a full-bleed section does.
        let el: Element | null = main;
        let last: string | null = null;
        while (el) {
          const style = getComputedStyle(el);
          const spansPage = el.getBoundingClientRect().width >= main.clientWidth;
          if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && spansPage) {
            last = style.backgroundColor;
          }
          el = el.lastElementChild;
        }

        // Both sides as rgb(), so the comparison does not depend on the
        // notation the palette happens to be written in.
        const probe = document.createElement('span');
        probe.style.color = band;
        document.body.append(probe);
        const bandRgb = getComputedStyle(probe).color;
        probe.remove();

        return {
          gap: footer.getBoundingClientRect().top - main.getBoundingClientRect().bottom,
          endsOnBand: last !== null && last === bandRgb,
          band: bandRgb,
        };
      });

      if (endsOnBand) {
        expect(
          gap,
          `${route} ends on the band (${band}) — the footer should sit flush against it, ` +
            `so pass \`flushFooter\` to Base. Found a ${gap}px stripe of paper.`,
        ).toBe(0);
      } else {
        expect(
          gap,
          `${route} ends on paper — the footer needs its gap, so it should not pass ` +
            '`flushFooter` to Base.',
        ).toBeGreaterThan(0);
      }
    });
  }
});
