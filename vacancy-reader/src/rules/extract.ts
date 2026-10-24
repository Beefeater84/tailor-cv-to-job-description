import { parseHTML } from "linkedom";
import { elementsToMarkdown } from "./markdown.ts";
import type { ExtractedFields, SiteRule } from "./types.ts";

/** Elements that never carry vacancy text; dropped from every page before the rule's own `remove`. */
export const ALWAYS_REMOVED = "script, style, noscript, template";

/** The page does not fit the rule: an invalid selector, or no description text. */
export class ExtractionError extends Error {
  override name = "ExtractionError";
}

function collapse(text: string | null): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function selectAll(document: Document, selector: string): Element[] {
  try {
    return [...document.querySelectorAll(selector)];
  } catch (error) {
    throw new ExtractionError(`Invalid selector "${selector}": ${(error as Error).message}`);
  }
}

function shortField(document: Document, selector: string | undefined): string | undefined {
  if (selector === undefined) return undefined;
  const [first] = selectAll(document, selector);
  return collapse(first?.textContent ?? null) || undefined;
}

/** Makes link targets absolute, so that the Markdown links work outside the site. */
export function resolveLinks(elements: Element[], sourceUrl: string): void {
  for (const element of elements) {
    for (const link of element.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("#")) continue;
      try {
        link.setAttribute("href", new URL(href, sourceUrl).href);
      } catch {
        // Not a URL: keep it as it is.
      }
    }
  }
}

function longField(document: Document, selector: string | undefined, sourceUrl: string): string | undefined {
  if (selector === undefined) return undefined;
  const elements = selectAll(document, selector);
  resolveLinks(elements, sourceUrl);
  return elementsToMarkdown(elements) || undefined;
}

/**
 * Runs a site rule on static page HTML and returns the extracted values.
 * Throws ExtractionError for an invalid selector or when there is no description text.
 */
export function extractFields(rule: SiteRule, html: string, sourceUrl: string): ExtractedFields {
  const { document } = parseHTML(html);
  for (const selector of [ALWAYS_REMOVED, ...(rule.remove ?? [])]) {
    for (const element of selectAll(document, selector)) element.remove();
  }

  const description = longField(document, rule.description, sourceUrl);
  if (description === undefined) {
    throw new ExtractionError(`No description text found by "${rule.description}"`);
  }
  let fields: ExtractedFields = { description };
  const title = shortField(document, rule.title);
  if (title !== undefined) fields.title = title;
  const company = shortField(document, rule.company);
  if (company !== undefined) fields.company = company;
  const hiringManager = shortField(document, rule.hiring_manager);
  if (hiringManager !== undefined) fields.hiring_manager = hiringManager;
  if (rule.tags !== undefined) {
    const tags = selectAll(document, rule.tags)
      .map((element) => collapse(element.textContent))
      .filter(Boolean);
    if (tags.length > 0) fields.tags = tags;
  }
  const companyDescription = longField(document, rule.company_description, sourceUrl);
  if (companyDescription !== undefined) fields.company_description = companyDescription;

  if (rule.postprocess) {
    fields = rule.postprocess(fields, { document, sourceUrl });
    if (typeof fields?.description !== "string" || !fields.description.trim()) {
      throw new ExtractionError("postprocess returned no description");
    }
  }
  return fields;
}
