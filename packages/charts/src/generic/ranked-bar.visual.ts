import type { ChartConfiguration } from "chart.js";
import { sliceItems, sortItems } from "../mappers/ranked-bar.mapper";
import type { RankedBarItem, SortDirection } from "../types";
import { defineGenericChart } from "./define-generic-chart";

/**
 * Ranked bar chart web component backed by Chart.js.
 *
 * Automatically sorts and slices data. Ideal for top-N rankings.
 *
 * @element pq-ranked-bar
 * @attr {RankedBarItem[]} data - Inline data array.
 * @attr {string} src - URL to fetch data from (ignored when `data` is set).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {number} limit - Max items to display (0 = unlimited).
 * @attr {boolean} horizontal - Render bars horizontally (default `true`).
 * @attr {"asc"|"desc"|"none"} sort - Sort direction (default `"desc"`).
 * @attr {boolean} animated - Enable chart animations (default `true`).
 * @slot loading - Content shown while data is loading.
 * @slot error - Content shown when data fetch fails.
 * @slot empty - Content shown when data array is empty.
 * @fires chart-click - When a bar is clicked, with `{ datasetIndex, index, label, value }`.
 *
 * @example
 * ```html
 * <pq-ranked-bar
 *   .data=${[{ label: "src/index.ts", value: 42 }, { label: "src/app.ts", value: 18 }]}
 *   limit="10"
 *   sort="desc"
 *   horizontal
 * ></pq-ranked-bar>
 * ```
 */
export const PqRankedBar = defineGenericChart<
  RankedBarItem,
  { limit: number; horizontal: boolean; sort: SortDirection }
>({
  tag: "pq-ranked-bar",
  properties: {
    limit: { type: Number },
    horizontal: { type: Boolean },
    sort: {},
  },
  defaults: { limit: 0, horizontal: true, sort: "desc" },
  buildConfig: ({ resolved, themeCtrl, props }): ChartConfiguration => {
    const sorted = sortItems(resolved, props.sort);
    const sliced = sliceItems(sorted, props.limit);
    const themePlugins = themeCtrl.options.plugins;
    const themeScales = themeCtrl.options.scales;

    return {
      type: "bar",
      data: {
        labels: sliced.map((d) => d.label),
        datasets: [
          {
            data: sliced.map((d) => d.value),
            backgroundColor: themeCtrl.colors[0],
            borderColor: themeCtrl.colors[0],
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: props.horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: false },
        },
        scales: themeScales,
      },
    };
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-ranked-bar": InstanceType<typeof PqRankedBar>;
  }
}
