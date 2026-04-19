# Task 4: JAR Parity Test Helpers

**Status: DONE**
**File:** `tests/parity/helpers.ts`

JAR CLI: `java -jar <jar> -l <logfile> -c <vcs> -a <analysis> [extra flags]`

---

## Key implementation notes (from actual execution)

**`runTS` defaults must match JAR defaults:**
```typescript
minRevs: 5, minSharedRevs: 5, minCoupling: 30, maxCoupling: 100, maxChangesetSize: 30
```
(Not `minRevs:1` as originally planned — JAR defaults are higher.)

**Float formatting required:** The JAR outputs `ownership` and `fractal-value` as floats even when integer (e.g. `1.0` not `1`). Added `FLOAT_FIELDS` map and `.toFixed(1)` formatting in `toCSV`.

**Correct field mappings** (original plan had wrong entries for ownership/churn analyses — see `index.md` for verified table):
- `entity-ownership` → `entity,author,added,deleted` (not `added%`)
- `main-dev` → `entity,main-dev,added,total-added,ownership`
- `refactoring-main-dev` → `entity,main-dev,removed,total-removed,ownership`
- `main-dev-by-revs` → `entity,main-dev,added,total-added,ownership`

See `tests/parity/helpers.ts` for the full implemented `HEADERS`, `FIELD_MAP`, and `FLOAT_FIELDS`.

---

## Commit

```bash
git add tests/parity/helpers.ts
git commit -m "feat: add JAR parity test helpers"
```
