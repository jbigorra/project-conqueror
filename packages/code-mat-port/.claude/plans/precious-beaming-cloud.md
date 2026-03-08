\*\*\*\*# Code-Maat TypeScript Port — Implementation Plan (Tasks 13–28)

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port all Clojure tests (and their source implementations) from code-maat to TypeScript running on Bun. The original repository code is available in ./tmp/code-maat.

**Architecture:** Each Clojure namespace maps 1:1 to a TypeScript module. Incanter datasets are replaced by plain typed arrays of objects.

**Tech Stack:** Bun test runner (`bun test` / `expect`), TypeScript, csv-parse (already installed)

**Standard TDD Steps (used in every task):**

1. Write the failing test
2. Run test to verify it fails
3. Write implementation
4. Run test to verify it passes
5. **Run typecheck:** `cd packages/code-mat-port && bun run tsc --noEmit` — Expected: no type errors
6. Fix any type errors, re-run tests to confirm still passing
7. Commit

## Completed Tasks (1–12)

- Task 1: Fix test script ✓
- Task 2: Shared types and test fixtures ✓ (`src/code_maat/types.ts`, `tests/fixtures/`)
- Task 3: Math module ✓ (`src/code_maat/analysis/math.ts`)
- Task 4: Time parser ✓ (`src/code_maat/parsers/time-parser.ts`)
- Task 5: Dataset utility ✓ (`src/code_maat/dataset/dataset.ts`)
- Task 6: Git2 parser ✓ (`src/code_maat/parsers/git2.ts`)
- Task 7: Git parser ✓ (`src/code_maat/parsers/git.ts`)
- Task 8: Mercurial parser ✓ (`src/code_maat/parsers/mercurial.ts`)
- Task 9: Perforce parser ✓ (`src/code_maat/parsers/perforce.ts`)
- Task 10: SVN parser ✓ (`src/code_maat/parsers/svn.ts`)
- Task 11: TFS parser ✓ (`src/code_maat/parsers/tfs.ts`)
- Task 12: Entities analysis ✓ (`src/code_maat/analysis/entities.ts`)

---

## Naming Conventions

| Clojure                    | TypeScript                                |
| -------------------------- | ----------------------------------------- |
| `:entity`, `:n-revs`       | `entity`, `nRevs` (camelCase object keys) |
| `by-revision`              | `byRevision` (camelCase functions)        |
| `(deftest ...)`            | `test("...", () => { ... })`              |
| `(is (= expected actual))` | `expect(actual).toEqual(expected)`        |
| Incanter dataset           | `Array<Record>` plain objects             |
| Clojure ratio `2/3`        | JS `2/3` → `0.6666...`                    |

## Type Reference

```typescript
// src/code_maat/types.ts
export type VCSEntry = {
  author: string;
  entity: string;
  rev: string | number;
  date?: string;
  locAdded?: string;
  locDeleted?: string;
  message?: string;
};

export type AnalysisOptions = {
  minRevs: number;
  minSharedRevs: number;
  minCoupling: number;
  maxCoupling: number;
  maxChangesetSize: number;
};
```

## Shared Test Fixtures

```typescript
// tests/fixtures/test-data.ts
export const vcs: VCSEntry[] = [
  { author: "apt", entity: "A", rev: 1, message: "Some change" },
  { author: "apt", entity: "B", rev: 1, message: "Another change" },
  { author: "apt", entity: "A", rev: 2, message: "Second change" },
  { author: "jt", entity: "A", rev: 3, message: "Third change" },
];
export const optionsWithLowThresholds: AnalysisOptions = {
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 50,
  maxCoupling: 100,
  maxChangesetSize: 10,
};
```

---

## Task 13: Authors analysis

**Files:**

- Create: `src/code_maat/analysis/authors.ts`
- Create: `tests/code_maat/analysis/authors.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/authors_test.clj`

Key tests:

- `all(vcs)` → Set of all unique authors
- `ofModule(vcs, "A")` → authors who touched entity A
- `byCount(vcs, options)` → sorted by number of distinct authors per entity (desc)

```typescript
// src/code_maat/analysis/authors.ts
import type { VCSEntry, AnalysisOptions } from "../types";

export function all(ds: VCSEntry[]): Set<string> {
  return new Set(ds.map((r) => r.author));
}

export function ofModule(ds: VCSEntry[], entity: string): Set<string> {
  return new Set(ds.filter((r) => r.entity === entity).map((r) => r.author));
}

export function byCount(
  ds: VCSEntry[],
  options: AnalysisOptions & { sort?: "asc" | "desc" },
): Array<{ entity: string; nAuthors: number }> {
  const entityAuthors = new Map<string, Set<string>>();
  for (const row of ds) {
    if (!entityAuthors.has(row.entity)) entityAuthors.set(row.entity, new Set());
    entityAuthors.get(row.entity)!.add(row.author);
  }
  const direction = options.sort ?? "desc";
  return [...entityAuthors.entries()]
    .map(([entity, authors]) => ({ entity, nAuthors: authors.size }))
    .sort((a, b) => (direction === "desc" ? b.nAuthors - a.nAuthors : a.nAuthors - b.nAuthors));
}
```

Follow standard TDD steps.

---

## Task 14: Coupling algorithms

**Files:**

- Create: `src/code_maat/analysis/coupling-algos.ts`
- Create: `tests/code_maat/analysis/coupling-algos.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/coupling_algos_test.clj`

Key test data:

```typescript
const oneRevision = [
  { author: "a", entity: "A", rev: 1 },
  { author: "a", entity: "B", rev: 1 },
  { author: "a", entity: "C", rev: 1 },
];
const coupled = [
  { author: "a", entity: "A", rev: 1 },
  { author: "a", entity: "B", rev: 1 },
  { author: "a", entity: "C", rev: 1 },
  { author: "a", entity: "A", rev: 2 },
  { author: "a", entity: "B", rev: 2 },
];
```

Key tests:

- `asCoChangingModules(oneRevision)` → pairs: [[A,B],[A,C],[B,C]] (all combos)
- `couplingFrequencies(coupled)` → how many times each pair co-changed
- `moduleByRevs(coupled)` → frequency map of entity → revision count

Follow standard TDD steps.

---

## Task 15: Logical coupling

**Files:**

- Create: `src/code_maat/analysis/logical-coupling.ts`
- Create: `tests/code_maat/analysis/logical-coupling.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/logical_coupling_test.clj`

Formula: `degree = sharedRevisions / average(revisionsOfA, revisionsOfB)`

Key tests:

- Coupling degree calculation
- Verbose output format
- Boundary: single entity commit → no pairs → empty result

Follow standard TDD steps.

---

## Task 16: Churn analysis

**Files:**

- Create: `src/code_maat/analysis/churn.ts`
- Create: `tests/code_maat/analysis/churn.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/churn_test.clj`

Key tests:

- Absolute churn (lines added, deleted, commit counts)
- Churn by date / by author / by entity
- Ownership (highest contributor)
- Binary file handling (skip `-` values)

Follow standard TDD steps.

---

## Task 17: Code age

**Files:**

- Create: `src/code_maat/analysis/code-age.ts`
- Create: `tests/code_maat/analysis/code-age.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/code_age_test.clj`

Key tests:

- Age from most recent modification date (in months)
- Time progression (1 month and 1 year forward scenarios)
- Historical analysis relative to a given reference date

Follow standard TDD steps.

---

## Task 18: Commit messages

**Files:**

- Create: `src/code_maat/analysis/commit-messages.ts`
- Create: `tests/code_maat/analysis/commit-messages.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/commit_messages_test.clj`

Key tests:

- Word frequency in commit messages
- Handles absent/empty message fields

Follow standard TDD steps.

---

## Task 19: Communication

**Files:**

- Create: `src/code_maat/analysis/communication.ts`
- Create: `tests/code_maat/analysis/communication.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/communication_test.clj`

Key tests:

- Developer communication needs based on shared entity edits
- Author-peer relationships and shared entity count
- Connection strength (50–100% range)

Follow standard TDD steps.

---

## Task 20: Effort

**Files:**

- Create: `src/code_maat/analysis/effort.ts`
- Create: `tests/code_maat/analysis/effort.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/effort_test.clj`

Key tests:

- Revision metrics per author
- Entity fragmentation (number of distinct authors)
- Ownership: main developer and ownership percentage

Follow standard TDD steps.

---

## Task 21: Sum of coupling

**Files:**

- Create: `src/code_maat/analysis/sum-of-coupling.ts`
- Create: `tests/code_maat/analysis/sum-of-coupling.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/analysis/sum_of_coupling_test.clj`

Key tests:

- Coupling sum per entity with low thresholds (minCoupling: 50)

Follow standard TDD steps.

---

## Task 22: Grouper (app layer)

**Files:**

- Create: `src/code_maat/app/grouper.ts`
- Create: `tests/code_maat/app/grouper.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/app/grouper_test.clj`

Groups entities into architectural layers via text/regex patterns defined in a spec file.

Key tests:

- Parse text-based layer specs
- Parse regex-based layer specs
- Mixed patterns
- Edge cases: backslashes, dots, dashes in paths
- Unmapped entities pass through unchanged

Follow standard TDD steps.

---

## Task 23: Team mapper

**Files:**

- Create: `src/code_maat/app/team-mapper.ts`
- Create: `tests/code_maat/app/team-mapper.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/app/team_mapper_test.clj`

Maps individual authors to team names via CSV config.

Key tests:

- Maps authors to same team
- Maps to different teams
- Unmapped authors pass through as-is

Follow standard TDD steps.

---

## Task 24: Time-based grouper

**Files:**

- Create: `src/code_maat/app/time-based-grouper.ts`
- Create: `tests/code_maat/app/time-based-grouper.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/app/time_based_grouper_test.clj`

Groups commits into temporal windows (sliding/rolling by day).

Key tests:

- Commits by day
- Rolling dataset with multiple days (2-day window)
- Edge cases: empty input, single commit

Follow standard TDD steps.

---

## Task 25: App orchestration (time-based end-to-end)

**Files:**

- Create: `src/code_maat/app/app.ts`
- Create: `tests/code_maat/app/time-based-end-to-end.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/app/time_based_end_to_end_test.clj`

Key tests:

- Default coupling (within commit)
- Time-based coupling (within same day)
- Error handling for invalid period values

Follow standard TDD steps.

---

## Task 26: CLI argument parsing

**Files:**

- Create: `src/code_maat/cmd-line.ts`
- Create: `tests/code_maat/app/cmd-line.test.ts`

Read test from: `./tmp/code-maat/test/code_maat/app/cmd_line_test.clj`

Key tests:

- Simple parsing with `-l` flag
- No errors on valid input

Follow standard TDD steps.

---

## Task 27: End-to-end scenario tests (optional / last)

**Files:**

- Create: `tests/fixtures/logs/` (copy from `./tmp/code-maat/test/code_maat/end_to_end/`)
- Create: `tests/code_maat/end_to_end/scenario.test.ts`

Log fixture files to copy:

- `simple_git.txt`, `simple_git2.txt`, `simple_hg.txt`, `simple_p4.txt`, `statsvn.log`

The end-to-end tests run the full pipeline: parse log file → apply analysis → check CSV output.

Follow standard TDD steps.

---

## Task 28: Export public API

**Files:**

- Create: `src/index.ts`

```typescript
// src/index.ts
export * from "./code_maat/types";
export * from "./code_maat/analysis/math";
export * from "./code_maat/analysis/entities";
export * from "./code_maat/analysis/authors";
export * from "./code_maat/analysis/churn";
export * from "./code_maat/analysis/code-age";
export * from "./code_maat/analysis/commit-messages";
export * from "./code_maat/analysis/communication";
export * from "./code_maat/analysis/coupling-algos";
export * from "./code_maat/analysis/effort";
export * from "./code_maat/analysis/logical-coupling";
export * from "./code_maat/analysis/sum-of-coupling";
export * from "./code_maat/parsers/git";
export * from "./code_maat/parsers/git2";
export * from "./code_maat/parsers/mercurial";
export * from "./code_maat/parsers/perforce";
export * from "./code_maat/parsers/svn";
export * from "./code_maat/parsers/tfs";
export * from "./code_maat/parsers/time-parser";
export * from "./code_maat/dataset/dataset";
export * from "./code_maat/app/grouper";
export * from "./code_maat/app/team-mapper";
export * from "./code_maat/app/time-based-grouper";
```

Verify build: `cd packages/code-mat-port && bun run build`
Verify all tests: `bun test`
Commit: `git commit -m "feat: export public API from index"`

---

## Verification

```bash
cd packages/code-mat-port && bun test         # all tests
bun run tsc --noEmit                          # type-check
bun run build                                 # build dist/
```
