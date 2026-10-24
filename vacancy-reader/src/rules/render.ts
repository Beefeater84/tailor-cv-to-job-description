import { Document as YamlDocument, isSeq } from "yaml";
import { normalizeDocument } from "./normalize.ts";
import type { ExtractedFields, ExtractionMethod } from "./types.ts";

/** Metadata of the extracted vacancy document that does not come from the page. */
export interface DocumentSource {
  /** The vacancy URL. */
  sourceUrl: string;
  /** Site key, e.g. `careers-page.com`. */
  site: string;
  /** How the fields were extracted; written as `extracted_by`. */
  method: ExtractionMethod;
}

function frontMatter(fields: ExtractedFields, source: DocumentSource): string {
  // Insertion order is the output order.
  const data: Record<string, string | string[]> = {
    source_url: source.sourceUrl,
    site: source.site,
    extracted_by: source.method,
  };
  if (fields.title) data.title = fields.title;
  if (fields.company) data.company = fields.company;
  if (fields.hiring_manager) data.hiring_manager = fields.hiring_manager;
  if (fields.tags && fields.tags.length > 0) data.tags = fields.tags;

  const doc = new YamlDocument(data);
  const tags = doc.get("tags", true);
  if (isSeq(tags)) tags.flow = true;
  return doc.toString({ lineWidth: 0, flowCollectionPadding: false });
}

/**
 * Renders the extracted vacancy document as the site parsing rule ADR defines it:
 * YAML front matter, `## Company` (only with a company description) and `## Job description`.
 */
export function renderDocument(fields: ExtractedFields, source: DocumentSource): string {
  const parts = [`---\n${frontMatter(fields, source)}---`];
  const company = fields.company_description?.trim();
  if (company) parts.push(`## Company\n\n${company}`);
  parts.push(`## Job description\n\n${fields.description.trim()}`);
  return normalizeDocument(parts.join("\n\n"));
}
