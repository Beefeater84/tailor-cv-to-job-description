// Unresolved fields of extractFields and renderDocument. Cases:
// - selector with no match -> field listed as unresolved, in the document after tags
// - selector with a match -> not listed
// - field without a selector in the rule -> never listed
// - postprocess marks a field -> listed; marks a field that has a value -> not listed
// - postprocess marks an unknown field -> ExtractionError
// - several unresolved fields -> canonical order, no duplicates
import assert from "node:assert/strict";
import { test } from "node:test";
import { ExtractionError, extractFields } from "./extract.ts";
import { renderDocument } from "./render.ts";
import { defineRule } from "./types.ts";

const URL_ = "https://site.example/job/1";
const HTML = "<html><body><h1>Dev</h1><main><p>Work.</p></main></body></html>";
const source = { sourceUrl: URL_, site: "site.example", method: "rule" } as const;

test("selector with no match: unresolved, in the document after tags", () => {
  const rule = defineRule({ description: "main", title: "h1", company: ".company", tags: ".tag" });
  const fields = extractFields(rule, HTML, URL_);
  assert.deepEqual(fields.unresolved, ["company", "tags"]);
  assert.equal(fields.title, "Dev");
  const document = renderDocument(fields, source);
  assert.match(document, /^---\nsource_url: .*\nsite: site.example\nextracted_by: rule\ntitle: Dev\nunresolved: \[company, tags\]\n---\n/);
});

test("selector with a match: not unresolved, no key in the document", () => {
  const fields = extractFields(defineRule({ description: "main", title: "h1" }), HTML, URL_);
  assert.equal(fields.unresolved, undefined);
  assert.doesNotMatch(renderDocument(fields, source), /unresolved/);
});

test("field without a selector: never listed", () => {
  const fields = extractFields(defineRule({ description: "main" }), HTML, URL_);
  assert.equal(fields.unresolved, undefined);
});

test("postprocess marks a field it could not confirm: unresolved", () => {
  const rule = defineRule({
    description: "main",
    postprocess: (fields) => ({ ...fields, unresolved: ["company"] }),
  });
  assert.deepEqual(extractFields(rule, HTML, URL_).unresolved, ["company"]);
});

test("postprocess marks a field that ends up with a value: not listed", () => {
  const rule = defineRule({
    description: "main",
    postprocess: (fields) => ({ ...fields, company: "Acme", unresolved: ["company"] }),
  });
  const fields = extractFields(rule, HTML, URL_);
  assert.equal(fields.company, "Acme");
  assert.equal(fields.unresolved, undefined);
});

test("unresolved fields: canonical order without duplicates", () => {
  const rule = defineRule({
    description: "main",
    tags: ".tag",
    postprocess: (fields) => ({ ...fields, unresolved: ["tags", "company", "company"] }),
  });
  assert.deepEqual(extractFields(rule, HTML, URL_).unresolved, ["company", "tags"]);
});

test("postprocess marks an unknown field: ExtractionError", () => {
  const rule = defineRule({
    description: "main",
    // @ts-expect-error not a field name
    postprocess: (fields) => ({ ...fields, unresolved: ["salary"] }),
  });
  assert.throws(() => extractFields(rule, HTML, URL_), ExtractionError);
});
