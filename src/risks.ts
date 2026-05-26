import type { DiffFile, RiskHint } from "./types.js";

export function detectRisks(files: readonly DiffFile[]): RiskHint[] {
  return [
    lockfileRisk(files),
    deletedTestsRisk(files),
    packageScriptsRisk(files),
    broadConfigRisk(files),
    generatedArtifactRisk(files),
    binaryRisk(files)
  ].filter((risk): risk is RiskHint => risk !== undefined);
}

function lockfileRisk(files: readonly DiffFile[]): RiskHint | undefined {
  const lockfiles = files.filter((file) => /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lock)$/.test(file.path));
  if (lockfiles.length === 0) {
    return undefined;
  }

  return {
    id: "lockfile-change",
    title: "Lockfile changed",
    severity: "medium",
    detail: "Dependency resolution changed; package install and test commands should be re-run.",
    files: lockfiles.map((file) => file.path)
  };
}

function deletedTestsRisk(files: readonly DiffFile[]): RiskHint | undefined {
  const deletedTests = files.filter((file) => file.status === "deleted" && /(^|\/)(__tests__|test|tests|spec)\/|(\.test|\.spec)\./.test(file.path));
  if (deletedTests.length === 0) {
    return undefined;
  }

  return {
    id: "deleted-tests",
    title: "Tests were deleted",
    severity: "high",
    detail: "Deleted test coverage may hide behavior changes; reviewers should confirm equivalent coverage remains.",
    files: deletedTests.map((file) => file.path)
  };
}

function packageScriptsRisk(files: readonly DiffFile[]): RiskHint | undefined {
  const packageFiles = files.filter((file) => /(^|\/)package\.json$/.test(file.path));
  if (packageFiles.length === 0) {
    return undefined;
  }

  return {
    id: "package-metadata",
    title: "Package metadata changed",
    severity: "medium",
    detail: "Package scripts, exports, or runtime metadata may have changed; run build and package smoke checks.",
    files: packageFiles.map((file) => file.path)
  };
}

function broadConfigRisk(files: readonly DiffFile[]): RiskHint | undefined {
  const configFiles = files.filter((file) => isConfig(file.path));
  if (configFiles.length < 3) {
    return undefined;
  }

  return {
    id: "broad-config",
    title: "Multiple config files changed",
    severity: "medium",
    detail: "Several configuration files changed together; watch for toolchain or CI behavior drift.",
    files: configFiles.map((file) => file.path)
  };
}

function generatedArtifactRisk(files: readonly DiffFile[]): RiskHint | undefined {
  const generatedFiles = files.filter((file) => /(^|\/)(dist|build|coverage|generated)\//.test(file.path) || /\.min\.(js|css)$/.test(file.path));
  if (generatedFiles.length === 0) {
    return undefined;
  }

  return {
    id: "generated-artifacts",
    title: "Generated artifacts changed",
    severity: "low",
    detail: "Generated output changed; verify it was produced by the documented build.",
    files: generatedFiles.map((file) => file.path)
  };
}

function binaryRisk(files: readonly DiffFile[]): RiskHint | undefined {
  const binaryFiles = files.filter((file) => file.binary);
  if (binaryFiles.length === 0) {
    return undefined;
  }

  return {
    id: "binary-files",
    title: "Binary files changed",
    severity: "medium",
    detail: "Binary diffs are hard to review; confirm provenance and size are expected.",
    files: binaryFiles.map((file) => file.path)
  };
}

function isConfig(path: string): boolean {
  return /(^|\/)(tsconfig|eslint|prettier|biome|vite|webpack|rollup|jest|vitest|releasebox|dependabot)/.test(path.toLowerCase()) || /\.(json|ya?ml|toml|ini)$/.test(path.toLowerCase());
}
