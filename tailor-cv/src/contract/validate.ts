// Checks a value against the candidate profile contract: the schema in `contract/profile.schema.json`, then the references between objects.
import { Ajv } from "ajv";
import type { ErrorObject } from "ajv";
import addFormatsModule from "ajv-formats";
import schema from "../../contract/profile.schema.json" with { type: "json" };
import { ProfileError } from "./error.ts";
import type { CandidateProfile } from "./types.ts";

/** The JSON Schema of the candidate profile, as stored in `contract/profile.schema.json`. */
export const PROFILE_SCHEMA = schema;

// ajv-formats is CommonJS with `exports.default`; under NodeNext its default import is typed as the module.
const addFormats = addFormatsModule as unknown as typeof addFormatsModule.default;

const ajv = new Ajv({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv, ["date", "date-time", "email", "uri"]);
const check = ajv.compile<CandidateProfile>(schema);

// Composite keywords whose failure is already reported by the errors of their branches.
const SUMMARY_KEYWORDS = new Set(["if", "anyOf"]);

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

/** Ids of the profile with the path of each, in document order. */
function collectIds(profile: CandidateProfile): { id: string; at: string }[] {
  const ids: { id: string; at: string }[] = [];
  profile.meta.sources?.forEach((s, i) => ids.push({ id: s.id, at: `/meta/sources/${i}/id` }));
  profile.jobs?.forEach((job, i) => {
    ids.push({ id: job.id, at: `/jobs/${i}/id` });
    job.projects.forEach((p, j) => ids.push({ id: p.id, at: `/jobs/${i}/projects/${j}/id` }));
  });
  profile.projects?.forEach((p, i) => ids.push({ id: p.id, at: `/projects/${i}/id` }));
  profile.achievements?.forEach((a, i) => ids.push({ id: a.id, at: `/achievements/${i}/id` }));
  profile.skills?.forEach((s, i) => ids.push({ id: s.id, at: `/skills/${i}/id` }));
  profile.period_notes?.forEach((n, i) => ids.push({ id: n.id, at: `/period_notes/${i}/id` }));
  profile.decisions?.forEach((d, i) => ids.push({ id: d.id, at: `/decisions/${i}/id` }));
  return ids;
}

/** Every non-null `origin` in the profile with its path. */
function collectOrigins(value: unknown, at: string, found: { source: string | null; at: string }[]): void {
  if (Array.isArray(value)) {
    value.forEach((item, i) => collectOrigins(item, `${at}/${i}`, found));
    return;
  }
  if (value === null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (key === "origin" && child !== null && typeof child === "object") {
      found.push({ source: (child as { source: string | null }).source, at: `${at}/origin/source` });
    } else {
      collectOrigins(child, `${at}/${key}`, found);
    }
  }
}

/** Reference checks the schema cannot make: unique ids and links that point to an existing object. */
function checkReferences(profile: CandidateProfile): string[] {
  const violations: string[] = [];
  const firstAt = new Map<string, string>();
  for (const { id, at } of collectIds(profile)) {
    const first = firstAt.get(id);
    if (first === undefined) firstAt.set(id, at);
    else violations.push(`${at}: duplicate id "${id}", first used at ${first}`);
  }
  const has = (id: string, prefixes: string[]): boolean =>
    firstAt.has(id) && prefixes.some((prefix) => id.startsWith(`${prefix}-`));

  profile.achievements?.forEach((a, i) => {
    if (!has(a.project, ["prj"])) violations.push(`/achievements/${i}/project: unknown project "${a.project}"`);
  });
  profile.skills?.forEach((s, i) => {
    s.evidence?.forEach((id, j) => {
      if (!has(id, ["job", "prj"])) violations.push(`/skills/${i}/evidence/${j}: unknown job or project "${id}"`);
    });
  });
  profile.decisions?.forEach((d, i) => {
    d.refs?.forEach((id, j) => {
      if (!has(id, ["job", "prj", "ach", "skill", "note"])) violations.push(`/decisions/${i}/refs/${j}: unknown id "${id}"`);
    });
  });
  const origins: { source: string | null; at: string }[] = [];
  collectOrigins(profile, "", origins);
  for (const { source, at } of origins) {
    if (source !== null && !has(source, ["src"])) violations.push(`${at}: unknown source "${source}"`);
  }
  return violations;
}

/**
 * Validates a value against the profile contract and returns it typed.
 * First the schema (missing or unknown key, wrong version, wrong type, format or pattern), then, only when the
 * schema passes, the references: unique ids, achievement → project, skill → evidence, origin → source, decision → refs.
 * Throws ProfileError listing every violation of the failed step.
 */
export function validateProfile(value: unknown): CandidateProfile {
  if (!check(value)) {
    const errors = (check.errors ?? []).filter((error) => !SUMMARY_KEYWORDS.has(error.keyword));
    throw new ProfileError(errors.map(describe));
  }
  const violations = checkReferences(value);
  if (violations.length > 0) throw new ProfileError(violations);
  return value;
}
