# vacancy-reader

The vacancy reader stage of the pipeline: it takes a vacancy URL and turns it into structured vacancy data for the next stages. The module holds the whole vacancy reader epic:

- **Fetching** (available now): open a vacancy page in headless Chromium and save the rendered HTML.
- **Parsing** (planned): site rules that extract the vacancy text from the saved page.
- **Output contract** (planned): the data format the next stages read.

The stack is TypeScript on Node 24 with npm and Playwright (`specs/decisions/6-typescript-node-stack.md`). The module layout is described in `specs/decisions/6-vacancy-reader-module.md`.

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

`examples/` holds saved vacancy pages with the expected text. These are the evals for the parsing rules. `examples/index.yaml` is the only metadata source. Layout and snapshot rules: `specs/decisions/6-vacancy-reader-module.md`. Files under `examples/` are kept byte for byte and are ignored by lint and typecheck.
