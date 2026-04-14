import type { ChartConfiguration, ChartTypeRegistry, TooltipItem } from "chart.js";
import type { BubbleItem } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Bubble chart web component backed by Chart.js.
 *
 * @element pq-bubble
 * @attr {BubbleItem[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {string} x-label - Label for the X axis.
 * @attr {string} y-label - Label for the Y axis.
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bubble is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-bubble
 *   .data=${[{ label: "file.ts", x: 10, y: 5, r: 8 }]}
 *   theme="dark"
 *   x-label="Revisions"
 *   y-label="Complexity"
 * ></pq-bubble>
 * ```
 */
export const PqBubble = defineGenericChart<BubbleItem, { xLabel: string; yLabel: string }>({
  tag: "pq-bubble",
  properties: {
    xLabel: { attribute: "x-label" },
    yLabel: { attribute: "y-label" },
  },
  defaults: { xLabel: "", yLabel: "" },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const themePlugins = themeCtrl.options.plugins;
    const themeScales = themeCtrl.options.scales;

    return {
      type: "bubble",
      data: {
        datasets: [
          {
            data: resolved.map((item) => ({ x: item.x, y: item.y, r: item.r })),
            backgroundColor: themeCtrl.colors[0],
            borderColor: themeCtrl.colors[0],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: false },
          tooltip: {
            ...themePlugins.tooltip,
            callbacks: {
              label: (ctx: TooltipItem<keyof ChartTypeRegistry>) => {
                const item = resolved[ctx.dataIndex];
                const label = item ? item.label : "";
                const raw = ctx.raw as { r?: number; x?: number; y?: number };
                const parsed = ctx.parsed as { x?: number; y?: number };
                return `${label}: (${parsed.x}, ${parsed.y}, r=${raw.r})`;
              },
            },
          },
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
    "pq-bubble": InstanceType<typeof PqBubble>;
  }
}
