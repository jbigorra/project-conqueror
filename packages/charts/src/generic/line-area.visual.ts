import type { ChartConfiguration } from "chart.js";
import { buildLineAreaDatasets } from "../mappers/line-area.mapper";
import type { LineAreaPoint } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Line/area chart web component backed by Chart.js.
 *
 * @element pq-line-area
 * @attr {LineAreaPoint[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {boolean} fill - Fill area under lines (default `false`).
 * @attr {boolean} stacked - Stack series on top of each other (default `false`).
 * @attr {string} x-label - Label for the X axis.
 * @attr {string} y-label - Label for the Y axis.
 * @attr {boolean} show-legend - Show the Chart.js legend (default `true`).
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a point is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-line-area
 *   .data=${[{ x: "2024-01", series: [{ key: "added", value: 100 }] }]}
 *   theme="dark"
 *   fill
 *   show-legend
 * ></pq-line-area>
 * ```
 */
export const PqLineArea = defineGenericChart<
  LineAreaPoint,
  { fill: boolean; stacked: boolean; xLabel: string; yLabel: string; showLegend: boolean }
>({
  tag: "pq-line-area",
  properties: {
    fill: { type: Boolean },
    stacked: { type: Boolean },
    xLabel: { attribute: "x-label" },
    yLabel: { attribute: "y-label" },
    showLegend: { type: Boolean, attribute: "show-legend" },
  },
  defaults: { fill: false, stacked: false, xLabel: "", yLabel: "", showLegend: true },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const { labels, datasets } = buildLineAreaDatasets(resolved);
    const themePlugins = themeCtrl.options.plugins;
    const themeScales = themeCtrl.options.scales;

    return {
      type: "line",
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          backgroundColor: themeCtrl.colors[i % themeCtrl.colors.length],
          borderColor: themeCtrl.colors[i % themeCtrl.colors.length],
          fill: props.fill ? "origin" : false,
          tension: 0.3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: props.showLegend },
        },
        scales: {
          ...themeScales,
          x: {
            ...themeScales.x,
            stacked: props.stacked,
            title: { display: !!props.xLabel, text: props.xLabel },
          },
          y: {
            ...themeScales.y,
            stacked: props.stacked,
            title: { display: !!props.yLabel, text: props.yLabel },
          },
        },
      },
    };
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-line-area": InstanceType<typeof PqLineArea>;
  }
}
