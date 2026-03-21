import { describe, expect, test } from "bun:test";
import { Effect } from "effect";
import { toCsv } from "../../../src/pipeline/load/format";

describe("toCsv", () => {
	test("converts array of records to CSV string", async () => {
		const data = [
			{ entity: "foo.ts", nRevs: 10 },
			{ entity: "bar.ts", nRevs: 5 },
		];
		const result = await Effect.runPromise(toCsv(data));
		expect(result).toContain("entity,nRevs");
		expect(result).toContain("foo.ts,10");
		expect(result).toContain("bar.ts,5");
	});
	test("escapes commas in field values", async () => {
		const data = [{ entity: "src/foo, bar.ts", nRevs: 3 }];
		const result = await Effect.runPromise(toCsv(data));
		expect(result).toContain('"src/foo, bar.ts"');
	});
	test("fails with FormatError for empty array", async () => {
		const result = await Effect.runPromiseExit(toCsv([]));
		expect(result._tag).toBe("Failure");
	});
});
