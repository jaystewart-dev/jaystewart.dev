/**
 * Every route on the site, shared by the browser test suites.
 *
 * One list rather than one per spec file, because the failure mode of two
 * lists is that a new page gets added to the accessibility suite and quietly
 * skips the layout suite — or the reverse.
 */
export const routes = [
  '/',
  '/work/',
  '/work/agendaprofe/',
  '/work/realtime-transit/',
  '/work/agent-operated-codebase/',
  '/audit/',
  '/audit/sample/',
  '/notes/',
  '/notes/when-building-becomes-free/',
  '/notes/development-environment-is-a-server/',
  '/notes/a-compiler-for-agent-context/',
  '/about/',
  '/philosophy/',
  '/contact/',
  '/404.html',
] as const;
