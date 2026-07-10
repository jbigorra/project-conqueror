import { describe, expect, test } from "bun:test";
import { groupBy, isEmpty, nrows, selectColumn } from "../../../src/code_maat/dataset/dataset";
import { emptyVcs, singleVcs, vcs } from "../../fixtures/test-data";

describe("dataset", () => {
  test("recognizes an empty dataset", () => {
    expect(isEmpty(emptyVcs)).toBe(true);
    expect(isEmpty(vcs)).toBe(false);
  });

  test("groups by given column", () => {
    const group = groupBy(vcs, "entity");
    expect(Object.keys(group)).toEqual(["A", "B"]);
    expect(group.A).toHaveLength(3);
    expect(group.B).toHaveLength(1);
  });

  test("selects by given column - multiple rows", () => {
    expect(selectColumn(vcs, "entity")).toEqual(["A", "B", "A", "A"]);
  });

  test("selects by given column - single row", () => {
    expect(selectColumn(singleVcs, "entity")).toEqual(["A"]);
  });

  test("selects by given column - no rows", () => {
    expect(selectColumn(emptyVcs, "entity")).toEqual([]);
  });

  test("counts rows", () => {
    expect(nrows(vcs)).toBe(4);
  });
});
