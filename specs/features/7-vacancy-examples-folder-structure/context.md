# Context: #7 Vacancy examples: folder and data structure (URL + expected text)

## Code map

- No code in the repo yet. Tracked files: `CLAUDE.md`, `README.md`, `specs/AGENT.md`, `specs/mission.md`, `specs/tech-stack.md`, `specs/decisions/`.
- `specs/decisions/3-site-parsing-rules-from-examples.md` — the ADR this task details: an example (URL + expected text) is the test case of a site rule. It lives in open PR #9 (branch `docs/3-vacancy-reader-adrs`), not in `staging`; read it with `git show origin/docs/3-vacancy-reader-adrs:specs/decisions/3-site-parsing-rules-from-examples.md`. Link to it by path anyway.
- `specs/AGENT.md` — "Read by topic" table: add a row for vacancy examples.
- `specs/mission.md` — "Key Decisions": one line per ADR, format `- <decision> — see \`decisions/<file>\`.`
- `specs/tech-stack.md` — mentions ADRs inline in "Key Dependencies"; add the examples layout there or in "Constraints".

## Patterns to follow

- ADR — like `specs/decisions/3-site-parsing-rules-from-examples.md` (on branch `docs/3-vacancy-reader-adrs`): short Context, bullet Decision, bullet Consequences. Template `.claude/templates/sdd/adr.md`.
- ADR header for this task: `Status: proposed` is replaced by `accepted` (approach agreed with the human), `Issue: #7`, `Affects: #10, #11, #12; vacancy reader`.

## Conventions

- All files in English.
- Layout (agreed with the human):
  - `examples/vacancies/index.yaml` — the only metadata source. `schema: 1`, `sites: { <site>: { count, examples: [ { url, path, saved_at, notes? } ] } }`. `path` is relative to `examples/vacancies/`. `count` equals the length of `examples`.
  - `<site>` — URL host without `www.`.
  - Example folder `<company>-<role>`, kebab-case, readable; on a clash add `-2`. No date in the name.
  - Example folder holds only `expected.md` (expected text, Markdown) and `page.html` (HTML snapshot). No per-example metadata file.
- Snapshot rules: saved without login, or with personal data and tokens stripped before commit; `<script>`/`<style>` may be stripped; no Git LFS.
- Never commit candidate data (`llms-full.txt`), cookies or browser profile.

## Gaps found during implementation
