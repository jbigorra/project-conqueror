/**
 * Computes the arithmetic mean of an array of numbers.
 *
 * @param values - Non-empty array of numbers to average.
 * @returns The mean value. Returns `NaN` if `values` is empty.
 *
 * @example
 * average([1, 2, 3]); // 2
 * average([10, 20]);   // 15
 */
export function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Converts a ratio (0–1) to a percentage (0–100).
 *
 * @param value - A ratio in the range [0, 1].
 * @returns The equivalent percentage value.
 *
 * @example
 * asPercentage(0.25); // 25
 * asPercentage(1);    // 100
 */
export function asPercentage(value: number): number {
  return value * 100;
}

/**
 * Rounds a ratio to two decimal places (centi-float precision).
 *
 * Used throughout coupling analyses to normalize coupling percentages
 * to a consistent precision before comparison.
 *
 * @param value - Any floating-point number.
 * @returns The value rounded to 2 decimal places.
 *
 * @example
 * ratioCentiFloatPrecision(0.12345); // 0.12
 * ratioCentiFloatPrecision(0.999);   // 1
 */
export function ratioCentiFloatPrecision(value: number): number {
  return Math.round(value * 100) / 100;
}
