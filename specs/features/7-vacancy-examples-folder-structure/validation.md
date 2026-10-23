# Validation: #7 Vacancy examples: folder and data structure (URL + expected text)

## Tools

- git, grep, a YAML parser if available (`python -c "import yaml"` or `node`); no project stack yet.

## Checklist

- [ ] The ADR exists with `Issue: #7` and `Affects: #10, #11, #12` — auto: `grep -E '^(Issue: #7|Affects: #10, #11, #12)' specs/decisions/7-vacancy-examples-layout.md`
- [ ] `specs/AGENT.md` and `specs/mission.md` link the ADR — auto: `grep -l '7-vacancy-examples-layout' specs/AGENT.md specs/mission.md`
- [ ] `index.yaml` parses and has `schema: 1` — auto: `python -c "import yaml,sys; d=yaml.safe_load(open('examples/vacancies/index.yaml')); assert d['schema']==1"`
- [ ] Every site's `count` equals the length of its `examples`, every `path` exists and holds `expected.md` and `page.html`, `path` starts with its site — auto: a short Python or shell check over `index.yaml`
- [ ] No example folder is missing from `index.yaml` — auto: compare `examples/vacancies/*/*/` with the `path` values
- [ ] No URL appears twice in `index.yaml` — auto: same check
- [ ] The snapshot holds no personal data or tokens — manual: open `page.html`, search for the user's name, email, `token`, `csrf`, `session`
- [ ] `expected.md` is the text the user expects — manual: the user reads it

## Smoke tests

- Find a processed URL: `grep -n '<url>' examples/vacancies/index.yaml` returns its `path`.
