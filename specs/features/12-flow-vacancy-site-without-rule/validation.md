# Validation: #12 Flow for a vacancy from a site without a rule

## Tools

- `node:test` via `tsx --test`, TypeScript (`tsc --noEmit`), ESLint; all run from `vacancy-reader/`.

## Checklist

- [ ] Types check — auto: `cd vacancy-reader && npm run typecheck`
- [ ] Lint passes — auto: `cd vacancy-reader && npm run lint`
- [ ] All tests pass offline and without a key — auto: `cd vacancy-reader && env -u ANTHROPIC_API_KEY npm test`
- [ ] Tests do not use the real `runs/` folder — auto: compare `ls vacancy-reader/runs` before and after `npm test`
- [ ] Extraction tests cover: rule → `method: rule`, `has_rule: true`; no rule + fake client → `succeeded`, `method: llm`, `vacancy.md` with `extracted_by: llm`; no rule + no key → `no_rule`; fallback error / invalid output → `failed`, stale `vacancy.md` removed — auto: `grep -nE "method|has_rule|extracted_by|no_rule|failed" vacancy-reader/src/extract.test.ts`
- [ ] Fallback tests cover input cleaning, JSON-LD hint, untrusted wrapper with an escaped closing tag, instructions with `fields.md` and untrusted-content rules, rejected invalid output — auto: `grep -rnE "untrusted_page|JobPosting|fields.md" vacancy-reader/src/fallback/*.test.ts`
- [ ] A site with a rule never calls the fallback — manual: read `vacancy-reader/src/extract.ts`
- [ ] Model is `claude-haiku-5-5`, key only from `ANTHROPIC_API_KEY` — auto: `grep -rn "claude-haiku-5-5" vacancy-reader/src && grep -rn "ANTHROPIC_API_KEY" vacancy-reader/src vacancy-reader/.env.example`
- [ ] `.env` is ignored, `.env.example` committed, no key in the repo — auto: `cd vacancy-reader && git check-ignore .env && git ls-files .env.example && ! git grep -nE "sk-ant-" -- .`
- [ ] `rules/fields.md` describes all six fields — auto: `for f in title company hiring_manager company_description tags description; do grep -q "$f" vacancy-reader/rules/fields.md || echo "missing $f"; done`
- [ ] Front matter order: `source_url`, `site`, `extracted_by`, then the rest — auto: `cd vacancy-reader && npm test` (example `expected.md` has `extracted_by: rule` after `site`)
- [ ] `examples/` changed only by the `extracted_by: rule` line — auto: `git diff origin/staging -- vacancy-reader/examples | grep -E "^[+-][^+-]" | grep -v "extracted_by: rule"` is empty
- [ ] `extract` without an argument exits 2; unknown job exits 1 — auto: `cd vacancy-reader && npx tsx src/cli.ts extract; test $? -eq 2; npx tsx src/cli.ts extract no-such-job; test $? -eq 1`
- [ ] ADR `12-llm-fallback-extraction` accepted and linked from `specs/AGENT.md` and `specs/tech-stack.md` — auto: `grep -n "12-llm-fallback-extraction" specs/AGENT.md specs/tech-stack.md`
- [ ] Docs describe the flow, the key, `extraction.method`, `extraction.has_rule`, `extracted_by`, and no longer list #12 as planned or say the reader never uses an LLM — auto: `grep -n "ANTHROPIC_API_KEY" vacancy-reader/README.md && grep -n "has_rule" vacancy-reader/README.md && grep -n "extracted_by" vacancy-reader/rules/README.md CLAUDE.md`; manual: read the changed sections

## Smoke tests

- With `ANTHROPIC_API_KEY` in `vacancy-reader/.env`: `npm run fetch -- https://yoailabs.careers-page.com/jobs/c2fbdb99-80e6-4da7-9e58-41eeae82d733`, then `npm run status -- <job-id>` until final: `extraction.status: succeeded`, `method: llm`, `has_rule: false`; `vacancy.md` has `extracted_by: llm`, title "Investment Banking Associate - Remote", company "YO AI Labs", and a job description with no invented facts. — manual
- Same URL without a key: `extraction.status: no_rule`, no `vacancy.md`; `npm run extract -- <job-id>` exits 1 and says how to enable the fallback. — manual
- `npm run fetch -- https://www.careers-page.com/manatal/job/L3X639RW`: `method: rule`, `has_rule: true`, `extracted_by: rule`, no model call. — manual
