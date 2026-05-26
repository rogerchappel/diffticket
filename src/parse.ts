import type { ChangeStatus, DiffFile } from "./types.js";

export function parseNameStatus(input: string): DiffFile[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseNameStatusLine);
}

function parseNameStatusLine(line: string): DiffFile {
  const [rawStatus, firstPath, secondPath] = line.split(/\t+/);
  const statusCode = rawStatus?.slice(0, 1) ?? "";
  const status = statusFromCode(statusCode);

  if (status === "renamed" || status === "copied") {
    return {
      path: secondPath ?? firstPath ?? "",
      ...(firstPath !== undefined ? { previousPath: firstPath } : {}),
      status,
      binary: false
    };
  }

  return {
    path: firstPath ?? "",
    status,
    binary: false
  };
}

export function mergeStat(files: readonly DiffFile[], stat: string): DiffFile[] {
  const counts = parseStat(stat);

  return files.map((file) => {
    const count = counts.get(file.path);
    if (!count) {
      return file;
    }

    return {
      ...file,
      additions: count.additions,
      deletions: count.deletions,
      binary: count.binary
    };
  });
}

function parseStat(input: string): Map<string, { additions: number; deletions: number; binary: boolean }> {
  const counts = new Map<string, { additions: number; deletions: number; binary: boolean }>();

  for (const line of input.split(/\r?\n/)) {
    const match = line.match(/^\s*(.+?)\s+\|\s+(.+)$/);
    if (!match) {
      continue;
    }

    const [, rawPath, rawChange] = match;
    const path = normalizeStatPath(rawPath);
    const binary = /Bin\s+\d+\s+->\s+\d+\s+bytes/.test(rawChange ?? "");
    const additions = binary ? 0 : count(rawChange, "+");
    const deletions = binary ? 0 : count(rawChange, "-");

    if (path !== undefined) {
      counts.set(path, { additions, deletions, binary });
    }
  }

  return counts;
}

function normalizeStatPath(path: string | undefined): string {
  const value = path?.trim() ?? "";
  const braceMatch = value.match(/\{(.+?) => (.+?)\}/);
  if (!braceMatch) {
    return value;
  }

  const [, before, after] = braceMatch;
  return value.replace(`{${before} => ${after}}`, after ?? "");
}

function count(value: string | undefined, char: "+" | "-"): number {
  return [...(value ?? "")].filter((item) => item === char).length;
}

function statusFromCode(code: string): ChangeStatus {
  switch (code) {
    case "A":
      return "added";
    case "C":
      return "copied";
    case "D":
      return "deleted";
    case "M":
      return "modified";
    case "R":
      return "renamed";
    case "T":
      return "typechanged";
    case "U":
      return "unmerged";
    default:
      return "unknown";
  }
}
