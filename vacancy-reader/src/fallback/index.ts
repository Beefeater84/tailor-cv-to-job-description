// LLM fallback for a site without a rule: page -> model input -> structured fields -> extracted vacancy document.
import { renderDocument } from "../rules/index.ts";
import { apiKey } from "./env.ts";
import { FallbackError, parseModelFields } from "./fields.ts";
import { pageToModelInput } from "./input.ts";
import { createAnthropicModel } from "./model.ts";
import type { VacancyModel } from "./model.ts";
import { buildInstructions, buildUserMessage, readFieldsSpec } from "./prompt.ts";

export { API_KEY_VARIABLE, apiKey, loadEnv } from "./env.ts";
export { FallbackError, FIELDS_SCHEMA, parseModelFields } from "./fields.ts";
export { pageToModelInput } from "./input.ts";
export { createAnthropicModel, FALLBACK_MODEL } from "./model.ts";
export type { ModelRequest, VacancyModel } from "./model.ts";
export { buildInstructions, buildUserMessage, readFieldsSpec, wrapUntrusted } from "./prompt.ts";

/** The real model when an API key is configured, otherwise null (the fallback is off). */
export function defaultModel(): VacancyModel | null {
  const key = apiKey();
  return key ? createAnthropicModel(key) : null;
}

/** Where the page came from; written to the document front matter. */
export interface FallbackSource {
  sourceUrl: string;
  site: string;
}

/**
 * Extracts the vacancy document from page HTML with the model and renders it with `extracted_by: llm`.
 * Throws FallbackError for a page without text or an answer that does not match the schema; API errors pass through.
 */
export async function extractWithModel(model: VacancyModel, html: string, source: FallbackSource): Promise<string> {
  const input = pageToModelInput(html, source.sourceUrl);
  if (!input) throw new FallbackError("The page has no text to extract from");
  const output = await model.extract({
    instructions: buildInstructions(await readFieldsSpec()),
    message: buildUserMessage(source.sourceUrl, input),
  });
  const fields = parseModelFields(output);
  return renderDocument(fields, { ...source, method: "llm" });
}
