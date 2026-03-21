import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { toAnalysis } from "../../../src/pipeline/load/to-analysis";

describe("toAnalysis", () => {
	test("wraps data in JSON analysis by default", async () => {
		const data = [{ entity: "foo.ts", nRevs: 10 }];
		const result = await Effect.runPromise(toAnalysis("revisions", data, {}));
		expect(result.metadata.analysisName).toBe("revisions");
		expect(result.metadata.format).toBe("json");
		expect(result.data).toEqual(data);
	});
	test("wraps data as CSV string when format is csv", async () => {
		const data = [{ entity: "foo.ts", nRevs: 10 }];
		const result = await Effect.runPromise(
			toAnalysis("revisions", data, { format: "csv" }),
		);
		expect(result.metadata.format).toBe("csv");
		expect(typeof result.data).toBe("string");
		expect(result.data as string).toContain("entity,nRevs");
	});
	test("extracts parameters stripping format field", async () => {
		const data = [{ entity: "foo.ts", nRevs: 10 }];
		const input = { format: "json" as const, minRevs: 5, gitLogPath: "/log" };
		const result = await Effect.runPromise(
			toAnalysis("revisions", data, input),
		);
		expect(result.metadata.parameters).not.toHaveProperty("format");
		expect(result.metadata.parameters).toEqual({
			minRevs: 5,
			gitLogPath: "/log",
		});
	});
	test("metadata includes timestamp", async () => {
		const data = [{ entity: "x.ts", nRevs: 1 }];
		const result = await Effect.runPromise(toAnalysis("revisions", data, {}));
		expect(result.metadata.timestamp).toBeInstanceOf(Date);
	});
});
