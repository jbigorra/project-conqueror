import type { MainDev, RefactoringMainDev } from "@prj-conq/behave";
import type { RankedBarItem, TreemapItem } from "../types";

/**
 * Map main developer records to ranked bar items (ownership as percentage).
 *
 * @param data - Main developer analysis records.
 * @returns Bar items with entity as label and ownership percentage as value.
 *
 * @example
 * ```ts
 * const items = mapMainDevToBar(mainDevRecords);
 * // [{ label: "src/app.ts", value: 85 }, ...]
 * ```
 */
export function mapMainDevToBar(data: MainDev[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.ownership * 100 }));
}

/**
 * Map main developer records to treemap items (ownership as percentage).
 *
 * @param data - Main developer analysis records.
 * @returns Treemap items with path hierarchy and ownership percentage as value.
 *
 * @example
 * ```ts
 * const items = mapMainDevToTreemap(mainDevRecords);
 * ```
 */
export function mapMainDevToTreemap(data: MainDev[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.ownership * 100 }));
}

/**
 * Map refactoring main developer records to ranked bar items (ownership as percentage).
 *
 * @param data - Refactoring main developer records.
 * @returns Bar items with entity as label and ownership percentage as value.
 *
 * @example
 * ```ts
 * const items = mapRefactoringDevToBar(refactoringDevRecords);
 * ```
 */
export function mapRefactoringDevToBar(data: RefactoringMainDev[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.ownership * 100 }));
}

/**
 * Map refactoring main developer records to treemap items (ownership as percentage).
 *
 * @param data - Refactoring main developer records.
 * @returns Treemap items with path hierarchy and ownership percentage as value.
 *
 * @example
 * ```ts
 * const items = mapRefactoringDevToTreemap(refactoringDevRecords);
 * ```
 */
export function mapRefactoringDevToTreemap(data: RefactoringMainDev[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.ownership * 100 }));
}
