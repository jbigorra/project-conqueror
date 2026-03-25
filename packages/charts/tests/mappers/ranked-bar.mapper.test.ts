import { describe, expect, it } from "bun:test";
import { sortItems, sliceItems } from "../../src/mappers/ranked-bar.mapper";
import { mapRevisionsToBar, mapRevisionsToTreemap } from "../../src/mappers/revisions.mapper";
import type { RankedBarItem } from "../../src/types";
import { revisionsFixture } from "../fixtures/revisions.fixture";

const items: RankedBarItem[] = [
  { label: "c.ts", value: 5 },
  { label: "a.ts", value: 20 },
  { label: "b.ts", value: 10 },
  { label: "d.ts", value: 1 },
];

describe("sortItems", () => {
  it("sorts descending by value", () => {
    const result = sortItems(items, "desc");
    expect(result.map((i) => i.value)).toEqual([20, 10, 5, 1]);
  });
  it("sorts ascending by value", () => {
    const result = sortItems(items, "asc");
    expect(result.map((i) => i.value)).toEqual([1, 5, 10, 20]);
  });
  it("returns original order when sort is none", () => {
    const result = sortItems(items, "none");
    expect(result.map((i) => i.label)).toEqual(["c.ts", "a.ts", "b.ts", "d.ts"]);
  });
});

describe("sliceItems", () => {
  it("returns top N items when limit is set", () => {
    const sorted = sortItems(items, "desc");
    const result = sliceItems(sorted, 2);
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(20);
    expect(result[1].value).toBe(10);
  });
  it("returns all items when limit is 0", () => {
    const result = sliceItems(items, 0);
    expect(result).toHaveLength(4);
  });
  it("returns all items when limit exceeds length", () => {
    const result = sliceItems(items, 100);
    expect(result).toHaveLength(4);
  });
});

describe("mapRevisionsToBar", () => {
  it("maps Revision[] to RankedBarItem[]", () => {
    const result = mapRevisionsToBar(revisionsFixture);
    expect(result[0]).toEqual({ label: "src/core/analysis-engine.ts", value: 142 });
    expect(result).toHaveLength(20);
  });
});

describe("mapRevisionsToTreemap", () => {
  it("maps Revision[] to TreemapItem[] by splitting entity paths", () => {
    const result = mapRevisionsToTreemap(revisionsFixture);
    expect(result[0]).toEqual({ path: ["src", "core", "analysis-engine.ts"], value: 142 });
  });
});
