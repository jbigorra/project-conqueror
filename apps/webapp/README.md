# @prj-conq/webapp

Modulithic web application for behavioural code analysis, built with Elysia.js + Bun + KitaJS JSX + HTMX + Pico CSS + SQLite/Drizzle.

## Setup

```bash
pnpm install
```

## Usage

```bash
# Start development server with hot reload
bun run dev

# Start with debugger
bun run dev:debug

# Build production binary
bun run build
```

The server starts at `http://localhost:8080` by default.

### Data Flow

1. User uploads a `.log` git log file via `POST /upload`
2. `UploadFile` use case validates, stores to S3, inserts a DB record, and publishes `FileUploadedEvent`
3. `AnalysisRunnerSubscriber` handles the event asynchronously:
   - Saves the file locally via `LocalFileStorage`
   - Runs behavioural code analysis via `@prj-conq/behave`
   - Parses results and persists them
4. UI updates via HTMX partial responses (server-rendered HTML)

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server with file watching |
| `bun run dev:debug` | Start dev server with `--inspect-wait` |
| `bun run build` | Compile to standalone Bun binary |
| `bun test` | Run all tests |
| `bun test --coverage` | Run tests with coverage report |
| `bun test --watch` | TDD watch mode |
| `bun run typecheck` | Type-check without emitting |
| `bun run db:generate` | Generate Drizzle migrations |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:push` | Push schema directly (dev only) |
| `bun run db:pull` | Pull schema from database |

## Architecture

### Feature Structure (DDD)

Each feature in `src/features/` follows strict layering:

```
src/features/
  upload/
    core/              # Entities, aggregates, value objects (pure domain logic)
    application/       # Use cases and event subscribers (orchestration)
    infrastructure/    # Repository implementations, DB adapters, external services
    presentation/      # Controllers, JSX UI components
  analyses/
    core/
    application/
    infrastructure/
    presentation/
```

### Shared Infrastructure

```
src/shared/
  generics-types/      # IUseCase, IBaseRepository, DomainEntity base class
  dependencies/        # Dependency wiring
  infrastructure/
    client/            # Client-side assets
    database/          # Drizzle ORM setup (dev/prod/test factories, in-memory SQLite for tests)
    domain/events/     # Domain event definitions
    event/             # EventBusInstance singleton
    fs/                # S3FileStorage, LocalFileStorage
    http/              # HTTP utilities
    logging/           # Logging setup
    server/            # Elysia server configuration
  presentation/
    ui/                # Shared UI components, partials, layouts (KitaJS JSX)
```

### Key Patterns

- **Result/Either (Railway-Oriented)**: All use cases and repositories return `Result<T>` from `@prj-conq/lib`. Chain with `.map()` and `.flatMap()`.
- **Event-Driven Architecture**: Domain events flow through `EventBusInstance` (pub/sub). Register subscribers in `bootstrap.ts`.
- **Dependency Injection via Static Factories**: Classes expose `create()` with optional dependency overrides for test mocking -- no DI container needed.
- **Repository Pattern**: Repositories implement `IBaseRepository<T extends DomainEntity>` with `insertOne`, `updateOne`, `findById`, `findOne`, `deleteOne`.
- **Path Aliases**: Uses `#` import aliases (e.g., `#shared/database/*`, `#upload/*`) defined in `package.json` imports field.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun 1.2.21+ |
| Web framework | Elysia.js (swagger, opentelemetry, static, html plugins) |
| UI | KitaJS JSX (server-rendered) + HTMX + Pico CSS + SASS |
| Database | SQLite via Drizzle ORM (`drizzle-kit` for migrations) |
| Analysis | `@prj-conq/behave` (code-maat-port + lizard-ts) |
| Testing | Bun test runner + `bun-automock` + `fishery` factories + Playwright (E2E) |

## Contributing

- All public API exports MUST have JSDoc (`@param`, `@returns`, `@example`)
- Tests mirror `src/` structure under `tests/`
- Follow DDD layering: domain logic in `core/`, orchestration in `application/`, adapters in `infrastructure/`, HTTP+UI in `presentation/`
- Run `bun run typecheck && bun test` before committing
