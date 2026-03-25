import type { Communication } from "@prj-conq/behave";
import type { BubbleItem, RankedBarItem } from "../types";

export function mapCommunicationToBubble(data: Communication[]): BubbleItem[] {
  return data.map((r) => ({
    label: `${r.author}↔${r.peer}`,
    x: r.shared,
    y: r.average,
    r: r.strength,
  }));
}

export function mapCommunicationToBar(data: Communication[]): RankedBarItem[] {
  return data.map((r) => ({ label: `${r.author}↔${r.peer}`, value: r.strength }));
}
