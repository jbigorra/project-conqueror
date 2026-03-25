import type { Author } from "@prj-conq/behave";
import type { RankedBarItem, TreemapItem } from "../types";

export function mapAuthorsToBar(data: Author[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.nAuthors }));
}

export function mapAuthorsToTreemap(data: Author[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.nRevs, color: r.nAuthors }));
}
