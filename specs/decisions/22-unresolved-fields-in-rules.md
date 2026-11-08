# Unresolved fields in rule extraction

Status: accepted
Date: 2026-11-08
Issue: careers-page.com: company not extracted when the page title has another template (#22)
Affects: tool for adding vacancy examples (#14), turning an LLM-extracted vacancy into an example and a site rule (#25), Ashby site rule (#35); vacancy reader
Narrows: `10-site-parsing-rule-format.md` (adds a key to the extracted vacancy document; "A field that the site does not show is left out of the rule and of the output")

## Context

A site rule leaves out a field it cannot extract, and the document then says nothing about it. Two different cases look the same: the site does not show the field (no company logo or name is ever on the page), and the rule tried to read the field but the page did not give a confirmed value (a selector matched nothing, or `postprocess` found no second source). On careers-page.com the company comes from the `<title>` template and is confirmed by the URL slug; for a page with another template there is no company, and nobody can tell from `vacancy.md` that a company exists but was not extracted.

The writer already asks the user when `company` is null in the vacancy contract. What is missing is a trace for the reader of the run and for later tasks that add examples and rules.

## Decision

- `unresolved` is the list of fields the rule tried to extract but could not confirm. A field the rule does not try (no selector, not handled in `postprocess`) is never listed: that means "the site does not show it".
- There are two sources:
  - automatic: the rule has a selector for an optional field (`title`, `company`, `hiring_manager`, `tags`, `company_description`) and it matched nothing, or only empty text;
  - `postprocess`: it adds a field name to `unresolved` of the fields it returns when it tried the field and could not confirm the value.
- A field that ends up with a value is never listed. The list is in the canonical field order (`title`, `company`, `hiring_manager`, `tags`, `company_description`) without duplicates. `description` is not listed: no description is an error. An unknown name is an extraction error.
- The extracted vacancy document gets the front matter key `unresolved: [company]`, a one-line flow list like `tags`, right after `tags`. It is left out when the list is empty.
- `status.json` gets `extraction.unresolved`: the same list, or `null` when there are none, when a rule did not run, or while the extraction is running. Other fields of the `extraction` block use `null` for "no value" in the same way.
- The vacancy contract `vacancy.json` does not change: it stays `1.0` with no new key. The writer reads `company: null` as before.
- The LLM fallback is unchanged: it has no `unresolved`, and `rules/fields.md` (its instruction) is unchanged.

## Consequences

- `10-site-parsing-rule-format.md` is not edited. Its document format gains one optional key, described in `vacancy-reader/rules/README.md`.
- `ExtractedFields` gets an optional `unresolved`, and `ExtractionResult` gets `unresolved`. `expected.md` files of examples stay the same unless a rule marks a field.
- The tool for adding vacancy examples (#14), the conversion of an LLM result into an example and a rule (#25) and the Ashby site rule (#35) can use `unresolved` to see which fields a rule still has to cover.
- A reader of `vacancy.md` or `status.json` can tell "not shown" from "not extracted". The key is never a placeholder value.
