# Validation: #10 Site parsing rules: format, how they are written and tested

## Tools

- npm, TypeScript (`tsc --noEmit`), ESLint, `node:test` via `tsx`. Run from `vacancy-reader/`. Parsing needs no browser or network.

## Checklist

- [ ] Dependencies install — auto: `cd vacancy-reader && npm ci`
- [ ] Typecheck passes, including `rules/` — auto: `cd vacancy-reader && npm run typecheck`
- [ ] Lint passes — auto: `cd vacancy-reader && npm run lint`
- [ ] Rule tests pass on the stored example — auto: `cd vacancy-reader && npm test`
- [ ] `rules:check` shows no diff for careers-page.com and exits 0 — auto: `cd vacancy-reader && npm run rules:check -- careers-page.com`
- [ ] `rules:check` for a site without a rule reports it and exits non-zero — auto: `cd vacancy-reader && npm run rules:check -- no-such-site.example`
- [ ] `page.html` and `index.yaml` unchanged — auto: `git diff --quiet origin/staging -- vacancy-reader/examples/index.yaml vacancy-reader/examples/careers-page.com/idelsoft-senior-frontend-performance-engineer/page.html`
- [ ] `expected.md` follows the ADR format: front matter with `source_url` equal to the example URL and `site`, a `## Job description` section, LF only, no trailing whitespace, one final newline — auto: read the file; `grep -c` for CR prints 0; `grep -nE ' +$'` prints nothing
- [ ] The rule is declarative and the reader has no per-site code — auto: `git grep -n "careers-page" -- vacancy-reader/src` prints nothing outside tests
- [ ] ADR `10-site-parsing-rule-format.md` is accepted — auto: `grep '^Status:' specs/decisions/10-site-parsing-rule-format.md`
- [ ] Docs describe the format, the rule-writing loop with the 5-iteration limit and layout updates — manual: read `vacancy-reader/rules/README.md`
- [ ] The reference `expected.md` shows the vacancy as you want the reader to see it (title, company, tags, description structure) — manual: compare it with https://www.careers-page.com/idelsoft/job/3W3V95WV

## Smoke tests

- Break the careers-page.com rule's `description` selector locally: `npm test` and `rules:check` fail with a diff that points at the missing section; restore it and both pass.
