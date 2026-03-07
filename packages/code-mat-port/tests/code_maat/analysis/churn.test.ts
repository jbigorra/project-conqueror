import { describe, test, expect } from "bun:test";
import {
  absolutesTrend,
  byAuthor,
  byEntity,
  asOwnership,
  byMainDeveloper,
  byRefactoringMainDeveloper,
} from "../../../src/code_maat/analysis/churn";
import type { VCSEntry } from "../../../src/code_maat/types";

const options = {};

// Incomplete data - missing loc-added / loc-deleted fields
const incomplete: VCSEntry[] = [
  { entity: "A", rev: 1, author: "at", date: "2013-11-10" },
  { entity: "B", rev: 2, author: "ta", date: "2013-11-11" },
];

const singleAuthor: VCSEntry[] = [
  { entity: "Same", rev: 1, author: "single", date: "2013-11-10", locAdded: "10", locDeleted: "1" },
  { entity: "Same", rev: 2, author: "single", date: "2013-11-11", locAdded: "20", locDeleted: "2" },
  { entity: "Same", rev: 3, author: "single", date: "2013-11-11", locAdded: "2", locDeleted: "0" },
];

const onlyRemovedLines: VCSEntry[] = [
  { entity: "Same", rev: 1, author: "single", date: "2013-11-10", locAdded: "0", locDeleted: "1" },
];

const onlyAddedLines: VCSEntry[] = [
  { entity: "Same", rev: 1, author: "single", date: "2013-11-10", locAdded: "1", locDeleted: "0" },
];

const simple: VCSEntry[] = [
  { entity: "B", rev: 2, author: "ta", date: "2013-11-11", locAdded: "20", locDeleted: "2" },
  { entity: "A", rev: 1, author: "at", date: "2013-11-10", locAdded: "10", locDeleted: "1" },
  { entity: "B", rev: 1, author: "at", date: "2013-11-10", locAdded: "1", locDeleted: "1" },
  { entity: "B", rev: 3, author: "at", date: "2013-11-11", locAdded: "2", locDeleted: "0" },
];

const sameAuthor: VCSEntry[] = [
  { entity: "A", rev: 1, author: "at", date: "2013-11-10", locAdded: "10", locDeleted: "1" },
  { entity: "A", rev: 2, author: "at", date: "2013-11-11", locAdded: "2", locDeleted: "5" },
  { entity: "A", rev: 3, author: "xy", date: "2013-11-11", locAdded: "7", locDeleted: "1" },
  { entity: "A", rev: 4, author: "xy", date: "2013-11-11", locAdded: "8", locDeleted: "2" },
];

const withBinary: VCSEntry[] = [
  { entity: "binary", rev: 1, author: "at", date: "2013-11-10", locAdded: "-", locDeleted: "-" },
];

describe("churn analysis", () => {
  describe("absolutesTrend", () => {
    test("throws error on missing modification info", () => {
      expect(() => absolutesTrend(incomplete, options)).toThrow(
        "churn analysis: the given VCS data doesn't contain modification metrics"
      );
    });

    test("calculates absolute churn by date", () => {
      const result = absolutesTrend(simple, options);
      expect(result).toEqual([
        { date: "2013-11-10", added: 11, deleted: 2, commits: 1 },
        { date: "2013-11-11", added: 22, deleted: 2, commits: 2 },
      ]);
    });

    test("binaries are counted as zero churn", () => {
      const result = absolutesTrend(withBinary, options);
      expect(result).toEqual([
        { date: "2013-11-10", added: 0, deleted: 0, commits: 1 },
      ]);
    });
  });

  describe("byAuthor", () => {
    test("calculates churn by author", () => {
      const result = byAuthor(simple, options);
      expect(result).toEqual([
        { author: "at", added: 13, deleted: 2, commits: 2 },
        { author: "ta", added: 20, deleted: 2, commits: 1 },
      ]);
    });
  });

  describe("byEntity", () => {
    test("calculates churn by entity", () => {
      const result = byEntity(simple, options);
      expect(result).toEqual([
        { entity: "B", added: 23, deleted: 3, commits: 3 },
        { entity: "A", added: 10, deleted: 1, commits: 1 },
      ]);
    });
  });

  describe("asOwnership", () => {
    test("calculates author ownership from churn", () => {
      const result = asOwnership(simple, options);
      expect(result).toEqual([
        { entity: "A", author: "at", added: 10, deleted: 1 },
        { entity: "B", author: "ta", added: 20, deleted: 2 },
        { entity: "B", author: "at", added: 3, deleted: 1 },
      ]);
    });

    test("sums ownership churn for same author", () => {
      const result = asOwnership(sameAuthor, options);
      expect(result).toEqual([
        { entity: "A", author: "at", added: 12, deleted: 6 },
        { entity: "A", author: "xy", added: 15, deleted: 3 },
      ]);
    });
  });

  describe("byMainDeveloper", () => {
    test("identifies single main developer", () => {
      const result = byMainDeveloper(singleAuthor, options);
      expect(result).toEqual([
        { entity: "Same", mainDev: "single", added: 32, totalAdded: 32, ownership: 1.0 },
      ]);
    });

    test("identifies main developer on shared entities", () => {
      const result = byMainDeveloper(sameAuthor, options);
      expect(result).toEqual([
        { entity: "A", mainDev: "xy", added: 15, totalAdded: 27, ownership: 0.56 },
      ]);
    });

    test("ownership is none without added lines", () => {
      const result = byMainDeveloper(onlyRemovedLines, options);
      expect(result).toEqual([
        { entity: "Same", mainDev: "single", added: 0, totalAdded: 0, ownership: 0.0 },
      ]);
    });
  });

  describe("byRefactoringMainDeveloper", () => {
    test("identifies refactoring developer on shared entities", () => {
      const result = byRefactoringMainDeveloper(sameAuthor, options);
      expect(result).toEqual([
        { entity: "A", mainDev: "at", removed: 6, totalRemoved: 9, ownership: 0.67 },
      ]);
    });

    test("ownership is none without removed lines", () => {
      const result = byRefactoringMainDeveloper(onlyAddedLines, options);
      expect(result).toEqual([
        { entity: "Same", mainDev: "single", removed: 0, totalRemoved: 0, ownership: 0.0 },
      ]);
    });
  });
});
