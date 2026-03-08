# Task 6: JAR Parity Tests — git2, hg, p4 formats

**File:** `tests/parity/multi-vcs-parity.test.ts`

**Verify prerequisite (Task 4 done):**
```bash
bun run tsc --noEmit  # helpers.ts must compile cleanly
```

hg and p4 have no LOC data → churn analyses excluded for those VCS.
git2 has LOC data → churn analyses tested in a separate describe block.

---

## Tests

```typescript
// tests/parity/multi-vcs-parity.test.ts
import { describe, it, expect } from "bun:test";
import { join } from "path";
import { runJar, runTS, FIXTURES } from "./helpers";

const AGE_DATE = "2015-03-01";

const NON_CHURN = ["authors", "revisions", "coupling", "soc", "summary",
                   "entity-effort", "main-dev-by-revs", "fragmentation", "communication"];

const CHURN = ["abs-churn", "author-churn", "entity-churn",
               "entity-ownership", "main-dev", "refactoring-main-dev"];

const VCS_FILES: [string, string][] = [
  ["git2", join(FIXTURES, "simple_git2.txt")],
  ["hg",   join(FIXTURES, "simple_hg.txt")],
  ["p4",   join(FIXTURES, "simple_p4.txt")],
];

for (const [vcs, logFile] of VCS_FILES) {
  describe(`JAR parity — ${vcs}`, () => {
    for (const analysis of NON_CHURN) {
      it(analysis, async () => expect(await runTS(logFile, { versionControl: vcs, analysis }))
        .toEqual(runJar(logFile, vcs, analysis)));
    }
    it("age", async () => expect(await runTS(logFile, { versionControl: vcs, analysis: "age", ageTimeNow: AGE_DATE }))
      .toEqual(runJar(logFile, vcs, "age", ["--age-time-now", AGE_DATE])));
  });
}

describe("JAR parity — git2 churn", () => {
  const LOG = join(FIXTURES, "simple_git2.txt");
  for (const analysis of CHURN) {
    it(analysis, async () => expect(await runTS(LOG, { versionControl: "git2", analysis }))
      .toEqual(runJar(LOG, "git2", analysis)));
  }
});
```

`bun test tests/parity/multi-vcs-parity.test.ts` → all pass

`bun test` → no regressions
`bun run tsc --noEmit` → clean

---

## Commit

```bash
git add tests/parity/multi-vcs-parity.test.ts
git commit -m "feat: add JAR parity tests for git2, hg, and p4 formats"
```
