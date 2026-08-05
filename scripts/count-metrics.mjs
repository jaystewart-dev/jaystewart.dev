#!/usr/bin/env node
/**
 * Recount the figures quoted on the site, directly from the source repositories.
 *
 * Why this exists
 * ---------------
 * The previous site quoted "261 API endpoints" and "794 automated tests". Both
 * were true when written and both had drifted by the time anyone read them —
 * the repository had moved on and the marketing copy had not. Numbers that
 * decay silently are worse than no numbers, because they are quoted with
 * confidence.
 *
 * So the counts are derived, not typed. This script walks the real repositories
 * and writes src/data/metrics.json with a `countedAt` date that the site
 * renders next to the figures. If it has not been re-run, the site says so.
 *
 * Why it never runs in CI
 * -----------------------
 * The source repositories are private and are not checked out on the build
 * runner. Making the build depend on them would mean the site could only be
 * built from one laptop. Instead the generated JSON is committed, CI consumes
 * it as data, and refreshing it is a deliberate local act.
 *
 * Usage
 * -----
 *   node scripts/count-metrics.mjs
 *
 * Reads repository locations from .metrics-sources.json (gitignored — the paths
 * and directory names are not public information). Copy the example file:
 *
 *   cp .metrics-sources.example.json .metrics-sources.json
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcesFile = join(root, '.metrics-sources.json');
const outputFile = join(root, 'src/data/metrics.json');

/* -------------------------------------------------------------------------- */
/* Counting primitives                                                         */
/* -------------------------------------------------------------------------- */

/** Every file under `dir`, skipping directories that are never source. */
function walk(dir, predicate, acc = []) {
  if (!existsSync(dir)) return acc;

  const skip = new Set([
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    '.turbo',
    'coverage',
    '.astro',
    '.expo',
    // Agent worktrees are copies of the same tree; counting them would
    // multiply every figure by the number of branches in flight.
    '.claude',
  ]);

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    if (skip.has(entry.name)) continue;

    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, acc);
    else if (predicate(entry.name, full)) acc.push(full);
  }

  return acc;
}

const countFiles = (repo, predicate) => walk(repo, predicate).length;

/** Directories directly inside `path` — used for migration folders. */
function countDirs(path) {
  if (!existsSync(path)) return 0;
  return readdirSync(path, { withFileTypes: true }).filter((e) => e.isDirectory()).length;
}

/** Lines matching a regex across a single file. */
function countMatches(file, pattern) {
  if (!existsSync(file)) return 0;
  return (readFileSync(file, 'utf8').match(pattern) ?? []).length;
}

/**
 * A shallow clone reports a truncated `rev-list --count`, which would be
 * committed as if it were the real figure. Wrong numbers are worse than no
 * numbers, so a shallow checkout aborts the run rather than degrading it.
 */
function assertNotShallow(repo) {
  const shallow = execFileSync('git', ['-C', repo, 'rev-parse', '--is-shallow-repository'], {
    encoding: 'utf8',
  }).trim();
  if (shallow === 'true') {
    throw new Error(`${repo} is a shallow clone — run \`git fetch --unshallow\` first.`);
  }
}

function gitCount(repo) {
  try {
    assertNotShallow(repo);
    return Number(
      execFileSync('git', ['-C', repo, 'rev-list', '--count', 'HEAD'], {
        encoding: 'utf8',
      }).trim(),
    );
  } catch (error) {
    console.error(String(error.message ?? error));
    process.exit(1);
  }
}

/**
 * Commits written or co-written by a coding agent: the author name or a
 * Co-authored-by trailer names one. Renders alongside `commits`, because the
 * share is the honest figure — the total alone would hide it.
 */
function gitAgentCount(repo) {
  try {
    assertNotShallow(repo);
    const records = execFileSync(
      'git',
      ['-C', repo, 'log', '--format=%x1e%an%x1f%(trailers:key=Co-authored-by,valueonly)'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    ).split('\x1e');
    return records.filter((r) => /claude/i.test(r)).length;
  } catch (error) {
    console.error(String(error.message ?? error));
    process.exit(1);
  }
}

function gitFirstCommitYear(repo) {
  try {
    const out = execFileSync(
      'git',
      ['-C', repo, 'log', '--reverse', '--format=%ad', '--date=format:%Y'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    return Number(out.split('\n')[0]);
  } catch {
    return 0;
  }
}

const isTest = (name) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(name);
const isWorkflow = (name) => /\.ya?ml$/.test(name);

/**
 * What counts as a line of code: hand-written source, not prose, data or
 * lockfiles. Markdown, JSON and YAML are excluded on purpose — a docs-heavy
 * repository should not look bigger than a code-heavy one.
 */
const isSource = (name) => /\.(ts|tsx|js|jsx|mjs|cjs|css|prisma|sql|sh)$/.test(name);

const countLines = (repo) =>
  walk(repo, isSource).reduce(
    (total, f) => total + readFileSync(f, 'utf8').split('\n').length,
    0,
  );

/* -------------------------------------------------------------------------- */
/* Per-project counters                                                        */
/* -------------------------------------------------------------------------- */

const counters = {
  agendaprofe(repo) {
    const web = join(repo, 'apps/web');
    return {
      databaseModels: countMatches(join(web, 'prisma/schema.prisma'), /^model\s+\w+\s*\{/gm),
      migrations: countDirs(join(web, 'prisma/migrations')),
      apiRoutes: countFiles(repo, (n) => n === 'route.ts' || n === 'route.tsx'),
      appPages: countFiles(repo, (n) => n === 'page.tsx'),
      testFiles: countFiles(repo, isTest),
      workflows: countFiles(join(repo, '.github/workflows'), isWorkflow),
      decisionRecords: countFiles(join(repo, 'docs/decisions'), (n) => /^D-\d+\.md$/.test(n)),
      backgroundJobs: countFiles(
        join(repo, 'apps/web/src/lib/inngest/functions'),
        (n) => /\.ts$/.test(n) && n !== 'index.ts',
      ),
      mobileFlows: countFiles(join(repo, 'apps/mobile/.maestro'), (n) => /\.ya?ml$/.test(n)),
      linesOfCode: countLines(repo),
      commits: gitCount(repo),
      agentCommits: gitAgentCount(repo),
      since: gitFirstCommitYear(repo),
    };
  },

  transit(repo) {
    return {
      testFiles: countFiles(repo, isTest),
      workflows: countFiles(join(repo, '.github/workflows'), isWorkflow),
      decisionRecords: countFiles(join(repo, 'docs/engineering/decisions'), (n) =>
        /^D-\d+\.md$/.test(n),
      ),
      routes: countFiles(join(repo, 'docs/routes/json'), (n) => n.endsWith('.json')),
      linesOfCode: countLines(repo),
      commits: gitCount(repo),
      agentCommits: gitAgentCount(repo),
      since: gitFirstCommitYear(repo),
    };
  },

  groundtruth(repo) {
    return {
      testFiles: countFiles(repo, isTest),
      workflows: countFiles(join(repo, '.github/workflows'), isWorkflow),
      linesOfCode: countLines(repo),
      commits: gitCount(repo),
      since: gitFirstCommitYear(repo),
    };
  },

  anvil(repo) {
    return {
      terraformLines: walk(repo, (n) => n.endsWith('.tf')).reduce(
        (total, f) => total + readFileSync(f, 'utf8').split('\n').length,
        0,
      ),
      commits: gitCount(repo),
      since: gitFirstCommitYear(repo),
    };
  },
};

/* -------------------------------------------------------------------------- */
/* Run                                                                         */
/* -------------------------------------------------------------------------- */

if (!existsSync(sourcesFile)) {
  console.error(
    `No ${sourcesFile}.\n\n` +
      `  cp .metrics-sources.example.json .metrics-sources.json\n\n` +
      `then point each key at a local checkout. The file is gitignored: the ` +
      `paths are not public information.`,
  );
  process.exit(1);
}

const sources = JSON.parse(readFileSync(sourcesFile, 'utf8'));
const metrics = { countedAt: new Date().toISOString().slice(0, 10), projects: {} };
let missing = 0;

for (const [key, repoPath] of Object.entries(sources)) {
  const counter = counters[key];

  if (!counter) {
    console.warn(`skip  ${key} — no counter defined`);
    continue;
  }

  if (!existsSync(repoPath) || !statSync(repoPath).isDirectory()) {
    console.warn(`skip  ${key} — not a directory: ${repoPath}`);
    missing += 1;
    continue;
  }

  metrics.projects[key] = counter(repoPath);
  console.log(`count ${key}`);
  for (const [name, value] of Object.entries(metrics.projects[key])) {
    console.log(`        ${String(value).padStart(6)}  ${name}`);
  }
}

writeFileSync(outputFile, `${JSON.stringify(metrics, null, 2)}\n`);
console.log(`\nwrote ${outputFile} (countedAt ${metrics.countedAt})`);

if (missing > 0) {
  console.error(`\n${missing} source(s) missing — metrics.json is incomplete.`);
  process.exit(1);
}
