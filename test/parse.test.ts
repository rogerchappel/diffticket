import assert from "node:assert/strict";
import { test } from "node:test";

import { createBrief, parseNameStatus } from "../src/index.js";
import type { CliOptions } from "../src/index.js";

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
