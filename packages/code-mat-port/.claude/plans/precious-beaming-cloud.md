\*\*\*\*# Code-Maat TypeScript Port — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port all Clojure tests (and their source implementations) from [code-maat](https://github.com/adamtornhill/code-maat) to TypeScript running on Bun, preserving all semantics and test intent. The original repository code is available in ./tmp/code-maat to avoid fetching via http.

**Architecture:** Each Clojure namespace maps 1:1 to a TypeScript module. Incanter datasets are replaced by plain typed arrays of objects. Instaparse grammars are replaced by regex-based parsers. Tests live in `tests/` (matching bunfig.toml `root = "tests"`).

**Tech Stack:** Bun test runner (`bun test` / `expect`), TypeScript, fishery (factories if needed), bun-automock (mocking if needed), csv-parse (already installed)

**Standard TDD Steps (used in every task):**
1. Write the failing test
2. Run test to verify it fails
3. Write implementation
4. Run test to verify it passes
5. **Run typecheck:** `cd packages/code-mat-port && bun run tsc --noEmit` — Expected: no type errors
6. Fix any type errors, re-run tests to confirm still passing
7. Commit

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

## Type Reference (used throughout)

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

---

## Task 1: Fix test script in package.json

**Files:**

- Modify: `packages/code-mat-port/package.json`

**Step 1: Update test script**

Change:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

To:

```json
"test": "bun test"
```

**Step 2: Verify test runner works**

```bash
cd packages/code-mat-port && bun test
```

Expected: "No tests found" or similar (no failures)

**Step 3: Commit**

```bash
git add packages/code-mat-port/package.json
git commit -m "chore: enable bun test runner in code-mat-port"
```

---

## Task 2: Create shared types and test fixtures

**Files:**

- Create: `packages/code-mat-port/src/code_maat/types.ts`
- Create: `packages/code-mat-port/tests/fixtures/test-data.ts`
- Create: `packages/code-mat-port/tests/fixtures/options.ts`

**Step 1: Create shared types**

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

**Step 2: Create test data fixtures** (port of `test/code_maat/analysis/test_data.clj`)

```typescript
// tests/fixtures/test-data.ts
import type { VCSEntry, AnalysisOptions } from "../../src/code_maat/types";

// vcs = raw array of entries (replaces Incanter dataset)
export const vcs: VCSEntry[] = [
  { author: "apt", entity: "A", rev: 1, message: "Some change" },
  { author: "apt", entity: "B", rev: 1, message: "Another change" },
  { author: "apt", entity: "A", rev: 2, message: "Second change" },
  { author: "jt", entity: "A", rev: 3, message: "Third change" },
];

export const singleVcs: VCSEntry[] = [{ author: "apt", entity: "A", rev: 1 }];

export const emptyVcs: VCSEntry[] = [];

export const optionsWithLowThresholds: AnalysisOptions = {
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 50,
  maxCoupling: 100,
  maxChangesetSize: 10,
};
```

**Step 3: Commit**

```bash
git add packages/code-mat-port/src/code_maat/types.ts packages/code-mat-port/tests/
git commit -m "chore: add shared types and test fixtures"
```

---

## Task 3: Math module

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/math.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/math.test.ts`

**Step 1: Write the failing test** (port of `test/code_maat/analysis/math_test.clj`)

```typescript
// tests/code_maat/analysis/math.test.ts
import { describe, test, expect } from "bun:test";
import { ratioCentiFloatPrecision } from "../../../src/code_maat/analysis/math";

describe("math", () => {
  test("ratio to centi float precision", () => {
    expect(ratioCentiFloatPrecision(1.0)).toBe(1.0);
    expect(ratioCentiFloatPrecision(0.5)).toBe(0.5);
    expect(ratioCentiFloatPrecision(2 / 3)).toBe(0.67);
    expect(ratioCentiFloatPrecision(5 / 6)).toBe(0.83);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/code-mat-port && bun test tests/code_maat/analysis/math.test.ts
```

Expected: FAIL — module not found

**Step 3: Write implementation**

```typescript
// src/code_maat/analysis/math.ts
export function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function asPercentage(value: number): number {
  return value * 100;
}

export function ratioCentiFloatPrecision(value: number): number {
  return Math.round(value * 100) / 100;
}
```

**Step 4: Run test to verify it passes**

```bash
bun test tests/code_maat/analysis/math.test.ts
```

Expected: PASS

**Step 5: Run typecheck**

```bash
cd packages/code-mat-port && bun run tsc --noEmit
```

Expected: no type errors. Fix any errors, then re-run tests to confirm still passing.

**Step 6: Commit**

```bash
git add packages/code-mat-port/src/code_maat/analysis/math.ts packages/code-mat-port/tests/code_maat/analysis/math.test.ts
git commit -m "feat: port math analysis module with tests"
```

---

## Task 4: Time parser

**Files:**

- Create: `packages/code-mat-port/src/code_maat/parsers/time-parser.ts`
- Create: `packages/code-mat-port/tests/code_maat/parsers/time-parser.test.ts`

**Step 1: Write the failing test** (port of `test/code_maat/parsers/time_parser_test.clj`)

```typescript
// tests/code_maat/parsers/time-parser.test.ts
import { describe, test, expect } from "bun:test";
import { timeStringConverterFrom } from "../../../src/code_maat/parsers/time-parser";

describe("time parser", () => {
  test("parses git date format (YYYY-MM-dd) and returns same format", () => {
    const parser = timeStringConverterFrom("YYYY-MM-dd");
    expect(parser("2014-12-26")).toBe("2014-12-26");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun test tests/code_maat/parsers/time-parser.test.ts
```

**Step 3: Write implementation**

```typescript
// src/code_maat/parsers/time-parser.ts
// Internal format is always YYYY-MM-DD (ISO date)

export function timeStringConverterFrom(inputFormat: string): (dateStr: string) => string {
  // Both git and git2 already produce YYYY-MM-dd — return as-is
  // For other formats add mappings here
  return (dateStr: string) => {
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    throw new Error(`Cannot parse date: ${dateStr} with format ${inputFormat}`);
  };
}

export function timeParserFrom(format: string): (dateStr: string) => string {
  return timeStringConverterFrom(format);
}
```

**Step 4: Run test to verify it passes**

```bash
bun test tests/code_maat/parsers/time-parser.test.ts
```

Expected: PASS

**Step 5: Run typecheck**

```bash
cd packages/code-mat-port && bun run tsc --noEmit
```

Expected: no type errors. Fix any errors, then re-run tests to confirm still passing.

**Step 6: Commit**

```bash
git add packages/code-mat-port/src/code_maat/parsers/time-parser.ts packages/code-mat-port/tests/code_maat/parsers/time-parser.test.ts
git commit -m "feat: port time-parser module with tests"
```

---

## Task 5: Dataset utility

**Files:**

- Create: `packages/code-mat-port/src/code_maat/dataset/dataset.ts`
- Create: `packages/code-mat-port/tests/code_maat/dataset/dataset.test.ts`

**Step 1: Write the failing test** (port of `test/code_maat/dataset/dataset_test.clj`)

The Clojure tests validate: empty detection, groupBy, column select, row count. In TS we use plain arrays.

```typescript
// tests/code_maat/dataset/dataset.test.ts
import { describe, test, expect } from "bun:test";
import { isEmpty, groupBy, selectColumn, nrows } from "../../../src/code_maat/dataset/dataset";

const sampleData = [
  { entity: "A", author: "apt", rev: 1 },
  { entity: "B", author: "apt", rev: 1 },
  { entity: "A", author: "apt", rev: 2 },
  { entity: "A", author: "jt", rev: 3 },
];

describe("dataset", () => {
  test("recognizes an empty dataset", () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty(sampleData)).toBe(false);
  });

  test("groups by entity", () => {
    const grouped = groupBy(sampleData, "entity");
    expect(grouped["A"]).toHaveLength(3);
    expect(grouped["B"]).toHaveLength(1);
  });

  test("selects a column", () => {
    expect(selectColumn(sampleData, "entity")).toEqual(["A", "B", "A", "A"]);
  });

  test("counts rows", () => {
    expect(nrows(sampleData)).toBe(4);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun test tests/code_maat/dataset/dataset.test.ts
```

**Step 3: Write implementation**

```typescript
// src/code_maat/dataset/dataset.ts
export function isEmpty<T>(ds: T[]): boolean {
  return ds.length === 0;
}

export function groupBy<T extends Record<string, unknown>>(ds: T[], key: keyof T): Record<string, T[]> {
  return ds.reduce(
    (acc, row) => {
      const k = String(row[key]);
      acc[k] = acc[k] ?? [];
      acc[k].push(row);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export function selectColumn<T extends Record<string, unknown>>(ds: T[], key: keyof T): unknown[] {
  return ds.map((row) => row[key]);
}

export function nrows<T>(ds: T[]): number {
  return ds.length;
}

export function orderBy<T extends Record<string, unknown>>(
  ds: T[],
  key: keyof T,
  direction: "asc" | "desc" = "desc",
): T[] {
  return [...ds].sort((a, b) => {
    const av = a[key] as number;
    const bv = b[key] as number;
    return direction === "desc" ? bv - av : av - bv;
  });
}

export function where<T extends Record<string, unknown>>(ds: T[], predicate: (row: T) => boolean): T[] {
  return ds.filter(predicate);
}
```

**Step 4: Run test to verify it passes**

```bash
bun test tests/code_maat/dataset/dataset.test.ts
```

Expected: PASS

**Step 5: Run typecheck**

```bash
cd packages/code-mat-port && bun run tsc --noEmit
```

Expected: no type errors. Fix any errors, then re-run tests to confirm still passing.

**Step 6: Commit**

```bash
git add packages/code-mat-port/src/code_maat/dataset/ packages/code-mat-port/tests/code_maat/dataset/
git commit -m "feat: port dataset utility module with tests"
```

---

## Task 6: Git2 parser (preferred parser)

**Files:**

- Create: `packages/code-mat-port/src/code_maat/parsers/git2.ts`
- Create: `packages/code-mat-port/tests/code_maat/parsers/git2.test.ts`

**Step 1: Write the failing test** (port of `test/code_maat/parsers/git2_test.clj`)

Git2 format: `--{hash}--{date}--{author}\n{added}\t{deleted}\t{file}\n...`

```typescript
// tests/code_maat/parsers/git2.test.ts
import { describe, test, expect } from "bun:test";
import { parseReadLog } from "../../../src/code_maat/parsers/git2";

const entry = `--990442e--2013-08-29--Adam Petersen
1\t0\tproject.clj
2\t4\tsrc/code_maat/parsers/git.clj
`;

const binaryEntry = `--990442e--2013-11-10--Adam Petersen
-\t-\tproject.bin
2\t40\tsrc/code_maat/parsers/git.clj
`;

const entries = `--b777738--2013-08-29--Adam Petersen
10\t9\tsrc/code_maat/parsers/git.clj
32\t0\ttest/code_maat/parsers/git_test.clj

--a527b79--2013-08-29--Adam Petersen
6\t2\tsrc/code_maat/parsers/git.clj
0\t7\ttest/code_maat/end_to_end/scenario_tests.clj
18\t0\ttest/code_maat/end_to_end/simple_git.txt
21\t0\ttest/code_maat/end_to_end/svn_live_data_test.clj
`;

const pullRequests = `--0d3de0c--2013-01-04--Mr X
--77c8751--2013-01-04--Mr Y
1\t1\tbuild.xml
1\t1\tproject/Versions.scala
`;

describe("git2 parser", () => {
  test("parses single entry to dataset", () => {
    expect(parseReadLog(entry, {})).toEqual([
      {
        locDeleted: "0",
        locAdded: "1",
        author: "Adam Petersen",
        rev: "990442e",
        date: "2013-08-29",
        entity: "project.clj",
        message: "-",
      },
      {
        locDeleted: "4",
        locAdded: "2",
        author: "Adam Petersen",
        rev: "990442e",
        date: "2013-08-29",
        entity: "src/code_maat/parsers/git.clj",
        message: "-",
      },
    ]);
  });

  test("parses binary entry (churn shown as dash)", () => {
    expect(parseReadLog(binaryEntry, {})).toEqual([
      {
        locDeleted: "-",
        locAdded: "-",
        author: "Adam Petersen",
        rev: "990442e",
        date: "2013-11-10",
        entity: "project.bin",
        message: "-",
      },
      {
        locDeleted: "40",
        locAdded: "2",
        author: "Adam Petersen",
        rev: "990442e",
        date: "2013-11-10",
        entity: "src/code_maat/parsers/git.clj",
        message: "-",
      },
    ]);
  });

  test("parses multiple entries", () => {
    const result = parseReadLog(entries, {});
    expect(result).toHaveLength(6);
    expect(result[0]).toMatchObject({
      rev: "b777738",
      entity: "src/code_maat/parsers/git.clj",
      locAdded: "10",
      locDeleted: "9",
    });
  });

  test("parses empty log to empty array", () => {
    expect(parseReadLog("", {})).toEqual([]);
  });

  test("parses pull requests (skips commits with no file changes)", () => {
    const result = parseReadLog(pullRequests, {});
    expect(result).toEqual([
      {
        locDeleted: "1",
        locAdded: "1",
        author: "Mr Y",
        rev: "77c8751",
        date: "2013-01-04",
        entity: "build.xml",
        message: "-",
      },
      {
        locDeleted: "1",
        locAdded: "1",
        author: "Mr Y",
        rev: "77c8751",
        date: "2013-01-04",
        entity: "project/Versions.scala",
        message: "-",
      },
    ]);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun test tests/code_maat/parsers/git2.test.ts
```

**Step 3: Write implementation**

```typescript
// src/code_maat/parsers/git2.ts
import type { VCSEntry } from "../types";

type ParsedEntry = Omit<VCSEntry, "rev"> & { rev: string };

// Commit header: --{hash}--{YYYY-MM-dd}--{author}
const COMMIT_HEADER = /^--([0-9a-f]+)--(\d{4}-\d{2}-\d{2})--(.+)$/;
// File line: {added}\t{deleted}\t{path}
const FILE_LINE = /^(-|\d+)\t(-|\d+)\t(.+)$/;

export function parseReadLog(text: string, _options: Record<string, unknown>): ParsedEntry[] {
  if (!text.trim()) return [];

  const lines = text.split("\n");
  const result: ParsedEntry[] = [];
  let currentRev: string | null = null;
  let currentDate: string | null = null;
  let currentAuthor: string | null = null;

  for (const line of lines) {
    const headerMatch = line.match(COMMIT_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1];
      currentDate = headerMatch[2];
      currentAuthor = headerMatch[3];
      continue;
    }

    const fileMatch = line.match(FILE_LINE);
    if (fileMatch && currentRev) {
      result.push({
        locAdded: fileMatch[1],
        locDeleted: fileMatch[2],
        entity: fileMatch[3],
        rev: currentRev,
        date: currentDate!,
        author: currentAuthor!,
        message: "-",
      });
    }
  }

  return result;
}

export function parseLog(filePath: string, options: Record<string, unknown>): ParsedEntry[] {
  const text = Bun.file(filePath).text();
  return parseReadLog(text as unknown as string, options);
}
```

**Step 4: Run test to verify it passes**

```bash
bun test tests/code_maat/parsers/git2.test.ts
```

Expected: PASS

**Step 5: Run typecheck**

```bash
cd packages/code-mat-port && bun run tsc --noEmit
```

Expected: no type errors. Fix any errors, then re-run tests to confirm still passing.

**Step 6: Commit**

```bash
git add packages/code-mat-port/src/code_maat/parsers/git2.ts packages/code-mat-port/tests/code_maat/parsers/git2.test.ts
git commit -m "feat: port git2 parser with tests"
```

---

## Task 7: Git parser (legacy format)

**Files:**

- Create: `packages/code-mat-port/src/code_maat/parsers/git.ts`
- Create: `packages/code-mat-port/tests/code_maat/parsers/git.test.ts`

**Step 1: Write the failing test** (port of `test/code_maat/parsers/git_test.clj`)

Git format: `[{hash}] {author} {YYYY-MM-dd} {message}\n{added}\t{deleted}\t{file}\n...`
Fetch raw test data from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/parsers/git_test.clj

Key test cases:

- Single entry: `[26682d] Adam Petersen 2013-10-01 Added Clojure\n4\t0\tproject.clj\n3\t1\tsrc/...`
- Binary entry: `-` for loc-added/deleted
- Multiple entries: several commits
- Empty log → `[]`
- Pull requests: merge commits with no file stats are skipped
- Date in message: regression — date in commit message must not be parsed as commit date

```typescript
// tests/code_maat/parsers/git.test.ts
import { describe, test, expect } from "bun:test";
import { parseReadLog } from "../../../src/code_maat/parsers/git";

const entry = `[26682d] Adam Petersen 2013-10-01 Added Clojure
4\t0\tproject.clj
3\t1\tsrc/code_maat/parsers/git.clj
`;

const binaryEntry = `[26682d] Adam Petersen 2013-10-01 Added binary
-\t-\tproject.bin
3\t1\tsrc/code_maat/parsers/git.clj
`;

const entries = `[a1b2c3] Adam Petersen 2013-10-01 First commit
4\t0\tproject.clj

[d4e5f6] Erik 2013-10-02 Second commit
2\t1\tsrc/main.clj
`;

const pullRequest = `[abc123] Mr X 2013-01-04 Merge pull request
[def456] Mr Y 2013-01-04 Add feature
1\t1\tbuild.xml
`;

const messageWithDate = `[abc123] Adam 2013-10-01 Fix bug from 2013-09-30
4\t0\tproject.clj
`;

describe("git parser (legacy format)", () => {
  test("parses single entry", () => {
    const result = parseReadLog(entry, {});
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      rev: "26682d",
      author: "Adam Petersen",
      date: "2013-10-01",
      entity: "project.clj",
      locAdded: "4",
      locDeleted: "0",
    });
  });

  test("parses binary entry", () => {
    const result = parseReadLog(binaryEntry, {});
    expect(result[0]).toMatchObject({ locAdded: "-", locDeleted: "-", entity: "project.bin" });
  });

  test("parses multiple entries", () => {
    expect(parseReadLog(entries, {})).toHaveLength(2);
  });

  test("parses empty log to empty array", () => {
    expect(parseReadLog("", {})).toEqual([]);
  });

  test("skips commits with no file changes (pull requests)", () => {
    const result = parseReadLog(pullRequest, {});
    expect(result.every((r) => r.rev === "def456")).toBe(true);
  });

  test("does not confuse date in commit message with commit date", () => {
    const result = parseReadLog(messageWithDate, {});
    expect(result[0].date).toBe("2013-10-01");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun test tests/code_maat/parsers/git.test.ts
```

**Step 3: Write implementation**

```typescript
// src/code_maat/parsers/git.ts
import type { VCSEntry } from "../types";

type ParsedEntry = Omit<VCSEntry, "rev"> & { rev: string };

// [hash] author YYYY-MM-dd message (message may contain dates — stop at first date)
const COMMIT_HEADER = /^\[([0-9a-f]+)\]\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(.*)$/;
const FILE_LINE = /^(-|\d+)\t(-|\d+)\t(.+)$/;

export function parseReadLog(text: string, _options: Record<string, unknown>): ParsedEntry[] {
  if (!text.trim()) return [];
  const lines = text.split("\n");
  const result: ParsedEntry[] = [];
  let currentRev: string | null = null;
  let currentDate: string | null = null;
  let currentAuthor: string | null = null;
  let currentMessage: string | null = null;

  for (const line of lines) {
    const headerMatch = line.match(COMMIT_HEADER);
    if (headerMatch) {
      currentRev = headerMatch[1];
      currentAuthor = headerMatch[2];
      currentDate = headerMatch[3];
      currentMessage = headerMatch[4] || "-";
      continue;
    }
    const fileMatch = line.match(FILE_LINE);
    if (fileMatch && currentRev) {
      result.push({
        locAdded: fileMatch[1],
        locDeleted: fileMatch[2],
        entity: fileMatch[3],
        rev: currentRev,
        date: currentDate!,
        author: currentAuthor!,
        message: currentMessage || "-",
      });
    }
  }
  return result;
}
```

**Step 4: Run test to verify it passes**

```bash
bun test tests/code_maat/parsers/git.test.ts
```

Expected: PASS

**Step 5: Run typecheck**

```bash
cd packages/code-mat-port && bun run tsc --noEmit
```

Expected: no type errors. Fix any errors, then re-run tests to confirm still passing.

**Step 6: Commit**

```bash
git add packages/code-mat-port/src/code_maat/parsers/git.ts packages/code-mat-port/tests/code_maat/parsers/git.test.ts
git commit -m "feat: port git parser (legacy format) with tests"
```

---

## Task 8: Mercurial parser

**Files:**

- Create: `packages/code-mat-port/src/code_maat/parsers/mercurial.ts`
- Create: `packages/code-mat-port/tests/code_maat/parsers/mercurial.test.ts`

Fetch full test file from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/parsers/mercurial_test.clj
Fetch source from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/src/code_maat/parsers/mercurial.clj

Mercurial format:

```
rev1 author1 date1
file1
file2
```

Each file in a commit generates a separate entry. No loc-added/loc-deleted (Mercurial doesn't provide this by default).

Key tests:

- Single entry
- Multiple entries/files
- Empty log → `[]`

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 9: Perforce parser

**Files:**

- Create: `packages/code-mat-port/src/code_maat/parsers/perforce.ts`
- Create: `packages/code-mat-port/tests/code_maat/parsers/perforce.test.ts`

Fetch full test file from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/parsers/perforce_test.clj
Fetch source from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/src/code_maat/parsers/perforce.clj

Perforce format uses changelist sections. Output fields: `author`, `rev`, `date` (YYYY-MM-DD), `entity`, `message`.

Key tests:

- Single change record
- Multiple entries
- Empty logs
- Complex job sections (must be ignored)

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 10: SVN parser

**Files:**

- Create: `packages/code-mat-port/src/code_maat/parsers/svn.ts`
- Create: `packages/code-mat-port/tests/code_maat/parsers/svn.test.ts`

Fetch full test file from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/parsers/svn_test.clj
Fetch source from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/src/code_maat/parsers/svn.clj

SVN format is XML (`svn log --xml`). Use built-in XML parsing (DOMParser or Bun's built-in).
Output fields: `entity`, `date`, `author`, `rev`, action (`M`=modified, `A`=added).

Key tests:

- Entry retrieval
- Row conversion
- Action marking (M/A)
- Complete history building

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 11: TFS parser

**Files:**

- Create: `packages/code-mat-port/src/code_maat/parsers/tfs.ts`
- Create: `packages/code-mat-port/tests/code_maat/parsers/tfs.test.ts`

Fetch full test file from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/parsers/tfs_test.clj
Fetch source from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/src/code_maat/parsers/tfs.clj

TFS format is a custom text format. Normalize dates to YYYY-MM-DD, preserve multi-line comments.

Key tests:

- Standard US format
- Check-in notes
- Multi-line comments (with `***NO_CI***` markers)
- Proxy check-ins
- Policy warnings
- Multiple changesets

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 12: Entities analysis

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/entities.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/entities.test.ts`

**Step 1: Write the failing test** (port of `test/code_maat/analysis/entities_test.clj`)

```typescript
// tests/code_maat/analysis/entities.test.ts
import { describe, test, expect } from "bun:test";
import { all, byRevision, revisionsOf } from "../../../src/code_maat/analysis/entities";
import { vcs, optionsWithLowThresholds } from "../../fixtures/test-data";

describe("entities analysis", () => {
  test("deduces all modified entities", () => {
    const entities = all(vcs);
    expect(new Set(entities)).toEqual(new Set(["A", "B"]));
  });

  test("sorts entities by number of revisions (desc)", () => {
    const result = byRevision(vcs, optionsWithLowThresholds);
    expect(result).toEqual([
      { nRevs: 3, entity: "A" },
      { nRevs: 1, entity: "B" },
    ]);
  });

  test("calculates revisions of specific entities", () => {
    const rg = byRevision(vcs, optionsWithLowThresholds);
    expect(revisionsOf("A", rg)).toBe(3);
    expect(revisionsOf("B", rg)).toBe(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
bun test tests/code_maat/analysis/entities.test.ts
```

**Step 3: Write implementation**

```typescript
// src/code_maat/analysis/entities.ts
import type { VCSEntry, AnalysisOptions } from "../types";

export type EntityRevision = { entity: string; nRevs: number };

export function all(ds: VCSEntry[]): string[] {
  return [...new Set(ds.map((r) => r.entity))];
}

export function allRevisions(ds: VCSEntry[]): (string | number)[] {
  return [...new Set(ds.map((r) => r.rev))];
}

export function byRevision(ds: VCSEntry[], options: AnalysisOptions): EntityRevision[] {
  const counts = new Map<string, number>();
  for (const row of ds) {
    counts.set(row.entity, (counts.get(row.entity) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= options.minRevs)
    .map(([entity, nRevs]) => ({ entity, nRevs }))
    .sort((a, b) => b.nRevs - a.nRevs);
}

export function revisionsOf(entity: string, revisions: EntityRevision[]): number {
  return revisions.find((r) => r.entity === entity)?.nRevs ?? 0;
}
```

**Step 4: Run test to verify it passes**

```bash
bun test tests/code_maat/analysis/entities.test.ts
```

Expected: PASS

**Step 5: Run typecheck**

```bash
cd packages/code-mat-port && bun run tsc --noEmit
```

Expected: no type errors. Fix any errors, then re-run tests to confirm still passing.

**Step 6: Commit**

```bash
git add packages/code-mat-port/src/code_maat/analysis/entities.ts packages/code-mat-port/tests/code_maat/analysis/entities.test.ts
git commit -m "feat: port entities analysis module with tests"
```

---

## Task 13: Authors analysis

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/authors.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/authors.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/authors_test.clj

Key tests:

- `all(vcs)` → Set of all unique authors
- `ofModule(vcs, "A")` → authors who touched entity A
- `byCount(vcs, options)` → sorted by number of distinct authors per entity (desc)
- `byCount(vcs, { ...options, sort: "asc" })` → ascending order

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

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 14: Coupling algorithms

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/coupling-algos.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/coupling-algos.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/coupling_algos_test.clj

Key test data (local to this test file, not from shared fixtures):

```typescript
const singleEntityCommit = [{ author: "a", entity: "A", rev: 1 }];
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

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 15: Logical coupling

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/logical-coupling.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/logical-coupling.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/logical_coupling_test.clj

Formula: `degree = sharedRevisions / average(revisionsOfA, revisionsOfB)`

Key tests:

- Coupling degree calculation
- Verbose output format
- Boundary: single entity commit → no pairs → empty result

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 16: Churn analysis

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/churn.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/churn.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/churn_test.clj

Key tests:

- Absolute churn (lines added, deleted, commit counts)
- Churn by date / by author / by entity
- Ownership (highest contributor)
- Binary file handling (skip `-` values)

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 17: Code age

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/code-age.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/code-age.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/code_age_test.clj

Key tests:

- Age from most recent modification date (in months)
- Time progression (1 month and 1 year forward scenarios)
- Historical analysis relative to a given reference date

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 18: Commit messages

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/commit-messages.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/commit-messages.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/commit_messages_test.clj

Key tests:

- Word frequency in commit messages
- Handles absent/empty message fields

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 19: Communication

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/communication.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/communication.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/communication_test.clj

Key tests:

- Developer communication needs based on shared entity edits
- Author-peer relationships and shared entity count
- Connection strength (50–100% range)

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 20: Effort

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/effort.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/effort.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/effort_test.clj

Key tests:

- Revision metrics per author
- Entity fragmentation (number of distinct authors)
- Ownership: main developer and ownership percentage

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 21: Sum of coupling

**Files:**

- Create: `packages/code-mat-port/src/code_maat/analysis/sum-of-coupling.ts`
- Create: `packages/code-mat-port/tests/code_maat/analysis/sum-of-coupling.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/analysis/sum_of_coupling_test.clj

Key tests:

- Coupling sum per entity with low thresholds (minCoupling: 50)

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 22: Grouper (app layer)

**Files:**

- Create: `packages/code-mat-port/src/code_maat/app/grouper.ts`
- Create: `packages/code-mat-port/tests/code_maat/app/grouper.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/app/grouper_test.clj

Groups entities into architectural layers via text/regex patterns defined in a spec file.

Key tests:

- Parse text-based layer specs
- Parse regex-based layer specs
- Mixed patterns
- Edge cases: backslashes, dots, dashes in paths
- Unmapped entities pass through unchanged

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 23: Team mapper

**Files:**

- Create: `packages/code-mat-port/src/code_maat/app/team-mapper.ts`
- Create: `packages/code-mat-port/tests/code_maat/app/team-mapper.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/app/team_mapper_test.clj

Maps individual authors to team names via CSV config.

Key tests:

- Maps authors to same team
- Maps to different teams
- Unmapped authors pass through as-is

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 24: Time-based grouper

**Files:**

- Create: `packages/code-mat-port/src/code_maat/app/time-based-grouper.ts`
- Create: `packages/code-mat-port/tests/code_maat/app/time-based-grouper.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/app/time_based_grouper_test.clj

Groups commits into temporal windows (sliding/rolling by day).

Key tests:

- Commits by day
- Rolling dataset with multiple days (2-day window)
- Edge cases: empty input, single commit

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 25: App orchestration (time-based end-to-end)

**Files:**

- Create: `packages/code-mat-port/src/code_maat/app/app.ts`
- Create: `packages/code-mat-port/tests/code_maat/app/time-based-end-to-end.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/app/time_based_end_to_end_test.clj

Key tests:

- Default coupling (within commit)
- Time-based coupling (within same day)
- Error handling for invalid period values

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 26: CLI argument parsing

**Files:**

- Create: `packages/code-mat-port/src/code_maat/cmd-line.ts`
- Create: `packages/code-mat-port/tests/code_maat/app/cmd-line.test.ts`

Fetch full test from: https://raw.githubusercontent.com/adamtornhill/code-maat/master/test/code_maat/app/cmd_line_test.clj

Key tests:

- Simple parsing with `-l` flag
- No errors on valid input

Follow standard TDD steps (see top of plan): write test → run (fail) → implement → run (pass) → **typecheck** (`bun run tsc --noEmit`) → fix errors → commit.

---

## Task 27: End-to-end scenario tests (optional / last)

**Files:**

- Create: `packages/code-mat-port/tests/fixtures/logs/` (download log files)
- Create: `packages/code-mat-port/tests/code_maat/end_to_end/scenario.test.ts`

**Note:** These tests require actual VCS log fixtures. Download from the original repo:

- `test/code_maat/end_to_end/simple_git.txt`
- `test/code_maat/end_to_end/simple_git2.txt`
- `test/code_maat/end_to_end/simple_hg.txt`
- `test/code_maat/end_to_end/simple_p4.txt`
- `test/code_maat/end_to_end/statsvn.log`

Fetch these via WebFetch from raw.githubusercontent.com then save to `tests/fixtures/logs/`.

The end-to-end tests run the full pipeline: parse log file → apply analysis → check CSV output.

Follow TDD steps for each scenario.

---

## Task 28: Export public API

**Files:**

- Create: `packages/code-mat-port/src/index.ts`

Export all public modules for library consumers:

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

**Verify build:**

```bash
cd packages/code-mat-port && bun run build
```

Expected: dist/ generated with no errors.

**Verify all tests pass:**

```bash
bun test
```

Expected: All tests pass.

**Commit:**

```bash
git add packages/code-mat-port/src/index.ts
git commit -m "feat: export public API from index"
```

---

## Verification

**Run all tests:**

```bash
cd packages/code-mat-port && bun test
```

**Run with coverage:**

```bash
bun test --coverage
```

**Type-check (no emit):**

```bash
bun run tsc --noEmit
```

Expected: no type errors

**Build the library:**

```bash
bun run build
```

Expected: `dist/` generated with no errors

**Test a single module:**

```bash
bun test tests/code_maat/analysis/math.test.ts
```

**Run from monorepo root:**

```bash
pnpm run test --filter code-mat-port
```
