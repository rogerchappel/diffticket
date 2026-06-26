#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="${TMPDIR:-/tmp}/diffticket-demo-$$"

cleanup() {
  rm -rf "$tmp_dir"
}
trap cleanup EXIT

cd "$repo_root"
npm run build

mkdir -p "$tmp_dir/project"
cd "$tmp_dir/project"
git init --quiet
git config user.email demo@example.com
git config user.name "DiffTicket Demo"

cat > package.json <<'JSON'
{
  "name": "diffticket-demo-project",
  "version": "1.0.0",
  "scripts": {
    "build": "node src/index.js",
    "test": "node --test"
  }
}
JSON

mkdir -p src
printf 'console.log("ready")\n' > src/index.js
git add package.json src/index.js
git commit --quiet -m "Initial demo project"

printf 'console.log("ready for review")\n' > src/index.js
node "$repo_root/dist/src/cli.js" brief --cwd "$tmp_dir/project" --output "$tmp_dir/change-ticket.md"
node "$repo_root/dist/src/cli.js" brief --cwd "$tmp_dir/project" --format json --output "$tmp_dir/change-ticket.json"

test -s "$tmp_dir/change-ticket.md"
test -s "$tmp_dir/change-ticket.json"
grep -q "src/index.js" "$tmp_dir/change-ticket.md"
grep -q "verification" "$tmp_dir/change-ticket.json"

printf 'DiffTicket demo artifacts written under %s\n' "$tmp_dir"
