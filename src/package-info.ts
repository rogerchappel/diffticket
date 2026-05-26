import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface PackageInfo {
  readonly manager: "npm" | "pnpm" | "yarn" | "bun";
  readonly scripts: Readonly<Record<string, string>>;
}

export function readPackageInfo(cwd: string): PackageInfo | undefined {
  try {
    const packageJson = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as { scripts?: Record<string, string> };
    return {
      manager: detectPackageManager(cwd),
      scripts: packageJson.scripts ?? {}
    };
  } catch {
    return undefined;
  }
}

function detectPackageManager(cwd: string): PackageInfo["manager"] {
  const exists = (file: string): boolean => {
    try {
      readFileSync(join(cwd, file));
      return true;
    } catch {
      return false;
    }
  };

  if (exists("pnpm-lock.yaml")) {
    return "pnpm";
  }

  if (exists("yarn.lock")) {
    return "yarn";
  }

  if (exists("bun.lock")) {
    return "bun";
  }

  return "npm";
}

export function scriptCommand(packageInfo: PackageInfo, script: string): string {
  if (packageInfo.manager === "npm") {
    return `npm run ${script}`;
  }

  if (packageInfo.manager === "yarn") {
    return `yarn ${script}`;
  }

  if (packageInfo.manager === "bun") {
    return `bun run ${script}`;
  }

  return `pnpm ${script}`;
}
