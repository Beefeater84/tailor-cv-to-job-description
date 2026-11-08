/** How an extracted vacancy document was made: by a site rule or by an LLM. */
export type ExtractionMethod = "rule" | "llm";

/** Optional fields a rule can mark as unresolved, in the canonical order of the document. */
export const UNRESOLVABLE_FIELDS = ["title", "company", "hiring_manager", "tags", "company_description"] as const;

/** Name of an optional field that can be unresolved. */
export type UnresolvableField = (typeof UNRESOLVABLE_FIELDS)[number];

/** Values extracted from a page by a site rule. Optional fields are absent when the site does not show them. */
export interface ExtractedFields {
  title?: string;
  company?: string;
  hiring_manager?: string;
  tags?: string[];
  /** Markdown. */
  company_description?: string;
  /** Markdown. */
  description: string;
  /**
   * Fields the rule tried to extract but could not confirm. Not the same as absent: an absent field that is not
   * listed is one the site does not show. Set by `extractFields` for a selector that matched nothing, and by
   * `postprocess` for a value it could not confirm. A field that has a value is never listed.
   */
  unresolved?: UnresolvableField[];
}

/** What `postprocess` gets besides the extracted values. */
export interface PostprocessContext {
  /** The parsed page, after `remove` has been applied. */
  document: Document;
  /** The vacancy URL. */
  sourceUrl: string;
}

/**
 * Declarative parsing rule of one site, stored in `rules/<site>.ts` as the default export.
 * Each field is a CSS selector. Leave out a field the site does not show.
 */
export interface SiteRule {
  /** Vacancy text. All matches are converted to Markdown and joined in document order. */
  description: string;
  /** Short text field: first match, collapsed whitespace. */
  title?: string;
  /** Short text field: first match, collapsed whitespace. */
  company?: string;
  /** Short text field: first match, collapsed whitespace. */
  hiring_manager?: string;
  /** Company text. All matches are converted to Markdown and joined in document order. */
  company_description?: string;
  /** One tag per matched element. */
  tags?: string;
  /** Selectors of elements dropped from the page before extraction. */
  remove?: string[];
  /** Fixes the extracted values where selectors are not enough. */
  postprocess?: (fields: ExtractedFields, context: PostprocessContext) => ExtractedFields;
}

/** Identity helper that types a site rule. Use as `export default defineRule({ ... })`. */
export function defineRule(rule: SiteRule): SiteRule {
  return rule;
}
