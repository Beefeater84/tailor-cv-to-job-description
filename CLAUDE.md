## Task tracking

All tasks (epics, features, bugs) live in GitHub, not in files in this repo.

- **Repository:** Beefeater84/tailor-cv-to-job-description
- **Project board:** Beefeater84's project number 4
- **Tasks:** GitHub Issues of this repository. The issue number is the task id and is used in every artifact (branch, plan, commits, PR).
- **Epics:** issues with sub-issues. A feature is a sub-issue of its epic.

Board fields: Status (Backlog, Ready, In progress, In review, Done), Priority (P0, P1, P2), Size (XS, S, M, L, XL).

Use the `gh` CLI to read and update tasks, for example `gh issue view <n>` and `gh project item-list 4 --owner Beefeater84`.

## Branching

- Permanent branch `staging`. Feature branches are created from `staging` in `origin` and merged back into it.
- Never branch from or target `main` or `master`. They hold released code only.
- Branch name: `<type>/<issue-number>-<short-description>`, where type is one of `feat`, `fix`, `docs`, `refactor`, `chore`.

## Vacancy URLs

When the user gives a vacancy URL in chat, fetch it with the vacancy-reader module: `cd vacancy-reader && npm run fetch -- <url>`, then check the job with `npm run status -- <job-id>` until it reaches a final status. For a `succeeded` job the extracted vacancy is in `runs/<job-id>/vacancy.md` (the worker writes it right after the fetch, so check `extraction.status` in the status output and wait for it if it is not there yet): read that file. A `vacancy.md` with `extracted_by: llm` in its front matter comes from the LLM fallback for a site without a rule and is unverified: treat it as less reliable than `extracted_by: rule`. `extraction.status` is `no_rule` when the site has no rule and no `ANTHROPIC_API_KEY` is set. The machine-readable vacancy contract is `runs/<job-id>/vacancy.json`, see `vacancy-reader/contract/README.md`. Read `runs/<job-id>/page.html` only when `extraction.status` is not `succeeded` (`no_rule` or `failed`) or the job is not `succeeded`. See `vacancy-reader/README.md`.
