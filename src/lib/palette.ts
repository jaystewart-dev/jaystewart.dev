/**
 * The palette, in TypeScript, mirroring the custom properties in global.css.
 *
 * Duplicating the values is a deliberate trade-off. The alternative — parsing
 * the stylesheet at test time — couples the test to CSS syntax and fails in
 * confusing ways. Instead `contrast.test.ts` asserts that every value here
 * appears verbatim in global.css, so the two cannot drift apart silently.
 */

export interface Theme {
  paper: string;
  surface: string;
  band: string;
  ink: string;
  muted: string;
  line: string;
  lineStrong: string;
  accent: string;
  accentContrast: string;
}

export const light: Theme = {
  paper: '#f7f5ef',
  surface: '#ffffff',
  band: '#efebe0',
  ink: '#16181d',
  muted: '#4c4f56',
  line: '#e6e2d8',
  lineStrong: '#8a867e',
  accent: '#0c6b57',
  accentContrast: '#ffffff',
};

export const dark: Theme = {
  paper: '#0e1013',
  surface: '#16181d',
  band: '#1b1e25',
  ink: '#e8e6e0',
  muted: '#a2a7b0',
  line: '#262a32',
  lineStrong: '#626a78',
  accent: '#4ecba5',
  accentContrast: '#0e1013',
};

export const themes = { light, dark } as const;

/** The backgrounds any text can land on. Text tokens are checked against all. */
export const backgrounds = [
  'paper',
  'surface',
  'band',
] as const satisfies readonly (keyof Theme)[];
