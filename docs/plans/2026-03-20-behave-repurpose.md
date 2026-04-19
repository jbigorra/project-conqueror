# Behave Package Repurpose — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repurpose `@prj-conq/behave` into an Effect-powered SDK for aggregated and simple code analyses, starting with complexity hotspots.

**Architecture:** Effect-based ETL pipelines behind plain async facades. Services inject code-mat-port and lizard-ts. Schemas validate at service boundaries. Legacy code relocated to `src/legacy/`.

**Tech Stack:** Effect (v3), Bun test runner, code-mat-port (workspace), @prj-conq/lizard-ts (workspace)

**Spec:** `docs/superpowers/specs/2026-03-20-behave-repurpose-design.md`

---

## Chunk 1: Legacy Relocation & Project Setup

### Task 1: Relocate Legacy Code to `src/legacy/`

**Files:**
- Move: `packages/behave/src/behave.ts` → `packages/behave/src/legacy/behave.ts`
- Move: `packages/behave/src/index.ts` → `packages/behave/src/legacy/index.ts`
- Move: `packages/behave/src/analyses/` → `packages/behave/src/legacy/analyses/`
- Move: `packages/behave/src/infrastructure/` → `packages/behave/src/legacy/infrastructure/`
- Move: `packages/behave/src/runners/` → `packages/behave/src/legacy/runners/`
- Modify: `packages/behave/package.json` (update path aliases)

- [ ] **Step 1: Create `src/legacy/` directory and move all existing source files**

```bash
cd packages/behave
mkdir -p src/legacy
mv src/behave.ts src/legacy/
mv src/analyses src/legacy/
mv src/infrastructure src/legacy/
mv src/runners src/legacy/
mv src/index.ts src/legacy/
```

- [ ] **Step 2: Update `package.json` path aliases to point to legacy**

In `packages/behave/package.json`, update the `imports` field:

```json
{
  "imports": {
    "#behave/*": "./src/legacy/*",
    "#infra/*": "./src/legacy/infrastructure/*",
    "#runners/*": "./src/legacy/runners/*",
    "#analyses/*": "./src/legacy/analyses/*"
  }
}
```

- [ ] **Step 3: Create new `src/index.ts` that re-exports legacy**

Create `packages/behave/src/index.ts`:

```typescript
// Legacy (deprecated) — existing consumers keep working
export { default, AnalysisOptions, Behave } from "./legacy/index"
```

- [ ] **Step 4: Update `bunup.config.ts` JAR copy path**

The build config copies the Code-Maat JAR — update the source path to `src/legacy/`:

In `packages/behave/bunup.config.ts`, update the JAR source path from `src/infrastructure/code_maat/vendor/...` to `src/legacy/infrastructure/code_maat/vendor/...`.

- [ ] **Step 5: Run legacy tests to verify nothing broke**

```bash
cd packages/behave && bun test
```

Expected: All existing tests pass (the tests import via `#behave/*` aliases which now point to `src/legacy/`).

- [ ] **Step 6: Run typecheck**

```bash
cd packages/behave && bun run tsc --noEmit
```

Expected: Clean (no errors).

- [ ] **Step 7: Commit**

```bash
git add packages/behave/
git commit -m "refactor(behave): relocate existing code to src/legacy/"
```

---

### Task 2: Add New Dependencies & Export AppOptions

**Files:**
- Modify: `packages/behave/package.json`
- Modify: `packages/code-mat-port/src/index.ts` (add `AppOptions` export)

- [ ] **Step 1: Add `effect`, `code-mat-port`, and `@prj-conq/lizard-ts`**

```bash
cd packages/behave && pnpm add effect && pnpm add code-mat-port@workspace:^ && pnpm add @prj-conq/lizard-ts@workspace:^
```

- [ ] **Step 2: Export `AppOptions` from code-mat-port's public API**

`AppOptions` is currently only available via `app.AppOptions` namespace access. Add a direct type export to `packages/code-mat-port/src/index.ts`:

```typescript
export type { AppOptions } from "./code_maat/app/app"
```

- [ ] **Step 3: Build workspace dependencies**

```bash
pnpm run build --filter code-mat-port --filter @prj-conq/lizard-ts
```

This ensures `dist/` is available for import resolution.

- [ ] **Step 4: Verify install succeeded**

```bash
cd packages/behave && bun run tsc --noEmit && bun test
```

Expected: Clean typecheck, all legacy tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/behave/package.json packages/code-mat-port/src/index.ts pnpm-lock.yaml
git commit -m "build(behave): add effect, code-mat-port, lizard-ts dependencies"
```

---

### Task 3: Create Core Types

**Files:**
- Create: `packages/behave/src/types.ts`
- Test: `packages/behave/tests/types.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/types.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import type {
  OutputFormat,
  BaseAnalysisInput,
  SimpleAnalysisInput,
  ComplexityHotspotsInput,
} from "../src/types"

describe("types", () => {
  test("OutputFormat accepts json and csv", () => {
    const json: OutputFormat = "json"
    const csv: OutputFormat = "csv"
    expect(json).toBe("json")
    expect(csv).toBe("csv")
  })

  test("SimpleAnalysisInput requires gitLogPath", () => {
    const input: SimpleAnalysisInput = {
      gitLogPath: "/path/to/git.log",
    }
    expect(input.gitLogPath).toBe("/path/to/git.log")
    expect(input.format).toBeUndefined()
    expect(input.vcsType).toBeUndefined()
    expect(input.options).toBeUndefined()
  })

  test("SimpleAnalysisInput accepts all optional fields", () => {
    const input: SimpleAnalysisInput = {
      gitLogPath: "/path/to/git.log",
      vcsType: "git2",
      format: "csv",
      options: { minRevs: 10 },
      ageTimeNow: "2026-03-20",
      expressionToMatch: "fix.*",
      group: "group-spec",
      teamMapFile: "/path/to/teams.csv",
      temporalPeriod: "30",
    }
    expect(input.ageTimeNow).toBe("2026-03-20")
  })

  test("ComplexityHotspotsInput requires gitLogPath and sourceDir", () => {
    const input: ComplexityHotspotsInput = {
      gitLogPath: "/path/to/git.log",
      sourceDir: "/path/to/source",
    }
    expect(input.gitLogPath).toBe("/path/to/git.log")
    expect(input.sourceDir).toBe("/path/to/source")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/types.test.ts
```

Expected: FAIL — cannot find module `../src/types`.

- [ ] **Step 3: Implement types**

Create `packages/behave/src/types.ts`:

```typescript
import type { AnalysisOptions } from "code-mat-port"

export type OutputFormat = "json" | "csv"

export type BaseAnalysisInput = {
  format?: OutputFormat
}

export type SimpleAnalysisInput = BaseAnalysisInput & {
  gitLogPath: string
  vcsType?: string
  options?: Partial<AnalysisOptions>
  ageTimeNow?: string
  expressionToMatch?: string
  group?: string
  teamMapFile?: string
  temporalPeriod?: string
}

export type ComplexityHotspotsInput = BaseAnalysisInput & {
  gitLogPath: string
  sourceDir: string
  vcsType?: string
  options?: Partial<AnalysisOptions>
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/types.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/behave/src/types.ts packages/behave/tests/types.test.ts
git commit -m "feat(behave): add core input types and OutputFormat"
```

---

### Task 4: Create Errors

**Files:**
- Create: `packages/behave/src/errors.ts`
- Test: `packages/behave/tests/errors.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/errors.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { CodeMaatError, LizardError, FormatError } from "../src/errors"

describe("errors", () => {
  test("CodeMaatError is tagged and carries cause", () => {
    const error = new CodeMaatError({ cause: new Error("java failed") })
    expect(error._tag).toBe("CodeMaatError")
    expect(error.cause).toBeInstanceOf(Error)
  })

  test("LizardError is tagged and carries cause", () => {
    const error = new LizardError({ cause: "python not found" })
    expect(error._tag).toBe("LizardError")
    expect(error.cause).toBe("python not found")
  })

  test("FormatError is tagged and carries message", () => {
    const error = new FormatError({ message: "empty data" })
    expect(error._tag).toBe("FormatError")
    expect(error.message).toBe("empty data")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/errors.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement errors**

Create `packages/behave/src/errors.ts`:

```typescript
import { Data } from "effect"

export class CodeMaatError extends Data.TaggedError("CodeMaatError")<{
  cause: unknown
}> {}

export class LizardError extends Data.TaggedError("LizardError")<{
  cause: unknown
}> {}

export class FormatError extends Data.TaggedError("FormatError")<{
  message: string
}> {}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/errors.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/behave/src/errors.ts packages/behave/tests/errors.test.ts
git commit -m "feat(behave): add tagged error types for pipeline stages"
```

---

### Task 5: Create Schemas

**Files:**
- Create: `packages/behave/src/schemas/analysis.ts`
- Create: `packages/behave/src/schemas/lizard.ts`
- Create: `packages/behave/src/schemas/code-maat.ts`
- Test: `packages/behave/tests/schemas/analysis.test.ts`
- Test: `packages/behave/tests/schemas/lizard.test.ts`
- Test: `packages/behave/tests/schemas/code-maat.test.ts`

- [ ] **Step 1: Write analysis schema test**

Create `packages/behave/tests/schemas/analysis.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import type { Analysis, AnalysisMetadata } from "../../src/schemas/analysis"

describe("Analysis types", () => {
  test("JSON format analysis has typed data array", () => {
    type Revision = { entity: string; nRevs: number }
    const analysis: Analysis<Revision> = {
      metadata: {
        analysisName: "revisions",
        timestamp: new Date(),
        parameters: { gitLogPath: "/path" },
        format: "json" as const,
      },
      data: [{ entity: "foo.ts", nRevs: 5 }],
    }
    expect(analysis.data).toHaveLength(1)
    expect(analysis.data[0].entity).toBe("foo.ts")
  })

  test("CSV format analysis has string data", () => {
    const analysis: Analysis<unknown> = {
      metadata: {
        analysisName: "revisions",
        timestamp: new Date(),
        parameters: {},
        format: "csv" as const,
      },
      data: "entity,nRevs\nfoo.ts,5",
    }
    expect(typeof analysis.data).toBe("string")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/schemas/analysis.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement analysis schema**

Create `packages/behave/src/schemas/analysis.ts`:

```typescript
import type { OutputFormat } from "../types"

export type AnalysisMetadata = {
  analysisName: string
  timestamp: Date
  parameters: Record<string, unknown>
  format: OutputFormat
}

export type Analysis<T> =
  | { metadata: AnalysisMetadata & { format: "json" }; data: T[] }
  | { metadata: AnalysisMetadata & { format: "csv" }; data: string }
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/schemas/analysis.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write lizard schema test**

Create `packages/behave/tests/schemas/lizard.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Schema } from "effect"
import { LizardMetricsSchema } from "../../src/schemas/lizard"

describe("LizardMetricsSchema", () => {
  test("decodes valid lizard record", () => {
    const raw = [
      {
        nloc: "5",
        cyclomatic_complexity: "3",
        token_count: "43",
        parameters: "1",
        length: "5",
        location: "constructor@12-16@foo.ts",
        file: "/path/foo.ts",
        function: "constructor",
        long_name: "constructor(args)",
        start_line: "12",
        end_line: "16",
      },
    ]
    const result = Schema.decodeUnknownSync(LizardMetricsSchema)(raw)
    expect(result).toHaveLength(1)
    expect(result[0].cyclomaticComplexity).toBe(3)
    expect(result[0].file).toBe("/path/foo.ts")
    expect(result[0].nloc).toBe(5)
  })

  test("rejects record with missing fields", () => {
    const raw = [{ nloc: "5" }]
    expect(() =>
      Schema.decodeUnknownSync(LizardMetricsSchema)(raw)
    ).toThrow()
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/schemas/lizard.test.ts
```

Expected: FAIL.

- [ ] **Step 7: Implement lizard schema**

Create `packages/behave/src/schemas/lizard.ts`:

```typescript
import { Schema } from "effect"

const NumberFromString = Schema.transform(Schema.String, Schema.Number, {
  decode: (s) => {
    const n = Number(s)
    if (Number.isNaN(n)) throw new Error(`Not a number: ${s}`)
    return n
  },
  encode: (n) => String(n),
})

// Raw CSV columns (snake_case, string values)
const RawLizardRecord = Schema.Struct({
  nloc: NumberFromString,
  cyclomatic_complexity: NumberFromString,
  token_count: NumberFromString,
  parameters: NumberFromString,
  length: NumberFromString,
  location: Schema.String,
  file: Schema.String,
  function: Schema.String,
  long_name: Schema.String,
  start_line: NumberFromString,
  end_line: NumberFromString,
})

// Renamed to camelCase via transform
export const LizardFunctionMetricsItem = Schema.transform(
  RawLizardRecord,
  Schema.Struct({
    nloc: Schema.Number,
    cyclomaticComplexity: Schema.Number,
    tokenCount: Schema.Number,
    parameters: Schema.Number,
    length: Schema.Number,
    location: Schema.String,
    file: Schema.String,
    functionName: Schema.String,
    longName: Schema.String,
    startLine: Schema.Number,
    endLine: Schema.Number,
  }),
  {
    decode: (raw) => ({
      nloc: raw.nloc,
      cyclomaticComplexity: raw.cyclomatic_complexity,
      tokenCount: raw.token_count,
      parameters: raw.parameters,
      length: raw.length,
      location: raw.location,
      file: raw.file,
      functionName: raw.function,
      longName: raw.long_name,
      startLine: raw.start_line,
      endLine: raw.end_line,
    }),
    encode: (camel) => ({
      nloc: camel.nloc,
      cyclomatic_complexity: camel.cyclomaticComplexity,
      token_count: camel.tokenCount,
      parameters: camel.parameters,
      length: camel.length,
      location: camel.location,
      file: camel.file,
      function: camel.functionName,
      long_name: camel.longName,
      start_line: camel.startLine,
      end_line: camel.endLine,
    }),
  }
)

export const LizardMetricsSchema = Schema.Array(LizardFunctionMetricsItem)

export type LizardFunctionMetrics = {
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

> **Note:** If Effect provides a built-in `Schema.NumberFromString`, prefer that over the manual transform. Check the installed version's API.

- [ ] **Step 8: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/schemas/lizard.test.ts
```

Expected: PASS. Adjust the schema implementation if the Effect API differs.

- [ ] **Step 9: Write code-maat schemas test**

Create `packages/behave/tests/schemas/code-maat.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Schema } from "effect"
import {
  RevisionsSchema,
  AuthorsSchema,
  CouplingSchema,
  SocSchema,
  SummarySchema,
  AbsChurnSchema,
  AuthorChurnSchema,
  EntityChurnSchema,
  EntityOwnershipSchema,
  MainDevSchema,
  RefactoringMainDevSchema,
  EntityEffortSchema,
  MainDevByRevsSchema,
  FragmentationSchema,
  CommunicationSchema,
  MessagesSchema,
  AgeSchema,
  IdentitySchema,
} from "../../src/schemas/code-maat"

describe("code-maat schemas", () => {
  test("RevisionsSchema decodes { entity, nRevs }", () => {
    const raw = [{ entity: "foo.ts", nRevs: 5 }]
    const result = Schema.decodeUnknownSync(RevisionsSchema)(raw)
    expect(result[0]).toEqual({ entity: "foo.ts", nRevs: 5 })
  })

  test("AuthorsSchema decodes { entity, nAuthors, nRevs }", () => {
    const raw = [{ entity: "foo.ts", nAuthors: 3, nRevs: 10 }]
    const result = Schema.decodeUnknownSync(AuthorsSchema)(raw)
    expect(result[0]).toEqual({ entity: "foo.ts", nAuthors: 3, nRevs: 10 })
  })

  test("CouplingSchema decodes { entity, coupled, degree, averageRevs }", () => {
    const raw = [{ entity: "a.ts", coupled: "b.ts", degree: 67, averageRevs: 12 }]
    const result = Schema.decodeUnknownSync(CouplingSchema)(raw)
    expect(result[0]).toEqual({ entity: "a.ts", coupled: "b.ts", degree: 67, averageRevs: 12 })
  })

  test("SummarySchema decodes { statistic, value: number }", () => {
    const raw = [{ statistic: "number-of-commits", value: 42 }]
    const result = Schema.decodeUnknownSync(SummarySchema)(raw)
    expect(result[0]).toEqual({ statistic: "number-of-commits", value: 42 })
  })

  test("EntityChurnSchema decodes { entity, added, deleted, commits }", () => {
    const raw = [{ entity: "foo.ts", added: 100, deleted: 20, commits: 5 }]
    const result = Schema.decodeUnknownSync(EntityChurnSchema)(raw)
    expect(result[0]).toEqual({ entity: "foo.ts", added: 100, deleted: 20, commits: 5 })
  })

  test("MainDevSchema decodes { entity, mainDev, added, totalAdded, ownership }", () => {
    const raw = [{ entity: "foo.ts", mainDev: "alice", added: 80, totalAdded: 100, ownership: 0.8 }]
    const result = Schema.decodeUnknownSync(MainDevSchema)(raw)
    expect(result[0].ownership).toBe(0.8)
  })

  test("AgeSchema decodes { entity, ageMonths }", () => {
    const raw = [{ entity: "foo.ts", ageMonths: 6 }]
    const result = Schema.decodeUnknownSync(AgeSchema)(raw)
    expect(result[0]).toEqual({ entity: "foo.ts", ageMonths: 6 })
  })

  test("IdentitySchema passes through unknown data", () => {
    const raw = [{ anything: "goes", extra: 42 }]
    const result = Schema.decodeUnknownSync(IdentitySchema)(raw)
    expect(result[0]).toEqual({ anything: "goes", extra: 42 })
  })
})
```

- [ ] **Step 10: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/schemas/code-maat.test.ts
```

Expected: FAIL.

- [ ] **Step 11: Implement code-maat schemas**

Create `packages/behave/src/schemas/code-maat.ts`:

```typescript
import { Schema } from "effect"

// revisions: { entity, nRevs }
export const RevisionsSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, nRevs: Schema.Number })
)
export type Revision = { entity: string; nRevs: number }

// authors: { entity, nAuthors, nRevs }
export const AuthorsSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, nAuthors: Schema.Number, nRevs: Schema.Number })
)
export type Author = { entity: string; nAuthors: number; nRevs: number }

// coupling: { entity, coupled, degree, averageRevs }
export const CouplingSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    coupled: Schema.String,
    degree: Schema.Number,
    averageRevs: Schema.Number,
  })
)
export type Coupling = { entity: string; coupled: string; degree: number; averageRevs: number }

// soc (sum of coupling): { entity, soc }
export const SocSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, soc: Schema.Number })
)
export type Soc = { entity: string; soc: number }

// summary: { statistic, value }
export const SummarySchema = Schema.Array(
  Schema.Struct({ statistic: Schema.String, value: Schema.Number })
)
export type SummaryEntry = { statistic: string; value: number }

// identity: passthrough
export const IdentitySchema = Schema.Array(Schema.Unknown)

// abs-churn: { date, added, deleted, commits }
export const AbsChurnSchema = Schema.Array(
  Schema.Struct({
    date: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  })
)
export type AbsChurn = { date: string; added: number; deleted: number; commits: number }

// author-churn: { author, added, deleted, commits }
export const AuthorChurnSchema = Schema.Array(
  Schema.Struct({
    author: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  })
)
export type AuthorChurn = { author: string; added: number; deleted: number; commits: number }

// entity-churn: { entity, added, deleted, commits }
export const EntityChurnSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
    commits: Schema.Number,
  })
)
export type EntityChurn = { entity: string; added: number; deleted: number; commits: number }

// entity-ownership: { entity, author, added, deleted }
export const EntityOwnershipSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    author: Schema.String,
    added: Schema.Number,
    deleted: Schema.Number,
  })
)
export type EntityOwnership = { entity: string; author: string; added: number; deleted: number }

// main-dev: { entity, mainDev, added, totalAdded, ownership }
export const MainDevSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    mainDev: Schema.String,
    added: Schema.Number,
    totalAdded: Schema.Number,
    ownership: Schema.Number,
  })
)
export type MainDev = { entity: string; mainDev: string; added: number; totalAdded: number; ownership: number }

// refactoring-main-dev: { entity, mainDev, removed, totalRemoved, ownership }
export const RefactoringMainDevSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    mainDev: Schema.String,
    removed: Schema.Number,
    totalRemoved: Schema.Number,
    ownership: Schema.Number,
  })
)
export type RefactoringMainDev = { entity: string; mainDev: string; removed: number; totalRemoved: number; ownership: number }

// entity-effort: { entity, author, authorRevs, totalRevs }
export const EntityEffortSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    author: Schema.String,
    authorRevs: Schema.Number,
    totalRevs: Schema.Number,
  })
)
export type EntityEffort = { entity: string; author: string; authorRevs: number; totalRevs: number }

// main-dev-by-revs: same shape as main-dev
export const MainDevByRevsSchema = MainDevSchema
export type MainDevByRevs = MainDev

// fragmentation: { entity, fractalValue, totalRevs }
export const FragmentationSchema = Schema.Array(
  Schema.Struct({
    entity: Schema.String,
    fractalValue: Schema.Number,
    totalRevs: Schema.Number,
  })
)
export type Fragmentation = { entity: string; fractalValue: number; totalRevs: number }

// communication: { author, peer, shared, average, strength }
export const CommunicationSchema = Schema.Array(
  Schema.Struct({
    author: Schema.String,
    peer: Schema.String,
    shared: Schema.Number,
    average: Schema.Number,
    strength: Schema.Number,
  })
)
export type Communication = { author: string; peer: string; shared: number; average: number; strength: number }

// messages: { entity, matches }
export const MessagesSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, matches: Schema.Number })
)
export type MessageEntry = { entity: string; matches: number }

// age: { entity, ageMonths }
export const AgeSchema = Schema.Array(
  Schema.Struct({ entity: Schema.String, ageMonths: Schema.Number })
)
export type CodeAge = { entity: string; ageMonths: number }
```

> **Note:** The exact field names and types must match what code-mat-port's `app.runAnalysis()` returns. If a field uses a different name (e.g., `age-months` vs `ageMonths`), adjust the schema accordingly. Verify by checking `packages/code-mat-port/src/code_maat/analysis/` source files for exact return shapes.

- [ ] **Step 12: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/schemas/code-maat.test.ts
```

Expected: PASS.

- [ ] **Step 13: Run all tests and typecheck**

```bash
cd packages/behave && bun test && bun run tsc --noEmit
```

Expected: All pass.

- [ ] **Step 14: Commit**

```bash
git add packages/behave/src/schemas/ packages/behave/tests/schemas/
git commit -m "feat(behave): add Analysis type and decode schemas for code-maat and lizard"
```

---

## Chunk 2: Pipeline Utilities (ETL)

### Task 6: Pipeline — Extract: Defaults & Build Options

**Files:**
- Create: `packages/behave/src/pipeline/extract/defaults.ts`
- Create: `packages/behave/src/pipeline/extract/build-app-options.ts`
- Test: `packages/behave/tests/pipeline/extract/defaults.test.ts`
- Test: `packages/behave/tests/pipeline/extract/build-app-options.test.ts`

- [ ] **Step 1: Write defaults test**

Create `packages/behave/tests/pipeline/extract/defaults.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { withDefaults, DEFAULT_OPTIONS } from "../../../src/pipeline/extract/defaults"

describe("withDefaults", () => {
  test("returns all defaults when no options provided", () => {
    const result = withDefaults()
    expect(result).toEqual({
      minRevs: 5,
      minSharedRevs: 5,
      minCoupling: 30,
      maxCoupling: 100,
      maxChangesetSize: 30,
    })
  })

  test("overrides specific fields while keeping defaults", () => {
    const result = withDefaults({ minRevs: 10 })
    expect(result.minRevs).toBe(10)
    expect(result.minSharedRevs).toBe(5)
    expect(result.maxChangesetSize).toBe(30)
  })

  test("overrides all fields", () => {
    const result = withDefaults({
      minRevs: 1,
      minSharedRevs: 1,
      minCoupling: 0,
      maxCoupling: 50,
      maxChangesetSize: 100,
    })
    expect(result.minRevs).toBe(1)
    expect(result.maxCoupling).toBe(50)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/pipeline/extract/defaults.test.ts
```

- [ ] **Step 3: Implement defaults**

Create `packages/behave/src/pipeline/extract/defaults.ts`:

```typescript
import type { AnalysisOptions } from "code-mat-port"

export const DEFAULT_OPTIONS: AnalysisOptions = {
  minRevs: 5,
  minSharedRevs: 5,
  minCoupling: 30,
  maxCoupling: 100,
  maxChangesetSize: 30,
}

export const withDefaults = (
  options?: Partial<AnalysisOptions>
): AnalysisOptions => ({
  ...DEFAULT_OPTIONS,
  ...options,
})
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/pipeline/extract/defaults.test.ts
```

- [ ] **Step 5: Write build-app-options test**

Create `packages/behave/tests/pipeline/extract/build-app-options.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { buildAppOptions } from "../../../src/pipeline/extract/build-app-options"
import type { SimpleAnalysisInput } from "../../../src/types"

describe("buildAppOptions", () => {
  test("builds minimal options with defaults", () => {
    const input: SimpleAnalysisInput = { gitLogPath: "/path/to/log" }
    const result = buildAppOptions("revisions", input)
    expect(result.analysis).toBe("revisions")
    expect(result.versionControl).toBe("git")
    expect(result.minRevs).toBe(5)
    expect(result.maxChangesetSize).toBe(30)
  })

  test("forwards vcsType override", () => {
    const input: SimpleAnalysisInput = { gitLogPath: "/log", vcsType: "svn" }
    const result = buildAppOptions("authors", input)
    expect(result.versionControl).toBe("svn")
  })

  test("forwards analysis-specific fields", () => {
    const input: SimpleAnalysisInput = {
      gitLogPath: "/log",
      ageTimeNow: "2026-03-20",
      expressionToMatch: "fix.*",
      group: "group-spec",
      teamMapFile: "/teams.csv",
      temporalPeriod: "30",
    }
    const result = buildAppOptions("age", input)
    expect(result.ageTimeNow).toBe("2026-03-20")
    expect(result.expressionToMatch).toBe("fix.*")
    expect(result.group).toBe("group-spec")
    expect(result.teamMapFile).toBe("/teams.csv")
    expect(result.temporalPeriod).toBe("30")
  })

  test("merges partial options with defaults", () => {
    const input: SimpleAnalysisInput = {
      gitLogPath: "/log",
      options: { minRevs: 10 },
    }
    const result = buildAppOptions("revisions", input)
    expect(result.minRevs).toBe(10)
    expect(result.minSharedRevs).toBe(5)
  })
})
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/pipeline/extract/build-app-options.test.ts
```

- [ ] **Step 7: Implement build-app-options**

Create `packages/behave/src/pipeline/extract/build-app-options.ts`:

```typescript
import type { AppOptions } from "code-mat-port"
import type { SimpleAnalysisInput } from "../../types"
import { withDefaults } from "./defaults"

export const buildAppOptions = (
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

> **Note:** `AppOptions` is exported from `code-mat-port` thanks to the export added in Task 2, Step 2.

- [ ] **Step 8: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/pipeline/extract/build-app-options.test.ts
```

- [ ] **Step 9: Commit**

```bash
git add packages/behave/src/pipeline/extract/ packages/behave/tests/pipeline/extract/
git commit -m "feat(behave): add pipeline extract utilities (defaults, buildAppOptions)"
```

---

### Task 7: Pipeline — Extract: Parse Lizard CSV

**Files:**
- Create: `packages/behave/src/pipeline/extract/parse-lizard-csv.ts`
- Test: `packages/behave/tests/pipeline/extract/parse-lizard-csv.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/pipeline/extract/parse-lizard-csv.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { parseLizardCsv } from "../../../src/pipeline/extract/parse-lizard-csv"
import { LizardError } from "../../../src/errors"

describe("parseLizardCsv", () => {
  test("parses valid CSV string into record array", async () => {
    const csv =
      "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n" +
      '5,3,43,1,5,"constructor@12-16@foo.ts","/path/foo.ts","constructor","constructor(args)",12,16\n'

    const result = await Effect.runPromise(parseLizardCsv(csv))
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(
      expect.objectContaining({
        nloc: "5",
        cyclomatic_complexity: "3",
        file: "/path/foo.ts",
      })
    )
  })

  test("returns empty array for headers-only CSV", async () => {
    const csv =
      "nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line\n"

    const result = await Effect.runPromise(parseLizardCsv(csv))
    expect(result).toEqual([])
  })

  test("fails with LizardError for malformed CSV", async () => {
    const result = await Effect.runPromiseExit(parseLizardCsv(""))
    expect(result._tag).toBe("Failure")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/pipeline/extract/parse-lizard-csv.test.ts
```

- [ ] **Step 3: Implement parseLizardCsv**

Create `packages/behave/src/pipeline/extract/parse-lizard-csv.ts`:

```typescript
import { Effect } from "effect"
import { parse } from "csv-parse/sync"
import { LizardError } from "../../errors"

export const parseLizardCsv = (
  csv: string
): Effect.Effect<unknown[], LizardError> =>
  Effect.try({
    try: () =>
      parse(csv, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as unknown[],
    catch: (e) =>
      new LizardError({ cause: `Failed to parse lizard CSV: ${e}` }),
  })
```

> **Note:** Uses `csv-parse/sync` which is already a dependency (from legacy). If the sync import doesn't resolve, use the async variant with `Effect.tryPromise`.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/pipeline/extract/parse-lizard-csv.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add packages/behave/src/pipeline/extract/parse-lizard-csv.ts packages/behave/tests/pipeline/extract/parse-lizard-csv.test.ts
git commit -m "feat(behave): add parseLizardCsv pipeline extract utility"
```

---

### Task 8: Pipeline — Load: Format & toAnalysis

**Files:**
- Create: `packages/behave/src/pipeline/load/extract-parameters.ts`
- Create: `packages/behave/src/pipeline/load/format.ts`
- Create: `packages/behave/src/pipeline/load/to-analysis.ts`
- Test: `packages/behave/tests/pipeline/load/extract-parameters.test.ts`
- Test: `packages/behave/tests/pipeline/load/format.test.ts`
- Test: `packages/behave/tests/pipeline/load/to-analysis.test.ts`

- [ ] **Step 1: Write extract-parameters test**

Create `packages/behave/tests/pipeline/load/extract-parameters.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { extractParameters } from "../../../src/pipeline/load/extract-parameters"

describe("extractParameters", () => {
  test("copies all fields except format", () => {
    const input = { gitLogPath: "/path", format: "json", options: { minRevs: 5 } }
    const result = extractParameters(input)
    expect(result).toEqual({ gitLogPath: "/path", options: { minRevs: 5 } })
    expect(result).not.toHaveProperty("format")
  })

  test("returns empty object when only format given", () => {
    const result = extractParameters({ format: "csv" })
    expect(result).toEqual({})
  })
})
```

- [ ] **Step 2: Implement extract-parameters**

Create `packages/behave/src/pipeline/load/extract-parameters.ts`:

```typescript
export const extractParameters = (
  input: Record<string, unknown>
): Record<string, unknown> => {
  const { format, ...params } = input
  return params
}
```

- [ ] **Step 3: Write format test**

Create `packages/behave/tests/pipeline/load/format.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { toCsv } from "../../../src/pipeline/load/format"

describe("toCsv", () => {
  test("converts array of objects to CSV string", async () => {
    const data = [
      { entity: "foo.ts", nRevs: 5 },
      { entity: "bar.ts", nRevs: 3 },
    ]
    const csv = await Effect.runPromise(toCsv(data))
    const lines = csv.split("\n")
    expect(lines[0]).toBe("entity,nRevs")
    expect(lines[1]).toBe("foo.ts,5")
    expect(lines[2]).toBe("bar.ts,3")
  })

  test("handles values with commas by quoting", async () => {
    const data = [{ name: "foo, bar", count: 1 }]
    const csv = await Effect.runPromise(toCsv(data))
    expect(csv).toContain('"foo, bar"')
  })

  test("returns FormatError for empty data", async () => {
    const result = await Effect.runPromiseExit(toCsv([]))
    expect(result._tag).toBe("Failure")
  })
})
```

- [ ] **Step 4: Implement format**

Create `packages/behave/src/pipeline/load/format.ts`:

```typescript
import { Effect } from "effect"
import { FormatError } from "../../errors"

const escapeField = (value: unknown): string => {
  const str = String(value)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export const toCsv = <T extends Record<string, unknown>>(
  data: T[]
): Effect.Effect<string, FormatError> =>
  Effect.try({
    try: () => {
      if (data.length === 0) {
        throw new Error("Cannot convert empty data to CSV")
      }
      const headers = Object.keys(data[0])
      const headerLine = headers.join(",")
      const rows = data.map((row) =>
        headers.map((h) => escapeField(row[h])).join(",")
      )
      return [headerLine, ...rows].join("\n")
    },
    catch: (e) => new FormatError({ message: String(e) }),
  })
```

- [ ] **Step 5: Write to-analysis test**

Create `packages/behave/tests/pipeline/load/to-analysis.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Effect } from "effect"
import { toAnalysis } from "../../../src/pipeline/load/to-analysis"

describe("toAnalysis", () => {
  const sampleData = [{ entity: "foo.ts", nRevs: 5 }]

  test("wraps data as JSON analysis with metadata", async () => {
    const result = await Effect.runPromise(
      toAnalysis("revisions", sampleData, { gitLogPath: "/path" })
    )
    expect(result.metadata.analysisName).toBe("revisions")
    expect(result.metadata.format).toBe("json")
    expect(result.metadata.parameters).toEqual({ gitLogPath: "/path" })
    expect(result.metadata.timestamp).toBeInstanceOf(Date)
    expect(result.data).toEqual(sampleData)
  })

  test("wraps data as CSV analysis when format=csv", async () => {
    const result = await Effect.runPromise(
      toAnalysis("revisions", sampleData, { gitLogPath: "/path", format: "csv" })
    )
    expect(result.metadata.format).toBe("csv")
    expect(typeof result.data).toBe("string")
    expect(result.data).toContain("entity,nRevs")
    expect(result.data).toContain("foo.ts,5")
  })

  test("excludes format from parameters", async () => {
    const result = await Effect.runPromise(
      toAnalysis("revisions", sampleData, { gitLogPath: "/path", format: "json" })
    )
    expect(result.metadata.parameters).not.toHaveProperty("format")
  })
})
```

- [ ] **Step 6: Implement to-analysis**

Create `packages/behave/src/pipeline/load/to-analysis.ts`:

```typescript
import { Effect } from "effect"
import type { Analysis } from "../../schemas/analysis"
import type { OutputFormat } from "../../types"
import { FormatError } from "../../errors"
import { toCsv } from "./format"
import { extractParameters } from "./extract-parameters"

export const toAnalysis = <T>(
  analysisName: string,
  data: T[],
  input: { format?: OutputFormat;[key: string]: unknown }
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
      return {
        metadata: { ...metadata, format: "csv" as const },
        data: yield* toCsv(data as Record<string, unknown>[]),
      }
    }
    return { metadata: { ...metadata, format: "json" as const }, data }
  })
```

- [ ] **Step 7: Run all pipeline load tests**

```bash
cd packages/behave && bun test tests/pipeline/load/
```

Expected: All pass.

- [ ] **Step 8: Commit**

```bash
git add packages/behave/src/pipeline/load/ packages/behave/tests/pipeline/load/
git commit -m "feat(behave): add pipeline load utilities (toAnalysis, toCsv, extractParameters)"
```

---

### Task 9: Pipeline — Transform: mergeByEntity

**Files:**
- Create: `packages/behave/src/pipeline/transform/merge-by-entity.ts`
- Test: `packages/behave/tests/pipeline/transform/merge-by-entity.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/pipeline/transform/merge-by-entity.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { mergeByEntity } from "../../../src/pipeline/transform/merge-by-entity"
import type { Revision } from "../../../src/schemas/code-maat"
import type { LizardFunctionMetrics } from "../../../src/schemas/lizard"

describe("mergeByEntity", () => {
  test("inner joins churn and complexity by entity/file", () => {
    const churn: Revision[] = [
      { entity: "/src/foo.ts", nRevs: 10 },
      { entity: "/src/bar.ts", nRevs: 5 },
    ]
    const complexity: LizardFunctionMetrics[] = [
      {
        nloc: 50, cyclomaticComplexity: 15, tokenCount: 200, parameters: 2,
        length: 50, location: "fn@1-50@/src/foo.ts", file: "/src/foo.ts",
        functionName: "fn", longName: "fn()", startLine: 1, endLine: 50,
      },
      {
        nloc: 10, cyclomaticComplexity: 3, tokenCount: 40, parameters: 0,
        length: 10, location: "bar@1-10@/src/foo.ts", file: "/src/foo.ts",
        functionName: "bar", longName: "bar()", startLine: 51, endLine: 60,
      },
      {
        nloc: 20, cyclomaticComplexity: 8, tokenCount: 100, parameters: 1,
        length: 20, location: "baz@1-20@/src/baz.ts", file: "/src/baz.ts",
        functionName: "baz", longName: "baz(x)", startLine: 1, endLine: 20,
      },
    ]

    const result = mergeByEntity(churn, complexity)

    // Only foo.ts appears in both — bar.ts has no complexity, baz.ts has no churn
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      entity: "/src/foo.ts",
      nRevs: 10,
      cyclomaticComplexity: 15, // max of 15 and 3
    })
  })

  test("takes max complexity across functions in same file", () => {
    const churn: Revision[] = [{ entity: "/src/a.ts", nRevs: 7 }]
    const complexity: LizardFunctionMetrics[] = [
      {
        nloc: 10, cyclomaticComplexity: 2, tokenCount: 30, parameters: 0,
        length: 10, location: "x@1-10@/src/a.ts", file: "/src/a.ts",
        functionName: "x", longName: "x()", startLine: 1, endLine: 10,
      },
      {
        nloc: 30, cyclomaticComplexity: 20, tokenCount: 150, parameters: 3,
        length: 30, location: "y@11-40@/src/a.ts", file: "/src/a.ts",
        functionName: "y", longName: "y(a,b,c)", startLine: 11, endLine: 40,
      },
    ]

    const result = mergeByEntity(churn, complexity)
    expect(result[0].cyclomaticComplexity).toBe(20)
  })

  test("returns empty when no entities match", () => {
    const churn: Revision[] = [{ entity: "/src/a.ts", nRevs: 3 }]
    const complexity: LizardFunctionMetrics[] = [
      {
        nloc: 10, cyclomaticComplexity: 5, tokenCount: 30, parameters: 0,
        length: 10, location: "fn@1-10@/src/b.ts", file: "/src/b.ts",
        functionName: "fn", longName: "fn()", startLine: 1, endLine: 10,
      },
    ]

    const result = mergeByEntity(churn, complexity)
    expect(result).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/pipeline/transform/merge-by-entity.test.ts
```

- [ ] **Step 3: Implement mergeByEntity**

Create `packages/behave/src/pipeline/transform/merge-by-entity.ts`:

```typescript
import type { Revision } from "../../schemas/code-maat"
import type { LizardFunctionMetrics } from "../../schemas/lizard"

export type ComplexityHotspot = {
  entity: string
  nRevs: number
  cyclomaticComplexity: number
}

export const mergeByEntity = (
  churn: Revision[],
  complexity: LizardFunctionMetrics[]
): ComplexityHotspot[] => {
  // Aggregate max complexity per file
  const complexityByFile = new Map<string, number>()
  for (const metric of complexity) {
    const current = complexityByFile.get(metric.file) ?? 0
    complexityByFile.set(
      metric.file,
      Math.max(current, metric.cyclomaticComplexity)
    )
  }

  // Inner join
  const hotspots: ComplexityHotspot[] = []
  for (const rev of churn) {
    const maxComplexity = complexityByFile.get(rev.entity)
    if (maxComplexity !== undefined) {
      hotspots.push({
        entity: rev.entity,
        nRevs: rev.nRevs,
        cyclomaticComplexity: maxComplexity,
      })
    }
  }

  return hotspots
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/pipeline/transform/merge-by-entity.test.ts
```

- [ ] **Step 5: Run all tests and typecheck**

```bash
cd packages/behave && bun test && bun run tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add packages/behave/src/pipeline/transform/ packages/behave/tests/pipeline/transform/
git commit -m "feat(behave): add mergeByEntity transform for complexity hotspots"
```

---

## Chunk 3: Services

### Task 10: Create CodeMaatService

**Files:**
- Create: `packages/behave/src/services/code-maat.ts`
- Test: `packages/behave/tests/services/code-maat.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/services/code-maat.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { CodeMaatService, CodeMaatLive } from "../../src/services/code-maat"
import { CodeMaatError } from "../../src/errors"

describe("CodeMaatService", () => {
  test("can be provided with a test layer", async () => {
    const testData = [{ entity: "foo.ts", nRevs: 5 }]
    const TestLayer = Layer.succeed(CodeMaatService, {
      runAnalysis: () => Effect.succeed(testData),
    })

    const program = Effect.gen(function* () {
      const service = yield* CodeMaatService
      return yield* service.runAnalysis("/path", {
        analysis: "revisions",
        versionControl: "git",
        minRevs: 5,
        minSharedRevs: 5,
        minCoupling: 30,
        maxCoupling: 100,
        maxChangesetSize: 30,
      })
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
    expect(result).toEqual(testData)
  })

  test("CodeMaatLive wraps errors as CodeMaatError", async () => {
    // This test verifies the error wrapping — it will fail because
    // there's no real git log at this path, which is expected.
    const program = Effect.gen(function* () {
      const service = yield* CodeMaatService
      return yield* service.runAnalysis("/nonexistent.log", {
        analysis: "revisions",
        versionControl: "git",
        minRevs: 5,
        minSharedRevs: 5,
        minCoupling: 30,
        maxCoupling: 100,
        maxChangesetSize: 30,
      })
    })

    const exit = await Effect.runPromiseExit(
      program.pipe(Effect.provide(CodeMaatLive))
    )
    expect(exit._tag).toBe("Failure")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/services/code-maat.test.ts
```

- [ ] **Step 3: Implement CodeMaatService**

Create `packages/behave/src/services/code-maat.ts`:

```typescript
import { Context, Effect, Layer } from "effect"
import { app } from "code-mat-port"
import type { AppOptions } from "code-mat-port"
import { CodeMaatError } from "../errors"

export class CodeMaatService extends Context.Tag("CodeMaatService")<
  CodeMaatService,
  {
    readonly runAnalysis: (
      logFilePath: string,
      options: AppOptions
    ) => Effect.Effect<unknown[], CodeMaatError>
  }
>() {}

export const CodeMaatLive = Layer.succeed(CodeMaatService, {
  runAnalysis: (logFilePath, options) =>
    Effect.tryPromise({
      try: () => app.runAnalysis(logFilePath, options),
      catch: (e) => new CodeMaatError({ cause: e }),
    }),
})
```

> **Note:** `AppOptions` is exported from `code-mat-port` thanks to the export added in Task 2, Step 2.

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/services/code-maat.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add packages/behave/src/services/code-maat.ts packages/behave/tests/services/code-maat.test.ts
git commit -m "feat(behave): add CodeMaatService with live layer"
```

---

### Task 11: Create LizardService

**Files:**
- Create: `packages/behave/src/services/lizard.ts`
- Test: `packages/behave/tests/services/lizard.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/services/lizard.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { LizardService, LizardLive } from "../../src/services/lizard"
import { LizardError } from "../../src/errors"

describe("LizardService", () => {
  test("can be provided with a test layer", async () => {
    const testData = [{ file: "/src/foo.ts", nloc: "50", cyclomatic_complexity: "10" }]
    const TestLayer = Layer.succeed(LizardService, {
      analyze: () => Effect.succeed(testData),
    })

    const program = Effect.gen(function* () {
      const service = yield* LizardService
      return yield* service.analyze("/path/to/source")
    })

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
    expect(result).toEqual(testData)
  })

  test("LizardLive wraps errors as LizardError", async () => {
    const program = Effect.gen(function* () {
      const service = yield* LizardService
      return yield* service.analyze("/nonexistent/path")
    })

    const exit = await Effect.runPromiseExit(
      program.pipe(Effect.provide(LizardLive))
    )
    expect(exit._tag).toBe("Failure")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/services/lizard.test.ts
```

- [ ] **Step 3: Implement LizardService**

Create `packages/behave/src/services/lizard.ts`:

```typescript
import { Context, Effect, Layer } from "effect"
import { LizardInstance } from "@prj-conq/lizard-ts"
import { LizardError } from "../errors"
import { parseLizardCsv } from "../pipeline/extract/parse-lizard-csv"

export class LizardService extends Context.Tag("LizardService")<
  LizardService,
  {
    readonly analyze: (
      sourcePath: string
    ) => Effect.Effect<unknown[], LizardError>
  }
>() {}

export const LizardLive = Layer.succeed(LizardService, {
  analyze: (sourcePath) =>
    Effect.tryPromise({
      try: async () => {
        const result = await LizardInstance.create().analyze(sourcePath)
        if (result instanceof Error) throw result
        return result
      },
      catch: (e) => new LizardError({ cause: e }),
    }).pipe(Effect.flatMap(parseLizardCsv)),
})
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/services/lizard.test.ts
```

- [ ] **Step 5: Create services index**

Create `packages/behave/src/services/index.ts`:

```typescript
import { Layer } from "effect"
import { CodeMaatLive } from "./code-maat"
import { LizardLive } from "./lizard"

export { CodeMaatService, CodeMaatLive } from "./code-maat"
export { LizardService, LizardLive } from "./lizard"

export const BehaveLive = Layer.merge(CodeMaatLive, LizardLive)
```

- [ ] **Step 6: Run all tests and typecheck**

```bash
cd packages/behave && bun test && bun run tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add packages/behave/src/services/ packages/behave/tests/services/
git commit -m "feat(behave): add LizardService, BehaveLive combined layer"
```

---

## Chunk 4: Simple Analyses

### Task 12: First Simple Analysis — Revisions (Template)

**Files:**
- Create: `packages/behave/src/analyses/simple/revisions.ts`
- Test: `packages/behave/tests/analyses/simple/revisions.test.ts`

This establishes the pattern all 17 remaining analyses will follow.

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/analyses/simple/revisions.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import { revisionsEffect, revisions } from "../../../src/analyses/simple/revisions"
import { CodeMaatService } from "../../../src/services/code-maat"

describe("revisions analysis", () => {
  const cannedData = [
    { entity: "foo.ts", nRevs: 10 },
    { entity: "bar.ts", nRevs: 5 },
  ]

  // Only CodeMaatService needed — revisions doesn't use LizardService
  const TestLayer = Layer.succeed(CodeMaatService, {
    runAnalysis: () => Effect.succeed(cannedData),
  })

  test("returns Analysis with JSON data by default", async () => {
    const result = await Effect.runPromise(
      revisionsEffect({ gitLogPath: "/path/log" }).pipe(
        Effect.provide(TestLayer)
      )
    )
    expect(result.metadata.analysisName).toBe("revisions")
    expect(result.metadata.format).toBe("json")
    expect(result.data).toEqual(cannedData)
  })

  test("returns Analysis with CSV data when format=csv", async () => {
    const result = await Effect.runPromise(
      revisionsEffect({ gitLogPath: "/path/log", format: "csv" }).pipe(
        Effect.provide(TestLayer)
      )
    )
    expect(result.metadata.format).toBe("csv")
    expect(typeof result.data).toBe("string")
    expect(result.data).toContain("entity,nRevs")
  })

  test("passes options through to CodeMaatService", async () => {
    let capturedOptions: unknown
    const SpyLayer = Layer.succeed(CodeMaatService, {
      runAnalysis: (_path, opts) => {
        capturedOptions = opts
        return Effect.succeed(cannedData)
      },
    })

    await Effect.runPromise(
      revisionsEffect({
        gitLogPath: "/path/log",
        vcsType: "git2",
        options: { minRevs: 10 },
      }).pipe(Effect.provide(SpyLayer))
    )

    expect(capturedOptions).toEqual(
      expect.objectContaining({
        analysis: "revisions",
        versionControl: "git2",
        minRevs: 10,
        minSharedRevs: 5,
      })
    )
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/analyses/simple/revisions.test.ts
```

- [ ] **Step 3: Implement revisions analysis**

Create `packages/behave/src/analyses/simple/revisions.ts`:

```typescript
import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { RevisionsSchema, type Revision } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const revisionsEffect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("revisions", input)
    )
    const data = yield* Schema.decodeUnknown(RevisionsSchema)(raw)
    return yield* toAnalysis("revisions", data, input)
  })

export const revisions = (
  input: SimpleAnalysisInput
): Promise<Analysis<Revision>> =>
  Effect.runPromise(
    revisionsEffect(input).pipe(Effect.provide(BehaveLive))
  )
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/analyses/simple/revisions.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add packages/behave/src/analyses/simple/revisions.ts packages/behave/tests/analyses/simple/revisions.test.ts
git commit -m "feat(behave): add revisions simple analysis (template for all 18)"
```

---

### Task 13: Remaining 17 Simple Analyses

Each follows the exact same pattern as `revisions.ts`. For each analysis:

1. Create `packages/behave/src/analyses/simple/<name>.ts`
2. Create `packages/behave/tests/analyses/simple/<name>.test.ts`
3. Use the corresponding schema from `schemas/code-maat.ts`

**The template per analysis file:**

```typescript
// src/analyses/simple/<name>.ts
import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { <Schema>, type <Type> } from "../../schemas/code-maat"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { buildAppOptions } from "../../pipeline/extract/build-app-options"
import { BehaveLive } from "../../services"
import type { SimpleAnalysisInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const <name>Effect = (input: SimpleAnalysisInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const raw = yield* codeMaat.runAnalysis(
      input.gitLogPath,
      buildAppOptions("<analysis-key>", input)
    )
    const data = yield* Schema.decodeUnknown(<Schema>)(raw)
    return yield* toAnalysis("<analysis-key>", data, input)
  })

export const <name> = (
  input: SimpleAnalysisInput
): Promise<Analysis<<Type>>> =>
  Effect.runPromise(
    <name>Effect(input).pipe(Effect.provide(BehaveLive))
  )
```

**Mapping table (file → analysis key → schema → type):**

| File | Analysis Key | Schema | Type |
|------|-------------|--------|------|
| `authors.ts` | `authors` | `AuthorsSchema` | `Author` |
| `coupling.ts` | `coupling` | `CouplingSchema` | `Coupling` |
| `soc.ts` | `soc` | `SocSchema` | `Soc` |
| `summary.ts` | `summary` | `SummarySchema` | `SummaryEntry` |
| `identity.ts` | `identity` | `IdentitySchema` | `unknown` |
| `abs-churn.ts` | `abs-churn` | `AbsChurnSchema` | `AbsChurn` |
| `author-churn.ts` | `author-churn` | `AuthorChurnSchema` | `AuthorChurn` |
| `entity-churn.ts` | `entity-churn` | `EntityChurnSchema` | `EntityChurn` |
| `entity-ownership.ts` | `entity-ownership` | `EntityOwnershipSchema` | `EntityOwnership` |
| `main-dev.ts` | `main-dev` | `MainDevSchema` | `MainDev` |
| `refactoring-main-dev.ts` | `refactoring-main-dev` | `RefactoringMainDevSchema` | `RefactoringMainDev` |
| `entity-effort.ts` | `entity-effort` | `EntityEffortSchema` | `EntityEffort` |
| `main-dev-by-revs.ts` | `main-dev-by-revs` | `MainDevByRevsSchema` | `MainDevByRevs` |
| `fragmentation.ts` | `fragmentation` | `FragmentationSchema` | `Fragmentation` |
| `communication.ts` | `communication` | `CommunicationSchema` | `Communication` |
| `messages.ts` | `messages` | `MessagesSchema` | `MessageEntry` |
| `age.ts` | `age` | `AgeSchema` | `CodeAge` |

**Special cases:**
- `age.ts`: Add validation at the start — if `input.ageTimeNow` is missing, fail with `Effect.fail(new FormatError({ message: "ageTimeNow is required for age analysis" }))`.
- `messages.ts`: Add validation — if `input.expressionToMatch` is missing, fail with similar error.

**Required validation test cases for `age.test.ts`:**
```typescript
test("fails when ageTimeNow is not provided", async () => {
  const exit = await Effect.runPromiseExit(
    ageEffect({ gitLogPath: "/path" }).pipe(Effect.provide(TestLayer))
  )
  expect(exit._tag).toBe("Failure")
})
```

**Required validation test cases for `messages.test.ts`:**
```typescript
test("fails when expressionToMatch is not provided", async () => {
  const exit = await Effect.runPromiseExit(
    messagesEffect({ gitLogPath: "/path" }).pipe(Effect.provide(TestLayer))
  )
  expect(exit._tag).toBe("Failure")
})
```

- [ ] **Step 1: Create all 17 analysis files using the template**

- [ ] **Step 2: Create test files for each (same pattern as revisions.test.ts)**

- [ ] **Step 3: Create the barrel export**

Create `packages/behave/src/analyses/simple/index.ts`:

```typescript
export { authors } from "./authors"
export { revisions } from "./revisions"
export { coupling } from "./coupling"
export { soc } from "./soc"
export { summary } from "./summary"
export { identity } from "./identity"
export { absChurn } from "./abs-churn"
export { authorChurn } from "./author-churn"
export { entityChurn } from "./entity-churn"
export { entityOwnership } from "./entity-ownership"
export { mainDev } from "./main-dev"
export { refactoringMainDev } from "./refactoring-main-dev"
export { entityEffort } from "./entity-effort"
export { mainDevByRevs } from "./main-dev-by-revs"
export { fragmentation } from "./fragmentation"
export { communication } from "./communication"
export { messages } from "./messages"
export { age } from "./age"
```

- [ ] **Step 4: Run all simple analysis tests**

```bash
cd packages/behave && bun test tests/analyses/simple/
```

Expected: All pass.

- [ ] **Step 5: Run typecheck**

```bash
cd packages/behave && bun run tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add packages/behave/src/analyses/simple/ packages/behave/tests/analyses/simple/
git commit -m "feat(behave): add all 18 simple analyses with barrel export"
```

---

## Chunk 5: Aggregated Analysis & Public API

### Task 14: Complexity Hotspots Analysis

**Files:**
- Create: `packages/behave/src/analyses/aggregated/complexity-hotspots.ts`
- Test: `packages/behave/tests/analyses/aggregated/complexity-hotspots.test.ts`

- [ ] **Step 1: Write the test**

Create `packages/behave/tests/analyses/aggregated/complexity-hotspots.test.ts`:

```typescript
import { describe, expect, test } from "bun:test"
import { Effect, Layer } from "effect"
import {
  complexityHotspotsEffect,
  complexityHotspots,
} from "../../../src/analyses/aggregated/complexity-hotspots"
import { CodeMaatService } from "../../../src/services/code-maat"
import { LizardService } from "../../../src/services/lizard"

describe("complexity hotspots analysis", () => {
  const cannedChurn = [
    { entity: "/src/foo.ts", nRevs: 20 },
    { entity: "/src/bar.ts", nRevs: 8 },
    { entity: "/src/orphan.ts", nRevs: 3 },
  ]

  // Lizard returns per-function records as unknown[] (string values from CSV)
  const cannedComplexity = [
    {
      nloc: "100", cyclomatic_complexity: "15", token_count: "500",
      parameters: "3", length: "100", location: "fn@1-100@/src/foo.ts",
      file: "/src/foo.ts", function: "fn", long_name: "fn(a,b,c)",
      start_line: "1", end_line: "100",
    },
    {
      nloc: "20", cyclomatic_complexity: "5", token_count: "80",
      parameters: "0", length: "20", location: "helper@101-120@/src/foo.ts",
      file: "/src/foo.ts", function: "helper", long_name: "helper()",
      start_line: "101", end_line: "120",
    },
    {
      nloc: "30", cyclomatic_complexity: "12", token_count: "150",
      parameters: "1", length: "30", location: "process@1-30@/src/bar.ts",
      file: "/src/bar.ts", function: "process", long_name: "process(x)",
      start_line: "1", end_line: "30",
    },
  ]

  const TestLayer = Layer.merge(
    Layer.succeed(CodeMaatService, {
      runAnalysis: () => Effect.succeed(cannedChurn),
    }),
    Layer.succeed(LizardService, {
      analyze: () => Effect.succeed(cannedComplexity),
    }),
  )

  test("produces hotspots from inner join of churn and complexity", async () => {
    const result = await Effect.runPromise(
      complexityHotspotsEffect({
        gitLogPath: "/path/log",
        sourceDir: "/path/src",
      }).pipe(Effect.provide(TestLayer))
    )

    expect(result.metadata.analysisName).toBe("complexity-hotspots")
    expect(result.metadata.format).toBe("json")

    // foo.ts and bar.ts match; orphan.ts has no complexity data
    expect(result.data).toHaveLength(2)
    expect(result.data).toContainEqual({
      entity: "/src/foo.ts",
      nRevs: 20,
      cyclomaticComplexity: 15, // max of 15 and 5
    })
    expect(result.data).toContainEqual({
      entity: "/src/bar.ts",
      nRevs: 8,
      cyclomaticComplexity: 12,
    })
  })

  test("supports CSV output", async () => {
    const result = await Effect.runPromise(
      complexityHotspotsEffect({
        gitLogPath: "/path/log",
        sourceDir: "/path/src",
        format: "csv",
      }).pipe(Effect.provide(TestLayer))
    )
    expect(result.metadata.format).toBe("csv")
    expect(typeof result.data).toBe("string")
    expect(result.data).toContain("entity,nRevs,cyclomaticComplexity")
  })

  test("extracts churn and complexity in parallel", async () => {
    let churnCalled = false
    let complexityCalled = false

    const SpyLayer = Layer.merge(
      Layer.succeed(CodeMaatService, {
        runAnalysis: () => {
          churnCalled = true
          return Effect.succeed(cannedChurn)
        },
      }),
      Layer.succeed(LizardService, {
        analyze: () => {
          complexityCalled = true
          return Effect.succeed(cannedComplexity)
        },
      }),
    )

    await Effect.runPromise(
      complexityHotspotsEffect({
        gitLogPath: "/path/log",
        sourceDir: "/path/src",
      }).pipe(Effect.provide(SpyLayer))
    )

    expect(churnCalled).toBe(true)
    expect(complexityCalled).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/behave && bun test tests/analyses/aggregated/complexity-hotspots.test.ts
```

- [ ] **Step 3: Implement complexity hotspots**

Create `packages/behave/src/analyses/aggregated/complexity-hotspots.ts`:

```typescript
import { Effect, Schema } from "effect"
import { CodeMaatService } from "../../services/code-maat"
import { LizardService } from "../../services/lizard"
import { RevisionsSchema } from "../../schemas/code-maat"
import { LizardMetricsSchema } from "../../schemas/lizard"
import { mergeByEntity, type ComplexityHotspot } from "../../pipeline/transform/merge-by-entity"
import { toAnalysis } from "../../pipeline/load/to-analysis"
import { withDefaults } from "../../pipeline/extract/defaults"
import { BehaveLive } from "../../services"
import type { ComplexityHotspotsInput } from "../../types"
import type { Analysis } from "../../schemas/analysis"

export const complexityHotspotsEffect = (input: ComplexityHotspotsInput) =>
  Effect.gen(function* () {
    const codeMaat = yield* CodeMaatService
    const lizard = yield* LizardService

    // Extract (parallel)
    const [churnData, complexityData] = yield* Effect.all(
      [
        codeMaat.runAnalysis(input.gitLogPath, {
          analysis: "revisions",
          versionControl: input.vcsType ?? "git",
          ...withDefaults(input.options),
        }),
        lizard.analyze(input.sourceDir),
      ],
      { concurrency: 2 }
    )

    // Decode
    const churn = yield* Schema.decodeUnknown(RevisionsSchema)(churnData)
    const complexity = yield* Schema.decodeUnknown(LizardMetricsSchema)(complexityData)

    // Transform
    const hotspots = mergeByEntity(churn, complexity)

    // Load
    return yield* toAnalysis("complexity-hotspots", hotspots, input)
  })

export const complexityHotspots = (
  input: ComplexityHotspotsInput
): Promise<Analysis<ComplexityHotspot>> =>
  Effect.runPromise(
    complexityHotspotsEffect(input).pipe(Effect.provide(BehaveLive))
  )
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd packages/behave && bun test tests/analyses/aggregated/complexity-hotspots.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add packages/behave/src/analyses/aggregated/ packages/behave/tests/analyses/aggregated/
git commit -m "feat(behave): add complexity hotspots aggregated analysis"
```

---

### Task 15: Update Public API (index.ts)

**Files:**
- Modify: `packages/behave/src/index.ts`

- [ ] **Step 1: Update index.ts with all exports**

Replace `packages/behave/src/index.ts`:

```typescript
// New API — analyses
export { complexityHotspots } from "./analyses/aggregated/complexity-hotspots"
export * as simple from "./analyses/simple"

// New API — types for consumers
export type { Analysis, AnalysisMetadata } from "./schemas/analysis"
export type { OutputFormat, ComplexityHotspotsInput, SimpleAnalysisInput } from "./types"
export { CodeMaatError, LizardError, FormatError } from "./errors"

// Legacy (deprecated) — existing consumers keep working
export { default, AnalysisOptions, Behave } from "./legacy/index"
```

> **Note:** Internal Effect types (`CodeMaatService`, `LizardService`, `BehaveLive`, `*Effect` functions) are NOT exported from the public API — consumers should not need Effect. Tests import these directly from their source modules (e.g., `from "../../src/services/code-maat"`).

- [ ] **Step 2: Run all tests and typecheck**

```bash
cd packages/behave && bun test && bun run tsc --noEmit
```

Expected: All tests pass, clean typecheck.

- [ ] **Step 3: Verify legacy imports still work**

Check that existing legacy tests still pass (they import via `#behave/*` aliases).

```bash
cd packages/behave && bun test tests/behave.test.ts tests/index.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add packages/behave/src/index.ts
git commit -m "feat(behave): expose new public API alongside legacy exports"
```

---

### Task 16: Build Verification

**Files:**
- Modify: `packages/behave/bunup.config.ts` (may need adjustment)

- [ ] **Step 1: Run full build**

```bash
cd packages/behave && pnpm run build
```

Verify that `dist/` is produced with both new and legacy code.

- [ ] **Step 2: Run full test suite from root**

```bash
pnpm run test
```

Expected: All packages pass.

- [ ] **Step 3: Fix any build issues**

If the bunup config needs adjustment (e.g., the JAR copy plugin path changed due to legacy relocation), update `packages/behave/bunup.config.ts` to reference `src/legacy/infrastructure/code_maat/vendor/`.

- [ ] **Step 4: Commit if any build fixes were needed**

```bash
git add packages/behave/
git commit -m "fix(behave): adjust build config for legacy relocation"
```
