import type { Fragmentation } from "@prj-conq/behave";
import type { RankedBarItem, DoughnutItem } from "../types";

export function mapFragmentationToBar(data: Fragmentation[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.fractalValue }));
}

export function mapFragmentationToDoughnut(data: Fragmentation[]): DoughnutItem[] {
  return data.map((r) => ({ label: r.entity, value: r.fractalValue }));
}
