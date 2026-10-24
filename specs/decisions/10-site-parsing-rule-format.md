# Site parsing rules: a declarative TypeScript rule per site, output as Markdown with front matter

Status: accepted
Date: 2026-10-24
Issue: Site parsing rules: format, how they are written and tested (#10)
Affects: vacancy output contract (#8), matching a vacancy URL to a site rule (#11), vacancies from a site without a rule (#12), tool for adding vacancy examples (#14); vacancy reader

## Context

`3-site-parsing-rules-from-examples.md` decided that text is extracted with one rule per site, learned from examples, but left the rule format open. The first example's `expected.md` was text copied from the browser: no structure, and blank lines placed as the clipboard put them. A rule cannot reproduce that reliably, and the writer loses the page structure (headings, lists).

The vacancy reader has two steps:

1. Extraction: read the page, separate the vacancy from the rest of the site, and mark what the site's markup states clearly (title, company and so on).
2. Transformation of the extracted document into the format the writer reads.

Rules do step 1 only. Step 2 is the vacancy output contract (#8). No LLM is used in step 1: what the markup does not mark is not guessed.

Sites differ, and the format will change while the project grows. The output must be loose enough for that.

## Decision

### Rule

- One rule per site: `vacancy-reader/rules/<site>.ts`. `<site>` is the URL host without `www.`, the same key as in `examples/index.yaml`.
- A rule is a declarative object, typed by the module (`defineRule`). Its fields:
  - CSS selectors for the vacancy fields:
    - `description`, required;
    - `title`, `company`, `hiring_manager`, `company_description`, `tags`, optional.
  - `remove`: selectors of elements to drop before extraction (buttons, share widgets, empty blocks).
  - `postprocess` (optional): a function over the extracted values, only for what selectors cannot express.
- A field that the site does not show is left out of the rule and of the output.
- Short fields (`title`, `company`, `hiring_manager`) are plain text with collapsed whitespace. `tags` is a list: one value per matched element. Long fields (`description`, `company_description`) are converted from HTML to Markdown and keep headings, lists, bold and links.
- The rule is chosen by the site key. Matching a URL to a rule beyond the host is decided in "matching a vacancy URL to a site rule (#11)".
- Adding a site means adding a rule file and an example. The reader code does not change.

### Output: the extracted vacancy document

Markdown with YAML front matter:

```markdown
---
source_url: <vacancy URL>
site: <site>
title: <title>
company: <company>
hiring_manager: <name>
tags: [<tag>, <tag>]
---

## Company

<company_description as Markdown>

## Job description

<description as Markdown>
```

- Front matter keys appear in this order. A missing optional field is omitted, and so is a missing `## Company` section.
- Headings inside a section are shifted so that the highest heading becomes `###`.
- Line endings are LF. Lines have no trailing whitespace. The file ends with one newline.
- The document is not a contract for other modules. Fields may be added while the reader grows. The contract is defined by the vacancy output contract (#8).

### Examples and tests

- `expected.md` of an example is the reference extracted document in this format. It is reviewed by a human: it is what the rule must reproduce. The example folder layout from `6-vacancy-reader-module.md` does not change.
- Parsing runs on the stored `page.html` with a static HTML parser, without a browser. The fetcher already rendered the page.
- `npm test` reads `examples/index.yaml`, runs the rule of each example's site on its `page.html` and compares the result with `expected.md` exactly, after normalising line endings, trailing whitespace and the final newline. An example whose site has no rule yet is reported as `todo`, not as a failure.
- A rule is accepted only when all examples of its site pass.

### Writing and updating a rule

- The agent reads `page.html` and `expected.md`, finds the elements of each field, writes the rule and runs `npm run rules:check -- <site>`, which prints the output and a line diff against `expected.md` for each example.
- The agent stops after 5 failed iterations and shows the user the remaining diff.
- When a site changes its layout, a new example from the new layout is added. Its test fails, and the rule is updated until all examples of the site pass. Old examples whose layout is gone may be removed together with their `index.yaml` entry.

## Consequences

- The vacancy output contract (#8) becomes the transformation of the extracted vacancy document into the writer's format. It does not read pages.
- The tool for adding vacancy examples (#14) produces `expected.md` in this format: a draft from the rule or the converter, then a human review.
- Vacancies from a site without a rule (#12): without a rule there is no extracted document. That task decides what happens then.
- Matching a vacancy URL to a site rule (#11) starts from the rule file per site key.
- The first example's `expected.md` is rewritten in the new format.
- Rule tests need no network and no browser.
- A different rule format or output format needs a new ADR.
