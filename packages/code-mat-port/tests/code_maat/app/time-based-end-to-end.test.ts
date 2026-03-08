import { describe, expect, it } from "bun:test";
import { runAnalysis } from "../../../src/code_maat/app/app";

/**
 * End-to-end tests to simulate a time-based analysis.
 *
 * The test data contains two commits done the same day.
 * With the default options we'll treat them as separate.
 * In a time-based analysis we consider them as a logical
 * part of the same work.
 */

const LOG_FILE =
  "/Users/jbigorra/Projects/project-conqueror.worktrees/master/packages/code-mat-port/tmp/code-maat/test/code_maat/app/day_coupled_entities_git.txt";

const CSV_OPTIONS = {
  versionControl: "git",
  analysis: "coupling",
  minRevs: 1,
  minSharedRevs: 1,
  minCoupling: 10,
  maxCoupling: 100,
  maxChangesetSize: 10,
};

const CSV_OPTIONS_FOR_TIME_BASED = {
  ...CSV_OPTIONS,
  temporalPeriod: "1",
};

const OPTIONS_WITH_INVALID_TIME_PERIOD = {
  ...CSV_OPTIONS,
  temporalPeriod: "not a number",
};

describe("time-based end-to-end", () => {
  it("only calculates coupling within same commit by default", async () => {
    const result = await runAnalysis(LOG_FILE, CSV_OPTIONS);
    expect(result).toEqual([
      {
        entity: "/Infrastrucure/Network/Connection.cs",
        coupled: "/Presentation/Status/ClientPresenter.cs",
        degree: 100,
        averageRevs: 1,
      },
    ]);
  });

  it("calculates coupling within same day when temporal-period=1", async () => {
    const result = await runAnalysis(LOG_FILE, CSV_OPTIONS_FOR_TIME_BASED);
    expect(result).toEqual([
      {
        entity: "/Infrastrucure/Network/Connection.cs",
        coupled: "/Presentation/Status/ClientPresenter.cs",
        degree: 100,
        averageRevs: 1,
      },
      {
        entity: "/Infrastrucure/Network/Connection.cs",
        coupled: "/Infrastrucure/Network/TcpConnection.cs",
        degree: 100,
        averageRevs: 1,
      },
      {
        entity: "/Infrastrucure/Network/TcpConnection.cs",
        coupled: "/Presentation/Status/ClientPresenter.cs",
        degree: 100,
        averageRevs: 1,
      },
    ]);
  });

  it("throws on unsupported time periods", async () => {
    await expect(runAnalysis(LOG_FILE, OPTIONS_WITH_INVALID_TIME_PERIOD)).rejects.toThrow();
  });
});
