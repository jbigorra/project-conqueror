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

## Domain chart components — eliminate duplication via Strategy pattern

**Origin**: Session 2026-04-09, PR #27 (SonarCloud flagged 9.8% duplication)

The 18 domain chart components in `packages/charts/src/domain/` are structurally identical — same DataFetchController, same properties (data, src, theme, variant, limit), same `updated()` and `resolvedData` getter. Only the data type, mapper functions, and available variants differ. SonarCloud detects this as code duplication.

**Approach**: Strategy pattern via a `defineDomainChart<T>()` factory that accepts a config object with variant renderers. Each domain chart becomes pure configuration (~15 lines) instead of a full class (~60 lines). Zero inheritance.

**Spec**: `docs/superpowers/specs/2026-04-09-domain-chart-strategy-design.md`

**Why deferred**: Significant refactor (18 files + exports + tests). Separated from the enclosure labels PR to keep scope contained.

---

## `lizard-ts` — pin Python version for reproducible venvs

**Origin**: Session 2026-04-14 (charts-strategy-pattern refactor)

The `packages/lizard-ts` venv is created via `python3 -m venv` using whatever Python happens to be on the system. When the system Python upgrades (e.g. 3.13 → 3.14), existing venvs break because they contain absolute paths to the old Python framework (`dyld: Library not loaded: .../python@3.13/...`).

**Approach**: Pin the Python version via one of:
- `uv` — fast Python package/version manager, creates reproducible venvs with a pinned Python
- `pyenv` + `.python-version` file committed to the repo
- `mise` / `asdf` — polyglot version managers

Update `scripts/setup-worktree.sh` to use the pinned version instead of the system `python3`.

**Why deferred**: Infra concern unrelated to any feature. Hit during the charts refactor when the system Python was upgraded mid-session.

---

## Turbo cache invalidates `lizard-ts/dist/python-lizard/`

**Origin**: Session 2026-04-14 (charts-strategy-pattern refactor)

Turbo caches the `dist/` output of `@prj-conq/lizard-ts`, which includes the copied Python venv (`dist/python-lizard/.venv/`). When the source venv is rebuilt but the turbo cache still has the old dist, restoring from cache brings back the stale Python binary — tests fail with `dyld: Library not loaded` even though the source venv is fresh.

**Approach**: Either
1. Exclude `dist/python-lizard/` from turbo `outputs` in `turbo.json` and let the bunup copy plugin recreate it on every build (slower, always correct)
2. Include a hash of the Python interpreter path/version in turbo's cache key so cache invalidates on Python upgrades
3. Stop copying the venv into `dist/` — reference the `src/` venv directly at runtime (cleanest but changes the distribution model)

**Why deferred**: Root cause is the Python versioning issue above. Fixing that first may make this moot.
