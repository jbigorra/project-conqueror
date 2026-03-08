import type { VCSEntry } from "../types";
import { all as allEntities, allRevisions } from "./entities";
import { all as allAuthors } from "./authors";

export type SummaryRow = { statistic: string; value: number };

export function overview(entries: VCSEntry[]): SummaryRow[] {
  return [
    { statistic: "number-of-commits", value: allRevisions(entries).length },
    { statistic: "number-of-entities", value: allEntities(entries).length },
    { statistic: "number-of-entities-changed", value: entries.length },
    { statistic: "number-of-authors", value: allAuthors(entries).size },
  ];
}
