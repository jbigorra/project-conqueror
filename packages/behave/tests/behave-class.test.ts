import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { Behave } from "../src/behave";

const FIXTURE = join(import.meta.dir, "fixtures/integration-gitlog.txt");
const SOURCE_DIR = join(import.meta.dir, "fixtures/sample-source");

const RELAXED_OPTIONS = {
  options: {
    minRevs: 1,
    minSharedRevs: 1,
    minCoupling: 0,
    maxCoupling: 100,
    maxChangesetSize: 1000,
  },
};

describe("Behave class", () => {
  test("constructor stores gitLogPath", () => {
    const behave = new Behave(FIXTURE);
    expect(behave).toBeInstanceOf(Behave);
  });

  test("revisions delegates to simple.revisions with stored gitLogPath", async () => {
    const behave = new Behave(FIXTURE);
    const result = await behave.revisions({ vcsType: "git2", ...RELAXED_OPTIONS });

    expect(result.metadata.analysisName).toBe("revisions");
    expect(result.metadata.format).toBe("json");
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("entity");
    expect(result.data[0]).toHaveProperty("nRevs");
  });

  test("authors delegates to simple.authors with stored gitLogPath", async () => {
    const behave = new Behave(FIXTURE);
    const result = await behave.authors({ vcsType: "git2", ...RELAXED_OPTIONS });

    expect(result.metadata.analysisName).toBe("authors");
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("nAuthors");
  });

  test("coupling delegates to simple.coupling with stored gitLogPath", async () => {
    const behave = new Behave(FIXTURE);
    const result = await behave.coupling({ vcsType: "git2", ...RELAXED_OPTIONS });

    expect(result.metadata.analysisName).toBe("coupling");
  });

  test("each analysis method receives its own options, not constructor options", async () => {
    const behave = new Behave(FIXTURE);

    const r1 = await behave.revisions({ vcsType: "git2", ...RELAXED_OPTIONS, format: "json" });
    const r2 = await behave.revisions({ vcsType: "git2", ...RELAXED_OPTIONS, format: "csv" });

    expect(r1.metadata.format).toBe("json");
    expect(r2.metadata.format).toBe("csv");
  });

  test("complexityHotspots merges churn and complexity data", async () => {
    const behave = new Behave(FIXTURE);
    const result = await behave.complexityHotspots({
      sourceDir: SOURCE_DIR,
      vcsType: "git2",
      ...RELAXED_OPTIONS,
    });

    expect(result.metadata.analysisName).toBe("complexity-hotspots");
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty("entity");
    expect(result.data[0]).toHaveProperty("nRevs");
    expect(result.data[0]).toHaveProperty("cyclomaticComplexity");
    expect(result.data[0]).toHaveProperty("linesOfCode");
  });
});
