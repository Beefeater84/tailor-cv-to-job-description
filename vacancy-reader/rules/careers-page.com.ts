// careers-page.com: career pages hosted by Manatal.
import { defineRule } from "../src/rules/index.ts";

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default defineRule({
  title: "h1.job-position-break",
  description: "main div.mt-5 > div.redactor-styles",
  // No element states the company, and the <title> has no fixed template. The company slug in the URL
  // (/<company>/job/<id>) is looked up in the <title> as a whole word, and the company is the text as the
  // <title> spells it. A slug that is not in the <title> leaves the company unresolved.
  postprocess(fields, { document, sourceUrl }) {
    const pageTitle = (document.querySelector("title")?.textContent ?? "").replace(/\s+/g, " ").trim();
    let slug = "";
    try {
      slug = decodeURIComponent(new URL(sourceUrl).pathname.split("/")[1] ?? "").trim();
    } catch {
      // Malformed slug: unresolved below.
    }
    if (slug) {
      const words = slug.split(/[\s-]+/).filter(Boolean).map(escapeRegExp);
      const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${words.join("[ -]")}(?![\\p{L}\\p{N}])`, "iu");
      const company = pattern.exec(pageTitle)?.[0];
      if (company) return { ...fields, company };
    }
    return { ...fields, unresolved: [...(fields.unresolved ?? []), "company"] };
  },
});
