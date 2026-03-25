import { describe, expect, it } from "bun:test";
import { binValues } from "../../src/mappers/histogram.mapper";

describe("binValues", () => {
  it("returns empty array for empty values", () => {
    expect(binValues([], 5)).toEqual([]);
  });

  it("creates equal-width bins from numeric bin count", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = binValues(values, 2);
    expect(result).toHaveLength(2);
  });

  it("places values in the correct equal-width bins", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = binValues(values, 2);
    // min=1, max=10, step=4.5, boundaries = [1, 6, 10] (rounded)
    // bin 0: 1-6 => values < 6: [1,2,3,4,5] = 5
    // bin 1: 6-10 => values >= 6 and < 10: [6,7,8,9] = 4
    expect(result[0]?.value).toBe(5);
    expect(result[1]?.value).toBe(4);
  });

  it("generates correct labels for equal-width bins", () => {
    const values = [0, 10, 20, 30];
    const result = binValues(values, 2);
    // min=0, max=30, step=15, boundaries = [0, 15, 30]
    expect(result[0]?.label).toBe("0-15");
    expect(result[1]?.label).toBe("15-30");
  });

  it("uses custom boundary array when provided", () => {
    const values = [1, 5, 10, 20, 50, 100];
    const result = binValues(values, [0, 10, 50, 100]);
    expect(result).toHaveLength(3);
    // bin 0-10: [1, 5] = 2
    expect(result[0]?.value).toBe(2);
    // bin 10-50: [10, 20] = 2
    expect(result[1]?.value).toBe(2);
    // bin 50-100: [50] = 1
    expect(result[2]?.value).toBe(1);
  });

  it("generates correct labels for custom boundaries", () => {
    const values = [1, 5, 10, 20, 50, 100];
    const result = binValues(values, [0, 10, 50, 100]);
    expect(result[0]?.label).toBe("0-10");
    expect(result[1]?.label).toBe("10-50");
    expect(result[2]?.label).toBe("50-100");
  });

  it("creates the correct number of bins for bin count 5", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = binValues(values, 5);
    expect(result).toHaveLength(5);
  });

  it("counts values inclusively at the lower boundary", () => {
    // v >= low && v < high
    const values = [0, 5, 10];
    const result = binValues(values, [0, 5, 10]);
    // bin 0-5: [0] = 1
    expect(result[0]?.value).toBe(1);
    // bin 5-10: [5] = 1  (10 is excluded from last bin since < high)
    expect(result[1]?.value).toBe(1);
  });
});
