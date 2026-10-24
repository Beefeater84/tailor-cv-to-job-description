# Vacancy reader module: `vacancy-reader/` with examples in `vacancy-reader/examples/`

Status: accepted
Date: 2026-10-24
Issue: Fetch vacancy pages with Playwright (#6)
Affects: vacancy output contract (#8), site parsing rules (#10), matching a URL to a site rule (#11), vacancies from a site without a rule (#12), tool for adding vacancy examples (#14); vacancy reader
Supersedes: `7-vacancy-examples-layout.md`

## Context

`7-vacancy-examples-layout.md` put the examples in a top-level examples folder. With the stack ADR (`6-typescript-node-stack.md`) each pipeline stage is its own module. Examples are the evals of the vacancy reader only, so they belong inside its module. The vacancy reader epic (fetch, parse, output contract) needs one place to live.

## Decision

- The vacancy reader epic lives in one module, `vacancy-reader/`: fetching pages, parsing them, and the output contract.
- Examples are the module's evals and live in `vacancy-reader/examples/`.
- `vacancy-reader/examples/index.yaml` is the only metadata source. There is no per-example metadata file.

  ```yaml
  schema: 1
  sites:
    <site>:
      count: <number of examples>
      examples:
        - url: <vacancy URL>
          path: <folder relative to vacancy-reader/examples/>
          saved_at: <date>
          notes: <optional>
  ```

  - `count` equals the length of `examples`. Whoever adds an example updates it. A future script regenerates and checks the index.
  - A processed URL is found by searching `index.yaml`. A repeated URL is a duplicate example.
  - Grouped by site because rules are per site, and it shows per-site stats.
- `<site>` is the URL host without `www.`.
- Example folder: `vacancy-reader/examples/<site>/<company>-<role>/`. The name is kebab-case and readable. On a clash add `-2`. No date in the name: the date is `saved_at` in the index.
- An example folder holds only:
  - `expected.md` — the expected text, Markdown;
  - `page.html` — the HTML snapshot of the page.
- Snapshot rules:
  - The snapshot is stored so rule tests run offline and stay stable when the live page changes or disappears. The fetcher from Fetch vacancy pages with Playwright (#6) is the tool that provides snapshots. Until the tool for adding vacancy examples (#14) exists, snapshots are saved by hand by the same rules. Using the user's browser session is deferred to "Fetcher: use the user's browser session (#16)".
  - It is saved without login, or with personal data (name, email, avatar) and tokens stripped before commit. This is checked in review.
  - `<script>` and `<style>` may be stripped if the rule does not depend on them, to keep the size down.
  - No Git LFS for now.
- Vacancy text is a copy of a third-party page. Examples are committed to a public repository, so:
  - only vacancies that are publicly available without login are stored;
  - snapshots hold no personal data or tokens;
  - an example is removed on the page owner's request.
- Never commit candidate data, cookies or a browser profile.

## Consequences

- Tests of site parsing rules (site parsing rules (#10)) and of URL-to-rule matching (matching a URL to a site rule (#11)) read `vacancy-reader/examples/index.yaml`, then `page.html` and `expected.md` of each example, with no network access.
- Adding an example means adding a folder and updating `index.yaml` (entry and `count`).
- Examples are public. A removal request from a page owner means deleting the example folder and its `index.yaml` entry (and updating `count`).
- Examples are added by a tool (script + skill) that follows this layout. Until it exists, examples are added by hand by the same rules.
- `.gitattributes` keeps `vacancy-reader/examples/**` bytes unchanged.
- `7-vacancy-examples-layout.md` is superseded. A change to the layout needs a new ADR.
