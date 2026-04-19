# Task 3: Export `summary` from `src/index.ts`

**File:** `src/index.ts`

**Verify prerequisite (Task 1 done):**
```bash
bun test tests/code_maat/analysis/summary.test.ts  # must pass
```

---

In `src/index.ts`, add after `export * as entities`:

```typescript
export * as summary from "./code_maat/analysis/summary";
```

`bun run tsc --noEmit` → clean

---

## Commit

```bash
git add src/index.ts
git commit -m "feat: export summary analysis from public API"
```
