import type { DiffBrief } from "./types.js";

export function renderJson(brief: DiffBrief): string {
  return `${JSON.stringify(brief, null, 2)}\n`;
}

export function renderMarkdown(brief: DiffBrief): string {
  const lines = [
    `# Diff Ticket: ${brief.repository}`,
    "",
    `Generated: ${brief.generatedAt}`,
    `Mode: ${brief.mode}${brief.base ? ` from ${brief.base}` : ""}`,
    "",
    "## Summary",
    "",
    `- Changed files: ${brief.summary.changedFiles}`,
    `- Additions: ${brief.summary.additions}`,
    `- Deletions: ${brief.summary.deletions}`,
    `- Binary files: ${brief.summary.binaryFiles}`,
    "",
    "## Surfaces"
  ];

  for (const group of brief.surfaces) {
    lines.push("", `### ${group.surface}`);
    for (const file of group.files) {
      const churn = file.additions === undefined && file.deletions === undefined
        ? ""
        : ` (+${file.additions ?? 0}/-${file.deletions ?? 0})`;
      lines.push(`- ${file.status}: ${file.path}${churn}`);
    }
  }

  lines.push("", "## Risk Hints");
  if (brief.risks.length === 0) {
    lines.push("", "- None detected.");
  } else {
    for (const risk of brief.risks) {
      lines.push("", `- **${risk.severity}** ${risk.title}: ${risk.detail}`);
      lines.push(`  Files: ${risk.files.join(", ")}`);
    }
  }

  lines.push("", "## Verification");
  if (brief.verification.length === 0) {
    lines.push("", "- No project scripts detected.");
  } else {
    for (const command of brief.verification) {
      lines.push("", `- \`${command.command}\` - ${command.reason}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
