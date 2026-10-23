# Vacancy examples layout: `examples/vacancies/` with one `index.yaml`

Status: accepted
Date: 2026-10-23
Issue: Vacancy examples: folder and data structure (#7)
Affects: site parsing rules: format and tests (#10), matching a vacancy URL to a site rule (#11), vacancies from a site without a rule (#12); vacancy reader

## Context

`decisions/3-site-parsing-rules-from-examples.md` says an example (URL + expected text) is the test case of a site rule. It does not say where examples live, how they are named, or how to find out whether a URL was already processed. Live pages change or disappear, so a rule test cannot depend on the network.

## Decision

- Examples live in `examples/vacancies/`.
- `examples/vacancies/index.yaml` is the only metadata source. There is no per-example metadata file.

  ```yaml
  schema: 1
  sites:
    <site>:
      count: <number of examples>
      examples:
        - url: <vacancy URL>
          path: <folder relative to examples/vacancies/>
          saved_at: <date>
          notes: <optional>
  ```

  - `count` equals the length of `examples`. Whoever adds an example updates it. A future script regenerates and checks the index.
  - A processed URL is found by searching `index.yaml`. A repeated URL is a duplicate example.
  - Grouped by site because rules are per site, and it shows per-site stats.
- `<site>` is the URL host without `www.`.
- Example folder: `examples/vacancies/<site>/<company>-<role>/`. The name is kebab-case and readable. On a clash add `-2`. No date in the name: the date is `saved_at` in the index.
- An example folder holds only:
  - `expected.md` — the expected text, Markdown;
  - `page.html` — the HTML snapshot of the page.
- Snapshot rules:
  - The snapshot is stored so rule tests run offline and stay stable when the live page changes or disappears. Until the Playwright fetcher with the user's browser session (#6) exists, it is saved by hand.
  - It is saved without login, or with personal data (name, email, avatar) and tokens stripped before commit. This is checked in review.
  - `<script>` and `<style>` may be stripped if the rule does not depend on them, to keep the size down.
  - No Git LFS for now.
- Vacancy text is a copy of a third-party page. Examples are committed to a public repository, so:
  - only vacancies that are publicly available without login are stored;
  - snapshots hold no personal data or tokens;
  - an example is removed on the page owner's request.
- Never commit candidate data, cookies or a browser profile.

## Consequences

- Tests of site parsing rules (#10) and of URL-to-rule matching (#11) read `index.yaml`, then `page.html` and `expected.md` of each example, with no network access.
- Adding an example means adding a folder and updating `index.yaml` (entry and `count`).
- Examples are public. A removal request from a page owner means deleting the example folder and its `index.yaml` entry (and updating `count`).
- Examples are added by a tool (script + skill) that follows this layout. Until it exists, examples are added by hand by the same rules.
- A change to the layout needs a new ADR.
