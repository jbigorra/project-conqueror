# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (all packages via Turbo)

```bash
pnpm run build          # Build all packages
pnpm run dev            # Watch mode for all packages
pnpm run test           # Run all tests
pnpm run test:coverage  # Run tests with coverage
pnpm run tdd            # Watch mode tests (TDD)
pnpm run lint           # Lint all code
pnpm run format         # Prettier format
```

### Webapp (apps/webapp)

```bash
bun run dev             # Start dev server with watch
bun test                # Run all tests
bun test --watch        # TDD watch mode
bun test path/to/file   # Run a single test file
bun run typecheck       # Type-check without emitting
bun run db:generate     # Generate Drizzle migrations
bun run db:migrate      # Run migrations
```

## Architecture

### Monorepo Structure

- `apps/webapp` — Main web application (Elysia.js + Bun runtime)
- `packages/behave` — Behavioural code analysis facade over code-maat-port + lizard-ts
- `packages/code-maat-port` — TypeScript port of Clojure code-maat
- `packages/charts` — Lit Web Components for visualizing analysis results (Chart.js + D3)
- `packages/lizard-ts` — TypeScript wrapper around Python lizard (complexity analysis)
- `packages/lib` — Shared patterns: EventBus, Result type, `spawnAsync`, CLIResult
- `packages/config` — Shared `tsconfig.json` base

### Feature Structure (DDD)

Each feature in `apps/webapp/src/features/` follows this layering:

```
feature/
├── core/              # Entities, aggregates, value objects (pure domain logic)
├── application/       # Use cases and event subscribers (orchestration)
├── infrastructure/    # Repository implementations, DB, external services
└── presentation/      # Controllers, JSX UI components
```

### Key Patterns

**Result/Either (Railway-Oriented)**
All use cases and repositories return `Result<T>` from `@prj-conq/lib`. Use `.isSuccess()`, `.isError()`, `.getValue()`, `.getError()`. Supports `.map()` and `.flatMap()`.

**Event-Driven Architecture**
Domain events (`FileUploadedEvent`) are published to the `EventBusInstance` singleton. Subscribers react asynchronously. Register subscribers in `main.ts` during bootstrap.

**Dependency Injection via Static Factories**
Classes expose a static `create()` method with optional dependency overrides, enabling test mocking without a DI container:

```typescript
UploadFile.create({ fileStorage: mockStorage, eventBus: mockBus });
```

**Repository Pattern**
Repositories implement `IBaseRepository<T extends DomainEntity>` with methods: `insertOne`, `updateOne`, `findById`, `findOne`, `deleteOne`. Database is Drizzle ORM over SQLite.

### Data Flow: Upload → Analysis

1. User POSTs a `.log` git log file to `/upload`
2. `UploadFile` use case: validates → saves to S3 → inserts DB record → publishes `FileUploadedEvent`
3. `AnalysisRunnerSubscriber` handles the event asynchronously:
   - Saves file locally (temp dir via `LocalFileStorage`)
   - Runs `Behave.runAnalysis()` which spawns Code-Maat (Java JAR) as subprocess
   - Parses CSV results
4. UI is rendered server-side as HTML using KitaJS JSX + HTMX for dynamic updates

### Shared Infrastructure

- `src/shared/infrastructure/event/` — `EventBusInstance` singleton
- `src/shared/infrastructure/fs/` — `S3FileStorage` and `LocalFileStorage`
- `src/shared/infrastructure/database/db.ts` — Drizzle factories for dev/prod/test (test uses in-memory SQLite)
- `src/shared/generics-types/` — `IUseCase`, `IBaseRepository`, `DomainEntity` base class

### Technology Stack

- **Runtime**: Bun 1.2.21+
- **Web framework**: Elysia.js with `@elysiajs/html`, swagger, opentelemetry, static plugins
- **UI**: KitaJS JSX (server-rendered HTML) + HTMX + Pico CSS + SASS
- **Database**: SQLite via Drizzle ORM; `drizzle-kit` for migrations
- **Analysis engine**: Code-Maat (Java JAR spawned as subprocess via `spawnAsync`)
- **Testing**: Bun test runner + `bun-automock` + `fishery` factories + Playwright (E2E)
- **Build orchestration**: Turbo + `bunup` for library packages

## Standards

- **Biome strict mode**: `noExplicitAny`, `noUnusedVariables`, `noNonNullAssertion` enforced as errors in all packages
- **VCS-aware formatting**: Biome uses `--changed` flag; only changed files are linted/formatted, preserving git blame
- **JSDoc required**: All public API exports MUST have JSDoc with `@param`, `@returns`, `@example`
- **Tests mirror src/**: Test files live under `tests/` mirroring the `src/` directory structure
- **Package documentation**: Every package must have a `CLAUDE.md` (source of truth) and an `AGENTS.md` symlink (`ln -s CLAUDE.md AGENTS.md`) for OpenCode compatibility
- **Named exports only**: Barrel files use `export { X } from` or `export * from` — never `export * as namespace from` (bun DTS limitation)
- **Conventional commits**: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:` — no Co-Authored-By trailers

## New Package/App Readiness Checklist

Every package or app in the monorepo MUST have all of the following before it is considered ready. Use this checklist when creating a new package or onboarding an existing one.

### Configuration
- [ ] `package.json` with name `@prj-conq/{name}`, `private: true`, and correct workspace dependencies
- [ ] `tsconfig.json` extending `@prj-conq/config/tsconfig.base.json`
- [ ] `biome.json` extending root config: `{ "extends": ["../../biome.json"] }` — add overrides only if needed

### Scripts (in package.json)
- [ ] `build` — compile/bundle (e.g., `bunup`)
- [ ] `dev` — watch mode (e.g., `bunup --watch`)
- [ ] `typecheck` — `tsc --noEmit`
- [ ] `test` — `bun test`
- [ ] `check` — `biome check --write .` (auto-fix)
- [ ] `lint` — `biome check .` (CI mode, no auto-fix)
- [ ] `validate` — `bun run typecheck && bun test && biome check --write .`

### CI / Quality
- [ ] `sonar-project.properties` with project key `jbsoft_project-conqueror_{name}`
- [ ] Added to `.github/workflows/quality.yml` SonarQube matrix
- [ ] Added to `release-please-config.json` and `.release-please-manifest.json` (skip for config-only packages like `@prj-conq/config`)

### Documentation
- [ ] `README.md` — purpose, installation, usage, API overview, development
- [ ] `CLAUDE.md` — AI agent context: what the package does, key files, commands, architecture, testing conventions, export rules, standards
- [ ] `AGENTS.md` — symlink to CLAUDE.md (`ln -s CLAUDE.md AGENTS.md`)
- [ ] All public exports have JSDoc with `@param`, `@returns`, `@example`

### Testing
- [ ] Test files under `tests/` mirroring `src/` structure
- [ ] Unit tests for all non-trivial logic
- [ ] Barrel file (`src/index.ts`) using named exports only
