# Behave Package Repurpose — Design Spec

## Summary

Repurpose the `@prj-conq/behave` package from a Code-Maat Java CLI wrapper into an SDK for generating aggregated and simple code analyses. The package will use **Effect** as its core foundation for composable, functional pipelines with typed errors and dependency injection.

The first aggregated analysis is **complexity hotspots** (high churn + high complexity), combining data from `code-mat-port` (churn/revisions) and `@prj-conq/lizard-ts` (cyclomatic complexity).

All 18 code-maat-port analyses will also be exposed as simple (non-aggregated) analyses through the new API.

The existing behave API (`BehaveInstance`, `Behave`, `AnalysisOptions`) remains exported and functional during the transition. Once consumers migrate to the new API, the legacy code is removed.

## Acceptance Criteria

1. Behave exposes an API to generate **complexity hotspots** analysis (aggregated: churn + complexity).
2. Behave exposes an API to generate all 18 **simple (non-aggregated)** analyses from code-maat-port.
3. Each analysis accepts an `OutputFormat` parameter (`"csv"` or `"json"`, defaults to `"json"`).
4. The returned `Analysis<T>` has a structured output: `{ metadata, data }`.
5. The public API is plain async functions returning `Promise<Analysis<T>>` — consumers do not need to know about Effect.
6. The legacy API (`BehaveInstance`, `Behave`, `AnalysisOptions`) continues to work unchanged.

## Core Types

### OutputFormat

```typescript
type OutputFormat = "json" | "csv"
```

### AnalysisMetadata

```typescript
type AnalysisMetadata = {
  analysisName: string
  timestamp: Date
  parameters: Record<string, unknown>
  format: OutputFormat
}
```

- `parameters` is intentionally `Record<string, unknown>` — it records what options were used, but consumers filter on `data`, not `parameters`.

### Analysis\<T\>

Discriminated union based on format, so consumers get type-safe access to `data`:

```typescript
type Analysis<T> =
  | { metadata: AnalysisMetadata & { format: "json" }; data: T[] }
  | { metadata: AnalysisMetadata & { format: "csv" }; data: string }
```

When `format` is `"json"`, `data` is `T[]`. When `format` is `"csv"`, `data` is a CSV string. Consumers narrow on `metadata.format`:

```typescript
const result = await simple.revisions({ gitLogPath: "...", format: "csv" })
if (result.metadata.format === "csv") {
  // result.data is string
}
```

### ComplexityHotspot

The output type for the complexity hotspots aggregated analysis:

```typescript
type ComplexityHotspot = {
  entity: string
  nRevs: number
  cyclomaticComplexity: number
}
```

- `entity` — file path (from code-maat-port revisions)
- `nRevs` — number of revisions / churn (from code-maat-port revisions)
- `cyclomaticComplexity` — max cyclomatic complexity across functions in that file (from lizard-ts)

### LizardFunctionMetrics

Typed representation of lizard-ts CSV output (new type — does not exist in lizard-ts today):

```typescript
type LizardFunctionMetrics = {
  nloc: number
  cyclomaticComplexity: number
  tokenCount: number
  parameters: number
  length: number
  location: string
  file: string
  functionName: string
  longName: string
  startLine: number
  endLine: number
}
```

Maps from lizard CSV columns: `nloc, cyclomatic_complexity, token_count, parameters, length, location, file, function, long_name, start_line, end_line`.

### Errors

Tagged error classes using Effect's `Data.TaggedError`:

```typescript
class CodeMaatError extends Data.TaggedError("CodeMaatError")<{ cause: unknown }> {}
class LizardError extends Data.TaggedError("LizardError")<{ cause: unknown }> {}
class FormatError extends Data.TaggedError("FormatError")<{ message: string }> {}
```

Schema validation uses Effect's native `ParseError` from `effect/ParseResult` (merged into the main `effect` package in v3) — no custom wrapper. An aggregated analysis like complexity hotspots has the error type `CodeMaatError | LizardError | FormatError | ParseError` where `ParseError` is Effect's own type.

Since the public API uses `Effect.runPromise`, all Effect errors surface as **thrown exceptions** (rejected promises). Consumers use standard `try/catch`:

```typescript
try {
  const result = await complexityHotspots({ gitLogPath: "...", sourceDir: "..." })
} catch (error) {
  if (error instanceof CodeMaatError) { /* churn analysis failed */ }
  if (error instanceof LizardError) { /* complexity analysis failed */ }
}
```

## Architecture

### Effect as Internal Implementation Detail

Effect powers the internals (composition, typed errors, services, schema validation), but the **public API is plain async functions returning `Promise`**. Consumers do not import from `effect`, call `Effect.runPromise`, or provide layers.

Each exported analysis function is a thin facade:

```typescript
// Internal — the Effect pipeline
const complexityHotspotsEffect = (input: ComplexityHotspotsInput) =>
  Effect.gen(function* () { /* pipeline */ })

// Public — plain async function
export const complexityHotspots = (
  input: ComplexityHotspotsInput
): Promise<Analysis<ComplexityHotspot>> =>
  Effect.runPromise(
    complexityHotspotsEffect(input).pipe(Effect.provide(BehaveLive))
  )
```

### Services

Services wrap `code-mat-port` and `@prj-conq/lizard-ts` as injectable Effect capabilities. Tag and live layer are colocated in one file per service. Both services return `unknown[]` — schema decoding happens at the analysis level for consistency.

#### CodeMaatService

```typescript
class CodeMaatService extends Context.Tag("CodeMaatService")<
  CodeMaatService,
  {
    readonly runAnalysis: (
      logFilePath: string,
      options: AppOptions
    ) => Effect.Effect<unknown[], CodeMaatError>
  }
>() {}

const CodeMaatLive = Layer.succeed(CodeMaatService, {
  runAnalysis: (logFilePath, options) =>
    Effect.tryPromise({
      try: () => app.runAnalysis(logFilePath, options),
      catch: (e) => new CodeMaatError({ cause: e }),
    }),
})
```

- Returns `unknown[]` because `app.runAnalysis()` returns different shapes per analysis.

#### LizardService

```typescript
class LizardService extends Context.Tag("LizardService")<
  LizardService,
  {
    readonly analyze: (
      sourcePath: string
    ) => Effect.Effect<unknown[], LizardError>
  }
>() {}

const LizardLive = Layer.succeed(LizardService, {
  analyze: (sourcePath) =>
    Effect.tryPromise({
      try: async () => {
        const result = await LizardInstance.create().analyze(sourcePath)
        // Lizard.analyze() returns string | Error — handle the Error case
        if (result instanceof Error) throw result
        return result
      },
      catch: (e) => new LizardError({ cause: e }),
    }).pipe(Effect.flatMap(parseLizardCsv)),
})
```

- `Lizard.analyze()` returns `Promise<string | Error>`. The live layer awaits and checks for the `Error` case, throwing it so `Effect.tryPromise` catches it as a `LizardError`.
- `parseLizardCsv` is **new code to be written** — parses the CSV string into `unknown[]` (array of untyped records with string values). It returns `Effect.Effect<unknown[], LizardError>`, wrapping any CSV parse failures as `LizardError` so the service's error channel stays consistent. Schema decoding into `LizardFunctionMetrics[]` happens at the analysis level, consistent with `CodeMaatService`.

#### Combined Layer

```typescript
export const BehaveLive = Layer.merge(CodeMaatLive, LizardLive)
```

### ETL Pipeline Pattern

Each analysis follows the same pattern: **Extract → Decode → Transform (if aggregated) → toAnalysis**.

#### Shared Utility: `toAnalysis`

Handles metadata creation and format conversion (JSON or CSV):

```typescript
const toAnalysis = <T>(
  analysisName: string,
  data: T[],
  input: { format?: OutputFormat; [key: string]: unknown }
): Effect.Effect<Analysis<T>, FormatError> =>
  Effect.gen(function* () {
    const format = input.format ?? "json"
    const metadata = {
      analysisName,
      timestamp: new Date(),
      parameters: extractParameters(input),
      format,
    }
    if (format === "csv") {
      return { metadata: { ...metadata, format: "csv" as const }, data: yield* toCsv(data) }
    }
    return { metadata: { ...metadata, format: "json" as const }, data }
  })
```

#### `extractParameters`

Copies all input fields except `format` into the metadata `parameters` record:

```typescript
const extractParameters = (input: Record<string, unknown>): Record<string, unknown> => {
  const { format, ...params } = input
  return params
}
```

#### `toCsv`

Converts an array of objects to a CSV string. Uses column headers derived from the keys of the first record. Returns a `FormatError` if the data is empty or conversion fails. Implementation will use a lightweight CSV serializer (e.g., manual join for flat records — all analysis outputs are flat single-level objects, no nested structures).

```typescript
const toCsv = <T extends Record<string, unknown>>(
  data: T[]
): Effect.Effect<string, FormatError> => { /* ... */ }
```

#### Aggregated Analysis: Complexity Hotspots

```typescript
const complexityHotspotsEffect = (input: ComplexityHotspotsInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const lizard = yield* LizardService

    // Extract (parallel)
    const [churnData, complexityData] = yield* Effect.all([
      codeMaat.runAnalysis(input.gitLogPath, {
        analysis: "revisions",
        versionControl: input.vcsType ?? "git",
        ...withDefaults(input.options),
      }),
      lizard.analyze(input.sourceDir),
    ], { concurrency: 2 })

    // Decode
    const churn = yield* Schema.decodeUnknown(RevisionsSchema)(churnData)
    const complexity = yield* Schema.decodeUnknown(LizardMetricsSchema)(complexityData)

    // Transform — merge by entity, compute hotspot
    const hotspots = mergeByEntity(churn, complexity)

    // Load
    return yield* toAnalysis("complexity-hotspots", hotspots, input)
  })
```

- Churn and complexity extraction run in parallel via `Effect.all`.
- `Schema.decodeUnknown` returns Effect's native `ParseError` on validation failure — no custom wrapper.

#### `mergeByEntity` — Join Logic

Performs an **inner join** on `entity` (file path). Only files that appear in **both** churn data and complexity data produce a hotspot. Files present in only one source are excluded because a hotspot requires both high churn and high complexity.

For complexity, lizard produces per-function metrics. `mergeByEntity` first aggregates lizard data per file by taking the **maximum `cyclomaticComplexity`** across all functions in that file, then joins with churn data on file path.

```typescript
const mergeByEntity = (
  churn: Revision[],        // { entity, nRevs }
  complexity: LizardFunctionMetrics[]  // per-function, has `file` field
): ComplexityHotspot[] => {
  // 1. Aggregate complexity per file (max cyclomatic complexity)
  // 2. Inner join on entity === file
  // 3. Return { entity, nRevs, cyclomaticComplexity }
}
```

#### Shared Helper: `buildAppOptions`

Builds the full `AppOptions` object from `SimpleAnalysisInput`, forwarding analysis-specific fields:

```typescript
const buildAppOptions = (
  analysisName: string,
  input: SimpleAnalysisInput
): AppOptions => ({
  analysis: analysisName,
  versionControl: input.vcsType ?? "git",
  ...withDefaults(input.options),
  ageTimeNow: input.ageTimeNow,
  expressionToMatch: input.expressionToMatch,
  group: input.group,
  teamMapFile: input.teamMapFile,
  temporalPeriod: input.temporalPeriod,
})
```

#### Simple Analysis (e.g., revisions)

```typescript
const revisionsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService

    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("revisions", input),
    )
    const data = yield* Schema.decodeUnknown(RevisionsSchema)(raw)

    return yield* toAnalysis("revisions", data, input)
  })
```

All 18 code-maat analyses follow this same pattern, each with its own schema. The `identity` analysis uses `Schema.Array(Schema.Unknown)` as its passthrough schema, returning `Analysis<unknown>`.

## Input Types

### Defaults

When consumers pass partial options, behave fills in defaults before calling `app.runAnalysis()`. These match code-maat-port's CLI defaults from `cmd-line.ts`.

**Note:** `AnalysisOptions` here refers to code-mat-port's type (`import type { AnalysisOptions } from "code-mat-port"`) — not the legacy behave `AnalysisOptions` class which has string-typed fields.

```typescript
const DEFAULT_OPTIONS: AnalysisOptions = {
  minRevs: 5,
  minSharedRevs: 5,
  minCoupling: 30,
  maxCoupling: 100,
  maxChangesetSize: 30,
}

const withDefaults = (options?: Partial<AnalysisOptions>): AnalysisOptions => ({
  ...DEFAULT_OPTIONS,
  ...options,
})
```

### Base and Common Input Types

```typescript
type BaseAnalysisInput = {
  format?: OutputFormat       // defaults to "json"
}

type SimpleAnalysisInput = BaseAnalysisInput & {
  gitLogPath: string
  vcsType?: string            // defaults to "git"
  options?: Partial<AnalysisOptions>  // minRevs, minSharedRevs, etc.
  // Analysis-specific optional fields:
  ageTimeNow?: string         // required for "age" analysis (YYYY-MM-DD)
  expressionToMatch?: string  // required for "messages" analysis (regex)
  group?: string              // architectural grouping spec
  teamMapFile?: string        // CSV path for author→team mapping
  temporalPeriod?: string     // time window in days
}

type ComplexityHotspotsInput = BaseAnalysisInput & {
  gitLogPath: string
  sourceDir: string
  vcsType?: string            // defaults to "git"
  options?: Partial<AnalysisOptions>
}
```

### Analysis-Specific Validation

Analyses that require specific fields validate at the start of their pipeline:
- `age` analysis fails with a clear error if `ageTimeNow` is not provided.
- `messages` analysis fails with a clear error if `expressionToMatch` is not provided.
- `identity` analysis is included — it returns raw VCS entries and its schema is a passthrough (`Schema.Unknown`).

## Package Structure

```
packages/behave/src/
├── index.ts                          # Public exports (new + legacy re-exports)
├── analyses/
│   ├── aggregated/
│   │   └── complexity-hotspots.ts    # Churn + complexity → hotspots
│   └── simple/
│       ├── revisions.ts
│       ├── coupling.ts
│       ├── authors.ts
│       ├── ... (all 18)
│       └── index.ts                  # Re-exports all simple analyses
├── schemas/
│   ├── analysis.ts                   # Analysis<T>, AnalysisMetadata
│   ├── code-maat.ts                  # Per-analysis result schemas (RevisionsSchema, etc.)
│   └── lizard.ts                     # LizardFunctionMetrics schema
├── services/
│   ├── code-maat.ts                  # CodeMaatService tag + CodeMaatLive layer
│   ├── lizard.ts                     # LizardService tag + LizardLive layer
│   └── index.ts                      # BehaveLive = merged layers
├── pipeline/
│   ├── extract/
│   │   ├── defaults.ts               # withDefaults(), DEFAULT_OPTIONS
│   │   ├── build-app-options.ts      # buildAppOptions()
│   │   └── parse-lizard-csv.ts       # parseLizardCsv()
│   ├── transform/
│   │   └── merge-by-entity.ts        # mergeByEntity() for hotspots
│   └── load/
│       ├── to-analysis.ts            # toAnalysis() — wraps in Analysis<T>
│       ├── format.ts                 # toCsv() conversion
│       └── extract-parameters.ts     # extractParameters() for metadata
├── errors.ts                         # CodeMaatError, LizardError, FormatError
├── types.ts                          # Input types, OutputFormat
└── legacy/                           # Current behave code, relocated here
    ├── behave.ts
    ├── analyses/
    ├── infrastructure/
    ├── runners/
    └── index.ts
```

**Note:** The legacy code currently lives at the top level of `src/` (`src/behave.ts`, `src/analyses/`, `src/infrastructure/`, `src/runners/`). As part of this work, it will be relocated to `src/legacy/`, which requires updating internal import paths within the legacy code and the `package.json` path aliases (`#behave/*`, `#infra/*`, `#runners/*`, `#analyses/*`) to point to `src/legacy/*`. The legacy build and exports remain functional.

## Public API

```typescript
// New API — analyses
export { complexityHotspots } from "./analyses/aggregated/complexity-hotspots"
export * as simple from "./analyses/simple"

// New API — types for consumers
export type { Analysis, AnalysisMetadata } from "./schemas/analysis"
export type { OutputFormat, ComplexityHotspotsInput, SimpleAnalysisInput } from "./types"
export { CodeMaatError, LizardError, FormatError } from "./errors"

// Legacy (deprecated) — existing consumers keep working
export { default, AnalysisOptions, Behave } from "./legacy"
```

### Consumer Usage

```typescript
import { complexityHotspots, simple } from "@prj-conq/behave"

// Aggregated analysis
const hotspots = await complexityHotspots({
  gitLogPath: "/path/to/git.log",
  sourceDir: "/path/to/source",
  format: "json",
  options: { minRevs: 5 },
})
// → Analysis<ComplexityHotspot> with data: ComplexityHotspot[]

// Simple analysis
const revs = await simple.revisions({
  gitLogPath: "/path/to/git.log",
  format: "csv",
  options: { minRevs: 5 },
})
// → Analysis<Revision> with data: string (CSV)

// Analysis requiring specific fields
const age = await simple.age({
  gitLogPath: "/path/to/git.log",
  ageTimeNow: "2026-03-20",
})
// → Analysis<CodeAge>
```

## Dependencies

### New dependencies for behave

- `effect` — core library (composition, services, layers, schema, errors)
- `code-mat-port` (workspace, `"code-mat-port": "workspace:^"`) — churn/revision analyses
- `@prj-conq/lizard-ts` (workspace) — complexity analysis

### Existing dependencies retained (for legacy)

- `@prj-conq/lib` — Result type, spawnAsync (used by legacy code)
- `csv-parse` — CSV parsing (used by legacy code)

## Testing Strategy

### Unit tests per analysis

Provide test layers with canned data, verify the pipeline produces the correct `Analysis<T>` output. No real code-maat-port or lizard-ts execution.

```typescript
const TestLayer = Layer.merge(
  Layer.succeed(CodeMaatService, {
    runAnalysis: () => Effect.succeed(cannedChurn),
  }),
  Layer.succeed(LizardService, {
    analyze: () => Effect.succeed(cannedComplexity),
  }),
)

const result = await Effect.runPromise(
  complexityHotspotsEffect(input).pipe(Effect.provide(TestLayer))
)
expect(result.data).toEqual(expectedHotspots)
```

Tests use the internal `*Effect` functions (the raw Effect pipelines) to provide test layers instead of live ones.

### Schema tests

Verify the decode schemas correctly validate and reject data shapes from code-maat-port and lizard-ts.

### Integration tests

Use the live layers against real fixture files (git logs, sample source directories) to verify end-to-end pipeline execution.

### Format tests

Verify `toAnalysis` produces correct JSON and CSV outputs for both aggregated and simple analyses.

## Gradual Migration Path

1. Build the new API alongside the existing legacy code.
2. Relocate current behave source files to `src/legacy/`, update internal imports.
3. Legacy exports (`BehaveInstance`, `Behave`, `AnalysisOptions`) remain unchanged.
4. Once the webapp's `AnalysisRunnerSubscriber` is migrated to the new API, remove the legacy code and the vendored Code-Maat JAR (38MB).
