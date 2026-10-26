# Site parsing rules

A site rule tells the vacancy reader where the vacancy is on a page of one site. The reader runs the rule on a saved, already rendered `page.html` (no browser, no network) and produces the extracted vacancy document. For a fetched job the worker does this automatically after the fetch, and `npm run extract -- <job-id>` runs it again (see [`../README.md`](../README.md)).

The format is decided in `specs/decisions/10-site-parsing-rule-format.md`. This file is the how-to. What to extract (the fields and their meaning, for any site) is specified in [`fields.md`](fields.md); a rule says how to find those fields on one site.

## Rule file

- One rule per site: `rules/<site>.ts`. `<site>` is the URL host without `www.`, lowercased: `https://www.careers-page.com/...` → `careers-page.com`. It is the same key as in `examples/index.yaml`.
- The file default-exports a rule built with `defineRule`. There is no registry: the reader loads `rules/<site>.ts` by the site key. A site without the file has no rule ("no rule for `<site>`").
- Adding a site means adding a rule file and an example. The reader code does not change.

A minimal rule (the careers-page.com rule without its `postprocess`, see "Do not guess" below):

```ts
// careers-page.com: career pages hosted by Manatal.
import { defineRule } from "../src/rules/index.ts";

export default defineRule({
  title: "h1.job-position-break",
  description: "main div.mt-5 > div.redactor-styles",
});
```

### Fields

Every field except `postprocess` and `remove` is one CSS selector (a string). Selector lists such as `"h1, h2"` work.

| Field | Required | Kind | What the reader takes |
| --- | --- | --- | --- |
| `description` | yes | long | The vacancy text. Leaving it out is a type error. |
| `title` | no | short | Job title. |
| `company` | no | short | Employer name. |
| `hiring_manager` | no | short | Name of the hiring manager or recruiter. |
| `company_description` | no | long | Text about the company. |
| `tags` | no | list | One tag per matched element. |
| `remove` | no | list of selectors | Elements dropped from the page before any field is extracted: buttons, share widgets, empty blocks. |
| `postprocess` | no | function | Fixes the extracted values when selectors cannot express something. |

### How fields are extracted

- Before extraction, `script`, `style`, `noscript` and `template` elements are always removed. Then the elements matched by `remove` are removed.
- **Short fields** (`title`, `company`, `hiring_manager`): the text of the **first** matched element, with whitespace collapsed to single spaces and trimmed.
- **`tags`**: the collapsed text of **every** matched element, in document order. Empty values are dropped.
- **Long fields** (`description`, `company_description`): **every** matched element is converted from HTML to Markdown, in document order, joined with a blank line. Markdown style: ATX headings (`###`), `-` bullets, `1.` numbered lists, `**bold**`, `_italic_`, links. `<br>` becomes a line break, and `&nbsp;` becomes a normal space.
- **Heading shift**: inside a long field, headings are shifted so that the highest one becomes `###`. The other headings keep their distance from it, up to `######`. On careers-page.com the description's `<h1>` becomes `###` and its `<h2>`s become `####`.
- **Links** are made absolute against the vacancy URL. Links to a fragment (`#...`) are kept as they are.
- A field whose selector matches nothing, or only empty text, is left out of the output.
- **No description is an error**: if `description` matches no text, or `postprocess` returns no description, the example fails with an error instead of producing a document.
- An invalid selector is an error too.
- **For a fetched job** such an error does not stop anything else: `extraction.status` in the job's `status.json` becomes `failed` with the message in `extraction.error` (an error thrown in `postprocess` too), no `vacancy.md` is written, and a `vacancy.md` from an earlier run is removed. The fetch `status` stays `succeeded`. A site without a rule gives `extraction.status` `no_rule`.

### `postprocess`

```ts
postprocess?: (fields: ExtractedFields, context: { document: Document; sourceUrl: string }) => ExtractedFields;
```

It gets the extracted values (`title`, `company`, `hiring_manager`, `tags`, `company_description`, `description`) and returns them, changed. `document` is the parsed page after `remove`, and `sourceUrl` is the vacancy URL. Use it only for what a selector cannot express, for example splitting "Title at Company" into two fields. Do not use it to invent values.

### Do not guess

Extract only what the site's markup clearly states. If the markup does not mark a field, leave the field out of the rule, and it is left out of the output too. Rules never use an LLM and never guess. The LLM fallback (`extracted_by: llm`) runs only for a site without a rule, and its result is unverified.

A field may come from `postprocess` when the site's platform template states it and a second source on the same page confirms it. This is decided per site, and it is not a general rule. Example: on careers-page.com (Manatal) no element states the employer. The page `<title>` follows the template "`<role>` - `<Company>` - Get Hired …", and the vacancy URL has the company slug as its first path segment (`/idelsoft/job/3W3V95WV`). The rule's `postprocess` takes the company from the `<title>` only when it equals the slug, case-insensitively, and keeps the spelling from the `<title>` (`iDelsoft`). If the template is not found or the slug differs, the rule outputs no `company`. `og:site_name` is "Manatal", the hiring platform, not the employer, so it is never used.

## Matching a URL to a rule

`npm run match -- <url>` tells which site a vacancy URL belongs to and which rule file applies.

- **By host, one rule per site.** The site key is the host of the URL. The rule is `rules/<site>.ts`, and a missing file means "no rule for `<site>`".
- **Only the host is normalised**: lower case, and a leading `www.` is stripped. Other subdomains are other sites (`jobs.careers-page.com` is not `careers-page.com`). Path, query and fragment are ignored, so a trailing `/`, `?utm=...` and `#apply` do not change the match.
- **No conflicts between rules.** A host gives exactly one file name, so two rules cannot match the same URL.
- **Matching happens before the page is opened.** It looks at the URL only and does not need a fetched page.
- **Platform signatures are not used.** A hiring platform on a company's own domain (for example Manatal on a custom domain) is a site without a rule. A site without a rule goes to the LLM fallback (see "The extracted vacancy document"). Turning an LLM-extracted vacancy into an example and a site rule is a separate task (#25).
- **URLs already stored as examples are not recognised here.** That is left to "tool for adding vacancy examples (#14)".

The command only finds the rule file. It does not load or run the rule.

## The extracted vacancy document

Markdown with YAML front matter:

```markdown
---
source_url: <vacancy URL>
site: <site>
extracted_by: <rule|llm>
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

- Front matter keys come in this order. `source_url`, `site` and `extracted_by` are always present, and a missing optional field is left out. Values that need quoting are quoted (`title: "Dev: Senior"`), and `tags` is a one-line flow list.
- `extracted_by` tells how the document was made: `rule` (a site rule) or `llm` (the fallback for a site without a rule, using `fields.md` as its instruction). A document with `extracted_by: llm` is unverified.
- The `## Company` section appears only when there is a `company_description`.
- Line endings are LF. Lines have no trailing whitespace. The file ends with one newline.
- The document is not a contract for other modules. The format the writer reads is the vacancy contract `vacancy.json`, see [`../contract/README.md`](../contract/README.md).

## Examples and tests

Each example is a folder `examples/<site>/<company>-<role>/` with `page.html` (the saved rendered page, never edited) and `expected.md` (the reference extracted document), listed in `examples/index.yaml`. The `url` in the index is the document's `source_url`.

`npm test` reads `examples/index.yaml`, runs the rule of each example's site on its `page.html` and compares the result with `expected.md`. Before the comparison, line endings, trailing whitespace and the final newline are normalised. An example whose site has no rule yet is reported as `todo`, not as a failure. A rule is accepted only when all examples of its site pass.

### `expected.md`

`expected.md` is the reference document in the format above, and a human reviews it. It is what the rule must reproduce. It is not text copied from the browser.

How to make one:

1. Draft it: run the rule (or, for a new site, a first draft of the rule) with `npm run rules:check -- <site>`, and take the printed output.
2. Check every line against `page.html`: the title as the page shows it, every heading, list item and bold label of the description, nothing from outside the vacancy (buttons, share links, "About the job" headers outside the description container), no field the markup does not state.
3. If the draft disagrees with the page, fix the draft so that it follows the page, then fix the rule until it matches. Do not adapt the reference to the rule.
4. Write it with LF line endings and one final newline. Files under `examples/` are stored byte for byte (`-text` in `.gitattributes`).

A tool for adding vacancy examples (#14) is planned to automate the draft. Its output still needs the review.

## Writing a rule (agent workflow)

1. Make sure the site has at least one example in `examples/index.yaml` with `page.html` and a reviewed `expected.md`.
2. Read `page.html` and `expected.md`. For each field of `expected.md`, find the element that holds it, and pick the most stable selector: semantic classes or ids of the site's template, not layout utility classes alone. Find what has to be dropped and put it in `remove`.
3. Write `rules/<site>.ts`.
4. Run:

   ```bash
   npm run rules:check -- <site>
   ```

   For each example it prints the extracted document and then either `--- matches expected.md` or a line diff (`-` expected, `+` actual, with line numbers of `expected.md`). The last line is `<n> of <m> examples pass`.
5. Fix the rule and run it again. **Stop after 5 failed iterations** and show the user the remaining diff, instead of going on.
6. When all examples of the site pass, run `npm test`, `npm run typecheck` and `npm run lint`.

## When a site changes its layout

1. Fetch a vacancy of the new layout and add it as a new example (page, reviewed `expected.md`, `index.yaml` entry).
2. Its test fails. Update the rule (same workflow, same 5-iteration limit) until **all** examples of the site pass, both old and new.
3. Old examples whose layout is gone may be removed together with their `index.yaml` entry.

## Planned

- Turning an LLM-extracted vacancy into an example and a site rule (#25).
- Tool for adding vacancy examples (#14).
