# @prj-conq/typescript-config

Shared TypeScript configuration for all packages in the Project Conqueror monorepo.

## Installation

Monorepo-internal package:

```bash
pnpm add -D @prj-conq/typescript-config@workspace:*
```

## Usage

Extend in your package's `tsconfig.json`:

```json
{
  "extends": "@prj-conq/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

## What It Provides

Extends [`@tsconfig/bun`](https://github.com/nicknisi/tsconfig/tree/main/packages/bun) with additional strictness:

| Option | Value | Purpose |
|--------|-------|---------|
| `outDir` | `./dist` | Default output directory |
| `noUnusedLocals` | `true` | Error on unused local variables |
| `noUnusedParameters` | `true` | Error on unused function parameters |
| `noPropertyAccessFromIndexSignature` | `true` | Require bracket notation for index signatures |

## Development

No build, test, or lint commands. This is a config-only package.

Changes to `tsconfig.base.json` affect TypeScript behavior across the entire monorepo. Validate with:

```bash
pnpm run typecheck  # from monorepo root -- typechecks all packages
```
