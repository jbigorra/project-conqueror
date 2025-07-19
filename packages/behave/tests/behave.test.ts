import { AnalysisOptions, Behave } from "@/behave/behave";
import { IAnalysisRunner } from "@/behave/runners/analysis_runner";
import { Result } from "@/lib/patterns";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { analysis_options_factory } from "./fixtures/factories/analysis_options_factory";

describe("behave", () => {
  it("should return the analysis result", async () => {
    const analysis = mock<IAnalysisRunner>();
    const expected_analysis_result = [
      {
        csv: "1",
        analysis: "2",
        result: "3",
      },
    ];
    analysis.run.mockResolvedValue(Result.success(expected_analysis_result));
    const options = new AnalysisOptions(analysis_options_factory.build());
    const behave = new Behave(analysis);

    const result = await behave.run_analysis(options);

    expect(analysis.run).toHaveBeenCalledWith(options);
    expect(result).toEqual(expected_analysis_result);
  });

  it("should return an error when the analysis run fails", async () => {
    const analysis = mock<IAnalysisRunner>();
    const expected_error = new Error("Analysis failed");
    analysis.run.mockResolvedValue(Result.error(expected_error));
    const options = new AnalysisOptions(analysis_options_factory.build());
    const behave = new Behave(analysis);

    const result = await behave.run_analysis(options);

    expect(result).toEqual(expected_error);
  });
});

describe("AnalysisOptions", () => {
  it("should be defined", () => {
    const options = analysis_options_factory.build();

    const analysis_options = new AnalysisOptions(options);

    expect(analysis_options).toBeDefined();
  });

  it("should default 'verbose_results' to empty string", () => {
    const options = analysis_options_factory.build({
      verbose_results: undefined,
    });

    const analysis_options = new AnalysisOptions(options);

    expect(analysis_options.verbose_results).toBe("");
  });

  it("should throw an error when required 'analysis_type' parameter is not provided", () => {
    const options = { log_file: "some/path/to/logfile.log" } as any;

    expect(() => new AnalysisOptions(options)).toThrowError(/analysis_type/);
  });

  it("should throw an error when required 'log_file' parameter is not provided", () => {
    const options = { analysis_type: "age" as const } as any;

    expect(() => new AnalysisOptions(options)).toThrowError(/log_file/);
  });

  it("should throw an error when 'age' analysis is selected but required 'age_time_now' parameter is not provided", () => {
    const options = {
      analysis_type: "age" as const,
      log_file: "some/path/to/logfile.log",
    };

    expect(() => new AnalysisOptions(options as any)).toThrowError(
      /age_time_now/
    );
  });

  it("should throw an error when 'message' analysis is selected because it is not yet supported", () => {
    const options = {
      analysis_type: "message" as const,
      log_file: "some/path/to/logfile.log",
    };

    expect(() => new AnalysisOptions(options)).toThrowError(
      /not yet supported/
    );
  });
});
