# @prj-conq/td-radar-electrobun

Desktop app for Project Conqueror — analyses git repositories locally and displays behavioural code analysis results as interactive charts.

Built with [Electrobun](https://electrobun.dev) (Bun + system WebView), Svelte 5 with Vite HMR, and `@prj-conq/charts` for visualization.

> **Status**: This is the **active** app. The webapp (`apps/webapp`) is on hold.

## Prerequisites

- **Bun** ≥1.3.11
- **Python 3.10** + **uv** (for `packages/lizard-ts` — see [worktree setup](../..//scripts/setup-worktree.sh))

## Quick Start

```bash
# Install dependencies
bun install

# Development with HMR (recommended)
bun run dev:hmr

# Development without HMR
bun run dev

# Build canary release
bun run build:canary
```

## How HMR Works

`bun run dev:hmr` runs two processes concurrently:

1. **Vite dev server** on port 5173 with Svelte HMR
2. **Electrobun** launches the native window pointed at the Vite dev server

Changes to Svelte components update instantly without full reload.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Electrobun dev (watch bundled assets, no HMR) |
| `bun run dev:hmr` | Vite HMR + Electrobun concurrently (recommended) |
| `bun run hmr` | Vite dev server only on port 5173 |
| `bun run start` | Vite build + Electrobun dev |
| `bun run build:canary` | Vite build + Electrobun build (canary env) |

No tests, Biome, or Turbo integration yet.

## Project Structure

```
src/
  bun/
    index.ts              # Main process (Electrobun/Bun)
  mainview/
    App.svelte            # Root Svelte component
    main.ts               # Svelte entry point
    index.html            # HTML template
    app.css               # Global styles
electrobun.config.ts       # Electrobun config (app metadata, build, copy)
vite.config.ts             # Vite config (Svelte plugin, root: src/mainview)
svelte.config.js           # Svelte config (vitePreprocess)
```

## Architecture

- **Main process** (`src/bun/index.ts`): Run git log generation and behavioural analysis via `@prj-conq/behave`. Serves analysis data to the renderer.
- **Renderer** (`src/mainview/`): Svelte 5 UI using runes (`$state`, `$derived`, `$effect`). Charts rendered by `@prj-conq/charts` Web Components.

## Customizing

- **Svelte components**: Edit files in `src/mainview/`
- **Global styles**: Edit `src/mainview/app.css`
- **Vite settings**: Edit `vite.config.ts`
- **Window / main process**: Edit `src/bun/index.ts`
- **App metadata**: Edit `electrobun.config.ts`
