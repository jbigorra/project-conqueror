import { describe, expect, it } from "bun:test";
import { buildLineAreaDatasets } from "../../src/mappers/line-area.mapper";
import type { LineAreaPoint } from "../../src/types";

const points: LineAreaPoint[] = [
  { x: "Jan", series: [{ key: "Revenue", value: 1000 }, { key: "Costs", value: 600 }] },
  { x: "Feb", series: [{ key: "Revenue", value: 1200 }, { key: "Profit", value: 400 }] },
  { x: "Mar", series: [{ key: "Costs", value: 700 }, { key: "Profit", value: 500 }] },
];

describe("buildLineAreaDatasets", () => {
  it("returns x-axis labels from all points", () => {
    const { labels } = buildLineAreaDatasets(points);
    expect(labels).toEqual(["Jan", "Feb", "Mar"]);
  });

  it("extracts unique series keys in insertion order", () => {
    const { keys } = buildLineAreaDatasets(points);
    expect(keys).toEqual(["Revenue", "Costs", "Profit"]);
  });

  it("builds one dataset per series key", () => {
    const { datasets } = buildLineAreaDatasets(points);
    expect(datasets).toHaveLength(3);
  });

  it("fills 0 for missing series in a point", () => {
    const { datasets } = buildLineAreaDatasets(points);
    const profitDataset = datasets.find((d) => d.label === "Profit");
    expect(profitDataset).toBeDefined();
    // Profit only appears in Feb (1) and Mar (2); Jan (0) is missing
    expect(profitDataset!.data).toEqual([0, 400, 500]);
  });

  it("Revenue dataset has correct values", () => {
    const { datasets } = buildLineAreaDatasets(points);
    const revenueDataset = datasets.find((d) => d.label === "Revenue");
    expect(revenueDataset!.data).toEqual([1000, 1200, 0]);
  });

  it("Costs dataset has correct values", () => {
    const { datasets } = buildLineAreaDatasets(points);
    const costsDataset = datasets.find((d) => d.label === "Costs");
    expect(costsDataset!.data).toEqual([600, 0, 700]);
  });

  it("returns empty result for empty input", () => {
    const { labels, keys, datasets } = buildLineAreaDatasets([]);
    expect(labels).toEqual([]);
    expect(keys).toEqual([]);
    expect(datasets).toEqual([]);
  });

  it("handles numeric x values", () => {
    const numericPoints: LineAreaPoint[] = [
      { x: 2020, series: [{ key: "A", value: 10 }] },
      { x: 2021, series: [{ key: "A", value: 20 }] },
    ];
    const { labels, datasets } = buildLineAreaDatasets(numericPoints);
    expect(labels).toEqual([2020, 2021]);
    expect(datasets[0]!.data).toEqual([10, 20]);
  });
});
