import { describe, expect, test } from "bun:test";
import { bySharedEntities } from "../../../src/code_maat/analysis/communication";
import type { VCSEntry } from "../../../src/code_maat/types";

const sharingAuthors: VCSEntry[] = [
  { entity: "A", rev: 1, author: "at", date: "2013-11-10" },
  { entity: "A", rev: 2, author: "jt", date: "2013-11-11" },
  { entity: "A", rev: 3, author: "ap", date: "2013-11-15" },
  { entity: "B", rev: 4, author: "at", date: "2013-11-23" },
  { entity: "B", rev: 5, author: "jt", date: "2013-11-23" },
];

describe("communication analysis", () => {
  test("calculates communication needs for shared authorship", () => {
    const result = bySharedEntities(sharingAuthors);

    // Both strength and author are sorted descending. No peer tiebreak.
    expect(result).toEqual([
      { author: "jt", peer: "at", shared: 2, average: 2, strength: 100 },
      { author: "at", peer: "jt", shared: 2, average: 2, strength: 100 },
      { author: "jt", peer: "ap", shared: 1, average: 2, strength: 50 },
      { author: "at", peer: "ap", shared: 1, average: 2, strength: 50 },
      { author: "ap", peer: "at", shared: 1, average: 2, strength: 50 },
      { author: "ap", peer: "jt", shared: 1, average: 2, strength: 50 },
    ]);
  });
});
