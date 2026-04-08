# CLAUDE.md — @prj-conq/lizard-ts

## What This Package Does

TypeScript wrapper around the Python [lizard](https://github.com/terryyin/lizard) tool for cyclomatic complexity analysis. Spawns a Python subprocess to analyze source files and returns CSV results. Consumed by `@prj-conq/behave` for the `complexityHotspots` aggregated analysis.

## Key Files

- `src/index.ts` — Public API: `LizardInstance` singleton factory + `Lizard` class
- `src/ts-lizard/wrapper.ts` — `Lizard` class: calls executor with `--csv` flag, prepends CSV headers
- `src/ts-lizard/infrastructure/lizard-executor.ts` — `LizardExecutor`: resolves python-lizard path, spawns Python subprocess via `spawnAsync`
- `src/ts-lizard/infrastructure/interfaces.ts` — `ICLIExecutor` interface
- `src/python-lizard/` — Vendored Python lizard source (lizard.py + venv)
- `biome.json` — Biome linter/formatter config

## Commands

```bash
bun test                # Run all tests
bun test --coverage     # Tests with coverage
bun test --watch        # TDD watch mode
bun run build           # bunup (no tsc — no declaration files needed beyond bunup)
bun run dev             # bunup --watch
bun run validate        # Tests + biome check
bun run check           # biome check --write
```

## Architecture / Patterns

**Singleton Pattern** — `LizardInstance.create()` returns a single `Lizard` instance. Internally wires `spawnAsync` + `LizardExecutor`.

**Dependency Injection** — `Lizard` accepts an `ICLIExecutor` interface. `LizardExecutor` accepts a `TSpawnAsyncFn`. Both injectable for testing.

**Python Resolution** — `LizardExecutor` resolves the python-lizard directory at construction time by walking from the package's `package.json` location. Searches `dist/python-lizard` then `src/python-lizard`. Uses a vendored `.venv/bin/python` to avoid system Python conflicts.

**Result Pattern** — `LizardExecutor.execute()` returns `Result<TCLIResult>` from `@prj-conq/lib`. Errors are wrapped, not thrown.

## Testing Conventions

- **Framework**: Bun test runner
- **File layout**: `tests/` mirrors `src/` — `tests/ts-lizard/infrastructure/`, `tests/ts-lizard/wrapper.test.ts`
- **Mocking**: `bun-automock` for isolating the executor from actual Python subprocess
- **Integration tests**: `tests/ts-lizard/lizard-integration.test.ts` — runs real Python lizard against sample source files
- **Sample data**: `tests/ts-lizard/sample-folder-for-integration-test/`

## Export Rules

Single export path `.` in `package.json`. Exports `LizardInstance` (singleton factory) and `Lizard` (class). Built with `bunup`.

## Standards

- All public API exports MUST have JSDoc with @param, @returns, @example
- Biome strict mode: noExplicitAny, noUnusedVariables, noNonNullAssertion
- Tests mirror src/ structure under tests/
- VCS-aware formatting: only changed files are linted (--changed flag)
