# Project Conqueror — Agent Guide

Multi-package monorepo: behavioural code analysis tool. pnpm workspace + Turbo + Biome + Bun.

## Commands

### Root (turbo delegates to all packages)

```bash
pnpm run validate      # Single source of truth: build → test → lint → storybook
pnpm run build         # turbo build
pnpm run dev           # turbo dev (watch)
pnpm run test          # turbo test
pnpm run test:coverage # turbo test:coverage
pnpm run lint          # turbo lint
pnpm run check         # turbo check (biome --write)
```

Husky pre-commit always runs `pnpm run validate`. Pre-push runs validate on master only.

### Per package — use `bun` directly (NOT `pnpm`)

```bash
bun test path/to/file    # single test file
bun test                 # all tests
bun test --watch         # TDD
bun run typecheck        # tsc --noEmit
bun run validate         # typecheck + test + biome check
bun run check            # biome check --write .
bun run lint             # biome check .       (CI mode, no write)
bun run check:changed    # biome --changed     (VCS-aware)
bun run check:staged     # biome --staged
bun run build            # bunup, sometimes + tsc
```

### Linting caveat

Root `pnpm run lint` → turbo delegates to each package, where some use `biome check .` (CI mode) and others use `biome check --changed || true`. The webapp uses `--changed` — it will NOT notice lint issues in unchanged files. Use `bun run check:all` inside a package for a full scan.

### Desktop app (`apps/td-radar-electrobun`)

No standard repo scripts — it's an Electrobun project, not a library package. Uses `bun` directly:

```bash
bun run dev          # electrobun dev --watch (no HMR)
bun run dev:hmr      # Vite HMR + electrobun concurrently (recommended)
bun run hmr          # Vite dev server only on port 5173
bun run start        # vite build + electrobun dev
bun run build:canary # vite build + electrobun build --env=canary
```

No tests, no Biome, no Turbo integration yet.

### Root biome organizes imports on save (`assist.actions.source.organizeImports: "on"`)

## Engine & Tooling

- **Bun** ≥1.3.11 (pinned in `.bun-version` and `mise.toml`). Not Node — do NOT assume Node APIs.
- **pnpm** 10.32.1 — `--frozen-lockfile` in CI.
- **Biome** strict: `noExplicitAny`, `noUnusedVariables`, `noNonNullAssertion` = errors.
- **VCS** default branch: `master`. Biome uses `--changed` to preserve git blame.
- **TypeScript** strict via `@tsconfig/bun` + `noUnusedLocals`, `noUnusedParameters`, `noPropertyAccessFromIndexSignature`.

## Architecture

### Packages

| Package | What | Entry / Export |
|---------|------|----------------|
| `apps/webapp` | Elysia.js server (port 8080), KitaJS JSX, HTMX, Drizzle/SQLite — **on hold** | `src/main.ts` (private app) |
| `apps/td-radar-electrobun` | **Active.** Desktop app — Electrobun + Svelte 5 + Vite HMR. Bundles @prj-conq/charts for visualization | `src/bun/index.ts` (main process) |
| `packages/lib` | Result monad, EventBus, spawnAsync, CLIResult | Sub-path exports: `./generics`, `./patterns`, `./processes` |
| `packages/behave` | Code analysis facade — combines code-maat-ts + lizard-ts | Single `.` export. Effect-based pipeline. |
| `packages/code-maat-ts` | Pure TS port of Clojure code-maat (git log analysis) | Single `.` export |
| `packages/charts` | Lit Web Components + Chart.js + D3 | Sub-path exports: `.`, `./generic`, `./domain` |
| `packages/lizard-ts` | Python subprocess wrapper for cyclomatic complexity | Single `.` export |
| `packages/config` | Shared tsconfig base (extends `@tsconfig/bun`) | No build — config only |

### Webapp DDD layers (`apps/webapp/src/features/{name}/`)

```
core/           # Entities, value objects (pure domain)
application/    # Use cases, event subscribers (orchestration)
infrastructure/ # Repository impls, DB, external services
presentation/   # Controllers, JSX components
```

### Webapp path aliases

Use `#` imports mapped in `apps/webapp/package.json` `imports` — NOT `tsconfig paths`:
`#shared/database/*`, `#shared/event/*`, `#shared/fs/*`, `#shared/ui/components/*`, `#upload/*`, `#analyses/*`

### Key wiring

- `src/main.ts` → `bootstrapServer()` → registers event handlers → `app.listen(8080)`
- Events flow: `EventBusInstance` → subscribers registered in `bootstrap.ts` per feature
- Analysis runner: subscribed to `FileUploadedEvent`, invokes `Behave.runAnalysis()` via `@prj-conq/behave`
- DI: Classes expose `static create({ overrides })` — no DI container

## Critical Gotchas

### Python venv for lizard-ts

`packages/lizard-ts` spawns `python -m lizard` via `.venv/bin/python`. The venv uses `uv` (not system Python). After clone/worktree:

```bash
uv venv --python 3.10 packages/lizard-ts/.venv
VIRTUAL_ENV=packages/lizard-ts/.venv uv pip install -r packages/lizard-ts/requirements.txt
```

This runs automatically in `scripts/setup-worktree.sh`. Tests fail without it.

### Worktree setup

```bash
scripts/setup-worktree.sh /path/to/worktree
# or use `wt add` which auto-runs via .config/wt.toml post_add hook
```

### Barrel files: named exports only

`export { X } from` or `export * from` — NEVER `export * as namespace from` (bun fails to emit DTS with `noExternal` + namespace re-exports, breaking downstream builds).

### `package.json` `imports` over `tsconfig paths`

All path aliasing must be in `package.json` `imports` field — NOT in `tsconfig.json` `paths`.

### Release-please convention

| Prefix | Bump |
|--------|------|
| `feat:` | patch (minor post-1.0) |
| `fix:` | patch |
| `feat!: / fix!: / BREAKING CHANGE` | minor (major post-1.0) |
| `refactor: / chore: / test: / docs: / style: / ci:` | no release |

## Per-package AGENTS.md (read for deep context)

- `apps/webapp/AGENTS.md` — webapp commands, DDD, DB config, path aliases, Elysia specifics
- `apps/td-radar-electrobun/AGENTS.md` — Electrobun config, Svelte 5 setup, HMR workflow (no standard scripts)
- `packages/lib/AGENTS.md` — Result, EventBus, spawnAsync export paths
- `packages/behave/AGENTS.md` — Effect pipeline, legacy vs new API, service layers
- `packages/code-maat-ts/AGENTS.md` — parsers, end-to-end tests, export restrictions
- `packages/charts/AGENTS.md` — Lit components, Storybook, `.visual.ts` convention
- `packages/lizard-ts/AGENTS.md` — Python venv setup, singleton pattern, integration tests
- `packages/config/AGENTS.md` — tsconfig base, minimal

## New Package Checklist

Every new package needs:
- `package.json`: `@prj-conq/{name}`, workspace deps, standard scripts (build, dev, test, typecheck, check, lint, validate)
- `tsconfig.json` extending `@prj-conq/config/tsconfig.base.json`
- `biome.json` extending root with `{ "extends": ["../../biome.json"] }`
- `sonar-project.properties` with key `jbsoft_project-conqueror_{name}`
- Added to `.github/workflows/quality.yml` matrix and `release-please-config.json`
- `README.md`, `CLAUDE.md`, `AGENTS.md` → symlink `ln -s CLAUDE.md AGENTS.md`
- Test dir `tests/` mirroring `src/`
- Barrel (`src/index.ts`) with named exports only
- `.visual.ts` suffix for chart components (excluded from coverage, verified in Storybook)

## JSDoc Required

Every `export`ed symbol needs `@param`, `@returns`, `@example`. Exceptions: non-exported symbols, test files, re-export barrels.
