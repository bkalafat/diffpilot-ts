---
applyTo: "**/package.json,**/CHANGELOG.md"
---

# Versioning Instructions for DiffPilot

## Semantic Versioning

DiffPilot follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

| Type | When to Bump | Examples |
|------|--------------|----------|
| **MAJOR** | Breaking changes to MCP tool schemas, removed tools | Tool renamed, parameter removed |
| **MINOR** | New features, new tools, backward-compatible changes | New tool added, new optional parameter |
| **PATCH** | Bug fixes, documentation, internal improvements | Edge case fix, typo fix, refactor |

## Version Locations

Both packages **MUST** have synchronized versions:

1. **Main MCP Server**: `package.json` → `version`
2. **VS Code Extension**: `vscode-extension/package.json` → `version`

## Release Checklist

### Before Releasing

1. Run tests: `npm test`
2. Run build: `npm run build`
3. Check for errors: `npm run build` in both root and `vscode-extension/`

### Version Bump Process

```bash
# 1. Decide version type
# PATCH: bug fixes (2.1.0 → 2.1.1)
# MINOR: new features (2.1.0 → 2.2.0)
# MAJOR: breaking changes (2.1.0 → 3.0.0)

# 2. Update both package.json files
# - package.json (root)
# - vscode-extension/package.json

# 3. Update CHANGELOG
# - vscode-extension/CHANGELOG.md
# Add new version section at top with date

# 4. Build and test
npm run build
npm test
cd vscode-extension && npm run compile

# 5. Build extension server
cd vscode-extension && node build-server.js

# 6. Package extension
cd vscode-extension && npm run package

# 7. Commit and tag
git add -A
git commit -m "chore: release v{VERSION}"
git tag v{VERSION}
git push && git push --tags
```

### CHANGELOG Format

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing features

### Fixed
- Bug fixes

### Removed
- Removed features

### Security
- Security improvements
```

## Publishing

### VS Code Marketplace

```bash
cd vscode-extension
npm run publish
# or manually upload .vsix to marketplace
```

### NPM (optional)

```bash
npm publish
```

## Pre-release Versions

For testing before official release:

```
2.2.0-beta.1
2.2.0-rc.1
```

## Version History Reference

| Version | Date | Highlights |
|---------|------|------------|
| 2.2.0 | 2026-02-14 | Unified `check_changes` and `review_code` review format with severity ordering and mandatory file references |
| 2.1.1 | 2026-02-11 | Improved base branch detection priority, large diff review guidance |
| 2.1.0 | 2026-01-30 | Edge case fix, security docs |
| 2.0.4 | 2025-12-11 | Documentation cleanup |
| 2.0.0 | 2025-12-10 | TypeScript rewrite |
