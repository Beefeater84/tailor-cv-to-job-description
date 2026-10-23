# Per-site parsing rules, learned from examples

Status: accepted
Date: 2026-10-23
Issue: Epic: Vacancy reader (#3)
Affects: vacancy examples (#7), vacancy output contract (#8), site parsing rules: format and tests (#10), matching a vacancy URL to a site rule (#11), vacancies from a site without a rule (#12); vacancy reader

## Context

Job sites lay out vacancies differently. The CV writer needs a clean, predictable vacancy text, not the whole page with navigation, ads and footers. Every vacancy comes from the user, so new sites appear one at a time, with real examples.

## Decision

- The vacancy reader extracts text with a parsing rule per site.
- Rules are learned from examples. The user gives a vacancy URL and the text they expect from it. The agent writes the rule that reproduces this text from the page.
- Each example (URL + expected text) is kept as a test case. A rule is accepted only when it reproduces the expected text of all its examples.
- The reader output follows one fixed, versioned output contract (#8), whatever site the vacancy came from.

How it is built is decided in the tasks: example storage (#7), rule format (#10), matching a URL to a rule (#11), sites without a rule (#12).

## Consequences

- Adding a site means adding a rule and at least one example. The reader code does not change.
- Extraction with an existing rule is deterministic and testable.
- When a site changes its layout, its example tests fail, and the rule is updated from a new example.
- What happens with a site that has no rule yet is decided in the task on sites without a rule (#12).
