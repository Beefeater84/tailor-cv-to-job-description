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
