/**
 * WCAG 2.1 relative luminance and contrast ratio.
 *
 * This exists so the palette's accessibility claims are checked by the test
 * suite rather than asserted in a comment. `contrast.test.ts` reads the same
 * token values the stylesheet uses and fails the build if any pairing that the
 * design depends on drops below its threshold — in either theme.
 *
 * Reference: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

export type Rgb = readonly [number, number, number];

/** Parse `#rgb` or `#rrggbb` into 8-bit channels. Throws on anything else. */
export function parseHex(hex: string): Rgb {
  const raw = hex.trim().replace(/^#/, '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw;

  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a hex colour: ${hex}`);
  }

  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ] as const;
}

/** WCAG relative luminance, 0 (black) to 1 (white). */
export function luminance(colour: string | Rgb): number {
  const [r, g, b] = typeof colour === 'string' ? parseHex(colour) : colour;

  const channel = (value: number): number => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** Contrast ratio between two colours, 1:1 to 21:1. Order-independent. */
export function contrastRatio(a: string | Rgb, b: string | Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG thresholds, named so test failures read as intent rather than numbers. */
export const WCAG = {
  /** Body text and any text below 24px / 18.66px bold. */
  AA_TEXT: 4.5,
  /** Text at or above 24px, or 18.66px bold. */
  AA_LARGE_TEXT: 3,
  /** Borders, focus rings, icons — anything conveying state or boundary. */
  AA_NON_TEXT: 3,
  /** The stricter bar, used where it costs nothing to clear it. */
  AAA_TEXT: 7,
} as const;
