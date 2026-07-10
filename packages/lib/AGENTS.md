# CLAUDE.md — @prj-conq/lib

## What This Package Does

Shared utility library providing foundational patterns used across all packages: Result monad, EventBus, process spawning, and generic types. Consumed by `@prj-conq/behave`, `@prj-conq/lizard-ts`, `@prj-conq/code-maat-ts`, and `@prj-conq/webapp`.

## Key Files

- `src/generics/index.ts` — Generic type utilities (e.g., `Undefinedable`)
- `src/generics/types.ts` — Type definitions
- `src/patterns/index.ts` — Barrel for `Result` + `EventBus`
- `src/patterns/result.ts` — `Result<T>` monad: `Result.success(v)`, `Result.error(e)`, `.map()`, `.flatMap()`, `.isSuccess()`, `.isError()`
- `src/patterns/eventbus/event-bus.ts` — `EventBus`: subscribe/publish/unsubscribe with retry support
- `src/patterns/eventbus/domain-event.ts` — `DomainEvent` base type
- `src/patterns/eventbus/event-handler.ts` — `EventHandler` interface
- `src/processes/index.ts` — Barrel for `spawnAsync` + `CLIResult`
- `src/processes/spawn-async.ts` — `spawnAsync`: wraps Node `child_process.spawn` into async `Promise<TCLIResult>`
- `src/processes/cli-result.ts` — `CLIResult`: structured result from CLI subprocess (stdout, stderr, errorCode, isSuccess/isFailure)
- `biome.json` — Biome linter/formatter config

## Commands

```bash
bun test                # Run all tests
bun test --coverage     # Tests with coverage
bun test --watch        # TDD watch mode
bun run build           # bunup
bun run dev             # bunup --watch
bun run validate        # Tests + biome check
bun run check           # biome check --write
```

## Architecture / Patterns

**Result Monad** — Railway-oriented error handling. `Result<T>` is abstract with `Success<T>` and `Failure<T>` subclasses. Supports `.map()` and `.flatMap()` for chaining. Used throughout the monorepo instead of try/catch.

**EventBus** — Publish/subscribe with:
- Duplicate handler detection
- Configurable retry with delay (`maxRetries`, `retryDelay`)
- Optional logging
- `clear()` for test cleanup
- All handlers execute in parallel via `Promise.allSettled`

**spawnAsync** — Factory function: `spawnAsync({ spawn })` returns an async function `(command, args, options) => Promise<TCLIResult>`. Dependency-injected `spawn` for testability.

**CLIResult** — Value object wrapping subprocess output. `isSuccess()` checks `errorCode === 0`. `errorMessage()` cascades: error > stderr > stdout > generic message.

## Testing Conventions

- **Framework**: Bun test runner
- **File layout**: `tests/` mirrors `src/` — `tests/patterns/result.test.ts`, `tests/patterns/eventbus/`, `tests/processes/`
- **Mocking**: `bun-automock` for isolating subprocess calls

## Export Rules

Three export paths in `package.json`:
- `./generics` → generic types and type utilities
- `./patterns` → `Result`, `EventBus`, `DomainEvent`, `EventHandler`
- `./processes` → `spawnAsync`, `CLIResult`

Import as: `import { Result } from "@prj-conq/lib/patterns"`, `import { spawnAsync } from "@prj-conq/lib/processes"`.

Built with `bunup`.

## Standards

- All public API exports MUST have JSDoc with @param, @returns, @example
- Biome strict mode: noExplicitAny, noUnusedVariables, noNonNullAssertion
- Tests mirror src/ structure under tests/
- VCS-aware formatting: only changed files are linted (--changed flag)
