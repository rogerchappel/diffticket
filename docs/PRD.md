# diffticket PRD

Status: in-progress

## Summary

diffticket turns a local git diff into an issue-ready change brief. It groups
changed files, extracts risk signals, lists likely test commands, and produces a
markdown or JSON ticket that agents and humans can use before review.

## Why now

Parallel agent workflows produce many small changes. Review quality improves
when every diff arrives with clear intent, touched surfaces, test evidence, and
follow-up questions. diffticket is the local-first formatter for that handoff.

## Source attribution

Inspired by public discussion of parallel coding agents and terminal-agent
review workflows in 2026. diffticket is an original change-brief generator for
local git repositories.

## Target users

- Developers preparing agent-made diffs for review.
- Maintainers triaging local changes before opening PRs.
- Agent orchestrators that need machine-readable change summaries.

## MVP

- Read `git diff --stat`, `git diff --name-status`, and optional staged diffs.
- Classify files by surface: source, tests, docs, config, CI, fixtures.
- Detect risk hints such as lockfile changes, deleted tests, package scripts,
  broad config edits, and generated artifacts.
- Suggest likely local verification commands from package metadata.
- Emit markdown and JSON.
- Include tests using fixture git diff text and a smoke against a temporary repo.

## Non-goals

- Calling LLMs.
- Opening GitHub issues.
- Semantic code review.

## CLI sketch

```bash
diffticket brief
diffticket brief --staged --format json
diffticket brief --from main --output change-ticket.md
```

## Success criteria

- The generated brief is useful without network access.
- Findings are grounded in deterministic git and file metadata.
