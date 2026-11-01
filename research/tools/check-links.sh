#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
failed=0
checked=0
while IFS= read -r -d '' document; do
  checked=$((checked + 1))
  if ! ./node_modules/.bin/markdown-link-check --config .markdown-link-check.json "$document"; then
    failed=1
  fi
done < <(git ls-files -z -- '*.md')

if [[ "$checked" -eq 0 ]]; then
  echo 'No tracked Markdown documents found.' >&2
  exit 1
fi
echo "Checked $checked Markdown documents."
exit "$failed"
