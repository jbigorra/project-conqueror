# Project Conqueror

Behavioural code analysis tool. Analyse git repositories locally and get back visual analysis of coupling, churn, authorship, code age, complexity hotspots, and more.

> **Status**: The desktop app (`apps/td-radar-electrobun`) is the active focus. The webapp (`apps/webapp`) is on hold.

Multi-package pnpm monorepo. Turbo orchestration. Bun runtime. Biome formatting.

## Metrics

### SonarCloud

| App/Package | Metric | Value |
|-------------|--------|-------|
| webapp | Lines of Code | [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=jbsoft_project-conqueror_webapp&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=jbsoft_project-conqueror_webapp) |
| webapp | Coverage | [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jbsoft_project-conqueror_webapp&metric=coverage)](https://sonarcloud.io/summary/new_code?id=jbsoft_project-conqueror_webapp) |
| behave | Lines of Code | [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=jbsoft_project-conqueror_behave&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=jbsoft_project-conqueror_behave) |
| behave | Coverage | [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jbsoft_project-conqueror_behave&metric=coverage)](https://sonarcloud.io/summary/new_code?id=jbsoft_project-conqueror_behave) |
| lib | Lines of Code | [![Lines of Code](https://sonarcloud.io/api/project_badges/measure?project=jbsoft_project-conqueror_lib&metric=ncloc)](https://sonarcloud.io/summary/new_code?id=jbsoft_project-conqueror_lib) |
| lib | Coverage | [![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jbsoft_project-conqueror_lib&metric=coverage)](https://sonarcloud.io/summary/new_code?id=jbsoft_project-conqueror_lib) |

### CodeScene

| App/Package | Metric | Value |
|-------------|--------|-------|
| behave | Average Code Health | [![CodeScene Average Code Health](https://codescene.io/projects/69982/status-badges/average-code-health)](https://codescene.io/projects/69982) |
| behave | Hotspot Code Health | [![CodeScene Hotspot Code Health](https://codescene.io/projects/69982/status-badges/hotspot-code-health)](https://codescene.io/projects/69982) |

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Bun** | ≥1.3.14 | Runtime. Pinned in `.bun-version`. Install via `mise` or `curl -fsSL https://bun.sh/install \| bash` |
| **pnpm** | 10.32.1 | Package manager. Enable with `corepack enable && corepack install` |
| **Python 3.10** + **uv** | — | Required only for `packages/lizard-ts`. `uv` is auto-installed by CI and `scripts/setup-worktree.sh`. No system Python needed. |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build all packages (cross-package deps need dist/)
pnpm run build

# Run everything: build → test → lint → storybook
pnpm run validate
```

### Worktree Setup

```bash
scripts/setup-worktree.sh
# Installs deps, creates Python venv for lizard-ts via uv, builds all packages.
# Auto-runs when using `wt add` (see .config/wt.toml).
```

## Project Structure

### Apps

| App | Description | Entry |
|-----|-------------|-------|
| [`td-radar-electrobun`](apps/td-radar-electrobun/README.md) | **Active.** Desktop app — Electrobun + Svelte 5 + Vite HMR. Analyses local repos and displays charts. | `src/bun/index.ts` (main process) |
| [`webapp`](apps/webapp/README.md) | **On hold.** Fullstack web app — Elysia.js server (port 8080), KitaJS JSX, HTMX, Drizzle/SQLite | `apps/webapp/src/main.ts` |

### Packages

| Package | Description | Export |
|---------|-------------|--------|
| [`lib`](packages/lib/README.md) | Result monad, EventBus, spawnAsync, CLIResult | Sub-path: `./generics`, `./patterns`, `./processes` |
| [`code-maat-ts`](packages/code-maat-ts/README.md) | Pure TS port of Clojure code-maat (git log analysis) | Single `.` |
| [`lizard-ts`](packages/lizard-ts/README.md) | Python subprocess wrapper for cyclomatic complexity (lizard) | Single `.` |
| [`behave`](packages/behave/README.md) | Analysis facade — combines code-maat-ts + lizard-ts | Single `.` |
| [`charts`](packages/charts/README.md) | Lit Web Components + Chart.js + D3 for visualization | Sub-path: `.`, `./generic`, `./domain` |
| [`config`](packages/config/README.md) | Shared TypeScript base config (extends `@tsconfig/bun`) | No build |

## Commands

### Root (turbo delegates to all packages)

```bash
pnpm run validate      # build → test → lint → storybook (single source of truth)
pnpm run build         # turbo build
pnpm run dev           # turbo dev (watch)
pnpm run test          # turbo test
pnpm run test:coverage # turbo test:coverage
pnpm run lint          # turbo lint
pnpm run check         # turbo check (biome check --write .)
```

### Per package (use `bun` directly)

```bash
bun test                     # all tests
bun test path/to/file        # single test file
bun test --watch             # TDD
bun test --coverage          # with coverage
bun run typecheck            # tsc --noEmit
bun run validate             # typecheck + test + biome check
bun run check                # biome check --write .
bun run lint                 # biome check . (CI mode)
bun run check:changed        # biome --changed (VCS-aware)
bun run build                # bunup, sometimes + tsc declaration emit
```

## Architecture

### Webapp DDD Layers (`apps/webapp/src/features/{name}/`)

```
core/           # Entities, value objects — pure domain
application/    # Use cases, event subscribers — orchestration
infrastructure/ # Repository impls, DB, external services
presentation/   # Controllers, JSX components
```

### Key Wiring

- **Entry**: `apps/webapp/src/main.ts` → `bootstrapServer()` → registers event handlers → listens on port 8080
- **Events**: Domain events (e.g. `FileUploadedEvent`) → `EventBusInstance` singleton → async subscribers
- **DI**: Classes expose `static create({ overrides })` — no DI container
- **Build**: Turbo orchestrates inter-package builds (`^build` dependency graph). Library packages use `bunup`. Webapp compiles to a single binary with `bun build --compile`.
- **Testing**: Bun test runner with `bun-automock` for mocks and `fishery` for test data factories.

### Package Conventions

- **Path aliases**: Defined in `package.json` `imports` field, NOT `tsconfig.json` `paths`
- **Barrel exports**: Named exports only (`export { X } from` / `export * from`). Never `export * as namespace` (breaks bun DTS with `noExternal`)
- **JSDoc**: Required on all exported symbols (`@param`, `@returns`, `@example`)
- **Visual components**: Chart/SVG rendering files use `.visual.ts` suffix (excluded from coverage, verified in Storybook)
- **Linting**: Root biome uses `--changed` flag — only changed files linted, preserving git blame

## Development

### TDD

```bash
# Root (all packages):
pnpm run tdd

# Single package:
cd packages/lib && bun test --watch
```

### DB (webapp only)

```bash
bun run db:generate     # Generate Drizzle migrations
bun run db:migrate      # Run migrations
bun run db:push         # Push schema directly
bun run db:pull         # Pull schema from DB
```

### Desktop App (td-radar-electrobun)

```bash
cd apps/td-radar-electrobun
bun run dev:hmr    # Vite HMR + electrobun concurrently (recommended)
bun run dev        # electrobun dev --watch (no HMR)
bun run build:canary # vite build + electrobun build --env=canary
```

### Storybook (charts)

```bash
cd packages/charts && bun run storybook        # Dev on port 6006
cd packages/charts && bun run build-storybook  # Static build
```

## Code Quality

| Tool | Purpose |
|------|---------|
| **Biome** | Lint + format. Strict: noExplicitAny, noUnusedVariables, noNonNullAssertion = errors |
| **TypeScript** | `tsc --noEmit` strict mode (`@tsconfig/bun` + `noUnusedLocals`, `noUnusedParameters`, `noPropertyAccessFromIndexSignature`) |
| **SonarCloud** | Per-package quality gates + coverage tracking |
| **CodeScene** | Code Health monitoring for `behave` |
| **Husky** | Pre-commit runs `pnpm run validate`; pre-push runs it only on master |

## New Package Checklist

See [`AGENTS.md`](AGENTS.md#new-package-checklist) for the full checklist.
