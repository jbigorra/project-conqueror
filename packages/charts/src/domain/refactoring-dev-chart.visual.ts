import type { RefactoringMainDev } from "@prj-conq/behave";
import { html } from "lit";
import { mapRefactoringDevToBar, mapRefactoringDevToTreemap } from "../mappers/main-dev.mapper";
import { defineDomainChart } from "./define-domain-chart";
import "../generic/ranked-bar.visual";
import "../generic/treemap.visual";

/**
 * Refactoring developer chart showing refactoring ownership as bar or treemap.
 *
 * @element pq-refactoring-dev-chart
 * @attr {RefactoringMainDev[]} data - Inline refactoring main developer records.
 * @attr {string} src - URL to fetch data from.
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @attr {"bar"|"treemap"} variant - Chart variant (default `"bar"`).
 * @attr {number} limit - Max items for bar variant (default `20`).
 *
 * @example
 * ```html
 * <pq-refactoring-dev-chart src="/api/analysis/refactoring-dev" variant="bar"></pq-refactoring-dev-chart>
 * ```
 */
export const PqRefactoringDevChart = defineDomainChart<RefactoringMainDev>({
  tag: "pq-refactoring-dev-chart",
  defaultVariant: "bar",
  variants: {
    bar: (data, theme, limit) =>
      html`<pq-ranked-bar
        .data=${mapRefactoringDevToBar(data)}
        .limit=${limit}
        .theme=${theme}
        sort="desc"
        horizontal
      ></pq-ranked-bar>`,
    treemap: (data, theme) =>
      html`<pq-treemap
        .data=${mapRefactoringDevToTreemap(data)}
        .theme=${theme}
        show-labels
      ></pq-treemap>`,
  },
});

declare global {
  interface HTMLElementTagNameMap {
    "pq-refactoring-dev-chart": InstanceType<typeof PqRefactoringDevChart>;
  }
}
