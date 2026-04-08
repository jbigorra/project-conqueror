# Plan: Automated Semver Versioning

**Date**: 2026-04-08
**Status**: COMPLETE
**Effort**: Medium
**Origin**: [monorepo-standardization.md](2026-04-08-monorepo-standardization.md) — Out of Scope item 6

---

## Goal

Set up automated semantic versioning so package versions are bumped based on conventional commits. Each merge to master should produce version bumps and changelogs without manual intervention.

---

## Current State

- All 8 packages at `v0.1.0`, all `private: true`
- Zero versioning tooling installed
- Already using conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`, etc.)
- No release workflow in GitHub Actions
- No `publishConfig` or `repository` fields
- Monorepo with pnpm workspaces + Turborepo

---

## Tool Selection: Release-Please

**Why Release-Please over Changesets:**

| | Release-Please | Changesets |
|---|---|---|
| Commit convention | Uses existing conventional commits | Requires manual changeset files per PR |
| Ceremony | Zero — just write commits normally | Must run `changeset` CLI before merging |
| Monorepo | Workspace plugin, auto-detects packages | Native workspace support |
| Changelog | Auto-generated from commits | Auto-generated from changeset descriptions |
| GitHub integration | Creates release PRs automatically | Requires GitHub Action, more config |
| Learning curve | Low — if you already use conventional commits | Medium — new workflow concept |

**Verdict**: Release-Please fits this project because conventional commits are already the standard. Zero new workflow for contributors.

---

## Phase 1: Install and configure Release-Please

**Action**:

1. Create `.release-please-manifest.json` (tracks current versions):
   ```json
   {
     "apps/webapp": "0.1.0",
     "packages/behave": "0.1.0",
     "packages/charts": "0.1.0",
     "packages/code-maat-port": "0.1.0",
     "packages/lib": "0.1.0",
     "packages/lizard-ts": "0.1.0"
   }
   ```
   Note: `typescript-config` excluded — config-only, no versioning needed.

2. Create `release-please-config.json`:
   ```json
   {
     "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
     "release-type": "node",
     "bump-minor-pre-major": true,
     "bump-patch-for-minor-pre-major": true,
     "packages": {
       "apps/webapp": {
         "component": "webapp"
       },
       "packages/behave": {
         "component": "behave"
       },
       "packages/charts": {
         "component": "charts"
       },
       "packages/code-maat-port": {
         "component": "code-maat-port"
       },
       "packages/lib": {
         "component": "lib"
       },
       "packages/lizard-ts": {
         "component": "lizard-ts"
       }
     }
   }
   ```

   Key options:
   - `bump-minor-pre-major: true` — while on 0.x, `feat:` bumps patch instead of minor (safer)
   - `bump-patch-for-minor-pre-major: true` — `fix:` also bumps patch on 0.x

**Affected files**:
- `.release-please-manifest.json` (CREATE)
- `release-please-config.json` (CREATE)

---

## Phase 2: GitHub Actions workflow

**Action**: Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [master]

permissions:
  contents: write
  pull-requests: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    steps:
      - uses: googleapis/release-please-action@v4
        with:
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json
```

**How it works**:
1. On every push to master, Release-Please analyzes conventional commits since last release
2. It creates/updates a "Release PR" with version bumps + CHANGELOG entries
3. When the Release PR is merged, it creates GitHub Releases with tags
4. No npm publish (all packages are `private: true`)

**Affected files**:
- `.github/workflows/release.yml` (CREATE)

---

## Phase 3: CHANGELOG.md files

**Problem**: No changelogs exist. Release-Please will create them automatically on first release.

**Action**: No manual action needed. Release-Please creates `CHANGELOG.md` in each package directory when it processes the first release PR.

**Optional**: Create empty `CHANGELOG.md` files now as placeholders, or let Release-Please create them.

---

## Phase 4: Verify and tune

1. Merge the configuration to master
2. Make a `feat:` or `fix:` commit to trigger Release-Please
3. Verify the Release PR is created with correct version bumps
4. Review changelog format and adjust config if needed

---

## Future Extensions (not in scope)

- **npm publish**: If packages become public, add `npm publish` step after release
- **Linked versions**: If packages should share a version, configure `linked-packages` in release-please-config
- **Pre-release channels**: `alpha`/`beta` releases on non-master branches

---

## Risks

- **Conventional commit compliance**: Release-Please relies on commit prefixes. Commits without `feat:`/`fix:` prefixes won't trigger version bumps. This is already the project convention, so low risk.
- **Monorepo path detection**: Release-Please needs to correctly attribute commits to packages based on file paths. May need tuning of `packages` config.
- **0.x semantics**: During 0.x, semver rules are relaxed. `bump-minor-pre-major` prevents unexpected jumps to 1.0.
