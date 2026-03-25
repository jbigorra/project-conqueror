import type { CodeAge } from "@prj-conq/behave";
import type { RankedBarItem } from "../types";

export function mapAgeToHistogram(data: CodeAge[]): number[] {
  return data.map((r) => r.ageMonths);
}

export function mapAgeToBar(data: CodeAge[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.ageMonths }));
}
