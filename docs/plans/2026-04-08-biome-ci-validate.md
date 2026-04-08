# Plan: Root Biome Config + CI Linting + Root Validate

**Date**: 2026-04-08
**Status**: COMPLETE
**Effort**: Low
**Origin**: [monorepo-standardization.md](2026-04-08-monorepo-standardization.md) — Out of Scope items 1, 3, 4

---

## Goal

Reduce biome config duplication, enable CI linting, and add a root `validate` script that runs the full quality suite.

---

## Phase 0: Rename typescript-config → config

**Problem**: `packages/typescript-config` is named after a single tool. As we add more shared configs (biome at root, potentially others), the name should reflect a broader purpose.

**Action**:

1. Rename directory: `packages/typescript-config` → `packages/config`
2. Update `package.json`: name `@prj-conq/typescript-config` → `@prj-conq/config`
3. Update all consumers' `tsconfig.json`: `@prj-conq/typescript-config/tsconfig.base.json` → `@prj-conq/config/tsconfig.base.json`
4. Update all consumers' `package.json` dependencies: `@prj-conq/typescript-config` → `@prj-conq/config`
5. Update `pnpm-workspace.yaml` if it explicitly lists the package path
6. Update CLAUDE.md, README.md, and any docs referencing the old name

**Affected files**:
- `packages/typescript-config/` → `packages/config/` (RENAME)
- `packages/config/package.json` (UPDATE name)
- `packages/config/CLAUDE.md` (UPDATE)
- `packages/config/README.md` (UPDATE)
- 7x `tsconfig.json` (UPDATE extends path)
- 6x `package.json` (UPDATE dependency name)
- Root `CLAUDE.md` (UPDATE reference)
- `pnpm-lock.yaml` (auto-updated by pnpm install)

---

## Phase 1: Root biome.json (shared config)

**Problem**: 6 biome.json files with ~95% identical rules. Only 1 real divergence (`noNonNullAssertion: off` in code-maat-port).

**Action**:

1. Create `/biome.json` (root) with all shared config:
   - VCS: `enabled: true`, `clientKind: git`, `useIgnoreFile: false`, `defaultBranch: master`
   - Formatter: `indentStyle: space`, `indentWidth: 2`, `lineWidth: 100`
   - JS formatter: `quoteStyle: double`, `semicolons: always`
   - Linter: `recommended: true`, `noUnusedVariables: error`, `noExplicitAny: error`, `noNonNullAssertion: error`
   - Assist: `organizeImports: on`
   - Files: `includes: ["src/**", "tests/**"]`

2. Simplify each package's `biome.json` to only contain `extends` + overrides:

   **Standard package** (charts, behave, lib, lizard-ts, webapp):
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.4.6/schema.json",
     "extends": ["../../biome.json"]
   }
   ```

   **code-maat-port** (override noNonNullAssertion):
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.4.6/schema.json",
     "extends": ["../../biome.json"],
     "linter": {
       "rules": {
         "style": { "noNonNullAssertion": "off" }
       }
     }
   }
   ```

   **lizard-ts** (override file excludes):
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.4.6/schema.json",
     "extends": ["../../biome.json"],
     "files": {
       "includes": ["src/**", "tests/**"],
       "ignore": ["src/python-lizard/**"]
     }
   }
   ```

   **webapp** (path prefix differs — `apps/` not `packages/`):
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.4.6/schema.json",
     "extends": ["../../biome.json"]
   }
   ```

**Verification**: Run `biome check` in each package — should produce identical results to current config.

**Affected files**:
- `/biome.json` (CREATE)
- 6x `packages/*/biome.json` + `apps/webapp/biome.json` (SIMPLIFY)

---

## Phase 2: CI linting step

**Problem**: `quality.yml` only runs `test:coverage`. Comment on L16 says to add lint when ready.

**Action**:

Update `.github/workflows/quality.yml` matrix to include `check`:
```yaml
strategy:
  matrix:
    task: [test:coverage, check]
```

This runs `pnpm check` → `turbo check` → each package runs `biome check --write .`.

**Note**: The `--write` flag in CI will auto-fix formatting. If we want CI to FAIL on formatting issues instead of fixing them, change package scripts to use `biome check` (without `--write`) for CI, or add a `check:ci` script: `biome check .`.

**Decision needed**: Should CI auto-fix or fail? Recommendation: **fail** — use `biome check .` (no `--write`) so developers fix locally.

**Affected files**:
- `.github/workflows/quality.yml` (UPDATE matrix)
- Optionally: all package.json `check:ci` script (if we separate check vs check:ci)

---

## Phase 3: Root validate script

**Problem**: No way to run the full quality suite from the root. Each package has `validate` but turbo doesn't know about it.

**Action**:

1. Add `validate` task to `turbo.json`:
   ```json
   {
     "tasks": {
       "validate": {
         "cache": false
       }
     }
   }
   ```

2. Add `validate` script to root `package.json`:
   ```json
   {
     "scripts": {
       "validate": "turbo validate"
     }
   }
   ```

3. Verify all packages already have `validate` scripts (they do — confirmed during exploration).

**Affected files**:
- `turbo.json` (ADD validate task)
- `package.json` (ADD validate script)

---

## Execution Order

```
Phase 0 (Rename config)  →  Phase 1 (Root biome)  →  Phase 2 (CI lint)  →  Phase 3 (Root validate)
```

Phase 0 goes first to avoid changing the package name after biome config references it. Phase 1 must precede Phase 2 because CI lint depends on biome working from root. Phase 3 is independent but logically last.

---

## Risks

- **Biome `extends` path resolution**: Biome resolves `extends` relative to the config file's location. Need to verify `../../biome.json` works from `packages/X/biome.json` and `apps/X/biome.json`.
- **CI `--write` semantics**: If CI uses `--write`, it silently fixes issues instead of failing. Need to decide on CI behavior.
- **Webapp `--changed || true`**: Webapp still uses the `--changed` workaround. Root validate will inherit this behavior from the package-level script.
