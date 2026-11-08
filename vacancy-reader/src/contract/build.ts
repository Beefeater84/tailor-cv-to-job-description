// Builds the vacancy contract (`vacancy.json`) from the extracted fields and serializes it.
import type { DocumentSource } from "../rules/render.ts";
import type { ExtractedFields, ExtractionMethod } from "../rules/types.ts";

/** Version of the contract this module writes, `<major>.<minor>`. */
export const CONTRACT_VERSION = "1.0";

/** Vacancy contract v1.0. Every key is always present; `null` means the page has no value. */
export interface VacancyContract {
  schema_version: typeof CONTRACT_VERSION;
  source_url: string;
  site: string;
  extracted_by: ExtractionMethod;
  /** ISO 8601 date-time of the fetch. */
  fetched_at: string;
  title: string | null;
  company: string | null;
  hiring_manager: string | null;
  /** Markdown. */
  company_description: string | null;
  /** Never an empty list. */
  tags: string[] | null;
  /** Markdown, never empty. */
  description: string;
}

/** Metadata of the contract that does not come from the page. */
export interface ContractSource extends DocumentSource {
  /** When the page was fetched, ISO 8601 date-time. Passed in by the caller so the output is deterministic. */
  fetchedAt: string;
}

/** Trimmed text, or null when absent or blank. */
function textOrNull(value: string | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

/**
 * Builds the contract from the extracted fields, with keys in contract order.
 * Absent or blank fields become `null`, an empty tag list becomes `null`; text is trimmed as in `vacancy.md`.
 * Does not validate: pass the result to `validateContract`.
 */
export function buildContract(fields: ExtractedFields, source: ContractSource): VacancyContract {
  // Insertion order is the serialized key order.
  return {
    schema_version: CONTRACT_VERSION,
    source_url: source.sourceUrl,
    site: source.site,
    extracted_by: source.method,
    fetched_at: source.fetchedAt,
    title: textOrNull(fields.title),
    company: textOrNull(fields.company),
    hiring_manager: textOrNull(fields.hiring_manager),
    company_description: textOrNull(fields.company_description),
    tags: fields.tags && fields.tags.length > 0 ? [...fields.tags] : null,
    description: fields.description.trim(),
  };
}

/** The bytes of `vacancy.json`: two-space indented JSON with a trailing newline. */
export function serializeContract(contract: VacancyContract): string {
  return `${JSON.stringify(contract, null, 2)}\n`;
}
