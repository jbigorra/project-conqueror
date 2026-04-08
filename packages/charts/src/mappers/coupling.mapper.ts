import type { Coupling } from "@prj-conq/behave";
import type { BubbleItem, RankedBarItem } from "../types";

/**
 * Map coupling records to bubble items (x=averageRevs, y=degree, r=degree).
 *
 * @param data - Coupling analysis records.
 * @returns Bubble items labelled as "entity<>coupled".
 *
 * @example
 * ```ts
 * const items = mapCouplingToBubble(couplingRecords);
 * ```
 */
export function mapCouplingToBubble(data: Coupling[]): BubbleItem[] {
  return data.map((r) => ({
    label: `${r.entity}↔${r.coupled}`,
    x: r.averageRevs,
    y: r.degree,
    r: r.degree,
  }));
}

/**
 * Map coupling records to ranked bar items by coupling degree.
 *
 * @param data - Coupling analysis records.
 * @returns Bar items labelled as "entity<>coupled" with degree as value.
 *
 * @example
 * ```ts
 * const items = mapCouplingToBar(couplingRecords);
 * ```
 */
export function mapCouplingToBar(data: Coupling[]): RankedBarItem[] {
  return data.map((r) => ({ label: `${r.entity}↔${r.coupled}`, value: r.degree }));
}
