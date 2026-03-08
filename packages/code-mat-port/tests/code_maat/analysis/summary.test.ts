import { describe, expect, it } from "bun:test";
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
      { statistic: "number-of-commits", value: 2 },
      { statistic: "number-of-entities", value: 2 },
      { statistic: "number-of-entities-changed", value: 3 },
      { statistic: "number-of-authors", value: 2 },
    ]);
  });

  it("returns zero stats for empty input", () => {
    expect(overview([])).toEqual([
      { statistic: "number-of-commits", value: 0 },
      { statistic: "number-of-entities", value: 0 },
      { statistic: "number-of-entities-changed", value: 0 },
      { statistic: "number-of-authors", value: 0 },
    ]);
  });
});
