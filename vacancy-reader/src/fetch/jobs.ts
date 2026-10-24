import { randomBytes } from "node:crypto";
import { mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { siteKey } from "../site.ts";

/** Root of the vacancy-reader module, independent of the current working directory. */
export const MODULE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

/** Folder that holds one subfolder per fetch job. */
export const RUNS_DIR = join(MODULE_ROOT, "runs");

export type JobState =
  | "queued"
  | "running"
  | "succeeded"
  | "http_error"
  | "timeout"
  | "failed"
  | "crashed";

export interface FetchOptions {
  /** CSS selector to wait for after the page has loaded, or null. */
  waitFor: string | null;
  /** Show the browser window instead of running headless. */
  headed: boolean;
  /** Overall navigation timeout in milliseconds. */
  timeoutMs: number;
}

/** Result of extracting the vacancy document from a succeeded job's page.html. */
export interface ExtractionResult {
  status: "succeeded" | "no_rule" | "failed";
  site: string | null;
  /** Absolute path of the rule file used, or null. */
  rule: string | null;
  /** File name written in the job folder (vacancy.md), or null. */
  file: string | null;
  error: string | null;
  finishedAt: string;
}

export interface JobStatus {
  id: string;
  url: string;
  finalUrl: string | null;
  httpStatus: number | null;
  status: JobState;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  pid: number | null;
  options: FetchOptions;
  /** Result of the last extraction; absent until the step has run. */
  extraction?: ExtractionResult;
}

/** A queued job whose worker has not reported in within this time is reported as crashed. */
const QUEUED_GRACE_MS = 60_000;

export function jobDir(id: string, runsDir: string = RUNS_DIR): string {
  return join(runsDir, id);
}

function statusPath(id: string, runsDir: string): string {
  return join(jobDir(id, runsDir), "status.json");
}

/** Throws if the value is not an absolute http or https URL. */
export function parseHttpUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Only http and https URLs are supported: ${value}`);
  }
  return url;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Readable unique id: local time, site and a random suffix, e.g. 20261024-153012-careers-page.com-a3f9. */
function makeJobId(url: URL, now = new Date()): string {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const site = siteKey(url).replace(/[^a-z0-9.-]/g, "-");
  return `${date}-${time}-${site}-${randomBytes(2).toString("hex")}`;
}

/** Creates the job folder with a fresh id and writes the initial queued status. */
export async function createJob(url: URL, options: FetchOptions): Promise<JobStatus> {
  await mkdir(RUNS_DIR, { recursive: true });
  for (let attempt = 0; ; attempt++) {
    const id = makeJobId(url);
    try {
      await mkdir(jobDir(id));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST" && attempt < 10) continue;
      throw error;
    }
    const status: JobStatus = {
      id,
      url: url.href,
      finalUrl: null,
      httpStatus: null,
      status: "queued",
      error: null,
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      pid: null,
      options,
    };
    await writeStatus(status);
    return status;
  }
}

/** Writes status.json atomically: a temp file in the same folder, then rename over the target. */
export async function writeStatus(status: JobStatus, runsDir: string = RUNS_DIR): Promise<void> {
  const target = statusPath(status.id, runsDir);
  const temp = `${target}.${process.pid}.${randomBytes(4).toString("hex")}.tmp`;
  await writeFile(temp, JSON.stringify(status, null, 2) + "\n", "utf8");
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(temp, target);
      return;
    } catch (error) {
      // On Windows a rename can fail briefly while another process has the target open.
      const code = (error as NodeJS.ErrnoException).code;
      if ((code === "EPERM" || code === "EACCES" || code === "EBUSY") && attempt < 20) {
        await new Promise((r) => setTimeout(r, 50));
        continue;
      }
      await unlink(temp).catch(() => {});
      throw error;
    }
  }
}

/** Reads the stored status of a job as written by the worker, or null if the job does not exist. */
export async function readStatus(id: string, runsDir: string = RUNS_DIR): Promise<JobStatus | null> {
  let text: string;
  try {
    text = await readFile(statusPath(id, runsDir), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  return JSON.parse(text) as JobStatus;
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

/** Reports a job as crashed when it is stored as queued or running but its worker is gone. */
function withCrashCheck(status: JobStatus, now = Date.now()): JobStatus {
  if (status.status !== "queued" && status.status !== "running") return status;
  const gone =
    status.pid !== null
      ? !isPidAlive(status.pid)
      : now - Date.parse(status.createdAt) > QUEUED_GRACE_MS;
  return gone ? { ...status, status: "crashed" } : status;
}

/** Current status of a job (with the crash check), or null if the job does not exist. */
export async function getJob(id: string, runsDir: string = RUNS_DIR): Promise<JobStatus | null> {
  if (!/^[\w.-]+$/.test(id)) return null;
  const status = await readStatus(id, runsDir);
  return status && withCrashCheck(status);
}

/** All jobs, newest first. Folders without a readable status.json are skipped. */
export async function listJobs(): Promise<JobStatus[]> {
  let names: string[];
  try {
    names = await readdir(RUNS_DIR);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
  const jobs: JobStatus[] = [];
  for (const name of names) {
    try {
      const status = await getJob(name);
      if (status) jobs.push(status);
    } catch {
      // Not a job folder, or a status that cannot be read: skip it.
    }
  }
  return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
}
