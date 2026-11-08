import TurndownService from "turndown";

/** The heading level that the highest heading of a long field is shifted to. */
const TOP_HEADING_LEVEL = 3;

/** Converters keep `&nbsp;` as U+00A0; the document uses plain spaces. */
const NO_BREAK_SPACE = String.fromCharCode(0xa0);

const HEADING_TAGS =["h1", "h2", "h3", "h4", "h5", "h6"] as const;

/** Level of the highest heading inside (or being) the given elements, or null if there is none. */
function highestHeadingLevel(elements: Element[]): number | null {
  const selector = HEADING_TAGS.join(",");
  let highest: number | null = null;
  for (const element of elements) {
    const headings = [...(element.matches(selector) ? [element] : []), ...element.querySelectorAll(selector)];
    for (const heading of headings) {
      const level = Number(heading.tagName.charAt(1));
      if (highest === null || level < highest) highest = level;
    }
  }
  return highest;
}

function createConverter(headingOffset: number): TurndownService {
  const service = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    strongDelimiter: "**",
    emDelimiter: "_",
    codeBlockStyle: "fenced",
    hr: "---",
    // A plain newline: the default two-space hard break would leave trailing whitespace.
    br: "",
  });
  // Rules added with addRule take precedence over the built-in ones.
  service.addRule("shiftedHeading", {
    filter: [...HEADING_TAGS],
    replacement(content, node) {
      const text = content.trim();
      if (!text) return "";
      const level = Math.min(6, Math.max(1, Number(node.nodeName.charAt(1)) + headingOffset));
      return `\n\n${"#".repeat(level)} ${text}\n\n`;
    },
  });
  service.addRule("compactListItem", {
    filter: "li",
    replacement(content, node) {
      const parent = node.parentNode as Element | null;
      let prefix = "- ";
      if (parent?.nodeName === "OL") {
        const start = Number(parent.getAttribute("start") ?? "1");
        const index = Array.prototype.indexOf.call(parent.children, node);
        prefix = `${(Number.isFinite(start) ? start : 1) + index}. `;
      }
      const body = content
        .replace(/^\n+/, "")
        .replace(/\n+$/, "\n")
        .replace(/\n(?!$)/g, `\n${" ".repeat(prefix.length)}`);
      return prefix + body + (node.nextSibling && !body.endsWith("\n") ? "\n" : "");
    },
  });
  return service;
}

/** Cleans converter output: no non-breaking spaces, no trailing whitespace, at most one blank line in a row. */
function tidyMarkdown(markdown: string): string {
  return markdown
    .replaceAll(NO_BREAK_SPACE, " ")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Converts the given elements to one Markdown text, in the given order, separated by a blank line.
 * Headings are shifted so that the highest becomes `###`. Returns an empty string when there is no text.
 */
export function elementsToMarkdown(elements: Element[]): string {
  const highest = highestHeadingLevel(elements);
  const converter = createConverter(highest === null ? 0 : TOP_HEADING_LEVEL - highest);
  return elements
    .map((element) => tidyMarkdown(converter.turndown(element.outerHTML)))
    .filter(Boolean)
    .join("\n\n");
}
