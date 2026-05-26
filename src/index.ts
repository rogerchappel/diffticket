export { createBrief } from "./brief.js";
export { hasGitRepository, readGitDiff, repositoryName } from "./git.js";
export { readPackageInfo, scriptCommand } from "./package-info.js";
export { mergeStat, parseNameStatus } from "./parse.js";
export { detectRisks } from "./risks.js";
export { classifySurface, groupBySurface } from "./surfaces.js";
export { suggestVerification } from "./verification.js";
export type {
  ChangeStatus,
  CliOptions,
  DiffBrief,
  DiffFile,
  DiffMode,
  OutputFormat,
  RiskHint,
  RiskSeverity,
  Surface,
  SurfaceGroup,
  VerificationCommand
} from "./types.js";
