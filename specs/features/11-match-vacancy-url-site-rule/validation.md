# Validation: #11 Match a vacancy URL to an existing site rule

## Tools

- `node:test` via `tsx --test`, TypeScript (`tsc --noEmit`), ESLint; all run from `vacancy-reader/`.

## Checklist

- [ ] Types check — auto: `cd vacancy-reader && npm run typecheck`
- [ ] Lint passes — auto: `cd vacancy-reader && npm run lint`
- [ ] All tests pass, including the new matcher tests and the example tests — auto: `cd vacancy-reader && npm test`
- [ ] Matcher tests cover known site, another company on the same site, unknown site, other subdomain, invalid URL — auto: `grep -nE "63674V5R|example\.com|jobs\.careers-page\.com" vacancy-reader/src/match.test.ts`
- [ ] Known URL matches the careers-page.com rule, exit 0 — auto: `cd vacancy-reader && npm run match -- https://www.careers-page.com/idelsoft/job/63674V5R`
- [ ] Unknown site prints `no rule for example.com`, exit 1 — auto: `cd vacancy-reader && npm run match -- https://example.com/job/1; test $? -eq 1`
- [ ] Invalid URL fails with exit 1, missing argument with exit 2 — auto: `cd vacancy-reader && npx tsx src/cli.ts match ftp://x.com; test $? -eq 1` and `cd vacancy-reader && npx tsx src/cli.ts match; test $? -eq 2`
- [ ] `examples/` unchanged — auto: `git diff --quiet origin/staging -- vacancy-reader/examples`
- [ ] Docs describe matching (host key, only host normalised, no conflicts, before page open, no platform signature, stored examples left to #14) and the `match` command — manual: read "Matching a URL to a rule" in `vacancy-reader/rules/README.md` and the `match` section in `vacancy-reader/README.md`

## Smoke tests

- `cd vacancy-reader && npm run match -- "https://careers-page.com/SomeOtherCompany/job/ABC?utm_source=x#apply"` → `careers-page.com`, rule `rules/careers-page.com.ts`.
