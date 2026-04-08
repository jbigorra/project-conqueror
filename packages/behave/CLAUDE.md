# CLAUDE.md — @prj-conq/behave

## What This Package Does

Behavioural code analysis facade. Orchestrates `@prj-conq/code-maat-port` (git log analysis) and `@prj-conq/lizard-ts` (cyclomatic complexity) to produce analysis results. Consumed by `@prj-conq/webapp` and `@prj-conq/charts`. Provides both a `Behave` class API and direct function imports for individual analyses.

## Key Files

- `src/index.ts` — Public API barrel: `Behave` class, `simple.*` functions, `complexityHotspots`, error types, analysis record types
- `src/behave.ts` — `Behave` class: stateful facade that binds a git log path and delegates to `simple.*` analyses
- `src/types.ts` — Input types: `SimpleAnalysisInput`, `ComplexityHotspotsInput`, `OutputFormat`
- `src/errors.ts` — Tagged error types: `CodeMaatError`, `FormatError`, `LizardError`
- `src/analyses/simple/` — 18 individual analysis functions (revisions, authors, churn, coupling, etc.)
- `src/analyses/aggregated/complexity-hotspots.ts` — Combines code-maat revisions + lizard complexity, merges by entity
- `src/schemas/` — Effect `Schema` definitions for analysis records (`code-maat.ts`, `lizard.ts`, `analysis.ts`)
- `src/services/` — Effect service layers: `CodeMaatService`, `LizardService`, `BehaveLive` (merged layer)
- `src/pipeline/` — ETL steps: `extract/` (build options, parse lizard CSV), `load/` (format, to-analysis), `transform/` (merge-by-entity)
- `src/legacy/` — Deprecated `LegacyBehave` (Java subprocess, CSV parsing) — being replaced by new API
- `biome.json` — Biome linter/formatter config

## Commands

```bash
bun test                # Run all tests
bun test --coverage     # Tests with coverage
bun test --watch        # TDD watch mode
bun run build           # bunup + tsc declaration emit
bun run dev             # bunup --watch
bun run validate        # Tests + biome check
bun run check           # biome check --write
```

## Architecture / Patterns

**Effect-based Pipeline** — Each analysis uses the Effect library:
1. **Extract**: Build code-maat options from input (`buildAppOptions`)
2. **Transform**: Run analysis via `CodeMaatService`, decode with `Schema.decodeUnknown`
3. **Load**: Wrap in `Analysis<T>` with metadata, optionally format as CSV

**Service Layer** — `CodeMaatService` and `LizardService` are Effect services. `BehaveLive` merges both layers. Production code uses `Effect.runPromise` with `BehaveLive`.

**Aggregated Analyses** — `complexityHotspots` combines revisions (code-maat) + complexity (lizard), merging results by entity path.

**Legacy vs New** — `src/legacy/` contains the old Java-subprocess-based `Behave` (spawns code-maat JAR). New API under `src/analyses/` uses `@prj-conq/code-maat-port` (pure TypeScript). Both coexist during migration.

## Testing Conventions

- **Framework**: Bun test runner
- **File layout**: `tests/` mirrors `src/` — `tests/analyses/simple/`, `tests/pipeline/`, `tests/services/`
- **Mocking**: `bun-automock` for service isolation
- **Factories**: `fishery` for building test data (`tests/fixtures/factories/`)
- **Integration tests**: `tests/integration/` — run real code-maat-port + lizard against fixture git logs
- **Fixtures**: `tests/fixtures/` — git log text, sample source files, analysis record factories

## Export Rules

Single export path `.` in `package.json`. Named exports only in barrel. Exposes:
- `Behave` class + `simple` namespace + `complexityHotspots` function
- All analysis record types (as `type` exports)
- Error types: `CodeMaatError`, `FormatError`, `LizardError`
- Legacy: `LegacyBehave`, `AnalysisOptions` (deprecated)

Built with `bunup` + `tsc -p tsconfig.build.json`.

## Standards

- All public API exports MUST have JSDoc with @param, @returns, @example
- Biome strict mode: noExplicitAny, noUnusedVariables, noNonNullAssertion
- Tests mirror src/ structure under tests/
- VCS-aware formatting: only changed files are linted (--changed flag)
