# Context: #10 Site parsing rules: format, how they are written and tested

## Code map

- `vacancy-reader/src/cli.ts` — `main(argv: string[]): Promise<number>` — single CLI, `node:util` `parseArgs`, `switch(command)` over `fetch|status|jobs`; returns 0 ok, 1 not found/error, 2 usage error; `USAGE` string constant; top-level catch sets `process.exitCode`. The new command `rules:check` goes here.
- `vacancy-reader/src/fetch/jobs.ts` — `MODULE_ROOT` (from `import.meta.url`, `../..`), `RUNS_DIR`, `jobDir(id)`, `parseHttpUrl(value): URL`, `makeJobId(url)` (site = hostname without `www.`, lowercased — inline, not exported), `readStatus`/`writeStatus`, `getJob`, `listJobs` (ENOENT handling pattern).
- `vacancy-reader/src/fetch/page.ts` — `fetchPage(url, options)`; source of `page.html` (`page.content()`). Not used by parsing (parsing is browser-free).
- `vacancy-reader/src/fetch/start.ts` — spawns workers with `process.execPath --import import.meta.resolve("tsx")`; the pattern if a tsx subprocess is ever needed.
- `vacancy-reader/examples/index.yaml` — `schema: 1`; `sites.<site>.{count, examples[{url, path, saved_at, notes}]}`; `path` relative to `vacancy-reader/examples/`. The only metadata source; tests enumerate examples from it. `url` is the document's `source_url`.
- `vacancy-reader/examples/careers-page.com/idelsoft-senior-frontend-performance-engineer/page.html` — 18.8 KB, LF, Manatal, server-rendered; scripts and styles not stripped (GTM, a big `<style>`).
  - `nav.navbar`, then `main` → `div.banner` with `h1.job-position-break` (title) and Apply buttons.
  - `div.container.mt-4.mb-5.px-xl-5` → breadcrumb div, then `div.mt-5` → `<h4>About the job <title></h4>` and `div.redactor-styles` (description: `h1>span` "We're hiring…", `p`, `h2` What You'll Do, `ul`, `h2` What We're Looking For, `p>strong` Must have:, `ul`, `p>strong` Nice to have:, `ul`), then an empty `<!-- Package Details -->`.
  - After it: `div.text-center` with Apply/refer/Share. `og:site_name` is "Manatal" (the platform, not the company); the company slug `idelsoft` is in the URL path and maybe in the breadcrumb.
- `vacancy-reader/examples/.../expected.md` — currently plain clipboard text (26 lines, LF, em-dashes U+2014). To be rewritten in the ADR format.
- `specs/decisions/10-site-parsing-rule-format.md` — rule format, output document, tests and the rule-writing loop. Source of truth for this task.
- `specs/decisions/6-vacancy-reader-module.md` — example layout and snapshot rules; examples are byte-preserved.

## Patterns to follow

- Lib module — like `src/fetch/jobs.ts`: named exports, exported `interface`s, JSDoc `/** */` on exports, `SCREAMING_CASE` constants with a doc comment, one sub-folder per area (`src/rules/`).
- CLI command — like the `fetch|status|jobs` cases in `src/cli.ts`, plus an npm script `"<name>": "tsx src/cli.ts <name>"`.
- Docs — like `vacancy-reader/README.md`: `###` per command, flags table, layout code block.
- Tests — none exist yet. Use `node:test` + `node:assert/strict`, run with `tsx --test`; one subtest per example, named `<site>/<example path>`.

## Conventions

- ESM (`"type": "module"`); relative imports with an explicit `.ts` extension; built-ins with the `node:` prefix.
- `verbatimModuleSyntax`: type-only imports use `import type` or inline `type`.
- tsconfig: `strict`, `noUncheckedIndexedAccess` (index/array access is `T | undefined`), `noImplicitOverride`, `noFallthroughCasesInSwitch`; `include` is `src/**/*.ts` and `eslint.config.js` only — files in `rules/` are not typechecked until `include` is extended. `lib` has `DOM` types.
- ESLint flat config, `typescript-eslint` recommended: no `any`; errors as `catch (error)` + `(error as NodeJS.ErrnoException).code`; ignores `node_modules/`, `runs/`, `examples/`, `dist/`.
- Paths always from `MODULE_ROOT`, never the cwd.
- `.gitattributes`: `vacancy-reader/examples/** -text` — files stay LF on Windows; never touch `page.html` or `index.yaml`. Write `expected.md` with LF.
- No build step; everything runs through `tsx`. Dependencies are installed per module (`cd vacancy-reader && npm ci`).
- All code, comments and docs in English.
- Commits: `feat(#10): ...` / `docs(#10): ...`, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Gaps found during implementation
