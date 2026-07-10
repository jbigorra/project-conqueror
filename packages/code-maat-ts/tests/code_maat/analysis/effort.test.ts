import { describe, expect, test } from "bun:test";
import {
  asEntityFragmentation,
  asMainDeveloperByRevisions,
  asRevisionsPerAuthor,
} from "../../../src/code_maat/analysis/effort";
import type { VCSEntry } from "../../../src/code_maat/types";

const singleEffort: VCSEntry[] = [
  { entity: "A", rev: 1, author: "at", date: "2013-11-10" },
  { entity: "B", rev: 2, author: "at", date: "2013-11-11" },
  { entity: "B", rev: 3, author: "at", date: "2013-11-15" },
];

const multiEffort: VCSEntry[] = [
  { entity: "Z", rev: 4, author: "zt", date: "2013-11-15" },
  { entity: "Z", rev: 5, author: "xy", date: "2013-11-15" },
  { entity: "Z", rev: 6, author: "xy", date: "2013-11-16" },

  { entity: "C", rev: 4, author: "zt", date: "2013-11-15" },
  { entity: "C", rev: 5, author: "zt", date: "2013-11-15" },

  { entity: "A", rev: 1, author: "at", date: "2013-11-10" },
  { entity: "A", rev: 2, author: "xy", date: "2013-11-11" },
  { entity: "A", rev: 3, author: "zt", date: "2013-11-15" },
  { entity: "A", rev: 4, author: "zt", date: "2013-11-15" },
  { entity: "A", rev: 5, author: "xy", date: "2013-11-15" },
  { entity: "A", rev: 6, author: "xy", date: "2013-11-16" },
];

const sharedEffort: VCSEntry[] = [
  { entity: "A", rev: 1, author: "zt", date: "2013-11-10" },
  { entity: "A", rev: 2, author: "at", date: "2013-11-11" },
  { entity: "A", rev: 3, author: "at", date: "2013-11-15" },
  { entity: "B", rev: 4, author: "xx", date: "2013-11-15" },
  { entity: "C", rev: 5, author: "x1", date: "2013-11-16" },
  { entity: "C", rev: 6, author: "x2", date: "2013-11-16" },
];

const nonAsciiEntities: VCSEntry[] = [
  { entity: "ä.ts", rev: 1, author: "at", date: "2013-11-10" },
  { entity: "z.ts", rev: 2, author: "zt", date: "2013-11-11" },
];

describe("effort analysis", () => {
  describe("asRevisionsPerAuthor", () => {
    test("calculates effort for a single author", () => {
      const result = asRevisionsPerAuthor(singleEffort, {});
      expect(result).toEqual([
        { entity: "A", author: "at", authorRevs: 1, totalRevs: 1 },
        { entity: "B", author: "at", authorRevs: 2, totalRevs: 2 },
      ]);
    });

    test("calculates effort for multiple authors sorted by revisions descending within entity", () => {
      const result = asRevisionsPerAuthor(multiEffort, {});
      expect(result).toEqual([
        { entity: "A", author: "xy", authorRevs: 3, totalRevs: 6 },
        { entity: "A", author: "zt", authorRevs: 2, totalRevs: 6 },
        { entity: "A", author: "at", authorRevs: 1, totalRevs: 6 },
        { entity: "C", author: "zt", authorRevs: 2, totalRevs: 2 },
        { entity: "Z", author: "xy", authorRevs: 2, totalRevs: 3 },
        { entity: "Z", author: "zt", authorRevs: 1, totalRevs: 3 },
      ]);
    });

    test("sorts non-ASCII entities with lexicographic code-point ordering", () => {
      const result = asRevisionsPerAuthor(nonAsciiEntities, {});
      expect(result.map((entry) => entry.entity)).toEqual(["z.ts", "ä.ts"]);
    });
  });

  describe("asEntityFragmentation", () => {
    test("calculates fragmentation of 0.0 for single author entities", () => {
      const result = asEntityFragmentation(singleEffort, {});
      expect(result).toEqual([
        { entity: "B", fractalValue: 0.0, totalRevs: 2 },
        { entity: "A", fractalValue: 0.0, totalRevs: 1 },
      ]);
    });

    test("calculates entity fragmentation for multiple authors", () => {
      const result = asEntityFragmentation(multiEffort, {});
      expect(result).toEqual([
        { entity: "A", fractalValue: 0.61, totalRevs: 6 },
        { entity: "Z", fractalValue: 0.44, totalRevs: 3 },
        { entity: "C", fractalValue: 0.0, totalRevs: 2 },
      ]);
    });
  });

  describe("asMainDeveloperByRevisions", () => {
    test("identifies main developer by revisions with ownership percentage", () => {
      const result = asMainDeveloperByRevisions(sharedEffort, {});
      expect(result).toEqual([
        { entity: "A", mainDev: "at", added: 2, totalAdded: 3, ownership: 0.67 },
        { entity: "B", mainDev: "xx", added: 1, totalAdded: 1, ownership: 1.0 },
        { entity: "C", mainDev: "x1", added: 1, totalAdded: 2, ownership: 0.5 },
      ]);
    });

    test("sorts entities with lexicographic code-point ordering", () => {
      const result = asMainDeveloperByRevisions(nonAsciiEntities, {});
      expect(result.map((entry) => entry.entity)).toEqual(["z.ts", "ä.ts"]);
    });
  });
});
