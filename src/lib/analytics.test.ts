import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { analytics, campaignParams } from './analytics.ts';

const component = readFileSync(
  fileURLToPath(new URL('../components/Analytics.astro', import.meta.url)),
  'utf8',
);

/**
 * Analytics misconfiguration is the quietest class of bug this repository has.
 * A wrong key still returns 200, a wrong host still builds, and the site looks
 * identical either way — the only symptom is a dashboard that is empty, or
 * worse, one that is full of somebody else's traffic. Nothing else in CI would
 * notice, so these assertions are the whole safety net.
 */

describe('project key', () => {
  it('is the key for this site, not another project in the organisation', () => {
    expect(analytics.key).toBe('phc_C7rkiC39p4sjKrA6UijjvxGYsXnCpfWkbWAuPu2oUoJR');
  });

  // Named explicitly because it is the mistake that was actually made: the
  // beacon shipped reporting into the shared groundtruth project, and the only
  // way anyone would have found out is by wondering why the numbers looked odd.
  it('is not the groundtruth project key', () => {
    expect(analytics.key).not.toBe('phc_sCiyDUsQo6Yayh8GcKmHRseHGVD6rySsXyfhgcpVFSgj');
  });

  // A range rather than an exact length: the job here is to catch a key that
  // has been truncated, whitespace-padded or pasted over with something that
  // is not a key at all, not to pin a format PostHog is free to change.
  it('has the shape of a PostHog project key', () => {
    expect(analytics.key).toMatch(/^phc_[A-Za-z0-9]{40,60}$/);
  });
});

describe('reporting guard', () => {
  it('reports only from the canonical apex host', () => {
    expect(analytics.host).toBe('jaystewart.dev');
  });

  it('names a bare hostname, since it is compared against location.hostname', () => {
    // A value carrying a scheme, port or trailing slash would never match and
    // the site would silently report nothing at all — the failure this guard
    // is most likely to have.
    expect(analytics.host).not.toMatch(/[:/]/);
  });

  it('posts to PostHog rather than anywhere else', () => {
    expect(new URL(analytics.endpoint).origin).toBe('https://us.i.posthog.com');
  });
});

describe('session windows', () => {
  it('matches the idle and maximum windows PostHog itself assumes', () => {
    expect(analytics.sessionIdleMs).toBe(30 * 60 * 1000);
    expect(analytics.sessionMaxMs).toBe(24 * 60 * 60 * 1000);
  });

  it('cannot expire a session before it can idle out', () => {
    expect(analytics.sessionMaxMs).toBeGreaterThan(analytics.sessionIdleMs);
  });
});

describe('campaign parameters', () => {
  it('covers the full canonical UTM set', () => {
    // PostHog's built-in campaign and channel breakdowns key off these exact
    // names; a typo does not fail anything, it just produces a custom property
    // that no built-in view will ever read.
    for (const name of [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ]) {
      expect(campaignParams).toContain(name);
    }
  });

  it('lists each parameter once', () => {
    expect(new Set(campaignParams).size).toBe(campaignParams.length);
  });
});

describe('the component and this config cannot drift', () => {
  it('takes its key from here rather than hardcoding one', () => {
    // The point of the module is that there is exactly one place to change the
    // project. A literal key pasted into the component would defeat every
    // assertion above without failing any of them.
    expect(component).not.toMatch(/phc_/);
    expect(component).toMatch(/from '\.\.\/lib\/analytics\.ts'/);
  });

  it('still guards on the host before doing anything else', () => {
    expect(component).toMatch(/location\.hostname !== host/);
  });

  it('uses tab-scoped storage and never cookies', () => {
    expect(component).toMatch(/sessionStorage/);
    expect(component).not.toMatch(/localStorage|document\.cookie/);
  });
});
