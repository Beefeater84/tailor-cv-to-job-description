# Context: #11 Match a vacancy URL to an existing site rule

## Code map

Module root: `vacancy-reader/`.

- `src/site.ts` — `siteKey(url: URL): string` — `hostname.replace(/^www\./i, "").toLowerCase()`; the only key derivation; used by `makeJobId`, `extractDocument`.
- `src/rules/load.ts` — `RULES_DIR`, `rulePath(site)`, `noRuleMessage(site)` → `"no rule for <site>"`, `loadRule(site): Promise<SiteRule|null>` — checks `SITE_KEY_PATTERN = /^[a-z0-9][a-z0-9.-]*$/` (null on mismatch), `stat`s `rules/<site>.ts` (ENOENT → null), imports and validates with `isSiteRule` (invalid export throws). File-per-host, no registry.
- `src/rules/index.ts` — barrel re-export of `src/rules/*`.
- `src/rules/examples.ts` — `readExamples()`, `Example{site,url,path,dir,savedAt,notes}`; `index.yaml` has one example `https://www.careers-page.com/idelsoft/job/3W3V95WV` under key `careers-page.com`.
- `src/fetch/jobs.ts` — `MODULE_ROOT`, `parseHttpUrl(value): URL` (http/https only, throws `Error("Invalid URL: …")`).
- `src/cli.ts` — `main(argv)`, `parseArgs`, switch over commands (`fetch`, `status`, `jobs`, `rules:check`), `USAGE` string, `checkRules(site)` helper returning an exit code.
- `rules/careers-page.com.ts` — the only rule (Manatal-hosted career pages).
- `src/rules/examples.test.ts` — the only test file (`node:test`, one test per example).

## Patterns to follow

- Small pure module — like `src/site.ts` (header comment, JSDoc on the export).
- Module with fs checks and messages — like `src/rules/load.ts`.
- Test file — like `src/rules/examples.test.ts` (`import assert from "node:assert/strict"; import { test } from "node:test";`, header comment), next to the source as `*.test.ts`.
- CLI command — like `rules:check` in `src/cli.ts`: a `case`, a `USAGE` line, a helper returning an exit code; npm script `"<name>": "tsx src/cli.ts <name>"`.
- README command section — like `### npm run rules:check -- <site>` in `vacancy-reader/README.md`.

## Conventions

- Tests: `npm test` = `tsx --test "src/**/*.test.ts"`; offline only; may rely on the committed `rules/careers-page.com.ts` and `examples/index.yaml`, never on `runs/` (gitignored).
- Imports with explicit `.ts` extensions; `import type` for types (`verbatimModuleSyntax`); strict + `noUncheckedIndexedAccess`.
- Paths derived from `MODULE_ROOT` / `RULES_DIR`, never from cwd. No config or env vars.
- Not found → `null`; invalid input → throw `Error` with a clear message; fs errors checked by `code === "ENOENT"`.
- CLI exit codes: 0 ok, 1 domain failure (incl. no rule, invalid URL), 2 usage. No-rule text comes from `noRuleMessage`.
- Site key must be the same everywhere: rule file name, `index.yaml` key, job id, `site` front matter.
- One-line header comment per file, JSDoc on exports. English only.
- `examples/` files are byte-exact; do not touch them.

## Gaps found during implementation
