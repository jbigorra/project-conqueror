import type { ComplexityHotspot } from "@prj-conq/behave";
import { html } from "lit";
import { mapHotspotsToBubble, mapHotspotsToTreemap } from "../mappers/hotspots.mapper";
import { mapHotspotsToEnclosure } from "../mappers/hotspots-enclosure.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/bubble.visual";
import "../generic/enclosure.visual";
import "../generic/treemap.visual";

/**
 * Complexity hotspots chart as bubble, treemap, or zoomable enclosure diagram.
 *
 * @element pq-hotspots-chart
 * @attr {ComplexityHotspot[]} data - Inline complexity hotspot records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bubble"|"treemap"|"enclosure"} variant - Chart variant (default `"bubble"`).
 *
 * @example
 * ```html
 * <pq-hotspots-chart src="/api/analysis/hotspots" variant="enclosure"></pq-hotspots-chart>
 * ```
 */
export const PqHotspotsChart = defineDomainChart<ComplexityHotspot>({
  tag: "pq-hotspots-chart",
  defaultVariant: "bubble",
  variants: {
    bubble: (data, theme) =>
      html`<pq-bubble .data=${mapHotspotsToBubble(data)} .theme=${theme}></pq-bubble>`,
    enclosure: (data, theme) =>
      html`<pq-enclosure .data=${mapHotspotsToEnclosure(data)} .theme=${theme}></pq-enclosure>`,
    treemap: (data, theme) =>
      html`<pq-treemap .data=${mapHotspotsToTreemap(data)} .theme=${theme} show-labels></pq-treemap>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-hotspots-chart": InstanceType<typeof PqHotspotsChart>;
  }
}
