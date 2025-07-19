import { AnalysisOptions } from "@/behave/behave";
import { ICLIExecutor, TCLIResult } from "@/behave/dependencies/interfaces";
import { AnalysisRunner } from "@/behave/runners/analysis_runner";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { analysis_options_factory } from "../fixtures/factories/analysis_options_factory";

describe("AnalysisRunner", () => {
  it("should return an error when an cli_executor fails to execute", async () => {
    const cliExecutor = mock<ICLIExecutor>();
    const error_message = "Failed to execute";
    cliExecutor.execute.mockResolvedValue({
      errorMessage: () => error_message,
      isFailure: () => true,
    } as TCLIResult);

    const analysis_runner = AnalysisRunner.create({ cliExecutor });
    const options = new AnalysisOptions(analysis_options_factory.build());

    const result = await analysis_runner.run(options);

    expect(result.isError()).toBe(true);
    expect(result.getError().message).toBe(error_message);
  });

  it("should call the cli_executor with the correct arguments", async () => {
    const cliExecutor = mock<ICLIExecutor>();
    cliExecutor.execute.mockResolvedValue({
      stdout: "key1,key2\nvalue1,value2\n",
      isFailure: () => false,
    } as TCLIResult);

    const analysis_runner = AnalysisRunner.create({ cliExecutor });
    const options = new AnalysisOptions(
      analysis_options_factory.build({
        analysis_type: "abs-churn",
      })
    );

    await analysis_runner.run(options);

    expect(cliExecutor.execute).toHaveBeenCalledWith({
      requiredArgs: [
        "--log",
        options.log_file,
        "--analysis",
        options.analysis_type,
      ],
      optionalArgs: [
        "--temporal-period",
        options.temporal_period,
        "--rows",
        options.rows,
        "--min-revs",
        options.min_revs,
        "--min-shared-revs",
        options.min_shared_revs,
        "--min-coupling",
        options.min_coupling,
        "--max-coupling",
        options.max_coupling,
        "--max-changeset-size",
        options.max_changeset_size,
        "--expression-to-match",
        options.expression_to_match,
        "--input-encoding",
        options.input_encoding,
        "--group",
        options.group,
        "--team-map-file",
        options.team_map_file,
      ],
      optionalBooleanArgs: [options.verbose_results],
    });
  });

  it("should return the data as a csv object with key:value pairs when the cli_executor succeeds", async () => {
    const cliExecutor = mock<ICLIExecutor>();
    cliExecutor.execute.mockResolvedValue({
      stdout: "key1,key2\nvalue1,value2\n",
      isFailure: () => false,
    } as TCLIResult);
    const analysis_runner = AnalysisRunner.create({ cliExecutor });
    const options = new AnalysisOptions(
      analysis_options_factory.build({
        analysis_type: "abs-churn",
      })
    );

    const result = await analysis_runner.run(options);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).deep.equal([
      {
        key1: "value1",
        key2: "value2",
      },
    ]);
  });
});
