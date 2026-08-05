/**
 * Single source of truth for identity, navigation and contact details.
 *
 * Anything that appears in more than one place — the email address, the
 * canonical origin, the nav — lives here, so there is exactly one place to
 * change it and no chance of two pages disagreeing.
 */

export const site = {
  name: 'Jay Stewart',
  origin: 'https://jaystewart.dev',
  role: 'Backend and platform engineer',
  location: 'Bristol, UK',
  locality: 'Bristol',
  region: 'England',
  country: 'GB',
  email: 'jay@jaystewart.dev',
  github: 'https://github.com/jaystewart-dev',
  githubHandle: 'jaystewart-dev',
  linkedin: 'https://www.linkedin.com/in/jaystewart-dev',

  /** Used as the default meta description and the OG description on the home page. */
  description:
    'Backend and platform engineer with twelve years building systems that handle payments, transactions and personal data — now designed and operated with coding agents behind verification gates. Case studies on the architecture, trade-offs and operations behind production software.',

  /** Short form, used in the footer and structured data. */
  tagline: 'Backend and platform engineer, Bristol',
} as const;

export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/audit/', label: 'Audit' },
  { href: '/notes/', label: 'Notes' },
  { href: '/working-with-agents/', label: 'Agents' },
  { href: '/about/', label: 'About' },
  { href: '/philosophy/', label: 'Philosophy' },
] as const;

/** Absolute URL for a site-relative path. */
export function absolute(path: string): string {
  return new URL(path, site.origin).href;
}
