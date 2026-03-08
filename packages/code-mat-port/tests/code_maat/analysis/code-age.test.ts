import { describe, expect, test } from "bun:test";
import { byAge } from "../../../src/code_maat/analysis/code-age";
import type { VCSEntry } from "../../../src/code_maat/types";

const vcs: VCSEntry[] = [
  { author: "", entity: "A", rev: 1, date: "2013-12-25" },
  { author: "", entity: "B", rev: 1, date: "2013-12-31" },
  { author: "", entity: "A", rev: 2, date: "2014-02-28" },
  { author: "", entity: "A", rev: 3, date: "2014-04-05" },
];

describe("code-age analysis", () => {
  test("calculates age by last modification date", () => {
    const result = byAge(vcs, "2014-04-06");
    expect(result).toEqual([
      { entity: "A", ageMonths: 0 },
      { entity: "B", ageMonths: 3 },
    ]);
  });

  describe("code gets older as time passes by", () => {
    test("one month into the future", () => {
      const result = byAge(vcs, "2014-05-06");
      expect(result).toEqual([
        { entity: "A", ageMonths: 1 },
        { entity: "B", ageMonths: 4 },
      ]);
    });

    test("a year into the future", () => {
      const result = byAge(vcs, "2015-04-06");
      expect(result).toEqual([
        { entity: "A", ageMonths: 12 },
        { entity: "B", ageMonths: 15 },
      ]);
    });
  });

  describe("code was younger in the past", () => {
    test("one month in the past", () => {
      const result = byAge(vcs, "2014-03-06");
      expect(result).toEqual([
        { entity: "A", ageMonths: 0 },
        { entity: "B", ageMonths: 2 },
      ]);
    });

    test("before the B module was introduced (B should be ignored)", () => {
      const result = byAge(vcs, "2013-12-26");
      expect(result).toEqual([{ entity: "A", ageMonths: 0 }]);
    });
  });
});
