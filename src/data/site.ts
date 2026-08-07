/**
 * Single source of truth for identity, navigation and contact details.
 *
 * Anything that appears in more than one place — the email address, the
 * canonical origin, the nav — lives here, so there is exactly one place to
 * change it and no chance of two pages disagreeing.
 */

import { yearsOfExperience } from './experience.ts';

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

  /**
   * Used as the default meta description and the OG description on the home
   * page, and as the JSON-LD description of the site. It leads with the audit
   * because this string is what a search result and a shared link show, and
   * the audit is what the site is currently selling.
   *
   * The years figure is interpolated rather than written out: it was hardcoded
   * as "twelve" while `yearsOfExperience()` two files away already returned
   * fourteen — a claim on the selling surface that had quietly stopped being
   * true, which is the exact failure the audit this string advertises exists
   * to catch. A number that changes on its own cannot rot.
   */
  description: `Fixed-price agent-readiness audits: every claim in your CLAUDE.md, rules and memory files verified against the repository, with a CI gate left behind so the lies cannot come back. Run by a backend and platform engineer with ${yearsOfExperience()} years on systems that handle payments, transactions and personal data.`,

  /** Short form, used in the footer and structured data. */
  tagline: 'Backend and platform engineer · agent-operated production systems',
} as const;

export type NavItem = {
  readonly href: string;
  readonly label: string;
  /**
   * Marks the one item that is the site's primary call to action, so it reads
   * as an offer rather than as the second of six equal-weight links. Exactly
   * one item should carry it — the point is contrast.
   */
  readonly emphasis?: boolean;
};

export const nav: readonly NavItem[] = [
  { href: '/audit/', label: 'Audit', emphasis: true },
  { href: '/work/', label: 'Work' },
  { href: '/notes/', label: 'Notes' },
  { href: '/work/agent-operated-codebase/', label: 'Agents' },
  { href: '/about/', label: 'About' },
  { href: '/philosophy/', label: 'Philosophy' },
];

/** Absolute URL for a site-relative path. */
export function absolute(path: string): string {
  return new URL(path, site.origin).href;
}
