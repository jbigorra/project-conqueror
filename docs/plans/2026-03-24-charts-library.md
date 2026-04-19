# @prj-conq/charts Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Lit Web Components library wrapping Chart.js that renders charts for all 18 behave analyses + 1 aggregated analysis, testable via Storybook.

**Architecture:** Composition-based — 3 Reactive Controllers (DataFetch, Chart, Theme) provide shared behavior. 8 generic chart components accept universal data shapes. 18 domain wrappers compose generic charts via templates, mapping analysis-specific fields. Pure mapper functions are extracted for unit testing.

**Tech Stack:** Lit, Chart.js, chartjs-chart-treemap, Storybook (web-components-vite), Bun test runner, bunup, Biome

**Design spec:** `docs/superpowers/specs/2026-03-24-charts-library-design.md`

---

## Chunk 1: Prerequisites + Package Scaffold

### Task 1: Export schema types from behave

Behave's public API does not currently export the analysis record types (Revision, Coupling, etc.). The charts package needs these for typed domain wrappers.

**Files:**
- Modify: `packages/behave/src/index.ts`
- Modify: `packages/behave/bunup.config.ts`

- [ ] **Step 1: Add type exports to behave's index.ts**

Add these lines to `packages/behave/src/index.ts`:

```typescript
// Analysis record types — for consumers that need typed analysis results
export type {
	Revision,
	Author,
	Coupling,
	Soc,
	SummaryEntry,
	AbsChurn,
	AuthorChurn,
	EntityChurn,
	EntityOwnership,
	MainDev,
	RefactoringMainDev,
	EntityEffort,
	MainDevByRevs,
	Fragmentation,
	Communication,
	MessageEntry,
	CodeAge,
} from "./schemas/code-maat";
export type { ComplexityHotspot } from "./pipeline/transform/merge-by-entity";
```

- [ ] **Step 2: Enable DTS generation in behave's bunup config**

In `packages/behave/bunup.config.ts`, replace `dts: false` with `dts: true`:

```typescript
import { defineConfig } from "bunup";
import { copy } from "bunup/plugins";

export default defineConfig({
  name: "@prj-conq/behave",
  entry: "src/index.ts",
  outDir: "dist",
  dts: true,
  noExternal: [
    "@prj-conq/code-maat-port",
    "@prj-conq/lizard-ts",
    "@prj-conq/lib",
  ],
  exports: true,
  format: "esm",
  sourcemap: "linked",
  plugins: [
    copy(
      "src/legacy/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar",
    ).to("infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar"),
  ],
});
```

- [ ] **Step 3: Add types field to behave's package.json exports**

Update `packages/behave/package.json` exports:

```json
"exports": {
  ".": {
    "import": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "./package.json": "./package.json"
}
```

- [ ] **Step 4: Build behave and verify DTS generation**

Run: `cd packages/behave && pnpm run build`
Expected: Build succeeds, `dist/index.d.ts` exists and contains exported types.

Run: `ls packages/behave/dist/index.d.ts`
Expected: File exists.

- [ ] **Step 5: Run behave tests to verify nothing broke**

Run: `cd packages/behave && bun test`
Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/behave/src/index.ts packages/behave/bunup.config.ts packages/behave/package.json
git commit -m "feat(behave): export analysis schema types and enable DTS generation"
```

---

### Task 2: Scaffold packages/charts

Create the package directory with all config files following existing monorepo conventions.

**Files:**
- Create: `packages/charts/package.json`
- Create: `packages/charts/tsconfig.json`
- Create: `packages/charts/bunup.config.ts`
- Create: `packages/charts/biome.json`
- Create: `packages/charts/bunfig.toml`
- Create: `packages/charts/src/index.ts`
- Create: `packages/charts/src/generic/index.ts`
- Create: `packages/charts/src/domain/index.ts`

- [ ] **Step 1: Create package.json**

Create `packages/charts/package.json`:

```json
{
  "name": "@prj-conq/charts",
  "description": "Reusable chart Web Components for visualizing behavioural code analysis results.",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "files": [
    "dist"
  ],
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./generic": {
      "import": {
        "types": "./dist/generic/index.d.ts",
        "default": "./dist/generic/index.js"
      }
    },
    "./domain": {
      "import": {
        "types": "./dist/domain/index.d.ts",
        "default": "./dist/domain/index.js"
      }
    },
    "./package.json": "./package.json"
  },
  "engines": {
    "bun": ">=1.3.11"
  },
  "scripts": {
    "build": "CI=true bunup",
    "dev": "bunup --watch",
    "test": "bun test",
    "test:coverage": "bun test --coverage",
    "tdd": "bun test --watch",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "typecheck": "tsc --noEmit",
    "lint": "biome check src/ tests/",
    "format": "biome format --write src/ tests/"
  },
  "keywords": [
    "charts",
    "web-components",
    "lit",
    "chart.js",
    "code-analysis",
    "visualization"
  ],
  "author": "Juan Bigorra <jbigorra.soft.eng@pm.me>",
  "license": "ISC",
  "packageManager": "pnpm@10.32.1",
  "dependencies": {
    "chart.js": "^4.4.9",
    "chartjs-chart-treemap": "^3.1.0",
    "lit": "^3.3.0"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.6",
    "@prj-conq/behave": "workspace:*",
    "@prj-conq/typescript-config": "workspace:*",
    "@storybook/addon-essentials": "^8.6.0",
    "@storybook/web-components-vite": "^8.6.0",
    "@types/bun": "^1.3.11",
    "bun-automock": "^0.2.5",
    "bunup": "^0.16.31",
    "storybook": "^8.6.0",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

Create `packages/charts/tsconfig.json`:

```json
{
  "extends": "@prj-conq/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "types": [
      "@types/bun"
    ]
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts"
  ]
}
```

- [ ] **Step 3: Create bunup.config.ts**

Create `packages/charts/bunup.config.ts`:

```typescript
import { defineConfig } from "bunup";

export default defineConfig({
  name: "@prj-conq/charts",
  entry: [
    "src/index.ts",
    "src/generic/index.ts",
    "src/domain/index.ts",
  ],
  outDir: "dist",
  dts: true,
  exports: true,
  format: "esm",
  sourcemap: "linked",
});
```

- [ ] **Step 4: Create biome.json**

Create `packages/charts/biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.4.6/schema.json",
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all",
      "semicolons": "always"
    }
  },
  "files": {
    "includes": ["src/**", "tests/**"]
  }
}
```

- [ ] **Step 5: Create bunfig.toml**

Create `packages/charts/bunfig.toml`:

```toml
[test]
root = "tests"
coverageReporter = ["text", "lcov"]
coverageDir = "coverage"
coverageSkipTestFiles = true
coveragePathIgnorePatterns = [
  "tests/helpers/*",
  "**/*/*.js",
  "tests/fixtures/*",
]
```

- [ ] **Step 6: Create placeholder entry files**

Create `packages/charts/src/index.ts`:

```typescript
export * from "./generic/index";
export * from "./domain/index";
```

Create `packages/charts/src/generic/index.ts`:

```typescript
// Generic chart components — exported as they are implemented
```

Create `packages/charts/src/domain/index.ts`:

```typescript
// Domain wrapper components — exported as they are implemented
```

- [ ] **Step 7: Install dependencies**

Run: `cd /Users/jbigorra/Projects/project-conqueror.atm-19-create-library-of-charts-that-display-the-analyses-supported && pnpm install`
Expected: Dependencies install successfully including lit, chart.js, and storybook packages.

- [ ] **Step 8: Verify build**

Run: `cd packages/charts && pnpm run build`
Expected: Build succeeds, creates `dist/` with index.js, generic/index.js, domain/index.js and corresponding .d.ts files.

- [ ] **Step 9: Commit**

```bash
git add packages/charts/
git commit -m "chore(charts): scaffold @prj-conq/charts package"
```

---

### Task 3: Configure Storybook

Set up Storybook with web-components-vite framework.

**Files:**
- Create: `packages/charts/.storybook/main.ts`
- Create: `packages/charts/.storybook/preview.ts`

- [ ] **Step 1: Create Storybook main config**

Create `packages/charts/.storybook/main.ts`:

```typescript
import type { StorybookConfig } from "@storybook/web-components-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.ts"],
  framework: {
    name: "@storybook/web-components-vite",
    options: {},
  },
  addons: ["@storybook/addon-essentials"],
};

export default config;
```

- [ ] **Step 2: Create Storybook preview config**

Create `packages/charts/.storybook/preview.ts`:

```typescript
import type { Preview } from "@storybook/web-components";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "#1a1a2e" },
        { name: "light", value: "#ffffff" },
      ],
    },
  },
};

export default preview;
```

- [ ] **Step 3: Create a smoke-test story**

Create `packages/charts/stories/smoke.stories.ts`:

```typescript
import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";

const meta: Meta = {
  title: "Smoke Test",
};

export default meta;

type Story = StoryObj;

export const Works: Story = {
  render: () => html`<p>Storybook is working.</p>`,
};
```

- [ ] **Step 4: Verify Storybook starts**

Run: `cd packages/charts && pnpm run storybook`
Expected: Storybook starts on port 6006, smoke test story renders.

Stop the server after verifying.

- [ ] **Step 5: Commit**

```bash
git add packages/charts/.storybook/ packages/charts/stories/
git commit -m "chore(charts): configure Storybook with web-components-vite"
```

---

### Task 4: Define shared types

Define the generic data shapes that all chart components use.

**Files:**
- Create: `packages/charts/src/types.ts`

- [ ] **Step 1: Create types.ts**

Create `packages/charts/src/types.ts`:

```typescript
/** Data point for ranked/simple bar charts */
export type RankedBarItem = {
  label: string;
  value: number;
};

/** Data point for stacked bar charts */
export type StackedBarItem = {
  label: string;
  segments: StackedSegment[];
};

export type StackedSegment = {
  key: string;
  value: number;
};

/** Data point for grouped bar charts */
export type GroupedBarItem = {
  label: string;
  groups: GroupedGroup[];
};

export type GroupedGroup = {
  key: string;
  value: number;
};

/** Data point for bubble charts */
export type BubbleItem = {
  label: string;
  x: number;
  y: number;
  r: number;
};

/** Data point for line/area charts */
export type LineAreaPoint = {
  x: string | number;
  series: LineAreaSeries[];
};

export type LineAreaSeries = {
  key: string;
  value: number;
};

/** Data point for histograms (raw values, component bins them) */
export type HistogramItem = {
  value: number;
};

/** Data point for doughnut/pie charts */
export type DoughnutItem = {
  label: string;
  value: number;
};

/** Data point for treemaps */
export type TreemapItem = {
  path: string[];
  value: number;
  color?: number;
};

/** Theme preset names */
export type ThemePreset = "dark" | "light" | "pico";

/** Sort direction for bar charts */
export type SortDirection = "asc" | "desc" | "none";

/** States for the data fetch controller */
export type FetchState = "idle" | "loading" | "success" | "error";
```

- [ ] **Step 2: Export types from the barrel**

Update `packages/charts/src/index.ts`:

```typescript
export * from "./types";
export * from "./generic/index";
export * from "./domain/index";
```

- [ ] **Step 3: Verify typecheck**

Run: `cd packages/charts && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/charts/src/types.ts packages/charts/src/index.ts
git commit -m "feat(charts): define shared generic data shape types"
```

---

## Chunk 2: Reactive Controllers

### Task 5: ThemeController

Reads CSS custom properties and exposes Chart.js-compatible theme options.

**Files:**
- Create: `packages/charts/src/controllers/theme.controller.ts`
- Create: `packages/charts/src/themes/dark.ts`
- Create: `packages/charts/src/themes/light.ts`
- Create: `packages/charts/src/themes/pico.ts`
- Create: `packages/charts/src/themes/index.ts`
- Test: `packages/charts/tests/controllers/theme.controller.test.ts`

- [ ] **Step 1: Write the failing test for theme preset resolution**

Create `packages/charts/tests/controllers/theme.controller.test.ts`:

```typescript
import { describe, expect, it } from "bun:test";
import { darkTheme } from "../../src/themes/dark";
import { lightTheme } from "../../src/themes/light";
import { picoTheme } from "../../src/themes/pico";
import { resolveTheme } from "../../src/controllers/theme.controller";
import type { ThemePreset } from "../../src/types";

describe("resolveTheme", () => {
  it("returns dark theme values when preset is 'dark'", () => {
    const result = resolveTheme("dark", {});
    expect(result.bg).toBe(darkTheme.bg);
    expect(result.text).toBe(darkTheme.text);
    expect(result.accents).toEqual(darkTheme.accents);
  });

  it("returns light theme values when preset is 'light'", () => {
    const result = resolveTheme("light", {});
    expect(result.bg).toBe(lightTheme.bg);
    expect(result.text).toBe(lightTheme.text);
  });

  it("returns pico theme values when preset is 'pico'", () => {
    const result = resolveTheme("pico", {});
    expect(result.bg).toBe(picoTheme.bg);
  });

  it("applies CSS overrides on top of preset", () => {
    const overrides = { "--pq-chart-bg": "#ff0000", "--pq-chart-text": "#00ff00" };
    const result = resolveTheme("dark", overrides);
    expect(result.bg).toBe("#ff0000");
    expect(result.text).toBe("#00ff00");
    // Non-overridden values come from preset
    expect(result.grid).toBe(darkTheme.grid);
  });

  it("defaults to dark theme when no preset specified", () => {
    const result = resolveTheme(undefined, {});
    expect(result.bg).toBe(darkTheme.bg);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/charts && bun test tests/controllers/theme.controller.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create theme presets**

Create `packages/charts/src/themes/dark.ts`:

```typescript
import type { ThemeValues } from "./types";

export const darkTheme: ThemeValues = {
  bg: "transparent",
  text: "#e0e0e0",
  grid: "rgba(255,255,255,0.1)",
  border: "rgba(255,255,255,0.2)",
  tooltipBg: "#1e1e1e",
  fontFamily: "system-ui, sans-serif",
  fontSize: "12px",
  danger: "#e06c75",
  accents: [
    "#4ecdc4",
    "#f5a623",
    "#e06c75",
    "#61afef",
    "#c678dd",
    "#98c379",
    "#d19a66",
    "#56b6c2",
  ],
};
```

Create `packages/charts/src/themes/light.ts`:

```typescript
import type { ThemeValues } from "./types";

export const lightTheme: ThemeValues = {
  bg: "#ffffff",
  text: "#333333",
  grid: "rgba(0,0,0,0.1)",
  border: "rgba(0,0,0,0.2)",
  tooltipBg: "#ffffff",
  fontFamily: "system-ui, sans-serif",
  fontSize: "12px",
  danger: "#dc2626",
  accents: [
    "#0891b2",
    "#d97706",
    "#dc2626",
    "#2563eb",
    "#9333ea",
    "#16a34a",
    "#ea580c",
    "#0d9488",
  ],
};
```

Create `packages/charts/src/themes/pico.ts`:

```typescript
import type { ThemeValues } from "./types";

export const picoTheme: ThemeValues = {
  bg: "transparent",
  text: "#c5d0dc",
  grid: "rgba(197,208,220,0.1)",
  border: "rgba(197,208,220,0.2)",
  tooltipBg: "#13171f",
  fontFamily: "system-ui, sans-serif",
  fontSize: "12px",
  danger: "#b03a3e",
  accents: [
    "#0172ad",
    "#c27a2c",
    "#b03a3e",
    "#3874d8",
    "#8e44ad",
    "#27ae60",
    "#d35400",
    "#16a085",
  ],
};
```

Create `packages/charts/src/themes/types.ts`:

```typescript
export type ThemeValues = {
  bg: string;
  text: string;
  grid: string;
  border: string;
  tooltipBg: string;
  fontFamily: string;
  fontSize: string;
  danger: string;
  accents: string[];
};
```

Create `packages/charts/src/themes/index.ts`:

```typescript
export { darkTheme } from "./dark";
export { lightTheme } from "./light";
export { picoTheme } from "./pico";
export type { ThemeValues } from "./types";
```

- [ ] **Step 4: Implement resolveTheme function**

Create `packages/charts/src/controllers/theme.controller.ts`:

```typescript
import { ReactiveController, type ReactiveControllerHost } from "lit";
import { darkTheme } from "../themes/dark";
import { lightTheme } from "../themes/light";
import { picoTheme } from "../themes/pico";
import type { ThemeValues } from "../themes/types";
import type { ThemePreset } from "../types";

const presets: Record<string, ThemeValues> = {
  dark: darkTheme,
  light: lightTheme,
  pico: picoTheme,
};

const cssPropertyMap: Record<string, keyof ThemeValues> = {
  "--pq-chart-bg": "bg",
  "--pq-chart-text": "text",
  "--pq-chart-grid": "grid",
  "--pq-chart-border": "border",
  "--pq-chart-tooltip-bg": "tooltipBg",
  "--pq-chart-font-family": "fontFamily",
  "--pq-chart-font-size": "fontSize",
  "--pq-chart-danger": "danger",
};

/** Pure function — resolves theme preset + CSS overrides into final values */
export function resolveTheme(
  preset: ThemePreset | undefined,
  cssOverrides: Record<string, string>,
): ThemeValues {
  const base = presets[preset ?? "dark"] ?? darkTheme;
  const result = { ...base, accents: [...base.accents] };

  for (const [cssProp, value] of Object.entries(cssOverrides)) {
    if (!value) continue;
    const key = cssPropertyMap[cssProp];
    if (key) {
      (result as Record<string, unknown>)[key] = value;
    }
    // Handle accent overrides: --pq-chart-accent-1 through --pq-chart-accent-8
    const accentMatch = cssProp.match(/^--pq-chart-accent-(\d)$/);
    if (accentMatch) {
      const idx = parseInt(accentMatch[1], 10) - 1;
      if (idx >= 0 && idx < 8) {
        result.accents[idx] = value;
      }
    }
  }

  return result;
}

/** Builds Chart.js-compatible options partial from theme values */
export function toChartJsOptions(theme: ThemeValues): Record<string, unknown> {
  return {
    color: theme.text,
    borderColor: theme.border,
    backgroundColor: theme.bg,
    font: {
      family: theme.fontFamily,
      size: parseInt(theme.fontSize, 10) || 12,
    },
    scales: {
      x: {
        ticks: { color: theme.text },
        grid: { color: theme.grid },
      },
      y: {
        ticks: { color: theme.text },
        grid: { color: theme.grid },
      },
    },
    plugins: {
      legend: { labels: { color: theme.text } },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.border,
        borderWidth: 1,
      },
    },
  };
}

/** Reactive Controller that reads CSS custom properties and provides theme values */
export class ThemeController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;

  theme: ThemeValues = darkTheme;
  colors: string[] = darkTheme.accents;
  options: Record<string, unknown> = {};

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.update();
  }

  hostUpdated(): void {
    this.update();
  }

  update(preset?: ThemePreset): void {
    const styles = getComputedStyle(this.host);
    const overrides: Record<string, string> = {};

    const props = [
      "--pq-chart-bg",
      "--pq-chart-text",
      "--pq-chart-grid",
      "--pq-chart-border",
      "--pq-chart-tooltip-bg",
      "--pq-chart-font-family",
      "--pq-chart-font-size",
      "--pq-chart-danger",
      ...Array.from({ length: 8 }, (_, i) => `--pq-chart-accent-${i + 1}`),
    ];

    for (const prop of props) {
      const val = styles.getPropertyValue(prop).trim();
      if (val) overrides[prop] = val;
    }

    this.theme = resolveTheme(preset, overrides);
    this.colors = this.theme.accents;
    this.options = toChartJsOptions(this.theme);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/charts && bun test tests/controllers/theme.controller.test.ts`
Expected: All 5 tests pass.

- [ ] **Step 6: Write additional tests for toChartJsOptions and ThemeController class**

Add to `packages/charts/tests/controllers/theme.controller.test.ts`:

```typescript
import { toChartJsOptions, ThemeController } from "../../src/controllers/theme.controller";
import { createMockHost } from "../helpers/mock-host";

describe("toChartJsOptions", () => {
  it("maps theme values to Chart.js options structure", () => {
    const result = toChartJsOptions(darkTheme) as Record<string, any>;
    expect(result.color).toBe("#e0e0e0");
    expect(result.font.family).toBe("system-ui, sans-serif");
    expect(result.font.size).toBe(12);
    expect(result.scales.x.ticks.color).toBe("#e0e0e0");
    expect(result.plugins.tooltip.backgroundColor).toBe("#1e1e1e");
  });

  it("parses fontSize string to number", () => {
    const result = toChartJsOptions({ ...darkTheme, fontSize: "14px" }) as Record<string, any>;
    expect(result.font.size).toBe(14);
  });
});

describe("ThemeController", () => {
  it("registers itself with the host", () => {
    const host = createMockHost();
    const controller = new ThemeController(host);
    expect(host.controllers).toContain(controller);
  });

  it("exposes dark theme colors by default", () => {
    const host = createMockHost();
    const controller = new ThemeController(host);
    // After update without preset, defaults to dark
    controller.update(undefined);
    expect(controller.colors).toEqual(darkTheme.accents);
    expect(controller.theme.text).toBe(darkTheme.text);
  });

  it("switches to light theme when preset is specified", () => {
    const host = createMockHost();
    const controller = new ThemeController(host);
    controller.update("light");
    expect(controller.theme.bg).toBe(lightTheme.bg);
    expect(controller.theme.text).toBe(lightTheme.text);
  });

  it("produces Chart.js options object", () => {
    const host = createMockHost();
    const controller = new ThemeController(host);
    controller.update("dark");
    expect(controller.options).toBeDefined();
    expect((controller.options as Record<string, any>).color).toBe("#e0e0e0");
  });
});
```

Note: `ThemeController.update()` calls `getComputedStyle(this.host)` which won't return meaningful values in Bun (no real DOM). The mock host won't have real CSS properties, so overrides from CSS will be empty strings — the controller falls back to preset values. This is expected: we test CSS-override behavior via `resolveTheme` pure function tests, and the controller class tests verify registration, preset switching, and output structure.

- [ ] **Step 7: Run all theme tests**

Run: `cd packages/charts && bun test tests/controllers/theme.controller.test.ts`
Expected: All 11 tests pass (5 resolveTheme + 2 toChartJsOptions + 4 ThemeController class).

- [ ] **Step 8: Commit**

```bash
git add packages/charts/src/controllers/ packages/charts/src/themes/ packages/charts/tests/controllers/
git commit -m "feat(charts): add ThemeController with dark/light/pico presets"
```

---

### Task 6: DataFetchController

Handles fetching data from a URL with loading/error state machine.

**Files:**
- Create: `packages/charts/src/controllers/data-fetch.controller.ts`
- Test: `packages/charts/tests/controllers/data-fetch.controller.test.ts`
- Create: `packages/charts/tests/helpers/mock-host.ts`

- [ ] **Step 1: Create a mock host for controller testing**

Note on mocking strategy: This project uses `bun-automock` (`mockFn<Interface>()`) for interface-based dependency injection. However, Lit's `ReactiveControllerHost & HTMLElement` intersection type needs functional behavior (capturing dispatched events, tracking registered controllers) — a manual mock host is more appropriate here. Use `bun-automock` for any other interface-based mocking needs in the package. Use `mock()` from `bun:test` for stubbing `globalThis.fetch`.

Create `packages/charts/tests/helpers/mock-host.ts`:

```typescript
import type { ReactiveController, ReactiveControllerHost } from "lit";

/** Minimal mock of ReactiveControllerHost & HTMLElement for testing controllers */
export function createMockHost(): ReactiveControllerHost & HTMLElement & {
  controllers: ReactiveController[];
  dispatchedEvents: CustomEvent[];
  updateCount: number;
} {
  const controllers: ReactiveController[] = [];
  const dispatchedEvents: CustomEvent[] = [];
  let updateCount = 0;

  return {
    controllers,
    dispatchedEvents,
    get updateCount() { return updateCount; },
    addController(controller: ReactiveController) {
      controllers.push(controller);
    },
    removeController() {},
    requestUpdate() {
      updateCount++;
    },
    get updateComplete() {
      return Promise.resolve(true);
    },
    dispatchEvent(event: Event) {
      dispatchedEvents.push(event as CustomEvent);
      return true;
    },
    // Minimal HTMLElement stubs
    style: {} as CSSStyleDeclaration,
  } as unknown as ReturnType<typeof createMockHost>;
}
```

- [ ] **Step 2: Write failing tests for DataFetchController**

Create `packages/charts/tests/controllers/data-fetch.controller.test.ts`:

```typescript
import { describe, expect, it, beforeEach, mock, afterEach } from "bun:test";
import { DataFetchController } from "../../src/controllers/data-fetch.controller";
import { createMockHost } from "../helpers/mock-host";

describe("DataFetchController", () => {
  let host: ReturnType<typeof createMockHost>;
  let controller: DataFetchController<{ id: number }>;

  beforeEach(() => {
    host = createMockHost();
    controller = new DataFetchController(host);
  });

  it("registers itself with the host on construction", () => {
    expect(host.controllers).toContain(controller);
  });

  it("starts in idle state with no data", () => {
    expect(controller.state).toBe("idle");
    expect(controller.data).toBeUndefined();
  });

  it("stays idle when data property is set (data takes priority)", async () => {
    await controller.fetch("/api/data", true);
    expect(controller.state).toBe("idle");
  });

  it("stays idle when no src is provided", async () => {
    await controller.fetch(undefined, false);
    expect(controller.state).toBe("idle");
  });

  it("fetches data and transitions to success on 200", async () => {
    const mockData = [{ id: 1 }, { id: 2 }];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify(mockData), { status: 200 })),
    ) as typeof fetch;

    await controller.fetch("/api/data", false);

    expect(controller.state).toBe("success");
    expect(controller.data).toEqual(mockData);
    expect(host.dispatchedEvents.some((e) => e.type === "chart-data-loaded")).toBe(true);

    globalThis.fetch = originalFetch;
  });

  it("transitions to error on non-200 response", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("Not found", { status: 404, statusText: "Not Found" })),
    ) as typeof fetch;

    await controller.fetch("/api/data", false);

    expect(controller.state).toBe("error");
    expect(controller.error).toBeDefined();
    expect(controller.error!.message).toContain("404");
    expect(host.dispatchedEvents.some((e) => e.type === "chart-error")).toBe(true);

    globalThis.fetch = originalFetch;
  });

  it("transitions to error on network failure", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(() => Promise.reject(new Error("Network error"))) as typeof fetch;

    await controller.fetch("/api/data", false);

    expect(controller.state).toBe("error");
    expect(controller.error!.message).toBe("Network error");

    globalThis.fetch = originalFetch;
  });

  it("unwraps { data: [...] } response format", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({ data: [{ id: 3 }] }), { status: 200 })),
    ) as typeof fetch;

    await controller.fetch("/api/data", false);

    expect(controller.data).toEqual([{ id: 3 }]);

    globalThis.fetch = originalFetch;
  });

  it("requests host update after fetch completes", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response("[]", { status: 200 })),
    ) as typeof fetch;

    const before = host.updateCount;
    await controller.fetch("/api/data", false);
    expect(host.updateCount).toBeGreaterThan(before);

    globalThis.fetch = originalFetch;
  });

  it("aborts previous fetch when a new one starts", async () => {
    const originalFetch = globalThis.fetch;
    let abortSignals: AbortSignal[] = [];
    globalThis.fetch = mock((url: string, opts: RequestInit) => {
      abortSignals.push(opts.signal!);
      return new Promise((resolve) =>
        setTimeout(() => resolve(new Response("[]", { status: 200 })), 100),
      );
    }) as typeof fetch;

    const p1 = controller.fetch("/api/first", false);
    const p2 = controller.fetch("/api/second", false);
    await Promise.allSettled([p1, p2]);

    expect(abortSignals[0].aborted).toBe(true);

    globalThis.fetch = originalFetch;
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd packages/charts && bun test tests/controllers/data-fetch.controller.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement DataFetchController**

Create `packages/charts/src/controllers/data-fetch.controller.ts`:

```typescript
import { ReactiveController, type ReactiveControllerHost } from "lit";
import type { FetchState } from "../types";

type StateInput =
  | { src: string | undefined; hasData: boolean }
  | { fetchResult: "success" | "error" };

/** Pure state transition function */
export function nextFetchState(current: FetchState, input: StateInput): FetchState {
  if ("fetchResult" in input) {
    return input.fetchResult === "success" ? "success" : "error";
  }
  if (input.hasData || !input.src) return "idle";
  return "loading";
}

/** Reactive Controller that fetches JSON data from a URL */
export class DataFetchController<T> implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private abortController?: AbortController;

  state: FetchState = "idle";
  data?: T[];
  error?: Error;

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  hostDisconnected(): void {
    this.abortController?.abort();
  }

  async fetch(src: string | undefined, hasPropertyData: boolean): Promise<void> {
    const next = nextFetchState(this.state, { src, hasData: hasPropertyData });
    if (next !== "loading") {
      this.state = next;
      return;
    }

    this.state = "loading";
    this.host.requestUpdate();
    this.abortController?.abort();
    this.abortController = new AbortController();

    try {
      const response = await globalThis.fetch(src!, {
        signal: this.abortController.signal,
      });
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      this.data = Array.isArray(json) ? json : json.data;
      this.state = "success";
      this.host.dispatchEvent(
        new CustomEvent("chart-data-loaded", { bubbles: true, composed: true }),
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      this.error = err instanceof Error ? err : new Error(String(err));
      this.state = "error";
      this.host.dispatchEvent(
        new CustomEvent("chart-error", {
          bubbles: true,
          composed: true,
          detail: { error: this.error },
        }),
      );
    }
    this.host.requestUpdate();
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/charts && bun test tests/controllers/data-fetch.controller.test.ts`
Expected: All 9 tests pass (idle states, success, error, network failure, unwrap, host update, abort).

- [ ] **Step 6: Commit**

```bash
git add packages/charts/src/controllers/data-fetch.controller.ts packages/charts/tests/
git commit -m "feat(charts): add DataFetchController with state machine"
```

---

### Task 7: ChartController

Manages the Chart.js instance lifecycle, canvas ref, and resize observer.

**Files:**
- Create: `packages/charts/src/controllers/chart.controller.ts`
- Create: `packages/charts/src/controllers/index.ts`

- [ ] **Step 1: Implement ChartController**

The ChartController wraps Chart.js directly and needs a canvas element, so it is tested via Storybook stories rather than unit tests. Create `packages/charts/src/controllers/chart.controller.ts`:

```typescript
import type { ReactiveController, ReactiveControllerHost } from "lit";
import { createRef, type Ref } from "lit/directives/ref.js";
import { Chart, type ChartConfiguration, type ChartType } from "chart.js";

/** Reactive Controller that manages a Chart.js instance lifecycle */
export class ChartController implements ReactiveController {
  private host: ReactiveControllerHost & HTMLElement;
  private chart?: Chart;
  private resizeObserver?: ResizeObserver;
  private _animate = true;

  canvasRef: Ref<HTMLCanvasElement> = createRef();

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  set animate(value: boolean) {
    this._animate = value;
  }

  hostConnected(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize();
    });
    this.resizeObserver.observe(this.host);
  }

  hostDisconnected(): void {
    this.resizeObserver?.disconnect();
    this.chart?.destroy();
    this.chart = undefined;
  }

  update<T extends ChartType>(config: ChartConfiguration<T>): void {
    const canvas = this.canvasRef.value;
    if (!canvas) return;

    if (!this._animate) {
      config.options = {
        ...config.options,
        animation: false,
      };
    }

    // Wire up click events
    config.options = {
      ...config.options,
      onClick: (_event, elements, chart) => {
        if (elements.length > 0) {
          const element = elements[0];
          const datasetIndex = element.datasetIndex;
          const index = element.index;
          const dataset = chart.data.datasets[datasetIndex];
          const label = chart.data.labels?.[index];
          const value = dataset.data[index];

          this.host.dispatchEvent(
            new CustomEvent("chart-click", {
              bubbles: true,
              composed: true,
              detail: { datasetIndex, index, label, value },
            }),
          );
        }
      },
    };

    if (this.chart) {
      this.chart.data = config.data;
      if (config.options) {
        Object.assign(this.chart.options, config.options);
      }
      this.chart.update(this._animate ? undefined : "none");
    } else {
      this.chart = new Chart(canvas, config);
    }
  }
}
```

- [ ] **Step 2: Create controllers barrel export**

Create `packages/charts/src/controllers/index.ts`:

```typescript
export { ThemeController, resolveTheme, toChartJsOptions } from "./theme.controller";
export { DataFetchController, nextFetchState } from "./data-fetch.controller";
export { ChartController } from "./chart.controller";
```

- [ ] **Step 3: Verify typecheck**

Run: `cd packages/charts && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/charts/src/controllers/
git commit -m "feat(charts): add ChartController for Chart.js lifecycle management"
```

---

## Chunk 3: First Vertical Slice (ranked-bar + revisions-chart)

### Task 8: Ranked bar mapper

Pure data mapping functions for the ranked bar chart — tested with TDD.

**Files:**
- Create: `packages/charts/src/mappers/ranked-bar.mapper.ts`
- Create: `packages/charts/src/mappers/index.ts`
- Test: `packages/charts/tests/mappers/ranked-bar.mapper.test.ts`

- [ ] **Step 1: Write failing tests for ranked bar mapper**

Create `packages/charts/tests/mappers/ranked-bar.mapper.test.ts`:

```typescript
import { describe, expect, it } from "bun:test";
import { sortItems, sliceItems } from "../../src/mappers/ranked-bar.mapper";
import type { RankedBarItem } from "../../src/types";

const items: RankedBarItem[] = [
  { label: "c.ts", value: 5 },
  { label: "a.ts", value: 20 },
  { label: "b.ts", value: 10 },
  { label: "d.ts", value: 1 },
];

describe("sortItems", () => {
  it("sorts descending by value", () => {
    const result = sortItems(items, "desc");
    expect(result.map((i) => i.value)).toEqual([20, 10, 5, 1]);
  });

  it("sorts ascending by value", () => {
    const result = sortItems(items, "asc");
    expect(result.map((i) => i.value)).toEqual([1, 5, 10, 20]);
  });

  it("returns original order when sort is none", () => {
    const result = sortItems(items, "none");
    expect(result.map((i) => i.label)).toEqual(["c.ts", "a.ts", "b.ts", "d.ts"]);
  });
});

describe("sliceItems", () => {
  it("returns top N items when limit is set", () => {
    const sorted = sortItems(items, "desc");
    const result = sliceItems(sorted, 2);
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(20);
    expect(result[1].value).toBe(10);
  });

  it("returns all items when limit is 0", () => {
    const result = sliceItems(items, 0);
    expect(result).toHaveLength(4);
  });

  it("returns all items when limit exceeds length", () => {
    const result = sliceItems(items, 100);
    expect(result).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/charts && bun test tests/mappers/ranked-bar.mapper.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the mapper**

Create `packages/charts/src/mappers/ranked-bar.mapper.ts`:

```typescript
import type { RankedBarItem, SortDirection } from "../types";

/** Sort ranked bar items by value */
export function sortItems(items: RankedBarItem[], direction: SortDirection): RankedBarItem[] {
  if (direction === "none") return [...items];
  const sorted = [...items];
  sorted.sort((a, b) => (direction === "desc" ? b.value - a.value : a.value - b.value));
  return sorted;
}

/** Slice to top N items. 0 means no limit. */
export function sliceItems(items: RankedBarItem[], limit: number): RankedBarItem[] {
  if (limit <= 0) return items;
  return items.slice(0, limit);
}
```

Create `packages/charts/src/mappers/index.ts`:

```typescript
export { sortItems, sliceItems } from "./ranked-bar.mapper";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/charts && bun test tests/mappers/ranked-bar.mapper.test.ts`
Expected: All 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/charts/src/mappers/ packages/charts/tests/mappers/
git commit -m "feat(charts): add ranked bar mapper with sort and slice"
```

---

### Task 9: Register Chart.js components

Chart.js v4 is tree-shakeable — you must register the components you use.

**Files:**
- Create: `packages/charts/src/chart-setup.ts`

- [ ] **Step 1: Create Chart.js registration module**

Create `packages/charts/src/chart-setup.ts`:

```typescript
import {
  Chart,
  BarController,
  BarElement,
  BubbleController,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  PieController,
  ArcElement,
  Filler,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";

Chart.register(
  BarController,
  BarElement,
  BubbleController,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  PieController,
  ArcElement,
  Filler,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Title,
  TreemapController,
  TreemapElement,
);
```

- [ ] **Step 2: Import setup from barrel**

Update `packages/charts/src/index.ts`:

```typescript
import "./chart-setup";
export * from "./types";
export * from "./controllers/index";
export * from "./themes/index";
export * from "./mappers/index";
export * from "./generic/index";
export * from "./domain/index";
```

- [ ] **Step 3: Verify typecheck**

Run: `cd packages/charts && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/charts/src/chart-setup.ts packages/charts/src/index.ts
git commit -m "feat(charts): register Chart.js components for tree-shaking"
```

---

### Task 10: pq-ranked-bar generic component

The first generic chart component — validates the full controller composition pattern.

**Files:**
- Create: `packages/charts/src/generic/ranked-bar.ts`

- [ ] **Step 1: Implement pq-ranked-bar**

Create `packages/charts/src/generic/ranked-bar.ts`:

```typescript
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import type { RankedBarItem, SortDirection, ThemePreset } from "../types";
import { ChartController } from "../controllers/chart.controller";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { ThemeController } from "../controllers/theme.controller";
import { sortItems, sliceItems } from "../mappers/ranked-bar.mapper";

@customElement("pq-ranked-bar")
export class PqRankedBar extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    canvas {
      width: 100% !important;
      height: 100% !important;
    }
    .state-message {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: var(--pq-chart-text, #e0e0e0);
      font-family: var(--pq-chart-font-family, system-ui, sans-serif);
    }
  `;

  private fetcher = new DataFetchController<RankedBarItem>(this);
  private chartCtrl = new ChartController(this);
  private themeCtrl = new ThemeController(this);

  @property({ type: Array }) data?: RankedBarItem[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property({ type: Number }) limit = 0;
  @property({ type: Boolean }) horizontal = true;
  @property() sort: SortDirection = "desc";
  @property({ type: Boolean }) animate = true;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("theme")) {
      this.themeCtrl.update(this.theme);
    }
    if (changed.has("animate")) {
      this.chartCtrl.animate = this.animate;
    }
    if (changed.has("src") || changed.has("data")) {
      await this.fetcher.fetch(this.src, !!this.data);
    }
    this.renderChart();
  }

  private renderChart(): void {
    const resolved = this.data ?? this.fetcher.data;
    if (!resolved?.length) return;

    const sorted = sortItems(resolved, this.sort);
    const sliced = sliceItems(sorted, this.limit);

    this.chartCtrl.update({
      type: "bar",
      data: {
        labels: sliced.map((d) => d.label),
        datasets: [
          {
            data: sliced.map((d) => d.value),
            backgroundColor: this.themeCtrl.colors[0],
            borderColor: this.themeCtrl.colors[0],
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: this.horizontal ? "y" : "x",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          ...(this.themeCtrl.options as Record<string, unknown>).plugins as object,
        },
        scales: (this.themeCtrl.options as Record<string, unknown>).scales as object,
      },
    });
  }

  protected override render() {
    if (this.fetcher.state === "loading") {
      return html`<div class="state-message"><slot name="loading">Loading…</slot></div>`;
    }
    if (this.fetcher.state === "error") {
      return html`<div class="state-message"><slot name="error">Failed to load data.</slot></div>`;
    }
    const resolved = this.data ?? this.fetcher.data;
    if (resolved && resolved.length === 0) {
      return html`<div class="state-message"><slot name="empty">No data.</slot></div>`;
    }
    return html`<canvas ${ref(this.chartCtrl.canvasRef)}></canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-ranked-bar": PqRankedBar;
  }
}
```

- [ ] **Step 2: Export from generic barrel**

Update `packages/charts/src/generic/index.ts`:

```typescript
export { PqRankedBar } from "./ranked-bar";
```

- [ ] **Step 3: Verify typecheck**

Run: `cd packages/charts && pnpm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/charts/src/generic/
git commit -m "feat(charts): add pq-ranked-bar generic chart component"
```

---

### Task 11: Test fixtures

Create realistic test data for stories and future tests.

**Files:**
- Create: `packages/charts/tests/fixtures/revisions.fixture.ts`
- Create: `packages/charts/tests/fixtures/index.ts`

- [ ] **Step 1: Create revisions fixture**

Create `packages/charts/tests/fixtures/revisions.fixture.ts`:

```typescript
import type { Revision } from "@prj-conq/behave";

export const revisionsFixture: Revision[] = [
  { entity: "src/core/analysis-engine.ts", nRevs: 142 },
  { entity: "src/api/routes/upload.ts", nRevs: 98 },
  { entity: "src/shared/database/schema.ts", nRevs: 87 },
  { entity: "src/features/auth/login.ts", nRevs: 76 },
  { entity: "src/core/event-bus.ts", nRevs: 65 },
  { entity: "src/api/middleware/auth.ts", nRevs: 54 },
  { entity: "package.json", nRevs: 51 },
  { entity: "src/features/dashboard/index.ts", nRevs: 48 },
  { entity: "src/shared/utils/format.ts", nRevs: 42 },
  { entity: "src/core/config.ts", nRevs: 38 },
  { entity: "tests/integration/upload.test.ts", nRevs: 35 },
  { entity: "src/features/reports/generator.ts", nRevs: 31 },
  { entity: "src/api/routes/analysis.ts", nRevs: 28 },
  { entity: "src/shared/database/migrations.ts", nRevs: 24 },
  { entity: "src/features/auth/register.ts", nRevs: 19 },
  { entity: "README.md", nRevs: 15 },
  { entity: "src/shared/types.ts", nRevs: 12 },
  { entity: "tsconfig.json", nRevs: 8 },
  { entity: "src/shared/constants.ts", nRevs: 5 },
  { entity: ".gitignore", nRevs: 3 },
];
```

Create `packages/charts/tests/fixtures/index.ts`:

```typescript
export { revisionsFixture } from "./revisions.fixture";
```

- [ ] **Step 2: Verify import resolves**

Run: `cd packages/charts && pnpm run typecheck`
Expected: No errors (confirms behave types are importable).

- [ ] **Step 3: Commit**

```bash
git add packages/charts/tests/fixtures/
git commit -m "feat(charts): add revisions test fixture"
```

---

### Task 12: pq-revisions-chart domain wrapper

First domain wrapper — validates the composition pattern where a domain component renders a generic chart.

**Files:**
- Create: `packages/charts/src/domain/revisions-chart.ts`

- [ ] **Step 1: Write mapper test for revisions → ranked bar**

Add to `packages/charts/tests/mappers/ranked-bar.mapper.test.ts`:

```typescript
import { mapRevisionsToBar, mapRevisionsToTreemap } from "../../src/mappers/revisions.mapper";
import { revisionsFixture } from "../fixtures/revisions.fixture";

describe("mapRevisionsToBar", () => {
  it("maps Revision[] to RankedBarItem[]", () => {
    const result = mapRevisionsToBar(revisionsFixture);
    expect(result[0]).toEqual({ label: "src/core/analysis-engine.ts", value: 142 });
    expect(result).toHaveLength(20);
  });
});

describe("mapRevisionsToTreemap", () => {
  it("maps Revision[] to TreemapItem[] by splitting entity paths", () => {
    const result = mapRevisionsToTreemap(revisionsFixture);
    expect(result[0]).toEqual({
      path: ["src", "core", "analysis-engine.ts"],
      value: 142,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/charts && bun test tests/mappers/ranked-bar.mapper.test.ts`
Expected: FAIL — revisions.mapper module not found.

- [ ] **Step 3: Create revisions mapper**

Create `packages/charts/src/mappers/revisions.mapper.ts`:

```typescript
import type { Revision } from "@prj-conq/behave";
import type { RankedBarItem, TreemapItem } from "../types";

export function mapRevisionsToBar(data: Revision[]): RankedBarItem[] {
  return data.map((r) => ({ label: r.entity, value: r.nRevs }));
}

export function mapRevisionsToTreemap(data: Revision[]): TreemapItem[] {
  return data.map((r) => ({ path: r.entity.split("/"), value: r.nRevs }));
}
```

Update `packages/charts/src/mappers/index.ts`:

```typescript
export { sortItems, sliceItems } from "./ranked-bar.mapper";
export { mapRevisionsToBar, mapRevisionsToTreemap } from "./revisions.mapper";
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/charts && bun test tests/mappers/ranked-bar.mapper.test.ts`
Expected: All tests pass (6 original + 2 new = 8 total).

- [ ] **Step 5: Implement pq-revisions-chart**

Create `packages/charts/src/domain/revisions-chart.ts`:

```typescript
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { Revision } from "@prj-conq/behave";
import type { ThemePreset } from "../types";
import { DataFetchController } from "../controllers/data-fetch.controller";
import { mapRevisionsToBar, mapRevisionsToTreemap } from "../mappers/revisions.mapper";
import "../generic/ranked-bar";

type RevisionsVariant = "bar" | "treemap";

@customElement("pq-revisions-chart")
export class PqRevisionsChart extends LitElement {
  private fetcher = new DataFetchController<Revision>(this);

  @property({ type: Array }) data?: Revision[];
  @property() src?: string;
  @property() theme?: ThemePreset;
  @property() variant: RevisionsVariant = "bar";
  @property({ type: Number }) limit = 20;

  protected override async updated(changed: Map<string, unknown>): Promise<void> {
    if (changed.has("src") || changed.has("data")) {
      await this.fetcher.fetch(this.src, !!this.data);
    }
  }

  private get resolvedData(): Revision[] {
    return this.data ?? this.fetcher.data ?? [];
  }

  protected override render() {
    // NOTE: treemap variant temporarily renders as bar until pq-treemap is implemented in Task 20.
    // After Task 20, revisit this component to wire up the treemap variant:
    //   if (this.variant === "treemap") {
    //     return html`<pq-treemap .data=${mapRevisionsToTreemap(this.resolvedData)} show-labels></pq-treemap>`;
    //   }

    return html`<pq-ranked-bar
      .data=${mapRevisionsToBar(this.resolvedData)}
      .limit=${this.limit}
      .theme=${this.theme}
      sort="desc"
      horizontal
    ></pq-ranked-bar>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-revisions-chart": PqRevisionsChart;
  }
}
```

- [ ] **Step 6: Export from domain barrel**

Update `packages/charts/src/domain/index.ts`:

```typescript
export { PqRevisionsChart } from "./revisions-chart";
```

- [ ] **Step 7: Verify typecheck and build**

Run: `cd packages/charts && pnpm run typecheck && pnpm run build`
Expected: Both pass.

- [ ] **Step 8: Commit**

```bash
git add packages/charts/src/mappers/ packages/charts/src/domain/ packages/charts/tests/
git commit -m "feat(charts): add pq-revisions-chart domain wrapper"
```

---

### Task 13: Storybook stories for first vertical slice

Validate the full stack: generic component + domain wrapper + Storybook.

**Files:**
- Create: `packages/charts/stories/generic/ranked-bar.stories.ts`
- Create: `packages/charts/stories/domain/revisions-chart.stories.ts`

- [ ] **Step 1: Create ranked-bar stories**

Create `packages/charts/stories/generic/ranked-bar.stories.ts`:

```typescript
import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/generic/ranked-bar";
import type { RankedBarItem } from "../../src/types";

const sampleData: RankedBarItem[] = [
  { label: "src/core/engine.ts", value: 142 },
  { label: "src/api/routes.ts", value: 98 },
  { label: "src/db/schema.ts", value: 87 },
  { label: "src/auth/login.ts", value: 76 },
  { label: "src/core/bus.ts", value: 65 },
  { label: "src/api/auth.ts", value: 54 },
  { label: "package.json", value: 51 },
  { label: "src/dashboard.ts", value: 48 },
];

const meta: Meta = {
  title: "Generic/Ranked Bar",
  component: "pq-ranked-bar",
  argTypes: {
    sort: { control: "select", options: ["asc", "desc", "none"] },
    limit: { control: { type: "number", min: 0, max: 50 } },
    horizontal: { control: "boolean" },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 400px;">
      <pq-ranked-bar
        .data=${sampleData}
        sort=${args.sort ?? "desc"}
        limit=${args.limit ?? 0}
        ?horizontal=${args.horizontal ?? true}
        theme=${args.theme ?? "dark"}
      ></pq-ranked-bar>
    </div>
  `,
};

export const Vertical: Story = {
  render: () => html`
    <div style="height: 400px;">
      <pq-ranked-bar .data=${sampleData} sort="desc" .horizontal=${false}></pq-ranked-bar>
    </div>
  `,
};

export const LimitedTopN: Story = {
  render: () => html`
    <div style="height: 300px;">
      <pq-ranked-bar .data=${sampleData} sort="desc" limit="3"></pq-ranked-bar>
    </div>
  `,
};

export const Empty: Story = {
  render: () => html`
    <div style="height: 200px;">
      <pq-ranked-bar .data=${[]}></pq-ranked-bar>
    </div>
  `,
};

export const CustomEmptySlot: Story = {
  render: () => html`
    <div style="height: 200px;">
      <pq-ranked-bar .data=${[]}>
        <div slot="empty">No files found. Upload a git log first.</div>
      </pq-ranked-bar>
    </div>
  `,
};
```

- [ ] **Step 2: Create revisions-chart stories**

Create `packages/charts/stories/domain/revisions-chart.stories.ts`:

```typescript
import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components";
import "../../src/domain/revisions-chart";
import { revisionsFixture } from "../../tests/fixtures/revisions.fixture";

const meta: Meta = {
  title: "Domain/Revisions Chart",
  component: "pq-revisions-chart",
  argTypes: {
    variant: { control: "select", options: ["bar", "treemap"] },
    limit: { control: { type: "number", min: 0, max: 50 } },
    theme: { control: "select", options: ["dark", "light", "pico"] },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <div style="height: 500px;">
      <pq-revisions-chart
        .data=${revisionsFixture}
        variant=${args.variant ?? "bar"}
        limit=${args.limit ?? 20}
        theme=${args.theme ?? "dark"}
      ></pq-revisions-chart>
    </div>
  `,
};

export const Top10: Story = {
  render: () => html`
    <div style="height: 400px;">
      <pq-revisions-chart .data=${revisionsFixture} limit="10"></pq-revisions-chart>
    </div>
  `,
};

export const LightTheme: Story = {
  render: () => html`
    <div style="height: 500px; background: white; padding: 1rem;">
      <pq-revisions-chart .data=${revisionsFixture} theme="light"></pq-revisions-chart>
    </div>
  `,
};
```

- [ ] **Step 3: Remove the smoke test story**

Delete `packages/charts/stories/smoke.stories.ts` — replaced by real stories.

- [ ] **Step 4: Verify Storybook renders**

Run: `cd packages/charts && pnpm run storybook`
Expected: Storybook starts. "Generic/Ranked Bar" and "Domain/Revisions Chart" stories render charts.

Stop after verifying.

- [ ] **Step 5: Run all tests**

Run: `cd packages/charts && bun test`
Expected: All tests pass (theme: 11, fetch: 9, mappers: 8 = 28 total).

- [ ] **Step 6: Commit**

```bash
git add packages/charts/stories/
git rm packages/charts/stories/smoke.stories.ts
git commit -m "feat(charts): add Storybook stories for ranked-bar and revisions-chart"
```

---

## Chunk 4: Remaining Generic Components + Mappers

Each task follows the same pattern established in Chunk 3: TDD the mapper, implement the component, export it. Only the specifics (data shapes, Chart.js config) differ.

### Task 14: pq-stacked-bar

**Files:**
- Create: `packages/charts/src/generic/stacked-bar.ts`
- Create: `packages/charts/src/mappers/stacked-bar.mapper.ts`
- Test: `packages/charts/tests/mappers/stacked-bar.mapper.test.ts`

- [ ] **Step 1: Write failing test for stacked-bar dataset builder**

```typescript
import { describe, expect, it } from "bun:test";
import { buildStackedDatasets } from "../../src/mappers/stacked-bar.mapper";
import type { StackedBarItem } from "../../src/types";

const items: StackedBarItem[] = [
  { label: "file-a.ts", segments: [{ key: "alice", value: 50 }, { key: "bob", value: 30 }] },
  { label: "file-b.ts", segments: [{ key: "alice", value: 20 }, { key: "charlie", value: 10 }] },
];

describe("buildStackedDatasets", () => {
  it("extracts unique keys as dataset labels", () => {
    const result = buildStackedDatasets(items);
    expect(result.keys).toEqual(["alice", "bob", "charlie"]);
  });

  it("builds parallel data arrays per key, 0 for missing segments", () => {
    const result = buildStackedDatasets(items);
    expect(result.datasets[0].data).toEqual([50, 20]); // alice
    expect(result.datasets[1].data).toEqual([30, 0]);   // bob
    expect(result.datasets[2].data).toEqual([0, 10]);   // charlie
  });

  it("returns labels from items", () => {
    const result = buildStackedDatasets(items);
    expect(result.labels).toEqual(["file-a.ts", "file-b.ts"]);
  });
});
```

- [ ] **Step 2: Implement stacked-bar mapper**

Create `packages/charts/src/mappers/stacked-bar.mapper.ts`:

```typescript
import type { StackedBarItem } from "../types";

export type StackedDatasets = {
  labels: string[];
  keys: string[];
  datasets: { label: string; data: number[] }[];
};

export function buildStackedDatasets(items: StackedBarItem[]): StackedDatasets {
  const labels = items.map((i) => i.label);
  const keySet = new Set<string>();
  for (const item of items) {
    for (const seg of item.segments) keySet.add(seg.key);
  }
  const keys = [...keySet];

  const datasets = keys.map((key) => ({
    label: key,
    data: items.map((item) => {
      const seg = item.segments.find((s) => s.key === key);
      return seg?.value ?? 0;
    }),
  }));

  return { labels, keys, datasets };
}
```

- [ ] **Step 3: Run tests, verify they pass**

- [ ] **Step 4: Implement pq-stacked-bar component**

Uses `StackedBarItem[]`. Chart.js config: `options.scales.x.stacked: true, y.stacked: true`. Calls `buildStackedDatasets()` to create Chart.js datasets. Colors cycle through `this.themeCtrl.colors`. Props: `show-legend` (boolean, default true), `horizontal`, `limit`.

- [ ] **Step 5: Export from generic barrel, create story, verify typecheck**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat(charts): add pq-stacked-bar with dataset builder"
```

---

### Task 15: pq-grouped-bar

**Files:**
- Create: `packages/charts/src/generic/grouped-bar.ts`
- Create: `packages/charts/src/mappers/grouped-bar.mapper.ts`
- Test: `packages/charts/tests/mappers/grouped-bar.mapper.test.ts`

- [ ] **Step 1: Write failing test for grouped-bar dataset builder**

Same pivot pattern as stacked-bar but using `GroupedBarItem[]` and `group.key`:

```typescript
import { buildGroupedDatasets } from "../../src/mappers/grouped-bar.mapper";

// Tests: extracts unique group keys, builds parallel data arrays, returns labels
```

- [ ] **Step 2: Implement grouped-bar mapper**

Create `packages/charts/src/mappers/grouped-bar.mapper.ts` — same structure as stacked-bar mapper but operating on `GroupedBarItem` and `GroupedGroup`.

- [ ] **Step 3: Implement pq-grouped-bar component**

Same as stacked-bar but with `GroupedBarItem[]` and NO stacked option. Datasets display side by side.

- [ ] **Step 4: Export, story, typecheck, commit**

```bash
git commit -m "feat(charts): add pq-grouped-bar with dataset builder"
```

---

### Task 16: pq-bubble

**Files:**
- Create: `packages/charts/src/generic/bubble.ts`

- [ ] **Step 1: Implement pq-bubble**

Uses `BubbleItem[]` and Chart.js `type: 'bubble'`. Data maps directly: each item becomes `{ x, y, r }`. Labels shown in tooltip via custom callback. Key props: `x-label`, `y-label`, `scale-r` (min/max bubble radius scaling). No mapper extraction needed — the mapping is 1:1.

Chart.js config specifics:
```typescript
{
  type: "bubble",
  data: { datasets: [{ data: items.map(d => ({ x: d.x, y: d.y, r: d.r })) }] },
  options: {
    scales: { x: { title: { display: true, text: xLabel } }, y: { title: { display: true, text: yLabel } } },
    plugins: { tooltip: { callbacks: { label: (ctx) => items[ctx.dataIndex].label } } }
  }
}
```

- [ ] **Step 2: Export, typecheck, story, commit**

```bash
git commit -m "feat(charts): add pq-bubble generic component"
```

---

### Task 17: pq-line-area

**Files:**
- Create: `packages/charts/src/generic/line-area.ts`
- Create: `packages/charts/src/mappers/line-area.mapper.ts`
- Test: `packages/charts/tests/mappers/line-area.mapper.test.ts`

- [ ] **Step 1: Write failing test for line-area dataset builder**

```typescript
import { buildLineAreaDatasets } from "../../src/mappers/line-area.mapper";
import type { LineAreaPoint } from "../../src/types";

const points: LineAreaPoint[] = [
  { x: "2024-01", series: [{ key: "added", value: 100 }, { key: "deleted", value: 30 }] },
  { x: "2024-02", series: [{ key: "added", value: 120 }, { key: "deleted", value: 45 }] },
];

// Tests: extracts x labels, collects unique series keys, builds parallel data arrays
```

- [ ] **Step 2: Implement line-area mapper**

Create `packages/charts/src/mappers/line-area.mapper.ts` — pivots `LineAreaPoint[]` into `{ labels: string[], keys: string[], datasets: { label, data }[] }`. Same pattern as stacked-bar but on `series` instead of `segments`.

- [ ] **Step 3: Implement pq-line-area component**

Chart.js `type: 'line'`. When `fill=true`, datasets use `fill: 'origin'`. When `stacked=true`, set `options.scales.y.stacked: true`. Props: `fill` (boolean), `stacked` (boolean), `x-label`, `y-label`.

- [ ] **Step 4: Export, story, typecheck, commit**

```bash
git commit -m "feat(charts): add pq-line-area with dataset builder"
```

---

### Task 18: pq-histogram

**Files:**
- Create: `packages/charts/src/generic/histogram.ts`
- Create: `packages/charts/src/mappers/histogram.mapper.ts`
- Test: `packages/charts/tests/mappers/histogram.mapper.test.ts`

- [ ] **Step 1: Write failing test for histogram binning**

```typescript
import { describe, expect, it } from "bun:test";
import { binValues } from "../../src/mappers/histogram.mapper";

describe("binValues", () => {
  it("distributes values into equal-width bins", () => {
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = binValues(values, 5);
    expect(result).toHaveLength(5);
    expect(result[0].label).toBe("1-3");
    expect(result[0].value).toBe(2); // 1, 2
  });

  it("handles custom bracket boundaries", () => {
    const values = [1, 5, 12, 25, 36];
    const result = binValues(values, [0, 3, 6, 12, 24, 48]);
    expect(result[0].label).toBe("0-3");
    expect(result[0].value).toBe(1); // 1
    expect(result[1].label).toBe("3-6");
    expect(result[1].value).toBe(1); // 5
  });
});
```

- [ ] **Step 2: Implement binValues mapper**

Create `packages/charts/src/mappers/histogram.mapper.ts`:

```typescript
import type { RankedBarItem } from "../types";

export function binValues(
  values: number[],
  bins: number | number[],
): RankedBarItem[] {
  if (values.length === 0) return [];

  const boundaries = Array.isArray(bins)
    ? bins
    : createEqualBoundaries(values, bins);

  const counts: RankedBarItem[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const low = boundaries[i];
    const high = boundaries[i + 1];
    const count = values.filter((v) => v >= low && v < high).length;
    counts.push({ label: `${low}-${high}`, value: count });
  }
  return counts;
}

function createEqualBoundaries(values: number[], binCount: number): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / binCount;
  return Array.from({ length: binCount + 1 }, (_, i) =>
    Math.round(min + step * i),
  );
}
```

- [ ] **Step 3: Run tests, implement component, export, story, commit**

```bash
git commit -m "feat(charts): add pq-histogram with binning mapper"
```

---

### Task 19: pq-doughnut

**Files:**
- Create: `packages/charts/src/generic/doughnut.ts`

- [ ] **Step 1: Implement pq-doughnut**

Uses `DoughnutItem[]` and Chart.js doughnut type. Key props: `show-legend`, `center-label` (text in the center hole, rendered via Chart.js plugin or positioned HTML).

- [ ] **Step 2: Export, typecheck, story, commit**

```bash
git commit -m "feat(charts): add pq-doughnut generic component"
```

---

### Task 20: pq-treemap

**Files:**
- Create: `packages/charts/src/generic/treemap.ts`

- [ ] **Step 1: Implement pq-treemap**

Uses `TreemapItem[]` and `chartjs-chart-treemap`. The treemap controller expects a flat dataset with `tree` (array of objects), `key` (value field), and `groups` (hierarchy levels). Map `TreemapItem.path` segments into group levels.

Key props: `show-labels`, `color-field`.

- [ ] **Step 2: Export, typecheck, story, commit**

```bash
git commit -m "feat(charts): add pq-treemap generic component"
```

---

### Task 20b: Wire up treemap variants in pq-revisions-chart

Now that `pq-treemap` exists, update `pq-revisions-chart` to render it for the treemap variant.

**Files:**
- Modify: `packages/charts/src/domain/revisions-chart.ts`

- [ ] **Step 1: Update render() to use pq-treemap**

Replace the placeholder comment in `revisions-chart.ts` with the actual treemap rendering:

```typescript
import "../generic/treemap";

// In render():
if (this.variant === "treemap") {
  return html`<pq-treemap
    .data=${mapRevisionsToTreemap(this.resolvedData)}
    .theme=${this.theme}
    show-labels
  ></pq-treemap>`;
}
```

- [ ] **Step 2: Verify in Storybook, commit**

```bash
git commit -m "feat(charts): wire up treemap variant in pq-revisions-chart"
```

---

### Task 20c: Generate CSS theme stylesheets

The spec requires theme presets to be available as CSS files for `<link>` imports.

**Files:**
- Create: `packages/charts/src/themes/dark.css`
- Create: `packages/charts/src/themes/light.css`
- Create: `packages/charts/src/themes/pico.css`

- [ ] **Step 1: Create CSS files for each preset**

Each CSS file sets the `--pq-chart-*` custom properties on `:root`. Example for `dark.css`:

```css
:root {
  --pq-chart-bg: transparent;
  --pq-chart-text: #e0e0e0;
  --pq-chart-grid: rgba(255,255,255,0.1);
  --pq-chart-border: rgba(255,255,255,0.2);
  --pq-chart-tooltip-bg: #1e1e1e;
  --pq-chart-font-family: system-ui, sans-serif;
  --pq-chart-font-size: 12px;
  --pq-chart-danger: #e06c75;
  --pq-chart-accent-1: #4ecdc4;
  --pq-chart-accent-2: #f5a623;
  --pq-chart-accent-3: #e06c75;
  --pq-chart-accent-4: #61afef;
  --pq-chart-accent-5: #c678dd;
  --pq-chart-accent-6: #98c379;
  --pq-chart-accent-7: #d19a66;
  --pq-chart-accent-8: #56b6c2;
}
```

Create equivalent files for `light.css` and `pico.css` using the values from their respective `.ts` theme objects.

- [ ] **Step 2: Add `./themes/*` subpath export to package.json**

Add to `packages/charts/package.json` exports:

```json
"./themes/*": "./src/themes/*.css"
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(charts): add CSS theme stylesheets for link imports"
```

---

## Chunk 5: Domain Wrappers

Each domain wrapper follows the same pattern: mapper (TDD if non-trivial) → component → story. Listed in groups by the generic chart they primarily use.

### Task 21: Mappers for all domain wrappers

Write all mapper functions and their tests in one batch — they are pure functions with no dependencies on each other.

**Files:**
- Create: `packages/charts/src/mappers/authors.mapper.ts`
- Create: `packages/charts/src/mappers/coupling.mapper.ts`
- Create: `packages/charts/src/mappers/soc.mapper.ts`
- Create: `packages/charts/src/mappers/churn.mapper.ts` (abs-churn, author-churn, entity-churn)
- Create: `packages/charts/src/mappers/ownership.mapper.ts`
- Create: `packages/charts/src/mappers/main-dev.mapper.ts` (main-dev, main-dev-by-revs, refactoring-main-dev)
- Create: `packages/charts/src/mappers/effort.mapper.ts`
- Create: `packages/charts/src/mappers/fragmentation.mapper.ts`
- Create: `packages/charts/src/mappers/communication.mapper.ts`
- Create: `packages/charts/src/mappers/messages.mapper.ts`
- Create: `packages/charts/src/mappers/age.mapper.ts`
- Create: `packages/charts/src/mappers/hotspots.mapper.ts`
- Test: `packages/charts/tests/mappers/domain-mappers.test.ts`
- Fixture files: one per analysis type in `tests/fixtures/`

- [ ] **Step 1: Create all fixtures**

Create fixture files for each analysis type in `packages/charts/tests/fixtures/`. Each exports realistic sample data typed to the behave schema. Example patterns:

- `authors.fixture.ts` — 15 files with varying author counts
- `coupling.fixture.ts` — 10 entity pairs with degree 30-100
- `abs-churn.fixture.ts` — 12 date points with added/deleted/commits
- `hotspots.fixture.ts` — 15 files with nRevs and cyclomaticComplexity

- [ ] **Step 2: Write tests for all mappers**

Each mapper test verifies:
- Correct field mapping (input field → output field)
- Output type matches the generic chart's expected shape
- Edge cases (empty input, single item)

Key mapper signatures:

```typescript
// authors.mapper.ts
mapAuthorsToBar(data: Author[]): RankedBarItem[]          // nAuthors → value
mapAuthorsToTreemap(data: Author[]): TreemapItem[]        // path split, nAuthors → color

// coupling.mapper.ts
mapCouplingToBubble(data: Coupling[]): BubbleItem[]       // "entity↔coupled" → label, degree → y, averageRevs → x, degree → r
mapCouplingToBar(data: Coupling[]): RankedBarItem[]       // "entity↔coupled" → label, degree → value

// soc.mapper.ts
mapSocToBar(data: Soc[]): RankedBarItem[]                 // soc → value

// churn.mapper.ts
mapAbsChurnToLineArea(data: AbsChurn[]): LineAreaPoint[]   // date → x, added/deleted → series
mapAuthorChurnToGrouped(data: AuthorChurn[]): GroupedBarItem[]  // author → label, added/deleted/commits → groups
mapAuthorChurnToStacked(data: AuthorChurn[]): StackedBarItem[]
mapEntityChurnToGrouped(data: EntityChurn[]): GroupedBarItem[]
mapEntityChurnToStacked(data: EntityChurn[]): StackedBarItem[]

// ownership.mapper.ts
mapOwnershipToStacked(data: EntityOwnership[]): StackedBarItem[]  // group by entity, author → segments
mapOwnershipToDoughnut(data: EntityOwnership[], entity: string): DoughnutItem[]  // for one entity

// main-dev.mapper.ts
mapMainDevToBar(data: MainDev[]): RankedBarItem[]          // ownership → value
mapMainDevToTreemap(data: MainDev[]): TreemapItem[]        // path split, mainDev → color group
// Same for RefactoringMainDev and MainDevByRevs

// effort.mapper.ts
mapEffortToStacked(data: EntityEffort[]): StackedBarItem[]  // group by entity, author → segments
mapEffortToDoughnut(data: EntityEffort[], entity: string): DoughnutItem[]

// fragmentation.mapper.ts
mapFragmentationToBar(data: Fragmentation[]): RankedBarItem[]       // fractalValue → value
mapFragmentationToDoughnut(data: Fragmentation[]): DoughnutItem[]   // entity → label, fractalValue → value

// communication.mapper.ts
mapCommunicationToBubble(data: Communication[]): BubbleItem[]  // "author↔peer" → label, shared → x, average → y, strength → r
mapCommunicationToBar(data: Communication[]): RankedBarItem[]  // "author↔peer" → label, strength → value

// messages.mapper.ts
mapMessagesToBar(data: MessageEntry[]): RankedBarItem[]     // matches → value

// age.mapper.ts
mapAgeToHistogram(data: CodeAge[]): number[]               // ageMonths values (histogram bins them)
mapAgeToBar(data: CodeAge[]): RankedBarItem[]              // ageMonths → value

// hotspots.mapper.ts
mapHotspotsToBubble(data: ComplexityHotspot[]): BubbleItem[]  // nRevs → x, cyclomaticComplexity → y, nRevs → r
mapHotspotsToTreemap(data: ComplexityHotspot[]): TreemapItem[]  // path split, cyclomaticComplexity → color
```

- [ ] **Step 3: Implement all mappers**

- [ ] **Step 4: Run all tests, verify they pass**

Run: `cd packages/charts && bun test`
Expected: All mapper tests pass.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(charts): add all domain mapper functions with tests"
```

---

### Task 22: Remaining domain wrapper components

Implement all remaining 17 domain wrappers. Each follows the pattern established by `pq-revisions-chart`:
- Extends `LitElement`
- Uses `DataFetchController` for fetch support
- Has `data`, `src`, `theme`, `variant`, `limit` properties
- Renders a generic chart component in the template
- Maps data via the corresponding mapper function

**Files to create (one per wrapper):**

```
packages/charts/src/domain/authors-chart.ts
packages/charts/src/domain/coupling-chart.ts
packages/charts/src/domain/soc-chart.ts
packages/charts/src/domain/abs-churn-chart.ts
packages/charts/src/domain/author-churn-chart.ts
packages/charts/src/domain/entity-churn-chart.ts
packages/charts/src/domain/ownership-chart.ts
packages/charts/src/domain/main-dev-chart.ts
packages/charts/src/domain/main-dev-revs-chart.ts
packages/charts/src/domain/refactoring-dev-chart.ts
packages/charts/src/domain/effort-chart.ts
packages/charts/src/domain/fragmentation-chart.ts
packages/charts/src/domain/communication-chart.ts
packages/charts/src/domain/messages-chart.ts
packages/charts/src/domain/age-chart.ts
packages/charts/src/domain/hotspots-chart.ts
packages/charts/src/domain/summary-cards.ts
```

- [ ] **Step 1: Implement bar-based domain wrappers (single-variant)**

Create `pq-soc-chart` and `pq-messages-chart` — these only have a bar variant:
- `pq-soc-chart`: renders `pq-ranked-bar` with `mapSocToBar(data)`, sort desc
- `pq-messages-chart`: renders `pq-ranked-bar` with `mapMessagesToBar(data)`, sort desc

- [ ] **Step 2: Commit bar-based wrappers**

```bash
git commit -m "feat(charts): add pq-soc-chart and pq-messages-chart domain wrappers"
```

- [ ] **Step 3: Implement bar+treemap domain wrappers**

Create `pq-authors-chart`, `pq-main-dev-chart`, `pq-main-dev-revs-chart`, `pq-refactoring-dev-chart` — bar default, treemap alt:
- Each uses DataFetchController + variant attribute
- Bar renders `pq-ranked-bar`, treemap renders `pq-treemap`

- [ ] **Step 4: Commit bar+treemap wrappers**

```bash
git commit -m "feat(charts): add bar+treemap domain wrappers (authors, main-dev, refactoring-dev)"
```

- [ ] **Step 5: Implement churn domain wrappers**

Create `pq-abs-churn-chart`, `pq-author-churn-chart`, `pq-entity-churn-chart`:
- abs-churn: area (fill=true) / line (fill=false) → `pq-line-area`
- author-churn/entity-churn: grouped / stacked → `pq-grouped-bar` / `pq-stacked-bar`

- [ ] **Step 6: Commit churn wrappers**

```bash
git commit -m "feat(charts): add churn domain wrappers (abs, author, entity)"
```

- [ ] **Step 7: Implement ownership/effort domain wrappers**

Create `pq-ownership-chart`, `pq-effort-chart`, `pq-fragmentation-chart`:
- ownership/effort: stacked / doughnut → `pq-stacked-bar` / `pq-doughnut`
- fragmentation: bar / doughnut → `pq-ranked-bar` / `pq-doughnut`

- [ ] **Step 8: Commit ownership/effort wrappers**

```bash
git commit -m "feat(charts): add ownership, effort, and fragmentation domain wrappers"
```

- [ ] **Step 9: Implement bubble-based domain wrappers**

Create `pq-coupling-chart`, `pq-communication-chart`, `pq-hotspots-chart`:
- coupling/communication: bubble / bar → `pq-bubble` / `pq-ranked-bar`
- hotspots: bubble / treemap → `pq-bubble` / `pq-treemap`

- [ ] **Step 10: Commit bubble-based wrappers**

```bash
git commit -m "feat(charts): add coupling, communication, and hotspots domain wrappers"
```

- [ ] **Step 11: Implement remaining wrappers**

Create `pq-age-chart` (histogram / bar) and `pq-summary-cards` (HTML cards, no Chart.js):
- `pq-summary-cards` uses only `DataFetchController`, renders `SummaryEntry[]` as styled HTML key-value cards in Shadow DOM
- No `ChartController` or `ThemeController` needed for summary-cards

- [ ] **Step 12: Commit remaining wrappers**

```bash
git commit -m "feat(charts): add age-chart and summary-cards domain wrappers"
```

Each wrapper's variant → generic chart mapping (reference table):

| Wrapper | Default Variant → Generic | Alt Variant → Generic |
|---|---|---|
| `pq-authors-chart` | bar → `pq-ranked-bar` | treemap → `pq-treemap` |
| `pq-coupling-chart` | bubble → `pq-bubble` | bar → `pq-ranked-bar` |
| `pq-soc-chart` | bar → `pq-ranked-bar` | (none) |
| `pq-abs-churn-chart` | area → `pq-line-area` (fill=true) | line → `pq-line-area` (fill=false) |
| `pq-author-churn-chart` | grouped → `pq-grouped-bar` | stacked → `pq-stacked-bar` |
| `pq-entity-churn-chart` | grouped → `pq-grouped-bar` | stacked → `pq-stacked-bar` |
| `pq-ownership-chart` | stacked → `pq-stacked-bar` | doughnut → `pq-doughnut` |
| `pq-main-dev-chart` | bar → `pq-ranked-bar` | treemap → `pq-treemap` |
| `pq-main-dev-revs-chart` | bar → `pq-ranked-bar` | treemap → `pq-treemap` |
| `pq-refactoring-dev-chart` | bar → `pq-ranked-bar` | treemap → `pq-treemap` |
| `pq-effort-chart` | stacked → `pq-stacked-bar` | doughnut → `pq-doughnut` |
| `pq-fragmentation-chart` | bar → `pq-ranked-bar` | doughnut → `pq-doughnut` |
| `pq-communication-chart` | bubble → `pq-bubble` | bar → `pq-ranked-bar` |
| `pq-messages-chart` | bar → `pq-ranked-bar` | (none) |
| `pq-age-chart` | histogram → `pq-histogram` | bar → `pq-ranked-bar` |
| `pq-hotspots-chart` | bubble → `pq-bubble` | treemap → `pq-treemap` |
| `pq-summary-cards` | cards (HTML) | (none) |

**Note on `pq-summary-cards`:** This is a special case — pure HTML, no Chart.js. Uses only `DataFetchController`. Renders `SummaryEntry[]` as styled key-value cards within Shadow DOM.

- [ ] **Step 2: Export all from domain barrel**

Update `packages/charts/src/domain/index.ts` to export all 18 wrappers.

- [ ] **Step 3: Verify typecheck and build**

Run: `cd packages/charts && pnpm run typecheck && pnpm run build`
Expected: Both pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(charts): add all 17 remaining domain wrapper components"
```

---

### Task 23: Domain wrapper stories

Create Storybook stories for all domain wrappers.

**Files:** One story file per wrapper in `packages/charts/stories/domain/`

- [ ] **Step 1: Create stories for each domain wrapper**

Each story file follows the pattern from `revisions-chart.stories.ts`:
- Imports the component and its fixture
- Default story with interactive controls (variant, limit, theme)
- One story per variant
- Light theme variant

- [ ] **Step 2: Create theme comparison story**

Create `packages/charts/stories/themes/theme-comparison.stories.ts` — renders the same chart (revisions) in all 3 themes side by side.

- [ ] **Step 3: Create remaining generic component stories**

Create story files for each generic component in `packages/charts/stories/generic/` (stacked-bar, grouped-bar, bubble, line-area, histogram, doughnut, treemap).

- [ ] **Step 4: Verify Storybook renders all stories**

Run: `cd packages/charts && pnpm run storybook`
Expected: All stories render. Each domain wrapper shows its variants.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(charts): add Storybook stories for all components"
```

---

## Chunk 6: Integration + Cleanup

### Task 24: Turbo integration

**Files:**
- Modify: `turbo.json`

- [ ] **Step 1: Verify turbo already handles charts via `^build`**

The existing turbo.json has `"build": { "dependsOn": ["^build"] }` which means all packages build their dependencies first. Since `@prj-conq/charts` depends on `@prj-conq/behave` (devDependency), Turbo will automatically build behave before charts. No turbo.json changes needed unless we want a `storybook` task.

- [ ] **Step 2: Add .superpowers to .gitignore**

Append to root `.gitignore`:

```
# Brainstorming artifacts
.superpowers/
```

- [ ] **Step 3: Run full monorepo build**

Run: `pnpm run build`
Expected: All packages build successfully, including charts.

- [ ] **Step 4: Run all charts tests**

Run: `cd packages/charts && bun test`
Expected: All tests pass.

- [ ] **Step 5: Lint and format**

Run: `cd packages/charts && pnpm run lint && pnpm run format`
Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add .gitignore
git commit -m "chore: add .superpowers to gitignore and verify full build"
```

---

### Task 25: Final verification

- [ ] **Step 1: Full monorepo build from clean state**

Run: `pnpm run build`
Expected: All packages build.

- [ ] **Step 2: All charts tests pass**

Run: `cd packages/charts && bun test`
Expected: All tests pass.

- [ ] **Step 3: Storybook renders**

Run: `cd packages/charts && pnpm run storybook`
Expected: All stories render correctly with all variants and themes.

- [ ] **Step 4: Typecheck clean**

Run: `cd packages/charts && pnpm run typecheck`
Expected: No errors.
