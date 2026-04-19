# @prj-conq/charts — Design Spec

A reusable Web Components library that renders charts for all analyses supported by the behave package. Components are testable via Storybook and consumable in any HTML context (HTMX webapp, Electrobun desktop app, or plain HTML).

## Technology Stack

- **Component framework:** Lit (Web Components)
- **Charting engine:** Chart.js + `chartjs-chart-treemap` plugin
- **Build:** bunup (ESM + DTS)
- **Testing:** Bun test runner (unit logic) + Storybook `@storybook/web-components-vite` (visual)
- **Linting/Formatting:** Biome
- **Package name:** `@prj-conq/charts`
- **Tag prefix:** `pq-`

## Prerequisites

Before implementation begins:

1. **Behave must export analysis data types.** Currently `@prj-conq/behave` does not export record types (`Revision`, `Coupling`, `ComplexityHotspot`, etc.) from its public API. The behave package index must be updated to re-export all analysis schema types from `schemas/code-maat.ts`. Additionally, behave's bunup config currently has `dts: false` — this must be changed to emit `.d.ts` declarations so the charts package can consume them as a peer dependency.

2. **TypeScript decorator configuration.** Lit uses the legacy/experimental TypeScript decorator syntax (`@customElement`, `@property`). The charts package tsconfig must set `experimentalDecorators: true` and `useDefineForClassFields: false`. bunup (via esbuild) supports this transform.

## Architecture

### Composition over Inheritance

All components extend `LitElement` directly. Shared behavior is provided by three Reactive Controllers — no BaseChart superclass, no deep inheritance chains.

**DataFetchController:**
- Watches `src` attribute for URL changes
- Fetches JSON when `src` is set and `data` property is not
- Exposes `.state`: idle | loading | success | error
- Emits `chart-data-loaded` / `chart-error` custom events
- Property `data` always takes priority over fetch

**ChartController:**
- Creates and destroys the Chart.js instance
- Manages `<canvas>` ref via Lit's `createRef()`
- ResizeObserver on the host element for responsive sizing
- Exposes `.update(config)` to re-render the chart
- Handles animation enable/disable
- Wires click interactions → `chart-click` custom event with data point details

**ThemeController:**
- Reads `--pq-chart-*` CSS custom properties from the host via `getComputedStyle()`
- Applies preset values first if `theme` attribute is set, then reads overrides
- Maps collected values into a Chart.js `options` partial (scales, plugins, font, colors)
- Exposes `.colors` array (8 accent colors) for dataset color assignment
- Re-reads and triggers host update on attribute change

### Two-Layer Component Design

**Generic layer** — 8 reusable chart components with universal data shapes:

| Component | Tag | Data Shape | Key Props |
|---|---|---|---|
| Ranked Bar | `pq-ranked-bar` | `{ label, value }[]` | `limit`, `horizontal` (default true), `sort` (asc/desc/none) |
| Stacked Bar | `pq-stacked-bar` | `{ label, segments: { key, value }[] }[]` | `limit`, `horizontal`, `show-legend` |
| Grouped Bar | `pq-grouped-bar` | `{ label, groups: { key, value }[] }[]` | `limit`, `horizontal`, `show-legend` |
| Bubble | `pq-bubble` | `{ label, x, y, r }[]` | `x-label`, `y-label`, `scale-r` |
| Line / Area | `pq-line-area` | `{ x, series: { key, value }[] }[]` | `fill` (area mode), `stacked`, `x-label`, `y-label` |
| Histogram | `pq-histogram` | `{ value }[]` (raw, component bins them) | `bins` (number or custom brackets), `x-label`, `y-label` |
| Doughnut | `pq-doughnut` | `{ label, value }[]` | `show-legend`, `center-label` |
| Treemap | `pq-treemap` | `{ path: string[], value, color? }[]` | `color-field`, `show-labels` |

All generic components share: responsive sizing, themed tooltips, `chart-click` events, optional `animate="false"`, named slots for loading/error/empty states.

**Domain layer** — 18 thin wrappers that map analysis data to generic charts:

| Wrapper Tag | Analysis | Variants | Field Mapping |
|---|---|---|---|
| `pq-revisions-chart` | revisions | **bar**, treemap | entity→label, nRevs→value |
| `pq-authors-chart` | authors | **bar**, treemap | entity→label, nAuthors→value |
| `pq-coupling-chart` | coupling | **bubble**, bar | "entity↔coupled"→label, degree→y, averageRevs→x, degree→r |
| `pq-soc-chart` | soc | **bar** | entity→label, soc→value |
| `pq-abs-churn-chart` | abs-churn | **area** (fill=true), line (fill=false) | date→x, added/deleted→series. Both variants use `pq-line-area` — `variant="area"` sets `fill=true`, `variant="line"` sets `fill=false`. |
| `pq-author-churn-chart` | author-churn | **grouped**, stacked | author→label, added/deleted/commits→groups |
| `pq-entity-churn-chart` | entity-churn | **grouped**, stacked | entity→label, added/deleted/commits→groups |
| `pq-ownership-chart` | entity-ownership | **stacked**, doughnut | entity→label, author→segment key, added→segment value |
| `pq-main-dev-chart` | main-dev | **bar**, treemap | entity→label, ownership→value, mainDev→color group |
| `pq-main-dev-revs-chart` | main-dev-by-revs | **bar**, treemap | (same as main-dev) |
| `pq-refactoring-dev-chart` | refactoring-main-dev | **bar**, treemap | entity→label, ownership→value, mainDev→color group |
| `pq-effort-chart` | entity-effort | **stacked**, doughnut | entity→label, author→segment key, authorRevs→segment value |
| `pq-fragmentation-chart` | fragmentation | **bar**, doughnut | entity→label, fractalValue→value |
| `pq-communication-chart` | communication | **bubble**, bar | "author↔peer"→label, shared→x, average→y, strength→r |
| `pq-messages-chart` | messages | **bar** | entity→label, matches→value |
| `pq-age-chart` | age | **histogram**, bar | ageMonths→value (histogram), entity→label (bar) |
| `pq-hotspots-chart` | complexity-hotspots | **bubble**, treemap | entity→label, nRevs→x, cyclomaticComplexity→y, nRevs→r |
| `pq-summary-cards` | summary | **cards** (HTML, no chart) | statistic→label, value→display value |

**Note on `pq-summary-cards`:** This is a special case — it renders KPI-style HTML cards, not a Chart.js chart. It uses only `DataFetchController` (for `src` fetch support) but not `ChartController` or `ThemeController`. It reads `--pq-chart-text` and `--pq-chart-bg` CSS properties directly for consistency with the theme system but does not manage a `<canvas>`.

Bold = default variant. Domain wrappers compose generic charts via Lit templates (not inheritance). Each accepts a `variant` attribute to switch chart types.

### Dual Data Input

All components support two modes:
- **Property:** `.data=${analysisResult}` — consumer provides data directly (Electrobun, programmatic use)
- **Attribute:** `src="/api/analyses/revisions/42"` — component fetches JSON (HTMX pages, declarative HTML)

Property takes priority. If both are set, `data` wins. If only `src` is set, component fetches on connect and on `src` change.

### Customizable States via Slots

Generic components expose named slots for loading, error, and empty states:

```html
<pq-ranked-bar .data=${data}>
  <div slot="loading">Crunching numbers...</div>
  <div slot="empty">No revisions found. Upload a git log first.</div>
</pq-ranked-bar>
```

Default slot content is provided when no override is given.

## Theming

### CSS Custom Properties

Every chart reads these from its host element. Set at any level (document, container, individual chart) for cascading control.

| Property | Purpose | Dark Default |
|---|---|---|
| `--pq-chart-bg` | Canvas background | `transparent` |
| `--pq-chart-text` | Labels, ticks, legends | `#e0e0e0` |
| `--pq-chart-grid` | Grid lines | `rgba(255,255,255,0.1)` |
| `--pq-chart-border` | Chart/tooltip border | `rgba(255,255,255,0.2)` |
| `--pq-chart-tooltip-bg` | Tooltip background | `#1e1e1e` |
| `--pq-chart-font-family` | All chart text | `system-ui, sans-serif` |
| `--pq-chart-font-size` | Base font size | `12px` |
| `--pq-chart-accent-1` … `-8` | Data series palette | Curated 8-color palette |
| `--pq-chart-danger` | Negative/warning values | `#e06c75` |

### Preset Themes

Three presets ship as both JS objects and CSS stylesheets:
- **dark** — dark background, high contrast accents (One Dark inspired). Default.
- **light** — white background, deeper accents for readability.
- **pico** — matches Pico CSS dark theme, uses Pico color variables where possible.

Applied via `theme` attribute, CSS cascade, or stylesheet import:

```html
<pq-ranked-bar theme="dark" .data=${data}></pq-ranked-bar>

<div style="--pq-chart-accent-1: hotpink;">
  <pq-ranked-bar .data=${data}></pq-ranked-bar>
</div>

<link rel="stylesheet" href="@prj-conq/charts/themes/dark.css">
```

## Package Structure

```
packages/charts/
├── src/
│   ├── controllers/              # DataFetchController, ChartController, ThemeController
│   ├── generic/                  # 8 generic chart components
│   ├── domain/                   # 18 domain wrapper components
│   ├── mappers/                  # Pure data mapping functions (unit-testable)
│   ├── themes/                   # dark.ts, light.ts, pico.ts
│   ├── types.ts                  # Shared types (RankedBarItem, BubbleItem, etc.)
│   └── index.ts                  # Public barrel export
├── tests/
│   ├── mappers/                  # Unit tests for data mapping
│   ├── controllers/              # Unit tests for controller logic
│   └── fixtures/                 # Shared test data (one per analysis type)
├── stories/
│   ├── generic/                  # Stories for each generic component
│   ├── domain/                   # Stories for each domain wrapper (with variants)
│   └── themes/                   # Side-by-side theme comparison
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── package.json
├── tsconfig.json
└── bunup.config.ts
```

## Dependencies

**Production:** `lit`, `chart.js`, `chartjs-chart-treemap`

**Dev:** `@storybook/web-components-vite`, `@prj-conq/typescript-config`, `bunup`, `@biomejs/biome`

**Peer:** `@prj-conq/behave` (types only — domain wrappers import analysis types, erased at build time, no runtime dependency)

## Package Exports

```json
{
  "name": "@prj-conq/charts",
  "type": "module",
  "exports": {
    ".":          "./dist/index.js",
    "./generic":  "./dist/generic/index.js",
    "./domain":   "./dist/domain/index.js",
    "./themes/*": "./dist/themes/*.css"
  },
  "scripts": {
    "build":      "bunup",
    "dev":        "bunup --watch",
    "test":       "bun test",
    "tdd":        "bun test --watch",
    "storybook":  "storybook dev -p 6006",
    "typecheck":  "tsc --noEmit",
    "lint":       "biome check src/",
    "format":     "biome format --write src/"
  }
}
```

Subpath exports allow consumers to import only what they need.

## Turbo Integration

Charts builds after behave (needs its types):

```json
{
  "tasks": {
    "@prj-conq/charts#build": {
      "dependsOn": ["@prj-conq/behave#build"]
    }
  }
}
```

## Testing Strategy

**Storybook** owns visual correctness:
- Generic stories: default, empty, loading, error, large dataset, interactive controls
- Domain stories: each variant with realistic fixture data, variant switcher
- Theme stories: same chart rendered with all 3 themes side by side

**Bun tests** own logic correctness:
- Data mapping functions (pure functions, no DOM)
- Sorting and limiting behavior
- Histogram binning
- Theme preset resolution and override merging
- Treemap path splitting

**Fixtures:** One file per analysis type in `tests/fixtures/`, shared between stories and tests.

## Design Rationale

**Lit over Alpine/Stimulus:** Web Components are framework-agnostic — work in HTMX pages, Electrobun, and any HTML environment. Alpine and Stimulus would couple consumers to those frameworks.

**Composition over inheritance:** Three Reactive Controllers instead of a BaseChart superclass. Avoids the fragile base class problem, keeps the hierarchy flat (everything is just LitElement), and allows flexible behavior mixing.

**Chart.js over D3:** Chart.js is higher-level, lighter weight, and covers all needed chart types via plugins. D3 would be more powerful for network graphs but overkill for this use case.

**Two-layer design:** Generic charts are reusable beyond behave analyses. Domain wrappers provide zero-config convenience. The generic layer can be independently imported via subpath exports.

**Multiple variants per analysis:** Rather than choosing a single chart type upfront, domain wrappers support a `variant` attribute. The best visualization for each analysis will be determined through actual usage experience.

**CodeScene-informed chart choices:** Chart type mapping was informed by CodeScene's visualization approach — treemaps for hierarchical file data, bubble charts for multi-dimensional metrics, histograms for distributions, stacked bars for ownership breakdowns.

## Deferred / Out of Scope

**Accessibility:** Chart.js has limited built-in accessibility (canvas-based rendering). Keyboard navigation, ARIA labels, and screen reader support for chart components are deferred to a future iteration. The current scope focuses on visual correctness and component API design.
