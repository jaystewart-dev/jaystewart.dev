/**
 * Single source of truth for identity, navigation and contact details.
 *
 * Anything that appears in more than one place — the email address, the
 * canonical origin, the nav — lives here, so there is exactly one place to
 * change it and no chance of two pages disagreeing.
 */

import { careerStartYear } from './experience.ts';

/**
 * The job title is "Senior full-stack engineer", set 2026-08-26.
 *
 * It was "Senior backend and full-stack engineer" — accurate, and two words
 * longer than the thing a recruiter types. `role` is not decoration: it is the
 * JSON-LD `jobTitle` in Base.astro, the <title> of the home page, and the
 * eyebrow above the H1, so it is the closest thing this site has to a title
 * field. One title now spans four surfaces — here, experience.ts, the LinkedIn
 * position and livelihood/cv.md — and livelihood/contracting.md's target
 * sentence was changed from "product engineer" to match on the same day.
 *
 * Dropping "backend" costs the one word that was doing real work, and it is a
 * deliberate trade rather than an oversight: eight years of literal Backend
 * Engineer titles are still in the timeline on /about/, and the description
 * below still leads with systems where being wrong costs somebody money.
 * What is bought is the term with the largest matching surface that stays
 * true — narrower options each cost more, per livelihood/contracting.md
 * § The target.
 */
export const site = {
  name: 'Jay Stewart',
  origin: 'https://jaystewart.co.uk',
  role: 'Senior full-stack engineer',
  location: 'Bristol, UK',
  locality: 'Bristol',
  region: 'England',
  country: 'GB',
  email: 'jay@jaystewart.co.uk',
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
  description: `Senior full-stack engineer — production systems where being wrong costs somebody money, since ${careerStartYear()}. E-commerce and payments in Bristol, then a live scheduling, payments and video platform on Next.js, React Native and Postgres. Built almost entirely with coding agents, inside verification gates measured from git history. UK-based and available for contract work.`,

  /** Short form, used in the footer and structured data. */
  tagline: 'Senior full-stack engineer · production systems where money moves',
} as const;

/**
 * Prefilled mailto for starting a conversation about agent-native
 * engineering, used by the home page and the contact page. It also served the
 * /audit/ pages until they were removed on 2026-08-25.
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

/**
 * The emphasised slot is /contract/ rather than /contact/, changed 2026-08-27.
 *
 * The nav stayed at six items on purpose. A seventh would have made the two
 * near-homographs "Contact" and "Contract" sit side by side, which is a
 * usability defect before it is anything else, and it would have diluted the
 * one item carrying `emphasis` — the point of which is contrast.
 *
 * Which of the two to keep is decided by what the reader arrived to do. The
 * primary route is a contract (livelihood/contracting.md), so the visitor
 * this nav is for is a recruiter or a hiring manager, and their question is
 * "can I use him, and how" rather than "what is his email address". /contact/
 * answers the second and is one click from the first — linked from the new
 * page, from the home page and from the footer — so nothing became
 * unreachable.
 *
 * The label is "Available" and not "Contract" for the same homograph reason —
 * "Contract" one slot from where "Contact" used to sit reads as a typo — and
 * because the emphasised item is a call to action rather than a destination.
 * It states the fact the page exists to answer, in the site's own words: the
 * home page's primary button has said "Available for contract work" since
 * 2026-08-25.
 */
export const nav: readonly NavItem[] = [
  { href: '/work/', label: 'Work' },
  { href: '/notes/', label: 'Notes' },
  { href: '/work/agent-operated-codebase/', label: 'Agents' },
  { href: '/about/', label: 'About' },
  { href: '/philosophy/', label: 'Philosophy' },
  { href: '/contract/', label: 'Available', emphasis: true },
];

/** Absolute URL for a site-relative path. */
export function absolute(path: string): string {
  return new URL(path, site.origin).href;
}
