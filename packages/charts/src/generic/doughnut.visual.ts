import type { Chart, ChartConfiguration } from "chart.js";
import type { DoughnutItem } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Doughnut chart web component backed by Chart.js.
 *
 * @element pq-doughnut
 * @attr {DoughnutItem[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {boolean} show-legend - Show the Chart.js legend (default `true`).
 * @attr {string} center-label - Text rendered in the centre of the doughnut.
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a slice is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-doughnut
 *   .data=${[{ label: "Alice", value: 40 }, { label: "Bob", value: 60 }]}
 *   theme="dark"
 *   center-label="Ownership"
 * ></pq-doughnut>
 * ```
 */
export const PqDoughnut = defineGenericChart<
  DoughnutItem,
  { showLegend: boolean; centerLabel: string }
>({
  tag: "pq-doughnut",
  properties: {
    showLegend: { type: Boolean, attribute: "show-legend" },
    centerLabel: { attribute: "center-label" },
  },
  defaults: { showLegend: true, centerLabel: "" },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const themePlugins = themeCtrl.options.plugins;
    const centerLabel = props.centerLabel;
    const themeText = themeCtrl.theme.text;
    const themeFontFamily = themeCtrl.theme.fontFamily;

    const centerLabelPlugin = centerLabel
      ? {
          id: "centerLabel",
          beforeDraw(chart: Chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            const cx = (chartArea.left + chartArea.right) / 2;
            const cy = (chartArea.top + chartArea.bottom) / 2;
            ctx.save();
            ctx.font = `bold 16px ${themeFontFamily}`;
            ctx.fillStyle = themeText;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(centerLabel, cx, cy);
            ctx.restore();
          },
        }
      : null;

    return {
      type: "doughnut",
      data: {
        labels: resolved.map((d) => d.label),
        datasets: [
          {
            data: resolved.map((d) => d.value),
            backgroundColor: themeCtrl.colors.slice(0, resolved.length),
            borderColor: themeCtrl.colors.slice(0, resolved.length),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: props.showLegend },
          ...(centerLabelPlugin ? { centerLabel: centerLabelPlugin } : {}),
        },
      },
    };
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-doughnut": InstanceType<typeof PqDoughnut>;
  }
}
