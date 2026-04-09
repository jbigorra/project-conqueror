#!/usr/bin/env bash
# Single source of truth for project validation.
# Used by: pnpm run validate, .husky/pre-commit, .husky/pre-push
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

echo "→ Building all packages..."
pnpm run build

echo "→ Running tests..."
pnpm run test

echo "→ Linting with Biome..."
pnpm run lint

echo "→ Building Storybook (charts import validation)..."
cd packages/charts && bun run build-storybook && cd ../..

echo "✓ All validations passed."
