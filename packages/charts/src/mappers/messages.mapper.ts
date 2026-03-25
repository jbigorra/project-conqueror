import type { MessageEntry } from "@prj-conq/behave";
import type { RankedBarItem } from "../types";

export function mapMessagesToBar(data: MessageEntry[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.matches }));
}
