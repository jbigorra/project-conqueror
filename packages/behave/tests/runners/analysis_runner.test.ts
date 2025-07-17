import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { ICLIExecutor, TCLIResult } from "../../src/dependencies/interfaces";
import { AnalysisRunner } from "../../src/runners/analysis_runner";
import { analysis_options_factory } from "../fixtures/factories/analysis_options_factory";

describe("AnalysisRunner", () => {
  it("should return an error when an cli_executor fails to execute", async () => {
    const cli_executor = mock<ICLIExecutor>();
    const error_message = "Failed to execute";
    cli_executor.execute.mockResolvedValue({
      error_message: () => error_message,
      is_failure: () => true,
    } as TCLIResult);

    const analysis_runner = new AnalysisRunner(cli_executor);
    const options = analysis_options_factory.build();

    const { data, error } = await analysis_runner.run(options);

    expect(data).toBeUndefined();
    expect(error).toBeInstanceOf(Error);
    expect(error!.message).toBe(error_message);
  });

  it("should call the cli_executor with the correct arguments", async () => {
    const cli_executor = mock<ICLIExecutor>();
    cli_executor.execute.mockResolvedValue({
      is_failure: () => false,
    } as TCLIResult);

    const analysis_runner = new AnalysisRunner(cli_executor);
    const options = analysis_options_factory.build({
      analysis_type: "abs-churn",
    });

    await analysis_runner.run(options);

    expect(cli_executor.execute).toHaveBeenCalledWith({
      required_args: [
        "--log",
        options.log_file,
        "--analysis",
        options.analysis_type,
      ],
      optional_args: [
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
      optional_boolean_args: [options.verbose_results],
    });
  });
});
