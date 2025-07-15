import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { Behave } from "../src/behave";
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
    analysis.run.mockResolvedValue(expected_analysis_result);
    const options = analysis_options_factory.build();
    const behave = new Behave(analysis);

    const result = await behave.run_analysis(options);

    expect(analysis.run).toHaveBeenCalledWith(options);
    expect(result).toEqual(expected_analysis_result);
  });

  it.todo("should return an error when the analysis run rails");
});

describe("AnalysisOptions", () => {
  it.todo("should be defined");

  it.todo(
    "should throw an error when required analysis_type parameter is not provided"
  );

  it.todo(
    "should throw an error when required log_file parameter is not provided"
  );

  it.todo(
    "should throw an error when age analysis is selected but required age-time-now parameter is not provided"
  );

  it.todo(
    "should throw an error when message analysis is selected because it is not yet supported"
  );
});
