// vacancy-reader CLI. Run with tsx, e.g. `npm run fetch -- <url>`.
import { join } from "node:path";
import { parseArgs } from "node:util";
import { getJob, jobDir, listJobs } from "./fetch/jobs.ts";
import { extractJob } from "./extract.ts";
import { matchUrl } from "./match.ts";
import { startFetchJob } from "./fetch/start.ts";
import { formatDiff, listExamples, loadRule, noRuleMessage, runExample } from "./rules/index.ts";

const USAGE = `Usage:
  cli.ts fetch <url> [--wait-for <selector>] [--headed] [--timeout <seconds>]
  cli.ts status <job-id>
  cli.ts jobs
  cli.ts match <url>
  cli.ts extract <job-id>
  cli.ts rules:check <site>`;

/** Prints each example's output and its diff against expected.md; 0 when all examples of the site pass. */
async function checkRules(site: string): Promise<number> {
  const examples = await listExamples(site);
  if (examples.length === 0) {
    console.error(`No examples for ${site} in examples/index.yaml`);
    return 1;
  }
  if (!(await loadRule(site))) {
    console.error(noRuleMessage(site));
    return 1;
  }
  let passed = 0;
  for (const example of examples) {
    const result = await runExample(example);
    console.log(`=== ${example.path} ===`);
    switch (result.status) {
      case "pass":
        console.log(result.actual);
        console.log("--- matches expected.md");
        passed++;
        break;
      case "fail":
        console.log(result.actual);
        console.log("--- differs from expected.md (- expected, + actual):");
        console.log(formatDiff(result.diff));
        break;
      case "error":
      case "todo":
        console.log(`--- error: ${result.message}`);
        break;
    }
    console.log();
  }
  console.log(`${passed} of ${examples.length} examples pass`);
  return passed === examples.length ? 0 : 1;
}

async function main(argv: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      "wait-for": { type: "string" },
      headed: { type: "boolean", default: false },
      timeout: { type: "string", default: "60" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  const [command, arg] = positionals;

  if (values.help || !command) {
    console.log(USAGE);
    return values.help ? 0 : 2;
  }

  switch (command) {
    case "fetch": {
      if (!arg) {
        console.error(USAGE);
        return 2;
      }
      const seconds = Number(values.timeout);
      if (!Number.isFinite(seconds) || seconds <= 0) {
        console.error(`Invalid --timeout: ${values.timeout}`);
        return 2;
      }
      const job = await startFetchJob(arg, {
        waitFor: values["wait-for"] ?? null,
        headed: values.headed,
        timeoutMs: Math.round(seconds * 1000),
      });
      console.log(job.id);
      console.log(jobDir(job.id));
      return 0;
    }
    case "status": {
      if (!arg) {
        console.error(USAGE);
        return 2;
      }
      const job = await getJob(arg);
      if (!job) {
        console.error(`Job not found: ${arg}`);
        return 1;
      }
      console.log(JSON.stringify(job, null, 2));
      return 0;
    }
    case "jobs": {
      for (const job of await listJobs()) {
        console.log(`${job.id}  ${job.status}  ${job.url}`);
      }
      return 0;
    }
    case "match": {
      if (!arg) {
        console.error(USAGE);
        return 2;
      }
      const match = await matchUrl(arg);
      if (!match.rulePath) {
        console.error(noRuleMessage(match.site));
        return 1;
      }
      console.log(`site: ${match.site}`);
      console.log(`rule: ${match.rulePath}`);
      return 0;
    }
    case "extract": {
      if (!arg) {
        console.error(USAGE);
        return 2;
      }
      const result = await extractJob(arg);
      if (result.status === "no_rule") {
        console.error(result.error);
        return 1;
      }
      if (result.status === "failed") {
        console.error(`Extraction failed: ${result.error}`);
        return 1;
      }
      console.log(`site: ${result.site}`);
      console.log(`rule: ${result.rule}`);
      console.log(`file: ${join(jobDir(arg), result.file ?? "vacancy.md")}`);
      return 0;
    }
    case "rules:check": {
      if (!arg) {
        console.error(USAGE);
        return 2;
      }
      return checkRules(arg);
    }
    default:
      console.error(`Unknown command: ${command}\n${USAGE}`);
      return 2;
  }
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  },
);
