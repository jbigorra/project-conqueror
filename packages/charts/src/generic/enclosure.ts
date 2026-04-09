import { type HierarchyCircularNode, hierarchy, pack } from "d3-hierarchy";
import { interpolateZoom } from "d3-interpolate";
import { scaleLinear } from "d3-scale";
import { type Selection, select } from "d3-selection";
import "d3-transition"; // side-effect: patches d3-selection with .transition()
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ThemeController } from "../controllers/theme.controller";
import type { ThemePreset } from "../types";
import type { HotspotsTreeNode } from "../types/hotspots-tree.types";

type PackedNode = HierarchyCircularNode<HotspotsTreeNode>;
type ZoomState = { v: [number, number, number]; k: number; size: number };

/**
 * Zoomable circle-packing (enclosure) diagram built with D3.
 *
 * Renders a hierarchical `HotspotsTreeNode` as nested circles where area
 * maps to lines of code and colour maps to complexity.
 *
 * @element pq-enclosure
 * @attr {HotspotsTreeNode} data - Root tree node (set as a property).
 * @attr {"dark"|"light"|"pico"} theme - Theme preset name.
 * @slot empty - Content shown when no data is provided.
 *
 * @example
 * ```html
 * <pq-enclosure .data=${hotspotsTree} theme="dark"></pq-enclosure>
 * ```
 */
@customElement("pq-enclosure")
export class PqEnclosure extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
    }
    .container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    svg {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    .tooltip {
      position: absolute;
      pointer-events: none;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      line-height: 1.5;
      white-space: nowrap;
      display: none;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .tooltip.visible {
      display: block;
    }
    .circle-label {
      pointer-events: none;
      transition: opacity 150ms ease;
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

  private _themeCtrl = new ThemeController(this);

  @property({ type: Object }) data?: HotspotsTreeNode;
  @property() theme?: ThemePreset;

  @state() private _focus: PackedNode | null = null;
  @state() private _view: [number, number, number] = [0, 0, 0];

  private _size = 800;
  private _colorScale = scaleLinear<string>()
    .domain([0, 1])
    .range(["#c8e6c9", "#ffcdd2"])
    .clamp(true);

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("theme")) this._themeCtrl.update(this.theme);
    if (changed.has("data") && this.data) {
      this._buildAndRender();
    }
  }

  private _buildAndRender(): void {
    if (!this.data) return;

    const container = this.shadowRoot?.querySelector(".container");
    if (!container) return;

    const existing = container.querySelector("svg");
    if (existing) existing.remove();

    const packedRoot = this._buildHierarchy();
    this._focus = packedRoot;
    this._view = [packedRoot.x, packedRoot.y, packedRoot.r * 2];

    this._updateColorScale(packedRoot);
    const node = this._createSvg(container, packedRoot);
    this._nodeSelection = node;
    this._zoomTo(this._view);
  }

  private _buildHierarchy(): PackedNode {
    const size = this._size;
    const data = this.data;
    if (!data) throw new Error("data is required");
    const root = hierarchy(data)
      .sum((d) => (d.children ? 0 : (d.linesOfCode ?? d.nRevs ?? 1)))
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    return pack<HotspotsTreeNode>().size([size, size]).padding(3)(root);
  }

  private _updateColorScale(packedRoot: PackedNode): void {
    const theme = this._themeCtrl.theme;
    const green = theme.accents[5] ?? theme.accents[0] ?? "#98c379";
    const orange = theme.accents[1] ?? theme.accents[0] ?? "#f5a623";
    const complexities = packedRoot
      .descendants()
      .map((node) => (node.data.children ? node.data.averageComplexity : node.data.complexityScore))
      .filter((c): c is number => c !== undefined && c > 0);

    if (complexities.length > 0) {
      const min = Math.min(...complexities);
      const max = Math.max(...complexities);
      const mid = (min + max) / 2;
      this._colorScale = scaleLinear<string>()
        .domain([min, mid, max])
        .range([green, orange, theme.danger])
        .clamp(true);
    } else {
      this._colorScale = scaleLinear<string>()
        .domain([0, 0.5, 1])
        .range([green, orange, theme.danger])
        .clamp(true);
    }
  }

  private _createSvg(
    container: Element,
    packedRoot: PackedNode,
  ): Selection<SVGCircleElement, PackedNode, SVGSVGElement, unknown> {
    const size = this._size;
    const theme = this._themeCtrl.theme;
    const svg = select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${size} ${size}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .on("click", () => this._zoom(packedRoot));

    const nodes = svg
      .selectAll<SVGCircleElement, PackedNode>("circle")
      .data(packedRoot.descendants())
      .join("circle")
      .attr("fill", (d) => this._nodeColor(d))
      .attr("fill-opacity", (d) => (d.children ? 0.15 : 0.7))
      .attr("stroke", (d) => (d.children ? theme.border : "none"))
      .attr("stroke-width", (d) => (d.children ? 1.5 : 0))
      .attr("stroke-opacity", (d) => (d.children ? 0.6 : 1))
      .attr("cursor", (d) => (d.children ? "pointer" : "default"))
      .on("click", (event: MouseEvent, d) => {
        if (d.children) {
          event.stopPropagation();
          this._zoom(d === this._focus ? packedRoot : d);
        }
      })
      .on("mouseenter", (event: MouseEvent, d) => this._showTooltip(event, d))
      .on("mousemove", (event: MouseEvent, d) => this._showTooltip(event, d))
      .on("mouseleave", () => this._hideTooltip());

    this._labelSelection = svg
      .selectAll<SVGTextElement, PackedNode>("text")
      .data(packedRoot.descendants().filter((d) => d !== packedRoot))
      .join("text")
      .attr("class", "circle-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", theme.text)
      .attr("opacity", 0)
      .attr("pointer-events", "none")
      .style("font-family", theme.fontFamily)
;

    return nodes;
  }

  private _nodeSelection: ReturnType<typeof select<SVGSVGElement, unknown>> extends never
    ? never
    : // biome-ignore lint/suspicious/noExplicitAny: D3 selection typing is complex
      any = null;
  private _labelSelection: ReturnType<typeof select<SVGSVGElement, unknown>> extends never
    ? never
    : // biome-ignore lint/suspicious/noExplicitAny: D3 selection typing is complex
      any = null;

  private _nodeColor(d: PackedNode): string {
    const theme = this._themeCtrl.theme;
    const data = d.data;
    const complexity = data.children ? data.averageComplexity : data.complexityScore;
    if (complexity !== undefined && complexity > 0) {
      return this._colorScale(complexity);
    }
    return data.children ? theme.bg : theme.grid;
  }

  private static _MIN_LABEL_RADIUS = 20;

  private _zoomTo(v: [number, number, number]): void {
    const size = this._size;
    const k = size / v[2];
    this._view = v;

    const zoom: ZoomState = { v, k, size };
    this._updateCirclePositions(zoom);
    this._updateLabels(zoom);
  }

  private _updateCirclePositions({ v, k, size }: ZoomState): void {
    if (!this._nodeSelection) return;
    this._nodeSelection
      .attr("cx", (d: PackedNode) => (d.x - v[0]) * k + size / 2)
      .attr("cy", (d: PackedNode) => (d.y - v[1]) * k + size / 2)
      .attr("r", (d: PackedNode) => Math.max(0, d.r * k));
  }

  private _updateLabels(zoom: ZoomState): void {
    if (!this._labelSelection) return;
    const self = this;
    const { v, k, size } = zoom;
    this._labelSelection.each(function (this: SVGTextElement, d: PackedNode) {
      const renderedR = d.r * k;
      const isParent = !!d.children;
      const fontSize = isParent
        ? Math.min(13, Math.max(8, renderedR * 0.18))
        : Math.min(14, Math.max(9, renderedR * 0.35));

      const cx = (d.x - v[0]) * k + size / 2;
      const cy = isParent
        ? (d.y - v[1]) * k + size / 2 - renderedR + fontSize + 2
        : (d.y - v[1]) * k + size / 2;

      const el = select(this);
      el.attr("x", cx).attr("y", cy);
      el.style("font-size", `${fontSize}px`);
      el.style("font-weight", isParent ? "bold" : "normal");

      const opacity = self._computeLabelOpacity(d, renderedR, fontSize, zoom);
      el.attr("opacity", opacity);

      PqEnclosure._truncateLabel(this, el, d.data.name, renderedR);
    });
  }

  private _computeLabelOpacity(
    d: PackedNode,
    renderedR: number,
    fontSize: number,
    { v, k, size }: ZoomState,
  ): number {
    if (renderedR < PqEnclosure._MIN_LABEL_RADIUS) return 0;
    if (!d.children) return 0.9;

    // Parent: hide if a child folder's arc label would overlap ours
    for (const child of d.children) {
      if (!child.children) continue;
      const childR = child.r * k;
      if (childR < PqEnclosure._MIN_LABEL_RADIUS) continue;
      const myTop = (d.y - v[1]) * k + size / 2 - renderedR;
      const childTop = (child.y - v[1]) * k + size / 2 - childR;
      if (childTop - myTop < fontSize * 2.5) return 0;
    }
    return 0.9;
  }

  private static _truncateLabel(
    textEl: SVGTextElement,
    sel: Selection<SVGTextElement, PackedNode, null, undefined>,
    name: string,
    renderedR: number,
  ): void {
    const maxWidth = renderedR * 2 - 8;
    sel.text(name);
    const textWidth = textEl.getComputedTextLength?.() ?? 0;
    if (textWidth <= maxWidth || maxWidth <= 0) return;

    let truncated = name;
    while (truncated.length > 1) {
      truncated = truncated.slice(0, -1);
      sel.text(`${truncated}...`);
      if ((textEl.getComputedTextLength?.() ?? 0) <= maxWidth) return;
    }
    sel.text("");
  }

  private _zoom(target: PackedNode): void {
    this._focus = target;
    const targetView: [number, number, number] = [target.x, target.y, target.r * 2];

    const container = this.shadowRoot?.querySelector(".container");
    if (!container) return;

    const svg = select(container).select("svg");
    const currentView = this._view;

    svg
      .transition()
      .duration(750)
      .tween("zoom", () => {
        const i = interpolateZoom(currentView, targetView);
        return (t: number) => this._zoomTo(i(t) as [number, number, number]);
      });
  }

  private _showTooltip(event: MouseEvent, d: PackedNode): void {
    const tooltip = this.shadowRoot?.querySelector(".tooltip") as HTMLElement;
    if (!tooltip) return;

    const container = this.shadowRoot?.querySelector(".container") as HTMLElement;
    if (!container) return;

    const theme = this._themeCtrl.theme;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left + 12;
    const y = event.clientY - rect.top - 10;

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.background = theme.tooltipBg;
    tooltip.style.color = theme.text;
    tooltip.style.border = `1px solid ${theme.border}`;
    tooltip.style.fontFamily = theme.fontFamily;
    tooltip.classList.add("visible");

    const data = d.data;
    if (data.children) {
      // Folder tooltip
      tooltip.innerHTML = [
        `<strong>${data.name}</strong>`,
        `Files: ${data.immediateFiles ?? 0}`,
        `Folders: ${data.immediateFolders ?? 0}`,
        `Total LOC: ${data.totalLinesOfCode ?? 0}`,
        `Total folders: ${data.totalFolders ?? 0}`,
        `Total files: ${data.totalFiles ?? 0}`,
        `Avg complexity: ${data.averageComplexity?.toFixed(2) ?? "N/A"}`,
      ].join("<br>");
    } else {
      // File tooltip
      tooltip.innerHTML = [
        `<strong>${data.name}</strong>`,
        `LOC: ${data.linesOfCode ?? 0}`,
        `Complexity: ${data.complexityScore?.toFixed(2) ?? "N/A"}`,
      ].join("<br>");
    }
  }

  private _hideTooltip(): void {
    const tooltip = this.shadowRoot?.querySelector(".tooltip") as HTMLElement;
    if (tooltip) tooltip.classList.remove("visible");
  }

  protected override render() {
    if (!this.data) {
      return html`<div class="state-message">
        <slot name="empty">No data.</slot>
      </div>`;
    }
    return html`<div class="container"><div class="tooltip"></div></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pq-enclosure": PqEnclosure;
  }
}
