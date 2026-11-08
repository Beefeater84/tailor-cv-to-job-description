import { chromium, errors } from "playwright";
import type { FetchOptions } from "./jobs.ts";

/** How long to wait for network idle after `load`. Running out is not a failure. */
const NETWORK_IDLE_CAP_MS = 10_000;

export interface PageResult {
  /** Rendered HTML, or null if the page could not be read. */
  html: string | null;
  finalUrl: string | null;
  httpStatus: number | null;
}

/** Navigation or selector timeout. Carries whatever the page had at that moment. */
export class PageTimeoutError extends Error {
  readonly partial: PageResult;

  constructor(message: string, partial: PageResult) {
    super(message);
    this.name = "PageTimeoutError";
    this.partial = partial;
  }
}

/**
 * Opens the URL in a fresh Chromium (no profile, no stored cookies) and returns the rendered page.
 * Rendered means: `load`, then network idle for up to NETWORK_IDLE_CAP_MS, then the optional selector.
 * Throws PageTimeoutError on a navigation or selector timeout, and any other error as is.
 * The browser is always closed.
 */
export async function fetchPage(url: string, options: FetchOptions): Promise<PageResult> {
  const browser = await chromium.launch({ headless: !options.headed });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    let httpStatus: number | null = null;
    try {
      const response = await page.goto(url, { waitUntil: "load", timeout: options.timeoutMs });
      httpStatus = response?.status() ?? null;
      try {
        await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_CAP_MS });
      } catch (error) {
        if (!(error instanceof errors.TimeoutError)) throw error;
      }
      if (options.waitFor) {
        await page.waitForSelector(options.waitFor, { timeout: options.timeoutMs });
      }
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        const html = await page.content().catch(() => null);
        throw new PageTimeoutError(error.message, { html, finalUrl: page.url(), httpStatus });
      }
      throw error;
    }
    return { html: await page.content(), finalUrl: page.url(), httpStatus };
  } finally {
    await browser.close().catch(() => {});
  }
}
