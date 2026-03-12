import { describe, expect, it } from "bun:test";
import { byTimePeriod } from "../../../src/code_maat/app/time-based-grouper";

describe("time-based-grouper", () => {
  describe("commits by day (temporal-period=1)", () => {
    it("is a non-modifying operation - each commit gets rev set to its own date", () => {
      const inputCommits = [
        { entity: "A", rev: 1, date: "2022-10-20" },
        { entity: "B", rev: 2, date: "2022-10-20" },
      ];
      const result = byTimePeriod(inputCommits, { temporalPeriod: "1" });
      expect(result).toEqual([
        { date: "2022-10-20", entity: "A", rev: "2022-10-20" },
        { date: "2022-10-20", entity: "B", rev: "2022-10-20" },
      ]);
    });
  });

  describe("multiple-days give a rolling dataset", () => {
    it("produces a sliding window with overlapping commit groups", () => {
      const inputCommits = [
        { entity: "A", rev: 1, date: "2022-10-20" },
        { entity: "B", rev: 2, date: "2022-10-20" },

        { entity: "B", rev: 3, date: "2022-10-19" }, // double entry, two B's when looking at last two days
        { entity: "D", rev: 3, date: "2022-10-19" },

        { entity: "C", rev: 4, date: "2022-10-18" },
        { entity: "D", rev: 4, date: "2022-10-18" },

        { entity: "D", rev: 5, date: "2022-10-15" }, // a gap in days between the commits
      ];

      const result = byTimePeriod(inputCommits, { temporalPeriod: "2" });

      expect(result).toEqual([
        // Only commits on 2022-10-15, not on subsequent day:
        { date: "2022-10-15", entity: "D", rev: "2022-10-15" },

        // 17-18th
        { date: "2022-10-18", entity: "C", rev: "2022-10-18" },
        { date: "2022-10-18", entity: "D", rev: "2022-10-18" },

        // 18-19th
        { date: "2022-10-18", entity: "C", rev: "2022-10-19" },
        { date: "2022-10-18", entity: "D", rev: "2022-10-19" },
        { date: "2022-10-19", entity: "B", rev: "2022-10-19" },

        // 19-20th
        { date: "2022-10-19", entity: "B", rev: "2022-10-20" },
        { date: "2022-10-19", entity: "D", rev: "2022-10-20" },
        { date: "2022-10-20", entity: "A", rev: "2022-10-20" },
      ]);
    });
  });

  describe("edge cases", () => {
    it("works on an empty input sequence (no commits)", () => {
      expect(byTimePeriod([], { temporalPeriod: "2" })).toEqual([]);
    });

    it("works on a single commit", () => {
      const inputCommits = [{ entity: "B", rev: 3, date: "2022-10-19" }];
      const result = byTimePeriod(inputCommits, { temporalPeriod: "1" });
      expect(result).toEqual([{ date: "2022-10-19", entity: "B", rev: "2022-10-19" }]);
    });

    it("rejects non-positive temporal periods", () => {
      const inputCommits = [{ entity: "B", rev: 3, date: "2022-10-19" }];

      expect(() => byTimePeriod(inputCommits, { temporalPeriod: "0" })).toThrow(
        "Invalid time-period",
      );
    });

    it("rejects temporal periods larger than the commit history span", () => {
      const inputCommits = [{ entity: "B", rev: 3, date: "2022-10-19" }];

      expect(() => byTimePeriod(inputCommits, { temporalPeriod: "2" })).toThrow(
        "exceeds commit history span",
      );
    });

    it("rejects commits with missing dates", () => {
      const inputCommits = [{ entity: "B", rev: 3 }] as Array<{
        entity: string;
        rev: number;
        date: string;
      }>;

      expect(() => byTimePeriod(inputCommits, { temporalPeriod: "1" })).toThrow("missing date");
    });
  });
});
