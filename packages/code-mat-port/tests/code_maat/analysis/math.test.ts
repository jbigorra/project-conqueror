import { describe, test, expect } from "bun:test";
import { ratioCentiFloatPrecision } from "../../../src/code_maat/analysis/math";

describe("math", () => {
  test("ratio to centi float precision", () => {
    expect(ratioCentiFloatPrecision(1.0)).toBe(1.0);
    expect(ratioCentiFloatPrecision(0.5)).toBe(0.5);
    expect(ratioCentiFloatPrecision(2 / 3)).toBe(0.67);
    expect(ratioCentiFloatPrecision(5 / 6)).toBe(0.83);
  });
});
