import type { CliOptions, DiffBrief, DiffFile, DiffMode } from "./types.js";
import type { GitDiffText } from "./git.js";
import { readPackageInfo } from "./package-info.js";
import { mergeStat, parseNameStatus } from "./parse.js";
import { detectRisks } from "./risks.js";
import { groupBySurface } from "./surfaces.js";
import { suggestVerification } from "./verification.js";

export function createBrief(diff: GitDiffText, options: CliOptions, now = new Date()): DiffBrief {
  const files = mergeStat(parseNameStatus(diff.nameStatus), diff.stat);
  const summary = summarize(files);

  return {
    generatedAt: now.toISOString(),
    repository: diff.repository,
    mode: modeForOptions(options),
    ...(options.from ? { base: options.from } : {}),
    summary,
    surfaces: groupBySurface(files),
    risks: detectRisks(files),
    verification: suggestVerification(files, readPackageInfo(options.cwd))
  };
}

function summarize(files: readonly DiffFile[]): DiffBrief["summary"] {
  return {
    changedFiles: files.length,
    additions: files.reduce((total, file) => total + (file.additions ?? 0), 0),
    deletions: files.reduce((total, file) => total + (file.deletions ?? 0), 0),
    binaryFiles: files.filter((file) => file.binary).length
  };
}

function modeForOptions(options: CliOptions): DiffMode {
  if (options.staged) {
    return "staged";
  }

  if (options.from) {
    return "range";
  }

  return "worktree";
}
