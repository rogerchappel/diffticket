# diffticket

Turn local git diffs into issue-ready change briefs.

## Status

This repository is early-stage. It is local-first and deterministic: it reads
git metadata and package scripts, but does not call hosted services or LLMs.

## Install

```sh
npm install
npm run build
```

## Use

```sh
diffticket brief
diffticket brief --staged --format json
diffticket brief --from main --output change-ticket.md
```

The brief includes changed-file surfaces, churn counts, deterministic risk
hints, and likely verification commands from `package.json`.

For a reproducible demo, run the temporary change brief script:

```sh
bash demo/run-temp-change-brief.sh
```

It creates a throwaway git repository, makes one local change, emits Markdown
and JSON briefs, and checks that the expected changed file and verification
fields are present. A short recording outline is available in
[docs/promo/temp-change-brief.md](docs/promo/temp-change-brief.md).

## Limitations

- `diffticket` reads local git state. Fetch or update your base branch before
  creating briefs that depend on current remote history.
- Risk hints are deterministic review prompts, not a guarantee that a change is
  safe or complete.
- The CLI does not post to issue trackers or hosted services; copy the generated
  brief into the destination you choose.

## Verify

Run the full local release gate:

```sh
npm run release:check
```

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` runs the repository's standard local checks when they are defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing `agent-qc` is treated as a skip, not a failure.

## Development

Use the same local checks that back release readiness:

```bash
npm run check
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

Run the narrower commands while iterating, then finish with the broadest available check before opening a PR.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

diffticket reads local git metadata and package files only. It does not call
hosted services or transmit diff contents. See [SECURITY.md](SECURITY.md) for
vulnerability reporting guidance.

## Verification

Use the package scripts as the public smoke gates before publishing or changing CLI behavior.

- `npm run release:check`
- `npm run test`
- `npm run smoke`
- `npm run package:smoke`
- `npm run check`

## License

MIT
