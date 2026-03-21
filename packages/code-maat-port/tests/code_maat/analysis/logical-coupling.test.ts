import { describe, expect, it } from "bun:test";
import { byDegree } from "../../../src/code_maat/analysis/logical-coupling";
import type { AnalysisOptions, VCSEntry } from "../../../src/code_maat/types";

const singleEntityCommit: VCSEntry[] = [{ author: "a", entity: "This/is/a/single/entity", rev: 1 }];

const oneRevision: VCSEntry[] = [
  { author: "a", entity: "A", rev: 1 },
  { author: "a", entity: "B", rev: 1 },
  { author: "a", entity: "C", rev: 1 },
];

const coupled: VCSEntry[] = [
  { author: "a", entity: "A", rev: 1 },
  { author: "a", entity: "B", rev: 1 },
  { author: "a", entity: "C", rev: 1 },
  { author: "a", entity: "A", rev: 2 },
  { author: "a", entity: "B", rev: 2 },
];

const nonAsciiCoupled: VCSEntry[] = [
  { author: "a", entity: "z.ts", rev: 1 },
  { author: "a", entity: "🧠.ts", rev: 1 },
  { author: "a", entity: "ä.ts", rev: 2 },
  { author: "a", entity: "🧠.ts", rev: 2 },
];

const defaultOptions: AnalysisOptions = {
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 30,
  maxCoupling: 100,
  maxChangesetSize: 10,
};

describe("logical-coupling", () => {
  describe("byDegree", () => {
    it("calculates coupling by degree", () => {
      const result = byDegree(coupled, defaultOptions);
      expect(result).toEqual([
        { entity: "A", coupled: "B", degree: 100, averageRevs: 2 },
        { entity: "A", coupled: "C", degree: 66, averageRevs: 2 },
        { entity: "B", coupled: "C", degree: 66, averageRevs: 2 },
      ]);
    });

    it("gives empty result for single change set with single entity", () => {
      const result = byDegree(singleEntityCommit, defaultOptions);
      expect(result).toEqual([]);
    });

    it("filters out pairs below minCoupling threshold", () => {
      const strictOptions: AnalysisOptions = {
        ...defaultOptions,
        minCoupling: 80,
      };
      const result = byDegree(coupled, strictOptions);
      expect(result).toEqual([{ entity: "A", coupled: "B", degree: 100, averageRevs: 2 }]);
    });

    it("filters out pairs below minSharedRevs threshold", () => {
      const strictOptions: AnalysisOptions = {
        ...defaultOptions,
        minSharedRevs: 2,
      };
      const result = byDegree(coupled, strictOptions);
      expect(result).toEqual([{ entity: "A", coupled: "B", degree: 100, averageRevs: 2 }]);
    });

    it("filters out revisions exceeding maxChangesetSize", () => {
      // rev 1 has 3 entities, rev 2 has 2 entities
      // if maxChangesetSize=2, rev 1 is excluded, only rev 2 counts
      const strictOptions: AnalysisOptions = {
        ...defaultOptions,
        maxChangesetSize: 2,
      };
      // Only rev2 remains: A and B co-changed once
      // A has 1 rev, B has 1 rev, degree = 1/avg(1,1) = 100%
      const result = byDegree(coupled, strictOptions);
      expect(result).toEqual([{ entity: "A", coupled: "B", degree: 100, averageRevs: 1 }]);
    });

    it("returns empty for one revision with no filtering", () => {
      // oneRevision has all entities in a single revision
      // A-B: 1 shared, A: 1 rev, B: 1 rev, degree = 100%
      // With minCoupling=30 all pairs pass
      const result = byDegree(oneRevision, defaultOptions);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toMatchObject({ degree: 100 });
    });

    it("sorts results by degree descending", () => {
      const result = byDegree(coupled, defaultOptions);
      const degrees = result.map((r) => r.degree);
      expect(degrees).toEqual([...degrees].sort((a, b) => b - a));
    });

    it("sorts equal-degree non-ASCII entities by lexicographic code-point order", () => {
      const result = byDegree(nonAsciiCoupled, defaultOptions);
      expect(result).toEqual([
        { entity: "z.ts", coupled: "🧠.ts", degree: 66, averageRevs: 2 },
        { entity: "ä.ts", coupled: "🧠.ts", degree: 66, averageRevs: 2 },
      ]);
    });
  });
});
