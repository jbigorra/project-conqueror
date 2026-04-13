# Spec: Generic Charts `defineGenericChart<T>()` Factory

**Date**: 2026-04-10
**Change**: `charts-strategy-pattern`
**Status**: APPROVED

---

## 1. Problem Statement

The `packages/charts/src/generic/` directory contains 9 chart Web Components. 8 of them are built on Chart.js and share significant structural duplication that SonarCloud flags at **6.0% overall package duplication (268 lines across 28 blocks)**.

### Measured duplication per component

| Component | Lines | Dup % |
|---|---|---|
| `line-area.visual.ts` | 135 | 34.6% |
| `bubble.visual.ts` | 134 | 34.8% |
| `histogram.visual.ts` | 134 | 33.3% |
| `stacked-bar.visual.ts` | 123 | 34.7% |
| `grouped-bar.visual.ts` | 119 | 35.8% |
| `ranked-bar.visual.ts` | 120 | 10.7% |
| `doughnut.visual.ts` | 135 | 11.0% |
| `treemap.visual.ts` | 154 | 9.7% |

### Duplicated blocks (verbatim across all 8 files)

1. `static override styles` CSS block — identical 12-line block
2. Three controller instantiations (`fetcher`, `chartCtrl`, `themeCtrl`) — 3 lines each
3. Base `@property` declarations (`data`, `src`, `theme`, `animated`) — 4 lines each
4. `updated()` lifecycle method — identical 5-line branching logic
5. `render()` method — identical 8-line loading/error/empty/canvas template
6. `renderChart()` preamble — identical 2-line resolve + empty guard (6 of 8 files)

**Estimated duplication in absolute lines**: ~35–38 lines × 8 components = **280–304 lines** before chart-specific logic.

### What does NOT vary

- CSS styles block
- Controller initialization (`DataFetchController<T>`, `ChartController`, `ThemeController`)
- Base properties: `data?: T[]`, `src?: string`, `theme?: ThemePreset`, `animated: boolean`
- `updated()` branching: theme update → animate update → fetch → renderChart
- `render()` template: loading slot → error slot → empty guard → canvas ref
- `renderChart()` preamble: resolve data, empty guard

### What DOES vary per component

- **Component-specific `@property` declarations**: count and type differ per component
- **Chart.js config builder**: the entire `data.datasets` shape and `options` object are component-specific

### Excluded component

`enclosure.visual.ts` is D3-based (uses `d3-hierarchy`, `d3-interpolate`, `d3-selection`), does **not** use `ChartController` or `DataFetchController`, and has fundamentally different lifecycle management. It is **explicitly excluded** from this refactoring.

---

## 2. Solution: `defineGenericChart<T>()` Factory

### Design principle

A single factory function `defineGenericChart<T>()` accepts a `GenericChartConfig<T>` object and returns a fully registered Lit custom-element class. All shared infrastructure lives inside the factory closure. Only the **component-specific properties** and the **Chart.js config builder** are supplied by the caller.

This is a **Strategy pattern** applied at the component-definition level: the algorithm skeleton (lifecycle, render states, data resolution) is fixed inside the factory; the strategy (how to build the Chart.js config given resolved data and component props) is injected via `buildConfig`.

No abstract classes. No `extends`. No overridable methods.

---

## 3. Type Definitions

```typescript
// packages/charts/src/generic/define-generic-chart.ts

import type { ChartConfiguration } from "chart.js";
import { css, html, LitElement } from "lit";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import type { ThemePreset } from "../types";

/**
 * Contextual object passed to the `buildConfig` strategy function.
 * Contains resolved data, all three controllers, and a snapshot of
 * the component instance for reading custom properties.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 */
export type BuildConfigContext<T, Props extends Record<string, unknown>> = {
  /** Resolved non-empty data array (inline `data` prop or fetched via `src`). */
  resolved: T[];
  /** Provides `colors`, `theme`, and `options` (scales + plugins) for Chart.js config. */
  themeCtrl: ThemeController;
  /** Provides `animate` flag; rarely needed in buildConfig but available. */
  chartCtrl: ChartController;
  /** Current values of all component-specific properties. */
  props: Props;
};

/**
 * Strategy function that builds a Chart.js configuration from resolved data.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 * @param ctx - Context with resolved data, controllers, and component props.
 * @returns A complete Chart.js `ChartConfiguration` object.
 */
export type BuildConfigFn<T, Props extends Record<string, unknown>> = (
  ctx: BuildConfigContext<T, Props>,
) => ChartConfiguration;

/**
 * Lit `PropertyDeclaration`-compatible descriptor for a single reactive property.
 * Matches the shape accepted by Lit's `static properties` map.
 */
export type LitPropertyDeclaration = {
  type?: typeof Boolean | typeof Number | typeof String | typeof Array | typeof Object;
  attribute?: string | boolean;
  reflect?: boolean;
  converter?: unknown;
  hasChanged?: (value: unknown, oldValue: unknown) => boolean;
};

/**
 * Configuration object passed to {@link defineGenericChart}.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 *
 * @example
 * ```ts
 * const config: GenericChartConfig<BubbleItem, { xLabel: string; yLabel: string }> = {
 *   tag: "pq-bubble",
 *   properties: {
 *     xLabel: { attribute: "x-label" },
 *     yLabel: { attribute: "y-label" },
 *   },
 *   defaults: { xLabel: "", yLabel: "" },
 *   buildConfig: ({ resolved, themeCtrl, props }) => ({ type: "bubble", ... }),
 * };
 * ```
 */
export type GenericChartConfig<T, Props extends Record<string, unknown> = Record<string, never>> = {
  /**
   * Custom element tag name (e.g. `"pq-bubble"`).
   * Must match the existing registered tag name — not changing it.
   */
  tag: string;

  /**
   * Component-specific reactive properties, declared using Lit's `static properties` map format.
   * Do NOT include `data`, `src`, `theme`, or `animated` — these are injected by the factory.
   *
   * @example
   * ```ts
   * properties: {
   *   limit: { type: Number },
   *   horizontal: { type: Boolean },
   *   sort: {},  // string, no type coercion
   * }
   * ```
   */
  properties: { [K in keyof Props]: LitPropertyDeclaration };

  /**
   * Default values for each component-specific property.
   * Every key in `properties` MUST have a corresponding default here.
   *
   * @example
   * ```ts
   * defaults: { limit: 0, horizontal: true, sort: "desc" }
   * ```
   */
  defaults: Props;

  /**
   * Strategy function that builds the Chart.js configuration.
   * Called only when resolved data is non-empty.
   *
   * @param ctx - Contains resolved data, controllers, and component props.
   * @returns Chart.js `ChartConfiguration` object.
   */
  buildConfig: BuildConfigFn<T, Props>;
};
```

---

## 4. Factory Implementation Sketch

```typescript
/**
 * Factory that creates and registers a Chart.js-backed Lit Web Component.
 *
 * All shared infrastructure (styles, controllers, base properties, lifecycle,
 * render states) is handled by the factory. Consumers supply only their
 * component-specific properties and a `buildConfig` strategy function.
 *
 * No class inheritance. No abstract methods. Composition only.
 *
 * @typeParam T - The domain data item type this chart renders.
 * @typeParam Props - Record of component-specific property names to their types.
 * @param config - Component configuration: tag, properties, defaults, buildConfig strategy.
 * @returns The generated Lit element class (use for `HTMLElementTagNameMap` augmentation).
 *
 * @example
 * ```ts
 * export const PqBubble = defineGenericChart<BubbleItem, { xLabel: string; yLabel: string }>({
 *   tag: "pq-bubble",
 *   properties: {
 *     xLabel: { attribute: "x-label" },
 *     yLabel: { attribute: "y-label" },
 *   },
 *   defaults: { xLabel: "", yLabel: "" },
 *   buildConfig: ({ resolved, themeCtrl, props }) => ({ ... }),
 * });
 * ```
 */
export function defineGenericChart<
  T,
  Props extends Record<string, unknown> = Record<string, never>,
>(config: GenericChartConfig<T, Props>): typeof LitElement {
  // ---- Shared static styles (identical across all 8 Chart.js components) ----
  const sharedStyles = css`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    canvas { width: 100% !important; height: 100% !important; }
    .state-message {
      display: flex; align-items: center; justify-content: center;
      min-height: 200px;
      color: var(--pq-chart-text, #e0e0e0);
      font-family: var(--pq-chart-font-family, system-ui, sans-serif);
    }
  `;

  // ---- Base + component-specific property declarations for Lit ----
  const baseProperties = {
    data:     { type: Array },
    src:      {},
    theme:    {},
    animated: { type: Boolean, attribute: "animated" },
  };

  class GenericChart extends LitElement {
    static override styles = sharedStyles;

    static override properties = {
      ...baseProperties,
      ...config.properties,
    };

    // ---- Controller instances ----
    private fetcher = new DataFetchController<T>(this);
    private chartCtrl = new ChartController(this);
    private themeCtrl = new ThemeController(this);

    // ---- Base property values (typed explicitly for clarity) ----
    data?: T[];
    src?: string;
    theme?: ThemePreset;
    animated = true;

    // ---- Component-specific property values (initialized from defaults) ----
    // Assigned dynamically below via Object.assign in constructor
    constructor() {
      super();
      // Initialize component-specific properties from defaults
      for (const [key, value] of Object.entries(config.defaults)) {
        (this as unknown as Record<string, unknown>)[key] = value;
      }
    }

    protected override async updated(changed: Map<string, unknown>): Promise<void> {
      if (changed.has("theme")) this.themeCtrl.update(this.theme);
      if (changed.has("animated")) this.chartCtrl.animate = this.animated;
      if (changed.has("src") || changed.has("data"))
        await this.fetcher.fetch(this.src ?? "", !!this.data);
      this.renderChart();
    }

    private renderChart(): void {
      const resolved = this.data ?? this.fetcher.data;
      if (!resolved?.length) return;

      // Snapshot all component-specific props to pass to the strategy
      const props = Object.fromEntries(
        Object.keys(config.properties).map((key) => [
          key,
          (this as unknown as Record<string, unknown>)[key],
        ]),
      ) as Props;

      const chartConfig = config.buildConfig({
        resolved,
        themeCtrl: this.themeCtrl,
        chartCtrl: this.chartCtrl,
        props,
      });

      this.chartCtrl.update(chartConfig);
    }

    protected override render() {
      if (this.fetcher.state === "loading")
        return html`<div class="state-message"><slot name="loading">Loading…</slot></div>`;
      if (this.fetcher.state === "error")
        return html`<div class="state-message"><slot name="error">Failed to load data.</slot></div>`;
      const resolved = this.data ?? this.fetcher.data;
      if (resolved && resolved.length === 0)
        return html`<div class="state-message"><slot name="empty">No data.</slot></div>`;
      return html`<canvas ${ref(this.chartCtrl.canvasRef)}></canvas>`;
    }
  }

  // Register the custom element
  customElements.define(config.tag, GenericChart);

  return GenericChart;
}
```

### Notes on the implementation sketch

- **`static properties` vs decorators**: Lit's `static properties` map is the decorator-free, spec-compliant way to declare reactive properties. The factory merges the four base properties with the consumer's custom properties at class-definition time. No `@property` decorators — they are sugar for exactly this map.
- **Props snapshot**: Custom prop values are snapshotted immediately before calling `buildConfig`. This avoids passing `this` into the strategy (which would be a leaky abstraction) while still giving the strategy full access to the current component state.
- **`customElements.define` vs `@customElement` decorator**: The factory calls `customElements.define` directly since the `@customElement` decorator is not available without referencing the class before it is defined. Both paths call `customElements.define` under the hood; the result is identical.
- **No `extends`**: `GenericChart` extends `LitElement` only — consumers never subclass anything. The returned class reference is used solely for `HTMLElementTagNameMap` type augmentation.

---

## 5. Consumer Examples

### 5.1 Simple case: `bubble.visual.ts` — Before / After

**Before (128 lines)**

```typescript
import type { TooltipItem } from "chart.js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import type { BubbleItem, ThemePreset } from "../types";

@customElement("pq-bubble")
export class PqBubble extends LitElement {
  static override styles = css`
    :host { display: block; position: relative; width: 100%; height: 100%; }
    canvas { width: 100% !important; height: 100% !important; }
    .state-message {
      display: flex; align-items: center; justify-content: center;
      min-height: 200px;
      color: var(--pq-chart-text, #e0e0e0);
      font-family: var(--pq-chart-font-family, system-ui, sans-serif);
    }
  `;

  private fetcher = new DataFetchController<BubbleItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: BubbleItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ attribute: "x-label" }) xLabel = "";
  @property({ attribute: "y-label" }) yLabel = "";
  @property({ type: Boolean, attribute: "animated" }) animated = true;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("theme")) this.themeCtrl.update(this.theme);
    if (changed.has("animated")) this.chartCtrl.animate = this.animated;
    if (changed.has("src") || changed.has("data"))
      await this.fetcher.fetch(this.src ?? "", !!this.data);
    this.renderChart();
  }

  private renderChart(): void {
    const resolved = this.data ?? this.fetcher.data;
    if (!resolved?.length) return;
    const themePlugins = this.themeCtrl.options.plugins;
    const themeScales = this.themeCtrl.options.scales;
    this.chartCtrl.update({
      type: "bubble",
      data: {
        datasets: [{
          data: resolved.map((item) => ({ x: item.x, y: item.y, r: item.r })),
          backgroundColor: this.themeCtrl.colors[0],
          borderColor: this.themeCtrl.colors[0],
        }],
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
              label: (ctx: TooltipItem<"bubble">) => {
                const item = resolved[ctx.dataIndex];
                const label = item ? item.label : "";
                const raw = ctx.raw as { r?: number };
                return `${label}: (${ctx.parsed.x}, ${ctx.parsed.y}, r=${raw.r})`;
              },
            },
          },
        },
        scales: {
          ...themeScales,
          x: { ...themeScales.x, title: { display: !!this.xLabel, text: this.xLabel } },
          y: { ...themeScales.y, title: { display: !!this.yLabel, text: this.yLabel } },
        },
      },
    });
  }

  protected override render() { ... }
}

declare global {
  interface HTMLElementTagNameMap { "pq-bubble": PqBubble; }
}
```

**After (~45 lines — 65% reduction)**

```typescript
import type { TooltipItem } from "chart.js";
import type { BubbleItem } from "../types";
import { defineGenericChart } from "./define-generic-chart";

type BubbleProps = { xLabel: string; yLabel: string };

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
export const PqBubble = defineGenericChart<BubbleItem, BubbleProps>({
  tag: "pq-bubble",
  properties: {
    xLabel: { attribute: "x-label" },
    yLabel: { attribute: "y-label" },
  },
  defaults: { xLabel: "", yLabel: "" },
  buildConfig: ({ resolved, themeCtrl, props }) => {
    const themePlugins = themeCtrl.options.plugins;
    const themeScales = themeCtrl.options.scales;
    return {
      type: "bubble",
      data: {
        datasets: [{
          data: resolved.map((item) => ({ x: item.x, y: item.y, r: item.r })),
          backgroundColor: themeCtrl.colors[0],
          borderColor: themeCtrl.colors[0],
        }],
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
              label: (ctx: TooltipItem<"bubble">) => {
                const item = resolved[ctx.dataIndex];
                const label = item ? item.label : "";
                const raw = ctx.raw as { r?: number };
                return `${label}: (${ctx.parsed.x}, ${ctx.parsed.y}, r=${raw.r})`;
              },
            },
          },
        },
        scales: {
          ...themeScales,
          x: { ...themeScales.x, title: { display: !!props.xLabel, text: props.xLabel } },
          y: { ...themeScales.y, title: { display: !!props.yLabel, text: props.yLabel } },
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
```

**What changed**: `PqBubble` is now a `const` (the factory return value), not a `class`. `HTMLElementTagNameMap` uses `InstanceType<typeof PqBubble>` since the returned class is anonymous. Everything else — tag name, attributes, slots, `chart-click` event — is identical.

---

### 5.2 Complex case: `ranked-bar.visual.ts` — Before / After

**Before (120 lines)**

```typescript
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import { sliceItems, sortItems } from "../mappers/ranked-bar.mapper";
import type { RankedBarItem, SortDirection, ThemePreset } from "../types";

@customElement("pq-ranked-bar")
export class PqRankedBar extends LitElement {
  static override styles = css`...`; // 12 lines, identical

  private fetcher = new DataFetchController<RankedBarItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: RankedBarItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Number }) limit = 0;
  @property({ type: Boolean }) horizontal = true;
  @property() sort: SortDirection = "desc";
  @property({ type: Boolean, attribute: "animated" }) animated = true;

  protected override async updated(changed: Map<string, unknown>): Promise<void> { ... }

  private renderChart(): void {
    const resolved = this.data ?? this.fetcher.data;
    if (!resolved?.length) return;
    const sorted = sortItems(resolved, this.sort);
    const sliced = sliceItems(sorted, this.limit);
    const themePlugins = this.themeCtrl.options.plugins;
    const themeScales = this.themeCtrl.options.scales;
    this.chartCtrl.update({
      type: "bar",
      data: {
        labels: sliced.map((d) => d.label),
        datasets: [{
          data: sliced.map((d) => d.value),
          backgroundColor: this.themeCtrl.colors[0],
          borderColor: this.themeCtrl.colors[0],
          borderWidth: 1,
        }],
      },
      options: {
        indexAxis: this.horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...themePlugins,
          legend: { ...themePlugins.legend, display: false },
        },
        scales: themeScales,
      },
    });
  }

  protected override render() { ... }
}

declare global {
  interface HTMLElementTagNameMap { "pq-ranked-bar": PqRankedBar; }
}
```

**After (~40 lines — 67% reduction)**

```typescript
import { sliceItems, sortItems } from "../mappers/ranked-bar.mapper";
import type { RankedBarItem, SortDirection } from "../types";
import { defineGenericChart } from "./define-generic-chart";

type RankedBarProps = { limit: number; horizontal: boolean; sort: SortDirection };

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
 *   .data=${[{ label: "src/index.ts", value: 42 }]}
 *   limit="10"
 *   sort="desc"
 *   horizontal
 * ></pq-ranked-bar>
 * ```
 */
export const PqRankedBar = defineGenericChart<RankedBarItem, RankedBarProps>({
  tag: "pq-ranked-bar",
  properties: {
    limit:      { type: Number },
    horizontal: { type: Boolean },
    sort:       {},
  },
  defaults: { limit: 0, horizontal: true, sort: "desc" },
  buildConfig: ({ resolved, themeCtrl, props }) => {
    const sorted = sortItems(resolved, props.sort);
    const sliced = sliceItems(sorted, props.limit);
    const themePlugins = themeCtrl.options.plugins;
    const themeScales = themeCtrl.options.scales;
    return {
      type: "bar",
      data: {
        labels: sliced.map((d) => d.label),
        datasets: [{
          data: sliced.map((d) => d.value),
          backgroundColor: themeCtrl.colors[0],
          borderColor: themeCtrl.colors[0],
          borderWidth: 1,
        }],
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
```

**Key differences from bubble**: `buildConfig` receives `props.sort`, `props.limit`, and `props.horizontal` — the mapper calls (`sortItems`, `sliceItems`) happen inside the strategy, exactly as before.

---

## 6. Affected Files

### New file

| File | Action | Description |
|---|---|---|
| `packages/charts/src/generic/define-generic-chart.ts` | **CREATE** | Factory function + all shared types |

### Modified files (8 components)

| File | Action | Lines Before → After (approx.) |
|---|---|---|
| `packages/charts/src/generic/bubble.visual.ts` | **REWRITE** | 134 → ~45 |
| `packages/charts/src/generic/line-area.visual.ts` | **REWRITE** | 135 → ~55 |
| `packages/charts/src/generic/histogram.visual.ts` | **REWRITE** | 134 → ~50 |
| `packages/charts/src/generic/stacked-bar.visual.ts` | **REWRITE** | 123 → ~50 |
| `packages/charts/src/generic/grouped-bar.visual.ts` | **REWRITE** | 119 → ~50 |
| `packages/charts/src/generic/ranked-bar.visual.ts` | **REWRITE** | 120 → ~40 |
| `packages/charts/src/generic/doughnut.visual.ts` | **REWRITE** | 135 → ~50 |
| `packages/charts/src/generic/treemap.visual.ts` | **REWRITE** | 154 → ~70 |

### Barrel update

`packages/charts/src/index.ts` must add:

```typescript
export { defineGenericChart } from "./generic/define-generic-chart";
export type { GenericChartConfig, BuildConfigContext, BuildConfigFn } from "./generic/define-generic-chart";
```

The `./generic` export path in `package.json` must also include `define-generic-chart`.

### Untouched files

| File | Reason |
|---|---|
| `packages/charts/src/generic/enclosure.visual.ts` | D3-based, no Chart.js controllers — explicitly excluded |
| `packages/charts/src/controllers/` | No changes needed |
| `packages/charts/src/mappers/` | No changes needed |
| `packages/charts/src/types.ts` | No changes needed |
| `packages/charts/src/domain/` | No changes needed |

---

## 7. Constraints

### Must not break

1. **Custom element tag names are preserved**: `pq-bubble`, `pq-line-area`, `pq-histogram`, `pq-stacked-bar`, `pq-grouped-bar`, `pq-ranked-bar`, `pq-doughnut`, `pq-treemap` — all remain identical.
2. **Public attributes are preserved**: every property attribute name stays the same. `data`, `src`, `theme`, `animated` are base properties managed by the factory. Component-specific attributes (`x-label`, `y-label`, `fill`, `stacked`, `bins`, `limit`, `horizontal`, `show-legend`, `center-label`, `show-labels`, `color-field`, `sort`) are declared in each component's `properties` map.
3. **`@fires chart-click` contract is preserved**: `ChartController` fires the event; no changes to that contract.
4. **All slots are preserved**: `loading`, `error`, `empty` slots live inside the factory's `render()` implementation.
5. **Biome strict mode compliance**: No `any`, no unused vars, no non-null assertions in `define-generic-chart.ts` or any rewritten component.
6. **JSDoc on all public exports**: `defineGenericChart`, `GenericChartConfig`, `BuildConfigContext`, `BuildConfigFn`, `LitPropertyDeclaration` must all have full JSDoc with `@typeParam`, `@param`, `@returns`, `@example`.

### TypeScript notes

- `InstanceType<typeof PqBubble>` in `HTMLElementTagNameMap` is required because the factory returns `typeof LitElement` (an anonymous class), not a named class reference.
- The `Props` type parameter is inferred from the `defaults` object when possible, but must be explicitly provided when custom property types include union types (e.g., `SortDirection = "asc" | "desc" | "none"`).
- `(this as unknown as Record<string, unknown>)[key] = value` in the constructor is the one unavoidable escape hatch for dynamically initializing typed properties. This is isolated entirely inside the factory — no consumer ever sees it.

### `enclosure.visual.ts` is excluded

`enclosure.visual.ts` is D3-based, does not use `ChartController` or `DataFetchController`, and has fundamentally different lifecycle management (imperative D3 mutations, `ResizeObserver`, SVG instead of canvas). It stays as-is.

---

## 8. Testing Requirements

### `define-generic-chart.ts` (new file, plain `.ts` suffix)

The factory and its generated class behavior must be tested directly. A minimal `defineGenericChart` call creates a real (registered) component that can be exercised in tests.

**Test file**: `tests/generic/define-generic-chart.test.ts`

#### Factory unit tests

1. **`customElements.define` is called with the provided `tag`** — verify the tag is registered after `defineGenericChart()` runs.
2. **`static properties` includes all four base properties** (`data`, `src`, `theme`, `animated`).
3. **`static properties` includes all consumer-declared properties** with the correct descriptors.
4. **Default values are applied on construction** — instantiate a test component and verify custom props match `defaults`.

#### Generated class lifecycle tests (via a minimal `TestChart` registration)

```typescript
// In the test file, register a minimal chart for lifecycle testing:
const TestChart = defineGenericChart<{ value: number }, { label: string }>({
  tag: "pq-test-chart-lifecycle",
  properties: { label: {} },
  defaults: { label: "" },
  buildConfig: ({ resolved, themeCtrl }) => ({
    type: "bar",
    data: { datasets: [{ data: resolved.map((d) => d.value) }] },
    options: {},
  }),
});
```

5. **`updated()` calls `themeCtrl.update()` when `theme` changes**
6. **`updated()` sets `chartCtrl.animate` when `animated` changes**
7. **`updated()` calls `fetcher.fetch()` when `src` changes**
8. **`updated()` calls `fetcher.fetch()` when `data` changes**
9. **`renderChart()` is a no-op when resolved data is empty**
10. **`renderChart()` calls `chartCtrl.update()` with the result of `buildConfig` when data is present**
11. **`buildConfig` receives correct `props` snapshot** — verify `props.label` is the current value, not stale.
12. **`render()` returns loading slot when `fetcher.state === "loading"`**
13. **`render()` returns error slot when `fetcher.state === "error"`**
14. **`render()` returns empty slot when data is `[]`**
15. **`render()` returns `<canvas>` element when data is non-empty**

Mock controllers via the existing `tests/helpers/mock-host` pattern or `bun-automock`.

---

## 9. Estimated Impact

| Metric | Before | After |
|---|---|---|
| Total lines (8 Chart.js components) | ~1,024 | ~410 (estimated) |
| Lines of duplicated boilerplate | ~280 | 0 |
| New file (`define-generic-chart.ts`) | — | ~120 lines |
| Net reduction | — | ~490 lines (~48%) |
| SonarCloud duplication (estimated) | 6.0% | <1.5% |

---

## 10. Out of Scope

The following are explicitly NOT part of this change:

- **Mapper refactoring**: `buildLineAreaDatasets`, `buildStackedDatasets`, `buildGroupedDatasets`, `binValues`, `sortItems`, `sliceItems` — mappers stay as-is in `src/mappers/`
- **Domain charts**: `src/domain/` components are not touched
- **New chart types or features**: no new chart types, no new properties, no new capabilities
- **`enclosure.visual.ts`**: D3-based, architecturally different, stays as-is
- **Storybook stories**: Stories reference the same custom element tag names and attributes — no story changes needed
- **`ChartController`, `DataFetchController`, `ThemeController` internals**: no changes to any controller
- **`defineDomainChart` factory**: already approved in a separate spec — not modified here
