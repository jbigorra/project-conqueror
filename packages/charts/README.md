# @prj-conq/charts

Reusable Web Components built with Lit + Chart.js for visualizing behavioural code analysis results.

## Installation

Monorepo-internal package:

```bash
pnpm add @prj-conq/charts@workspace:^
```

## Usage

### Generic components (data-driven)

```html
<!-- Pass data inline -->
<pq-bubble
  .data=${[{ label: "foo.ts", x: 10, y: 5, r: 20 }]}
  theme="dark"
  x-label="Revisions"
  y-label="Complexity"
></pq-bubble>

<!-- Or fetch from a URL -->
<pq-ranked-bar src="/api/revisions" theme="pico"></pq-ranked-bar>
```

```typescript
import "@prj-conq/charts/generic";
// Now <pq-bubble>, <pq-ranked-bar>, <pq-treemap>, etc. are registered
```

### Domain-specific components (analysis-aware)

```html
<!-- Hotspots chart with variant switching -->
<pq-hotspots-chart
  .data=${hotspotsData}
  variant="enclosure"
  theme="dark"
></pq-hotspots-chart>

<!-- Coupling chart -->
<pq-coupling-chart src="/api/coupling" theme="pico"></pq-coupling-chart>
```

```typescript
import "@prj-conq/charts/domain";
// Now <pq-hotspots-chart>, <pq-coupling-chart>, etc. are registered
```

### Using mappers directly

```typescript
import { mapHotspotsToBubble, mapRevisionsToBar } from "@prj-conq/charts";

// Transform analysis data into chart-ready format
const bubbleData = mapHotspotsToBubble(hotspots);
const barData = mapRevisionsToBar(revisions);
```

### Theming

Three built-in presets: `dark`, `light`, `pico`. Override via CSS custom properties:

```css
pq-bubble {
  --pq-chart-bg: #1a1a2e;
  --pq-chart-text: #e0e0e0;
  --pq-chart-grid: #333;
  --pq-chart-border: #444;
  --pq-chart-tooltip-bg: #222;
  --pq-chart-font-family: "Inter", sans-serif;
  --pq-chart-font-size: 14;
  --pq-chart-accent-1: #ff6384;
  --pq-chart-accent-2: #36a2eb;
  /* ... up to --pq-chart-accent-8 */
}
```

## API Overview

### Generic Components (`@prj-conq/charts/generic`)

Reusable chart Web Components accepting typed data arrays:

| Component | Tag | Data Type | Description |
|-----------|-----|-----------|-------------|
| `PqBubble` | `<pq-bubble>` | `BubbleItem[]` | Bubble chart (x, y, radius) |
| `PqRankedBar` | `<pq-ranked-bar>` | `RankedBarItem[]` | Sorted horizontal bar chart |
| `PqStackedBar` | `<pq-stacked-bar>` | `StackedBarItem[]` | Stacked bar chart |
| `PqGroupedBar` | `<pq-grouped-bar>` | `GroupedBarItem[]` | Grouped bar chart |
| `PqHistogram` | `<pq-histogram>` | `HistogramItem[]` | Histogram (auto-bins values) |
| `PqDoughnut` | `<pq-doughnut>` | `DoughnutItem[]` | Doughnut/pie chart |
| `PqLineArea` | `<pq-line-area>` | `LineAreaPoint[]` | Line/area chart with multiple series |
| `PqTreemap` | `<pq-treemap>` | `TreemapItem[]` | Treemap chart |
| `PqEnclosure` | `<pq-enclosure>` | Enclosure data | D3 circle-packing enclosure diagram |

All generic components support: `data` (inline array), `src` (fetch URL), `theme` (preset name), `animated` (toggle animations).

### Domain Components (`@prj-conq/charts/domain`)

Pre-wired components that accept analysis result types directly and pick the right visualization:

`PqRevisionsChart`, `PqAuthorsChart`, `PqCouplingChart`, `PqSocChart`, `PqHotspotsChart`, `PqAbsChurnChart`, `PqAuthorChurnChart`, `PqEntityChurnChart`, `PqEffortChart`, `PqOwnershipChart`, `PqMainDevChart`, `PqMainDevRevsChart`, `PqRefactoringDevChart`, `PqFragmentationChart`, `PqCommunicationChart`, `PqAgeChart`, `PqMessagesChart`, `PqSummaryCards`

### Mappers

Transform analysis result records into chart-ready data structures:

- **Revisions**: `mapRevisionsToBar`, `mapRevisionsToTreemap`
- **Authors**: `mapAuthorsToBar`, `mapAuthorsToTreemap`
- **Churn**: `mapAbsChurnToLineArea`, `mapAuthorChurnToGrouped`, `mapAuthorChurnToStacked`, `mapEntityChurnToGrouped`, `mapEntityChurnToStacked`
- **Coupling**: `mapCouplingToBar`, `mapCouplingToBubble`
- **Communication**: `mapCommunicationToBar`, `mapCommunicationToBubble`
- **Effort**: `mapEffortToDoughnut`, `mapEffortToStacked`
- **Ownership**: `mapOwnershipToDoughnut`, `mapOwnershipToStacked`
- **Fragmentation**: `mapFragmentationToBar`, `mapFragmentationToDoughnut`
- **Main Dev**: `mapMainDevToBar`, `mapMainDevToTreemap`, `mapRefactoringDevToBar`, `mapRefactoringDevToTreemap`
- **Hotspots**: `mapHotspotsToBubble`, `mapHotspotsToTreemap`, `mapHotspotsToEnclosure`, `buildHotspotsTree`
- **Age**: `mapAgeToBar`, `mapAgeToHistogram`
- **Messages**: `mapMessagesToBar`
- **SoC**: `mapSocToBar`
- **Utilities**: `sortItems`, `sliceItems`, `buildStackedDatasets`, `buildGroupedDatasets`, `buildLineAreaDatasets`, `binValues`

### Controllers (Lit ReactiveControllers)

- **`ChartController`** -- Manages Chart.js lifecycle (create, update, destroy, resize).
- **`DataFetchController`** -- Fetches data from a `src` URL with loading/error/success states.
- **`ThemeController`** -- Resolves theme presets + CSS custom property overrides into Chart.js options.

### Theme Presets

- **`dark`**, **`light`**, **`pico`** -- Pre-configured `ThemeValues` objects.
- **`resolveTheme(preset, cssOverrides)`** -- Merges preset with CSS custom property overrides.
- **`toChartJsOptions(theme)`** -- Converts `ThemeValues` to Chart.js global options.

### Types

`RankedBarItem`, `StackedBarItem`, `GroupedBarItem`, `BubbleItem`, `LineAreaPoint`, `HistogramItem`, `DoughnutItem`, `TreemapItem`, `ThemePreset`, `SortDirection`, `FetchState`

## Development

```bash
bun test                    # Run all tests
bun run tdd                 # Watch mode
bun run test:coverage       # Coverage report
bun run typecheck           # Type-check
bun run validate            # test + biome check
bun run check               # Biome lint + format
bun run build               # Build with bunup + tsc declarations
bun run dev                 # Watch mode build
bun run storybook           # Start Storybook dev server (port 6006)
bun run build-storybook     # Build static Storybook
```

### Project Structure

```
src/
  chart-setup.ts        # Chart.js plugin registration (bar, bubble, doughnut, treemap, etc.)
  types.ts              # Shared data types for all chart components
  generic/              # Reusable chart components (PqBubble, PqTreemap, etc.)
  domain/               # Analysis-specific components (PqHotspotsChart, PqCouplingChart, etc.)
  mappers/              # Data transformation: analysis results -> chart data
  controllers/          # Lit ReactiveControllers (chart lifecycle, data fetching, theming)
  themes/               # Theme presets (dark, light, pico) and ThemeValues type
```

## Contributing

- All public API exports MUST have JSDoc (`@param`, `@returns`, `@example`)
- Biome strict mode enforced: `noExplicitAny`, `noUnusedVariables`, `noNonNullAssertion`
- Tests mirror `src/` structure under `tests/`
- Run `bun run validate` before committing
