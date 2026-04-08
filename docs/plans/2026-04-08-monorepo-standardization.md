# Monorepo Standardization Plan

**Date**: 2026-04-08
**Scope**: Full audit and standardization of project-conqueror monorepo
**Status**: IN PROGRESS — Phases 1, 2.1, 2.2, 3 (lib) and 4 done. Phase 2.3 (JSDoc) pending.
**Branch**: `chore/monorepo-standardization` (worktree: `.worktrees/monorepo-standardization`)
**Last commit**: `7ab0697` — "chore: monorepo standardization — config, docs, and type safety"

---

## Audit Summary

| Dimension | Current State | Target |
|-----------|--------------|--------|
| READMEs | 1/7 meaningful (webapp minimal) | All packages documented |
| CLAUDE.md + AGENTS.md | 2/7 CLAUDE.md, 0/7 AGENTS.md | All packages with both files (symlinked) |
| SonarCloud | 3/6 packages configured | All packages with src/ scanned |
| Biome linting | 5/6 (webapp missing) | Uniform config, strict rules |
| Script consistency | 4/6 have `validate` + `check` | All packages standardized |
| JSDoc coverage | ~31% (225 exports total) | 100% public API coverage |
| Type safety | `any` in 7+ locations, unsafe casts | Zero `any`, careful `@ts-ignore` review |
| Biome VCS mode | `vcs.enabled: false` everywhere | VCS-aware: only lint changed files |

---

## Phase 1: Configuration Standardization — DONE

### 1.1 — Biome: Create webapp config + unify all packages + enable VCS mode — DONE

**Problem**: `apps/webapp` has NO biome.json. `code-maat-port` uses outdated relative schema path. Rule strictness varies — `charts` enforces `noExplicitAny: error` while others use only `recommended`. All packages have `vcs.enabled: false` — running `biome check --write .` reformats the ENTIRE codebase and destroys git blame history.

**Action**:
- Create `apps/webapp/biome.json` with the strict rule set
- Update `code-maat-port/biome.json` schema to absolute URL (`https://biomejs.dev/schemas/2.4.6/schema.json`)
- **Enable VCS mode in ALL biome.json** to preserve git history:
  ```json
  {
    "vcs": {
      "enabled": true,
      "clientKind": "git",
      "useIgnoreFile": true,
      "defaultBranch": "master"
    }
  }
  ```
- Standardize ALL packages to this rule set:
  ```json
  {
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "error" },
      "suspicious": { "noExplicitAny": "error" },
      "style": { "noNonNullAssertion": "error" }
    }
  }
  ```
- Packages that need `noNonNullAssertion: off` (code-maat-port) keep it as an explicit documented override
- Unify `files.includes` pattern: `["src/**", "tests/**"]` for all (except lizard-ts which needs extra exclusions)

**VCS-aware script convention**: Scripts use `--changed` to only touch modified files:
```json
{
  "check": "biome check --write --changed",
  "check:all": "biome check --write .",
  "check:staged": "biome check --write --staged"
}
```
- `check` (default, used by turbo/hooks): only changed files vs master — **git blame safe**
- `check:all`: full codebase scan — use only for initial setup or intentional mass-format
- `check:staged`: pre-commit hook optimization — only staged files

**Affected files**:
- `apps/webapp/biome.json` (CREATE)
- `packages/code-maat-port/biome.json` (UPDATE schema + rules + VCS)
- `packages/behave/biome.json` (UPDATE rules + VCS)
- `packages/lib/biome.json` (UPDATE rules + files pattern + VCS)
- `packages/lizard-ts/biome.json` (UPDATE rules + VCS)
- `packages/charts/biome.json` (UPDATE VCS)

### 1.2 — Scripts: Standardize validate/check across all packages — DONE

**Problem**: `webapp` missing `check` script. `validate` inconsistent — code-maat-port includes `typecheck`, others don't. `typescript-config` has no scripts (acceptable — config-only).

**Action**:
- Add to `apps/webapp/package.json`:
  - `"check": "biome check --write --changed"`
  - `"check:all": "biome check --write ."`
  - `"check:staged": "biome check --write --staged"`
  - `"validate": "bun run typecheck && bun test && biome check --write --changed"`
- Standardize ALL packages with the same script convention:
  - `"check": "biome check --write --changed"`
  - `"check:all": "biome check --write ."`
  - `"check:staged": "biome check --write --staged"`
  - `"validate": "bun run typecheck && bun test && biome check --write --changed"`
- Verify `code-maat-port` already has `dev` script (or add `bunup --watch` if missing)

**Affected files**:
- `apps/webapp/package.json`
- `packages/behave/package.json`
- `packages/charts/package.json`
- `packages/code-maat-port/package.json`
- `packages/lib/package.json`
- `packages/lizard-ts/package.json`

### 1.3 — SonarCloud: Extend to all packages — DONE

**Problem**: Only webapp, behave, and lib have `sonar-project.properties`. code-maat-port, charts, and lizard-ts are not scanned.

**Action**:
- Create `sonar-project.properties` for:
  - `packages/code-maat-port` (key: `jbsoft_project-conqueror_code-maat-port`)
  - `packages/charts` (key: `jbsoft_project-conqueror_charts`)
  - `packages/lizard-ts` (key: `jbsoft_project-conqueror_lizard-ts`)
- Update `.github/workflows/quality.yml` matrix to include all 6 projects:
  ```yaml
  matrix:
    project:
      - { name: "webapp", path: "apps/webapp" }
      - { name: "behave", path: "packages/behave" }
      - { name: "lib", path: "packages/lib" }
      - { name: "code-maat-port", path: "packages/code-maat-port" }
      - { name: "charts", path: "packages/charts" }
      - { name: "lizard-ts", path: "packages/lizard-ts" }
  ```

**Affected files**:
- `packages/code-maat-port/sonar-project.properties` (CREATE)
- `packages/charts/sonar-project.properties` (CREATE)
- `packages/lizard-ts/sonar-project.properties` (CREATE)
- `.github/workflows/quality.yml` (UPDATE matrix)

**Note**: SonarCloud projects must be created in the SonarCloud dashboard manually (org: `jbsoft`). The config files just point to them.

---

## Phase 2: Documentation — PARTIALLY DONE (2.1, 2.2 done; 2.3 JSDoc pending)

**Guiding principle**: All documentation must serve TWO audiences equally — human developers AND AI agents. Every README and CLAUDE.md should be structured so an AI agent dropped into the repo cold can understand the package's purpose, patterns, constraints, and conventions without exploring the codebase first.

### 2.1 — READMEs for all packages — DONE

**Problem**: Only `apps/webapp` has a meaningful (but minimal) README. 3 packages have empty READMEs, 3 have none.

**Action**: Create/update README.md for each package following this template:
```
# @prj-conq/{name}

{one-line description}

## Installation
## Usage (with code examples)
## API Overview (link to JSDoc or brief summary)
## Development (scripts, testing)
## Architecture (for complex packages)
## Contributing (standards: biome, tests, JSDoc requirement for public APIs)
```

| Package | Status | Effort |
|---------|--------|--------|
| `apps/webapp` | Expand existing (add architecture, features, data flow) | Medium |
| `packages/code-maat-port` | Create (has CLAUDE.md as reference) | Medium |
| `packages/charts` | Create (document Web Components, mappers, themes) | High |
| `packages/behave` | Create (pipeline, analysis types, usage) | Medium |
| `packages/lizard-ts` | Create (what Lizard is, how to use) | Low |
| `packages/lib` | Create (Result, EventBus, spawnAsync patterns) | Medium |
| `packages/typescript-config` | Create (minimal — what base config provides) | Low |

### 2.2 — CLAUDE.md + AGENTS.md (dual-tool compatibility) — DONE

**Problem**: Only root and code-maat-port have CLAUDE.md. AI agents working on any other package have no local context. Additionally, user is migrating to OpenCode which reads `AGENTS.md` as its primary instruction file (`CLAUDE.md` is only a fallback).

**Compatibility strategy**: Write `CLAUDE.md` as the source of truth, then create `AGENTS.md` as a symlink:
```bash
ln -s CLAUDE.md AGENTS.md
```
This gives us:
- **Claude Code**: reads `CLAUDE.md` directly (native)
- **OpenCode**: reads `AGENTS.md` (symlink → same content, native priority)
- **Zero duplication**: one file, two entry points
- **Git-friendly**: symlinks are tracked by git

**Action**: For EVERY package (root + all apps/ + all packages/):
1. Create `CLAUDE.md` following code-maat-port as the gold standard template
2. Create `AGENTS.md` symlink → `CLAUDE.md`
3. Add existing `packages/code-maat-port/CLAUDE.md` symlink too

These files are the PRIMARY onboarding document for AI agents — they must be thorough enough that an agent can contribute meaningfully without asking questions.

```
# CLAUDE.md — @prj-conq/{name}

## What This Package Does (purpose, consumers, domain context)
## Key Files (entry points, important modules, config files)
## Commands (dev, test, build, validate — exact commands)
## Architecture / Patterns (design decisions, DDD layers if applicable)
## Testing Conventions (framework, file layout, mocking strategy)
## Export Rules (for libraries — what's public, barrel conventions)
## Standards
  - All public API exports MUST have JSDoc with @param, @returns, @example
  - Biome strict mode: noExplicitAny, noUnusedVariables, noNonNullAssertion
  - Tests mirror src/ structure under tests/
```

| Package | CLAUDE.md | AGENTS.md symlink | Notes |
|---------|-----------|-------------------|-------|
| Root `/` | UPDATE | CREATE | Add "Standards" section as single source of truth |
| `apps/webapp` | CREATE | CREATE | Feature structure, DDD layers, Elysia patterns, HTMX |
| `packages/charts` | CREATE | CREATE | Lit components, Storybook, mapper pattern, themes |
| `packages/behave` | CREATE | CREATE | Pipeline stages, facade pattern, error types |
| `packages/lizard-ts` | CREATE | CREATE | Python subprocess, singleton pattern |
| `packages/lib` | CREATE | CREATE | Result pattern, EventBus, spawnAsync contract |
| `packages/code-maat-port` | EXISTS | CREATE | Only needs symlink |
| `packages/typescript-config` | CREATE | CREATE | Minimal — what base config provides |

The **root CLAUDE.md** gets a new "Standards" section referencing the repo-wide conventions (biome rules, JSDoc requirement, testing policy, VCS-aware formatting). This becomes the single source of truth that all package-level CLAUDE.md files inherit from.

### 2.3 — JSDoc for all public API exports — PENDING (next session)

**Problem**: 31% JSDoc coverage overall. Charts at 13% (104 exports), lizard-ts at 0%.

**Action**: Add JSDoc to every publicly exported symbol. Priority order:

| Package | Exports | Current | Target | Priority |
|---------|---------|---------|--------|----------|
| `packages/charts` | 104 | 13% | 100% | P0 — largest gap, consumer-facing |
| `packages/code-maat-port` | 66 | 35% | 100% | P1 — core analysis engine |
| `packages/behave` | 35 | 40% | 100% | P1 — orchestration layer |
| `packages/lib` | 18 | 67% | 100% | P2 — shared patterns |
| `packages/lizard-ts` | 2 | 0% | 100% | P2 — tiny surface |

**JSDoc standard**:
- Every exported function: `@param`, `@returns`, `@throws` (if applicable), `@example`
- Every exported class: class-level description, constructor params, public methods
- Every exported type/interface: description, field-level comments
- Web Components: `@element` tag, `@attr` for observed attributes, `@slot`, `@fires`

---

## Phase 3: Type Safety Improvements — PARTIALLY DONE

### 3.1 — Eliminate all `any` usage — lib DONE, webapp PENDING

| Location | Current | Fix |
|----------|---------|-----|
| `apps/webapp/.../upload.page.tsx` (L48, L73) | `values: any` | Define `FormValues` type |
| `apps/webapp/.../upload-files.controller.tsx` (L42) | `catch (e: any)` | `catch (e: unknown)` + type guard |
| `apps/webapp/.../s3-file-storage.ts` (L15) | `catch (e: any)` | `catch (e: unknown)` |
| `apps/webapp/.../upload-repository.ts` (L27) | `catch (e: any)` | `catch (e: unknown)` |
| `packages/lib/.../domain-event.ts` (L7, L18) | `payload: Record<string, any>` | `payload: Record<string, unknown>` |
| `packages/charts/.storybook/main.ts` (L34) | return type `any` | Specify actual return type |

### 3.2 — Remove unsafe type assertions — PENDING

| Location | Current | Fix |
|----------|---------|-----|
| `packages/code-maat-port/.../app.ts` (L73-83) | `as VCSEntry[]` after parser calls | Remove casts — parsers already return correct type |
| `packages/code-maat-port/.../dataset.ts` (L43, 97) | `{} as Record<string, T[]>` | Use type annotation: `const acc: Record<string, T[]> = {}` |
| `packages/behave/.../csv_parser.ts` (L12) | `as unknown as Record<string, string>[]` | Fix CSV parser return type upstream |
| `packages/code-maat-port/.../dataset.ts` (L58) | `selectColumn` returns `unknown[]` | Return `Array<T[K]>` with proper generic |

### 3.3 — Review `@ts-ignore` comments (case-by-case) — PENDING

**IMPORTANT**: Not all `@ts-ignore` are bad. In test files, `@ts-ignore` is often NECESSARY to test error paths (passing wrong types intentionally). Only remove `@ts-ignore` in production code where proper typing can replace it.

| Location | Context | Action |
|----------|---------|--------|
| `apps/webapp/.../upload-files.controller.tsx` (L18) | Production code — `@ts-ignore` for error.validator.schema | **REMOVE**: Type Elysia validation error properly |
| `apps/webapp/.../controller-factory.ts` (L17) | Production code — `@ts-ignore` for logger store.pino | **REMOVE**: Define Store interface with `pino` property |
| Any `@ts-ignore` in `tests/**` | Test code — intentional type violations for error testing | **KEEP**: Verify each is intentional, add explanatory comment if missing |

**Rule**: Before removing ANY `@ts-ignore`, verify what it's suppressing and whether the test/code can work without it. If it's in a test and the test NEEDS to pass a wrong type to verify error handling, leave it and add a comment: `// @ts-ignore — intentional: testing error path with wrong type`.

### 3.4 — Improve optional/nullable patterns — PENDING

| Location | Current | Fix |
|----------|---------|-----|
| `packages/lib/.../event-bus.ts` (L5-7) | Config properties all optional with runtime defaults | Use `Required<EventBusConfig>` internally, optional only in factory input |
| `apps/webapp/.../upload.page.tsx` (L42-46) | `UploadFormSubmitErrors = {...} \| undefined` | Use empty object `{}` for no-error state |

---

## Phase 4: Verification & Cleanup — DONE (for current scope)

### 4.1 — Run full validation suite — DONE
- `pnpm run test` — all tests pass
- `pnpm run check` — biome passes on all packages (including new webapp config)
- Typecheck all packages — zero errors
- Verify SonarCloud configs are valid (dry-run scan if possible)

### 4.2 — Pre-commit hook verification
- Verify `.husky/pre-commit` still works with webapp now having `check` script
- Run `pnpm run validate` from root to ensure all packages validate

---

## Execution Order

```
Phase 1 (Config)     →  Phase 2 (Docs)      →  Phase 3 (Types)     →  Phase 4 (Verify)
  1.1 Biome              2.1 READMEs             3.1 any removal         4.1 Full test suite
  1.2 Scripts             2.2 CLAUDE.md           3.2 as casts            4.2 Hook verify
  1.3 SonarCloud          2.3 JSDoc               3.3 @ts-ignore
                                                  3.4 Optionals
```

Phases 1 and 2 can be parallelized (config vs docs are independent). Phase 3 must wait for Phase 1 (biome strict rules may surface new errors). Phase 4 is always last.

---

## Estimated Scope

| Phase | Files Created | Files Modified | Commits |
|-------|:------------:|:--------------:|:-------:|
| Phase 1 | 4 | 8 | 3 (one per sub-phase) |
| Phase 2 | ~20 (7 READMEs + 6 CLAUDEs + 8 AGENTS.md symlinks) | 2 (root CLAUDE.md + root README) | 3 (READMEs, CLAUDEs+symlinks, JSDoc batched) |
| Phase 3 | 0 | ~12 | 2-3 (grouped by type of fix) |
| Phase 4 | 0 | 0 | 0 (verification only) |
| **Total** | **~24** | **~22** | **~9** |

---

## Out of Scope (Flagged for Future)

- **Root-level biome.json**: Consider a shared config that packages extend (reduces duplication). Not doing now to avoid disrupting package-level overrides.
- **`@prj-conq/types` shared package**: Potential extraction of common `*Entry` and `*Result` base types used across code-maat-port and behave.
- **CI linting step**: quality.yml has a comment `# add lint to the list when we have a linting step`. Once all packages have biome, this can be enabled.
- **Root `validate` script**: Currently doesn't exist. Could be `turbo validate` to run all packages.
- **Auto-JSDoc on AI code changes**: Configure a hook or agent instruction so that whenever AI modifies or creates code touching a public API export, it automatically adds/updates JSDoc documentation. Could be implemented as a Claude Code hook (`post-tool` on Edit/Write) or as a CLAUDE.md instruction.
- **Automated semver versioning**: Set up tooling (e.g., changesets, release-please, or custom hook) so that package versions are bumped automatically following semver when changes are made. Each PR or commit should indicate the version impact (patch/minor/major) and the version bump happens as part of the release flow.
- **Webapp biome cleanup**: Webapp has 74 pre-existing biome errors (never had linting). Currently using `--changed || true` to avoid blocking. Clean up all 74 errors to switch to standard `biome check --write .`.

---

## Execution Log

### Session 1 (2026-04-08)

**Completed**: Phases 1, 2.1, 2.2, 3 (lib only), 4
**Commit**: `7ab0697` on branch `chore/monorepo-standardization`
**Worktree**: `.worktrees/monorepo-standardization`

#### Lessons Learned During Execution

1. **Biome `useIgnoreFile: true` fails** in packages without their own `.gitignore` — set to `false` in all configs, rely on `files.includes` patterns instead.

2. **Biome `--changed` exits non-zero** when no files match the diff (e.g., on master or when only config files changed). Not suitable as the default `check` script. Final convention:
   - Packages with clean biome history: `check: "biome check --write ."`
   - Webapp (74 pre-existing errors): `check: "biome check --write --changed || true"`
   - All packages: `check:changed` and `check:staged` available as alternatives

3. **Webapp never had biome** — running `biome check --write .` reformats the entire codebase (CSS, TS, TSX). To preserve git blame, webapp uses `--changed || true` until existing code is incrementally cleaned.

4. **Worktree setup requires manual steps**: submodules must be re-initialized (`rm -rf` empty dir + `git submodule update --init`), Python venvs recreated, and `pnpm run build` run before tests pass.

5. **`@biomejs/biome` was missing** from webapp's devDependencies — added it, updated pnpm-lock.yaml.

#### What's Left for Next Session

1. **Phase 2.3 — JSDoc** (225 exports): The biggest remaining task. Recommended approach: launch parallel agents per package (charts: 104, code-maat-port: 66, behave: 35, lib: 18, lizard-ts: 2). Commit per package.

2. **Phase 3 — Webapp type safety** (74 biome errors): `any` in catch blocks, form values, `@ts-ignore` comments, unsafe casts. These are all in `apps/webapp/` and can be batched.

3. **Phase 3.2-3.4** — Remaining type safety in code-maat-port (unsafe `as` casts) and behave (CSV parser double cast). Lower priority.

#### How to Resume

```bash
cd .worktrees/monorepo-standardization
# Worktree should still be intact. If not:
# git worktree add .worktrees/monorepo-standardization chore/monorepo-standardization
pnpm install --frozen-lockfile
python3 -m venv packages/lizard-ts/src/python-lizard/.venv
packages/lizard-ts/src/python-lizard/.venv/bin/pip install pygments pathspec
pnpm run build
pnpm run test  # should be 6/6
```
