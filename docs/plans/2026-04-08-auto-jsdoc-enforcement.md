# Plan: Auto-JSDoc Enforcement on AI Code Changes

**Date**: 2026-04-08
**Status**: COMPLETE
**Effort**: Low
**Origin**: [monorepo-standardization.md](2026-04-08-monorepo-standardization.md) — Out of Scope item 5

---

## Goal

Ensure AI agents (Claude Code, OpenCode, or any CLAUDE.md/AGENTS.md-compatible tool) automatically add or update JSDoc when they modify public API exports. Must be **tool-agnostic** — the user is migrating from Claude Code to OpenCode.

---

## Compatibility Strategy

Both tools read instruction files:
- **Claude Code**: reads `CLAUDE.md` natively
- **OpenCode**: reads `AGENTS.md` as primary, `CLAUDE.md` as fallback
- **Current setup**: `AGENTS.md → symlink → CLAUDE.md` in all packages

Therefore, the enforcement mechanism is **CLAUDE.md instructions** — the single source of truth that both tools consume.

---

## Phase 1: Root CLAUDE.md — JSDoc enforcement section

**Problem**: Current root CLAUDE.md says "JSDoc required" under Standards, but lacks specific enforcement instructions that tell agents WHEN and HOW to act.

**Action**: Add a dedicated "JSDoc Enforcement" section to root `CLAUDE.md` with actionable instructions:

```markdown
## JSDoc Enforcement (Automatic)

When you modify or create a file under `src/` in any package:

1. **Check**: Does the file contain `export` statements?
2. **For each exported symbol** (function, class, type, interface, const):
   - If JSDoc is missing → add it
   - If JSDoc exists but is incomplete (missing @param, @returns, @example) → complete it
3. **JSDoc standard**:
   - Functions: `@param`, `@returns`, `@throws` (if applicable), `@example`
   - Classes: class description, constructor `@param`, all public methods documented
   - Types/interfaces: description, field-level comments for non-obvious fields
   - Lit Web Components: `@element`, `@attr`, `@fires`, `@example`
4. **Do NOT** add JSDoc to:
   - Non-exported (internal) symbols
   - Test files
   - Re-export barrels (the source file has the docs)
```

**Affected files**:
- `/CLAUDE.md` (UPDATE — add JSDoc Enforcement section)

---

## Phase 2: Package-level CLAUDE.md — package-specific JSDoc patterns

**Problem**: Some packages have domain-specific JSDoc patterns (e.g., charts uses `@element`, behave uses Effect schemas).

**Action**: Add a brief JSDoc note to each package's CLAUDE.md under its Standards section, referencing the root convention and noting package-specific patterns:

- **charts**: "Web Components use `@element`, `@attr`, `@fires` tags"
- **behave**: "Effect schemas use type-level descriptions with `@example`"
- **code-maat-port**: "Parser entry types need field-level JSDoc comments"
- Others: reference root convention only

**Affected files**:
- `packages/charts/CLAUDE.md` (UPDATE)
- `packages/behave/CLAUDE.md` (UPDATE)
- `packages/code-maat-port/CLAUDE.md` (UPDATE)

---

## Phase 3: Verification script (optional)

**Problem**: Instructions rely on AI compliance. There's no way to verify coverage is maintained.

**Action**: Create a simple script that counts exported symbols vs JSDoc'd symbols per package. Not a blocker or hook — just a reporting tool.

```bash
# Usage: bun run jsdoc:coverage
# Outputs: package → exported / documented / percentage
```

This could be a root script or a standalone `.ts` file under `scripts/`.

**Decision needed**: Is this worth the effort? It's purely informational — no blocking behavior.

**Affected files**:
- `scripts/jsdoc-coverage.ts` (CREATE, optional)
- Root `package.json` (ADD script, optional)

---

## Hook Strategy

Both tools support hooks but with different mechanisms:

| Mechanism | Claude Code | OpenCode | Notes |
|-----------|:-:|:-:|-------|
| CLAUDE.md/AGENTS.md instructions | Yes | Yes | Passive enforcement, tool-agnostic |
| Post-tool hooks | `settings.json` shell commands | JS/TS plugin (`tool.execute.after`) | Active enforcement, tool-specific impl |
| Pre-commit hook (AST analysis) | Yes | Yes | Tool-agnostic but high effort |
| CI check (coverage report) | Yes | Yes | Informational only |

**Decision**: Instructions (Phase 1-2) are the primary enforcement and work everywhere. Post-tool hooks (Phase 3 alternative) can be added per-tool for active enforcement. The hook implementations differ but the BEHAVIOR is the same: after editing a `src/` file, check if exports have JSDoc.

---

## Risks

- **AI compliance**: Instructions are advisory — an AI agent could ignore them. Mitigated by clear, specific instructions and consistent patterns in existing code.
- **Drift over time**: Without automated checks, coverage could degrade. Phase 3 mitigates this.
- **OpenCode behavior**: Need to verify that OpenCode processes AGENTS.md instructions with the same fidelity as Claude Code processes CLAUDE.md.
