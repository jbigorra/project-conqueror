import { describe, expect, test } from "bun:test";
import { extractParameters } from "../../../src/pipeline/load/extract-parameters";

describe("extractParameters", () => {
	test("strips format field from input", () => {
		const input = { format: "json", minRevs: 5, analysisName: "revisions" };
		const result = extractParameters(input);
		expect(result).not.toHaveProperty("format");
		expect(result).toEqual({ minRevs: 5, analysisName: "revisions" });
	});
	test("returns all fields except format", () => {
		const input = { format: "csv", a: 1, b: "hello", c: true };
		const result = extractParameters(input);
		expect(result).toEqual({ a: 1, b: "hello", c: true });
	});
	test("returns unchanged object when format is absent", () => {
		const input = { minRevs: 5, maxCoupling: 100 };
		const result = extractParameters(input);
		expect(result).toEqual({ minRevs: 5, maxCoupling: 100 });
	});
});
