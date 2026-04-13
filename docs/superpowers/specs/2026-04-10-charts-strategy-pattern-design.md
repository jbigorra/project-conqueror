# Design: charts-strategy-pattern

**Date**: 2026-04-10 (updated 2026-04-14)
**Change**: `charts-strategy-pattern`
**Status**: APPROVED
**Package**: `@prj-conq/charts`

---

## 1. Overview

Two factory functions eliminate structural duplication across the `@prj-conq/charts` package using **composition and strategy pattern only** — no class inheritance, no abstract classes, no overridable methods.

1. **`defineDomainChart<T>()`** — replaces 17 domain chart classes with config-driven definitions
2. **`defineGenericChart<T, Props>()`** — replaces 8 Chart.js generic chart classes with config-driven definitions

Combined target: SonarCloud duplication from 6.0% to under 3%.

---

## 2. Architecture Decisions

### ADR-1: Factory pattern for BOTH layers — no inheritance anywhere

**Decision**: Both domain and generic charts use factory functions that create and register Lit classes internally. Consumers never extend a class.

**Rationale**:
- Composition over inheritance — factories produce sealed classes with no override surface
- Consistent mental model across the entire package: "define a chart via config object"
- TypeScript has no `final` keyword — `updated()` "sealed by convention" is fragile with inheritance
- `onPropertiesChanged()` hook was speculative complexity with zero current consumers
- Factory-generated classes can't be accidentally subclassed by consumers

### ADR-2: `customElements.define()` over `@customElement()` decorator

**Decision**: Both factories use `customElements.define(config.tag, GeneratedClass)` instead of the `@customElement()` decorator.

**Rationale**:
- The `@customElement()` decorator requires a **class declaration** — it is applied at class definition time via decorator syntax. Factories create **class expressions** dynamically.
- `customElements.define()` is the native browser API that `@customElement()` wraps — zero behavioral difference.
- The factory already knows the tag at call time, so registration is trivial.

**Verification**: Lit 3.x `@customElement()` source is literally:
```ts
export function customElement(tagName: string) {
  return (target: typeof HTMLElement) => {
    customElements.define(tagName, target);
  };
}
```

### ADR-3: `static properties` map over `@property()` decorators

**Decision**: Both factories define reactive properties using Lit's `static properties` map instead of `@property()` decorators.

**Rationale**:
- Class expressions inside factories cannot use TypeScript decorators on dynamically defined fields
- Lit supports both approaches — `static properties` is the decorator-free, spec-compliant alternative
- Base properties (`data`, `src`, `theme`, `variant`/`animated`) are merged with consumer-declared properties at class-definition time
- The factory controls the merge — no implicit inheritance-based property merging

**Implementation pattern**:
```typescript
class GeneratedChart extends LitElement {
  static override properties = {
    ...baseProperties,    // data, src, theme, animated/variant
    ...config.properties, // consumer-specific
  };
}
```

### ADR-4: `buildConfig` strategy receives context object, not `this`

**Decision**: The generic chart's `buildConfig` function receives `{ resolved, themeCtrl, chartCtrl, props }` — not the component instance.

**Rationale**:
- Passing `this` leaks the internal class API to the consumer's strategy function
- A context object is a clean, testable contract — you can unit test `buildConfig` in isolation
- `props` is a snapshot of component-specific property values, not a reference to the instance
- Theme and chart controllers are provided for convenience — consumers access `themeCtrl.colors`, `themeCtrl.options.plugins`, etc.

**Domain charts don't need this**: domain `render()` receives `(data, theme, limit)` directly because domain charts delegate to generic chart HTML templates — they don't build Chart.js configs.

### ADR-5: `ChartConfiguration` as the return type of `buildConfig`

**Decision**: The strategy function returns `ChartConfiguration` (Chart.js top-level config type).

**Rationale**:
- `ChartController.update()` already accepts `ChartConfiguration` — the return value passes directly to it
- Returning the full config gives consumers complete control over type, data, and options
- Each chart type (`"bar"`, `"line"`, `"bubble"`, `"doughnut"`, `"treemap"`) has a different config shape — no intermediate type can unify them without losing type safety

### ADR-6: No additional export paths — flat barrel inclusion

**Decision**: `defineGenericChart` exports from `src/generic/index.ts`. `defineDomainChart` exports from `src/domain/index.ts`. No new export paths in `package.json`.

**Rationale**:
- The existing three export paths (`.`, `./generic`, `./domain`) already cover all consumers
- Adding more paths increases bundle config complexity for zero benefit

### ADR-7: Two separate factories, not one unified factory

**Decision**: `defineDomainChart<T>()` and `defineGenericChart<T, Props>()` are separate functions.

**Rationale**:
- **Different controller sets**: domain uses only `DataFetchController`; generic uses all three (`DataFetchController` + `ChartController` + `ThemeController`)
- **Different render templates**: domain delegates to generic charts via variant HTML templates; generic renders `<canvas>` with loading/error/empty states
- **Different property models**: domain has `variant` + `limit`; generic has `animated` + component-specific props
- A unified factory would require a `mode: "domain" | "generic"` discriminator — forced unification that adds complexity for no benefit
- Two focused factories (~30-40 lines each) > one configurable mega-factory

---

## 3. Detailed Design: `defineDomainChart<T>()`

### 3.1 File location

`packages/charts/src/domain/define-domain-chart.ts` (plain `.ts`, not `.visual.ts`)

### 3.2 Type definitions

```typescript
import type { TemplateResult } from "lit";
import type { ThemePreset } from "../types";

export type VariantRenderer<T> = (
  data: T[],
  theme?: ThemePreset,
  limit?: number,
) => TemplateResult;

export type DomainChartConfig<T> = {
  tag: string;
  defaultVariant: string;
  variants: Record<string, VariantRenderer<T>>;
  limit?: number; // default 20
};
```

### 3.3 Factory implementation approach

```typescript
export function defineDomainChart<T>(config: DomainChartConfig<T>): typeof LitElement {
  class GeneratedDomainChart extends LitElement {
    static override properties = {
      data: { type: Array },
      src: {},
      theme: {},
      variant: {},
      limit: { type: Number },
    };

    private fetcher = new DataFetchController<T>(this);

    data?: T[];
    src?: string;
    theme?: ThemePreset;
    variant = config.defaultVariant;
    limit = config.limit ?? 20;

    protected override async updated(changed: Map<string, unknown>): Promise<void> {
      if (changed.has("src") || changed.has("data"))
        await this.fetcher.fetch(this.src ?? "", !!this.data);
    }

    private get resolvedData(): T[] {
      return this.data ?? this.fetcher.data ?? [];
    }

    protected override render(): TemplateResult | void {
      const renderer = config.variants[this.variant];
      if (!renderer) return;
      return renderer(this.resolvedData, this.theme, this.limit);
    }
  }

  customElements.define(config.tag, GeneratedDomainChart);
  return GeneratedDomainChart;
}
```

### 3.4 Key design notes

1. **No `ChartController` or `ThemeController`**: Domain charts delegate rendering to generic charts via HTML templates — they only need data fetching.
2. **No loading/error states**: The embedded generic chart handles its own loading/error/empty UI.
3. **Variant lookup at render time**: `config.variants[this.variant]` — invalid variant renders nothing.
4. **`resolvedData` may be `[]`**: Domain charts pass data to mappers unconditionally; the generic chart handles the empty state.

### 3.5 Consumer transformation example

**Before** (`revisions-chart.visual.ts`, ~69 lines):
```typescript
@customElement("pq-revisions-chart")
export class PqRevisionsChart extends LitElement {
  private fetcher = new DataFetchController<Revision>(this);
  @property({ type: Array }) data?: Revision[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: RevisionsVariant = "bar";
  @property({ type: Number }) limit = 20;
  // ... updated(), resolvedData getter, render() with variant switch
}
```

**After** (~20 lines):
```typescript
export const PqRevisionsChart = defineDomainChart<Revision>({
  tag: "pq-revisions-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) => html`
      <pq-ranked-bar .data=${mapRevisionsToBar(data)} .limit=${limit}
        .theme=${theme} sort="desc" horizontal></pq-ranked-bar>
    `,
    treemap: (data, theme) => html`
      <pq-treemap .data=${mapRevisionsToTreemap(data)} .theme=${theme}
        show-labels></pq-treemap>
    `,
  },
});
```

### 3.6 Type augmentation

```typescript
declare global {
  interface HTMLElementTagNameMap {
    "pq-revisions-chart": InstanceType<typeof PqRevisionsChart>;
  }
}
```

`InstanceType<typeof PqRevisionsChart>` resolves to `LitElement` — acceptable tradeoff since domain charts are consumed via HTML attributes, not TypeScript property access.

---

## 4. Detailed Design: `defineGenericChart<T, Props>()`

### 4.1 File location

`packages/charts/src/generic/define-generic-chart.ts` (plain `.ts`, not `.visual.ts`)

### 4.2 Type definitions

See generic spec (`2026-04-10-generic-chart-factory-spec.md`, Section 3) for full type definitions:
- `BuildConfigContext<T, Props>` — context passed to strategy function
- `BuildConfigFn<T, Props>` — strategy function signature
- `LitPropertyDeclaration` — Lit property descriptor
- `GenericChartConfig<T, Props>` — factory config object

### 4.3 Factory implementation approach

```typescript
export function defineGenericChart<
  T,
  Props extends Record<string, unknown> = Record<string, never>,
>(config: GenericChartConfig<T, Props>): typeof LitElement {

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

  class GenericChart extends LitElement {
    static override styles = sharedStyles;
    static override properties = {
      data: { type: Array },
      src: {},
      theme: {},
      animated: { type: Boolean, attribute: "animated" },
      ...config.properties,
    };

    private fetcher = new DataFetchController<T>(this);
    private chartCtrl = new ChartController(this);
    private themeCtrl = new ThemeController(this);

    data?: T[];
    src?: string;
    theme?: ThemePreset;
    animated = true;

    constructor() {
      super();
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
      const props = Object.fromEntries(
        Object.keys(config.properties).map((key) => [
          key, (this as unknown as Record<string, unknown>)[key],
        ]),
      ) as Props;
      this.chartCtrl.update(config.buildConfig({
        resolved, themeCtrl: this.themeCtrl, chartCtrl: this.chartCtrl, props,
      }));
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

  customElements.define(config.tag, GenericChart);
  return GenericChart;
}
```

### 4.4 Consumer transformation patterns

**Pattern A — Simple (bubble, 2 custom props)**:
```typescript
export const PqBubble = defineGenericChart<BubbleItem, { xLabel: string; yLabel: string }>({
  tag: "pq-bubble",
  properties: { xLabel: { attribute: "x-label" }, yLabel: { attribute: "y-label" } },
  defaults: { xLabel: "", yLabel: "" },
  buildConfig: ({ resolved, themeCtrl, props }) => ({
    type: "bubble",
    data: { datasets: [{ data: resolved.map(i => ({ x: i.x, y: i.y, r: i.r })), ... }] },
    options: { scales: { x: { title: { text: props.xLabel } }, ... } },
  }),
});
```

**Pattern B — Complex (ranked-bar, 3 props + mapper calls)**:
```typescript
export const PqRankedBar = defineGenericChart<RankedBarItem, { limit: number; horizontal: boolean; sort: SortDirection }>({
  tag: "pq-ranked-bar",
  properties: { limit: { type: Number }, horizontal: { type: Boolean }, sort: {} },
  defaults: { limit: 0, horizontal: true, sort: "desc" },
  buildConfig: ({ resolved, themeCtrl, props }) => {
    const sorted = sortItems(resolved, props.sort);
    const sliced = sliceItems(sorted, props.limit);
    return { type: "bar", data: { ... }, options: { indexAxis: props.horizontal ? "y" : "x", ... } };
  },
});
```

**Pattern C — Custom plugin (doughnut, centerLabel)**:
```typescript
export const PqDoughnut = defineGenericChart<DoughnutItem, { showLegend: boolean; centerLabel: string }>({
  tag: "pq-doughnut",
  properties: { showLegend: { type: Boolean, attribute: "show-legend" }, centerLabel: { attribute: "center-label" } },
  defaults: { showLegend: true, centerLabel: "" },
  buildConfig: ({ resolved, themeCtrl, props }) => ({
    type: "doughnut",
    data: { ... },
    options: { plugins: { /* centerLabel plugin logic stays here */ } },
  }),
});
```

---

## 5. Build/Bundle Impact

### 5.1 bunup handles factory output correctly

`bunup` bundles from the three entry points (`src/index.ts`, `src/generic/index.ts`, `src/domain/index.ts`). Both factory functions and their generated classes are included in the appropriate chunks and de-duplicated across entry points.

### 5.2 Declaration files

`tsc` emits `.d.ts` files. Factory `.d.ts` exports the function signature and types. Consumer `.d.ts` files show `typeof LitElement` as the const type.

### 5.3 No new dependencies

Both factories use only `lit` and `chart.js` — already in the dependency list.

### 5.4 `experimentalDecorators` is no longer required by factory consumers

Factory consumers don't use `@property()` or `@customElement()` decorators. However, `experimentalDecorators: true` remains in `tsconfig.json` for other parts of the codebase (controllers, enclosure).

---

## 6. Export Strategy

### 6.1 Generic barrel (`src/generic/index.ts`)

Add:
```typescript
export { defineGenericChart } from "./define-generic-chart";
export type { GenericChartConfig, BuildConfigContext, BuildConfigFn } from "./define-generic-chart";
```

### 6.2 Domain barrel (`src/domain/index.ts`)

Add:
```typescript
export { defineDomainChart } from "./define-domain-chart";
export type { DomainChartConfig, VariantRenderer } from "./define-domain-chart";
```

### 6.3 Root barrel (`src/index.ts`)

No changes — it re-exports `./generic/index` and `./domain/index` via `export *`.

---

## 7. Test Strategy

### 7.1 `define-generic-chart.ts` — unit tests

**File**: `tests/generic/define-generic-chart.test.ts`

15 test cases covering: factory registration, static properties shape, defaults, lifecycle delegation (theme/animate/fetch), renderChart with/without data, buildConfig props snapshot, render states (loading/error/empty/canvas).

See generic spec Section 9 for full test case listing.

### 7.2 `define-domain-chart.ts` — unit tests

**File**: `tests/domain/define-domain-chart.test.ts`

10 test cases covering: factory registration, default variant, variant switching, resolvedData resolution, limit defaults, variant renderer args, unknown variant handling.

### 7.3 Existing tests

No existing tests for `.visual.ts` files (excluded from coverage by convention). Mapper and controller tests are unaffected.

### 7.4 Coverage

- `define-generic-chart.ts` (plain `.ts`) — included in coverage, must be unit tested
- `define-domain-chart.ts` (plain `.ts`) — included in coverage, must be unit tested
- Refactored `.visual.ts` files — excluded from coverage, verified via Storybook

---

## 8. Migration Order

### Phase 1: Generic factory (lower risk, bigger SonarCloud impact)

1. Create `src/generic/define-generic-chart.ts`
2. Write tests for `defineGenericChart`
3. Refactor one component (e.g., `bubble.visual.ts`) as proof-of-concept
4. Verify build + typecheck + existing tests pass
5. Refactor remaining 7 generic components
6. Update barrel exports

### Phase 2: Domain factory

1. Create `src/domain/define-domain-chart.ts`
2. Write tests for `defineDomainChart`
3. Refactor one component (e.g., `revisions-chart.visual.ts`) as proof-of-concept
4. Verify build + typecheck + existing tests pass
5. Refactor remaining 16 domain components
6. Update barrel exports

### Why this order

Generic charts contain the actual SonarCloud duplication (268 lines, 28 blocks). Domain charts show 0% duplication in SonarCloud but benefit from reduced boilerplate. Doing generic first delivers the measurable SonarCloud improvement early.

---

## 9. Risk Assessment

### Low risk

| Risk | Mitigation |
|------|-----------|
| `HTMLElementTagNameMap` loses specific types for factory-created charts | Acceptable — charts are consumed via HTML attributes, not TS property access |
| `(this as unknown as Record<string, unknown>)` escape hatch in constructor | Isolated inside factory — no consumer ever sees it |
| Hot-reload double-registration | Guard with `customElements.get(tag)` before `define` |

### Medium risk

| Risk | Mitigation |
|------|-----------|
| `bun-automock` cannot mock controllers in factory closure | Fallback: use manual mock classes matching the controller interfaces |
| Props snapshot `Object.fromEntries` cast is not fully typesafe | Isolated inside factory; `Props` generic ensures consumer-facing type safety |
| Treemap uses Chart.js treemap plugin — `ChartConfiguration` type narrowing | Treemap's `buildConfig` returns unparameterized `ChartConfiguration`; plugin types are used inside the function body only |

### Non-risks (verified)

| Concern | Why it's not a risk |
|---------|-------------------|
| Controller lifecycle in factory-generated constructor | Lit 3.x supports `addController()` in constructors — all existing components already do this |
| bunup output with factory-generated classes | bunup uses esbuild, which handles class expressions correctly |
| `static override styles` on factory class | Lit 3.x correctly applies static styles from any LitElement subclass |

---

## 10. File Inventory

### New files (4)

| File | Purpose | Suffix | Coverage |
|------|---------|--------|----------|
| `src/generic/define-generic-chart.ts` | Generic chart factory + types | `.ts` | Yes |
| `src/domain/define-domain-chart.ts` | Domain chart factory + types | `.ts` | Yes |
| `tests/generic/define-generic-chart.test.ts` | Generic factory tests | `.test.ts` | N/A |
| `tests/domain/define-domain-chart.test.ts` | Domain factory tests | `.test.ts` | N/A |

### Modified files (28)

| File | Change |
|------|--------|
| `src/generic/index.ts` | Add `defineGenericChart` + type exports |
| `src/domain/index.ts` | Add `defineDomainChart` + type exports |
| 8x `src/generic/*.visual.ts` | Rewrite as `defineGenericChart()` calls |
| 17x `src/domain/*.visual.ts` | Rewrite as `defineDomainChart()` calls |
| `src/domain/summary-cards.visual.ts` | **KEEP AS-IS** (custom component) |

### Untouched files

| File | Reason |
|------|--------|
| `src/generic/enclosure.visual.ts` | D3-based, excluded |
| `src/controllers/*` | No changes |
| `src/mappers/*` | No changes |
| `src/types.ts` | No changes |
| `src/themes/*` | No changes |

---

## 11. Estimated Impact

| Metric | Before | After |
|--------|--------|-------|
| Total lines (8 generic components) | ~1,024 | ~410 |
| Total lines (17 domain components) | ~1,100 | ~450 |
| New factory files | 0 | ~150 |
| Net line reduction | — | ~1,115 lines |
| SonarCloud duplication | 6.0% | <1.5% (estimated) |
| Test files added | 0 | 2 |
