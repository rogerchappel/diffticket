import type { DiffFile, VerificationCommand } from "./types.js";
import type { PackageInfo } from "./package-info.js";
import { scriptCommand } from "./package-info.js";

const preferredScripts = ["check", "lint", "typecheck", "test", "build", "smoke", "package:smoke"];

export function suggestVerification(files: readonly DiffFile[], packageInfo: PackageInfo | undefined): VerificationCommand[] {
  const commands: VerificationCommand[] = [];

  if (packageInfo) {
    for (const script of preferredScripts) {
      if (packageInfo.scripts[script]) {
        commands.push({
          command: scriptCommand(packageInfo, script),
          reason: reasonForScript(script)
        });
      }
    }
  }

  if (files.some((file) => /\.(md|mdx|rst)$/.test(file.path))) {
    commands.push({
      command: "review changed documentation manually",
      reason: "Docs changed and may need human wording or link review."
    });
  }

  if (files.some((file) => file.path.startsWith(".github/workflows/"))) {
    commands.push({
      command: "review workflow changes in GitHub Actions",
      reason: "CI workflow behavior is best confirmed in the hosted runner."
    });
  }

  return dedupe(commands);
}

function reasonForScript(script: string): string {
  switch (script) {
    case "check":
    case "typecheck":
      return "Validate TypeScript and static contracts.";
    case "lint":
      return "Catch style and static analysis issues.";
    case "test":
      return "Run the project test suite.";
    case "build":
      return "Confirm distributable output can be generated.";
    case "smoke":
      return "Exercise the CLI in a realistic repository.";
    case "package:smoke":
      return "Verify publishable package contents.";
    default:
      return "Run a project-defined verification script.";
  }
}

function dedupe(commands: readonly VerificationCommand[]): VerificationCommand[] {
  const seen = new Set<string>();
  return commands.filter((command) => {
    if (seen.has(command.command)) {
      return false;
    }

    seen.add(command.command);
    return true;
  });
}
