import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";

import { createBrief, parseNameStatus } from "../src/index.js";
import type { CliOptions } from "../src/index.js";

const fixturesDir = join(process.cwd(), "test", "fixtures", "review-diff");

test("parseNameStatus handles renamed files", () => {
  assert.deepEqual(parseNameStatus("R100\told.ts\tnew.ts\n"), [
    {
      path: "new.ts",
      previousPath: "old.ts",
      status: "renamed",
      binary: false
    }
  ]);
});

test("createBrief groups surfaces and suggests verification", () => {
  const options: CliOptions = {
    command: "brief",
    staged: false,
    format: "markdown",
    cwd: process.cwd()
  };

  const brief = createBrief({
    repository: "fixture",
    nameStatus: "M\tsrc/index.ts\nM\tpackage.json\nD\ttest/old.test.ts\n",
    stat: " src/index.ts | ++\n package.json | +\n test/old.test.ts | --\n"
  }, options, new Date("2026-01-01T00:00:00.000Z"));

  assert.equal(brief.summary.changedFiles, 3);
  assert.ok(brief.surfaces.some((group) => group.surface === "source"));
  assert.ok(brief.risks.some((risk) => risk.id === "deleted-tests"));
  assert.ok(brief.risks.some((risk) => risk.id === "package-metadata"));
});

test("createBrief uses fixture-backed git diff text", async () => {
  const [nameStatus, stat] = await Promise.all([
    readFile(join(fixturesDir, "name-status.txt"), "utf8"),
    readFile(join(fixturesDir, "stat.txt"), "utf8")
  ]);
  const options: CliOptions = {
    command: "brief",
    staged: false,
    format: "markdown",
    cwd: fixturesDir
  };

  const brief = createBrief({
    repository: "fixture",
    nameStatus,
    stat
  }, options, new Date("2026-01-01T00:00:00.000Z"));

  assert.equal(brief.summary.changedFiles, 4);
  assert.equal(brief.summary.additions, 6);
  assert.equal(brief.summary.deletions, 2);
  assert.ok(brief.surfaces.some((group) => group.surface === "docs"));
  assert.ok(brief.verification.some((item) => item.command === "npm run test"));
  assert.ok(brief.verification.some((item) => item.command === "npm run build"));
});
