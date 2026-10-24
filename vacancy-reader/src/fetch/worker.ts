// Detached worker: runs one fetch job and always ends it in a final status.
// Started by start.ts as: node --import tsx src/fetch/worker.ts <job-id>
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stripVTControlCharacters } from "node:util";
import { extractJob } from "../extract.ts";
import { loadEnv } from "../fallback/index.ts";
import { jobDir, readStatus, writeStatus, type JobStatus } from "./jobs.ts";
import { fetchPage, PageTimeoutError } from "./page.ts";

/** Error text without the terminal colour codes Playwright adds to its call logs. */
function errorMessage(error: unknown): string {
  return stripVTControlCharacters(error instanceof Error ? error.message : String(error)).trim();
}

async function saveHtml(id: string, html: string | null): Promise<void> {
  if (html !== null) await writeFile(join(jobDir(id), "page.html"), html, "utf8");
}

async function run(id: string): Promise<void> {
  const queued = await readStatus(id);
  if (!queued) throw new Error(`Job not found: ${id}`);
  let status: JobStatus = {
    ...queued,
    status: "running",
    pid: process.pid,
    startedAt: new Date().toISOString(),
  };
  await writeStatus(status);
  console.log(`[${status.startedAt}] fetching ${status.url}`);

  try {
    const result = await fetchPage(status.url, status.options);
    await saveHtml(id, result.html);
    const httpError = result.httpStatus !== null && result.httpStatus >= 400;
    status = {
      ...status,
      finalUrl: result.finalUrl,
      httpStatus: result.httpStatus,
      status: httpError ? "http_error" : "succeeded",
      error: httpError ? `HTTP ${result.httpStatus}` : null,
    };
  } catch (error) {
    const message = errorMessage(error);
    if (error instanceof PageTimeoutError) {
      await saveHtml(id, error.partial.html).catch(() => {});
      status = {
        ...status,
        finalUrl: error.partial.finalUrl,
        httpStatus: error.partial.httpStatus,
        status: "timeout",
        error: message,
      };
    } else {
      status = { ...status, status: "failed", error: message };
    }
  }
  status = { ...status, finishedAt: new Date().toISOString() };
  await writeStatus(status);
  console.log(`[${status.finishedAt}] ${status.status}${status.error ? `: ${status.error}` : ""}`);

  if (status.status === "succeeded") {
    // Extraction never changes the fetch status; its outcome is recorded in `extraction`.
    try {
      const extraction = await extractJob(id);
      console.log(
        `[${extraction.finishedAt}] extraction ${extraction.status}${extraction.error ? `: ${extraction.error}` : ""}`,
      );
    } catch (error) {
      console.log(`[${new Date().toISOString()}] extraction error: ${errorMessage(error)}`);
    }
  }
}

const id = process.argv[2];
if (!id) {
  console.error("Usage: worker.ts <job-id>");
  process.exit(2);
}

// The API key of the LLM fallback may come from vacancy-reader/.env; the environment wins.
// An unreadable .env only turns the fallback off: the fetch itself must still run.
try {
  loadEnv();
} catch (error) {
  console.error(`Cannot read .env: ${errorMessage(error)}`);
}
run(id).catch(async (error: unknown) => {
  console.error(error);
  // Last resort: record the failure so the job never stays "running".
  const stored = await readStatus(id).catch(() => null);
  if (stored) {
    await writeStatus({
      ...stored,
      status: "failed",
      pid: process.pid,
      error: errorMessage(error),
      finishedAt: new Date().toISOString(),
    }).catch(() => {});
  }
  process.exitCode = 1;
});
