import { describe, expect, test } from "bun:test";
import type {
	ComplexityHotspotsInput,
	OutputFormat,
	SimpleAnalysisInput,
} from "../src/types";

describe("types", () => {
	test("OutputFormat accepts json and csv", () => {
		const json: OutputFormat = "json";
		const csv: OutputFormat = "csv";
		expect(json).toBe("json");
		expect(csv).toBe("csv");
	});

	test("SimpleAnalysisInput requires gitLogPath", () => {
		const input: SimpleAnalysisInput = {
			gitLogPath: "/path/to/git.log",
		};
		expect(input.gitLogPath).toBe("/path/to/git.log");
		expect(input.format).toBeUndefined();
		expect(input.vcsType).toBeUndefined();
		expect(input.options).toBeUndefined();
	});

	test("SimpleAnalysisInput accepts all optional fields", () => {
		const input: SimpleAnalysisInput = {
			gitLogPath: "/path/to/git.log",
			vcsType: "git2",
			format: "csv",
			options: { minRevs: 10 },
			ageTimeNow: "2026-03-20",
			expressionToMatch: "fix.*",
			group: "group-spec",
			teamMapFile: "/path/to/teams.csv",
			temporalPeriod: "30",
		};
		expect(input.ageTimeNow).toBe("2026-03-20");
	});

	test("ComplexityHotspotsInput requires gitLogPath and sourceDir", () => {
		const input: ComplexityHotspotsInput = {
			gitLogPath: "/path/to/git.log",
			sourceDir: "/path/to/source",
		};
		expect(input.gitLogPath).toBe("/path/to/git.log");
		expect(input.sourceDir).toBe("/path/to/source");
	});
});
