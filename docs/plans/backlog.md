# Backlog

Items identified during the monorepo standardization (2026-04-08) that are deferred for future work.

---

## `@prj-conq/types` shared package

**Origin**: [monorepo-standardization.md](2026-04-08-monorepo-standardization.md) — Out of Scope

Extract common `*Entry` and `*Result` base types used across `code-maat-port` and `behave` into a dedicated shared types package. Would reduce coupling between analysis packages and make type contracts explicit.

**Why deferred**: Requires careful analysis of type boundaries between packages. Low urgency — current structural typing works fine.

---

## Webapp biome cleanup (74 pre-existing errors)

**Origin**: [monorepo-standardization.md](2026-04-08-monorepo-standardization.md) — Out of Scope

Webapp never had biome linting. Running `biome check --write .` reformats the entire codebase (CSS, TS, TSX) and surfaces 74 errors. Currently using `--changed || true` to avoid blocking. Need to clean up all 74 errors to switch to standard `biome check --write .`.

**Why deferred**: Large formatting diff that destroys git blame on the entire webapp. Should be done as an isolated PR to minimize review noise.

---

## SonarCloud MCP — query and fix issues from CLI

**Origin**: Session 2026-04-08

Install the official [SonarQube MCP Server](https://github.com/SonarSource/sonarqube-mcp-server) to query SonarCloud issues, quality gates, and hotspots directly from Claude Code / OpenCode. Then use the results to fix reported issues across the monorepo.

**Setup**:
```bash
claude mcp add sonarqube \
  --env SONARQUBE_TOKEN=$SONAR_TOKEN \
  --env SONARQUBE_ORG=jbsoft \
  -- docker run --init --pull=always -i --rm \
  -e SONARQUBE_TOKEN -e SONARQUBE_ORG mcp/sonarqube
```

Requires: Docker running, `SONAR_TOKEN` env var set.

**Why deferred**: Needs Docker + token setup. Low urgency — SonarCloud dashboard is available in the meantime.

---

## Worktree initialization automation

**Origin**: Session 2026-04-09

Git worktrees created with `git worktree add` don't initialize submodules or Python venvs automatically. This causes tests to fail in every new worktree (lizard-ts needs `python-lizard/.venv` and `pnpm run build`). Agents resort to `--no-verify` to bypass the pre-commit hook.

**Fix options**:
- Script at repo root (`scripts/setup-worktree.sh`) that runs: `git submodule update --init`, venv setup, `pnpm install --frozen-lockfile`, `pnpm run build`
- Or a `.config/wt.toml` post-create hook if using Worktrunk
- Document the manual steps in CLAUDE.md under a "Worktree Setup" section

**Why deferred**: Workaround is known (manual setup steps). Automate when worktree usage becomes frequent enough to justify the script.

---

## Domain chart components — eliminate duplication via Strategy pattern

**Origin**: Session 2026-04-09, PR #27 (SonarCloud flagged 9.8% duplication)

The 18 domain chart components in `packages/charts/src/domain/` are structurally identical — same DataFetchController, same properties (data, src, theme, variant, limit), same `updated()` and `resolvedData` getter. Only the data type, mapper functions, and available variants differ. SonarCloud detects this as code duplication.

**Approach**: Strategy pattern via a `defineDomainChart<T>()` factory that accepts a config object with variant renderers. Each domain chart becomes pure configuration (~15 lines) instead of a full class (~60 lines). Zero inheritance.

**Spec**: `docs/superpowers/specs/2026-04-09-domain-chart-strategy-design.md`

**Why deferred**: Significant refactor (18 files + exports + tests). Separated from the enclosure labels PR to keep scope contained.
