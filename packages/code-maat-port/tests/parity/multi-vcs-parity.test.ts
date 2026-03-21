import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { FIXTURES, runJar, runTS } from "./helpers";

const AGE_DATE = "2015-03-01";

const NON_CHURN = [
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

const VCS_FILES: [string, string][] = [
  ["git2", join(FIXTURES, "simple_git2.txt")],
  ["hg", join(FIXTURES, "simple_hg.txt")],
  ["p4", join(FIXTURES, "simple_p4.txt")],
];

for (const [vcs, logFile] of VCS_FILES) {
  describe(`JAR parity — ${vcs}`, () => {
    for (const analysis of NON_CHURN) {
      it(analysis, async () =>
        expect(await runTS(logFile, { versionControl: vcs, analysis })).toEqual(
          runJar({ logFile, vcs, analysis }),
        ),
      );
    }
    it("age", async () =>
      expect(
        await runTS(logFile, { versionControl: vcs, analysis: "age", ageTimeNow: AGE_DATE }),
      ).toEqual(runJar({ logFile, vcs, analysis: "age", extra: ["--age-time-now", AGE_DATE] })));
  });
}

describe("JAR parity — git2 churn", () => {
  const LOG = join(FIXTURES, "simple_git2.txt");
  for (const analysis of CHURN) {
    it(analysis, async () =>
      expect(await runTS(LOG, { versionControl: "git2", analysis })).toEqual(
        runJar({ logFile: LOG, vcs: "git2", analysis }),
      ),
    );
  }
});
