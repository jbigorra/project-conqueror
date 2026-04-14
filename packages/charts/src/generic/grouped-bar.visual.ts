import type { ChartConfiguration } from "chart.js";
import { buildGroupedDatasets } from "../mappers/grouped-bar.mapper";
import type { GroupedBarItem } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Grouped bar chart web component backed by Chart.js.
 *
 * @element pq-grouped-bar
 * @attr {GroupedBarItem[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} limit - Max items to display (0 = unlimited).
 * @attr {boolean} horizontal - Render bars horizontally (default `false`).
 * @attr {boolean} show-legend - Show the Chart.js legend (default `true`).
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bar is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-grouped-bar
 *   .data=${[{ label: "Alice", groups: [{ key: "added", value: 50 }, { key: "deleted", value: 10 }] }]}
 *   theme="dark"
 *   show-legend
 * ></pq-grouped-bar>
 * ```
 */
export const PqGroupedBar = defineGenericChart<
  GroupedBarItem,
  { limit: number; horizontal: boolean; showLegend: boolean }
>({
  tag: "pq-grouped-bar",
  properties: {
    limit: { type: Number },
    horizontal: { type: Boolean },
    showLegend: { type: Boolean, attribute: "show-legend" },
  },
  defaults: { limit: 0, horizontal: false, showLegend: true },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const sliced = props.limit > 0 ? resolved.slice(0, props.limit) : resolved;
    const { labels, datasets } = buildGroupedDatasets(sliced);
    const themePlugins = themeCtrl.options.plugins;
    const themeScales = themeCtrl.options.scales;

    return {
      type: "bar",
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: themeCtrl.colors[i % themeCtrl.colors.length],
          borderColor: themeCtrl.colors[i % themeCtrl.colors.length],
          borderWidth: 1,
        })),
      },
      options: {
        indexAxis: props.horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: props.showLegend },
        },
        scales: themeScales,
      },
    };
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-grouped-bar": InstanceType<typeof PqGroupedBar>;
  }
}
