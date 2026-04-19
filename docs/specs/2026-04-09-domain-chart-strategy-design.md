# Domain Chart Strategy Pattern — Eliminate Duplication

**Date**: 2026-04-09
**Status**: APPROVED
**Package**: `@prj-conq/charts`
**Scope**: `src/domain/*.visual.ts` (18 files)

---

## Problem

The 18 domain chart components share ~90% identical boilerplate:
- `DataFetchController<T>` instantiation
- Same 5 `@property` declarations (`data`, `src`, `theme`, `variant`, `limit`)
- Identical `updated()` method (fetch on src/data change)
- Identical `resolvedData` getter (data ?? fetcher.data ?? [])
- `render()` that switches on `variant` to delegate to a generic chart

Only 3 things vary per component: the **data type**, the **mapper functions**, and the **available variants**. SonarCloud flags 9.8% duplication on new code.

### Exception: `summary-cards.visual.ts`

This component does NOT follow the variant pattern — it has custom styles, custom rendering logic, and no variant switching. It must remain a standalone class. The factory applies to the other 17 components.

---

## Solution: `defineDomainChart<T>()` Factory

### Core Types

```typescript
type VariantRenderer<T> = (
  data: T[],
  theme?: ThemePreset,
  limit?: number,
) => TemplateResult;

type DomainChartConfig<T> = {
  tag: string;
  defaultVariant: string;
  variants: Record<string, VariantRenderer<T>>;
  limit?: number; // default limit for bar variants, default 20
};
```

### Factory Function

```typescript
function defineDomainChart<T>(config: DomainChartConfig<T>): typeof LitElement
```

The factory:
1. Creates a Lit class with `DataFetchController<T>`
2. Registers the 5 standard properties (`data`, `src`, `theme`, `variant`, `limit`)
3. Implements `updated()` with the standard fetch pattern
4. Implements `resolvedData` getter
5. Implements `render()` that looks up `config.variants[this.variant]` and calls it
6. Calls `customElement(config.tag)` to register
7. Returns the class (for type augmentation of `HTMLElementTagNameMap`)

### Consumer Example

```typescript
// revisions-chart.visual.ts — BEFORE: 60 lines
// revisions-chart.visual.ts — AFTER:

import type { Revision } from "@prj-conq/behave";
import { html } from "lit";
import { mapRevisionsToBar, mapRevisionsToTreemap } from "../mappers/revisions.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";
import "../generic/treemap.visual";

export const PqRevisionsChart = defineDomainChart<Revision>({
  tag: "pq-revisions-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) => html`
      <pq-ranked-bar .data=${mapRevisionsToBar(data)} .limit=${limit} .theme=${theme} sort="desc" horizontal></pq-ranked-bar>
    `,
    treemap: (data, theme) => html`
      <pq-treemap .data=${mapRevisionsToTreemap(data)} .theme=${theme} show-labels></pq-treemap>
    `,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-revisions-chart": InstanceType<typeof PqRevisionsChart>;
  }
}
```

### Hotspots (3 variants, including enclosure)

```typescript
export const PqHotspotsChart = defineDomainChart<ComplexityHotspot>({
  tag: "pq-hotspots-chart",
  defaultVariant: "bubble",
  variants: {
    bubble: (data, theme) => html`
      <pq-bubble .data=${mapHotspotsToBubble(data)} .theme=${theme}></pq-bubble>
    `,
    treemap: (data, theme) => html`
      <pq-treemap .data=${mapHotspotsToTreemap(data)} .theme=${theme} show-labels></pq-treemap>
    `,
    enclosure: (data, theme) => html`
      <pq-enclosure .data=${mapHotspotsToEnclosure(data)} .theme=${theme}></pq-enclosure>
    `,
  },
});
```

---

## Affected Files

| File | Action |
|------|--------|
| `src/domain/define-domain-chart.ts` | CREATE — factory function + types |
| 17x `src/domain/*.visual.ts` | REWRITE — replace class with `defineDomainChart()` call |
| `src/domain/summary-cards.visual.ts` | KEEP AS-IS — custom component, not the variant pattern |
| `src/domain/index.ts` | UPDATE — barrel exports may change if class names change |
| `tests/` | UPDATE — if any tests reference domain component internals |

---

## Constraints

- `defineDomainChart` lives in `src/domain/define-domain-chart.ts` — NOT a `.visual.ts` file since it's testable logic
- The factory MUST register the custom element (via `customElement()` decorator or `customElements.define()`)
- Returned class must be compatible with `HTMLElementTagNameMap` type augmentation
- JSDoc on each domain chart file must be preserved (move to a comment above the `defineDomainChart` call or use a `@customElement` JSDoc block)
- Existing HTML usage (`<pq-revisions-chart>`, etc.) must not break — same tag names, same attributes

---

## Out of Scope

- Changing the generic chart components
- Modifying mappers
- Adding new variants to existing charts
- Changing `summary-cards` to use the factory
