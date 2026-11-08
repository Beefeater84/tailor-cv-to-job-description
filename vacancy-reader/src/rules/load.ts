import { stat } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { MODULE_ROOT } from "../fetch/jobs.ts";
import type { SiteRule } from "./types.ts";

/** Folder with one rule file per site: `rules/<site>.ts`. */
export const RULES_DIR = join(MODULE_ROOT, "rules");

/** A site key that is safe to use as a file name, e.g. `careers-page.com`. */
export const SITE_KEY_PATTERN = /^[a-z0-9][a-z0-9.-]*$/;

/** Path of the rule file of a site (the file may not exist). */
export function rulePath(site: string): string {
  return join(RULES_DIR, `${site}.ts`);
}

/** The message for a site without a rule file. */
export function noRuleMessage(site: string): string {
  return `no rule for ${site}`;
}

function isSiteRule(value: unknown): value is SiteRule {
  return typeof value === "object" && value !== null && typeof (value as SiteRule).description === "string";
}

/**
 * Loads the rule of a site from `rules/<site>.ts`, or returns null when the site has no rule.
 * Throws if the file exists but its default export is not a rule.
 */
export async function loadRule(site: string): Promise<SiteRule | null> {
  if (!SITE_KEY_PATTERN.test(site)) return null;
  const path = rulePath(site);
  try {
    await stat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  const module = (await import(pathToFileURL(path).href)) as { default?: unknown };
  if (!isSiteRule(module.default)) {
    throw new Error(`rules/${site}.ts: the default export is not a site rule (use export default defineRule({ ... }))`);
  }
  return module.default;
}
