#!/usr/bin/env bash
set -euo pipefail

msg="${npm_config_msg:-chore: pre-release changes}"
prepack_msg="${npm_config_prepack_msg:-${msg} (prepack)}"

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$msg"
fi

pnpm prepack

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$prepack_msg"
fi

git push origin main

current_version="$(node -p "require('./package.json').version")"
if [[ ! "$current_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Unsupported version format: $current_version"
  exit 1
fi

IFS='.' read -r major minor patch <<< "$current_version"
next_version="$major.$minor.$((patch + 1))"

while git rev-parse -q --verify "refs/tags/v$next_version" >/dev/null; do
  patch=$((patch + 1))
  next_version="$major.$minor.$((patch + 1))"
done

pnpm version "$next_version"
git push origin main --follow-tags
