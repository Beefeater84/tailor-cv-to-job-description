// Site parsing rules: rule type, loading, extraction, rendering and examples.
export { defineRule } from "./types.ts";
export type { ExtractedFields, PostprocessContext, SiteRule } from "./types.ts";
export { RULES_DIR, loadRule, noRuleMessage, rulePath } from "./load.ts";
export { ExtractionError, extractFields } from "./extract.ts";
export { elementsToMarkdown } from "./markdown.ts";
export { renderDocument } from "./render.ts";
export type { DocumentSource } from "./render.ts";
export { lineDiff, normalizeDocument } from "./normalize.ts";
export { EXAMPLES_DIR, EXAMPLES_INDEX, extractDocument, listExamples, readExamples, runExample } from "./examples.ts";
export type { Example, ExampleResult } from "./examples.ts";
