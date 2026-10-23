# Plan: #7 Vacancy examples: folder and data structure (URL + expected text)

Issue: #7 · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/7#issuecomment-6368228620
Delivery: -
Later: -

## Group 1: Layout ADR and docs

- Task: #7
- Goal: Record the examples layout (`examples/vacancies/`, `index.yaml`, `<site>/<company>-<role>/` with `expected.md` and `page.html`) as an ADR and link it from the specs.
- Files: `specs/decisions/7-vacancy-examples-layout.md` (create), `examples/vacancies/index.yaml` (create, empty `sites`), `specs/AGENT.md` (change), `specs/mission.md` (change), `specs/tech-stack.md` (change)
- Reuse: `.claude/templates/sdd/adr.md` — ADR template; `specs/decisions/3-site-parsing-rules-from-examples.md` (in the vacancy reader ADRs PR, #9) — the decision this one details
- Done when: the ADR describes the folder layout, folder naming, `index.yaml` schema with `count`, snapshot rules (personal data, size), and `specs/AGENT.md` points to it.
- Complexity: normal

## Group 2: First real example

- Task: #7
- Goal: Store one real vacancy given by the user in the layout and register it in `index.yaml`.
- Files: `examples/vacancies/<site>/<company>-<role>/expected.md` (create), `examples/vacancies/<site>/<company>-<role>/page.html` (create), `examples/vacancies/index.yaml` (change), `.gitattributes` (create: `examples/** -text`, keeps snapshot and expected text bytes stable on Windows)
- Also: the ADR wording changed to "examples are public" (the repository is public; the human decided to commit examples)
- Reuse: the layout from Group 1
- Done when: the example folder exists, `index.yaml` lists its URL and path with `count: 1`, and the snapshot holds no personal data or tokens.
- Complexity: normal
