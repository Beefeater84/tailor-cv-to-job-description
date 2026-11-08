// Candidate profile contract: schema, reference checks and serializer.
// Cases:
// - the committed example is valid and comes back as the same object;
// - every property in the schema has a description;
// - serialization is two-space JSON with a trailing newline that parses back to the profile;
// - a missing key, an unknown key, a wrong version, a bad month, a bad day date and a wrong origin pair are rejected by the schema;
// - a duplicate id, an achievement with an unknown project, a skill with unknown evidence, an origin with an unknown
//   source and a decision with an unknown ref are rejected by the reference checks;
// - every violation of a step is listed, not only the first.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PROFILE_SCHEMA, PROFILE_VERSION, ProfileError, serializeProfile, validateProfile } from "./index.ts";

const EXAMPLE_PATH = new URL("../../contract/examples/profile.example.json", import.meta.url);
const EXAMPLE_TEXT = await readFile(EXAMPLE_PATH, "utf8");

// The example as a loosely typed object, so tests can break it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Loose = any;

function example(): Loose {
  return JSON.parse(EXAMPLE_TEXT) as Loose;
}

function violationsOf(value: unknown): string[] {
  try {
    validateProfile(value);
  } catch (error) {
    assert.ok(error instanceof ProfileError);
    assert.match(error.message, /^Candidate profile is invalid:\n- /);
    return error.violations;
  }
  assert.fail("the profile was accepted");
}

function assertRejected(value: unknown, pattern: RegExp): void {
  const violations = violationsOf(value);
  assert.ok(
    violations.some((violation) => pattern.test(violation)),
    `no violation matches ${pattern}:\n${violations.join("\n")}`,
  );
}

test("the example is valid", () => {
  const profile = example();
  assert.equal(validateProfile(profile), profile);
  assert.equal(profile.schema_version, PROFILE_VERSION);
});

test("every schema property has a description", () => {
  const missing: string[] = [];
  const walk = (node: unknown, at: string): void => {
    if (node === null || typeof node !== "object") return;
    const properties = (node as { properties?: Record<string, { description?: string }> }).properties;
    // Properties inside if/then/else only narrow the types of described properties.
    if (properties && !/\/(if|then|else)$/.test(at)) {
      for (const [key, property] of Object.entries(properties)) {
        if (!property.description) missing.push(`${at}/properties/${key}`);
      }
    }
    for (const [key, child] of Object.entries(node)) walk(child, `${at}/${key}`);
  };
  walk(PROFILE_SCHEMA, "");
  assert.deepEqual(missing, []);
});

test("serialization is two-space JSON with a trailing newline", () => {
  const profile = validateProfile(example());
  const text = serializeProfile(profile);
  assert.ok(text.endsWith("}\n"));
  assert.ok(text.startsWith('{\n  "schema_version": "1.0",'));
  assert.deepEqual(JSON.parse(text), profile);
});

test("a missing key is rejected", () => {
  const profile = example();
  delete profile.hobbies;
  delete profile.jobs[0].roles[0].duties;
  assertRejected(profile, /^\/: missing key "hobbies"$/);
  assertRejected(profile, /^\/jobs\/0\/roles\/0: missing key "duties"$/);
});

test("an unknown key is rejected", () => {
  const profile = example();
  profile.skills[0].level = "expert";
  assertRejected(profile, /^\/skills\/0: unknown key "level"$/);
});

test("a wrong version is rejected", () => {
  const profile = example();
  profile.schema_version = "2.0";
  assertRejected(profile, /^\/schema_version: must be "1\.0"$/);
});

test("a bad month and a bad day date are rejected", () => {
  const profile = example();
  profile.jobs[0].roles[1].period.start = "2021-13";
  profile.decisions[0].date = "2026-10";
  assertRejected(profile, /^\/jobs\/0\/roles\/1\/period\/start: must match pattern/);
  assertRejected(profile, /^\/decisions\/0\/date: must match format "date"$/);
});

test("an origin with the wrong fields for its kind is rejected", () => {
  const profile = example();
  profile.skills[0].origin.date = "2026-10-22";
  profile.skills[2].origin.source = "src-cv-2026";
  assertRejected(profile, /^\/skills\/0\/origin\/date: must be null$/);
  assertRejected(profile, /^\/skills\/2\/origin\/source: must be null$/);
});

test("an empty list is rejected", () => {
  const profile = example();
  profile.hobbies = [];
  assertRejected(profile, /^\/hobbies: must NOT have fewer than 1 items$/);
});

test("a duplicate id is rejected", () => {
  const profile = example();
  profile.projects[0].id = "prj-checkout";
  assertRejected(profile, /^\/projects\/0\/id: duplicate id "prj-checkout", first used at \/jobs\/0\/projects\/0\/id$/);
});

test("an achievement with an unknown project is rejected", () => {
  const profile = example();
  profile.achievements[0].project = "prj-missing";
  assertRejected(profile, /^\/achievements\/0\/project: unknown project "prj-missing"$/);
});

test("a skill with unknown evidence is rejected", () => {
  const profile = example();
  profile.skills[0].evidence.push("job-missing");
  assertRejected(profile, /^\/skills\/0\/evidence\/3: unknown job or project "job-missing"$/);
});

test("an origin with an unknown source is rejected", () => {
  const profile = example();
  profile.jobs[1].projects[0].origin.source = "src-missing";
  assertRejected(profile, /^\/jobs\/1\/projects\/0\/origin\/source: unknown source "src-missing"$/);
});

test("a decision with an unknown ref is rejected", () => {
  const profile = example();
  profile.decisions[0].refs = ["skill-graphql", "ach-missing"];
  assertRejected(profile, /^\/decisions\/0\/refs\/1: unknown id "ach-missing"$/);
});

test("every violation is listed", () => {
  const broken = example();
  delete broken.person.name;
  broken.contacts.fax = "+351";
  broken.schema_version = "1.1";
  assert.equal(violationsOf(broken).length, 3);

  const dangling = example();
  dangling.achievements[0].project = "prj-a";
  dangling.achievements[1].project = "prj-b";
  dangling.skills[1].evidence = ["prj-c"];
  dangling.decisions[0].refs = ["skill-d"];
  dangling.jobs[1].projects[0].id = "prj-checkout";
  const violations = violationsOf(dangling);
  assert.equal(violations.length, 5, violations.join("\n"));
});
