// Extraction step: turns the page.html of a succeeded fetch job into vacancy.md and the validated vacancy contract
// vacancy.json with the site's rule, or with the LLM fallback when the site has no rule and an API key is configured.
import { readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { buildContract, serializeContract, validateContract } from "./contract/index.ts";
import { defaultModel, extractWithModel } from "./fallback/index.ts";
import type { VacancyModel } from "./fallback/index.ts";
import { getJob, jobDir, RUNS_DIR, writeStatus } from "./fetch/jobs.ts";
import type { ExtractionResult } from "./fetch/jobs.ts";
import { extractFields, loadRule, noRuleMessage, renderDocument, rulePath } from "./rules/index.ts";
import type { ExtractedFields, ExtractionMethod } from "./rules/types.ts";
import { siteKey } from "./site.ts";

/** Name of the extracted document in the job folder. */
export const VACANCY_FILE = "vacancy.md";

/** Name of the vacancy contract in the job folder, checked against `contract/vacancy.schema.json`. */
export const CONTRACT_FILE = "vacancy.json";

/** Options of extractJob. */
export interface ExtractOptions {
  /**
   * Model for a site without a rule. Undefined: the real model when an API key is configured.
   * Null: no fallback, a site without a rule ends as no_rule. Tests pass a fake or null.
   */
  model?: VacancyModel | null;
}

/**
 * Extracts the vacancy document of a succeeded job and records the outcome in `extraction` of status.json.
 * Writes vacancy.md and vacancy.json only on success, after the contract is validated, and removes stale ones
 * otherwise; the fetch status is never changed. `fetched_at` of the contract is the fetch's `finishedAt`, so a
 * second extraction of the same fetch writes the same bytes. An invalid contract fails the extraction.
 * A site with a rule is extracted only by its rule, also when the rule fails. A site without a rule is
 * extracted by the model (`method: llm`) when there is one; without a model the result is no_rule.
 * Throws if the job does not exist or is not succeeded (nothing is written then).
 */
export async function extractJob(
  id: string,
  runsDir: string = RUNS_DIR,
  options: ExtractOptions = {},
): Promise<ExtractionResult> {
  const job = await getJob(id, runsDir);
  if (!job) throw new Error(`Job not found: ${id}`);
  if (job.status !== "succeeded") {
    throw new Error(`Job ${id} is ${job.status}, only succeeded jobs can be extracted`);
  }

  const target = join(jobDir(id, runsDir), VACANCY_FILE);
  const contractTarget = join(jobDir(id, runsDir), CONTRACT_FILE);
  const removeFile = (path: string) =>
    unlink(path).catch((error: unknown) => {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    });
  const removeStale = async () => {
    await removeFile(target);
    await removeFile(contractTarget);
  };
  /** Validates the contract first, then writes both files; a failed write is cleaned up by the catch below. */
  const writeOutputs = async (fields: ExtractedFields, document: string, site: string, method: ExtractionMethod) => {
    if (!job.finishedAt) throw new Error(`Job ${id} has no finishedAt, the fetch time of the vacancy contract`);
    const contract = validateContract(
      buildContract(fields, { sourceUrl: job.url, site, method, fetchedAt: job.finishedAt }),
    );
    await writeFile(target, document, "utf8");
    await writeFile(contractTarget, serializeContract(contract), "utf8");
  };
  const finish = (partial: Omit<ExtractionResult, "finishedAt">): ExtractionResult => ({
    ...partial,
    finishedAt: new Date().toISOString(),
  });

  let result: ExtractionResult;
  let site: string | null = null;
  let hasRule = false;
  let method: ExtractionMethod | null = null;
  try {
    site = siteKey(new URL(job.url));
    const rule = await loadRule(site);
    hasRule = rule !== null;
    // The model is resolved only for a site without a rule: a site with a rule never uses it.
    const model = rule ? null : options.model === undefined ? defaultModel() : options.model;
    method = rule ? "rule" : model ? "llm" : null;

    if (!rule && model) {
      const html = await readFile(join(jobDir(id, runsDir), "page.html"), "utf8");
      const { fields, document } = await extractWithModel(model, html, { sourceUrl: job.url, site });
      await writeOutputs(fields, document, site, "llm");
      result = finish({
        status: "succeeded",
        site,
        rule: null,
        file: VACANCY_FILE,
        error: null,
        method: "llm",
        has_rule: false,
      });
    } else if (!rule) {
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
      // The same steps as extractDocument, keeping the fields for the contract.
      const fields = extractFields(rule, html, job.url);
      const document = renderDocument(fields, { sourceUrl: job.url, site, method: "rule" });
      await writeOutputs(fields, document, site, "rule");
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
      rule: site && method !== "llm" ? rulePath(site) : null,
      file: null,
      error: message,
      method,
      has_rule: hasRule,
    });
  }

  await writeStatus({ ...job, extraction: result }, runsDir);
  return result;
}
