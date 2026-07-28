import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { contrastRatio, luminance, parseHex, WCAG } from './contrast.ts';
import { backgrounds, themes, type Theme } from './palette.ts';

const css = readFileSync(
  fileURLToPath(new URL('../styles/global.css', import.meta.url)),
  'utf8',
);

describe('contrast maths', () => {
  it('parses both hex forms', () => {
    expect(parseHex('#fff')).toEqual([255, 255, 255]);
    expect(parseHex('#16181d')).toEqual([22, 24, 29]);
  });

  it('rejects anything that is not a hex colour', () => {
    expect(() => parseHex('rebeccapurple')).toThrow();
    expect(() => parseHex('#ff')).toThrow();
  });

  it('anchors luminance at the endpoints', () => {
    expect(luminance('#000000')).toBe(0);
    expect(luminance('#ffffff')).toBeCloseTo(1, 10);
  });

  it('reproduces the known black-on-white ratio', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
  });

  it('is order-independent', () => {
    expect(contrastRatio('#0c6b57', '#f7f5ef')).toBeCloseTo(
      contrastRatio('#f7f5ef', '#0c6b57'),
      10,
    );
  });
});

describe('palette and stylesheet agree', () => {
  // Guards the one real risk of keeping the palette in two places: an edit to
  // global.css that never reaches palette.ts, quietly voiding every assertion
  // below.
  for (const [themeName, theme] of Object.entries(themes)) {
    for (const [token, value] of Object.entries(theme)) {
      it(`${themeName}.${token} (${value}) appears in global.css`, () => {
        expect(css.toLowerCase()).toContain(value.toLowerCase());
      });
    }
  }
});

describe.each(Object.entries(themes))('%s theme meets WCAG AA', (_name, theme: Theme) => {
  for (const bg of backgrounds) {
    it(`body text on ${bg}`, () => {
      expect(contrastRatio(theme.ink, theme[bg])).toBeGreaterThanOrEqual(WCAG.AA_TEXT);
    });

    it(`secondary text on ${bg}`, () => {
      expect(contrastRatio(theme.muted, theme[bg])).toBeGreaterThanOrEqual(WCAG.AA_TEXT);
    });

    // The accent is a link colour in body copy, so it takes the text bar, not
    // the large-text one.
    it(`accent text and focus ring on ${bg}`, () => {
      expect(contrastRatio(theme.accent, theme[bg])).toBeGreaterThanOrEqual(WCAG.AA_TEXT);
    });

    it(`meaningful borders on ${bg}`, () => {
      expect(contrastRatio(theme.lineStrong, theme[bg])).toBeGreaterThanOrEqual(
        WCAG.AA_NON_TEXT,
      );
    });
  }

  it('text on an accent fill', () => {
    expect(contrastRatio(theme.accentContrast, theme.accent)).toBeGreaterThanOrEqual(
      WCAG.AA_TEXT,
    );
  });

  it('primary text clears the stricter AAA bar on the page background', () => {
    expect(contrastRatio(theme.ink, theme.paper)).toBeGreaterThanOrEqual(WCAG.AAA_TEXT);
  });

  // Not an accessibility requirement — a design one. The band exists to
  // separate adjacent sections, and a step too small to see does not do that.
  it('the section band is a visible step from the page background', () => {
    const step = contrastRatio(theme.band, theme.paper);
    expect(step).toBeGreaterThan(1.05);
    expect(step).toBeLessThan(2);
  });
});
