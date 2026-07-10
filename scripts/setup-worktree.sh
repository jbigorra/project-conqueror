#!/usr/bin/env bash
# Setup a git worktree for project-conqueror.
# Initializes submodules, Python venv, installs deps, and builds.
#
# Usage:
#   scripts/setup-worktree.sh              # auto-detects worktree root
#   scripts/setup-worktree.sh /path/to/wt  # explicit worktree path

set -euo pipefail

WORKTREE_ROOT="${1:-$(git rev-parse --show-toplevel)}"

echo "Setting up worktree at: $WORKTREE_ROOT"
cd "$WORKTREE_ROOT"

# 1. Python venv for lizard-ts (via uv — no system Python required)
VENV_DIR="packages/lizard-ts/.venv"
if [ ! -d "$VENV_DIR" ]; then
  echo "→ Installing uv (portable Python manager)..."
  if ! command -v uv &>/dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
  fi
  echo "→ Creating Python venv for lizard-ts..."
  uv venv --python 3.10 "$VENV_DIR"
  VIRTUAL_ENV="$VENV_DIR" uv pip install -q -r packages/lizard-ts/requirements.txt
else
  echo "→ Python venv already exists, skipping."
fi

# 2. Install dependencies
echo "→ Installing pnpm dependencies..."
pnpm install --frozen-lockfile

# 3. Build all packages (cross-package deps need dist/)
echo "→ Building all packages..."
pnpm run build

echo "✓ Worktree ready. Run 'pnpm run test' to verify."
