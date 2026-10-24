// Extraction step: turns the page.html of a succeeded fetch job into vacancy.md with the site's rule.
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getJob, jobDir, RUNS_DIR, writeStatus } from "./fetch/jobs.ts";
import type { ExtractionResult } from "./fetch/jobs.ts";
import { extractDocument, loadRule, noRuleMessage, rulePath } from "./rules/index.ts";
import { siteKey } from "./site.ts";

/** Name of the extracted document in the job folder. */
export const VACANCY_FILE = "vacancy.md";

/**
 * Extracts the vacancy document of a succeeded job and records the outcome in `extraction` of status.json.
 * Writes vacancy.md only on success and removes a stale one otherwise; the fetch status is never changed.
 * Throws if the job does not exist or is not succeeded (nothing is written then).
 */
export async function extractJob(id: string, runsDir: string = RUNS_DIR): Promise<ExtractionResult> {
  const job = await getJob(id, runsDir);
  if (!job) throw new Error(`Job not found: ${id}`);
  if (job.status !== "succeeded") {
    throw new Error(`Job ${id} is ${job.status}, only succeeded jobs can be extracted`);
  }

  const target = join(jobDir(id, runsDir), VACANCY_FILE);
  const removeStale = () =>
    unlink(target).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  const finish = (partial: Omit<ExtractionResult, "finishedAt">): ExtractionResult => ({
    ...partial,
    finishedAt: new Date().toISOString(),
  });

  let result: ExtractionResult;
  let site: string | null = null;
  let hasRule = false;
  try {
    site = siteKey(new URL(job.url));
    const rule = await loadRule(site);
    hasRule = rule !== null;
    if (!rule) {
      await removeStale();
      result = finish({
        status: "no_rule",
        site,
        rule: null,
        file: null,
        error: noRuleMessage(site),
        method: null,
        has_rule: false,
      });
    } else {
      const html = await readFile(join(jobDir(id, runsDir), "page.html"), "utf8");
      const document = extractDocument(rule, html, job.url);
      await writeFile(target, document, "utf8");
      result = finish({
        status: "succeeded",
        site,
        rule: rulePath(site),
        file: VACANCY_FILE,
        error: null,
        method: "rule",
        has_rule: true,
      });
    }
  } catch (error) {
    await removeStale();
    const message = error instanceof Error ? error.message : String(error);
    result = finish({
      status: "failed",
      site,
      rule: site ? rulePath(site) : null,
      file: null,
      error: message,
      method: hasRule ? "rule" : null,
      has_rule: hasRule,
    });
  }

  await writeStatus({ ...job, extraction: result }, runsDir);
  return result;
}
