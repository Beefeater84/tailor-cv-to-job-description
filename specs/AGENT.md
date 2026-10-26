# Agent guide to `specs/`

This file tells agents what to read in `specs/`. `README.md` files are for humans.
Do not read the whole folder. Read the base set, then only what the task needs.

## Always read

- `mission.md` — what the project is and its business rules.
- `tech-stack.md` — stack, infrastructure, constraints, code style.
- Accepted decisions in `decisions/`. List them with:

  ```bash
  grep -rl --include='*.md' '^Status: accepted' specs/decisions/
  ```

  Read the title, `Affects` and `Decision` of each. Read the rest only if the task touches it.

## Read by topic

Add a row for each module or doc area when it appears (writer, PDF creator, CV rules, design sample).

| When the task touches | Read |
|---|---|
| The format or content of the candidate data (`llms-full.txt`) | `docs/spec.md` in the `Beefeater84/index-cv` repository |
| `vacancy-reader/`, vacancy examples in `vacancy-reader/examples/` or vacancy rule tests | `vacancy-reader/README.md`, `decisions/6-vacancy-reader-module.md` |
| Site parsing rules in `vacancy-reader/rules/`, the extracted vacancy document or `expected.md` of an example | `vacancy-reader/rules/README.md`, `vacancy-reader/rules/fields.md`, `decisions/10-site-parsing-rule-format.md`, `decisions/12-llm-fallback-extraction.md` |
| The vacancy contract (`vacancy.json`) or the input of the writer | `vacancy-reader/contract/README.md`, `decisions/8-vacancy-output-contract.md` |
| The stack, language, runtime or module layout | `decisions/6-typescript-node-stack.md` |

## Feature folders

`features/<id>-<slug>/` holds one task's `plan.md`, `context.md` and `validation.md`.
Read only the folder of the current task. Read another one only when the task context points to it.

## Where decisions go

- Affects only the current task: a deviation comment in its GitHub issue (`## Отклонение от подхода`).
- Changes the approach for other tasks: an ADR in `decisions/<id>-<slug>.md` (template: `.claude/templates/sdd/adr.md`).
- Never edit an accepted ADR. Write a new one and set the old one to `superseded by <file>`.
