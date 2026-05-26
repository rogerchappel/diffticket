#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import process from "node:process";

import { createBrief } from "./brief.js";
import { hasGitRepository, readGitDiff } from "./git.js";
import { renderJson, renderMarkdown } from "./render.js";
import type { CliOptions, OutputFormat } from "./types.js";

type MutableCliOptions = {
  -readonly [Key in keyof CliOptions]: CliOptions[Key];
};

async function main(argv: string[]): Promise<number> {
  const parsed = parseArgs(argv);
  if (parsed.help) {
    process.stdout.write(helpText());
    return 0;
  }

  if (parsed.error) {
    process.stderr.write(`${parsed.error}\n\n${helpText()}`);
    return 2;
  }

  const options = parsed.options;
  if (!hasGitRepository(options.cwd)) {
    process.stderr.write(`diffticket: not a git repository: ${options.cwd}\n`);
    return 2;
  }

  try {
    const brief = createBrief(readGitDiff(options), options);
    const rendered = options.format === "json" ? renderJson(brief) : renderMarkdown(brief);
    if (options.output) {
      await writeFile(options.output, rendered, "utf8");
    } else {
      process.stdout.write(rendered);
    }

    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`diffticket: ${message}\n`);
    return 1;
  }
}

interface ParsedArgs {
  readonly help: boolean;
  readonly options: CliOptions;
  readonly error?: string;
}

function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0];
  if (!command || command === "--help" || command === "-h") {
    return { help: true, options: defaultOptions() };
  }

  if (command !== "brief") {
    return { help: false, options: defaultOptions(), error: `Unknown command: ${command}` };
  }

  const options = defaultOptions();
  const args = argv.slice(1);

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--help" || arg === "-h") {
      return { help: true, options };
    }

    if (arg === "--staged") {
      options.staged = true;
      continue;
    }

    if (arg === "--from") {
      const value = args.shift();
      if (!value) {
        return { help: false, options, error: "--from requires a revision" };
      }

      options.from = value;
      continue;
    }

    if (arg === "--format") {
      const value = args.shift();
      if (!isFormat(value)) {
        return { help: false, options, error: "--format must be markdown or json" };
      }

      options.format = value;
      continue;
    }

    if (arg === "--output" || arg === "-o") {
      const value = args.shift();
      if (!value) {
        return { help: false, options, error: "--output requires a file path" };
      }

      options.output = value;
      continue;
    }

    if (arg === "--cwd") {
      const value = args.shift();
      if (!value) {
        return { help: false, options, error: "--cwd requires a directory" };
      }

      options.cwd = value;
      continue;
    }

    return { help: false, options, error: `Unknown option: ${arg ?? ""}` };
  }

  return { help: false, options };
}

function defaultOptions(): MutableCliOptions {
  return {
    command: "brief",
    staged: false,
    format: "markdown",
    cwd: process.cwd()
  };
}

function isFormat(value: string | undefined): value is OutputFormat {
  return value === "markdown" || value === "json";
}

function helpText(): string {
  return `Usage:
  diffticket brief [--staged] [--from REV] [--format markdown|json] [--output FILE] [--cwd DIR]

Examples:
  diffticket brief
  diffticket brief --staged --format json
  diffticket brief --from main --output change-ticket.md
`;
}

main(process.argv.slice(2)).then((exitCode) => {
  process.exitCode = exitCode;
});
