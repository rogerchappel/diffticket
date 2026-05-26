# diffticket Orchestration

`diffticket` is a local CLI for preparing review handoff packets from git
diffs. It performs no network calls and does not mutate the repository unless
`--output` is used.

## Pipeline

1. Read `git diff --name-status` and `git diff --stat`.
2. Merge file status and churn data.
3. Group files by review surface.
4. Detect risk hints from deterministic file metadata.
5. Suggest local verification commands from package scripts.
6. Render markdown or JSON.

## Checks

```sh
npm run check
npm test
npm run smoke
npm run package:smoke
```
