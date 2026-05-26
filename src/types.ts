export type DiffMode = "worktree" | "staged" | "range";

export type OutputFormat = "markdown" | "json";

export type ChangeStatus =
  | "added"
  | "copied"
  | "deleted"
  | "modified"
  | "renamed"
  | "typechanged"
  | "unmerged"
  | "unknown";

export type Surface =
  | "source"
  | "tests"
  | "docs"
  | "config"
  | "ci"
  | "fixtures"
  | "package"
  | "generated"
  | "unknown";

export type RiskSeverity = "low" | "medium" | "high";

export interface CliOptions {
  readonly command: "brief";
  readonly staged: boolean;
  readonly from?: string;
  readonly output?: string;
  readonly format: OutputFormat;
  readonly cwd: string;
}

export interface DiffFile {
  readonly path: string;
  readonly previousPath?: string;
  readonly status: ChangeStatus;
  readonly additions?: number;
  readonly deletions?: number;
  readonly binary: boolean;
}

export interface SurfaceGroup {
  readonly surface: Surface;
  readonly files: readonly DiffFile[];
}

export interface RiskHint {
  readonly id: string;
  readonly title: string;
  readonly severity: RiskSeverity;
  readonly detail: string;
  readonly files: readonly string[];
}

export interface VerificationCommand {
  readonly command: string;
  readonly reason: string;
}

export interface DiffBrief {
  readonly generatedAt: string;
  readonly repository: string;
  readonly mode: DiffMode;
  readonly base?: string;
  readonly summary: {
    readonly changedFiles: number;
    readonly additions: number;
    readonly deletions: number;
    readonly binaryFiles: number;
  };
  readonly surfaces: readonly SurfaceGroup[];
  readonly risks: readonly RiskHint[];
  readonly verification: readonly VerificationCommand[];
}
