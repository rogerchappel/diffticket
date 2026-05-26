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

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

`scripts/validate.sh` runs the repository's standard local checks when they are defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing `agent-qc` is treated as a skip, not a failure.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance. Replace
the default security policy before publishing the generated repository.

These links assume this README has been copied to the generated repository root.

## License

MIT
