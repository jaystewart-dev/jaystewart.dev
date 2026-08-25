/**
 * Employment history.
 *
 * Four editorial decisions are encoded here rather than left to the template:
 *
 * 1. Thrive ran alongside the G&V role, and both were day-rate contracts.
 *    Both are labelled as such so the overlapping dates read as what they
 *    were, rather than as two simultaneous full-time jobs. G&V was recorded
 *    here as permanent until 2026-08-16, when checking this file against the
 *    LinkedIn profile turned up the disagreement and Jay confirmed the
 *    profile was the correct one.
 * 2. The transit role is deliberately unnamed, and it is end-dated rather
 *    than current. It was `end: null` until 2026-08-24. Two reasons: the
 *    project has been frozen permanently since 2026-08-15, so "present" was a
 *    false claim on a public page; and the route since 2026-08-23 is
 *    contracting, where a live co-founder role reads to a client as an
 *    availability question rather than as experience. The role stays — it is
 *    real, recent, and the only founder-level operating experience here. It
 *    stops being current. The same change lands on the LinkedIn profile and in
 *    delivery-co/cv.md; three surfaces, one history.
 * 3. The 2020–2026 career break is a first-class entry rather than a gap
 *    between two dates. The independent role used to start in March 2020,
 *    which quietly covered six years of not working at all; every project on
 *    this site was in fact built after March 2026. Stating the break is both
 *    the honest version and the stronger one — it is what makes the output
 *    since the restart legible as compression rather than as an ordinary
 *    career spread thin.
 * 4. Experience is stated as a span — "since 2012" — and never as a number of
 *    years. See `careerStartYear` below for why, and for the two occasions a
 *    duration claim was wrong on this site before the rule existed.
 */

export interface Role {
  company: string;
  title: string;
  start: string;
  end: string | null;
  /** Rendered as-is; `null` end renders as "Present". */
  period: string;
  location: string;
  kind: 'permanent' | 'contract' | 'founder' | 'break';
  summary: string;
  detail?: string[];
  stack?: string[];
}

export const roles: Role[] = [
  {
    company: 'Undisclosed — early-stage transit startup',
    title: 'Technical co-founder',
    start: '2026-05',
    end: '2026-08',
    period: 'May 2026 — Aug 2026',
    location: 'Remote',
    kind: 'founder',
    summary:
      'Technical co-founder of a company building live information for public transit riders. I own the mobile app, the operations console and the data backend that turns anonymous signals into positions riders can act on.',
    detail: [
      'Designed a privacy-first architecture: no accounts, no personal data, nothing that identifies a rider.',
      'Set the integrity rule the product is built around — the system never invents a position, and says plainly when it does not know.',
      'Operate the whole stack: a React Native app, a Next.js console, Postgres, and a containerised detector service.',
    ],
    stack: ['React Native', 'Next.js', 'Postgres', 'Fly.io', 'GitHub Actions'],
  },
  {
    company: 'Independent',
    title: 'Founder and engineer',
    start: '2026-03',
    end: null,
    period: 'Mar 2026 — present',
    location: 'Remote',
    kind: 'founder',
    summary:
      'Designing and running small products end to end — architecture, code, infrastructure and the on-call pager. AgendaProfe is the largest and the one carrying real money. All of it built since coming back to engineering in March 2026.',
    detail: [
      'AgendaProfe — scheduling, payments and live video teaching for independent teachers. In production.',
      'groundtruth — a small open-source CLI that checks agent-context files against the repository they describe.',
    ],
    stack: ['TypeScript', 'Next.js', 'Postgres', 'Stripe', 'Terraform', 'React Native'],
  },
  {
    company: 'Travelling',
    title: 'Career break',
    start: '2020-03',
    end: '2026-03',
    period: 'Mar 2020 — Mar 2026',
    location: '—',
    kind: 'break',
    summary:
      'Six years away from engineering entirely: travelling, living simply, and not working. Not a period I want to write a lesson about. What ended it was coding agents — I came back in March 2026, and everything since was built after that. Both contracts had ended at the start of the pandemic, and I did not go looking for more.',
  },
  {
    company: 'G&V Venture Brands',
    title: 'Backend engineer — contract',
    start: '2017-07',
    end: '2020-03',
    period: 'Jul 2017 — Mar 2020',
    location: 'Bristol',
    kind: 'contract',
    summary:
      'Backend engineer at a venture-brand agency, building and maintaining high-traffic e-commerce platforms — including work on Dyson’s store.',
    detail: [
      'Built custom backend modules for stores processing transactions and customer data at scale.',
      'Diagnosed and fixed production issues on systems where an outage meant lost orders, not a failed build.',
      'Worked directly with in-house and client engineering teams against fixed launch dates.',
    ],
    stack: ['PHP', 'Magento', 'MySQL', 'Redis'],
  },
  {
    company: 'Thrive Chiropractic',
    title: 'Backend engineer — contract',
    start: '2016-08',
    end: '2020-03',
    period: 'Aug 2016 — Mar 2020 · alongside agency work',
    location: 'Bristol',
    kind: 'contract',
    summary:
      'Designed and built a booking-and-payment platform from scratch, and kept it running for four years. The same problem I would return to a decade later, at a different scale.',
    detail: [
      'Architected real-time scheduling logic and secure payment processing.',
      'Built the reporting the practice actually used to make operational decisions.',
      'Automated the manual workflows that broke first as the system grew.',
    ],
    stack: ['PHP', 'Laravel', 'MySQL'],
  },
  {
    company: 'Folk Digital',
    title: 'Backend engineer',
    start: '2014-07',
    end: '2016-08',
    period: 'Jul 2014 — Aug 2016',
    location: 'Bournemouth',
    kind: 'permanent',
    summary:
      'Backend engineer on complex e-commerce systems for performance-sensitive clients.',
    detail: [
      'Implemented backend features and third-party integrations across client stores.',
      'Worked with design, frontend and operations to get releases out reliably.',
    ],
    stack: ['PHP', 'Magento', 'MySQL'],
  },
  {
    company: 'C3 Media',
    title: 'Backend engineer',
    start: '2012-07',
    end: '2014-07',
    period: 'Jul 2012 — Jul 2014',
    location: 'Bristol',
    kind: 'permanent',
    summary:
      'Started as a junior PHP developer and progressed to independently building and maintaining full e-commerce systems. Where the rest of it started.',
    detail: [
      'Custom modules, store features, platform upgrades and API integrations.',
      'First exposure to the thing that has shaped everything since: production systems holding other people’s money.',
    ],
    stack: ['PHP', 'Magento', 'MySQL'],
  },
];

/**
 * The year backend engineering started — the earliest non-break role.
 *
 * A span, deliberately, and never a duration. The years figure this replaced
 * was wrong twice: hardcoded as "twelve" while a function two files away
 * computed fourteen, and then correctly interpolating a fourteen that itself
 * counted the six-year career break as experience. Both shipped, and both
 * were claims about the author on the page selling an audit of exactly that
 * kind of claim.
 *
 * A more careful duration was the obvious third attempt and is not the fix.
 * Any duration has to be reconciled against the break every single time it is
 * written, goes stale between writings, and invites a reader to check the
 * arithmetic against the timeline directly beneath it. A span cannot be
 * stale, cannot disagree with the dates, and claims nothing they do not
 * already show. The LinkedIn profile settled on the same rule first
 * (delivery-co, linkedin.md — "no duration claim has crept back in"), and the
 * two surfaces are checked against each other before any outreach, so the
 * site follows it rather than inventing a second version of one history.
 *
 * Derived from `roles` rather than typed, so a corrected start date moves the
 * copy with it.
 */
export function careerStartYear(): number {
  const starts = roles
    .filter((role) => role.kind !== 'break')
    .map((role) => role.start)
    .sort();

  return Number(starts[0].slice(0, 4));
}
