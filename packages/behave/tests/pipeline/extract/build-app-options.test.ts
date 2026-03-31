import { describe, expect, test } from "bun:test";
import { buildAppOptions } from "../../../src/pipeline/extract/build-app-options";
import type { SimpleAnalysisInput } from "../../../src/types";

describe("buildAppOptions", () => {
  test("builds minimal options with defaults", () => {
    const input: SimpleAnalysisInput = { gitLogPath: "/path/to/log" };
    const result = buildAppOptions("revisions", input);
    expect(result.analysis).toBe("revisions");
    expect(result.versionControl).toBe("git");
    expect(result.minRevs).toBe(5);
  });
  test("forwards vcsType override", () => {
    const input: SimpleAnalysisInput = { gitLogPath: "/log", vcsType: "svn" };
    const result = buildAppOptions("authors", input);
    expect(result.versionControl).toBe("svn");
  });
  test("forwards analysis-specific fields", () => {
    const input: SimpleAnalysisInput = {
      gitLogPath: "/log",
      ageTimeNow: "2026-03-20",
      expressionToMatch: "fix.*",
      group: "group-spec",
      teamMapFile: "/teams.csv",
      temporalPeriod: "30",
    };
    const result = buildAppOptions("age", input);
    expect(result.ageTimeNow).toBe("2026-03-20");
    expect(result.expressionToMatch).toBe("fix.*");
  });
  test("merges partial options with defaults", () => {
    const input: SimpleAnalysisInput = {
      gitLogPath: "/log",
      options: { minRevs: 10 },
    };
    const result = buildAppOptions("revisions", input);
    expect(result.minRevs).toBe(10);
    expect(result.minSharedRevs).toBe(5);
  });
});
