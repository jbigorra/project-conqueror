import { describe, expect, it } from "bun:test";
import { fileToAuthorTeamLookup, run } from "../../../src/code_maat/app/team-mapper";
import type { VCSEntry } from "../../../src/code_maat/types";

const commits: VCSEntry[] = [
  { entity: "A", rev: 1, author: "X" },
  { entity: "B", rev: 2, author: "Me Myself" },
  { entity: "A", rev: 3, author: "X" },
  { entity: "C", rev: 17, author: "Someone Else" },
];

describe("team-mapper", () => {
  describe("translates-authors-to-teams", () => {
    it("Maps all authors to the same team", () => {
      const teamLookup: Record<string, string> = {
        X: "A Team",
        "Me Myself": "A Team",
        "Someone Else": "A Team",
      };

      expect(run(commits, teamLookup)).toEqual([
        { entity: "A", rev: 1, author: "A Team" },
        { entity: "B", rev: 2, author: "A Team" },
        { entity: "A", rev: 3, author: "A Team" },
        { entity: "C", rev: 17, author: "A Team" },
      ]);
    });

    it("Maps the authors to different teams", () => {
      const teamLookup: Record<string, string> = {
        X: "C Team",
        "Me Myself": "B Team",
        "Someone Else": "A Team",
      };

      expect(run(commits, teamLookup)).toEqual([
        { entity: "A", rev: 1, author: "C Team" },
        { entity: "B", rev: 2, author: "B Team" },
        { entity: "A", rev: 3, author: "C Team" },
        { entity: "C", rev: 17, author: "A Team" },
      ]);
    });

    it("Unmapped authors are kept as-is", () => {
      const teamLookup: Record<string, string> = {
        "Me Myself": "B Team",
        "Someone Else": "A Team",
      };

      expect(run(commits, teamLookup)).toEqual([
        { entity: "A", rev: 1, author: "X" },
        { entity: "B", rev: 2, author: "B Team" },
        { entity: "A", rev: 3, author: "X" },
        { entity: "C", rev: 17, author: "A Team" },
      ]);
    });
  });

  describe("fileToAuthorTeamLookup", () => {
    it("parses a CSV string into an author-to-team map", () => {
      const csv = "author,team\nX,A Team\nMe Myself,B Team\nSomeone Else,C Team\n";
      expect(fileToAuthorTeamLookup(csv)).toEqual({
        X: "A Team",
        "Me Myself": "B Team",
        "Someone Else": "C Team",
      });
    });

    it("returns an empty map for an empty CSV (headers only)", () => {
      const csv = "author,team\n";
      expect(fileToAuthorTeamLookup(csv)).toEqual({});
    });
  });
});
