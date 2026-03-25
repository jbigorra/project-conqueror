import { describe, expect, it } from "bun:test";
import { buildGroupedDatasets } from "../../src/mappers/grouped-bar.mapper";
import type { GroupedBarItem } from "../../src/types";

const items: GroupedBarItem[] = [
  { label: "Q1", groups: [{ key: "Sales", value: 100 }, { key: "Support", value: 40 }] },
  { label: "Q2", groups: [{ key: "Sales", value: 120 }, { key: "Engineering", value: 80 }] },
  { label: "Q3", groups: [{ key: "Support", value: 50 }, { key: "Engineering", value: 90 }] },
];

describe("buildGroupedDatasets", () => {
  it("returns labels matching input order", () => {
    const { labels } = buildGroupedDatasets(items);
    expect(labels).toEqual(["Q1", "Q2", "Q3"]);
  });

  it("extracts unique keys from all items", () => {
    const { keys } = buildGroupedDatasets(items);
    expect(keys).toEqual(["Sales", "Support", "Engineering"]);
  });

  it("builds one dataset per key", () => {
    const { datasets } = buildGroupedDatasets(items);
    expect(datasets).toHaveLength(3);
  });

  it("fills 0 for missing keys in a label", () => {
    const { datasets } = buildGroupedDatasets(items);
    const engineeringDataset = datasets.find((d) => d.label === "Engineering");
    expect(engineeringDataset).toBeDefined();
    // Engineering only appears in Q2 (1) and Q3 (2), Q1 (0) is missing
    expect(engineeringDataset!.data).toEqual([0, 80, 90]);
  });

  it("dataset for Sales has correct values", () => {
    const { datasets } = buildGroupedDatasets(items);
    const salesDataset = datasets.find((d) => d.label === "Sales");
    expect(salesDataset!.data).toEqual([100, 120, 0]);
  });

  it("dataset for Support has correct values", () => {
    const { datasets } = buildGroupedDatasets(items);
    const supportDataset = datasets.find((d) => d.label === "Support");
    expect(supportDataset!.data).toEqual([40, 0, 50]);
  });

  it("returns empty result for empty input", () => {
    const { labels, keys, datasets } = buildGroupedDatasets([]);
    expect(labels).toEqual([]);
    expect(keys).toEqual([]);
    expect(datasets).toEqual([]);
  });

  it("handles single item with single group", () => {
    const single: GroupedBarItem[] = [{ label: "Jan", groups: [{ key: "Alpha", value: 42 }] }];
    const { labels, keys, datasets } = buildGroupedDatasets(single);
    expect(labels).toEqual(["Jan"]);
    expect(keys).toEqual(["Alpha"]);
    expect(datasets[0]!.data).toEqual([42]);
  });
});
