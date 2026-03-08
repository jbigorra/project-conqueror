import { describe, expect, it } from "bun:test";
import {
  asCoChangingModules,
  couplingFrequencies,
  moduleByRevs,
} from "../../../src/code_maat/analysis/coupling-algos";

// Test data defined locally - not imported from shared fixtures
const singleEntityCommit = [{ author: "a", entity: "A", rev: 1 }];

const oneRevision = [
  { author: "a", entity: "A", rev: 1 },
  { author: "a", entity: "B", rev: 1 },
  { author: "a", entity: "C", rev: 1 },
];

const coupled = [
  { author: "a", entity: "A", rev: 1 },
  { author: "a", entity: "B", rev: 1 },
  { author: "a", entity: "C", rev: 1 },
  { author: "a", entity: "A", rev: 2 },
  { author: "a", entity: "B", rev: 2 },
];

// This mirrors `expected-multiple-co-changes` from Clojure test
// co-changing-by-revision result for `coupled`:
// rev 1: [A,B,C] -> selections(2) -> sorted & distinct -> [A,A],[A,B],[A,C],[B,B],[B,C],[C,C]
// rev 2: [A,B]   -> selections(2) -> sorted & distinct -> [A,A],[A,B],[B,B]
const expectedMultipleCoChanges: [string, string][][] = [
  [
    ["A", "A"],
    ["A", "B"],
    ["A", "C"],
    ["B", "B"],
    ["B", "C"],
    ["C", "C"],
  ],
  [
    ["A", "A"],
    ["A", "B"],
    ["B", "B"],
  ],
];

describe("coupling-algos", () => {
  describe("asCoChangingModules", () => {
    it("returns empty array for single entity commit (no pairs)", () => {
      const result = asCoChangingModules(singleEntityCommit);
      // single entity: selections -> [A,A] -> sorted distinct -> [A,A]
      // This includes identity pair [A,A]
      expect(result).toEqual([[["A", "A"]]]);
    });

    it("returns all pairs (including identity) within a single revision", () => {
      const result = asCoChangingModules(oneRevision);
      // all entries are rev 1 -> entities [A,B,C]
      // selections(2) sorted distinct: [A,A],[A,B],[A,C],[B,B],[B,C],[C,C]
      expect(result).toEqual([
        [
          ["A", "A"],
          ["A", "B"],
          ["A", "C"],
          ["B", "B"],
          ["B", "C"],
          ["C", "C"],
        ],
      ]);
    });

    it("returns pairs grouped by revision for multiple revisions", () => {
      const result = asCoChangingModules(coupled);
      expect(result).toEqual(expectedMultipleCoChanges);
    });
  });

  describe("couplingFrequencies", () => {
    it("returns frequencies of non-identity pairs across revisions", () => {
      const result = couplingFrequencies(expectedMultipleCoChanges);
      // Flattens all pairs, drops identity pairs ([A,A],[B,B],[C,C]),
      // then counts occurrences of each pair
      expect(result).toEqual([
        [["A", "B"], 2],
        [["A", "C"], 1],
        [["B", "C"], 1],
      ]);
    });

    it("returns empty when only single entity commits", () => {
      const singleCoChanges: [string, string][][] = [[["A", "A"]]];
      const result = couplingFrequencies(singleCoChanges);
      expect(result).toEqual([]);
    });
  });

  describe("moduleByRevs", () => {
    it("counts total revisions per module from co-changing data", () => {
      const result = moduleByRevs(expectedMultipleCoChanges);
      // rev 1: [A,A],[A,B],[A,C],[B,B],[B,C],[C,C] -> flatten -> distinct -> [A,B,C] -> count each
      // rev 2: [A,A],[A,B],[B,B] -> flatten -> distinct -> [A,B] -> count each
      // A appears in 2 revisions, B appears in 2 revisions, C appears in 1 revision
      expect(result).toEqual({ A: 2, B: 2, C: 1 });
    });

    it("returns count of 1 for single entity commit", () => {
      const singleCoChanges: [string, string][][] = [[["A", "A"]]];
      const result = moduleByRevs(singleCoChanges);
      expect(result).toEqual({ A: 1 });
    });
  });
});
