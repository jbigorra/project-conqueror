import { AnalysisOptions } from "@/behave/behave";
import { CLIResult } from "@/behave/dependencies/code_maat/cli/cli_result";
import { ICLIExecutor } from "@/behave/dependencies/interfaces";
import { AnalysisRunner } from "@/behave/runners/analysis_runner";
import { Result } from "@/lib/patterns";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { analysisOptionsFactory } from "../fixtures/factories/analysis_options_factory";

describe("AnalysisRunner", () => {
  it("should return an error when an cliExecutor fails to execute", async () => {
    const cliExecutor = mock<ICLIExecutor>();
    const errorMessage = "Failed to execute";
    cliExecutor.execute.mockResolvedValue(
      Result.error(new Error(errorMessage))
    );

    const analysisRunner = AnalysisRunner.create({ cliExecutor });
    const options = new AnalysisOptions(analysisOptionsFactory.build());

    const result = await analysisRunner.run(options);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe(errorMessage);
  });

  it("should call the cliExecutor with the correct arguments", async () => {
    const cliExecutor = mock<ICLIExecutor>();
    cliExecutor.execute.mockResolvedValue(
      Result.success(new CLIResult(0, "key1,key2\nvalue1,value2\n", ""))
    );

    const analysisRunner = AnalysisRunner.create({ cliExecutor });
    const options = new AnalysisOptions(
      analysisOptionsFactory.build({
        analysisType: "abs-churn",
      })
    );

    await analysisRunner.run(options);

    expect(cliExecutor.execute).toHaveBeenCalledWith({
      requiredArgs: [
        "--log",
        options.logFile,
        "--analysis",
        options.analysisType,
      ],
      optionalArgs: [
        "--temporal-period",
        options.temporalPeriod,
        "--rows",
        options.rows,
        "--min-revs",
        options.minRevs,
        "--min-shared-revs",
        options.minSharedRevs,
        "--min-coupling",
        options.minCoupling,
        "--max-coupling",
        options.maxCoupling,
        "--max-changeset-size",
        options.maxChangesetSize,
        "--expression-to-match",
        options.expressionToMatch,
        "--input-encoding",
        options.inputEncoding,
        "--group",
        options.group,
        "--team-map-file",
        options.teamMapFile,
      ],
      optionalBooleanArgs: [options.verboseResults],
    });
  });

  it("should return the data as a csv array of objects with key:value pairs when the cliExecutor succeeds", async () => {
    const cliExecutor = mock<ICLIExecutor>();
    cliExecutor.execute.mockResolvedValue(
      Result.success(new CLIResult(0, "key1,key2\nvalue1,value2\n", ""))
    );
    const analysisRunner = AnalysisRunner.create({ cliExecutor });
    const options = new AnalysisOptions(
      analysisOptionsFactory.build({
        analysisType: "abs-churn",
      })
    );

    const result = await analysisRunner.run(options);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).deep.equal([
      {
        key1: "value1",
        key2: "value2",
      },
    ]);
  });

  describe("AnalysisRunner.create", () => {
    it("should create an instance of AnalysisRunner", () => {
      const analysisRunner = AnalysisRunner.create({});
      expect(analysisRunner).toBeInstanceOf(AnalysisRunner);
    });
  });
});
