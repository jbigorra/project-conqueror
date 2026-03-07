import { describe, expect, it } from "bun:test";
import { vcs, optionsWithLowThresholds } from "../../fixtures/test-data";
import { all, ofModule, byCount } from "../../../src/code_maat/analysis/authors";

describe("authors analysis", () => {
  describe("all", () => {
    it("deduces all unique authors from vcs data", () => {
      const result = all(vcs);
      expect(result).toEqual(new Set(["apt", "jt"]));
    });
  });

  describe("ofModule", () => {
    it("returns all authors who touched entity A", () => {
      const result = ofModule(vcs, "A");
      expect(result).toEqual(new Set(["apt", "jt"]));
    });

    it("returns all authors who touched entity B", () => {
      const result = ofModule(vcs, "B");
      expect(result).toEqual(new Set(["apt"]));
    });
  });

  describe("byCount", () => {
    it("sorts entities by number of distinct authors descending", () => {
      const result = byCount(vcs, optionsWithLowThresholds);
      expect(result).toEqual([
        { entity: "A", nAuthors: 2, nRevs: 3 },
        { entity: "B", nAuthors: 1, nRevs: 1 },
      ]);
    });

    it("supports ascending sort order", () => {
      const result = byCount(vcs, optionsWithLowThresholds, "asc");
      expect(result).toEqual([
        { entity: "B", nAuthors: 1, nRevs: 1 },
        { entity: "A", nAuthors: 2, nRevs: 3 },
      ]);
    });
  });
});
