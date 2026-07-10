# CLAUDE.md — @prj-conq/lizard-ts

## What This Package Does

TypeScript wrapper around the Python [lizard](https://github.com/terryyin/lizard) tool for cyclomatic complexity analysis. Spawns a Python subprocess to analyze source files and returns CSV results. Consumed by `@prj-conq/behave` for the `complexityHotspots` aggregated analysis.

## Key Files

- `src/index.ts` — Public API: `LizardInstance` singleton factory + `Lizard` class
- `src/ts-lizard/wrapper.ts` — `Lizard` class: calls executor with `--csv` flag, prepends CSV headers
- `src/ts-lizard/infrastructure/lizard-executor.ts` — `LizardExecutor`: runs `python -m lizard` via `.venv/bin/python`, spawns subprocess via `spawnAsync`
- `src/ts-lizard/infrastructure/interfaces.ts` — `ICLIExecutor` interface
- `requirements.txt` — Python dependency: pinned `lizard` version installed into `.venv`
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

**Python Resolution** — `LizardExecutor` resolves `.venv/bin/python` from the package root (via `import.meta.resolve` of `package.json`). The `.venv` is managed by `uv` (portable Python manager from Astral), which downloads a relocatable Python — no system Python required. Run `uv venv --python 3.10 .venv && uv pip install -r requirements.txt` to set up.

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
