# CLAUDE.md — @prj-conq/charts

## What This Package Does

Reusable chart Web Components for visualizing behavioural code analysis results. Built with Lit + Chart.js + D3. Consumed by `@prj-conq/webapp` to render analysis data (hotspots, churn, coupling, etc.) in the browser. Each domain chart maps analysis-specific data to a generic chart type.

## Key Files

- `src/index.ts` — Main barrel: re-exports controllers, domain charts, generics, mappers, themes, types
- `src/types.ts` — Shared data types: `RankedBarItem`, `BubbleItem`, `TreemapItem`, `ThemePreset`, etc.
- `src/chart-setup.ts` — Chart.js global registration (plugins, scales)
- `src/controllers/` — Lit reactive controllers: `ChartController` (Chart.js lifecycle), `DataFetchController` (fetch from URL), `ThemeController` (CSS variable theming)
- `src/generic/` — Base chart components: `pq-bubble`, `pq-doughnut`, `pq-enclosure`, `pq-grouped-bar`, `pq-histogram`, `pq-line-area`, `pq-ranked-bar`, `pq-stacked-bar`, `pq-treemap`
- `src/domain/` — Analysis-specific charts: `pq-hotspots-chart`, `pq-revisions-chart`, `pq-coupling-chart`, etc. + `pq-summary-cards`
- `src/mappers/` — Transform analysis records to generic chart data shapes
- `src/themes/` — CSS + TS theme presets: `dark`, `light`, `pico`
- `biome.json` — Biome linter/formatter config
- `.storybook/` — Storybook v10 config

## Commands

```bash
bun test                # Run all tests
bun test --coverage     # Tests with coverage
bun test --watch        # TDD watch mode
bun run build           # bunup + tsc declaration emit
bun run dev             # bunup --watch
bun run typecheck       # tsc --noEmit
bun run validate        # Tests + biome check
bun run check           # biome check --write
bun run storybook       # Storybook dev on port 6006
bun run build-storybook # Build static storybook
```

## Architecture / Patterns

**Three-Layer Component Design**:
1. **Generic components** (`src/generic/`) — Chart.js/D3 wrappers that accept normalized data types. Framework-agnostic, reusable.
2. **Domain components** (`src/domain/`) — Accept analysis-specific data (e.g., `ComplexityHotspot[]`), delegate rendering to generic components.
3. **Mappers** (`src/mappers/`) — Pure functions that transform domain records to generic chart data shapes.

**Lit Reactive Controllers** — `ChartController` manages Chart.js instance lifecycle (create/update/destroy), `ResizeObserver` integration, and `chart-click` custom events. `ThemeController` resolves CSS variables from theme presets.

**Data Loading** — `DataFetchController` fetches JSON from a `src` URL attribute or accepts inline `data` property. Components render loading/error states.

**Multi-export** — Three export paths: `.` (everything), `./generic` (base charts only), `./domain` (analysis charts only). Themes exported as CSS via `./themes/*`.

## Testing Conventions

- **Framework**: Bun test runner
- **File layout**: `tests/` mirrors `src/` — `tests/controllers/`, `tests/mappers/`
- **Mocking**: `bun-automock` + custom mocks in `tests/helpers/` (mock-fetch, mock-host)
- **Fixtures**: `tests/fixtures/` with analysis-specific data fixtures per chart type
- **Focus**: Mappers are pure functions (unit-testable); controllers tested with mock hosts

## Export Rules

Three export paths defined in `package.json`:
- `.` → full library (controllers, domain, generic, mappers, themes, types)
- `./generic` → base chart components only
- `./domain` → analysis-specific chart components only
- `./themes/*` → CSS theme files

Built with `bunup` + `tsc -p tsconfig.build.json` for declaration files.

## Standards

- All public API exports MUST have JSDoc with @param, @returns, @example
- Biome strict mode: noExplicitAny, noUnusedVariables, noNonNullAssertion
- Tests mirror src/ structure under tests/
- VCS-aware formatting: only changed files are linted (--changed flag)
