import { spawn } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createJob,
  jobDir,
  parseHttpUrl,
  MODULE_ROOT,
  type FetchOptions,
  type JobStatus,
} from "./jobs.ts";

const WORKER = fileURLToPath(new URL("./worker.ts", import.meta.url));

/**
 * Validates the URL, creates a job folder and starts a detached worker for it.
 * Returns at once with the queued job; the worker keeps running after this process exits.
 */
export async function startFetchJob(rawUrl: string, options: FetchOptions): Promise<JobStatus> {
  const url = parseHttpUrl(rawUrl);
  const job = await createJob(url, options);
  const log = openSync(join(jobDir(job.id), "worker.log"), "a");
  try {
    const child = spawn(process.execPath, ["--import", import.meta.resolve("tsx"), WORKER, job.id], {
      cwd: MODULE_ROOT,
      detached: true,
      windowsHide: true,
      stdio: ["ignore", log, log],
    });
    child.unref();
  } finally {
    closeSync(log);
  }
  return job;
}
