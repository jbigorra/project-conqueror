import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import * as analyse from "../../src/analyses/simple";
import type { SimpleAnalysisInput } from "../../src/types";

const FIXTURE = join(import.meta.dir, "../fixtures/integration-gitlog.txt");

const input: SimpleAnalysisInput = {
  gitLogPath: FIXTURE,
  vcsType: "git2",
  options: {
    minRevs: 1,
    minSharedRevs: 1,
    minCoupling: 0,
    maxCoupling: 100,
    maxChangesetSize: 1000,
  },
};

describe("simple analyses integration", () => {
  describe("entity-based", () => {
    test("revisions", async () => {
      const result = await analyse.revisions(input);
      expect(result.metadata.analysisName).toBe("revisions");
      expect(result.metadata.format).toBe("json");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("nRevs");
    });

    test("authors", async () => {
      const result = await analyse.authors(input);
      expect(result.metadata.analysisName).toBe("authors");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("nAuthors");
      expect(result.data[0]).toHaveProperty("nRevs");
    });

    test("summary", async () => {
      const result = await analyse.summary(input);
      expect(result.metadata.analysisName).toBe("summary");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("statistic");
      expect(result.data[0]).toHaveProperty("value");
    });

    test("identity", async () => {
      const result = await analyse.identity(input);
      expect(result.metadata.analysisName).toBe("identity");
      expect(result.data).toBeInstanceOf(Array);
    });
  });

  describe("churn-based", () => {
    test("abs-churn", async () => {
      const result = await analyse.absChurn(input);
      expect(result.metadata.analysisName).toBe("abs-churn");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("date");
      expect(result.data[0]).toHaveProperty("added");
      expect(result.data[0]).toHaveProperty("deleted");
      expect(result.data[0]).toHaveProperty("commits");
    });

    test("author-churn", async () => {
      const result = await analyse.authorChurn(input);
      expect(result.metadata.analysisName).toBe("author-churn");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("author");
      expect(result.data[0]).toHaveProperty("added");
      expect(result.data[0]).toHaveProperty("deleted");
    });

    test("entity-churn", async () => {
      const result = await analyse.entityChurn(input);
      expect(result.metadata.analysisName).toBe("entity-churn");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("added");
      expect(result.data[0]).toHaveProperty("deleted");
    });

    test("entity-ownership", async () => {
      const result = await analyse.entityOwnership(input);
      expect(result.metadata.analysisName).toBe("entity-ownership");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("author");
      expect(result.data[0]).toHaveProperty("added");
      expect(result.data[0]).toHaveProperty("deleted");
    });
  });

  describe("developer-based", () => {
    test("main-dev", async () => {
      const result = await analyse.mainDev(input);
      expect(result.metadata.analysisName).toBe("main-dev");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("mainDev");
      expect(result.data[0]).toHaveProperty("added");
      expect(result.data[0]).toHaveProperty("totalAdded");
      expect(result.data[0]).toHaveProperty("ownership");
    });

    test("main-dev-by-revs", async () => {
      const result = await analyse.mainDevByRevs(input);
      expect(result.metadata.analysisName).toBe("main-dev-by-revs");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("mainDev");
      expect(result.data[0]).toHaveProperty("ownership");
    });

    test("refactoring-main-dev", async () => {
      const result = await analyse.refactoringMainDev(input);
      expect(result.metadata.analysisName).toBe("refactoring-main-dev");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("mainDev");
      expect(result.data[0]).toHaveProperty("removed");
      expect(result.data[0]).toHaveProperty("totalRemoved");
      expect(result.data[0]).toHaveProperty("ownership");
    });
  });

  describe("effort-based", () => {
    test("entity-effort", async () => {
      const result = await analyse.entityEffort(input);
      expect(result.metadata.analysisName).toBe("entity-effort");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("author");
      expect(result.data[0]).toHaveProperty("authorRevs");
      expect(result.data[0]).toHaveProperty("totalRevs");
    });

    test("fragmentation", async () => {
      const result = await analyse.fragmentation(input);
      expect(result.metadata.analysisName).toBe("fragmentation");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("fractalValue");
      expect(result.data[0]).toHaveProperty("totalRevs");
    });
  });

  describe("coupling-based", () => {
    test("coupling", async () => {
      const result = await analyse.coupling(input);
      expect(result.metadata.analysisName).toBe("coupling");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("coupled");
      expect(result.data[0]).toHaveProperty("degree");
      expect(result.data[0]).toHaveProperty("averageRevs");
    });

    test("soc", async () => {
      const result = await analyse.soc(input);
      expect(result.metadata.analysisName).toBe("soc");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("soc");
    });
  });

  describe("communication", () => {
    test("communication", async () => {
      const result = await analyse.communication(input);
      expect(result.metadata.analysisName).toBe("communication");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("author");
      expect(result.data[0]).toHaveProperty("peer");
      expect(result.data[0]).toHaveProperty("shared");
      expect(result.data[0]).toHaveProperty("average");
      expect(result.data[0]).toHaveProperty("strength");
    });
  });

  describe("specialized-input", () => {
    test("age", async () => {
      const result = await analyse.age({ ...input, ageTimeNow: "2026-01-01" });
      expect(result.metadata.analysisName).toBe("age");
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0]).toHaveProperty("entity");
      expect(result.data[0]).toHaveProperty("ageMonths");
    });

    test("messages fails with CodeMaatError (git2 has no commit messages)", async () => {
      expect(analyse.messages({ ...input, expressionToMatch: "fix" })).rejects.toThrow();
    });
  });

  describe("output formats", () => {
    test("CSV output produces a string", async () => {
      const result = await analyse.revisions({ ...input, format: "csv" });
      expect(result.metadata.format).toBe("csv");
      expect(typeof result.data).toBe("string");
      expect((result.data as unknown as string).length).toBeGreaterThan(0);
    });
  });

  describe("error propagation", () => {
    test("non-existent log file rejects", async () => {
      expect(
        analyse.revisions({
          gitLogPath: "/nonexistent/path.log",
          vcsType: "git2",
        }),
      ).rejects.toThrow();
    });
  });
});
