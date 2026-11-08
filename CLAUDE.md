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

When the user gives a vacancy URL in chat, fetch it with the vacancy-reader module: `cd vacancy-reader && npm run fetch -- <url>`, then check the job with `npm run status -- <job-id>` until it reaches a final status. For a `succeeded` job the extracted vacancy is in `runs/<job-id>/vacancy.md` (the worker writes it right after the fetch, so check `extraction.status` in the status output and wait while it is `running`; the final values are `succeeded`, `no_rule`, `failed` and `crashed`): read that file. A `vacancy.md` with `extracted_by: llm` in its front matter comes from the LLM fallback for a site without a rule and is unverified: treat it as less reliable than `extracted_by: rule`. `extraction.status` is `no_rule` when the site has no rule and no `ANTHROPIC_API_KEY` is set. The machine-readable vacancy contract is `runs/<job-id>/vacancy.json`, see `vacancy-reader/contract/README.md`. Read `runs/<job-id>/page.html` only when `extraction.status` is not `succeeded` (`no_rule`, `failed` or `crashed`) or the job is not `succeeded`. See `vacancy-reader/README.md`.

## Checking a CV

When the user asks to check a CV (usually a file in `my-cv/`, which is gitignored), check it against the writing rules: `tailor-cv/rules/general.md`, every file in `tailor-cv/rules/cv/`, the lists in `tailor-cv/rules/lists/`, and the style rules in `tailor-cv/style/common.md` with `tailor-cv/style/lists/`. The card format and the meaning of Weight and Check are in `tailor-cv/rules/README.md`. Use each card's **Check** field, skip cards whose Weight is "none" (agent behaviour, not a property of the CV), and report rules that need a vacancy as "needs a vacancy" unless the user gave one (then read it as in "Vacancy URLs"). In the report, group the findings by weight (highest first): rule id, what breaks it in the CV with a quote, why it matters, how to fix it. Never invent facts for a fix: when a fix needs a fact the CV does not have, ask the user. Write the report in the user's language, and to a file only when asked (default `my-cv/report.md`).
