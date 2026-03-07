export function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function asPercentage(value: number): number {
  return value * 100;
}

export function ratioCentiFloatPrecision(value: number): number {
  return Math.round(value * 100) / 100;
}
