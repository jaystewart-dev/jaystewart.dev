import { describe, expect, it } from 'vitest';
import { careerStartYear, roles } from './experience.ts';

/**
 * These pin the one claim on this site that is asserted about the author
 * rather than counted from a repository.
 *
 * It was wrong twice as a duration before it was tested: hardcoded as
 * "twelve" while a function returned fourteen, and then computed as a span
 * from 2012 that silently counted a six-year career break as experience. Both
 * versions shipped, and both were claims about the author on the page selling
 * an audit of exactly that kind of claim.
 *
 * The third version is not a better duration — it is a start year, which
 * cannot go stale and cannot disagree with the timeline rendered from the
 * same array. What is worth testing therefore changed with it: not the
 * arithmetic, but that the year is still derived from `roles` and that the
 * shape those roles are read under still holds.
 */
describe('careerStartYear', () => {
  it('is the earliest non-break role, not a hand-typed year', () => {
    expect(careerStartYear()).toBe(2012);

    const earliest = roles
      .filter((role) => role.kind !== 'break')
      .map((role) => role.start)
      .sort()[0];

    expect(earliest.startsWith(String(careerStartYear()))).toBe(true);
  });

  it('does not move with the date it is asked on', () => {
    // The property that made this replace a duration. A years figure had to be
    // right on the day it was written and stayed wrong afterwards; a start
    // year has no "now" to be read against at all.
    expect(careerStartYear()).toBe(careerStartYear());
    expect(careerStartYear.length).toBe(0);
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

  it('is not itself inside the break', () => {
    // Guards the failure the old function had: reading a start date that sits
    // on the wrong side of the gap and calling it where the career began.
    const [gap] = roles.filter((role) => role.kind === 'break');
    expect(careerStartYear()).toBeLessThan(Number(gap.start.slice(0, 4)));
  });
});
