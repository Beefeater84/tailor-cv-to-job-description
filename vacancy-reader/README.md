# vacancy-reader

The vacancy reader stage of the pipeline: it takes a vacancy URL and turns it into structured vacancy data for the next stages. The module holds the whole vacancy reader epic:

- **Fetching** (available now): open a vacancy page in headless Chromium and save the rendered HTML.
- **Parsing** (available now): site rules that extract the vacancy from a saved page into the extracted vacancy document. See [`rules/README.md`](rules/README.md).
- **Output contract** (planned): the data format the next stages read.

The stack is TypeScript on Node 24 with npm and Playwright (`specs/decisions/6-typescript-node-stack.md`). The module layout is described in `specs/decisions/6-vacancy-reader-module.md`.

## How the module works

A vacancy URL becomes an extracted vacancy document in these steps:

1. **URL → fetch job.** `npm run fetch -- <url>` creates a job folder `runs/<job-id>/` and starts a background worker. Reads: the URL. Writes: `runs/<job-id>/status.json`.
2. **Fetch job → `page.html`.** The worker opens the URL in headless Chromium, waits until the page has rendered and saves the rendered HTML. Writes: `runs/<job-id>/page.html`, the final `status.json` and `worker.log`. `npm run status -- <job-id>` shows when the job has reached a final status.
3. **`page.html` → site rule.** The site key is the URL host without `www.` (`careers-page.com`). The rule of the site is the file `rules/<site>.ts`: CSS selectors for the vacancy fields. A site without a rule file has no rule. `npm run match -- <url>` does this lookup for a URL (host only, see [`rules/README.md`](rules/README.md)).
4. **Site rule → extracted vacancy document.** The rule runs on the saved HTML with a static HTML parser, with no browser and no network. Short fields (title, company) become plain text, and long fields (description, company description) become Markdown. The result is Markdown with YAML front matter (`source_url`, `site`, `title`, …) and the sections `## Company` (only when the page has a company description) and `## Job description`. Reads: `page.html`, `rules/<site>.ts`. Format: [`rules/README.md`](rules/README.md) and `specs/decisions/10-site-parsing-rule-format.md`.
5. **(Planned) extracted document → output contract.** The vacancy output contract (#8) turns the extracted document into the format the writer reads.

Examples and tests: `examples/` holds saved pages (`page.html`) with their reference documents (`expected.md`). `npm test` runs step 4 on every example and compares the result with `expected.md`, and `npm run rules:check -- <site>` does the same for one site, with a diff. This is how rules are written and kept working, offline.

Available now: steps 1–2 (fetching), step 3 for a URL (`match`) and step 4 on stored examples (rules, tests, `rules:check`). Planned:

- Running steps 3–4 on a fetched job from `runs/` (no task yet).
- Vacancies from a site without a rule (#12): what happens when step 3 finds no rule.
- Tool for adding vacancy examples (#14): saving a page as a new example with a draft `expected.md`.
- Vacancy output contract (#8): step 5.
- Fetcher: use the user's browser session (#16): fetching pages that need a login.

## Setup

Run from `vacancy-reader/`:

```bash
npm ci          # install dependencies
npm run setup   # download Playwright's Chromium (once per machine)
```

Checks:

```bash
npm run typecheck
npm run lint
npm test        # run the site rules on all examples
```

## Commands

Commands are run with `tsx` straight from the TypeScript sources; there is no build step.

### `npm run fetch -- <url> [flags]`

Starts a fetch job in the background and returns at once. It prints the job id and the job folder, then exits with code 0. A detached worker process renders the page and writes the results to the job folder.

```bash
npm run fetch -- https://www.careers-page.com/idelsoft/job/3W3V95WV
# 20261024-153012-careers-page.com-a3f9
# C:\...\vacancy-reader\runs\20261024-153012-careers-page.com-a3f9
```

| Flag | Default | Meaning |
| --- | --- | --- |
| `--wait-for <selector>` | none | After the page has loaded, also wait for this CSS selector to become visible. |
| `--headed` | off | Show the browser window instead of running headless. |
| `--timeout <seconds>` | `60` | Timeout for navigation (and for `--wait-for`). |

A URL that is not `http` or `https` fails at once with a non-zero exit code, and no job is created.

The page counts as rendered after the `load` event and then network idle. The wait for network idle is capped at 10 seconds. If the cap runs out, that is not a failure: the page is kept as it is.

Each job uses its own fresh browser, with no profile and no stored cookies, so several `fetch` calls (also from different sessions) do not interfere. Using the user's browser session is deferred to "Fetcher: use the user's browser session (#16)".

### `npm run status -- <job-id>`

Prints the job's `status.json`. If the stored status is `queued` or `running` but the worker process is gone, it reports `crashed` instead. Exits with code 1 if the job does not exist.

### `npm run jobs`

Lists all jobs, newest first, one line each: `<id>  <status>  <url>`.

### `npm run match -- <url>`

Tells which site a vacancy URL belongs to and which rule file applies. It looks at the host only (lower case, `www.` stripped), does not open the page and does not run the rule.

```bash
npm run match -- https://www.careers-page.com/idelsoft/job/63674V5R
# site: careers-page.com
# rule: C:\...\vacancy-reader\rules\careers-page.com.ts

npm run match -- https://example.com/job/1
# no rule for example.com
```

| Exit code | Meaning |
| --- | --- |
| `0` | The site has a rule. It prints `site: <site>` and `rule: <absolute path>`. |
| `1` | No rule for the site ("no rule for `<site>`"), or the URL is invalid (not `http` or `https`). |
| `2` | No URL given. |

### `npm run rules:check -- <site>`

Runs the rule `rules/<site>.ts` on every example of the site from `examples/index.yaml`. For each example it prints the extracted document, then either `--- matches expected.md` or a line diff against `expected.md` (`-` expected, `+` actual, with line numbers of `expected.md`). The last line is `<n> of <m> examples pass`.

```bash
npm run rules:check -- careers-page.com
```

| Exit code | Meaning |
| --- | --- |
| `0` | All examples of the site match `expected.md`. |
| `1` | A mismatch or an extraction error, no rule for the site ("no rule for `<site>`"), or no examples of the site in `examples/index.yaml`. |
| `2` | No site given. |

This is the command an agent uses to write and fix a rule. See [`rules/README.md`](rules/README.md).

### `npm test`

Runs the rule tests with `node:test`: one test per example in `examples/index.yaml`. The test runs the site's rule on `page.html` and compares the result with `expected.md` after normalising line endings, trailing whitespace and the final newline. An example whose site has no rule is reported as `todo`, not as a failure.

## Job statuses

| Status | Meaning |
| --- | --- |
| `queued` | Job created; the worker has not started yet. |
| `running` | The worker is rendering the page. |
| `succeeded` | The page was rendered with a success response; `page.html` is saved. |
| `http_error` | The server answered 4xx or 5xx. `page.html` is still saved. |
| `timeout` | Navigation or `--wait-for` timed out. `page.html` holds whatever had loaded, if anything. |
| `failed` | Navigation or browser error (for example, DNS failure). The message is in `error`. |
| `crashed` | Reported by `status` and `jobs` only: the job is stored as `queued` or `running`, but its worker is gone (or never started within 60 seconds). |

## `runs/` layout

Jobs live in `vacancy-reader/runs/`, always relative to the module, whatever the current directory. `runs/` is gitignored and never committed.

```
runs/<job-id>/
  status.json   job state, see below
  page.html     rendered HTML (when the page could be read)
  worker.log    worker output, for debugging
```

The job id is local time + site + a random suffix, for example `20261024-153012-careers-page.com-a3f9`.

`status.json` is written atomically (a temp file, then rename), so a reader never sees partial JSON. Fields:

| Field | Meaning |
| --- | --- |
| `id` | Job id (also the folder name). |
| `url` | Requested URL. |
| `finalUrl` | URL after redirects, or `null`. |
| `httpStatus` | HTTP status of the main document, or `null`. |
| `status` | One of the job statuses above (stored values never include `crashed`). |
| `error` | Error message, or `null`. |
| `createdAt`, `startedAt`, `finishedAt` | ISO timestamps; `null` until reached. |
| `pid` | Worker process id, set when the worker starts. |
| `options` | Options used: `waitFor`, `headed`, `timeoutMs`. |

## Examples (evals)

`examples/` holds saved vacancy pages (`page.html`) with their reference extracted vacancy documents (`expected.md`, reviewed by a human; see [`rules/README.md`](rules/README.md)). These are the evals for the site parsing rules, run by `npm test` and `npm run rules:check`. `examples/index.yaml` is the only metadata source. Layout and snapshot rules: `specs/decisions/6-vacancy-reader-module.md`. Files under `examples/` are kept byte for byte and are ignored by lint and typecheck.
