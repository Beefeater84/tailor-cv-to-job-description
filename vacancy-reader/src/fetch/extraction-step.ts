// Post-fetch extraction step of the worker, kept apart from worker.ts (which runs on import) so it can be tested.
import { stripVTControlCharacters } from "node:util";
import { extractJob } from "../extract.ts";
import type { ExtractOptions } from "../extract.ts";
import { readStatus, RUNS_DIR, runningExtraction, writeStatus } from "./jobs.ts";
import type { ExtractionResult } from "./jobs.ts";

/** Error text without the terminal colour codes Playwright adds to its call logs. */
export function errorMessage(error: unknown): string {
  return stripVTControlCharacters(error instanceof Error ? error.message : String(error)).trim();
}

/**
 * Runs the extraction of a succeeded job. When extractJob throws, the error is written as a `failed` extraction
 * (best effort) so it never stays `running`; the fetch status is not changed. Returns the final block.
 */
export async function runExtractionStep(
  id: string,
  runsDir: string = RUNS_DIR,
  options: ExtractOptions = {},
): Promise<ExtractionResult> {
  try {
    return await extractJob(id, runsDir, options);
  } catch (error) {
    const stored = await readStatus(id, runsDir).catch(() => null);
    const previous = stored?.extraction ?? runningExtraction();
    const failed: ExtractionResult = {
      ...previous,
      status: "failed",
      error: errorMessage(error),
      pid: process.pid,
      finishedAt: new Date().toISOString(),
    };
    if (stored) await writeStatus({ ...stored, extraction: failed }, runsDir).catch(() => {});
    return failed;
  }
}
