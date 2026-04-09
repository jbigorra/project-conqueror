# Enclosure Diagram: Labels + Theme Alignment

**Date**: 2026-04-09
**Status**: APPROVED
**Package**: `@prj-conq/charts`
**Component**: `pq-enclosure` (`src/generic/enclosure.ts`)

---

## Problem

The enclosure (circle-packing) diagram has two issues:

1. **No visible labels** — circles show no text identifying files/folders. The only way to know what a circle represents is by hovering for a tooltip. Users lose spatial context, especially after zooming.
2. **Hardcoded colors** — the complexity gradient (`#c8e6c9` → `#ffcdd2`), parent fills, strokes, and tooltip styling are all hardcoded. Every other chart in the library uses `ThemeController` and respects `dark`/`light`/`pico` presets. The enclosure is the only outlier.

---

## Solution

### 1. Adaptive Labels

Add SVG `<text>` elements to circles. Visibility is computed dynamically based on the current zoom state.

**Visibility rule**: A label is shown when:
- The circle's rendered radius in the current viewport is `>= 20px`
- No child circle with a visible label overlaps the parent's center area

**Zoom behavior**:
- On zoom-in, child labels appear as their circles grow past the 20px threshold
- Parent labels fade to `opacity: 0` when their children start showing labels (prevents overlap)
- On zoom-out, the reverse: child labels disappear, parent labels fade back in
- Transition: CSS `opacity` with `150ms ease` (fast enough to not lag behind D3's 750ms zoom)

**Text rendering**:
- Content: `node.name` only — the segment name (`helpers.ts`, `utils`), never the full path
- Position: centered horizontally and vertically in the circle
- Truncation: `textLength` attribute set to `circle diameter - 8px` padding. SVG `lengthAdjust="spacing"` compresses text; if the name still overflows, append `...` via a computed display name
- Font: `theme.fontFamily`, size derived from circle radius (clamped between 9px and 14px)
- Color: `theme.text`
- Pointer events: `none` (labels don't interfere with circle click targets)

**Leaf vs. parent labels**:
- Folders (parents): label positioned at top third of circle, leaving visual space for children
- Files (leaves): label centered

### 2. Theme Integration

Replace all hardcoded colors with theme-derived values via `ThemeController`.

**Color scale (complexity gradient)**:
- 3-stop linear scale using theme colors:
  - `0.0` (low complexity) → `accents[5]` (green in all themes)
  - `0.5` (medium) → `accents[1]` (orange/amber in all themes)
  - `1.0` (high complexity) → `danger` (red in all themes)
- Applied to leaf circle fills (files)
- Leaf fill opacity: `0.7` (unchanged)

**Parent circles (folders)**:
- Fill: `theme.bg` at `0.15` opacity (subtle, doesn't compete with children)
- Stroke: `theme.border` at `1.5px`
- Stroke opacity: `0.6`

**Leaf circles without complexity data**:
- Fill: `theme.grid` (neutral gray that adapts to theme)

**Tooltips**:
- Background: `theme.tooltipBg`
- Text color: `theme.text`
- Border: `1px solid ${theme.border}`
- Remove all hardcoded `rgba(30, 30, 30, ...)` styling

**Labels**:
- Color: `theme.text`
- Opacity: varies with zoom (0 when fading out, 0.9 when visible — slightly muted to not overwhelm the data)

### 3. Component API Changes

**`pq-enclosure` gains**:
- `@property() theme?: ThemePreset` — accepts `"dark" | "light" | "pico"`
- Internal `ThemeController` instance (same pattern as `pq-bubble`, `pq-treemap`, `pq-ranked-bar`)

**`pq-hotspots-chart` change**:
- Enclosure variant now passes `.theme=${this.theme}` (currently only treemap and bubble variants do)

---

## Affected Files

| File | Change |
|------|--------|
| `packages/charts/src/generic/enclosure.ts` | Add labels, ThemeController, theme-aware colors |
| `packages/charts/src/domain/hotspots-chart.ts` | Pass `theme` prop to enclosure variant |

---

## Out of Scope

- Search/filter functionality on the diagram
- Label font size as a configurable property
- Click-to-select behavior (selecting a circle for external use)
- Performance optimization for trees with 1000+ nodes (address if needed after implementation)
