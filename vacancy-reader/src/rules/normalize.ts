/** Code point of the byte order mark that some editors put at the start of a file. */
const BYTE_ORDER_MARK = 0xfeff;

/**
 * Normalises a document for writing and for comparison with `expected.md`: no BOM, LF line endings,
 * no trailing whitespace on any line, exactly one final newline.
 */
export function normalizeDocument(text: string): string {
  const withoutBom = text.charCodeAt(0) === BYTE_ORDER_MARK ? text.slice(1) : text;
  const lines = withoutBom
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());
  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines.join("\n") + "\n";
}

/**
 * Line diff of two texts: unchanged lines start with two spaces,
 * lines only in `expected` with `- `, lines only in `actual` with `+ `.
 */
export function lineDiff(expected: string, actual: string): string[] {
  const a = expected.split("\n");
  const b = actual.split("\n");
  // lcs[i][j]: length of the longest common subsequence of a[i..] and b[j..].
  const lcs: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    const row = lcs[i]!;
    const next = lcs[i + 1]!;
    for (let j = b.length - 1; j >= 0; j--) {
      row[j] = a[i] === b[j] ? next[j + 1]! + 1 : Math.max(next[j]!, row[j + 1]!);
    }
  }
  const out: string[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      out.push(`  ${a[i]}`);
      i++;
      j++;
    } else if (lcs[i + 1]![j]! >= lcs[i]![j + 1]!) {
      out.push(`- ${a[i]}`);
      i++;
    } else {
      out.push(`+ ${b[j]}`);
      j++;
    }
  }
  while (i < a.length) out.push(`- ${a[i++]}`);
  while (j < b.length) out.push(`+ ${b[j++]}`);
  return out;
}

/**
 * Readable form of a lineDiff result: changed lines with `context` unchanged lines around them,
 * each line prefixed with its line number in `expected`, skipped runs shown as `...`.
 */
export function formatDiff(diff: string[], context = 2): string {
  const changed = diff.map((line) => !line.startsWith("  "));
  const shown = diff.map((_, index) => {
    for (let k = Math.max(0, index - context); k <= Math.min(diff.length - 1, index + context); k++) {
      if (changed[k]) return true;
    }
    return false;
  });
  const out: string[] = [];
  let expectedLine = 0;
  let skipped = false;
  diff.forEach((line, index) => {
    if (!line.startsWith("+ ")) expectedLine++;
    if (!shown[index]) {
      skipped = true;
      return;
    }
    if (skipped && out.length > 0) out.push("...");
    skipped = false;
    out.push(`${String(expectedLine).padStart(4)} ${line}`);
  });
  return out.join("\n");
}
