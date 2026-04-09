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
