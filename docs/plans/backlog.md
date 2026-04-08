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
