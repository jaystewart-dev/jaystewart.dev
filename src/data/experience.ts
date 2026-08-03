/**
 * Employment history.
 *
 * Two editorial decisions are encoded here rather than left to the template:
 *
 * 1. Thrive ran alongside the G&V role. Listed as a contract engagement so the
 *    overlapping dates read as what they were, rather than as two simultaneous
 *    full-time jobs.
 * 2. The current transit role is deliberately unnamed. See src/data/stealth.ts
 *    for what that constraint covers and why.
 */

export interface Role {
  company: string;
  title: string;
  start: string;
  end: string | null;
  /** Rendered as-is; `null` end renders as "Present". */
  period: string;
  location: string;
  kind: 'permanent' | 'contract' | 'founder';
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
    start: '2020-03',
    end: null,
    period: '2020 — present',
    location: 'Remote',
    kind: 'founder',
    summary:
      'Designing and running small products end to end — architecture, code, infrastructure and the on-call pager. AgendaProfe is the largest and the one carrying real money.',
    detail: [
      'AgendaProfe — scheduling, payments and live video teaching for independent teachers. In production.',
      'groundtruth — a small open-source CLI that checks agent-context files against the repository they describe.',
    ],
    stack: ['TypeScript', 'Next.js', 'Postgres', 'Stripe', 'Terraform', 'React Native'],
  },
  {
    company: 'G&V Venture Brands',
    title: 'Backend engineer',
    start: '2017-07',
    end: '2020-03',
    period: 'Jul 2017 — Mar 2020',
    location: 'Bristol',
    kind: 'permanent',
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

/** Years of professional backend work, computed so it never needs updating. */
export function yearsOfExperience(now: Date = new Date()): number {
  const startedAt = new Date('2012-07-01');
  const years = (now.getTime() - startedAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(years);
}
