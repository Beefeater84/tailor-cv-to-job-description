// Model input of the LLM fallback: the fetched page cleaned of page furniture and converted to Markdown,
// with the schema.org JobPosting block (JSON-LD) as a hint when the page has one.
import { parseHTML } from "linkedom";
import { ALWAYS_REMOVED, elementsToMarkdown, resolveLinks } from "../rules/index.ts";

/** Maximum length of the whole model input, in characters (about 15k tokens). */
export const MAX_INPUT_CHARS = 60_000;

/** Maximum length of the JobPosting hint, in characters; the page text gets the rest. */
export const MAX_JOB_POSTING_CHARS = 20_000;

/** Marker appended to a text that was cut to its size limit. */
export const CUT_MARKER = "[... cut: the text is longer than the size limit]";

/** Elements that are never vacancy text: navigation, embedded objects, form controls and hidden elements. */
const FURNITURE = [
  "nav",
  "[role=navigation]",
  "[role=banner]",
  "[role=contentinfo]",
  "iframe",
  "svg",
  "canvas",
  "object",
  "embed",
  "input",
  "select",
  "button",
  "[hidden]",
  "[aria-hidden=true]",
  "[style*='display:none']",
  "[style*='display: none']",
  "[style*='visibility:hidden']",
  "[style*='visibility: hidden']",
].join(", ");

/** Page-level header and footer; a header or footer inside `main` or `article` may hold vacancy text. */
const PAGE_FRAME = "header, footer";
const CONTENT_ROOT = "main, article";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJobPosting(node: Record<string, unknown>): boolean {
  const type = node["@type"];
  return type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
}

/** Collects JobPosting nodes from a parsed JSON-LD value: a node, an array of nodes or a `@graph`. */
function collectJobPostings(value: unknown, found: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectJobPostings(item, found);
    return;
  }
  if (!isRecord(value)) return;
  if (isJobPosting(value)) found.push(value);
  if ("@graph" in value) collectJobPostings(value["@graph"], found);
}

function cut(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - CUT_MARKER.length - 1))}\n${CUT_MARKER}`;
}

/**
 * Returns the schema.org JobPosting nodes of the page's JSON-LD blocks as pretty JSON, or null when there are none.
 * Blocks that are not valid JSON are skipped.
 */
export function findJobPosting(document: Document): string | null {
  const found: Record<string, unknown>[] = [];
  for (const script of document.querySelectorAll("script[type='application/ld+json']")) {
    try {
      collectJobPostings(JSON.parse(script.textContent ?? ""), found);
    } catch {
      // Not valid JSON: the page text is still there.
    }
  }
  if (found.length === 0) return null;
  return JSON.stringify(found.length === 1 ? found[0] : found, null, 2);
}

/**
 * Converts a fetched page to the model input: the JobPosting hint (if the page has one) and the page text
 * as Markdown, without scripts, styles, navigation, page header and footer and hidden elements,
 * with absolute links, cut to MAX_INPUT_CHARS. Returns an empty string for a page without text.
 */
export function pageToModelInput(html: string, sourceUrl: string): string {
  const { document } = parseHTML(html);
  // Read before scripts are removed: JSON-LD lives in a script element.
  const jobPosting = findJobPosting(document);

  for (const selector of [ALWAYS_REMOVED, FURNITURE]) {
    for (const element of document.querySelectorAll(selector)) element.remove();
  }
  for (const element of document.querySelectorAll(PAGE_FRAME)) {
    if (!element.parentElement?.closest(CONTENT_ROOT)) element.remove();
  }

  const root = document.body ?? document.documentElement;
  const parts: string[] = [];
  let budget = MAX_INPUT_CHARS;
  if (jobPosting !== null) {
    const hint = `## JobPosting data from the page (JSON-LD)\n\n\`\`\`json\n${cut(jobPosting, MAX_JOB_POSTING_CHARS)}\n\`\`\``;
    parts.push(hint);
    budget -= hint.length;
  }
  if (root) {
    resolveLinks([root], sourceUrl);
    const text = elementsToMarkdown([root]);
    if (text) {
      const heading = "## Page text\n\n";
      parts.push(heading + cut(text, budget - heading.length - 2));
    }
  }
  return parts.join("\n\n");
}
