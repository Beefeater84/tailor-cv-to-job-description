// Model client of the LLM fallback: one Anthropic Messages API call with structured output and no tools.
// Tests use a fake VacancyModel instead and never reach the API.
import Anthropic from "@anthropic-ai/sdk";
import { FallbackError, FIELDS_SCHEMA } from "./fields.ts";

/** The model the fallback uses (see the LLM fallback ADR). */
export const FALLBACK_MODEL = "claude-haiku-5-5";

/** Output token limit of one extraction; a long vacancy text fits well below it. */
const MAX_OUTPUT_TOKENS = 16_000;

/** Time limit of one API request. */
const REQUEST_TIMEOUT_MS = 120_000;

/** One extraction request: the instructions and the user message with the wrapped page. */
export interface ModelRequest {
  instructions: string;
  message: string;
}

/** A model that returns the extracted fields as parsed JSON (not yet checked against the schema). */
export interface VacancyModel {
  extract(request: ModelRequest): Promise<unknown>;
}

/** Builds the Anthropic model client for the given API key. The request is sent only when `extract` is called. */
export function createAnthropicModel(apiKey: string): VacancyModel {
  const client = new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS });
  return {
    async extract({ instructions, message }) {
      const response = await client.messages.create({
        model: FALLBACK_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: instructions,
        messages: [{ role: "user", content: message }],
        output_config: { format: { type: "json_schema", schema: FIELDS_SCHEMA } },
      });
      if (response.stop_reason !== "end_turn") {
        throw new FallbackError(`Model stopped without a complete answer: ${response.stop_reason ?? "unknown"}`);
      }
      const text = response.content
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");
      try {
        return JSON.parse(text) as unknown;
      } catch {
        throw new FallbackError("Model output is not valid JSON");
      }
    },
  };
}
