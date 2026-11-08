// Structured output of the LLM fallback: the JSON schema sent to the model and the check of its answer.
import type { ExtractedFields } from "../rules/types.ts";

/** The model's answer does not match the field schema, or the model gave no answer. */
export class FallbackError extends Error {
  override name = "FallbackError";
}

/** JSON schema of the six extracted fields; only `description` is required. */
export const FIELDS_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Job title, plain text, one line." },
    company: { type: "string", description: "Hiring company name, plain text, one line." },
    hiring_manager: { type: "string", description: "Name of the hiring manager or recruiter, plain text." },
    tags: { type: "array", items: { type: "string" }, description: "Short labels shown for the vacancy." },
    company_description: { type: "string", description: "Text about the employer, Markdown." },
    description: { type: "string", description: "The vacancy text, Markdown." },
  },
  required: ["description"],
  additionalProperties: false,
} as const;

const SHORT_FIELDS = ["title", "company", "hiring_manager"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** An optional text field: absent, null or blank gives undefined; any other non-string is an error. */
function optionalText(output: Record<string, unknown>, key: string): string | undefined {
  const value = output[key];
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new FallbackError(`Model output: ${key} is not a string`);
  return value.trim() || undefined;
}

/**
 * Checks the model's answer against the field schema and returns the fields.
 * Keys outside the schema are dropped; blank optional values are left out.
 * Throws FallbackError when the answer is not an object, a field has the wrong type, or there is no description.
 */
export function parseModelFields(output: unknown): ExtractedFields {
  if (!isRecord(output)) throw new FallbackError("Model output is not an object");
  const description = optionalText(output, "description");
  if (description === undefined) throw new FallbackError("Model output has no description");

  const fields: ExtractedFields = { description };
  for (const key of SHORT_FIELDS) {
    // Short fields are one line, like the collapsed text of a rule.
    const value = optionalText(output, key)?.replace(/\s+/g, " ");
    if (value !== undefined) fields[key] = value;
  }
  const companyDescription = optionalText(output, "company_description");
  if (companyDescription !== undefined) fields.company_description = companyDescription;

  const tags = output.tags;
  if (tags !== undefined && tags !== null) {
    if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string")) {
      throw new FallbackError("Model output: tags is not a list of strings");
    }
    const cleaned = tags.map((tag) => tag.replace(/\s+/g, " ").trim()).filter(Boolean);
    if (cleaned.length > 0) fields.tags = cleaned;
  }
  return fields;
}
