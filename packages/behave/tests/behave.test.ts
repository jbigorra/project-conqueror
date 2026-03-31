import { describe, expect, it } from "bun:test";
import { Result } from "@prj-conq/lib/patterns";
import { mockFn } from "bun-automock";
import { AnalysisOptions, Behave } from "#behave/behave.ts";
import type { IAnalysisRunner } from "#behave/runners/analysis_runner.js";
import { analysisOptionsFactory } from "./fixtures/factories/analysis_options_factory";

describe("behave", () => {
  it("should return the analysis result", async () => {
    const analysis = mockFn<IAnalysisRunner>();
    const expectedAnalysisResult = [
      {
        csv: "1",
        analysis: "2",
        result: "3",
      },
    ];
    analysis.run.mockResolvedValue(Result.success(expectedAnalysisResult));
    const options = new AnalysisOptions(analysisOptionsFactory.build());
    const behave = new Behave(analysis);

    const result = await behave.runAnalysis(options);

    expect(analysis.run.spy()).toHaveBeenCalledWith(options);
    expect(result).toEqual(expectedAnalysisResult);
  });

  it("should return an error when the analysis run fails", async () => {
    const analysis = mockFn<IAnalysisRunner>();
    const expectedError = new Error("Analysis failed");
    analysis.run.mockResolvedValue(Result.error(expectedError));
    const options = new AnalysisOptions(analysisOptionsFactory.build());
    const behave = new Behave(analysis);

    const result = await behave.runAnalysis(options);

    expect(result).toEqual(expectedError);
  });
});

describe("AnalysisOptions", () => {
  it("should be defined", () => {
    const options = analysisOptionsFactory.build();

    const analysisOptions = new AnalysisOptions(options);

    expect(analysisOptions).toBeDefined();
  });

  it("should default 'verboseResults' to empty string", () => {
    const options = analysisOptionsFactory.build({
      verboseResults: undefined,
    });

    const analysisOptions = new AnalysisOptions(options);

    expect(analysisOptions.verboseResults).toBe("");
  });

  it("should throw an error when required 'analysisType' parameter is not provided", () => {
    const options = { logFile: "some/path/to/logfile.log" };

    // @ts-expect-error
    expect(() => new AnalysisOptions(options)).toThrowError(/analysisType/);
  });

  it("should throw an error when required 'logFile' parameter is not provided", () => {
    const options = { analysisType: "age" };

    // @ts-expect-error
    expect(() => new AnalysisOptions(options)).toThrowError(/logFile/);
  });

  it("should throw an error when 'age' analysis is selected but required 'ageTimeNow' parameter is not provided", () => {
    const options = {
      analysisType: "age" as const,
      logFile: "some/path/to/logfile.log",
    };

    expect(() => new AnalysisOptions(options)).toThrowError(/ageTimeNow/);
  });

  it("should throw an error when 'message' analysis is selected because it is not yet supported", () => {
    const options = {
      analysisType: "message" as const,
      logFile: "some/path/to/logfile.log",
    };

    expect(() => new AnalysisOptions(options)).toThrowError(/not yet supported/);
  });
});
