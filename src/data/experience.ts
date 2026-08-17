/**
 * Employment history.
 *
 * Three editorial decisions are encoded here rather than left to the template:
 *
 * 1. Thrive ran alongside the G&V role, and both were day-rate contracts.
 *    Both are labelled as such so the overlapping dates read as what they
 *    were, rather than as two simultaneous full-time jobs. G&V was recorded
 *    here as permanent until 2026-08-16, when checking this file against the
 *    LinkedIn profile turned up the disagreement and Jay confirmed the
 *    profile was the correct one.
 * 2. The current transit role is deliberately unnamed. See src/data/stealth.ts
 *    for what that constraint covers and why.
 * 3. The 2020–2026 career break is a first-class entry rather than a gap
 *    between two dates. The independent role used to start in March 2020,
 *    which quietly covered six years of not working at all; every project on
 *    this site was in fact built after March 2026. Stating the break is both
 *    the honest version and the stronger one — it is what makes the output
 *    since the restart legible as compression rather than as an ordinary
 *    career spread thin.
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
    end: null,
    period: 'May 2026 — present',
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
      'Six years away from engineering entirely: travelling, living simply, and not working. Deliberate, and not a period I want to write a lesson about. I came back to it in March 2026 after starting to build with coding agents.',
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
 * Years actually spent working, as the union of every non-break role interval.
 *
 * Deliberately not the span from the first start date. That version counted
 * the six-year career break above as experience and overstated the figure by
 * roughly six years — a claim on the selling surface that nothing checked,
 * which is the exact failure this site sells an audit of. Deriving it from
 * `roles` means the number and the timeline rendered from the same array
 * cannot disagree, and neither can go stale.
 *
 * Union rather than sum because the roles overlap: Thrive ran alongside G&V,
 * and the transit role alongside the independent one. Summing durations would
 * double-count both.
 */
export function yearsOfExperience(now: Date = new Date()): number {
  const worked = roles
    .filter((role) => role.kind !== 'break')
    .map((role) => ({
      from: new Date(`${role.start}-01`).getTime(),
      to: role.end ? new Date(`${role.end}-01`).getTime() : now.getTime(),
    }))
    .sort((a, b) => a.from - b.from);

  let total = 0;
  let mergedTo = -Infinity;

  for (const { from, to } of worked) {
    const start = Math.max(from, mergedTo);
    if (to > start) {
      total += to - start;
      mergedTo = to;
    }
  }

  return Math.floor(total / (365.25 * 24 * 60 * 60 * 1000));
}
