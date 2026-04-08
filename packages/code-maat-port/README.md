# @prj-conq/code-maat-port

TypeScript port of [code-maat](https://github.com/adamtornhill/code-maat) -- VCS log analysis for computing coupling, churn, authorship, code age, and other software evolution metrics.

## Installation

Monorepo-internal package:

```bash
pnpm add @prj-conq/code-maat-port@workspace:^
```

## Usage

### High-level: `runAnalysis` (full pipeline)

```typescript
import { runAnalysis } from "@prj-conq/code-maat-port";

const results = await runAnalysis("/path/to/git.log", {
  versionControl: "git",
  analysis: "revisions",
  minRevs: 5,
  minSharedRevs: 5,
  minCoupling: 30,
  maxCoupling: 100,
  maxChangesetSize: 30,
});
// [{ entity: "src/app.ts", nRevs: 5 }, { entity: "src/index.ts", nRevs: 3 }]
```

### Low-level: individual parsers and analyses

```typescript
import { parseGitReadLog, byCount } from "@prj-conq/code-maat-port";

// Parse a git log from a string
const entries = parseGitReadLog(logText, {});

// Run a specific analysis on parsed entries
const authorCounts = byCount(entries, {
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 0,
  maxCoupling: 100,
  maxChangesetSize: 1000,
});
```

### With grouping and team mapping

```typescript
import { runAnalysis } from "@prj-conq/code-maat-port";

const results = await runAnalysis("/path/to/git.log", {
  versionControl: "git",
  analysis: "coupling",
  minRevs: 5,
  minSharedRevs: 5,
  minCoupling: 30,
  maxCoupling: 100,
  maxChangesetSize: 30,
  // Architectural grouping
  group: "src/features/auth => Auth\nsrc/features/billing => Billing",
  // Team mapping
  teamMapFile: "author1,Backend\nauthor2,Frontend",
  // Time-based windowing
  temporalPeriod: "30",
});
```

## API Overview

### Orchestration

- **`runAnalysis(logFilePath, options)`** -- Full pipeline: parse -> aggregate -> analyse. Primary entry point.
- **`runGrouper(groupSpec, entries)`** -- Groups entities by architectural boundaries.
- **`runTeamMapper(entries, lookup)`** -- Replaces author names with team names.
- **`byTimePeriod(entries, options)`** -- Re-groups commits into sliding time windows.

### Parsers (VCS log -> VCSEntry[])

Each parser exposes `parseLog(path, {})` (async, file-based) and `parseReadLog(text, {})` (sync, string-based):

| VCS | Async | Sync |
|-----|-------|------|
| git | `parseGitLog` | `parseGitReadLog` |
| git2 | `parseGit2Log` | `parseGit2ReadLog` |
| Mercurial | `parseMercurialLog` | `parseMercurialReadLog` |
| Perforce | `parsePerforceLog` | `parsePerforceReadLog` |
| TFS | `parseTfsLog` | `parseTfsReadLog` |
| SVN | `parseSvnLog` | `parseSvnReadLog` |

### Analyses

18 analyses covering authorship, churn, coupling, effort, and more:

| Analysis | Function(s) |
|----------|-------------|
| Authors | `allAuthors`, `byCount`, `ofModule` |
| Revisions | `allEntities`, `allRevisions`, `byRevision`, `revisionsOf` |
| Coupling | `couplingByDegree` |
| Sum of Coupling | `asSoc`, `socByDegree` |
| Churn | `absolutesTrend`, `byAuthor`, `byEntity`, `asOwnership`, `byMainDeveloper`, `byRefactoringMainDeveloper` |
| Effort | `asRevisionsPerAuthor`, `asMainDeveloperByRevisions`, `asEntityFragmentation` |
| Communication | `bySharedEntities` |
| Code Age | `byAge` |
| Commit Messages | `byWordFrequency` |
| Summary | `overview` |

### Types

- **`VCSEntry`** -- Single file change in a commit (`author`, `entity`, `rev`, `date?`, `locAdded?`, `locDeleted?`, `message?`).
- **`AnalysisOptions`** -- Filtering thresholds (`minRevs`, `minSharedRevs`, `minCoupling`, `maxCoupling`, `maxChangesetSize`).
- **`AppOptions`** -- Full pipeline options extending `AnalysisOptions` with `versionControl`, `analysis`, and optional `group`/`teamMapFile`/`temporalPeriod`/`ageTimeNow`/`expressionToMatch`.

## Development

```bash
bun test                     # Run unit tests
bun run test:parity          # Run all tests including parity tests against original Clojure output
bun run tdd                  # Watch mode
bun run test:coverage        # Coverage report
bun run typecheck            # Type-check
bun run validate             # typecheck + test + biome check
bun run check                # Biome lint + format
```

### Project Structure

```
src/code_maat/
  types.ts                     # VCSEntry, AnalysisOptions
  app/                         # Top-level orchestration (runAnalysis, grouper, team-mapper)
  analysis/                    # 18 analysis modules (authors, churn, coupling, etc.)
  parsers/                     # VCS log parsers (git, git2, hg, p4, svn, tfs)
  dataset/                     # Dataset abstraction
  cmd-line.ts                  # CLI argument types
src/index.ts                   # Public barrel (named exports only)
tests/                         # Mirrors src/ structure
tests/code_maat/end_to_end/    # 49 end-to-end scenario tests
tests/fixtures/log-fixtures/   # Sample VCS log files
```

### Export Rules

The barrel `src/index.ts` uses **named exports only** (`export { X } from`). Do NOT use `export * as namespace from` -- Bun's DTS bundler cannot handle namespace re-exports with `noExternal`, which breaks downstream builds.

## Contributing

- All public API exports MUST have JSDoc (`@param`, `@returns`, `@example`)
- Biome strict mode enforced: `noExplicitAny`, `noUnusedVariables`, `noNonNullAssertion`
- Tests mirror `src/` structure under `tests/`
- Run `bun run validate` before committing
