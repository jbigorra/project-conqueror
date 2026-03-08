# Biome + JSDoc Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Biome for formatting/linting, auto-format the entire codebase, and document every exported function with full JSDoc annotations.

**Architecture:** Biome replaces ad-hoc formatting; its config is checked in so all contributors get identical output. JSDoc is added file-by-file with one commit per file so history stays clean and reviewable.

**Tech Stack:** Biome (formatter + linter), Bun test runner (verification), TypeScript JSDoc annotations.

---

## Task 1: Install and configure Biome

**Files:**
- Modify: `packages/code-mat-port/package.json`
- Create: `packages/code-mat-port/biome.json`

**Step 1: Add Biome as dev dependency**

Run from `packages/code-mat-port/`:
```bash
bun add -d @biomejs/biome
```

**Step 2: Initialise Biome config**

Run:
```bash
bunx biome init
```

This creates `biome.json`. Replace its contents with:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "warn"
      },
      "style": {
        "noNonNullAssertion": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  },
  "files": {
    "include": ["src/**", "tests/**"],
    "ignore": ["node_modules", "dist", "tmp"]
  }
}
```

> Note: `noNonNullAssertion` is off because the codebase uses `!` assertions intentionally (e.g. `entityData.get(row.entity)!`).

**Step 3: Add scripts to package.json**

Open `package.json` and add to the `"scripts"` block:

```json
"format": "biome format --write src/ tests/",
"lint": "biome lint --write src/ tests/",
"check": "biome check --write src/ tests/"
```

The full `"scripts"` block should look like:
```json
"scripts": {
  "test": "bun test",
  "typecheck": "tsc --noEmit",
  "format": "biome format --write src/ tests/",
  "lint": "biome lint --write src/ tests/",
  "check": "biome check --write src/ tests/"
}
```

**Step 4: Verify Biome works**

Run:
```bash
bunx biome --version
```
Expected: prints something like `biome 1.9.x`

**Step 5: Commit**

```bash
git add package.json biome.json bun.lockb
git commit -m "feat: add biome for formatting and linting"
```

---

## Task 2: Format and lint all source files, verify tests pass, commit

**Files:**
- Modify: all `src/**/*.ts` and `tests/**/*.ts` (automated)

**Step 1: Run Biome check (format + lint + organize imports) on entire codebase**

Run from `packages/code-mat-port/`:
```bash
bun run check
```

This rewrites files in-place. If Biome reports errors it cannot auto-fix, it will print them. Read the errors carefully — most will be style warnings that are safe to ignore or suppress inline with `// biome-ignore`.

**Step 2: Run typecheck to make sure formatting did not break types**

Run:
```bash
bun run typecheck
```
Expected: no errors (0 diagnostics).

**Step 3: Run all tests**

Run:
```bash
bun test
```
Expected: all 290 tests pass. If any test fails, the formatter likely touched a fixture file. Restore it with `git checkout -- tests/fixtures/` and re-run.

**Step 4: Commit all formatted files**

```bash
git add -u
git commit -m "style: apply biome formatting and linting to all source files"
```

---

## Task 3: JSDoc — `src/code_maat/types.ts`

**Files:**
- Modify: `src/code_maat/types.ts`

**Step 1: Open the file and add JSDoc**

Replace the file contents with:

```typescript
/**
 * Represents a single entry parsed from a VCS log.
 *
 * Each entry corresponds to one file changed in one commit.
 *
 * @example
 * const entry: VCSEntry = {
 *   author: "alice",
 *   entity: "src/foo.ts",
 *   rev: "abc123",
 *   date: "2024-01-15",
 *   locAdded: "10",
 *   locDeleted: "3",
 *   message: "fix: handle edge case",
 * };
 */
export type VCSEntry = {
  /** The commit author's name or email. */
  author: string;
  /** Path of the file changed in this commit (the "entity" being analysed). */
  entity: string;
  /** Commit hash or revision identifier. May be a string (git) or number (svn/p4). */
  rev: string | number;
  /** ISO-format date string of the commit, e.g. `"2024-01-15"`. Optional for some VCS formats. */
  date?: string;
  /** Lines of code added in this commit. Stored as string to match raw log output. */
  locAdded?: string;
  /** Lines of code deleted in this commit. Stored as string to match raw log output. */
  locDeleted?: string;
  /** Full commit message. Only present when the VCS log includes messages. */
  message?: string;
};

/**
 * Options that control filtering and thresholds for all analyses.
 *
 * These match the CLI flags accepted by the original code-maat Java tool.
 *
 * @example
 * const opts: AnalysisOptions = {
 *   minRevs: 5,
 *   minSharedRevs: 5,
 *   minCoupling: 30,
 *   maxCoupling: 100,
 *   maxChangesetSize: 30,
 * };
 */
export type AnalysisOptions = {
  /** Minimum number of revisions an entity must have to appear in results. */
  minRevs: number;
  /** Minimum number of shared revisions for a coupling pair to be included. */
  minSharedRevs: number;
  /**
   * Minimum coupling percentage (0–100) for a pair to appear in coupling results.
   * Pairs below this threshold are filtered out.
   */
  minCoupling: number;
  /**
   * Maximum coupling percentage (0–100) for a pair to appear in coupling results.
   * Pairs above this threshold are filtered out (likely false positives from tiny files).
   */
  maxCoupling: number;
  /**
   * Maximum number of files in a single changeset.
   * Changesets larger than this are excluded from coupling analysis to avoid noise.
   */
  maxChangesetSize: number;
};
```

**Step 2: Run typecheck**

```bash
bun run typecheck
```
Expected: 0 errors.

**Step 3: Run tests**

```bash
bun test
```
Expected: all pass.

**Step 4: Commit**

```bash
git add src/code_maat/types.ts
git commit -m "docs: add JSDoc to types.ts"
```

---

## Task 4: JSDoc — `src/code_maat/analysis/math.ts`

**Files:**
- Modify: `src/code_maat/analysis/math.ts`

**Step 1: Add JSDoc to every function**

```typescript
/**
 * Computes the arithmetic mean of an array of numbers.
 *
 * @param values - Non-empty array of numbers to average.
 * @returns The mean value. Returns `NaN` if `values` is empty.
 *
 * @example
 * average([1, 2, 3]); // 2
 * average([10, 20]);   // 15
 */
export function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Converts a ratio (0–1) to a percentage (0–100).
 *
 * @param value - A ratio in the range [0, 1].
 * @returns The equivalent percentage value.
 *
 * @example
 * asPercentage(0.25); // 25
 * asPercentage(1);    // 100
 */
export function asPercentage(value: number): number {
  return value * 100;
}

/**
 * Rounds a ratio to two decimal places (centi-float precision).
 *
 * Used throughout coupling analyses to normalize coupling percentages
 * to a consistent precision before comparison.
 *
 * @param value - Any floating-point number.
 * @returns The value rounded to 2 decimal places.
 *
 * @example
 * ratioCentiFloatPrecision(0.12345); // 0.12
 * ratioCentiFloatPrecision(0.999);   // 1
 */
export function ratioCentiFloatPrecision(value: number): number {
  return Math.round(value * 100) / 100;
}
```

**Step 2: Run typecheck + tests**

```bash
bun run typecheck && bun test
```
Expected: 0 type errors, all tests pass.

**Step 3: Commit**

```bash
git add src/code_maat/analysis/math.ts
git commit -m "docs: add JSDoc to math.ts"
```

---

## Task 5: JSDoc — `src/code_maat/analysis/authors.ts`

**Files:**
- Modify: `src/code_maat/analysis/authors.ts`

**Step 1: Read the file**

Open `src/code_maat/analysis/authors.ts`. You will see three functions: `all`, `ofModule`, `byCount`.

**Step 2: Add JSDoc to every function**

```typescript
/**
 * Returns the set of all unique authors across all VCS entries.
 *
 * @param ds - Array of parsed VCS log entries.
 * @returns A `Set` of author names/emails.
 *
 * @example
 * const entries = [
 *   { author: "alice", entity: "foo.ts", rev: "a1" },
 *   { author: "bob",   entity: "bar.ts", rev: "a2" },
 *   { author: "alice", entity: "baz.ts", rev: "a3" },
 * ];
 * all(entries); // Set { "alice", "bob" }
 */
export function all(ds: VCSEntry[]): Set<string> { ... }

/**
 * Returns the set of unique authors who changed a specific entity (file/module).
 *
 * @param ds - Array of parsed VCS log entries.
 * @param entity - The file path or entity name to filter by.
 * @returns A `Set` of author names who committed to that entity.
 *
 * @example
 * ofModule(entries, "src/foo.ts"); // Set { "alice", "bob" }
 */
export function ofModule(ds: VCSEntry[], entity: string): Set<string> { ... }

/**
 * Counts distinct authors and total revisions per entity, sorted by author count.
 *
 * Entities with many authors are potential knowledge-silos or high-churn hotspots.
 * The `_options` parameter is accepted for API consistency but not used.
 *
 * @param ds - Array of parsed VCS log entries.
 * @param _options - Analysis options (unused, kept for API consistency).
 * @param sort - Sort direction: `"desc"` (default) puts highest author count first.
 * @returns Array of `{ entity, nAuthors, nRevs }` records.
 *
 * @example
 * byCount(entries, defaultOptions);
 * // [
 * //   { entity: "src/core.ts", nAuthors: 5, nRevs: 42 },
 * //   { entity: "src/util.ts", nAuthors: 1, nRevs: 3  },
 * // ]
 */
export function byCount(
  ds: VCSEntry[],
  _options: AnalysisOptions,
  sort: "asc" | "desc" = "desc",
): Array<{ entity: string; nAuthors: number; nRevs: number }> { ... }
```

> Important: keep the existing function bodies intact — only add/replace the JSDoc comment above each function. Do not change the implementation.

**Step 3: Run typecheck + tests**

```bash
bun run typecheck && bun test
```
Expected: 0 errors, all tests pass.

**Step 4: Commit**

```bash
git add src/code_maat/analysis/authors.ts
git commit -m "docs: add JSDoc to authors.ts"
```

---

## Task 6: JSDoc — remaining analysis files (one commit per file)

**Files (do each one separately):**
- `src/code_maat/analysis/churn.ts`
- `src/code_maat/analysis/code-age.ts`
- `src/code_maat/analysis/commit-messages.ts`
- `src/code_maat/analysis/communication.ts`
- `src/code_maat/analysis/coupling-algos.ts`
- `src/code_maat/analysis/effort.ts`
- `src/code_maat/analysis/entities.ts`
- `src/code_maat/analysis/logical-coupling.ts`
- `src/code_maat/analysis/sum-of-coupling.ts`
- `src/code_maat/analysis/summary.ts`

**Repeat this process for each file:**

**Step A: Read the file**

Read the entire file to understand every exported function's purpose, parameters, and return type.

**Step B: Write JSDoc for every exported function**

Follow this template for each function:

```typescript
/**
 * [One sentence: what does this function compute or return?]
 *
 * [2-4 sentences of context: why does this exist, what analysis does it support,
 *  any important edge cases or behaviour to be aware of.]
 *
 * @param paramName - Description of the parameter and valid values.
 * @param anotherParam - Description.
 * @returns Description of the return value, including its shape if it's an array/object.
 *
 * @example
 * functionName(exampleInput);
 * // expected output (use realistic values from the test fixtures)
 */
```

Rules:
- Every `@param` must have a description (not just the type).
- `@returns` must describe the shape of the data, not just "the result".
- `@example` must use realistic values, not `foo`/`bar`.
- For functions returning `Array<{ ... }>`, show what one record looks like.
- Do not add `@throws` unless the function actually throws.
- Do not change any implementation code.

**Step C: Typecheck and test**

```bash
bun run typecheck && bun test
```
Expected: 0 errors, all tests pass.

**Step D: Commit**

```bash
git add src/code_maat/analysis/<filename>.ts
git commit -m "docs: add JSDoc to <filename>.ts"
```

---

## Task 7: JSDoc — parser files (one commit per file)

**Files (do each one separately):**
- `src/code_maat/parsers/git.ts`
- `src/code_maat/parsers/git2.ts`
- `src/code_maat/parsers/mercurial.ts`
- `src/code_maat/parsers/perforce.ts`
- `src/code_maat/parsers/svn.ts`
- `src/code_maat/parsers/tfs.ts`
- `src/code_maat/parsers/time-parser.ts`

**Repeat this process for each file:**

**Step A: Read the file**

**Step B: Document every exported function**

Each parser exports at least `parseReadLog` (sync, takes a string) and `parseLog` (async, takes a file path). Use this pattern:

```typescript
/**
 * Parses a [VCS-name] log string into an array of VCS entries.
 *
 * Expects the log to have been generated with:
 * `[exact git/hg/p4/svn command used to generate this format]`
 *
 * @param text - Raw log text read from a `.log` file.
 * @param _options - Reserved for future use; pass `{}`.
 * @returns Array of `VCSEntry` objects, one per (commit × file) pair.
 *
 * @example
 * const text = await Bun.file("simple_git.txt").text();
 * parseReadLog(text, {});
 * // [{ author: "developer1", entity: "src/foo.ts", rev: "abc1234", date: "2013-01-30" }, ...]
 */
```

For `parseLog` (async variant):

```typescript
/**
 * Reads a [VCS-name] log file from disk and parses it into VCS entries.
 *
 * Convenience wrapper around {@link parseReadLog} that reads the file with `Bun.file`.
 *
 * @param logFilePath - Absolute or relative path to the `.log` file.
 * @param _options - Reserved for future use; pass `{}`.
 * @returns Promise resolving to an array of `VCSEntry` objects.
 *
 * @example
 * const entries = await parseLog("tests/fixtures/log-fixtures/simple_git.txt", {});
 */
```

**Step C: Typecheck and test**

```bash
bun run typecheck && bun test
```

**Step D: Commit**

```bash
git add src/code_maat/parsers/<filename>.ts
git commit -m "docs: add JSDoc to <filename>.ts"
```

---

## Task 8: JSDoc — app files (one commit per file)

**Files (do each one separately):**
- `src/code_maat/app/grouper.ts`
- `src/code_maat/app/team-mapper.ts`
- `src/code_maat/app/time-based-grouper.ts`
- `src/code_maat/app/app.ts`

**Step A: Read the file**

**Step B: Document every exported function and type**

For `app.ts`, also document the `AppOptions` type and every field in it, following the same style as `AnalysisOptions` in Task 3.

For the internal (non-exported) helpers in `app.ts` (`parseCommits`, `aggregate`, `runAnalysisOn`), add JSDoc too — even private functions benefit from documentation.

**Step C: Typecheck and test**

```bash
bun run typecheck && bun test
```

**Step D: Commit**

```bash
git add src/code_maat/app/<filename>.ts
git commit -m "docs: add JSDoc to <filename>.ts"
```

---

## Task 9: JSDoc — remaining files (one commit per file)

**Files (do each one separately):**
- `src/code_maat/dataset/dataset.ts`
- `src/code_maat/cmd-line.ts`
- `src/index.ts`

For `src/index.ts`, add a file-level module JSDoc above all exports:

```typescript
/**
 * @module code-mat-port
 *
 * TypeScript port of [code-maat](https://github.com/adamtornhill/code-maat).
 *
 * Provides VCS log parsers, analysis algorithms, and an orchestration layer
 * for computing coupling, churn, authorship, and other software evolution metrics.
 *
 * @example
 * import { app } from "code-mat-port";
 *
 * const results = await app.runAnalysis("git.log", {
 *   versionControl: "git",
 *   analysis: "coupling",
 *   minRevs: 5,
 *   minSharedRevs: 5,
 *   minCoupling: 30,
 *   maxCoupling: 100,
 *   maxChangesetSize: 30,
 * });
 */
```

**Repeat steps A–D from Task 8 for each file.**

---

## Final Verification

After all tasks are complete, run the full suite one last time:

```bash
bun run typecheck && bun test
```

Expected: `bun run typecheck` outputs 0 errors. `bun test` shows 290 tests passing (or more).

If any test fails, use `git log --oneline -20` to identify which commit introduced it, then `git diff HEAD~1` to inspect the change.
