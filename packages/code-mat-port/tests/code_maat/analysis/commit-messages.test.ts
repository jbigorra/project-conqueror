import { describe, expect, test } from "bun:test";
import {
  byWordFrequency,
  IllegalArgumentError,
} from "../../../src/code_maat/analysis/commit-messages";
import type { VCSEntry } from "../../../src/code_maat/types";
import { vcs } from "../../fixtures/test-data";

describe("commit-messages analysis", () => {
  describe("identifies matching words", () => {
    test("counts entity occurrences where message matches 'change'", () => {
      const result = byWordFrequency(vcs, { expressionToMatch: "change" });
      expect(result).toEqual([
        { entity: "A", matches: 3 },
        { entity: "B", matches: 1 },
      ]);
    });

    test("counts entity occurrences where message matches 'Third'", () => {
      const result = byWordFrequency(vcs, { expressionToMatch: "Third" });
      expect(result).toEqual([{ entity: "A", matches: 1 }]);
    });

    test("returns empty array when no messages match", () => {
      const result = byWordFrequency(vcs, { expressionToMatch: "no match for this" });
      expect(result).toEqual([]);
    });
  });

  describe("detects absent message fields", () => {
    test("throws when all commits have sentinel '-' messages (no real messages present)", () => {
      const commits: VCSEntry[] = [
        { author: "apt", entity: "A", rev: 1, message: "-" },
        { author: "apt", entity: "B", rev: 2, message: "-" },
      ];
      expect(() => byWordFrequency(commits, { expressionToMatch: "change" })).toThrow(
        IllegalArgumentError,
      );
    });

    test("returns empty result for empty dataset", () => {
      const result = byWordFrequency([], { expressionToMatch: "change" });
      expect(result).toEqual([]);
    });

    test("works when at least one commit has a real message alongside sentinel '-' entries", () => {
      const commits: VCSEntry[] = [
        { author: "apt", entity: "A", rev: 1, message: "-" },
        { author: "apt", entity: "B", rev: 2, message: "some change message" },
      ];
      const result = byWordFrequency(commits, { expressionToMatch: "change" });
      expect(result).toEqual([{ entity: "B", matches: 1 }]);
    });

    test("throws a clear error for invalid regular expressions", () => {
      expect(() => byWordFrequency(vcs, { expressionToMatch: "[" })).toThrow(
        "Invalid expressionToMatch regex: [",
      );
    });
  });
});
