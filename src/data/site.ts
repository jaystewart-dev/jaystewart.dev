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
  role: 'AI-native software engineer',
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
   * page, and as the JSON-LD description of the site. It leads with the
   * measured practice because that is what the site now argues: evidence of
   * AI-native engineering, not an offer. (The audit-offer version of this
   * string was retired 2026-08-16 with the strategy that needed it.)
   *
   * The years figure is interpolated rather than written out, and it has now
   * been wrong twice: hardcoded as "twelve" while `yearsOfExperience()` two
   * files away returned fourteen, and then correctly interpolating a fourteen
   * that itself counted a six-year career break as experience. It derives
   * from the same `roles` array the About-page timeline renders, with breaks
   * excluded, so the number cannot contradict the history shown beneath it.
   */
  description: `Production systems where AI agents write most of the code — run inside verification gates, measured from git history, and written up honestly. ${yearsOfExperience()} years of backend engineering either side of a six-year break, now researching what AI-native delivery actually changes.`,

  /** Short form, used in the footer and structured data. */
  tagline: 'AI-native software engineer · agent-operated production systems, measured',
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
 */
export const conversationMailto = `mailto:${site.email}?subject=${encodeURIComponent('Agents in your team')}`;

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
