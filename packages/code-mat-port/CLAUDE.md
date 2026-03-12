# code-mat-port — Claude Context

TypeScript port of the Clojure [code-maat](https://github.com/adamtornhill/code-maat) library. Runs on Bun.

## Commands

```bash
bun test                    # run all tests
bun test path/to/file.ts    # run one file
bun run tsc --noEmit        # typecheck
```

## TDD Workflow (mandatory)

write failing test → `bun test` (expect FAIL) → implement → `bun test` (expect PASS) → `bun run validation-pipeline` → commit

## Key Types (`src/code_maat/types.ts`)

```typescript
VCSEntry  = { entity, rev: string|number, author, date?, locAdded?, locDeleted?, message? }
AnalysisOptions = { minRevs, minSharedRevs, minCoupling, maxCoupling, maxChangesetSize }
```

All camelCase. No Incanter datasets — analyses return `Array<Record>`.

## Project Structure

```
src/code_maat/
  types.ts                   — shared types
  analysis/                  — authors, churn, code-age, commit-messages, communication,
                               coupling-algos, effort, entities, logical-coupling, math,
                               sum-of-coupling, summary
  parsers/                   — git, git2, mercurial, perforce, svn, tfs, time-parser
  app/                       — app, grouper, team-mapper, time-based-grouper
  cmd-line.ts
src/index.ts                 — public API (namespace re-exports)

tests/                       — mirrors src/ structure
tests/fixtures/log-fixtures/ — simple_git.txt, simple_git2.txt, simple_hg.txt, simple_p4.txt
tests/code_maat/end_to_end/ — scenario.test.ts (49 tests)

tmp/code-maat/src/           — original Clojure source (reference only, do not run)
```

## Parsers: File path → function

| VCS  | Import              | Sync fn                  | Async fn                 |
| ---- | ------------------- | ------------------------ | ------------------------ |
| git  | `parsers/git`       | `parseReadLog(text, {})` | `parseLog(path, {})`     |
| git2 | `parsers/git2`      | `parseReadLog(text, {})` | `parseLog(path, {})`     |
| hg   | `parsers/mercurial` | `parseReadLog(text, {})` | `parseLog(path, {})`     |
| p4   | `parsers/perforce`  | `parseReadLog(text, {})` | `parseLog(path, {})`     |
| tfs  | `parsers/tfs`       | `parseReadLog(text, {})` | `parseLog(path, {})`     |
| svn  | `parsers/svn`       | `parseReadLog(text, {})` | — (read file, pass text) |

## Commit style

```bash
git commit -m "feat: <what was added>"
# No Co-Authored-By trailers
```
