# CLAUDE.md — @prj-conq/webapp

## What This Package Does

Modulithic web application for Project Conqueror. Accepts git log file uploads, runs behavioural code analysis (via `@prj-conq/behave`), and renders results as server-side HTML with interactive charts. Consumers: end users via browser.

## Key Files

- `src/main.ts` — Entry point, bootstraps the Elysia server on port 8080
- `src/bootstrap.ts` — Registers event handlers and starts listening
- `src/features/upload/` — File upload feature (DDD layers)
- `src/features/analyses/` — Analysis running and display feature (DDD layers)
- `src/shared/infrastructure/database/db.ts` — Drizzle ORM factory (dev/prod/test SQLite)
- `src/shared/infrastructure/event/` — `EventBusInstance` singleton
- `src/shared/infrastructure/fs/` — `S3FileStorage`, `LocalFileStorage`
- `src/shared/generics-types/` — `IUseCase`, `IBaseRepository`, `DomainEntity` base class
- `src/shared/presentation/ui/` — Shared UI components, partials, layouts
- `drizzle-development.config.ts` — Drizzle-kit config for migrations
- `biome.json` — Biome linter/formatter config

## Commands

```bash
bun run dev             # Start dev server with watch (NODE_ENV=development)
bun run dev:debug       # Dev server with --inspect-wait
bun test                # Run all tests
bun test --coverage     # Tests with coverage
bun test --watch        # TDD watch mode
bun test path/to/file   # Run a single test file
bun run typecheck       # Type-check without emitting (tsc --noEmit)
bun run build           # Compile to single binary (temp/server)
bun run db:generate     # Generate Drizzle migrations
bun run db:migrate      # Run migrations
bun run db:push         # Push schema to DB directly
bun run db:pull         # Pull schema from DB
```

## Architecture / Patterns

**DDD Feature Structure** — Each feature follows strict layering:
```
feature/
├── core/              # Entities, aggregates, value objects (pure domain logic)
├── application/       # Use cases and event subscribers (orchestration)
├── infrastructure/    # Repository implementations, DB, external services
└── presentation/      # Controllers, JSX UI components
```

**Path Aliases** — Uses `#` imports mapped in `package.json` `imports` field:
- `#shared/database/*`, `#shared/event/*`, `#shared/fs/*`, `#shared/ui/components/*`
- `#upload/*`, `#analyses/*`

**Result/Either** — Use cases and repositories return `Result<T>` from `@prj-conq/lib`. Use `.isSuccess()`, `.isError()`, `.getValue()`.

**Event-Driven** — Domain events (`FileUploadedEvent`) published to `EventBusInstance`. Subscribers registered during bootstrap in `main.ts`.

**DI via Static Factories** — Classes expose `create()` with optional overrides for test mocking.

**Repository Pattern** — `IBaseRepository<T>` with `insertOne`, `updateOne`, `findById`, `findOne`, `deleteOne`. Drizzle ORM over SQLite.

**Server-Side Rendering** — KitaJS JSX renders HTML, HTMX for dynamic updates, Pico CSS + SASS for styling.

## Testing Conventions

- **Framework**: Bun test runner
- **File layout**: `tests/` mirrors `src/` — `tests/features/upload/`, `tests/shared/infrastructure/`
- **Mocking**: `bun-automock` for auto-mocking imports
- **Factories**: `fishery` for building test data
- **Database**: In-memory SQLite for test isolation
- **E2E**: Playwright (not currently in e2e dir)

## Export Rules

This is a private app — not consumed as a library. No barrel exports needed. Uses `#` path aliases for internal imports.

## Standards

- All public API exports MUST have JSDoc with @param, @returns, @example
- Biome strict mode: noExplicitAny, noUnusedVariables, noNonNullAssertion
- Tests mirror src/ structure under tests/
- VCS-aware formatting: only changed files are linted (--changed flag)
