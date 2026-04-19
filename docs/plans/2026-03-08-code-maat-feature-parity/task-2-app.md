# Task 2: Expand `app.ts` — all VCS + all analyses

**Status: DONE** — 23/23 tests pass

**Files:**
- Rewrite: `src/code_maat/app/app.ts`
- Create: `tests/code_maat/app/app.test.ts`

**Verify prerequisite (Task 1 done):**
```bash
bun test tests/code_maat/analysis/summary.test.ts  # must pass
```

**Corrections vs original plan (test cases adjusted):**
- `soc` dispatch test uses `minRevs: 0` — simple_git.txt has max soc=1, and the filter is `n > minRevs`, so minRevs=1 yields empty
- `entity-ownership` dispatch test checks `added` not `addedPercent` — actual TS type is `{ entity, author, added, deleted }`

---

## Tests

```typescript
// tests/code_maat/app/app.test.ts
import { describe, it, expect } from "bun:test";
import { join } from "path";
import { runAnalysis } from "../../../src/code_maat/app/app";
import type { AppOptions } from "../../../src/code_maat/app/app";

const F = join(__dirname, "../../fixtures/log-fixtures");
const GIT = join(F, "simple_git.txt"), GIT2 = join(F, "simple_git2.txt");
const HG  = join(F, "simple_hg.txt"),  P4   = join(F, "simple_p4.txt");

const BASE: AppOptions = {
  minRevs: 1, minSharedRevs: 1, minCoupling: 0,
  maxCoupling: 100, maxChangesetSize: 1000,
  versionControl: "git", analysis: "authors",
};
const opts = (o: Partial<AppOptions>): AppOptions => ({ ...BASE, ...o });

describe("VCS dispatch", () => {
  it("git",  async () => expect(await runAnalysis(GIT,  opts({ versionControl: "git",  analysis: "revisions" }))).toHaveLength(2));
  it("git2", async () => expect(await runAnalysis(GIT2, opts({ versionControl: "git2", analysis: "revisions" }))).toHaveLength(2));
  it("hg",   async () => expect(await runAnalysis(HG,   opts({ versionControl: "hg",   analysis: "revisions" }))).toHaveLength(2));
  it("p4",   async () => expect(await runAnalysis(P4,   opts({ versionControl: "p4",   analysis: "revisions" }))).toHaveLength(2));
  it("unknown throws", async () => expect(runAnalysis(GIT, opts({ versionControl: "unknown" }))).rejects.toThrow("Invalid --version-control"));
});

describe("analysis dispatch", () => {
  // Each analysis name from index.md mapping → result[0] must have the first TS field as a property.
  // Key property to check per analysis:
  const cases: [string, string, Partial<AppOptions>?][] = [
    ["authors",              "nAuthors"],
    ["revisions",            "nRevs"],
    ["coupling",             "degree"],
    ["soc",                  "soc"],
    ["abs-churn",            "added"],
    ["author-churn",         "author"],
    ["entity-churn",         "entity"],
    ["entity-ownership",     "addedPercent"],
    ["main-dev",             "mainDev"],
    ["refactoring-main-dev", "mainDev"],
    ["entity-effort",        "authorRevs"],
    ["main-dev-by-revs",     "mainDev"],
    ["fragmentation",        "fractalValue"],
    ["communication",        "strength"],
  ];
  for (const [analysis, key] of cases) {
    it(analysis, async () => expect((await runAnalysis(GIT, opts({ analysis })))[0]).toHaveProperty(key));
  }
  it("summary",  async () => expect((await runAnalysis(GIT, opts({ analysis: "summary"  })))[0]).toEqual({ statistic: "number-of-commits", value: 2 }));
  it("messages", async () => expect(await runAnalysis(GIT, opts({ analysis: "messages", expressionToMatch: "stat" }))).toHaveLength(1));
  it("age",      async () => expect((await runAnalysis(GIT, opts({ analysis: "age", ageTimeNow: "2015-03-01" })))[0]).toHaveProperty("ageMonths"));
  it("unknown throws", async () => expect(runAnalysis(GIT, opts({ analysis: "unknown" }))).rejects.toThrow("Invalid analysis"));
});
```

`bun test tests/code_maat/app/app.test.ts` → **FAIL**

---

## Implementation

Read the current `src/code_maat/app/app.ts` first, then rewrite it with these changes:

**`AppOptions` type** — extend current with new optional fields:
```typescript
export type AppOptions = AnalysisOptions & {
  versionControl: string;
  analysis: string;
  temporalPeriod?: string;
  group?: string;         // NEW
  teamMapFile?: string;   // NEW
  ageTimeNow?: string;    // NEW
  expressionToMatch?: string; // NEW
};
```

**`parseCommits`** — add all missing VCS cases to the switch (CLAUDE.md has the import aliases):
```typescript
case "git2": return (await parseGit2Log(logFilePath, {})) as VCSEntry[];
case "hg":   return (await parseHgLog(logFilePath,   {})) as VCSEntry[];
case "p4":   return (await parseP4Log(logFilePath,   {})) as VCSEntry[];
case "tfs":  return (await parseTfsLog(logFilePath,  {})) as VCSEntry[];
case "svn":  return parseSvnLog(await Bun.file(logFilePath).text()) as VCSEntry[];
```

**`aggregate`** — new function after `parseCommits` (before `runAnalysisOn`):
```typescript
function aggregate(commits: VCSEntry[], options: AppOptions): VCSEntry[] {
  let r = commits;
  if (options.group)          r = runGrouper(options.group, r);
  if (options.temporalPeriod) r = byTimePeriod(r as (VCSEntry & { date: string })[], { temporalPeriod: options.temporalPeriod! }) as VCSEntry[];
  if (options.teamMapFile)    r = runTeamMapper(r, fileToAuthorTeamLookup(options.teamMapFile));
  return r;
}
```

**`runAnalysisOn`** — new function dispatching to all 18 analyses (see index.md mapping table). Special cases:
- `messages`: pass `{ expressionToMatch: options.expressionToMatch ?? "" }` to `commitMessages.byWordFrequency`
- `age`: pass `options.ageTimeNow` as second arg to `codeAge.byAge`
- `identity`: return `entries` as-is
- `default`: throw `"Invalid analysis requested: ${options.analysis}..."`

**`runAnalysis`** — thread through `aggregate`:
```typescript
export async function runAnalysis(logFilePath: string, options: AppOptions): Promise<unknown[]> {
  return runAnalysisOn(aggregate(await parseCommits(logFilePath, options), options), options);
}
```

`bun test tests/code_maat/app/app.test.ts` → **all pass**
`bun test` → no regressions
`bun run tsc --noEmit` → clean

---

## Commit

```bash
git add src/code_maat/app/app.ts tests/code_maat/app/app.test.ts
git commit -m "feat: expand app to support all VCS parsers and analyses"
```
