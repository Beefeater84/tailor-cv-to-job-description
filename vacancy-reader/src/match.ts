// Matches a vacancy URL to the site rule that applies to it (by host only).
import { stat } from "node:fs/promises";
import { parseHttpUrl } from "./fetch/jobs.ts";
import { rulePath, SITE_KEY_PATTERN } from "./rules/load.ts";
import { siteKey } from "./site.ts";

/** Result of matching a URL: its site and the rule file, or null when the site has no rule. */
export interface UrlMatch {
  url: string;
  site: string;
  rulePath: string | null;
}

/**
 * Finds the rule file for the site of a vacancy URL. Does not import the rule.
 * Throws if the URL is not a valid http/https URL.
 */
export async function matchUrl(value: string): Promise<UrlMatch> {
  const url = parseHttpUrl(value);
  const site = siteKey(url);
  const result: UrlMatch = { url: url.href, site, rulePath: null };
  if (!SITE_KEY_PATTERN.test(site)) return result;
  const path = rulePath(site);
  try {
    await stat(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return result;
    throw error;
  }
  result.rulePath = path;
  return result;
}
