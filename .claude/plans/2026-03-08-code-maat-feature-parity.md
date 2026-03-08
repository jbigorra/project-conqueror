# code-maat Feature Parity Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete feature parity between original Clojure code-maat and the TypeScript port, verified by running the official JAR against the same log fixtures and comparing CSV output.

**Architecture:** Two phases: (1) port missing `analysis/summary` module and expand `app.ts` to support all VCS types and all 18 analyses; (2) write parity tests that shell out to the JAR and compare its CSV output against our TypeScript pipeline output.

**Tech Stack:** Bun, TypeScript, `bun:test`, `bun.spawnSync` for JAR invocation, `code-maat-1.0.4-standalone.jar` (already at `packages/behave/src/infrastructure/code_maat/vendor/`).

**Working directory:** `packages/code-mat-port/`

---

## Gaps Found in Cross-Check

| Original Clojure | TypeScript status |
|---|---|
| `analysis/summary.clj` → `overview` | **MISSING** |
| `app.clj` — 6 VCS parsers, 18 analyses | **INCOMPLETE** (git only, coupling only) |
| `output/csv.clj`, `output/filters.clj` | Not needed — TS returns arrays |
| `parsers/xml.clj`, `hiccup_based_parser.clj` | Not needed — regex-based SVN port covers it |
| `analysis/workarounds.clj` | Not applicable (Incanter-specific) |

---

## Analysis Name → TypeScript Function Mapping

| CLI name | TypeScript call |
|---|---|
| `authors` | `authors.byCount(entries, options)` |
| `revisions` | `entities.byRevision(entries, options)` |
| `coupling` | `logicalCoupling.byDegree(entries, options)` |
| `soc` | `sumOfCoupling.byDegree(entries, options)` |
| `summary` | `summary.overview(entries)` |
| `identity` | return `entries` as-is |
| `abs-churn` | `churn.absolutesTrend(entries, options)` |
| `author-churn` | `churn.byAuthor(entries, options)` |
| `entity-churn` | `churn.byEntity(entries, options)` |
| `entity-ownership` | `churn.asOwnership(entries, options)` |
| `main-dev` | `churn.byMainDeveloper(entries, options)` |
| `refactoring-main-dev` | `churn.byRefactoringMainDeveloper(entries, options)` |
| `entity-effort` | `effort.asRevisionsPerAuthor(entries, options)` |
| `main-dev-by-revs` | `effort.asMainDeveloperByRevisions(entries, options)` |
| `fragmentation` | `effort.asEntityFragmentation(entries, options)` |
| `communication` | `communication.bySharedEntities(entries)` |
| `messages` | `commitMessages.byWordFrequency(entries, {expressionToMatch})` |
| `age` | `codeAge.byAge(entries, ageTimeNow)` |

## CSV Column Mapping (TypeScript field → CSV header)

| Analysis | TypeScript fields | CSV headers |
|---|---|---|
| authors | entity, nAuthors, nRevs | entity,n-authors,n-revs |
| revisions | entity, nRevs | entity,n-revs |
| coupling | entity, coupled, degree, averageRevs | entity,coupled,degree,average-revs |
| soc | entity, soc | entity,soc |
| summary | statistic, value | statistic,value |
| abs-churn | date, added, deleted, commits | date,added,deleted,commits |
| author-churn | author, added, deleted, commits | author,added,deleted,commits |
| entity-churn | entity, added, deleted, commits | entity,added,deleted,commits |
| entity-ownership | entity, author, addedPercent | entity,author,added% |
| main-dev | entity, mainDev, addedPercent | entity,main-dev,added% |
| refactoring-main-dev | entity, mainDev, deletedPercent | entity,main-dev,deleted% |
| entity-effort | entity, author, authorRevs, totalRevs | entity,author,author-revs,total-revs |
| main-dev-by-revs | entity, mainDev, addedRevs, totalRevs | entity,main-dev,added-revs,total-revs |
| fragmentation | entity, fractalValue, totalRevs | entity,fractal-value,total-revs |
| communication | author, peer, shared, average, strength | author,peer,shared,average,strength |
| messages | entity, matches | entity,matches |
| age | entity, ageMonths | entity,age-months |

---

## Task 1: Port `analysis/summary.ts`

**Files:**
- Create: `src/code_maat/analysis/summary.ts`
- Create: `tests/code_maat/analysis/summary.test.ts`

### Step 1: Write the failing test

```typescript
// tests/code_maat/analysis/summary.test.ts
import { describe, it, expect } from "bun:test";
import { overview } from "../../../src/code_maat/analysis/summary";
import type { VCSEntry } from "../../../src/code_maat/types";

const entries: VCSEntry[] = [
  { entity: "/A", rev: 1, author: "APT", date: "2013-02-07" },
  { entity: "/B", rev: 1, author: "APT", date: "2013-02-07" },
  { entity: "/A", rev: 2, author: "XYZ", date: "2013-02-08" },
];

describe("summary analysis", () => {
  it("counts commits, entities, rows, and authors", () => {
    expect(overview(entries)).toEqual([
      { statistic: "number-of-commits",          value: 2 },
      { statistic: "number-of-entities",          value: 2 },
      { statistic: "number-of-entities-changed",  value: 3 },
      { statistic: "number-of-authors",           value: 2 },
    ]);
  });

  it("returns empty stats for empty input", () => {
    expect(overview([])).toEqual([
      { statistic: "number-of-commits",          value: 0 },
      { statistic: "number-of-entities",          value: 0 },
      { statistic: "number-of-entities-changed",  value: 0 },
      { statistic: "number-of-authors",           value: 0 },
    ]);
  });
});
```

### Step 2: Run to verify it fails

```bash
bun test tests/code_maat/analysis/summary.test.ts
```
Expected: `Cannot find module '.../summary'`

### Step 3: Implement

```typescript
// src/code_maat/analysis/summary.ts
import type { VCSEntry } from "../types";
import { all as allEntities, allRevisions } from "./entities";
import { all as allAuthors } from "./authors";

export type SummaryRow = { statistic: string; value: number };

export function overview(entries: VCSEntry[]): SummaryRow[] {
  return [
    { statistic: "number-of-commits",         value: new Set(allRevisions(entries)).size },
    { statistic: "number-of-entities",         value: allEntities(entries).length },
    { statistic: "number-of-entities-changed", value: entries.length },
    { statistic: "number-of-authors",          value: allAuthors(entries).size },
  ];
}
```

### Step 4: Run to verify it passes

```bash
bun test tests/code_maat/analysis/summary.test.ts
```
Expected: `2 pass, 0 fail`

### Step 5: Commit

```bash
git add src/code_maat/analysis/summary.ts tests/code_maat/analysis/summary.test.ts
git commit -m "feat: port summary analysis module"
```

---

## Task 2: Expand `app.ts` to support all VCS types and analyses

**Files:**
- Modify: `src/code_maat/app/app.ts` (full rewrite)
- Create: `tests/code_maat/app/app.test.ts`

The new `app.ts` must:
- Parse all 6 VCS formats (git, git2, hg, p4, tfs, svn)
- Support optional `group` (grouper), `teamMapFile` (team-mapper), `temporalPeriod`
- Dispatch to all 18 analyses

### Step 1: Write the failing tests

```typescript
// tests/code_maat/app/app.test.ts
import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { runAnalysis } from "../../../src/code_maat/app/app";
import type { AppOptions } from "../../../src/code_maat/app/app";

const FIXTURES = join(__dirname, "../../fixtures/log-fixtures");
const GIT_LOG = join(FIXTURES, "simple_git.txt");
const GIT2_LOG = join(FIXTURES, "simple_git2.txt");
const HG_LOG  = join(FIXTURES, "simple_hg.txt");
const P4_LOG  = join(FIXTURES, "simple_p4.txt");

const BASE_OPTIONS: AppOptions = {
  minRevs: 1, minSharedRevs: 1, minCoupling: 0,
  maxCoupling: 100, maxChangesetSize: 1000,
  versionControl: "git", analysis: "authors",
};

function opts(overrides: Partial<AppOptions>): AppOptions {
  return { ...BASE_OPTIONS, ...overrides };
}

describe("runAnalysis — VCS dispatch", () => {
  it("parses git format", async () => {
    const result = await runAnalysis(GIT_LOG, opts({ versionControl: "git", analysis: "revisions" }));
    expect(result).toHaveLength(2);
  });

  it("parses git2 format", async () => {
    const result = await runAnalysis(GIT2_LOG, opts({ versionControl: "git2", analysis: "revisions" }));
    expect(result).toHaveLength(2);
  });

  it("parses hg format", async () => {
    const result = await runAnalysis(HG_LOG, opts({ versionControl: "hg", analysis: "revisions" }));
    expect(result).toHaveLength(2);
  });

  it("parses p4 format", async () => {
    const result = await runAnalysis(P4_LOG, opts({ versionControl: "p4", analysis: "revisions" }));
    expect(result).toHaveLength(2);
  });

  it("throws on unsupported VCS", async () => {
    expect(runAnalysis(GIT_LOG, opts({ versionControl: "unknown" }))).rejects.toThrow("Invalid --version-control");
  });
});

describe("runAnalysis — analysis dispatch", () => {
  it("authors", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "authors" }));
    expect(r[0]).toHaveProperty("nAuthors");
  });

  it("revisions", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "revisions" }));
    expect(r[0]).toHaveProperty("nRevs");
  });

  it("coupling", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "coupling" }));
    expect(r[0]).toHaveProperty("degree");
  });

  it("soc", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "soc" }));
    expect(r[0]).toHaveProperty("soc");
  });

  it("summary", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "summary" }));
    expect(r[0]).toEqual({ statistic: "number-of-commits", value: 2 });
  });

  it("abs-churn", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "abs-churn" }));
    expect(r[0]).toHaveProperty("added");
  });

  it("author-churn", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "author-churn" }));
    expect(r[0]).toHaveProperty("author");
  });

  it("entity-churn", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "entity-churn" }));
    expect(r[0]).toHaveProperty("entity");
  });

  it("entity-ownership", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "entity-ownership" }));
    expect(r[0]).toHaveProperty("addedPercent");
  });

  it("main-dev", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "main-dev" }));
    expect(r[0]).toHaveProperty("mainDev");
  });

  it("refactoring-main-dev", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "refactoring-main-dev" }));
    expect(r[0]).toHaveProperty("mainDev");
  });

  it("entity-effort", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "entity-effort" }));
    expect(r[0]).toHaveProperty("authorRevs");
  });

  it("main-dev-by-revs", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "main-dev-by-revs" }));
    expect(r[0]).toHaveProperty("mainDev");
  });

  it("fragmentation", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "fragmentation" }));
    expect(r[0]).toHaveProperty("fractalValue");
  });

  it("communication", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "communication" }));
    expect(r[0]).toHaveProperty("strength");
  });

  it("messages", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "messages", expressionToMatch: "stat" }));
    expect(r).toHaveLength(1);
  });

  it("age", async () => {
    const r = await runAnalysis(GIT_LOG, opts({ analysis: "age", ageTimeNow: "2015-03-01" }));
    expect(r[0]).toHaveProperty("ageMonths");
  });

  it("throws on unsupported analysis", async () => {
    expect(runAnalysis(GIT_LOG, opts({ analysis: "unknown" }))).rejects.toThrow("Invalid analysis");
  });
});
```

### Step 2: Run to verify it fails

```bash
bun test tests/code_maat/app/app.test.ts
```
Expected: Multiple failures (missing parsers, missing analyses in switch)

### Step 3: Implement the new `app.ts`

Replace the entire file with:

```typescript
// src/code_maat/app/app.ts
import { parseLog as parseGitLog }   from "../parsers/git";
import { parseLog as parseGit2Log }  from "../parsers/git2";
import { parseLog as parseHgLog }    from "../parsers/mercurial";
import { parseLog as parseP4Log }    from "../parsers/perforce";
import { parseLog as parseTfsLog }   from "../parsers/tfs";
import { parseReadLog as parseSvnLog } from "../parsers/svn";

import * as authors       from "../analysis/authors";
import * as entities      from "../analysis/entities";
import * as logicalCoupling from "../analysis/logical-coupling";
import * as sumOfCoupling from "../analysis/sum-of-coupling";
import * as summary       from "../analysis/summary";
import * as churn         from "../analysis/churn";
import * as effort        from "../analysis/effort";
import * as communication from "../analysis/communication";
import * as commitMessages from "../analysis/commit-messages";
import * as codeAge       from "../analysis/code-age";

import { run as runGrouper }          from "./grouper";
import { run as runTeamMapper, fileToAuthorTeamLookup } from "./team-mapper";
import { byTimePeriod }               from "./time-based-grouper";

import type { VCSEntry, AnalysisOptions } from "../types";

export type AppOptions = AnalysisOptions & {
  versionControl: string;
  analysis: string;
  temporalPeriod?: string;
  group?: string;
  teamMapFile?: string;
  ageTimeNow?: string;
  expressionToMatch?: string;
};

async function parseCommits(logFilePath: string, options: AppOptions): Promise<VCSEntry[]> {
  switch (options.versionControl) {
    case "git":  return (await parseGitLog(logFilePath,  {})) as VCSEntry[];
    case "git2": return (await parseGit2Log(logFilePath, {})) as VCSEntry[];
    case "hg":   return (await parseHgLog(logFilePath,   {})) as VCSEntry[];
    case "p4":   return (await parseP4Log(logFilePath,   {})) as VCSEntry[];
    case "tfs":  return (await parseTfsLog(logFilePath,  {})) as VCSEntry[];
    case "svn": {
      const text = await Bun.file(logFilePath).text();
      return parseSvnLog(text) as VCSEntry[];
    }
    default:
      throw new Error(
        `Invalid --version-control specified: ${options.versionControl}. ` +
        `Supported options are: svn, git, git2, hg, p4, tfs.`
      );
  }
}

function aggregate(commits: VCSEntry[], options: AppOptions): VCSEntry[] {
  let result = commits;
  if (options.group)
    result = runGrouper(options.group, result);
  if (options.temporalPeriod)
    result = byTimePeriod(result as (VCSEntry & { date: string })[], { temporalPeriod: options.temporalPeriod! }) as VCSEntry[];
  if (options.teamMapFile)
    result = runTeamMapper(result, fileToAuthorTeamLookup(options.teamMapFile));
  return result;
}

function runAnalysisOn(entries: VCSEntry[], options: AppOptions): unknown[] {
  switch (options.analysis) {
    case "authors":             return authors.byCount(entries, options);
    case "revisions":           return entities.byRevision(entries, options);
    case "coupling":            return logicalCoupling.byDegree(entries, options);
    case "soc":                 return sumOfCoupling.byDegree(entries, options);
    case "summary":             return summary.overview(entries);
    case "identity":            return entries;
    case "abs-churn":           return churn.absolutesTrend(entries, options);
    case "author-churn":        return churn.byAuthor(entries, options);
    case "entity-churn":        return churn.byEntity(entries, options);
    case "entity-ownership":    return churn.asOwnership(entries, options);
    case "main-dev":            return churn.byMainDeveloper(entries, options);
    case "refactoring-main-dev": return churn.byRefactoringMainDeveloper(entries, options);
    case "entity-effort":       return effort.asRevisionsPerAuthor(entries, options);
    case "main-dev-by-revs":    return effort.asMainDeveloperByRevisions(entries, options);
    case "fragmentation":       return effort.asEntityFragmentation(entries, options);
    case "communication":       return communication.bySharedEntities(entries);
    case "messages":
      return commitMessages.byWordFrequency(entries, {
        expressionToMatch: options.expressionToMatch ?? "",
      });
    case "age":
      return codeAge.byAge(entries, options.ageTimeNow);
    default:
      throw new Error(
        `Invalid analysis requested: ${options.analysis}. ` +
        `Valid options are: authors, revisions, coupling, soc, summary, identity, ` +
        `abs-churn, author-churn, entity-churn, entity-ownership, main-dev, ` +
        `refactoring-main-dev, entity-effort, main-dev-by-revs, fragmentation, ` +
        `communication, messages, age.`
      );
  }
}

export async function runAnalysis(logFilePath: string, options: AppOptions): Promise<unknown[]> {
  const commits  = await parseCommits(logFilePath, options);
  const grouped  = aggregate(commits, options);
  return runAnalysisOn(grouped, options);
}
```

### Step 4: Run to verify it passes

```bash
bun test tests/code_maat/app/app.test.ts
```
Expected: all tests pass. If typecheck errors arise, run `bun run tsc --noEmit` and fix them.

### Step 5: Run full suite to verify no regressions

```bash
bun test
```
Expected: all tests pass.

### Step 6: Commit

```bash
git add src/code_maat/app/app.ts tests/code_maat/app/app.test.ts
git commit -m "feat: expand app to support all VCS parsers and analyses"
```

---

## Task 3: Export `summary` from `index.ts`

**Files:**
- Modify: `src/index.ts`

### Step 1: Add the export

In `src/index.ts`, add after the existing analysis exports (after `export * as entities`):

```typescript
export * as summary from "./code_maat/analysis/summary";
```

### Step 2: Verify typecheck

```bash
bun run tsc --noEmit
```

### Step 3: Commit

```bash
git add src/index.ts
git commit -m "feat: export summary analysis from public API"
```

---

## Task 4: JAR parity test — setup and CSV formatting helpers

**Files:**
- Create: `tests/parity/helpers.ts`

The JAR is at: `../../behave/src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar`
(relative to `packages/code-mat-port/`)

The JAR CLI:
```
java -jar code-maat.jar -l <logfile> -c <vcs> -a <analysis> [--age-time-now <date>] [--expression-to-match <pattern>]
```

The TypeScript pipeline returns arrays of typed objects. We need a CSV formatter that maps TypeScript field names to the original CSV column headers.

### Step 1: Create `tests/parity/helpers.ts`

```typescript
// tests/parity/helpers.ts
import { spawnSync } from "bun";
import { join } from "path";
import { runAnalysis } from "../../src/code_maat/app/app";
import type { AppOptions } from "../../src/code_maat/app/app";

export const JAR = join(
  __dirname,
  "../../../behave/src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar"
);

export const FIXTURES = join(__dirname, "../fixtures/log-fixtures");

// CSV column headers for each analysis (must match JAR output exactly)
const HEADERS: Record<string, string[]> = {
  "authors":              ["entity", "n-authors", "n-revs"],
  "revisions":            ["entity", "n-revs"],
  "coupling":             ["entity", "coupled", "degree", "average-revs"],
  "soc":                  ["entity", "soc"],
  "summary":              ["statistic", "value"],
  "abs-churn":            ["date", "added", "deleted", "commits"],
  "author-churn":         ["author", "added", "deleted", "commits"],
  "entity-churn":         ["entity", "added", "deleted", "commits"],
  "entity-ownership":     ["entity", "author", "added%"],
  "main-dev":             ["entity", "main-dev", "added%"],
  "refactoring-main-dev": ["entity", "main-dev", "deleted%"],
  "entity-effort":        ["entity", "author", "author-revs", "total-revs"],
  "main-dev-by-revs":     ["entity", "main-dev", "added-revs", "total-revs"],
  "fragmentation":        ["entity", "fractal-value", "total-revs"],
  "communication":        ["author", "peer", "shared", "average", "strength"],
  "messages":             ["entity", "matches"],
  "age":                  ["entity", "age-months"],
};

// TypeScript field name → CSV column for each analysis
const FIELD_MAP: Record<string, Record<string, string>> = {
  "authors":              { entity: "entity", nAuthors: "n-authors", nRevs: "n-revs" },
  "revisions":            { entity: "entity", nRevs: "n-revs" },
  "coupling":             { entity: "entity", coupled: "coupled", degree: "degree", averageRevs: "average-revs" },
  "soc":                  { entity: "entity", soc: "soc" },
  "summary":              { statistic: "statistic", value: "value" },
  "abs-churn":            { date: "date", added: "added", deleted: "deleted", commits: "commits" },
  "author-churn":         { author: "author", added: "added", deleted: "deleted", commits: "commits" },
  "entity-churn":         { entity: "entity", added: "added", deleted: "deleted", commits: "commits" },
  "entity-ownership":     { entity: "entity", author: "author", addedPercent: "added%" },
  "main-dev":             { entity: "entity", mainDev: "main-dev", addedPercent: "added%" },
  "refactoring-main-dev": { entity: "entity", mainDev: "main-dev", deletedPercent: "deleted%" },
  "entity-effort":        { entity: "entity", author: "author", authorRevs: "author-revs", totalRevs: "total-revs" },
  "main-dev-by-revs":     { entity: "entity", mainDev: "main-dev", addedRevs: "added-revs", totalRevs: "total-revs" },
  "fragmentation":        { entity: "entity", fractalValue: "fractal-value", totalRevs: "total-revs" },
  "communication":        { author: "author", peer: "peer", shared: "shared", average: "average", strength: "strength" },
  "messages":             { entity: "entity", matches: "matches" },
  "age":                  { entity: "entity", ageMonths: "age-months" },
};

export function toCSV(rows: unknown[], analysis: string): string {
  const headers = HEADERS[analysis];
  const fieldMap = FIELD_MAP[analysis];
  if (!headers || !fieldMap) throw new Error(`No CSV mapping for analysis: ${analysis}`);

  // Inverse map: csv-header → ts-field
  const inverseMap: Record<string, string> = {};
  for (const [tsField, csvHeader] of Object.entries(fieldMap)) {
    inverseMap[csvHeader] = tsField;
  }

  const lines = [headers.join(",")];
  for (const row of rows as Record<string, unknown>[]) {
    const values = headers.map(h => {
      const tsField = inverseMap[h]!;
      return String(row[tsField] ?? "");
    });
    lines.push(values.join(","));
  }
  return lines.join("\n") + "\n";
}

export function runJar(logFile: string, vcs: string, analysis: string, extra: string[] = []): string {
  const result = spawnSync([
    "java", "-jar", JAR,
    "-l", logFile,
    "-c", vcs,
    "-a", analysis,
    ...extra,
  ]);
  if (result.exitCode !== 0) {
    throw new Error(`JAR failed: ${result.stderr}`);
  }
  return result.stdout.toString();
}

export async function runTS(logFile: string, opts: Partial<AppOptions> & { versionControl: string; analysis: string }): Promise<string> {
  const options: AppOptions = {
    minRevs: 1, minSharedRevs: 1, minCoupling: 0,
    maxCoupling: 100, maxChangesetSize: 1000,
    ...opts,
  };
  const rows = await runAnalysis(logFile, options);
  return toCSV(rows, opts.analysis);
}
```

### Step 2: Verify the helpers compile

```bash
bun run tsc --noEmit
```

### Step 3: Commit

```bash
git add tests/parity/helpers.ts
git commit -m "feat: add JAR parity test helpers (CSV formatter, JAR runner)"
```

---

## Task 5: JAR parity tests — git format

**Files:**
- Create: `tests/parity/git-parity.test.ts`

### Step 1: Write the tests

```typescript
// tests/parity/git-parity.test.ts
import { describe, it, expect } from "bun:test";
import { join } from "path";
import { runJar, runTS, FIXTURES } from "./helpers";

const GIT_LOG = join(FIXTURES, "simple_git.txt");
const VCS = "git";

// Analyses that work without LOC data (no churn analyses)
const BASIC_ANALYSES = [
  "authors", "revisions", "coupling", "soc", "summary",
  "entity-effort", "main-dev-by-revs", "fragmentation", "communication",
];

// Age reference date matches scenario_tests.clj
const AGE_DATE = "2015-03-01";

describe("JAR vs TypeScript parity — git format", () => {
  for (const analysis of BASIC_ANALYSES) {
    it(`${analysis}`, async () => {
      const jarOut = runJar(GIT_LOG, VCS, analysis);
      const tsOut  = await runTS(GIT_LOG, { versionControl: VCS, analysis });
      expect(tsOut).toEqual(jarOut);
    });
  }

  it("age (with reference date)", async () => {
    const jarOut = runJar(GIT_LOG, VCS, "age", ["--age-time-now", AGE_DATE]);
    const tsOut  = await runTS(GIT_LOG, { versionControl: VCS, analysis: "age", ageTimeNow: AGE_DATE });
    expect(tsOut).toEqual(jarOut);
  });

  it("messages (with pattern)", async () => {
    const pattern = "stat";
    const jarOut = runJar(GIT_LOG, VCS, "messages", ["--expression-to-match", pattern]);
    const tsOut  = await runTS(GIT_LOG, { versionControl: VCS, analysis: "messages", expressionToMatch: pattern });
    expect(tsOut).toEqual(jarOut);
  });

  // Churn analyses require locAdded/locDeleted — only available in git/git2
  const CHURN_ANALYSES = [
    "abs-churn", "author-churn", "entity-churn",
    "entity-ownership", "main-dev", "refactoring-main-dev",
  ];

  for (const analysis of CHURN_ANALYSES) {
    it(`${analysis} (git churn)`, async () => {
      const jarOut = runJar(GIT_LOG, VCS, analysis);
      const tsOut  = await runTS(GIT_LOG, { versionControl: VCS, analysis });
      expect(tsOut).toEqual(jarOut);
    });
  }
});
```

### Step 2: Run tests

```bash
bun test tests/parity/git-parity.test.ts
```

If there are mismatches, investigate the diff and fix the TypeScript implementation. Common issues:
- Column ordering differences → fix `FIELD_MAP` order in helpers
- Rounding differences → check the analysis function math
- Sort order differences → check the analysis sort

### Step 3: Fix any mismatches, then commit

```bash
git add tests/parity/git-parity.test.ts
git commit -m "feat: add JAR parity tests for git format"
```

---

## Task 6: JAR parity tests — git2, hg, p4 formats

**Files:**
- Create: `tests/parity/multi-vcs-parity.test.ts`

### Step 1: Write the tests

```typescript
// tests/parity/multi-vcs-parity.test.ts
import { describe, it, expect } from "bun:test";
import { join } from "path";
import { runJar, runTS, FIXTURES } from "./helpers";

const AGE_DATE = "2015-03-01";

// Analyses that work for all VCS (no churn — hg and p4 have no LOC data)
const NON_CHURN = [
  "authors", "revisions", "coupling", "soc", "summary",
  "entity-effort", "main-dev-by-revs", "fragmentation",
  "communication",
];

const VCS_FILES: Array<[string, string]> = [
  ["git2", join(FIXTURES, "simple_git2.txt")],
  ["hg",   join(FIXTURES, "simple_hg.txt")],
  ["p4",   join(FIXTURES, "simple_p4.txt")],
];

for (const [vcs, logFile] of VCS_FILES) {
  describe(`JAR vs TypeScript parity — ${vcs} format`, () => {
    for (const analysis of NON_CHURN) {
      it(`${analysis}`, async () => {
        const jarOut = runJar(logFile, vcs, analysis);
        const tsOut  = await runTS(logFile, { versionControl: vcs, analysis });
        expect(tsOut).toEqual(jarOut);
      });
    }

    it("age (with reference date)", async () => {
      const jarOut = runJar(logFile, vcs, "age", ["--age-time-now", AGE_DATE]);
      const tsOut  = await runTS(logFile, { versionControl: vcs, analysis: "age", ageTimeNow: AGE_DATE });
      expect(tsOut).toEqual(jarOut);
    });
  });
}

// git2 also has LOC data (churn analyses work)
describe("JAR vs TypeScript parity — git2 churn", () => {
  const GIT2_LOG = join(FIXTURES, "simple_git2.txt");
  const CHURN = [
    "abs-churn", "author-churn", "entity-churn",
    "entity-ownership", "main-dev", "refactoring-main-dev",
  ];

  for (const analysis of CHURN) {
    it(`${analysis}`, async () => {
      const jarOut = runJar(GIT2_LOG, "git2", analysis);
      const tsOut  = await runTS(GIT2_LOG, { versionControl: "git2", analysis });
      expect(tsOut).toEqual(jarOut);
    });
  }
});
```

### Step 2: Run tests

```bash
bun test tests/parity/multi-vcs-parity.test.ts
```

Fix any mismatches (see Task 5 guidance).

### Step 3: Run full suite

```bash
bun test
bun run tsc --noEmit
```

### Step 4: Commit

```bash
git add tests/parity/multi-vcs-parity.test.ts
git commit -m "feat: add JAR parity tests for git2, hg, and p4 formats"
```

---

## Verification Checklist

- [ ] `bun test` — all tests pass (no regressions from 212 baseline)
- [ ] `bun run tsc --noEmit` — no typecheck errors
- [ ] JAR parity: git format — all analyses match
- [ ] JAR parity: git2, hg, p4 — non-churn analyses match
- [ ] JAR parity: git2 churn — all churn analyses match

## Notes

- **`identity` analysis** is intentionally excluded from parity tests — it dumps raw parsed entries and the column schema differs between VCS types (git includes loc-added, loc-deleted; hg/p4 do not). It's a debug aid, not a production analysis.
- **`messages` analysis for hg/p4** is intentionally excluded — those parsers produce placeholder message values (`"-"`, `""`), which code-maat correctly rejects with an error.
- If the JAR outputs numbers with different precision than our TypeScript (e.g., `66.6` vs `66`), check the rounding in the analysis function. The original uses `Math/floor` for coupling degree.
- If sorting order differs, compare the sort comparator in the analysis function against the Clojure source in `tmp/code-maat/src/`.
