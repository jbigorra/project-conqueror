# @prj-conq/behave

Code analysis engine that orchestrates `@prj-conq/code-maat-port` + `@prj-conq/lizard-ts` to run behavioural code analysis. Pipeline: parse -> analyse -> format.

## Installation

Monorepo-internal package:

```bash
pnpm add @prj-conq/behave@workspace:^
```

## Usage

### Behave facade (recommended)

```typescript
import { Behave } from "@prj-conq/behave";

const behave = new Behave("/path/to/git.log");

// Simple analyses (code-maat only)
const revisions = await behave.revisions();
const authors = await behave.authors({ format: "json" });
const coupling = await behave.coupling({ options: { minRevs: 3 } });

// Aggregated analysis (code-maat + lizard)
const hotspots = await behave.complexityHotspots({ sourceDir: "/path/to/source" });
```

### Direct function API

```typescript
import { complexityHotspots } from "@prj-conq/behave";
import * as simple from "@prj-conq/behave";

// Run a specific simple analysis
const result = await simple.revisions({
  gitLogPath: "/path/to/git.log",
  vcsType: "git",
  format: "json",
  options: { minRevs: 5, minSharedRevs: 5, minCoupling: 30, maxCoupling: 100, maxChangesetSize: 30 },
});

// Run complexity hotspots (code-maat revisions + lizard cyclomatic complexity)
const hotspots = await complexityHotspots({
  gitLogPath: "/path/to/git.log",
  sourceDir: "/path/to/source",
  format: "json",
});
```

### Output formats

```typescript
// JSON output (default) -- typed array
const json = await behave.revisions({ format: "json" });
// json.data = [{ entity: "src/app.ts", nRevs: 12 }, ...]

// CSV output -- raw string
const csv = await behave.revisions({ format: "csv" });
// csv.data = "entity,nRevs\nsrc/app.ts,12\n..."
```

## API Overview

### Behave Class

Facade that binds a git log path and delegates to analysis functions:

| Method | Returns | Description |
|--------|---------|-------------|
| `revisions()` | `Analysis<Revision>` | File revision counts |
| `authors()` | `Analysis<Author>` | Author counts per entity |
| `absChurn()` | `Analysis<AbsChurn>` | Absolute churn trend by date |
| `authorChurn()` | `Analysis<AuthorChurn>` | Churn per author |
| `entityChurn()` | `Analysis<EntityChurn>` | Churn per entity |
| `entityEffort()` | `Analysis<EntityEffort>` | Revision effort per author per entity |
| `entityOwnership()` | `Analysis<EntityOwnership>` | Lines added/deleted per author per entity |
| `coupling()` | `Analysis<Coupling>` | Logical coupling between entities |
| `soc()` | `Analysis<Soc>` | Sum of coupling per entity |
| `age()` | `Analysis<CodeAge>` | Code age in months |
| `communication()` | `Analysis<Communication>` | Developer communication via shared entities |
| `fragmentation()` | `Analysis<Fragmentation>` | Ownership fragmentation (fractal value) |
| `mainDev()` | `Analysis<MainDev>` | Main developer by lines added |
| `mainDevByRevs()` | `Analysis<MainDevByRevs>` | Main developer by revision count |
| `refactoringMainDev()` | `Analysis<RefactoringMainDev>` | Main developer by lines removed |
| `messages()` | `Analysis<MessageEntry>` | Commit message word frequency |
| `summary()` | `Analysis<SummaryEntry>` | Repository summary statistics |
| `complexityHotspots()` | `Analysis<ComplexityHotspot>` | Revision count + cyclomatic complexity merge |

All methods accept optional `SimpleAnalysisInput` (or `ComplexityHotspotsInput` for hotspots) with:
- `format?` -- `"json"` (default) or `"csv"`
- `vcsType?` -- VCS format (default `"git"`)
- `options?` -- `Partial<AnalysisOptions>` filtering thresholds
- `ageTimeNow?`, `expressionToMatch?`, `group?`, `teamMapFile?`, `temporalPeriod?`

### Types

- **`Analysis<T>`** -- Union type: `{ metadata, data: T[] }` (json) or `{ metadata, data: string }` (csv)
- **`AnalysisMetadata`** -- `{ analysisName, timestamp, parameters, format }`
- **`ComplexityHotspot`** -- `{ entity, nRevs, cyclomaticComplexity, linesOfCode }`
- **`SimpleAnalysisInput`** / **`ComplexityHotspotsInput`** -- Input parameter types
- **`OutputFormat`** -- `"json" | "csv"`

### Error Types (Effect tagged errors)

- **`CodeMaatError`** -- Failure from code-maat-port execution
- **`LizardError`** -- Failure from lizard subprocess
- **`FormatError`** -- Failure during CSV formatting

### Legacy API (deprecated)

`LegacyBehave` and `AnalysisOptions` are re-exported from `src/legacy/` for backwards compatibility. Use the `Behave` class instead.

## Development

```bash
bun test                    # Run all tests
bun run tdd                 # Watch mode
bun run test:coverage       # Coverage report
bun run validate            # test + biome check
bun run check               # Biome lint + format
bun run build               # Build with bunup + tsc declarations
bun run dev                 # Watch mode build
```

### Architecture

Built on the [Effect](https://effect.website/) library for composable, type-safe pipelines.

```
src/
  behave.ts                     # Behave facade class
  types.ts                      # Input types (SimpleAnalysisInput, ComplexityHotspotsInput)
  errors.ts                     # Tagged error types (CodeMaatError, LizardError, FormatError)
  index.ts                      # Public barrel
  analyses/
    simple/                     # 18 simple analyses (each wraps code-maat-port via Effect)
    aggregated/
      complexity-hotspots.ts    # Parallel: code-maat revisions + lizard complexity -> merge
  pipeline/
    extract/                    # Default options, parameter extraction
    transform/                  # merge-by-entity (churn + complexity -> hotspots)
    load/                       # to-analysis (format as JSON or CSV)
  schemas/
    analysis.ts                 # Analysis<T>, AnalysisMetadata types
    code-maat.ts                # Effect Schema definitions + TS types for all 18 analyses
    lizard.ts                   # Effect Schema for lizard CSV output -> camelCase types
  services/
    code-maat.ts                # CodeMaatService Effect service
    lizard.ts                   # LizardService Effect service
    index.ts                    # BehaveLive layer (CodeMaatLive + LizardLive)
  legacy/                       # Deprecated: old Behave + AnalysisRunner
```

## Contributing

- All public API exports MUST have JSDoc (`@param`, `@returns`, `@example`)
- Biome strict mode enforced: `noExplicitAny`, `noUnusedVariables`, `noNonNullAssertion`
- Tests mirror `src/` structure under `tests/`
- Run `bun run validate` before committing
