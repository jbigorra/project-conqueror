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

# 1. Submodules — worktrees create empty dirs instead of cloning
echo "→ Initializing submodules..."
git submodule update --init --recursive

# 2. Python venv for lizard-ts
VENV_DIR="packages/lizard-ts/src/python-lizard/.venv"
if [ ! -d "$VENV_DIR" ]; then
  echo "→ Creating Python venv for lizard-ts..."
  python3 -m venv "$VENV_DIR"
  "$VENV_DIR/bin/pip" install -q pygments pathspec
else
  echo "→ Python venv already exists, skipping."
fi

# 3. Install dependencies
echo "→ Installing pnpm dependencies..."
pnpm install --frozen-lockfile

# 4. Build all packages (cross-package deps need dist/)
echo "→ Building all packages..."
pnpm run build

echo "✓ Worktree ready. Run 'pnpm run test' to verify."
