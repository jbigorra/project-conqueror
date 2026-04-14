import type { ChartConfiguration } from "chart.js";
import { binValues } from "../mappers/histogram.mapper";
import type { HistogramItem } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Histogram chart web component backed by Chart.js.
 *
 * Accepts raw numeric values and bins them automatically.
 *
 * @element pq-histogram
 * @attr {HistogramItem[]} data - Inline data array of raw values.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} bins - Number of equal-width bins (default `10`).
 * @attr {string} x-label - Label for the X axis.
 * @attr {string} y-label - Label for the Y axis.
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bar is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-histogram
 *   .data=${[{ value: 3 }, { value: 7 }, { value: 12 }]}
 *   bins="5"
 *   x-label="Age (months)"
 *   y-label="Files"
 * ></pq-histogram>
 * ```
 */
export const PqHistogram = defineGenericChart<
  HistogramItem,
  { bins: number; xLabel: string; yLabel: string }
>({
  tag: "pq-histogram",
  properties: {
    bins: { type: Number },
    xLabel: { attribute: "x-label" },
    yLabel: { attribute: "y-label" },
  },
  defaults: { bins: 10, xLabel: "", yLabel: "" },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const values = resolved.map((item) => item.value);
    const binned = binValues(values, props.bins);
    const themePlugins = themeCtrl.options.plugins;
    const themeScales = themeCtrl.options.scales;

    return {
      type: "bar",
      data: {
        labels: binned.map((b) => b.label),
        datasets: [
          {
            data: binned.map((b) => b.value),
            backgroundColor: themeCtrl.colors[0],
            borderColor: themeCtrl.colors[0],
            borderWidth: 1,
            categoryPercentage: 1.0,
            barPercentage: 1.0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: false },
        },
        scales: {
          ...themeScales,
          x: {
            ...themeScales.x,
            title: { display: !!props.xLabel, text: props.xLabel },
          },
          y: {
            ...themeScales.y,
            title: { display: !!props.yLabel, text: props.yLabel },
          },
        },
      },
    };
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-histogram": InstanceType<typeof PqHistogram>;
  }
}
