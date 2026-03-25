import type { ReactiveController, ReactiveControllerHost } from "lit";
import { dark } from "../themes/dark";
import { light } from "../themes/light";
import { pico } from "../themes/pico";
import type { ThemeValues } from "../themes/types";
import type { ThemePreset } from "../types";

/** Shape returned by toChartJsOptions — explicit properties avoid TS4111 index-signature errors */
export interface ChartJsThemeOptions {
  color: string;
  borderColor: string;
  backgroundColor: string;
  font: { family: string; size: number };
  scales: {
    x: {
      ticks: { color: string; font: { size: number } };
      grid: { color: string };
      border: { color: string };
    };
    y: {
      ticks: { color: string; font: { size: number } };
      grid: { color: string };
      border: { color: string };
    };
  };
  plugins: {
    legend: { labels: { color: string; font: { size: number } } };
    tooltip: {
      backgroundColor: string;
      titleColor: string;
      bodyColor: string;
      borderColor: string;
    };
  };
}

/** Map from CSS custom property name to ThemeValues key */
const CSS_VAR_MAP: Record<string, keyof ThemeValues> = {
  "--pq-chart-bg": "bg",
  "--pq-chart-text": "text",
  "--pq-chart-grid": "grid",
  "--pq-chart-border": "border",
  "--pq-chart-tooltip-bg": "tooltipBg",
  "--pq-chart-font-family": "fontFamily",
  "--pq-chart-font-size": "fontSize",
  "--pq-chart-danger": "danger",
};

const PRESETS: Record<ThemePreset, ThemeValues> = { dark, light, pico };

/**
 * Pure function: merges preset + CSS custom property overrides into ThemeValues.
 */
export function resolveTheme(
  preset: ThemePreset = "dark",
  cssOverrides: Record<string, string> = {},
): ThemeValues {
  const base = { ...PRESETS[preset] };
  const accents: string[] = [...base.accents];

  for (const [prop, value] of Object.entries(cssOverrides)) {
    if (!value) continue;

    const key = CSS_VAR_MAP[prop];
    if (key) {
      (base as Record<keyof ThemeValues, string | string[]>)[key] = value;
    } else {
      // Handle accent overrides: --pq-chart-accent-1 through -8
      const accentMatch = prop.match(/^--pq-chart-accent-(\d+)$/);
      if (accentMatch) {
        const idx = parseInt(accentMatch[1] ?? "", 10) - 1;
        if (idx >= 0 && idx < 8) {
          accents[idx] = value;
        }
      }
    }
  }

  base.accents = accents;
  return base;
}

/**
 * Maps ThemeValues to Chart.js global options structure.
 */
export function toChartJsOptions(theme: ThemeValues): ChartJsThemeOptions {
  const fontSize = parseInt(theme.fontSize, 10);

  return {
    color: theme.text,
    borderColor: theme.border,
    backgroundColor: theme.bg,
    font: {
      family: theme.fontFamily,
      size: fontSize,
    },
    scales: {
      x: {
        ticks: { color: theme.text, font: { size: fontSize } },
        grid: { color: theme.grid },
        border: { color: theme.border },
      },
      y: {
        ticks: { color: theme.text, font: { size: fontSize } },
        grid: { color: theme.grid },
        border: { color: theme.border },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: theme.text,
          font: { size: fontSize },
        },
      },
      tooltip: {
        backgroundColor: theme.tooltipBg,
        titleColor: theme.text,
        bodyColor: theme.text,
        borderColor: theme.border,
      },
    },
  };
}

/**
 * Lit ReactiveController that manages the active chart theme.
 *
 * Usage:
 *   private theme = new ThemeController(this);
 *
 * Then in render():
 *   this.theme.options  — Chart.js options object
 *   this.theme.colors   — accent colour array
 *   this.theme.theme    — full ThemeValues
 */
export class ThemeController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;
  private _preset: ThemePreset = "dark";

  theme: ThemeValues = dark;
  colors: string[] = dark.accents;
  options: ChartJsThemeOptions = toChartJsOptions(dark);

  constructor(host: ReactiveControllerHost & HTMLElement) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.update(this._preset);
  }

  hostUpdated(): void {
    this.update(this._preset);
  }

  /** Read CSS custom properties from the host element and rebuild theme. */
  update(preset?: ThemePreset): void {
    if (preset) {
      this._preset = preset;
    }

    const styles = typeof getComputedStyle !== "undefined" ? getComputedStyle(this.host) : null;

    const cssOverrides: Record<string, string> = {};

    if (styles) {
      const propNames = [
        ...Object.keys(CSS_VAR_MAP),
        "--pq-chart-accent-1",
        "--pq-chart-accent-2",
        "--pq-chart-accent-3",
        "--pq-chart-accent-4",
        "--pq-chart-accent-5",
        "--pq-chart-accent-6",
        "--pq-chart-accent-7",
        "--pq-chart-accent-8",
      ];

      for (const prop of propNames) {
        const val = styles.getPropertyValue(prop).trim();
        if (val) {
          cssOverrides[prop] = val;
        }
      }
    }

    this.theme = resolveTheme(this._preset, cssOverrides);
    this.colors = this.theme.accents;
    this.options = toChartJsOptions(this.theme);
  }
}
