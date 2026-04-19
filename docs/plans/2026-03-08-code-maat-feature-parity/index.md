# code-maat Feature Parity Plan

> **Sub-skill:** superpowers:executing-plans — load this index + the specific task file.

**Goal:** Port missing `summary` analysis, expand `app.ts` to all 18 analyses × 6 VCS, verify 100% parity against original JAR.

**Working dir:** `packages/code-maat-port/`
**JAR:** `../../behave/src/infrastructure/code_maat/vendor/code-maat-1.0.4-standalone.jar`

**Status: COMPLETE** — 290 tests passing (237 unit + 17 git parity + 36 multi-VCS parity), typecheck clean.

---

## Task Status

| # | Task | File | Done |
|---|------|------|------|
| 1 | Port `analysis/summary.ts` | [task-1-summary.md](task-1-summary.md) | [x] |
| 2 | Expand `app.ts` (all VCS + all analyses) | [task-2-app.md](task-2-app.md) | [x] |
| 3 | Export `summary` from `src/index.ts` | [task-3-index.md](task-3-index.md) | [x] |
| 4 | JAR parity helpers (CSV formatter + JAR runner) | [task-4-helpers.md](task-4-helpers.md) | [x] |
| 5 | JAR parity tests — git format | [task-5-git.md](task-5-git.md) | [x] |
| 6 | JAR parity tests — git2 / hg / p4 | [task-6-multi.md](task-6-multi.md) | [x] |

---

## Gaps vs Original Clojure

| Clojure module | Status |
|---|---|
| `analysis/summary.clj` → `overview` | **DONE** — Task 1 |
| `app.clj` — 6 VCS parsers, 18 analyses | **DONE** — Task 2 |
| `output/csv.clj`, `output/filters.clj` | Not needed — TS returns arrays |
| `parsers/xml.clj`, `hiccup_based_parser.clj` | Not needed — regex SVN parser covers it |
| `analysis/workarounds.clj` | Not applicable (Incanter-specific) |

---

## Shared: Analysis CLI name → TypeScript call

| `-a` value | TypeScript |
|---|---|
| `authors` | `authors.byCount(entries, options)` |
| `revisions` | `entities.byRevision(entries, options)` |
| `coupling` | `logicalCoupling.byDegree(entries, options)` |
| `soc` | `sumOfCoupling.byDegree(entries, options)` |
| `summary` | `summary.overview(entries)` |
| `identity` | `entries` (raw dump) |
| `abs-churn` | `churn.absolutesTrend(entries, options)` |
| `author-churn` | `churn.byAuthor(entries, options)` |
| `entity-churn` | `churn.byEntity(entries, options)` |
| `entity-ownership` | `churn.asOwnership(entries, options)` |
| `main-dev` | `churn.byMainDeveloper(entries, options)` |
| `refactoring-main-dev` | `churn.byRefactoringMainDeveloper(entries, options)` |
| `entity-effort` | `effort.asRevisionsPerAuthor(entries, options)` |
| `main-dev-by-revs` | `effort.asMainDeveloperByRevisions(entries, options)` |
| `fragmentation` | `effort.asEntityFragmentation(entries, options)` |
| `communication` | `communication.bySharedEntities(entries)` |
| `messages` | `commitMessages.byWordFrequency(entries, {expressionToMatch})` |
| `age` | `codeAge.byAge(entries, ageTimeNow)` |

---

## Shared: TypeScript fields → CSV headers (verified against JAR)

> **Note:** Several entries in the original plan were wrong. These are the verified correct mappings from Clojure source + JAR output.

| Analysis | TS fields | CSV headers |
|---|---|---|
| authors | entity, nAuthors, nRevs | entity,n-authors,n-revs |
| revisions | entity, nRevs | entity,n-revs |
| coupling | entity, coupled, degree, averageRevs | entity,coupled,degree,average-revs |
| soc | entity, soc | entity,soc |
| summary | statistic, value | statistic,value |
| abs-churn | date, added, deleted, commits | date,added,deleted,commits |
| author-churn | author, added, deleted, commits | author,added,deleted,commits |
| entity-churn | entity, added, deleted, commits | entity,added,deleted,commits |
| entity-ownership | entity, author, added, deleted | entity,author,added,deleted |
| main-dev | entity, mainDev, added, totalAdded, ownership | entity,main-dev,added,total-added,ownership |
| refactoring-main-dev | entity, mainDev, removed, totalRemoved, ownership | entity,main-dev,removed,total-removed,ownership |
| entity-effort | entity, author, authorRevs, totalRevs | entity,author,author-revs,total-revs |
| main-dev-by-revs | entity, mainDev, added, totalAdded, ownership | entity,main-dev,added,total-added,ownership |
| fragmentation | entity, fractalValue, totalRevs | entity,fractal-value,total-revs |
| communication | author, peer, shared, average, strength | author,peer,shared,average,strength |
| messages | entity, matches | entity,matches |
| age | entity, ageMonths | entity,age-months |

---

## Notes

- `identity` excluded from parity tests — schema differs per VCS (git has loc columns; hg/p4 don't)
- `messages` excluded for hg/p4 — placeholder messages (`"-"`, `""`) cause JAR to error
- `soc` with default `minRevs:5` produces empty output for simple fixtures — both JAR and TS return same empty result, so parity holds
- Float fields: `ownership` and `fractal-value` require `.toFixed(1)` formatting to match JAR (e.g. `1.0` not `1`)
- `byRefactoringMainDeveloper`: sort tie-break fixed — `>=` instead of `>` to match Clojure's last-wins behaviour
- Parity test defaults: `minRevs:5, minSharedRevs:5, minCoupling:30, maxCoupling:100, maxChangesetSize:30` (match JAR defaults)
- `summary.overview`: uses `allRevisions(entries).length` (not `new Set(...)` — `allRevisions` already deduplicates)
