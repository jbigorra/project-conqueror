# Task 5: JAR Parity Tests — git format

**Status: DONE** — 17/17 pass

**File:** `tests/parity/git-parity.test.ts`

Churn analyses (`abs-churn`, `author-churn`, `entity-churn`, `entity-ownership`, `main-dev`, `refactoring-main-dev`) require `locAdded`/`locDeleted` — only git and git2 parsers provide these.

---

## Fixes required during execution

1. **`coupling`** — helpers.ts default options didn't match JAR defaults. Fixed by using `minRevs:5, minSharedRevs:5, minCoupling:30, maxChangesetSize:30`.

2. **Float formatting** (`main-dev-by-revs`, `fragmentation`, `main-dev`, `refactoring-main-dev`) — JAR outputs `1.0` for integer floats. Added `FLOAT_FIELDS` to `helpers.ts` with `.toFixed(1)`.

3. **`refactoring-main-dev` sort tie-break** — Clojure's `(first (reverse (sort-by ...)))` picks the last entry on ties. Fixed `byRefactoringMainDeveloper` in `src/code_maat/analysis/churn.ts` by changing `c.deleted > best.deleted` to `c.deleted >= best.deleted`.

---

## Tests

```typescript
// tests/parity/git-parity.test.ts
import { describe, it, expect } from "bun:test";
import { join } from "path";
import { runJar, runTS, FIXTURES } from "./helpers";

const LOG = join(FIXTURES, "simple_git.txt");
const VCS = "git";
const AGE_DATE = "2015-03-01";

const BASIC = ["authors", "revisions", "coupling", "soc", "summary",
               "entity-effort", "main-dev-by-revs", "fragmentation", "communication"];

const CHURN = ["abs-churn", "author-churn", "entity-churn",
               "entity-ownership", "main-dev", "refactoring-main-dev"];

describe("JAR parity — git", () => {
  for (const analysis of BASIC) {
    it(analysis, async () => expect(await runTS(LOG, { versionControl: VCS, analysis }))
      .toEqual(runJar(LOG, VCS, analysis)));
  }

  it("age", async () => expect(await runTS(LOG, { versionControl: VCS, analysis: "age", ageTimeNow: AGE_DATE }))
    .toEqual(runJar(LOG, VCS, "age", ["--age-time-now", AGE_DATE])));

  it("messages", async () => expect(await runTS(LOG, { versionControl: VCS, analysis: "messages", expressionToMatch: "stat" }))
    .toEqual(runJar(LOG, VCS, "messages", ["--expression-to-match", "stat"])));

  for (const analysis of CHURN) {
    it(`${analysis} (churn)`, async () => expect(await runTS(LOG, { versionControl: VCS, analysis }))
      .toEqual(runJar(LOG, VCS, analysis)));
  }
});
```

**If mismatches:** check diff carefully:
- Column order → fix `FIELD_MAP` order in `helpers.ts`
- Float formatting → add to `FLOAT_FIELDS` in `helpers.ts`
- Sort order → compare Clojure source in `tmp/code-maat/src/`; check tie-break direction

---

## Commit

```bash
git add tests/parity/git-parity.test.ts tests/parity/helpers.ts src/code_maat/analysis/churn.ts
git commit -m "feat: add JAR parity tests for git format"
```
