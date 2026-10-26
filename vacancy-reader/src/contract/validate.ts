// Checks a value against the vacancy contract schema in `contract/vacancy.schema.json`.
import { Ajv } from "ajv";
import type { ErrorObject } from "ajv";
import addFormatsModule from "ajv-formats";
import schema from "../../contract/vacancy.schema.json" with { type: "json" };
import type { VacancyContract } from "./build.ts";
import { ContractError } from "./error.ts";

/** The JSON Schema of the vacancy contract, as stored in `contract/vacancy.schema.json`. */
export const CONTRACT_SCHEMA = schema;

// ajv-formats is CommonJS with `exports.default`; under NodeNext its default import is typed as the module.
const addFormats = addFormatsModule as unknown as typeof addFormatsModule.default;

const ajv = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv, ["date-time", "uri"]);
const check = ajv.compile<VacancyContract>(schema);

function describe(error: ErrorObject): string {
  const at = error.instancePath || "/";
  if (error.keyword === "additionalProperties") {
    return `${at}: unknown key "${String(error.params.additionalProperty)}"`;
  }
  if (error.keyword === "required") return `${at}: missing key "${String(error.params.missingProperty)}"`;
  if (error.keyword === "const") return `${at}: must be ${JSON.stringify(error.params.allowedValue)}`;
  if (error.keyword === "enum") return `${at}: must be one of ${JSON.stringify(error.params.allowedValues)}`;
  return `${at}: ${error.message ?? error.keyword}`;
}

/**
 * Validates a value against the contract schema and returns it typed.
 * Throws ContractError listing every violation (missing or unknown key, wrong version, wrong type or format).
 */
export function validateContract(value: unknown): VacancyContract {
  if (check(value)) return value;
  throw new ContractError((check.errors ?? []).map(describe));
}
