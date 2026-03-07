import { describe, it, expect } from "bun:test";
import { asSoc, byDegree } from "../../../src/code_maat/analysis/sum-of-coupling";
import { optionsWithLowThresholds } from "../../fixtures/test-data";
import type { VCSEntry } from "../../../src/code_maat/types";

// Mirrors the Clojure test data:
// (def coupled [{:entity "A" :rev 1} {:entity "B" :rev 1} {:entity "C" :rev 1}
//               {:entity "A" :rev 2} {:entity "B" :rev 2}])
const coupled: VCSEntry[] = [
  { author: "", entity: "A", rev: 1 },
  { author: "", entity: "B", rev: 1 },
  { author: "", entity: "C", rev: 1 },
  { author: "", entity: "A", rev: 2 },
  { author: "", entity: "B", rev: 2 },
];

describe("sum-of-coupling", () => {
  describe("asSoc", () => {
    it("measures coupling by entity", () => {
      // Rev 1: A, B, C -> each has 2 partners
      // Rev 2: A, B    -> each has 1 partner
      // A: 2+1=3, B: 2+1=3, C: 2+0=2
      // Filter: soc > minRevs (1), all pass
      // Sort by soc desc
      const result = asSoc(coupled, optionsWithLowThresholds);
      expect(result).toEqual([
        ["A", 3],
        ["B", 3],
        ["C", 2],
      ]);
    });

    it("filters entities whose soc does not exceed minRevs", () => {
      // With minRevs=2, only entities with soc > 2 are included (A=3, B=3)
      const result = asSoc(coupled, { minRevs: 2 });
      expect(result).toEqual([
        ["A", 3],
        ["B", 3],
      ]);
    });

    it("returns empty when all entities are below threshold", () => {
      const result = asSoc(coupled, { minRevs: 10 });
      expect(result).toEqual([]);
    });

    it("handles single entity in a revision (soc of 0, filtered out)", () => {
      const single: VCSEntry[] = [{ author: "", entity: "A", rev: 1 }];
      // A appears alone, so nCouples = 0; soc(A) = 0, filtered by > minRevs=1
      const result = asSoc(single, optionsWithLowThresholds);
      expect(result).toEqual([]);
    });

    it("handles empty dataset", () => {
      const result = asSoc([], optionsWithLowThresholds);
      expect(result).toEqual([]);
    });

    it("sorts ties alphabetically by entity name", () => {
      const data: VCSEntry[] = [
        { author: "", entity: "B", rev: 1 },
        { author: "", entity: "A", rev: 1 },
      ];
      // Both have soc=1, but 1 > minRevs=1 is false, so both filtered out
      // Use minRevs=0 to include them
      const result = asSoc(data, { minRevs: 0 });
      expect(result).toEqual([
        ["A", 1],
        ["B", 1],
      ]);
    });
  });

  describe("byDegree", () => {
    it("returns structured SocResult objects sorted by soc descending", () => {
      const result = byDegree(coupled, optionsWithLowThresholds);
      expect(result).toEqual([
        { entity: "A", soc: 3 },
        { entity: "B", soc: 3 },
        { entity: "C", soc: 2 },
      ]);
    });

    it("returns empty array for empty input", () => {
      const result = byDegree([], optionsWithLowThresholds);
      expect(result).toEqual([]);
    });
  });
});
