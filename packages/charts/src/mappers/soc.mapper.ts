import type { Soc } from "@prj-conq/behave";
import type { RankedBarItem } from "../types";

export function mapSocToBar(data: Soc[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.soc }));
}
