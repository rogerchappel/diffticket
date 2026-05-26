import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = mkdtempSync(join(tmpdir(), "diffticket-"));

try {
  execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "smoke@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Smoke Test"], { cwd: root });
  writeFileSync(join(root, "package.json"), JSON.stringify({ scripts: { test: "node --test" } }, null, 2));
  writeFileSync(join(root, "index.js"), "console.log('hello');\n");
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-m", "initial"], { cwd: root, stdio: "ignore" });
  writeFileSync(join(root, "index.js"), "console.log('hello diff');\n");

  const output = execFileSync(process.execPath, [join(process.cwd(), "dist/src/cli.js"), "brief", "--cwd", root], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  if (!output.includes("# Diff Ticket:") || !output.includes("index.js")) {
    throw new Error(`unexpected smoke output:\n${output}`);
  }
} finally {
  rmSync(root, { recursive: true, force: true });
}
