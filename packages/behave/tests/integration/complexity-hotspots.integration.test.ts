import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { complexityHotspots } from "../../src/analyses/aggregated/complexity-hotspots";

const FIXTURE = join(import.meta.dir, "../fixtures/integration-gitlog.txt");
const SOURCE_DIR = join(import.meta.dir, "../fixtures/sample-source");

describe("complexity-hotspots integration", () => {
  test("produces hotspots by merging real churn and complexity data", async () => {
    const result = await complexityHotspots({
      gitLogPath: FIXTURE,
      sourceDir: SOURCE_DIR,
      vcsType: "git2",
      options: {
        minRevs: 1,
        minSharedRevs: 1,
        minCoupling: 0,
        maxCoupling: 100,
        maxChangesetSize: 1000,
      },
    });

    expect(result.metadata.analysisName).toBe("complexity-hotspots");
    expect(result.metadata.format).toBe("json");
    expect(result.data).toBeInstanceOf(Array);
    expect(result.data.length).toBeGreaterThan(0);

    const first = result.data[0];
    expect(first).toHaveProperty("entity");
    expect(first).toHaveProperty("nRevs");
    expect(first).toHaveProperty("cyclomaticComplexity");
  });

  test("returns empty hotspots when source dir has no matching files", async () => {
    const result = await complexityHotspots({
      gitLogPath: FIXTURE,
      sourceDir: join(import.meta.dir, "../fixtures/factories"),
      vcsType: "git2",
      options: {
        minRevs: 1,
        minSharedRevs: 1,
        minCoupling: 0,
        maxCoupling: 100,
        maxChangesetSize: 1000,
      },
    });

    expect(result.metadata.analysisName).toBe("complexity-hotspots");
    expect(result.data).toEqual([]);
  });
});
