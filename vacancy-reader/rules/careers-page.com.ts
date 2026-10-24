// careers-page.com: career pages hosted by Manatal.
import { defineRule } from "../src/rules/index.ts";

/** Manatal page title: "<role> - <Company> - Get Hired …". The role itself may contain " - ". */
const TITLE_TEMPLATE = /^.* - (.+?) - Get Hired\b/;

export default defineRule({
  title: "h1.job-position-break",
  description: "main div.mt-5 > div.redactor-styles",
  // No element states the company. It is taken from the <title> template, and only when
  // a second source on the page confirms it: the company slug in the URL (/<company>/job/<id>).
  postprocess(fields, { document, sourceUrl }) {
    const pageTitle = (document.querySelector("title")?.textContent ?? "").replace(/\s+/g, " ").trim();
    const company = TITLE_TEMPLATE.exec(pageTitle)?.[1]?.trim();
    const slug = new URL(sourceUrl).pathname.split("/")[1] ?? "";
    if (company && slug && company.toLowerCase() === decodeURIComponent(slug).toLowerCase()) {
      return { ...fields, company };
    }
    return fields;
  },
});
