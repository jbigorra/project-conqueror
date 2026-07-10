# @prj-conq/lizard-ts

TypeScript wrapper around Python [lizard](https://github.com/terryyin/lizard) for cyclomatic complexity analysis. Spawns a Python subprocess and returns CSV results with prepended headers.

## Installation

Monorepo-internal package:

```bash
pnpm add @prj-conq/lizard-ts@workspace:^
```

## Usage

### Via singleton factory

```typescript
import { LizardInstance } from "@prj-conq/lizard-ts";

const lizard = LizardInstance.create();
const result = await lizard.analyze("/path/to/source/directory");

if (result instanceof Error) {
  console.error("Analysis failed:", result.message);
} else {
  console.log(result);
  // CSV string with headers:
  // nloc,cyclomatic_complexity,token_count,parameters,length,location,file,function,long_name,start_line,end_line
  // 15,3,45,2,20,src/foo.ts,bar,"bar(a, b)",10,30
}
```

### Via direct instantiation

```typescript
import { Lizard } from "@prj-conq/lizard-ts";

// Requires a LizardExecutor (or any ICLIExecutor)
const lizard = new Lizard(executor);
const csvOrError = await lizard.analyze("/path/to/source");
```

## API Overview

### Classes

- **`Lizard`** -- Core wrapper. `analyze(sourcePath)` spawns Python lizard with `--csv` flag and returns a CSV string (with headers) or an `Error`.
- **`LizardInstance`** -- Singleton factory. `LizardInstance.create()` returns a configured `Lizard` instance with default paths.

### Infrastructure

- **`LizardExecutor`** -- Implements `ICLIExecutor`. Runs `python -m lizard` via the package's `.venv` and spawns the subprocess via `spawnAsync` from `@prj-conq/lib`.
- **`ICLIExecutor`** -- Interface: `execute(args: string[]) => Promise<Result<TCLIResult>>`.

### CSV Output Columns

| Column | Description |
|--------|-------------|
| `nloc` | Number of lines of code |
| `cyclomatic_complexity` | McCabe cyclomatic complexity |
| `token_count` | Number of tokens |
| `parameters` | Number of function parameters |
| `length` | Function length in lines |
| `location` | Module/namespace path |
| `file` | Absolute file path |
| `function` | Function name |
| `long_name` | Fully qualified function signature |
| `start_line` | Start line number |
| `end_line` | End line number |

### Dependencies

- **Runtime**: Python 3 with `lizard` installed from PyPI into a local `.venv`
- **`@prj-conq/lib/processes`** -- `spawnAsync` for subprocess execution
- **`@prj-conq/lib/patterns`** -- `Result<T>` for error handling

## Development

```bash
bun test                    # Run all tests
bun run tdd                 # Watch mode
bun run test:coverage       # Coverage report
bun run validate            # test + biome check
bun run check               # Biome lint + format
bun run build               # Build with bunup
bun run dev                 # Watch mode build
```

### Project Structure

```
src/
  index.ts                        # Public API: LizardInstance, Lizard
  ts-lizard/
    wrapper.ts                    # Lizard class (analyze -> CSV string)
    infrastructure/
      interfaces.ts               # ICLIExecutor interface
      lizard-executor.ts          # LizardExecutor (Python subprocess)
  requirements.txt                # Pinned Python dependency (lizard)
```

## Contributing

- All public API exports MUST have JSDoc (`@param`, `@returns`, `@example`)
- Biome strict mode enforced: `noExplicitAny`, `noUnusedVariables`, `noNonNullAssertion`
- Tests mirror `src/` structure under `tests/`
- Run `bun run validate` before committing
