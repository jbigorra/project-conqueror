import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { ICLIExecutor } from "../../src/dependencies/interfaces";
import { AnalysisRunner } from "../../src/runners/analysis_runner";
import { analysis_options_factory } from "../fixtures/factories/analysis_options_factory";

describe("AnalysisRunner", () => {
  it.todo(
    "should return an error when an analysis strategy fails to execute",
    async () => {
      const cli_executor = mock<ICLIExecutor>();
      const analysisRunner = new AnalysisRunner(cli_executor);
      const options = analysis_options_factory.build();

      const result = await analysisRunner.run(options);

      expect(result).toEqual({
        data: undefined,
        error: expect.any(Error),
      });
    }
  );

  it("should call the cli_executor with the correct arguments", async () => {
    const cli_executor = mock<ICLIExecutor>();
    const analysisRunner = new AnalysisRunner(cli_executor);
    const options = analysis_options_factory.build({
      analysis_type: "abs-churn",
    });

    await analysisRunner.run(options);

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
