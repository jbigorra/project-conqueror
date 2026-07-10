# CLAUDE.md — @prj-conq/config

## What This Package Does

Shared configuration base for all packages in the monorepo. Currently provides TypeScript configuration extending `@tsconfig/bun` with stricter compiler options. Consumed by every package via `"extends": "@prj-conq/config/tsconfig.base.json"` in their `tsconfig.json`.

## Key Files

- `tsconfig.base.json` — Base config extending `@tsconfig/bun`. Adds: `outDir: ./dist`, `noUnusedLocals`, `noUnusedParameters`, `noPropertyAccessFromIndexSignature`

## Commands

No build, test, or lint commands — this is a config-only package.

## Architecture / Patterns

Pure configuration package. Single `tsconfig.base.json` that other packages extend. Changes here affect TypeScript behavior across the entire monorepo.

## Standards

- Changes to `tsconfig.base.json` must be validated by running `pnpm run typecheck` from the monorepo root (affects all packages)
