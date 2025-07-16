import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { AnalysisOptions, Behave } from "../src/behave";
import { IAnalysisRunner } from "../src/runners/analysis_runner";
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
    analysis.run.mockResolvedValue({
      data: expected_analysis_result,
      error: undefined,
    });
    const options = analysis_options_factory.build();
    const behave = new Behave(analysis);

    const result = await behave.run_analysis(options);

    expect(analysis.run).toHaveBeenCalledWith(options);
    expect(result).toEqual({
      data: expected_analysis_result,
      error: undefined,
    });
  });

  it("should return an error when the analysis run fails", async () => {
    const analysis = mock<IAnalysisRunner>();
    const expected_error = new Error("Analysis failed");
    analysis.run.mockResolvedValue({
      data: undefined,
      error: expected_error,
    });
    const options = analysis_options_factory.build();
    const behave = new Behave(analysis);

    const result = await behave.run_analysis(options);

    expect(result).toEqual({
      data: undefined,
      error: expected_error,
    });
  });
});

describe("AnalysisOptions", () => {
  it("should be defined", () => {
    const options = analysis_options_factory.build();

    const analysis_options = new AnalysisOptions(options);

    expect(analysis_options).toMatchObject(options);
  });

  it("should default 'verbose_results' to false", () => {
    const { verbose_results, ...options } = analysis_options_factory.build();

    const analysis_options = new AnalysisOptions(options);

    expect(analysis_options.verbose_results).toBe(false);
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
