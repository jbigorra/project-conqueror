// tests/parity/git-parity.test.ts
import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { FIXTURES, runJar, runTS } from "./helpers";

const LOG = join(FIXTURES, "simple_git.txt");
const VCS = "git";
const AGE_DATE = "2015-03-01";

const BASIC = [
  "authors",
  "revisions",
  "coupling",
  "soc",
  "summary",
  "entity-effort",
  "main-dev-by-revs",
  "fragmentation",
  "communication",
];

const CHURN = [
  "abs-churn",
  "author-churn",
  "entity-churn",
  "entity-ownership",
  "main-dev",
  "refactoring-main-dev",
];

describe("JAR parity — git", () => {
  for (const analysis of BASIC) {
    it(analysis, async () =>
      expect(await runTS(LOG, { versionControl: VCS, analysis })).toEqual(
        runJar({ logFile: LOG, vcs: VCS, analysis }),
      ),
    );
  }

  it("age", async () =>
    expect(
      await runTS(LOG, { versionControl: VCS, analysis: "age", ageTimeNow: AGE_DATE }),
    ).toEqual(
      runJar({ logFile: LOG, vcs: VCS, analysis: "age", extra: ["--age-time-now", AGE_DATE] }),
    ));

  it("messages", async () =>
    expect(
      await runTS(LOG, { versionControl: VCS, analysis: "messages", expressionToMatch: "stat" }),
    ).toEqual(
      runJar({
        logFile: LOG,
        vcs: VCS,
        analysis: "messages",
        extra: ["--expression-to-match", "stat"],
      }),
    ));

  for (const analysis of CHURN) {
    it(`${analysis} (churn)`, async () =>
      expect(await runTS(LOG, { versionControl: VCS, analysis })).toEqual(
        runJar({ logFile: LOG, vcs: VCS, analysis }),
      ));
  }
});
