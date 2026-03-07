import { describe, test, expect } from "bun:test";
import { all, byRevision, revisionsOf } from "../../../src/code_maat/analysis/entities";
import { vcs, optionsWithLowThresholds } from "../../fixtures/test-data";

describe("entities analysis", () => {
  test("deduces all modified entities", () => {
    expect(all(vcs)).toEqual(["A", "B"]);
  });

  test("sorts entities on number of revisions", () => {
    expect(byRevision(vcs, optionsWithLowThresholds)).toEqual([
      { nRevs: 3, entity: "A" },
      { nRevs: 1, entity: "B" },
    ]);
  });

  test("calculates revisions of specific entities", () => {
    const result = byRevision(vcs, optionsWithLowThresholds);
    expect(revisionsOf("A", result)).toBe(3);
    expect(revisionsOf("B", result)).toBe(1);
  });
});
