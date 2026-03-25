import { describe, expect, it } from "bun:test";
import { buildStackedDatasets } from "../../src/mappers/stacked-bar.mapper";
import type { StackedBarItem } from "../../src/types";

const items: StackedBarItem[] = [
  {
    label: "file-a.ts",
    segments: [
      { key: "Alice", value: 10 },
      { key: "Bob", value: 5 },
    ],
  },
  {
    label: "file-b.ts",
    segments: [
      { key: "Bob", value: 8 },
      { key: "Carol", value: 3 },
    ],
  },
  { label: "file-c.ts", segments: [{ key: "Alice", value: 2 }] },
];

describe("buildStackedDatasets", () => {
  it("returns labels matching input order", () => {
    const { labels } = buildStackedDatasets(items);
    expect(labels).toEqual(["file-a.ts", "file-b.ts", "file-c.ts"]);
  });

  it("extracts unique keys from all items", () => {
    const { keys } = buildStackedDatasets(items);
    expect(keys).toEqual(["Alice", "Bob", "Carol"]);
  });

  it("builds one dataset per key", () => {
    const { datasets } = buildStackedDatasets(items);
    expect(datasets).toHaveLength(3);
  });

  it("fills 0 for missing keys in a label", () => {
    const { datasets } = buildStackedDatasets(items);
    const carolDataset = datasets.find((d) => d.label === "Carol");
    expect(carolDataset).toBeDefined();
    // Carol only appears in file-b.ts (index 1), so file-a.ts (0) and file-c.ts (2) are 0
    expect(carolDataset?.data).toEqual([0, 3, 0]);
  });

  it("dataset for Alice has correct values across all labels", () => {
    const { datasets } = buildStackedDatasets(items);
    const aliceDataset = datasets.find((d) => d.label === "Alice");
    expect(aliceDataset?.data).toEqual([10, 0, 2]);
  });

  it("dataset for Bob has correct values across all labels", () => {
    const { datasets } = buildStackedDatasets(items);
    const bobDataset = datasets.find((d) => d.label === "Bob");
    expect(bobDataset?.data).toEqual([5, 8, 0]);
  });

  it("returns empty result for empty input", () => {
    const { labels, keys, datasets } = buildStackedDatasets([]);
    expect(labels).toEqual([]);
    expect(keys).toEqual([]);
    expect(datasets).toEqual([]);
  });

  it("handles single item with single segment", () => {
    const single: StackedBarItem[] = [{ label: "x.ts", segments: [{ key: "Dev", value: 7 }] }];
    const { labels, keys, datasets } = buildStackedDatasets(single);
    expect(labels).toEqual(["x.ts"]);
    expect(keys).toEqual(["Dev"]);
    expect(datasets[0]?.data).toEqual([7]);
  });
});
