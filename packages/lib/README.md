# @prj-conq/lib

Shared foundational patterns and utilities used across the monorepo: Result monad, EventBus (pub/sub), subprocess spawning, and generic types.

## Installation

Monorepo-internal package:

```bash
pnpm add @prj-conq/lib@workspace:^
```

## Usage

### Result monad (Railway-Oriented Error Handling)

```typescript
import { Result } from "@prj-conq/lib/patterns";

// Create results
const success = Result.success({ id: 1, name: "Alice" });
const failure = Result.error<User>(new Error("Not found"));

// Check and extract
if (success.isSuccess()) {
  console.log(success.getValue()); // { id: 1, name: "Alice" }
}
if (failure.isError()) {
  console.log(failure.getError().message); // "Not found"
}

// Chain operations
const result = Result.success(5)
  .map((n) => n * 2)           // Result.success(10)
  .flatMap((n) =>
    n > 0
      ? Result.success(n)
      : Result.error(new Error("Must be positive"))
  );
```

### EventBus (Publish/Subscribe)

```typescript
import { EventBus, BaseDomainEvent, BaseEventHandler } from "@prj-conq/lib/patterns";

// Define an event
class UserCreated extends BaseDomainEvent {
  constructor(userId: string) {
    super("UserCreated", userId, { userId });
  }
}

// Define a handler
class SendWelcomeEmail extends BaseEventHandler {
  constructor() {
    super("UserCreated", "SendWelcomeEmail");
  }
  async handle(event) {
    await sendEmail(event.payload.userId);
    return this.success();
  }
}

// Wire up
const bus = new EventBus({ enableLogging: true, maxRetries: 2, retryDelay: 1000 });
bus.subscribe(new SendWelcomeEmail());
const result = await bus.publish(new UserCreated("user-123"));
// result = { success: true, handledCount: 1, errors: [] }
```

### spawnAsync (Subprocess Helper)

```typescript
import { spawn } from "node:child_process";
import { spawnAsync } from "@prj-conq/lib/processes";

const run = spawnAsync({ spawn });
const result = await run("git", ["log", "--oneline", "-5"]);

if (result.isSuccess()) {
  console.log(result.stdout);
} else {
  console.error(result.errorMessage());
}
```

### CLIResult

```typescript
import { CLIResult } from "@prj-conq/lib/processes";

// CLIResult wraps subprocess output
const result = new CLIResult(0, "output", "", null);
result.isSuccess();    // true
result.isFailure();    // false
result.errorCode;      // 0
result.stdout;         // "output"
result.errorMessage(); // undefined (success has no error message)
```

## API Overview

### `@prj-conq/lib/patterns`

**Result<T>** -- Railway-oriented error handling:
- `Result.success<T>(value)` / `Result.error<T>(error)` -- Static factories
- `.isSuccess()` / `.isError()` -- Type guards
- `.getValue()` / `.getError()` -- Extract inner value (throws if wrong variant)
- `.map(fn)` -- Transform success value
- `.flatMap(fn)` -- Chain with another Result-returning function

**EventBus** -- Typed pub/sub with retry support:
- `subscribe(handler)` -- Register a handler (duplicate detection)
- `unsubscribe(eventType, handlerName)` -- Remove a specific handler
- `unsubscribeAll(eventType)` -- Remove all handlers for an event type
- `publish(event)` -- Dispatch to all matching handlers in parallel, returns `PublishResult`
- `getRegisteredEventTypes()` / `getHandlers(eventType)` -- Introspection
- `clear()` -- Remove all handlers (useful in tests)
- Config: `enableLogging`, `maxRetries`, `retryDelay`

**BaseDomainEvent** -- Abstract base class implementing `DomainEvent`:
- `eventId` (auto-generated), `eventType`, `createdAt`, `aggregateId`, `version`, `payload`

**BaseEventHandler<T>** -- Abstract base class implementing `EventHandler<T>`:
- `eventType`, `handlerName`, `handle(event)`
- Protected helpers: `success()`, `failure(error)`

### `@prj-conq/lib/processes`

**spawnAsync(deps)** -- Factory returning `(command, args, options?) => Promise<TCLIResult>`. Dependency-injected `spawn` for testability.

**CLIResult** -- Structured subprocess result:
- `errorCode` (number or signal), `stdout`, `stderr`, `error`
- `isSuccess()` -- `errorCode === 0`
- `isFailure()` -- `!isSuccess()`
- `errorMessage()` -- Cascades: error.message > stderr > stdout > generic

### `@prj-conq/lib/generics`

- **`Undefinedable<T>`** -- `T | undefined`

## Development

```bash
bun test                    # Run all tests
bun run tdd                 # Watch mode
bun run test:coverage       # Coverage report
bun run validate            # test + biome check
bun run check               # Biome lint + format
bun run build               # Build with bunup
bun run dev                 # Watch mode build
```

### Project Structure

```
src/
  generics/
    types.ts                # Undefinedable<T>
    index.ts                # Barrel
  patterns/
    result.ts               # Result<T>, Success<T>, Failure<T>
    eventbus/
      domain-event.ts       # DomainEvent interface, BaseDomainEvent
      event-handler.ts      # EventHandler interface, BaseEventHandler
      event-bus.ts          # EventBus class (subscribe, publish, retry)
      index.ts              # Barrel
    index.ts                # Barrel (Result + EventBus)
  processes/
    spawn-async.ts          # spawnAsync factory
    cli-result.ts           # CLIResult class
    index.ts                # Barrel
```

## Contributing

- All public API exports MUST have JSDoc (`@param`, `@returns`, `@example`)
- Biome strict mode enforced: `noExplicitAny`, `noUnusedVariables`, `noNonNullAssertion`
- Tests mirror `src/` structure under `tests/`
- Run `bun run validate` before committing
