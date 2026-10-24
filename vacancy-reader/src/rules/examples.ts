import { readFile } from "node:fs/promises";
import { join, relative, resolve, isAbsolute } from "node:path";
import { parse as parseYaml } from "yaml";
import { MODULE_ROOT } from "../fetch/jobs.ts";
import { siteKey } from "../site.ts";
import { extractFields } from "./extract.ts";
import { loadRule, noRuleMessage } from "./load.ts";
import { lineDiff, normalizeDocument } from "./normalize.ts";
import { renderDocument } from "./render.ts";
import type { SiteRule } from "./types.ts";

/** Folder with the stored example pages and their expected documents. */
export const EXAMPLES_DIR = join(MODULE_ROOT, "examples");

/** Index of all examples, grouped by site. */
export const EXAMPLES_INDEX = join(EXAMPLES_DIR, "index.yaml");

/** One stored example page from `examples/index.yaml`. */
export interface Example {
  /** Site key the example is listed under. */
  site: string;
  /** Vacancy URL; the `source_url` of the document. */
  url: string;
  /** Folder relative to `examples/`, as in the index. */
  path: string;
  /** Absolute folder with `page.html` and `expected.md`. */
  dir: string;
  savedAt: string | null;
  notes: string | null;
}

/** Outcome of running a site's rule on one example. */
export type ExampleResult =
  | { status: "todo"; example: Example; message: string }
  | { status: "pass"; example: Example; actual: string; expected: string }
  | { status: "fail"; example: Example; actual: string; expected: string; diff: string[] }
  | { status: "error"; example: Example; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalText(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function parseExample(site: string, entry: unknown, position: string): Example {
  if (!isRecord(entry) || typeof entry.url !== "string" || typeof entry.path !== "string") {
    throw new Error(`${position}: an example needs string url and path`);
  }
  const dir = resolve(EXAMPLES_DIR, entry.path);
  const inside = relative(EXAMPLES_DIR, dir);
  if (!inside || inside.startsWith("..") || isAbsolute(inside)) {
    throw new Error(`${position}: path must be a folder inside examples/: ${entry.path}`);
  }
  return {
    site,
    url: entry.url,
    path: entry.path,
    dir,
    savedAt: optionalText(entry.saved_at),
    notes: optionalText(entry.notes),
  };
}

/** Reads `examples/index.yaml` and returns all examples in index order. Throws on an invalid index. */
export async function readExamples(): Promise<Example[]> {
  const data: unknown = parseYaml(await readFile(EXAMPLES_INDEX, "utf8"));
  if (!isRecord(data) || data.schema !== 1) {
    throw new Error("examples/index.yaml: expected schema: 1");
  }
  const sites = data.sites ?? {};
  if (!isRecord(sites)) throw new Error("examples/index.yaml: sites must be a mapping");
  const examples: Example[] = [];
  for (const [site, group] of Object.entries(sites)) {
    const entries = isRecord(group) ? (group.examples ?? []) : null;
    if (!Array.isArray(entries)) throw new Error(`examples/index.yaml: sites.${site}.examples must be a list`);
    entries.forEach((entry, index) => {
      examples.push(parseExample(site, entry, `examples/index.yaml: sites.${site}.examples[${index}]`));
    });
  }
  return examples;
}

/** Examples of one site, in index order (empty when the site has none). */
export async function listExamples(site: string): Promise<Example[]> {
  return (await readExamples()).filter((example) => example.site === site);
}

/**
 * Runs a rule on static page HTML and renders the extracted vacancy document.
 * The site key comes from the URL. Throws ExtractionError when the page does not fit the rule.
 */
export function extractDocument(rule: SiteRule, html: string, sourceUrl: string): string {
  const fields = extractFields(rule, html, sourceUrl);
  return renderDocument(fields, { sourceUrl, site: siteKey(new URL(sourceUrl)), method: "rule" });
}

/**
 * Runs the rule of the example's site on its `page.html` and compares the result with `expected.md`
 * after normalisation. A site without a rule gives `todo`; a page that does not fit the rule gives `error`.
 */
export async function runExample(example: Example): Promise<ExampleResult> {
  const rule = await loadRule(example.site);
  if (!rule) return { status: "todo", example, message: noRuleMessage(example.site) };
  let actual: string;
  let expected: string;
  try {
    const html = await readFile(join(example.dir, "page.html"), "utf8");
    actual = extractDocument(rule, html, example.url);
    expected = normalizeDocument(await readFile(join(example.dir, "expected.md"), "utf8"));
  } catch (error) {
    return { status: "error", example, message: (error as Error).message };
  }
  if (actual === expected) return { status: "pass", example, actual, expected };
  return { status: "fail", example, actual, expected, diff: lineDiff(expected, actual) };
}
