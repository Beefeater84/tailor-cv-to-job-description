# Plan: #11 Match a vacancy URL to an existing site rule

Issue: Match a vacancy URL to an existing site rule (#11) · Approach: https://github.com/Beefeater84/tailor-cv-to-job-description/issues/11#issuecomment-6385322874
Delivery: -
Later: -

Scope: URL → site key → rule file or none. One rule per site, key = host without `www.` (ADR `10-site-parsing-rule-format`). Matching by URL only, before the page is opened. Out of scope: running a rule on a fetched job from `runs/`, recognising URLs already stored as examples (tool for adding vacancy examples, #14), platform signatures in the page, sites without a rule (#12). No new ADR.

## Group 1: URL matcher, `match` command and tests

- Task: #11
- Goal: Given a vacancy URL, tell which site it belongs to and which rule file applies, or that there is none.
- Files:
  - `vacancy-reader/src/match.ts` (create): `matchUrl` validates the URL (http/https), derives the site key, returns the URL, the site and the path of `rules/<site>.ts` or `null`. It does not import the rule.
  - `vacancy-reader/src/match.test.ts` (create): offline `node:test` cases. Known site: `https://www.careers-page.com/idelsoft/job/63674V5R`, the URL of the stored example, without `www.`, upper-case host, with query, `#` and trailing `/`. Another company on the same site (synthetic URL). Unknown site (`example.com`). Other subdomain (`jobs.careers-page.com` → no rule). Invalid URL (not http/https, garbage) → error.
  - `vacancy-reader/src/cli.ts` (change): command `match <url>` prints site and rule file; without a rule it prints the standard no-rule message, exit code 1; invalid URL exit code 1; missing argument exit code 2.
  - `vacancy-reader/package.json` (change): script `match`.
- Reuse: `src/site.ts` (`siteKey`); `src/fetch/jobs.ts` (`parseHttpUrl`); `src/rules/load.ts` (`rulePath`, `noRuleMessage`, site key pattern, ENOENT handling).
- Done when: `npm test`, `npm run typecheck`, `npm run lint` pass; `npm run match -- https://www.careers-page.com/idelsoft/job/63674V5R` prints `careers-page.com` and the rule file, exit 0; `npm run match -- https://example.com/job/1` prints `no rule for example.com`, exit 1.
- Complexity: normal

## Group 2: Documentation

- Task: #11
- Goal: A reader knows how a vacancy URL is matched to a rule and why, from the module docs alone.
- Files:
  - `vacancy-reader/rules/README.md` (change): section "Matching a URL to a rule" with the answers to the issue's "To decide": matched by host (one rule per site); only the host is normalised (lower case, `www.` stripped; other subdomains are other sites; path, query, fragment ignored); no conflicts between rules; matching happens before the page is opened; platform signatures are not used (a platform on a company's own domain is a site without a rule, #12); recognising stored examples is left to the tool for adding vacancy examples (#14). Update its "Planned" list.
  - `vacancy-reader/README.md` (change): step 3 of "How the module works" mentions `npm run match`; "Available now" / "Planned" lists updated (running a rule on a fetched job is no longer attributed to #11); `### npm run match -- <url>` command section with an example and exit codes.
- Reuse: style of the `rules:check` command section in `vacancy-reader/README.md`.
- Done when: docs match the code (command name, output, exit codes, no-rule message); no doc still says #11 will run rules on fetched jobs.
- Complexity: normal
