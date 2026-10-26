// Vacancy contract: builder, serializer and validator.
// Cases:
// - each stored example with a rule (rule on page.html, fetched_at from saved_at) builds a valid contract;
// - keys come in contract order;
// - absent and blank fields become null, an empty tag list becomes null;
// - description is trimmed text, never null; an empty description is rejected;
// - serialization is two-space JSON with a trailing newline;
// - a missing key, an unknown key, a wrong version, a wrong method and a bad date-time are rejected with ContractError.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { extractFields } from "../rules/extract.ts";
import { readExamples } from "../rules/examples.ts";
import { loadRule, noRuleMessage } from "../rules/load.ts";
import { siteKey } from "../site.ts";
import { ContractError, buildContract, serializeContract, validateContract } from "./index.ts";
import type { ContractSource } from "./index.ts";

const KEY_ORDER = [
  "schema_version",
  "source_url",
  "site",
  "extracted_by",
  "fetched_at",
  "title",
  "company",
  "hiring_manager",
  "company_description",
  "tags",
  "description",
];

const SOURCE: ContractSource = {
  sourceUrl: "https://jobs.example.com/vacancy/1",
  site: "jobs.example.com",
  method: "rule",
  fetchedAt: "2026-10-23T00:00:00.000Z",
};

function validContract(): Record<string, unknown> {
  return { ...buildContract({ title: "Engineer", description: "Build things." }, SOURCE) };
}

function assertRejected(value: unknown, pattern: RegExp): void {
  assert.throws(
    () => validateContract(value),
    (error: unknown) => {
      assert.ok(error instanceof ContractError);
      assert.match(error.message, pattern);
      return true;
    },
  );
}

for (const example of await readExamples()) {
  test(`example ${example.site}: ${example.path} builds a valid contract`, async (t) => {
    const rule = await loadRule(example.site);
    if (!rule) {
      t.todo(noRuleMessage(example.site));
      return;
    }
    assert.ok(example.savedAt, "the example needs saved_at for fetched_at");
    const html = await readFile(join(example.dir, "page.html"), "utf8");
    const fields = extractFields(rule, html, example.url);
    const contract = buildContract(fields, {
      sourceUrl: example.url,
      site: siteKey(new URL(example.url)),
      method: "rule",
      fetchedAt: `${example.savedAt}T00:00:00.000Z`,
    });
    assert.deepEqual(Object.keys(contract), KEY_ORDER);
    assert.equal(validateContract(contract), contract);
    assert.equal(contract.site, example.site);
  });
}

test("keys come in contract order", () => {
  const contract = buildContract(
    {
      description: "Text",
      tags: ["Remote"],
      company_description: "About",
      hiring_manager: "Ann",
      company: "Acme",
      title: "Engineer",
    },
    SOURCE,
  );
  assert.deepEqual(Object.keys(contract), KEY_ORDER);
  assert.deepEqual(Object.keys(JSON.parse(serializeContract(contract)) as object), KEY_ORDER);
});

test("absent and blank fields are null, an empty tag list is null", () => {
  const absent = buildContract({ description: "Text" }, SOURCE);
  assert.equal(absent.title, null);
  assert.equal(absent.company, null);
  assert.equal(absent.hiring_manager, null);
  assert.equal(absent.company_description, null);
  assert.equal(absent.tags, null);
  assert.equal(validateContract(absent), absent);

  const blank = buildContract({ title: "  ", company_description: "\n", tags: [], description: "Text" }, SOURCE);
  assert.equal(blank.title, null);
  assert.equal(blank.company_description, null);
  assert.equal(blank.tags, null);
  assert.equal(validateContract(blank), blank);
});

test("description is trimmed text, never null", () => {
  const contract = buildContract({ description: "\n  Build things.\n\n" }, SOURCE);
  assert.equal(contract.description, "Build things.");
  assertRejected({ ...validContract(), description: null }, /\/description: must be string/);
  assertRejected(buildContract({ description: "   " }, SOURCE), /\/description: must NOT have fewer than 1 characters/);
});

test("an empty tag list and a blank text are rejected", () => {
  assertRejected({ ...validContract(), tags: [] }, /\/tags: must NOT have fewer than 1 items/);
  assertRejected({ ...validContract(), title: "" }, /\/title: must NOT have fewer than 1 characters/);
});

test("serialization is two-space JSON with a trailing newline", () => {
  const contract = buildContract({ title: "Engineer", tags: ["Remote"], description: "Text" }, SOURCE);
  const text = serializeContract(contract);
  assert.equal(text, `${JSON.stringify(contract, null, 2)}\n`);
  assert.ok(text.startsWith('{\n  "schema_version": "1.0",\n'));
  assert.equal(serializeContract(buildContract({ title: "Engineer", tags: ["Remote"], description: "Text" }, SOURCE)), text);
});

test("a missing key is rejected", () => {
  const value = validContract();
  delete value.tags;
  assertRejected(value, /missing key "tags"/);
});

test("an unknown key is rejected", () => {
  assertRejected({ ...validContract(), salary: "100k" }, /unknown key "salary"/);
});

test("a wrong version is rejected", () => {
  assertRejected({ ...validContract(), schema_version: "2.0" }, /\/schema_version: must be "1.0"/);
  assertRejected({ ...validContract(), schema_version: 1 }, /\/schema_version: must be "1.0"/);
});

test("a wrong method, URL and date-time are rejected, every violation is listed", () => {
  assertRejected({ ...validContract(), extracted_by: "manual" }, /\/extracted_by: must be one of \["rule","llm"\]/);
  assertRejected({ ...validContract(), fetched_at: "2026-10-23" }, /\/fetched_at: must match format "date-time"/);
  const both = { ...validContract(), source_url: "not a url", schema_version: "0.9" };
  assertRejected(both, /\/source_url: must match format "uri"/);
  assertRejected(both, /\/schema_version: must be "1\.0"/);
});

test("a value that is not an object is rejected", () => {
  assertRejected(null, /\/: must be object/);
});
