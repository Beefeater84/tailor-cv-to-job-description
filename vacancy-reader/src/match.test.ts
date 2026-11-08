// Matches vacancy URLs to rule files by host: known site, other company, unknown site, other subdomain, invalid input.
import assert from "node:assert/strict";
import { test } from "node:test";
import { matchUrl } from "./match.ts";
import { rulePath } from "./rules/load.ts";

const SITE = "careers-page.com";

for (const url of [
  "https://www.careers-page.com/idelsoft/job/63674V5R",
  "https://www.careers-page.com/idelsoft/job/3W3V95WV",
  "https://careers-page.com/idelsoft/job/63674V5R",
  "https://WWW.Careers-Page.COM/idelsoft/job/63674V5R",
  "https://www.careers-page.com/idelsoft/job/63674V5R/?utm=x#apply",
  "https://www.careers-page.com/some-other-company/job/ABC123",
]) {
  test(`known site: ${url}`, async () => {
    const match = await matchUrl(url);
    assert.equal(match.site, SITE);
    assert.equal(match.rulePath, rulePath(SITE));
  });
}

test("unknown site has no rule", async () => {
  const match = await matchUrl("https://example.com/job/1");
  assert.equal(match.site, "example.com");
  assert.equal(match.rulePath, null);
});

test("other subdomain has no rule", async () => {
  const match = await matchUrl("https://jobs.careers-page.com/x/job/1");
  assert.equal(match.site, "jobs.careers-page.com");
  assert.equal(match.rulePath, null);
});

for (const value of ["ftp://careers-page.com/a", "javascript:alert(1)", "not a url", ""]) {
  test(`invalid URL: ${JSON.stringify(value)}`, async () => {
    await assert.rejects(matchUrl(value), /Invalid URL|Only http and https/);
  });
}
