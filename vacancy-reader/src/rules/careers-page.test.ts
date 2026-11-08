// Company of the careers-page.com rule, from synthetic pages (never runs/). Cases:
// - slug is a whole word in the title, no template -> company as the title spells it
// - slug with hyphens matches words separated by spaces or hyphens
// - slug only inside another word, or not in the title -> no company, unresolved: [company]
// - og:site_name is never used
import assert from "node:assert/strict";
import { test } from "node:test";
import rule from "../../rules/careers-page.com.ts";
import { extractFields } from "./extract.ts";

function page(title: string): string {
  return `<html><head><title>${title}</title><meta property="og:site_name" content="Manatal"></head><body>
<h1 class="job-position-break">Dev</h1><main><div class="mt-5"><div class="redactor-styles"><p>Work.</p></div></div></main></body></html>`;
}

const url = (slug: string) => `https://www.careers-page.com/${slug}/job/ABC123`;

test("slug in a title without the template: company as the title spells it", () => {
  const fields = extractFields(rule, page("Dev - Acme Co LTD | Career Page"), url("acme"));
  assert.equal(fields.company, "Acme");
  assert.equal(fields.unresolved, undefined);
});

test("slug with hyphens: matches words separated by a space or a hyphen", () => {
  assert.equal(extractFields(rule, page("Dev - Big Corp | Career Page"), url("big-corp")).company, "Big Corp");
  assert.equal(extractFields(rule, page("Dev - Big-Corp | Career Page"), url("big-corp")).company, "Big-Corp");
});

test("title without the slug: no company, company unresolved", () => {
  const fields = extractFields(rule, page("Dev - REMOTE WORK - Remote Career | Career Page"), url("alljobs"));
  assert.equal(fields.company, undefined);
  assert.deepEqual(fields.unresolved, ["company"]);
});

test("slug only inside another word: company unresolved, og:site_name not used", () => {
  const fields = extractFields(rule, page("Dev - Acmex | Career Page"), url("acme"));
  assert.equal(fields.company, undefined);
  assert.deepEqual(fields.unresolved, ["company"]);
});
