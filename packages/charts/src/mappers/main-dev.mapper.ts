import type { MainDev, RefactoringMainDev } from "@prj-conq/behave";
import type { RankedBarItem, TreemapItem } from "../types";

export function mapMainDevToBar(data: MainDev[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.ownership * 100 }));
}

export function mapMainDevToTreemap(data: MainDev[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.ownership * 100 }));
}

export function mapRefactoringDevToBar(data: RefactoringMainDev[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.ownership * 100 }));
}

export function mapRefactoringDevToTreemap(data: RefactoringMainDev[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.ownership * 100 }));
}
