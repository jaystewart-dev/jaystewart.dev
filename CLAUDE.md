# CLAUDE.md — jaystewart.dev

The public portfolio site: Astro, static, deployed to GitHub Pages. The
stack, the architecture, the three decisions worth explaining, and how to
update content all live in [`README.md`](README.md) — read it rather than
restating it here.

## How changes land

Every change to `main` goes through a pull request. `main` is protected and
the four CI jobs — types/lint/unit tests, build and verify output,
accessibility, Lighthouse — must pass before merge. No approval is required
— single maintainer — so the flow is: branch, open the pull request, merge
it yourself once CI is green. Never push to `main` directly.

The reason is that a merge to `main` _is_ a deploy: `deploy.yml` publishes
to GitHub Pages on every push to `main`. Without the gate, a careless commit
is a live site change with nothing in front of it.
