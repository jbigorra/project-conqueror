import { describe, expect, test } from "bun:test";
import { Schema } from "effect";
import { LizardMetricsSchema } from "../../src/schemas/lizard";

describe("LizardMetricsSchema", () => {
	test("decodes valid lizard record", () => {
		const raw = [
			{
				nloc: "5",
				cyclomatic_complexity: "3",
				token_count: "43",
				parameters: "1",
				length: "5",
				location: "constructor@12-16@foo.ts",
				file: "/path/foo.ts",
				function: "constructor",
				long_name: "constructor(args)",
				start_line: "12",
				end_line: "16",
			},
		];
		const result = Schema.decodeUnknownSync(LizardMetricsSchema)(raw);
		expect(result).toHaveLength(1);
		expect(result[0].cyclomaticComplexity).toBe(3);
		expect(result[0].file).toBe("/path/foo.ts");
		expect(result[0].nloc).toBe(5);
	});

	test("rejects record with missing fields", () => {
		const raw = [{ nloc: "5" }];
		expect(() => Schema.decodeUnknownSync(LizardMetricsSchema)(raw)).toThrow();
	});
});
