# Behave Facade + Complexity Hotspots Enclosure Diagram

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a dev-friendly `Behave` class facade for the behave package and implement a zoomable D3 circle-packing enclosure diagram for complexity hotspots.

**Architecture:** Two parallel workstreams sharing a data interface. Workstream 1 wraps existing analysis functions behind a class that holds `gitLogPath` and exposes each analysis as a method. Workstream 2 builds a tree from flat file paths, renders it as a D3 circle-packing layout in a LitElement web component with zoom-on-click and hover tooltips, wired into the existing `<pq-hotspots-chart>` as an "enclosure" variant.

**Tech Stack:** TypeScript, Effect, Bun test runner, D3 (d3-hierarchy, d3-selection, d3-transition, d3-interpolate, d3-scale), Lit 3, Storybook

**Spec:** `docs/specs/04042026-plan-01.md`

---

## Workstream 1: Behave Public API Facade

**Branch:** `atm-20-expose-behave-public-api-in-a-class` (existing worktree)

---

### Task 1: Enrich ComplexityHotspot with linesOfCode

**Files:**
- Modify: `packages/behave/src/pipeline/transform/merge-by-entity.ts`
- Modify: `packages/behave/tests/pipeline/transform/merge-by-entity.test.ts`

- [ ] **Step 1: Update the ComplexityHotspot type**

In `packages/behave/src/pipeline/transform/merge-by-entity.ts`, add `linesOfCode` to the type:

```typescript
export type ComplexityHotspot = {
  entity: string;
  nRevs: number;
  cyclomaticComplexity: number;
  linesOfCode: number;
};
```

- [ ] **Step 2: Write a failing test for LOC aggregation**

Add a test in `packages/behave/tests/pipeline/transform/merge-by-entity.test.ts`:

```typescript
test("includes summed linesOfCode from lizard metrics per file", () => {
  const churn: Revision[] = [{ entity: "src/foo.ts", nRevs: 10 }];
  const complexity: LizardFunctionMetric[] = [
    { nloc: 30, cyclomaticComplexity: 5, tokenCount: 0, parameters: 0, length: 0, location: "", file: "/project/src/foo.ts", functionName: "a", longName: "a", startLine: 1, endLine: 10 },
    { nloc: 20, cyclomaticComplexity: 3, tokenCount: 0, parameters: 0, length: 0, location: "", file: "/project/src/foo.ts", functionName: "b", longName: "b", startLine: 11, endLine: 20 },
  ];

  const result = mergeByEntity(churn, complexity);

  expect(result).toEqual([
    { entity: "src/foo.ts", nRevs: 10, cyclomaticComplexity: 5, linesOfCode: 50 },
  ]);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/behave && bun test tests/pipeline/transform/merge-by-entity.test.ts`
Expected: FAIL — `linesOfCode` property missing or wrong value.

- [ ] **Step 4: Update mergeByEntity to aggregate LOC**

Replace the `mergeByEntity` function in `packages/behave/src/pipeline/transform/merge-by-entity.ts`:

```typescript
export const mergeByEntity = (
  churn: readonly Revision[],
  complexity: readonly LizardFunctionMetric[],
): ComplexityHotspot[] => {
  const complexityByFile = new Map<string, number>();
  const locByFile = new Map<string, number>();

  for (const metric of complexity) {
    const currentCC = complexityByFile.get(metric.file) ?? 0;
    complexityByFile.set(metric.file, Math.max(currentCC, metric.cyclomaticComplexity));
    const currentLoc = locByFile.get(metric.file) ?? 0;
    locByFile.set(metric.file, currentLoc + metric.nloc);
  }

  const hotspots: ComplexityHotspot[] = [];
  for (const rev of churn) {
    let maxComplexity: number | undefined;
    let fileLoc = 0;
    for (const [lizardFile, cc] of complexityByFile) {
      if (pathsMatch(rev.entity, lizardFile)) {
        maxComplexity = cc;
        fileLoc = locByFile.get(lizardFile) ?? 0;
        break;
      }
    }
    if (maxComplexity !== undefined) {
      hotspots.push({
        entity: rev.entity,
        nRevs: rev.nRevs,
        cyclomaticComplexity: maxComplexity,
        linesOfCode: fileLoc,
      });
    }
  }
  return hotspots;
};
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/behave && bun test tests/pipeline/transform/merge-by-entity.test.ts`
Expected: ALL PASS.

- [ ] **Step 6: Fix any other tests broken by the type change**

Run: `cd packages/behave && bun test`

Update test fixtures that assert on `ComplexityHotspot` objects to include `linesOfCode`. In particular, check:
- `tests/analyses/aggregated/complexity-hotspots.test.ts`
- `tests/integration/complexity-hotspots.integration.test.ts`

For each, add `linesOfCode` to expected objects or use `expect.objectContaining()`.

- [ ] **Step 7: Commit**

```bash
git add packages/behave/src/pipeline/transform/merge-by-entity.ts packages/behave/tests/
git commit -m "feat(behave): enrich ComplexityHotspot with linesOfCode from lizard metrics"
```

---

### Task 2: Create Behave class with simple analysis methods

**Files:**
- Create: `packages/behave/src/behave.ts`
- Create: `packages/behave/tests/behave-class.test.ts`

- [ ] **Step 1: Write the failing test for the Behave class constructor and one method**

Create `packages/behave/tests/behave-class.test.ts`:

```typescript
import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { Behave } from "../src/behave";

const FIXTURE = join(import.meta.dir, "fixtures/integration-gitlog.txt");

const RELAXED_OPTIONS = {
  options: {
    minRevs: 1,
    minSharedRevs: 1,
    minCoupling: 0,
    maxCoupling: 100,
    maxChangesetSize: 1000,
  },
};

describe("Behave class", () => {
  test("constructor stores gitLogPath", () => {
    const behave = new Behave(FIXTURE);
    expect(behave).toBeInstanceOf(Behave);
  });

  test("revisions delegates to simple.revisions with stored gitLogPath", async () => {
    const behave = new Behave(FIXTURE);
    const result = await behave.revisions({ vcsType: "git2", ...RELAXED_OPTIONS });

    expect(result.metadata.analysisName).toBe("revisions");
    expect(result.metadata.format).toBe("json");
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("entity");
    expect(result.data[0]).toHaveProperty("nRevs");
  });

  test("authors delegates to simple.authors with stored gitLogPath", async () => {
    const behave = new Behave(FIXTURE);
    const result = await behave.authors({ vcsType: "git2", ...RELAXED_OPTIONS });

    expect(result.metadata.analysisName).toBe("authors");
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("nAuthors");
  });

  test("coupling delegates to simple.coupling with stored gitLogPath", async () => {
    const behave = new Behave(FIXTURE);
    const result = await behave.coupling({ vcsType: "git2", ...RELAXED_OPTIONS });

    expect(result.metadata.analysisName).toBe("coupling");
  });

  test("each analysis method receives its own options, not constructor options", async () => {
    const behave = new Behave(FIXTURE);

    const r1 = await behave.revisions({ vcsType: "git2", ...RELAXED_OPTIONS, format: "json" });
    const r2 = await behave.revisions({ vcsType: "git2", ...RELAXED_OPTIONS, format: "csv" });

    expect(r1.metadata.format).toBe("json");
    expect(r2.metadata.format).toBe("csv");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/behave && bun test tests/behave-class.test.ts`
Expected: FAIL — module `../src/behave` not found.

- [ ] **Step 3: Create the Behave class**

Create `packages/behave/src/behave.ts`:

```typescript
import { complexityHotspots as runComplexityHotspots } from "./analyses/aggregated/complexity-hotspots";
import * as simple from "./analyses/simple";
import type { ComplexityHotspot } from "./pipeline/transform/merge-by-entity";
import type { Analysis } from "./schemas/analysis";
import type {
  AbsChurn,
  Author,
  AuthorChurn,
  CodeAge,
  Communication,
  Coupling,
  EntityChurn,
  EntityEffort,
  EntityOwnership,
  Fragmentation,
  MainDev,
  MainDevByRevs,
  MessageEntry,
  RefactoringMainDev,
  Revision,
  Soc,
  SummaryEntry,
} from "./schemas/code-maat";
import type { ComplexityHotspotsInput, SimpleAnalysisInput } from "./types";

type SimpleOptions = Omit<SimpleAnalysisInput, "gitLogPath">;
type ComplexityOptions = Omit<ComplexityHotspotsInput, "gitLogPath">;

export class Behave {
  constructor(private readonly gitLogPath: string) {}

  revisions(options?: SimpleOptions): Promise<Analysis<Revision>> {
    return simple.revisions({ gitLogPath: this.gitLogPath, ...options });
  }

  authors(options?: SimpleOptions): Promise<Analysis<Author>> {
    return simple.authors({ gitLogPath: this.gitLogPath, ...options });
  }

  absChurn(options?: SimpleOptions): Promise<Analysis<AbsChurn>> {
    return simple.absChurn({ gitLogPath: this.gitLogPath, ...options });
  }

  authorChurn(options?: SimpleOptions): Promise<Analysis<AuthorChurn>> {
    return simple.authorChurn({ gitLogPath: this.gitLogPath, ...options });
  }

  entityChurn(options?: SimpleOptions): Promise<Analysis<EntityChurn>> {
    return simple.entityChurn({ gitLogPath: this.gitLogPath, ...options });
  }

  entityEffort(options?: SimpleOptions): Promise<Analysis<EntityEffort>> {
    return simple.entityEffort({ gitLogPath: this.gitLogPath, ...options });
  }

  entityOwnership(options?: SimpleOptions): Promise<Analysis<EntityOwnership>> {
    return simple.entityOwnership({ gitLogPath: this.gitLogPath, ...options });
  }

  coupling(options?: SimpleOptions): Promise<Analysis<Coupling>> {
    return simple.coupling({ gitLogPath: this.gitLogPath, ...options });
  }

  soc(options?: SimpleOptions): Promise<Analysis<Soc>> {
    return simple.soc({ gitLogPath: this.gitLogPath, ...options });
  }

  age(options?: SimpleOptions): Promise<Analysis<CodeAge>> {
    return simple.age({ gitLogPath: this.gitLogPath, ...options });
  }

  communication(options?: SimpleOptions): Promise<Analysis<Communication>> {
    return simple.communication({ gitLogPath: this.gitLogPath, ...options });
  }

  fragmentation(options?: SimpleOptions): Promise<Analysis<Fragmentation>> {
    return simple.fragmentation({ gitLogPath: this.gitLogPath, ...options });
  }

  identity(options?: SimpleOptions): Promise<Analysis<unknown>> {
    return simple.identity({ gitLogPath: this.gitLogPath, ...options });
  }

  mainDev(options?: SimpleOptions): Promise<Analysis<MainDev>> {
    return simple.mainDev({ gitLogPath: this.gitLogPath, ...options });
  }

  mainDevByRevs(options?: SimpleOptions): Promise<Analysis<MainDevByRevs>> {
    return simple.mainDevByRevs({ gitLogPath: this.gitLogPath, ...options });
  }

  refactoringMainDev(options?: SimpleOptions): Promise<Analysis<RefactoringMainDev>> {
    return simple.refactoringMainDev({ gitLogPath: this.gitLogPath, ...options });
  }

  messages(options?: SimpleOptions): Promise<Analysis<MessageEntry>> {
    return simple.messages({ gitLogPath: this.gitLogPath, ...options });
  }

  summary(options?: SimpleOptions): Promise<Analysis<SummaryEntry>> {
    return simple.summary({ gitLogPath: this.gitLogPath, ...options });
  }

  complexityHotspots(options: ComplexityOptions): Promise<Analysis<ComplexityHotspot>> {
    return runComplexityHotspots({ gitLogPath: this.gitLogPath, ...options });
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/behave && bun test tests/behave-class.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/behave/src/behave.ts packages/behave/tests/behave-class.test.ts
git commit -m "feat(behave): create Behave facade class with all analysis methods"
```

---

### Task 3: Add complexityHotspots integration test to Behave class

**Files:**
- Modify: `packages/behave/tests/behave-class.test.ts`

- [ ] **Step 1: Write the failing test for complexityHotspots via Behave class**

Append to the `describe("Behave class")` block in `packages/behave/tests/behave-class.test.ts`:

```typescript
const SOURCE_DIR = join(import.meta.dir, "fixtures/sample-source");

test("complexityHotspots merges churn and complexity data", async () => {
  const behave = new Behave(FIXTURE);
  const result = await behave.complexityHotspots({
    sourceDir: SOURCE_DIR,
    vcsType: "git2",
    ...RELAXED_OPTIONS,
  });

  expect(result.metadata.analysisName).toBe("complexity-hotspots");
  expect(result.data.length).toBeGreaterThan(0);
  expect(result.data[0]).toHaveProperty("entity");
  expect(result.data[0]).toHaveProperty("nRevs");
  expect(result.data[0]).toHaveProperty("cyclomaticComplexity");
  expect(result.data[0]).toHaveProperty("linesOfCode");
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cd packages/behave && bun test tests/behave-class.test.ts`
Expected: ALL PASS (implementation was already added in Task 2).

- [ ] **Step 3: Commit**

```bash
git add packages/behave/tests/behave-class.test.ts
git commit -m "test(behave): add complexityHotspots integration test for Behave class"
```

---

### Task 4: Update package exports

**Files:**
- Modify: `packages/behave/src/index.ts`

- [ ] **Step 1: Export the new Behave class from the package**

Replace the legacy export line in `packages/behave/src/index.ts`. Change:

```typescript
// Legacy (deprecated) — existing consumers keep working
export { AnalysisOptions, Behave, default } from "./legacy/index";
```

To:

```typescript
// New facade
export { Behave } from "./behave";
// Legacy (deprecated)
export { AnalysisOptions, default } from "./legacy/index";
export { Behave as LegacyBehave } from "./legacy/index";
```

Also add the new option types:

```typescript
export type { SimpleAnalysisInput as BehaveSimpleOptions, ComplexityHotspotsInput as BehaveComplexityOptions } from "./types";
```

- [ ] **Step 2: Run full test suite and build**

Run: `cd packages/behave && bun test && bun run build`
Expected: ALL PASS, build succeeds.

- [ ] **Step 3: Commit**

```bash
git add packages/behave/src/index.ts
git commit -m "feat(behave): export new Behave facade as primary API, deprecate legacy"
```

---

## Workstream 2: Complexity Hotspots Enclosure Diagram

**Branch:** `atm-21-generate-complexity-hotspots-chart-using-enclosure-diagram` (create new worktree)

---

### Task 5: Install D3 dependencies and define types

**Files:**
- Modify: `packages/charts/package.json`
- Create: `packages/charts/src/types/hotspots-tree.types.ts`

- [ ] **Step 1: Install D3 packages**

```bash
cd packages/charts && pnpm add d3-hierarchy d3-selection d3-transition d3-interpolate d3-scale && pnpm add -D @types/d3-hierarchy @types/d3-selection @types/d3-transition @types/d3-interpolate @types/d3-scale
```

- [ ] **Step 2: Create tree node types**

Create `packages/charts/src/types/hotspots-tree.types.ts`:

```typescript
export type EnclosureHotspot = {
  entity: string;
  nRevs: number;
  cyclomaticComplexity: number;
  linesOfCode: number;
};

export type HotspotsTreeNode = {
  name: string;
  children?: HotspotsTreeNode[];
  // File-level metrics (leaf nodes only)
  complexityScore?: number;
  linesOfCode?: number;
  nRevs?: number;
  // Folder-level aggregates (computed by buildHotspotsTree)
  immediateFiles?: number;
  immediateFolders?: number;
  totalFiles?: number;
  totalFolders?: number;
  totalLinesOfCode?: number;
  averageComplexity?: number;
};
```

- [ ] **Step 3: Commit**

```bash
git add packages/charts/package.json pnpm-lock.yaml packages/charts/src/types/hotspots-tree.types.ts
git commit -m "chore(charts): install D3 packages and define hotspots tree types"
```

---

### Task 6: TDD — Build hotspots tree from flat file paths

**Files:**
- Create: `packages/charts/src/mappers/hotspots-tree.mapper.ts`
- Create: `packages/charts/tests/mappers/hotspots-tree.mapper.test.ts`

- [ ] **Step 1: Write failing test — single file produces correct tree**

Create `packages/charts/tests/mappers/hotspots-tree.mapper.test.ts`:

```typescript
import { describe, expect, test } from "bun:test";
import { buildHotspotsTree } from "../../src/mappers/hotspots-tree.mapper";
import type { EnclosureHotspot } from "../../src/types/hotspots-tree.types";

describe("buildHotspotsTree", () => {
  test("single file at root produces root with one file child", () => {
    const data: EnclosureHotspot[] = [
      { entity: "index.ts", nRevs: 5, cyclomaticComplexity: 3, linesOfCode: 50 },
    ];

    const tree = buildHotspotsTree(data);

    expect(tree.name).toBe("root");
    expect(tree.children).toHaveLength(1);
    expect(tree.children![0]!.name).toBe("index.ts");
    expect(tree.children![0]!.complexityScore).toBe(3);
    expect(tree.children![0]!.linesOfCode).toBe(50);
    expect(tree.children![0]!.nRevs).toBe(5);
    expect(tree.children![0]!.children).toBeUndefined();
  });

  test("nested path creates folder hierarchy", () => {
    const data: EnclosureHotspot[] = [
      { entity: "src/core/engine.ts", nRevs: 10, cyclomaticComplexity: 15, linesOfCode: 200 },
    ];

    const tree = buildHotspotsTree(data);

    expect(tree.name).toBe("root");
    expect(tree.children).toHaveLength(1);

    const src = tree.children![0]!;
    expect(src.name).toBe("src");
    expect(src.children).toHaveLength(1);

    const core = src.children![0]!;
    expect(core.name).toBe("core");
    expect(core.children).toHaveLength(1);

    const file = core.children![0]!;
    expect(file.name).toBe("engine.ts");
    expect(file.complexityScore).toBe(15);
    expect(file.linesOfCode).toBe(200);
  });

  test("multiple files in the same folder share the folder node", () => {
    const data: EnclosureHotspot[] = [
      { entity: "src/a.ts", nRevs: 5, cyclomaticComplexity: 3, linesOfCode: 50 },
      { entity: "src/b.ts", nRevs: 8, cyclomaticComplexity: 7, linesOfCode: 100 },
    ];

    const tree = buildHotspotsTree(data);

    const src = tree.children![0]!;
    expect(src.name).toBe("src");
    expect(src.children).toHaveLength(2);
    expect(src.children!.map((c) => c.name).sort()).toEqual(["a.ts", "b.ts"]);
  });

  test("empty input returns root with no children", () => {
    const tree = buildHotspotsTree([]);

    expect(tree.name).toBe("root");
    expect(tree.children).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/charts && bun test tests/mappers/hotspots-tree.mapper.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement buildHotspotsTree**

Create `packages/charts/src/mappers/hotspots-tree.mapper.ts`:

```typescript
import type { EnclosureHotspot, HotspotsTreeNode } from "../types/hotspots-tree.types";

export function buildHotspotsTree(data: EnclosureHotspot[]): HotspotsTreeNode {
  const root: HotspotsTreeNode = { name: "root" };

  for (const item of data) {
    const segments = item.entity.split("/");
    let current = root;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]!;
      const isFile = i === segments.length - 1;

      if (isFile) {
        current.children ??= [];
        current.children.push({
          name: segment,
          complexityScore: item.cyclomaticComplexity,
          linesOfCode: item.linesOfCode,
          nRevs: item.nRevs,
        });
      } else {
        current.children ??= [];
        let folder = current.children.find((c) => c.name === segment && c.children !== undefined);
        if (!folder) {
          // Check if there's a non-folder node with same name (shouldn't happen, but be safe)
          folder = { name: segment, children: [] };
          current.children.push(folder);
        }
        current = folder;
      }
    }
  }

  // Clean up empty children arrays on root
  if (root.children?.length === 0) {
    root.children = undefined;
  }

  return root;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/charts && bun test tests/mappers/hotspots-tree.mapper.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/charts/src/mappers/hotspots-tree.mapper.ts packages/charts/tests/mappers/hotspots-tree.mapper.test.ts
git commit -m "feat(charts): add buildHotspotsTree to create hierarchy from flat file paths"
```

---

### Task 7: TDD — Compute folder aggregates

**Files:**
- Modify: `packages/charts/src/mappers/hotspots-tree.mapper.ts`
- Modify: `packages/charts/tests/mappers/hotspots-tree.mapper.test.ts`

- [ ] **Step 1: Write failing test for folder aggregates**

Append to `packages/charts/tests/mappers/hotspots-tree.mapper.test.ts`:

```typescript
describe("folder aggregates", () => {
  const fixture: EnclosureHotspot[] = [
    { entity: "src/core/engine.ts", nRevs: 10, cyclomaticComplexity: 15, linesOfCode: 200 },
    { entity: "src/core/parser.ts", nRevs: 5, cyclomaticComplexity: 8, linesOfCode: 100 },
    { entity: "src/utils/format.ts", nRevs: 3, cyclomaticComplexity: 2, linesOfCode: 50 },
  ];

  test("leaf folder has correct immediate counts", () => {
    const tree = buildHotspotsTree(fixture);
    const core = tree.children![0]!.children![0]!; // src > core

    expect(core.immediateFiles).toBe(2);
    expect(core.immediateFolders).toBe(0);
  });

  test("parent folder counts immediate subfolders", () => {
    const tree = buildHotspotsTree(fixture);
    const src = tree.children![0]!; // src

    expect(src.immediateFiles).toBe(0);
    expect(src.immediateFolders).toBe(2);
  });

  test("folder has correct totalFiles and totalFolders", () => {
    const tree = buildHotspotsTree(fixture);
    const src = tree.children![0]!;

    expect(src.totalFiles).toBe(3);
    expect(src.totalFolders).toBe(2);
  });

  test("folder totalLinesOfCode is recursive sum", () => {
    const tree = buildHotspotsTree(fixture);
    const core = tree.children![0]!.children![0]!;

    expect(core.totalLinesOfCode).toBe(300);
  });

  test("folder averageComplexity is mean of descendant file complexities", () => {
    const tree = buildHotspotsTree(fixture);
    const src = tree.children![0]!;

    // (15 + 8 + 2) / 3 ≈ 8.33
    expect(src.averageComplexity).toBeCloseTo(8.33, 1);
  });

  test("root has aggregates for all files", () => {
    const tree = buildHotspotsTree(fixture);

    expect(tree.totalFiles).toBe(3);
    expect(tree.totalFolders).toBe(3); // src, core, utils
    expect(tree.totalLinesOfCode).toBe(350);
    expect(tree.averageComplexity).toBeCloseTo(8.33, 1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/charts && bun test tests/mappers/hotspots-tree.mapper.test.ts`
Expected: FAIL — aggregate properties are undefined.

- [ ] **Step 3: Add aggregate computation to buildHotspotsTree**

Add the following function to `packages/charts/src/mappers/hotspots-tree.mapper.ts` and call it at the end of `buildHotspotsTree`:

```typescript
type Aggregates = {
  totalFiles: number;
  totalFolders: number;
  totalLinesOfCode: number;
  complexitySum: number;
};

function computeAggregates(node: HotspotsTreeNode): Aggregates {
  const isFolder = node.children !== undefined;

  if (!isFolder) {
    return {
      totalFiles: 1,
      totalFolders: 0,
      totalLinesOfCode: node.linesOfCode ?? 0,
      complexitySum: node.complexityScore ?? 0,
    };
  }

  let totalFiles = 0;
  let totalFolders = 0;
  let totalLinesOfCode = 0;
  let complexitySum = 0;
  let immediateFiles = 0;
  let immediateFolders = 0;

  for (const child of node.children!) {
    const childIsFolder = child.children !== undefined;
    if (childIsFolder) {
      immediateFolders++;
    } else {
      immediateFiles++;
    }

    const childAgg = computeAggregates(child);
    totalFiles += childAgg.totalFiles;
    totalFolders += childAgg.totalFolders + (childIsFolder ? 1 : 0);
    totalLinesOfCode += childAgg.totalLinesOfCode;
    complexitySum += childAgg.complexitySum;
  }

  node.immediateFiles = immediateFiles;
  node.immediateFolders = immediateFolders;
  node.totalFiles = totalFiles;
  node.totalFolders = totalFolders;
  node.totalLinesOfCode = totalLinesOfCode;
  node.averageComplexity = totalFiles > 0 ? complexitySum / totalFiles : 0;

  return { totalFiles, totalFolders, totalLinesOfCode, complexitySum };
}
```

Update `buildHotspotsTree` to call `computeAggregates(root)` before returning:

```typescript
export function buildHotspotsTree(data: EnclosureHotspot[]): HotspotsTreeNode {
  const root: HotspotsTreeNode = { name: "root" };

  for (const item of data) {
    // ... existing tree-building code ...
  }

  if (root.children?.length === 0) {
    root.children = undefined;
  }

  computeAggregates(root);

  return root;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/charts && bun test tests/mappers/hotspots-tree.mapper.test.ts`
Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/charts/src/mappers/hotspots-tree.mapper.ts packages/charts/tests/mappers/hotspots-tree.mapper.test.ts
git commit -m "feat(charts): compute folder aggregates in hotspots tree builder"
```

---

### Task 8: Create PqHotspotsEnclosure component with D3 circle packing

**Files:**
- Create: `packages/charts/src/generic/enclosure.ts`
- Modify: `packages/charts/src/generic/index.ts`

- [ ] **Step 1: Create the enclosure component with D3 pack rendering**

Create `packages/charts/src/generic/enclosure.ts`:

```typescript
import { pack, hierarchy, type HierarchyCircularNode } from "d3-hierarchy";
import { interpolateZoom } from "d3-interpolate";
import { scaleLinear } from "d3-scale";
import { select } from "d3-selection";
import "d3-transition";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref, type Ref } from "lit/directives/ref.js";
import type { HotspotsTreeNode } from "../types/hotspots-tree.types";

@customElement("pq-enclosure")
export class PqEnclosure extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    .container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    svg {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    .tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(0, 0, 0, 0.85);
      color: #fff;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-family: system-ui, sans-serif;
      line-height: 1.4;
      white-space: nowrap;
      opacity: 0;
      transition: opacity 0.15s;
      z-index: 10;
    }
    .tooltip.visible {
      opacity: 1;
    }
    .tooltip-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    .state-message {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--pq-chart-text, #e0e0e0);
      font-family: var(--pq-chart-font-family, system-ui, sans-serif);
    }
  `;

  @property({ type: Object }) data?: HotspotsTreeNode;
  @property({ type: String, attribute: "low-color" }) lowColor = "#c8e6c9";
  @property({ type: String, attribute: "high-color" }) highColor = "#ffcdd2";
  @state() private tooltipHtml = "";
  @state() private tooltipVisible = false;
  @state() private tooltipX = 0;
  @state() private tooltipY = 0;

  private containerRef: Ref<HTMLDivElement> = createRef();
  private svg?: ReturnType<typeof select<SVGSVGElement, unknown>>;
  private focus?: HierarchyCircularNode<HotspotsTreeNode>;
  private view: [number, number, number] = [0, 0, 0];
  private nodes?: ReturnType<typeof select<SVGSVGElement, unknown>>; // selection
  private resizeObserver?: ResizeObserver;
  private width = 0;
  private height = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.resizeObserver = new ResizeObserver(() => this.renderChart());
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("data")) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    const container = this.containerRef.value;
    if (!container || !this.data) return;

    const rect = container.getBoundingClientRect();
    this.width = rect.width || 600;
    this.height = rect.height || 600;
    const size = Math.min(this.width, this.height);

    // Clear previous SVG
    select(container).select("svg").remove();

    // Build D3 hierarchy
    const root = hierarchy(this.data)
      .sum((d) => (d.children ? 0 : d.linesOfCode ?? d.nRevs ?? 1))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    // Apply pack layout
    const packLayout = pack<HotspotsTreeNode>().size([size, size]).padding(3);
    packLayout(root);

    // Color scale
    const maxComplexity = Math.max(
      1,
      ...root.descendants().map((d) => d.data.averageComplexity ?? d.data.complexityScore ?? 0),
    );
    const colorScale = scaleLinear<string>()
      .domain([0, maxComplexity])
      .range([this.lowColor, this.highColor])
      .clamp(true);

    // Create SVG
    const svgEl = select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${size} ${size}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    this.svg = svgEl;
    this.focus = root as HierarchyCircularNode<HotspotsTreeNode>;

    // Render circles
    const node = svgEl
      .selectAll<SVGCircleElement, HierarchyCircularNode<HotspotsTreeNode>>("circle")
      .data(root.descendants() as HierarchyCircularNode<HotspotsTreeNode>[])
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", (d) => d.r)
      .attr("fill", (d) => {
        const score = d.data.averageComplexity ?? d.data.complexityScore ?? 0;
        return colorScale(score);
      })
      .attr("fill-opacity", (d) => (d.children ? 0.3 : 0.7))
      .attr("stroke", (d) => (d.children ? colorScale(d.data.averageComplexity ?? 0) : "none"))
      .attr("stroke-width", (d) => (d.children ? 1.5 : 0))
      .style("cursor", (d) => (d.children ? "pointer" : "default"))
      .on("click", (event: MouseEvent, d) => {
        if (d.children) {
          event.stopPropagation();
          this.zoom(d, node, size);
        }
      })
      .on("mouseenter", (event: MouseEvent, d) => this.showTooltip(event, d))
      .on("mousemove", (event: MouseEvent) => this.moveTooltip(event))
      .on("mouseleave", () => this.hideTooltip());

    // Click on background zooms out to root
    svgEl.on("click", () => {
      this.zoom(root as HierarchyCircularNode<HotspotsTreeNode>, node, size);
    });

    // Initial zoom
    this.zoomTo([root.x, root.y, root.r * 2] as [number, number, number], node, size);
  }

  private zoomTo(
    v: [number, number, number],
    node: ReturnType<typeof select<SVGSVGElement, unknown>>,
    size: number,
  ): void {
    this.view = v;
    const k = size / v[2];

    (node as any)
      .attr("cx", (d: HierarchyCircularNode<HotspotsTreeNode>) => (d.x - v[0]) * k + size / 2)
      .attr("cy", (d: HierarchyCircularNode<HotspotsTreeNode>) => (d.y - v[1]) * k + size / 2)
      .attr("r", (d: HierarchyCircularNode<HotspotsTreeNode>) => Math.max(0, d.r * k));
  }

  private zoom(
    d: HierarchyCircularNode<HotspotsTreeNode>,
    node: ReturnType<typeof select<SVGSVGElement, unknown>>,
    size: number,
  ): void {
    this.focus = d;
    const target: [number, number, number] = [d.x, d.y, d.r * 2];
    const currentView = this.view;

    (this.svg as any)
      .transition()
      .duration(750)
      .tween("zoom", () => {
        const i = interpolateZoom(currentView, target);
        return (t: number) => this.zoomTo(i(t), node, size);
      });
  }

  private showTooltip(event: MouseEvent, d: HierarchyCircularNode<HotspotsTreeNode>): void {
    const data = d.data;
    const isFolder = d.children !== undefined && d.children !== null;

    let content = `<div class="tooltip-title">${data.name}</div>`;
    if (isFolder) {
      content += `Files: ${data.immediateFiles ?? 0}<br>`;
      content += `Folders: ${data.immediateFolders ?? 0}<br>`;
      content += `Total LOC: ${data.totalLinesOfCode ?? 0}<br>`;
      content += `Total folders: ${data.totalFolders ?? 0}<br>`;
      content += `Total files: ${data.totalFiles ?? 0}<br>`;
      content += `Avg complexity: ${(data.averageComplexity ?? 0).toFixed(1)}`;
    } else {
      content += `LOC: ${data.linesOfCode ?? 0}<br>`;
      content += `Complexity: ${data.complexityScore ?? 0}`;
    }

    this.tooltipHtml = content;
    this.tooltipVisible = true;
    this.moveTooltip(event);
  }

  private moveTooltip(event: MouseEvent): void {
    const container = this.containerRef.value;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    this.tooltipX = event.clientX - rect.left + 12;
    this.tooltipY = event.clientY - rect.top - 10;
  }

  private hideTooltip(): void {
    this.tooltipVisible = false;
  }

  protected override render() {
    if (!this.data) {
      return html`<div class="state-message"><slot name="empty">No data.</slot></div>`;
    }
    return html`
      <div class="container" ${ref(this.containerRef)}>
      </div>
      <div
        class="tooltip ${this.tooltipVisible ? "visible" : ""}"
        style="left: ${this.tooltipX}px; top: ${this.tooltipY}px;"
        .innerHTML=${this.tooltipHtml}
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-enclosure": PqEnclosure;
  }
}
```

- [ ] **Step 2: Export from generic index**

Add to `packages/charts/src/generic/index.ts`:

```typescript
export { PqEnclosure } from "./enclosure";
```

- [ ] **Step 3: Verify build**

Run: `cd packages/charts && bun run typecheck`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add packages/charts/src/generic/enclosure.ts packages/charts/src/generic/index.ts
git commit -m "feat(charts): add PqEnclosure component with D3 zoomable circle packing"
```

---

### Task 9: Wire enclosure variant into PqHotspotsChart

**Files:**
- Modify: `packages/charts/src/domain/hotspots-chart.ts`
- Create: `packages/charts/src/mappers/hotspots-enclosure.mapper.ts`

- [ ] **Step 1: Create the mapper from ComplexityHotspot[] to HotspotsTreeNode**

Create `packages/charts/src/mappers/hotspots-enclosure.mapper.ts`:

```typescript
import type { ComplexityHotspot } from "@prj-conq/behave";
import { buildHotspotsTree } from "./hotspots-tree.mapper";
import type { EnclosureHotspot } from "../types/hotspots-tree.types";

export function mapHotspotsToEnclosure(data: ComplexityHotspot[]): ReturnType<typeof buildHotspotsTree> {
  const enriched: EnclosureHotspot[] = data.map((d) => ({
    entity: d.entity,
    nRevs: d.nRevs,
    cyclomaticComplexity: d.cyclomaticComplexity,
    linesOfCode: (d as any).linesOfCode ?? d.nRevs,
  }));
  return buildHotspotsTree(enriched);
}
```

- [ ] **Step 2: Add "enclosure" variant to PqHotspotsChart**

Modify `packages/charts/src/domain/hotspots-chart.ts`:

```typescript
import type { ComplexityHotspot } from "@prj-conq/behave";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapHotspotsToBubble, mapHotspotsToTreemap } from "../mappers/hotspots.mapper";
import { mapHotspotsToEnclosure } from "../mappers/hotspots-enclosure.mapper";
import type { ThemePreset } from "../types";
import "../generic/bubble";
import "../generic/treemap";
import "../generic/enclosure";

type HotspotsVariant = "bubble" | "treemap" | "enclosure";

@customElement("pq-hotspots-chart")
export class PqHotspotsChart extends LitElement {
  private fetcher = new DataFetchController<ComplexityHotspot>(this);

  @property({ type: Array }) data?: ComplexityHotspot[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: HotspotsVariant = "bubble";

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
  }

  private get resolvedData(): ComplexityHotspot[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    if (this.variant === "enclosure") {
      return html`<pq-enclosure
        .data=${mapHotspotsToEnclosure(this.resolvedData)}
        .theme=${this.theme}
      ></pq-enclosure>`;
    }
    if (this.variant === "treemap") {
      return html`<pq-treemap
        .data=${mapHotspotsToTreemap(this.resolvedData)}
        .theme=${this.theme}
        show-labels
      ></pq-treemap>`;
    }
    return html`<pq-bubble
      .data=${mapHotspotsToBubble(this.resolvedData)}
      .theme=${this.theme}
    ></pq-bubble>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-hotspots-chart": PqHotspotsChart;
  }
}
```

- [ ] **Step 3: Export mapper from mappers index**

Add to `packages/charts/src/mappers/index.ts`:

```typescript
export { mapHotspotsToEnclosure } from "./hotspots-enclosure.mapper";
export { buildHotspotsTree } from "./hotspots-tree.mapper";
```

- [ ] **Step 4: Verify build**

Run: `cd packages/charts && bun run typecheck`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add packages/charts/src/domain/hotspots-chart.ts packages/charts/src/mappers/hotspots-enclosure.mapper.ts packages/charts/src/mappers/index.ts
git commit -m "feat(charts): wire enclosure variant into pq-hotspots-chart"
```

---

### Task 10: Create Storybook story with enriched fixture

**Files:**
- Create: `packages/charts/tests/fixtures/hotspots-enclosure.fixture.ts`
- Modify: `packages/charts/stories/domain/hotspots-chart.stories.ts`

- [ ] **Step 1: Create an enriched fixture with realistic nested paths and LOC data**

Create `packages/charts/tests/fixtures/hotspots-enclosure.fixture.ts`:

```typescript
export const hotspotsEnclosureFixture = [
  { entity: "src/core/analysis-engine.ts", nRevs: 142, cyclomaticComplexity: 38, linesOfCode: 580 },
  { entity: "src/core/event-bus.ts", nRevs: 65, cyclomaticComplexity: 15, linesOfCode: 220 },
  { entity: "src/core/config.ts", nRevs: 38, cyclomaticComplexity: 7, linesOfCode: 95 },
  { entity: "src/api/routes/upload.ts", nRevs: 98, cyclomaticComplexity: 24, linesOfCode: 310 },
  { entity: "src/api/routes/download.ts", nRevs: 22, cyclomaticComplexity: 10, linesOfCode: 140 },
  { entity: "src/api/middleware/auth.ts", nRevs: 54, cyclomaticComplexity: 19, linesOfCode: 175 },
  { entity: "src/api/middleware/rate-limit.ts", nRevs: 12, cyclomaticComplexity: 6, linesOfCode: 85 },
  { entity: "src/features/auth/login.ts", nRevs: 76, cyclomaticComplexity: 22, linesOfCode: 290 },
  { entity: "src/features/auth/register.ts", nRevs: 34, cyclomaticComplexity: 14, linesOfCode: 200 },
  { entity: "src/features/dashboard/index.ts", nRevs: 48, cyclomaticComplexity: 12, linesOfCode: 180 },
  { entity: "src/features/dashboard/widgets.ts", nRevs: 28, cyclomaticComplexity: 9, linesOfCode: 250 },
  { entity: "src/features/reports/generator.ts", nRevs: 31, cyclomaticComplexity: 28, linesOfCode: 420 },
  { entity: "src/features/reports/export.ts", nRevs: 19, cyclomaticComplexity: 11, linesOfCode: 160 },
  { entity: "src/shared/database/schema.ts", nRevs: 87, cyclomaticComplexity: 18, linesOfCode: 340 },
  { entity: "src/shared/database/migrations.ts", nRevs: 42, cyclomaticComplexity: 5, linesOfCode: 120 },
  { entity: "src/shared/utils/format.ts", nRevs: 42, cyclomaticComplexity: 9, linesOfCode: 110 },
  { entity: "src/shared/utils/validation.ts", nRevs: 25, cyclomaticComplexity: 13, linesOfCode: 190 },
  { entity: "src/shared/utils/logger.ts", nRevs: 15, cyclomaticComplexity: 3, linesOfCode: 60 },
];
```

- [ ] **Step 2: Add Enclosure story to the hotspots chart stories**

Modify `packages/charts/stories/domain/hotspots-chart.stories.ts` to add the enclosure variant:

```typescript
import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/domain/hotspots-chart";
import { hotspotsFixture } from "../../tests/fixtures/hotspots.fixture";
import { hotspotsEnclosureFixture } from "../../tests/fixtures/hotspots-enclosure.fixture";

const meta: Meta = {
  title: "Domain/Hotspots Chart",
  component: "pq-hotspots-chart",
  argTypes: {
    variant: { control: "select", options: ["bubble", "treemap", "enclosure"] },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-hotspots-chart .data=${hotspotsFixture} variant=${args.variant ?? "bubble"} theme=${args.theme ?? "dark"}></pq-hotspots-chart>
    </div>`,
};

export const Treemap: Story = {
  render: () => html`<div style="height: 500px;"><pq-hotspots-chart .data=${hotspotsFixture} variant="treemap"></pq-hotspots-chart></div>`,
};

export const Enclosure: Story = {
  render: (args) => html`
    <div style="height: 600px; width: 600px;">
      <pq-hotspots-chart
        .data=${hotspotsEnclosureFixture}
        variant="enclosure"
        theme=${args.theme ?? "dark"}
      ></pq-hotspots-chart>
    </div>`,
};

export const EnclosureLight: Story = {
  render: () => html`
    <div style="height: 600px; width: 600px; background: white; padding: 1rem;">
      <pq-hotspots-chart
        .data=${hotspotsEnclosureFixture}
        variant="enclosure"
        theme="light"
      ></pq-hotspots-chart>
    </div>`,
};

export const LightTheme: Story = {
  render: () => html`<div style="height: 500px; background: white; padding: 1rem;">
    <pq-hotspots-chart .data=${hotspotsFixture} theme="light"></pq-hotspots-chart></div>`,
};
```

- [ ] **Step 3: Verify Storybook works**

Run: `cd packages/charts && npx storybook dev -p 6006 --no-open`
Open browser to `http://localhost:6006` and verify the "Domain/Hotspots Chart/Enclosure" story renders a circle-packing diagram.

- [ ] **Step 4: Commit**

```bash
git add packages/charts/tests/fixtures/hotspots-enclosure.fixture.ts packages/charts/stories/domain/hotspots-chart.stories.ts
git commit -m "feat(charts): add enclosure storybook story with enriched fixture data"
```

---

### Task 11: Run full test suite and build verification

**Files:** None (verification only)

- [ ] **Step 1: Run charts tests**

Run: `cd packages/charts && bun test`
Expected: ALL PASS.

- [ ] **Step 2: Run charts build**

Run: `cd packages/charts && bun run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Run typecheck**

Run: `cd packages/charts && bun run typecheck`
Expected: No type errors.

- [ ] **Step 4: Run full monorepo build**

Run: `pnpm run build` (from root)
Expected: All packages build successfully.

- [ ] **Step 5: Commit any remaining fixes**

If any fixes were needed:
```bash
git add -A
git commit -m "fix(charts): resolve build/test issues for enclosure diagram"
```
