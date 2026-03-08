# Task 1: Port `analysis/summary.ts`

**Files:**
- Create: `src/code_maat/analysis/summary.ts`
- Create: `tests/code_maat/analysis/summary.test.ts`

---

## Test

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
      { statistic: "number-of-commits",         value: 2 },
      { statistic: "number-of-entities",         value: 2 },
      { statistic: "number-of-entities-changed", value: 3 },
      { statistic: "number-of-authors",          value: 2 },
    ]);
  });

  it("returns zero stats for empty input", () => {
    expect(overview([])).toEqual([
      { statistic: "number-of-commits",         value: 0 },
      { statistic: "number-of-entities",         value: 0 },
      { statistic: "number-of-entities-changed", value: 0 },
      { statistic: "number-of-authors",          value: 0 },
    ]);
  });
});
```

`bun test tests/code_maat/analysis/summary.test.ts` → **FAIL** (module not found)

---

## Implementation

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

`bun test tests/code_maat/analysis/summary.test.ts` → **2 pass**

---

## Commit

```bash
git add src/code_maat/analysis/summary.ts tests/code_maat/analysis/summary.test.ts
git commit -m "feat: port summary analysis module"
```
