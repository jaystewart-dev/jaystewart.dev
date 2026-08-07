import { describe, expect, it } from 'vitest';
import { roles, yearsOfExperience } from './experience.ts';

/**
 * These pin the one number on this site that is asserted rather than counted.
 *
 * It was wrong twice before it was tested: hardcoded as "twelve" while the
 * function returned fourteen, and then computed as a span from 2012 that
 * silently counted a six-year career break as experience. Both versions
 * shipped, and both were claims about the author on the page selling an audit
 * of exactly that kind of claim.
 */
describe('yearsOfExperience', () => {
  const at = (iso: string) => new Date(iso);

  it('excludes the career break', () => {
    // Jul 2012 → Mar 2020 is 7 years 8 months of work. Adding Mar 2026 → Aug
    // 2026 gives 8. Counting the break as well would give 14.
    expect(yearsOfExperience(at('2026-08-07'))).toBe(8);
  });

  it('does not double-count overlapping roles', () => {
    // Thrive (Aug 2016 – Mar 2020) ran alongside G&V (Jul 2017 – Mar 2020).
    // Summing durations rather than merging intervals would add ~2.7 years.
    expect(yearsOfExperience(at('2020-03-01'))).toBe(7);
  });

  it('counts the current roles up to the date it is asked about', () => {
    expect(yearsOfExperience(at('2027-03-01'))).toBe(8);
    expect(yearsOfExperience(at('2027-08-01'))).toBe(9);
  });

  it('has exactly one break, and no role starts inside it', () => {
    const breaks = roles.filter((role) => role.kind === 'break');
    expect(breaks).toHaveLength(1);

    const [gap] = breaks;
    const worked = roles.filter((role) => role.kind !== 'break');

    for (const role of worked) {
      const startsInsideTheBreak = role.start > gap.start && role.start < gap.end!;
      expect(startsInsideTheBreak, `${role.company} starts during the break`).toBe(false);
    }
  });
});
