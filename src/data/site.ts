/**
 * Single source of truth for identity, navigation and contact details.
 *
 * Anything that appears in more than one place — the email address, the
 * canonical origin, the nav — lives here, so there is exactly one place to
 * change it and no chance of two pages disagreeing.
 */

import { careerStartYear } from './experience.ts';

export const site = {
  name: 'Jay Stewart',
  origin: 'https://jaystewart.dev',
  role: 'Senior backend and full-stack engineer',
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
   * page, and as the JSON-LD description of the site.
   *
   * It leads with the systems and stopped leading with the method on
   * 2026-08-25. The reader this site is written for changed: the primary
   * route is a 3-to-6-month contract, so the person reading this string is a
   * hiring manager or a contract recruiter, and to that reader "agents write
   * most of the code" as an opening reads as "he cannot code". The practice
   * is the tiebreak that makes the candidate memorable, never the pitch —
   * hq, record/reviews/2026-08-24-contracting-assessment.md, part five. So
   * the counted claim stays, second. (The audit-offer version of this string
   * was retired 2026-08-16 with the strategy that needed it; the research
   * framing that replaced it was demoted here for the same kind of reason.)
   *
   * Experience is a span rather than a years figure, interpolated from the
   * same `roles` array the About-page timeline renders — see
   * `careerStartYear` for the two occasions a duration was wrong here, and
   * for why a more careful duration was not the fix.
   */
  description: `Senior backend and full-stack engineer — production systems where being wrong costs somebody money, since ${careerStartYear()}. E-commerce and payments in Bristol, then a live scheduling, payments and video platform on Next.js, React Native and Postgres. Built almost entirely with coding agents, inside verification gates measured from git history. UK-based and available for contract work.`,

  /** Short form, used in the footer and structured data. */
  tagline: 'Senior backend and full-stack engineer · production systems where money moves',
} as const;

/**
 * Prefilled mailto for starting a conversation about agent-native
 * engineering, used by the home page, the method page, the sample report and
 * the contact page.
 *
 * It lives here rather than in each page for the reason this file exists:
 * every entry point must carry the same subject line, so that replies thread
 * as one conversation rather than several. The subject deliberately invites
 * a conversation rather than naming an offer — there is none published.
 *
 * As of 2026-08-25 this is the *secondary* ask. `contractMailto` below is the
 * primary one.
 */
export const conversationMailto = `mailto:${site.email}?subject=${encodeURIComponent('Agents in your team')}`;

/**
 * Prefilled mailto for the ask the site now leads with: availability for a
 * 3-to-6-month contract.
 *
 * Two subjects rather than one, deliberately. They are different
 * conversations with different people — a hiring manager with a role to fill,
 * and an engineering team comparing notes on agent practice — and threading
 * them together would lose which of the two an inbox is looking at.
 */
export const contractMailto = `mailto:${site.email}?subject=${encodeURIComponent('Contract availability')}`;

export type NavItem = {
  readonly href: string;
  readonly label: string;
  /**
   * Marks the one item that is the site's primary call to action, so it reads
   * as an invitation rather than as the second of six equal-weight links.
   * Exactly one item should carry it — the point is contrast.
   */
  readonly emphasis?: boolean;
};

export const nav: readonly NavItem[] = [
  { href: '/work/', label: 'Work' },
  { href: '/notes/', label: 'Notes' },
  { href: '/work/agent-operated-codebase/', label: 'Agents' },
  { href: '/about/', label: 'About' },
  { href: '/philosophy/', label: 'Philosophy' },
  { href: '/contact/', label: 'Contact', emphasis: true },
];

/** Absolute URL for a site-relative path. */
export function absolute(path: string): string {
  return new URL(path, site.origin).href;
}
