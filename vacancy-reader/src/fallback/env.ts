// Environment of the vacancy reader: `vacancy-reader/.env` fills variables the environment does not set.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";
import { MODULE_ROOT } from "../fetch/jobs.ts";

/** The optional local env file of the module; never committed. */
export const ENV_FILE = join(MODULE_ROOT, ".env");

/** Name of the variable that holds the Anthropic API key. */
export const API_KEY_VARIABLE = "ANTHROPIC_API_KEY";

/**
 * Loads `vacancy-reader/.env` into process.env if the file exists. A variable already set in the environment wins.
 * Call it once at the start of a process (CLI, worker); tests never call it.
 */
export function loadEnv(file: string = ENV_FILE): void {
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw error;
  }
  for (const [name, value] of Object.entries(parseEnv(text))) {
    if (process.env[name] === undefined) process.env[name] = value;
  }
}

/** The Anthropic API key from the environment, or null when it is not set or blank. */
export function apiKey(): string | null {
  return process.env[API_KEY_VARIABLE]?.trim() || null;
}
