import type { Coupling } from "@prj-conq/behave";
import type { BubbleItem, RankedBarItem } from "../types";

export function mapCouplingToBubble(data: Coupling[]): BubbleItem[] {
  return data.map((r) => ({
    label: `${r.entity}↔${r.coupled}`,
    x: r.averageRevs,
    y: r.degree,
    r: r.degree,
  }));
}

export function mapCouplingToBar(data: Coupling[]): RankedBarItem[] {
  return data.map((r) => ({ label: `${r.entity}↔${r.coupled}`, value: r.degree }));
}
