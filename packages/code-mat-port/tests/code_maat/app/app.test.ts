import { describe, expect, it } from "bun:test";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AppOptions } from "../../../src/code_maat/app/app";
import { runAnalysis } from "../../../src/code_maat/app/app";

const F = join(__dirname, "../../fixtures/log-fixtures");
const GIT = join(F, "simple_git.txt"),
  GIT2 = join(F, "simple_git2.txt");
const HG = join(F, "simple_hg.txt"),
  P4 = join(F, "simple_p4.txt");

const BASE: AppOptions = {
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 0,
  maxCoupling: 100,
  maxChangesetSize: 1000,
  versionControl: "git",
  analysis: "authors",
};
const opts = (o: Partial<AppOptions>): AppOptions => ({ ...BASE, ...o });

describe("VCS dispatch", () => {
  it("git", async () =>
    expect(
      await runAnalysis(GIT, opts({ versionControl: "git", analysis: "revisions" })),
    ).toHaveLength(2));
  it("git2", async () =>
    expect(
      await runAnalysis(GIT2, opts({ versionControl: "git2", analysis: "revisions" })),
    ).toHaveLength(2));
  it("hg", async () =>
    expect(
      await runAnalysis(HG, opts({ versionControl: "hg", analysis: "revisions" })),
    ).toHaveLength(2));
  it("p4", async () =>
    expect(
      await runAnalysis(P4, opts({ versionControl: "p4", analysis: "revisions" })),
    ).toHaveLength(2));
  it("unknown throws", async () =>
    expect(runAnalysis(GIT, opts({ versionControl: "unknown" }))).rejects.toThrow(
      "Invalid --version-control",
    ));
});

describe("analysis dispatch", () => {
  const cases: [string, string, Partial<AppOptions>?][] = [
    ["authors", "nAuthors"],
    ["revisions", "nRevs"],
    ["coupling", "degree"],
    // soc: minRevs:0 needed — simple_git.txt has max soc=1, filter is n > minRevs
    ["soc", "soc", { minRevs: 0 }],
    ["abs-churn", "added"],
    ["author-churn", "author"],
    ["entity-churn", "entity"],
    // entity-ownership returns { entity, author, added, deleted }
    ["entity-ownership", "added"],
    ["main-dev", "mainDev"],
    ["refactoring-main-dev", "mainDev"],
    ["entity-effort", "authorRevs"],
    ["main-dev-by-revs", "mainDev"],
    ["fragmentation", "fractalValue"],
    ["communication", "strength"],
  ];
  for (const [analysis, key, extra] of cases) {
    it(analysis, async () =>
      expect((await runAnalysis(GIT, opts({ analysis, ...extra })))[0]).toHaveProperty(key),
    );
  }
  it("summary", async () =>
    expect((await runAnalysis(GIT, opts({ analysis: "summary" })))[0]).toEqual({
      statistic: "number-of-commits",
      value: 2,
    }));
  it("messages", async () =>
    expect(
      await runAnalysis(GIT, opts({ analysis: "messages", expressionToMatch: "stat" })),
    ).toHaveLength(1));
  it("age", async () =>
    expect(
      (await runAnalysis(GIT, opts({ analysis: "age", ageTimeNow: "2015-03-01" })))[0],
    ).toHaveProperty("ageMonths"));
  it("unknown throws", async () =>
    expect(runAnalysis(GIT, opts({ analysis: "unknown" }))).rejects.toThrow("Invalid analysis"));
});

describe("option content resolution", () => {
  it("accepts a group specification file path", async () => {
    const dir = await mkdtemp(join(tmpdir(), "code-maat-group-"));
    const groupFile = join(dir, "layers.txt");
    await writeFile(
      groupFile,
      "/Infrastrucure => infrastructure\n/Presentation => presentation\n",
      "utf8",
    );

    await expect(
      runAnalysis(GIT, opts({ analysis: "revisions", group: groupFile })),
    ).resolves.toEqual([
      { entity: "infrastructure", nRevs: 2 },
      { entity: "presentation", nRevs: 1 },
    ]);
  });

  it("accepts a team map file path", async () => {
    const dir = await mkdtemp(join(tmpdir(), "code-maat-team-map-"));
    const teamMapFile = join(dir, "teams.csv");
    await writeFile(teamMapFile, "author,team\nAPT,Team A\nXYZ,Team B\n", "utf8");

    await expect(runAnalysis(GIT, opts({ analysis: "identity", teamMapFile }))).resolves.toEqual([
      expect.objectContaining({ author: "Team A" }),
      expect.objectContaining({ author: "Team A" }),
      expect.objectContaining({ author: "Team B" }),
    ]);
  });

  it("rejects a missing team map file path instead of silently ignoring it", async () => {
    const missingPath = join(tmpdir(), "code-maat", "missing-team-map.csv");

    await expect(
      runAnalysis(GIT, opts({ analysis: "identity", teamMapFile: missingPath })),
    ).rejects.toThrow("Invalid teamMapFile option");
  });
});
