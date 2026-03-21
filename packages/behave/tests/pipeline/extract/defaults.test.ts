import { describe, expect, test } from "bun:test";
import { withDefaults } from "../../../src/pipeline/extract/defaults";

describe("withDefaults", () => {
	test("returns all defaults when no options provided", () => {
		const result = withDefaults();
		expect(result).toEqual({
			minRevs: 5,
			minSharedRevs: 5,
			minCoupling: 30,
			maxCoupling: 100,
			maxChangesetSize: 30,
		});
	});
	test("overrides specific fields while keeping defaults", () => {
		const result = withDefaults({ minRevs: 10 });
		expect(result.minRevs).toBe(10);
		expect(result.minSharedRevs).toBe(5);
	});
	test("overrides all fields", () => {
		const result = withDefaults({
			minRevs: 1,
			minSharedRevs: 1,
			minCoupling: 0,
			maxCoupling: 50,
			maxChangesetSize: 100,
		});
		expect(result.minRevs).toBe(1);
		expect(result.maxCoupling).toBe(50);
	});
});
