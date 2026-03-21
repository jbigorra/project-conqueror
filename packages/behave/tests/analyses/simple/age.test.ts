import { describe, expect, test } from "bun:test";
import { Effect, Layer } from "effect";
import { ageEffect } from "../../../src/analyses/simple/age";
import { CodeMaatService } from "../../../src/services/code-maat";

describe("age analysis", () => {
	const cannedData = [{ entity: "foo.ts", ageMonths: 6 }];
	const TestLayer = Layer.succeed(CodeMaatService, {
		runAnalysis: () => Effect.succeed(cannedData),
	});

	test("returns Analysis with JSON data by default", async () => {
		const result = await Effect.runPromise(
			ageEffect({ gitLogPath: "/path/log", ageTimeNow: "2026-01-01" }).pipe(
				Effect.provide(TestLayer),
			),
		);
		expect(result.metadata.analysisName).toBe("age");
		expect(result.metadata.format).toBe("json");
		expect(result.data).toEqual(cannedData);
	});

	test("returns Analysis with CSV data when format=csv", async () => {
		const result = await Effect.runPromise(
			ageEffect({
				gitLogPath: "/path/log",
				ageTimeNow: "2026-01-01",
				format: "csv",
			}).pipe(Effect.provide(TestLayer)),
		);
		expect(result.metadata.format).toBe("csv");
		expect(typeof result.data).toBe("string");
	});

	test("passes options through to CodeMaatService", async () => {
		let capturedOptions: unknown;
		const SpyLayer = Layer.succeed(CodeMaatService, {
			runAnalysis: (_path, opts) => {
				capturedOptions = opts;
				return Effect.succeed(cannedData);
			},
		});
		await Effect.runPromise(
			ageEffect({
				gitLogPath: "/path/log",
				ageTimeNow: "2026-01-01",
				vcsType: "git2",
			}).pipe(Effect.provide(SpyLayer)),
		);
		expect(capturedOptions).toEqual(
			expect.objectContaining({ analysis: "age", versionControl: "git2" }),
		);
	});

	test("fails when ageTimeNow is not provided", async () => {
		const result = await Effect.runPromise(
			ageEffect({ gitLogPath: "/path/log" }).pipe(
				Effect.provide(TestLayer),
				Effect.flip,
			),
		);
		expect(result._tag).toBe("FormatError");
		expect((result as { message: string }).message).toContain("ageTimeNow");
	});
});
