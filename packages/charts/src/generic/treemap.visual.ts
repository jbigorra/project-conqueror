import type { ChartConfiguration, ScriptableContext, TooltipItem } from "chart.js";
import type { TreemapDataPoint } from "chartjs-chart-treemap";
import type { TreemapItem } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Treemap chart web component backed by Chart.js + chartjs-chart-treemap.
 *
 * @element pq-treemap
 * @attr {TreemapItem[]} data - Inline data array with hierarchical paths.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {boolean} show-labels - Display labels on treemap tiles (default `false`).
 * @attr {string} color-field - Field name used for tile colouring.
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a tile is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-treemap
 *   .data=${[{ path: ["src", "index.ts"], value: 42, color: 3 }]}
 *   theme="dark"
 *   show-labels
 * ></pq-treemap>
 * ```
 */
export const PqTreemap = defineGenericChart<
  TreemapItem,
  { showLabels: boolean; colorField: string }
>({
  tag: "pq-treemap",
  properties: {
    showLabels: { type: Boolean, attribute: "show-labels" },
    colorField: { attribute: "color-field" },
  },
  defaults: { showLabels: false, colorField: "" },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const themePlugins = themeCtrl.options.plugins;
    const colors = themeCtrl.colors;

    // Build flat tree objects for chartjs-chart-treemap
    // Each item gets a label (last path segment) and value
    const treeData = resolved.map((item) => ({
      label: item.path[item.path.length - 1] ?? "",
      value: item.value,
      group: item.path.length > 1 ? item.path[0] : "root",
      ...(item.color !== undefined ? { colorIndex: item.color } : {}),
    }));

    return {
      type: "treemap",
      data: {
        datasets: [
          {
            tree: treeData,
            key: "value",
            groups: ["group", "label"],
            data: [],
            backgroundColor: (ctx: ScriptableContext<"treemap">) => {
              const raw = ctx.raw as (TreemapDataPoint & { colorIndex?: number }) | undefined;
              if (!raw) return colors[0];
              // Use colorIndex if available, otherwise cycle through accent colors
              const idx =
                typeof raw.colorIndex === "number"
                  ? raw.colorIndex % colors.length
                  : ctx.dataIndex % colors.length;
              return colors[idx] ?? colors[0];
            },
            borderColor: themeCtrl.theme.border,
            borderWidth: 1,
            spacing: 2,
            labels: {
              display: props.showLabels,
              color: themeCtrl.theme.text,
              font: {
                family: themeCtrl.theme.fontFamily,
                size: parseInt(themeCtrl.theme.fontSize, 10),
              },
              formatter: (ctx: ScriptableContext<"treemap">) =>
                (ctx.raw as TreemapDataPoint | undefined)?.g ?? "",
            },
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
              label: (ctx: TooltipItem<"treemap">) => {
                const raw = ctx.raw as TreemapDataPoint | undefined;
                return `${raw?.g ?? ""}: ${raw?.v ?? ""}`;
              },
            },
          },
        },
      },
    };
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-treemap": InstanceType<typeof PqTreemap>;
  }
}
