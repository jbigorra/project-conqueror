import type { AbsChurn, AuthorChurn, EntityChurn } from "@prj-conq/behave";
import type { LineAreaPoint, GroupedBarItem, StackedBarItem } from "../types";

export function mapAbsChurnToLineArea(data: AbsChurn[]): LineAreaPoint[] {
  return data.map((r) => ({
    x: r.date,
    series: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
    ],
  }));
}

export function mapAuthorChurnToGrouped(data: AuthorChurn[]): GroupedBarItem[] {
  return data.map((r) => ({
    label: r.author,
    groups: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}

export function mapAuthorChurnToStacked(data: AuthorChurn[]): StackedBarItem[] {
  return data.map((r) => ({
    label: r.author,
    segments: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}

export function mapEntityChurnToGrouped(data: EntityChurn[]): GroupedBarItem[] {
  return data.map((r) => ({
    label: r.entity,
    groups: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}

export function mapEntityChurnToStacked(data: EntityChurn[]): StackedBarItem[] {
  return data.map((r) => ({
    label: r.entity,
    segments: [
      { key: "added", value: r.added },
      { key: "deleted", value: r.deleted },
      { key: "commits", value: r.commits },
    ],
  }));
}
