import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename } from "node:path";

import type { CliOptions } from "./types.js";

export interface GitDiffText {
  readonly repository: string;
  readonly stat: string;
  readonly nameStatus: string;
}

export function readGitDiff(options: CliOptions): GitDiffText {
  const args = diffArgs(options);

  return {
    repository: repositoryName(options.cwd),
    stat: git(["diff", "--stat", ...args], options.cwd),
    nameStatus: git(["diff", "--name-status", ...args], options.cwd)
  };
}

export function repositoryName(cwd: string): string {
  try {
    const topLevel = git(["rev-parse", "--show-toplevel"], cwd).trim();
    return basename(topLevel);
  } catch {
    return basename(cwd);
  }
}

export function hasGitRepository(cwd: string): boolean {
  try {
    const gitDir = git(["rev-parse", "--git-dir"], cwd).trim();
    return gitDir.length > 0 || existsSync(".git");
  } catch {
    return false;
  }
}

function diffArgs(options: CliOptions): string[] {
  if (options.staged) {
    return ["--cached"];
  }

  if (options.from) {
    return [`${options.from}...HEAD`];
  }

  return [];
}

function git(args: readonly string[], cwd: string): string {
  return execFileSync("git", [...args], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}
