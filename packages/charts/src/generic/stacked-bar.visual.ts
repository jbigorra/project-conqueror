import type { ChartConfiguration } from "chart.js";
import { buildStackedDatasets } from "../mappers/stacked-bar.mapper";
import type { StackedBarItem } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Stacked bar chart web component backed by Chart.js.
 *
 * @element pq-stacked-bar
 * @attr {StackedBarItem[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} limit - Max items to display (0 = unlimited).
 * @attr {boolean} horizontal - Render bars horizontally (default `false`).
 * @attr {boolean} show-legend - Show the Chart.js legend (default `true`).
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bar segment is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-stacked-bar
 *   .data=${[{ label: "file.ts", segments: [{ key: "added", value: 50 }, { key: "deleted", value: 10 }] }]}
 *   theme="pico"
 *   show-legend
 * ></pq-stacked-bar>
 * ```
 */
export const PqStackedBar = defineGenericChart<
  StackedBarItem,
  { limit: number; horizontal: boolean; showLegend: boolean }
>({
  tag: "pq-stacked-bar",
  properties: {
    limit: { type: Number },
    horizontal: { type: Boolean },
    showLegend: { type: Boolean, attribute: "show-legend" },
  },
  defaults: { limit: 0, horizontal: false, showLegend: true },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const sliced = props.limit > 0 ? resolved.slice(0, props.limit) : resolved;
    const { labels, datasets } = buildStackedDatasets(sliced);
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
        scales: {
          ...themeScales,
          x: { ...themeScales.x, stacked: true },
          y: { ...themeScales.y, stacked: true },
        },
      },
    };
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-stacked-bar": InstanceType<typeof PqStackedBar>;
  }
}
