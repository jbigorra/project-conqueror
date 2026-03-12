import { afterEach, describe, expect, test } from "bun:test";
import { byAge } from "../../../src/code_maat/analysis/code-age";
import type { VCSEntry } from "../../../src/code_maat/types";

const RealDate = Date;

const vcs: VCSEntry[] = [
  { author: "", entity: "A", rev: 1, date: "2013-12-25" },
  { author: "", entity: "B", rev: 1, date: "2013-12-31" },
  { author: "", entity: "A", rev: 2, date: "2014-02-28" },
  { author: "", entity: "A", rev: 3, date: "2014-04-05" },
];

function mockCurrentDateWithUtcBoundary() {
  class BoundaryDate extends RealDate {
    constructor(value?: ConstructorParameters<typeof Date>[0]) {
      super(value ?? "2024-01-02T04:30:00.000Z");
    }

    getFullYear(): number {
      return 2024;
    }

    getMonth(): number {
      return 0;
    }

    getDate(): number {
      return 1;
    }

    static now(): number {
      return new RealDate("2024-01-02T04:30:00.000Z").getTime();
    }

    static parse(dateString: string): number {
      return RealDate.parse(dateString);
    }

    static UTC(...args: Parameters<typeof RealDate.UTC>): number {
      return RealDate.UTC(...args);
    }
  }

  globalThis.Date = BoundaryDate as DateConstructor;
}

describe("code-age analysis", () => {
  afterEach(() => {
    globalThis.Date = RealDate;
  });

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

  test("throws on malformed entry dates", () => {
    const malformed: VCSEntry[] = [{ author: "", entity: "A", rev: 1, date: "2014-AB-05" }];
    expect(() => byAge(malformed, "2014-04-06")).toThrow("Invalid date format: 2014-AB-05");
  });

  test("uses the local wall-clock day when referenceDate is omitted near a UTC boundary", () => {
    mockCurrentDateWithUtcBoundary();

    const boundaryEntries: VCSEntry[] = [
      { author: "", entity: "previous-local-day", rev: 1, date: "2023-12-31" },
      { author: "", entity: "current-local-day", rev: 2, date: "2024-01-01" },
    ];

    expect(byAge(boundaryEntries)).toEqual([{ entity: "previous-local-day", ageMonths: 0 }]);
  });
});
