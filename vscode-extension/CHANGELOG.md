# Changelog

All notable changes to the DiffPilot extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-01-30

### Added
- Enterprise security documentation (`docs/SECURITY.md`, `docs/ENTERPRISE-SECURITY-OVERVIEW.md`)
- `isDefaultBranch()` helper to detect main/master/develop branches
- `getUnpushedCommitCount()` to count unpushed commits to remote
- Versioning instructions (`.github/instructions/versioning.instructions.md`)

### Fixed
- **Edge case**: Working on main/master branch now gives actionable guidance instead of confusing error
- When on default branch with unpushed commits, compares local to remote automatically
- When on default branch with no unpushed commits, provides clear next steps

### Security
- Added SOC2, GDPR, HIPAA compliance documentation
- Added CWE compliance matrix for enterprise audits
- Documented zero external network connections

## [2.0.4] - 2025-12-11

### Changed
- Cleaned up documentation, removed legacy references
- Streamlined README for clarity

## [2.0.3] - 2025-12-11

### Changed
- Completely rewritten README for VS Code Marketplace
- Added detailed privacy and security documentation
- Added architecture diagram
- Improved quick start examples

## [2.0.2] - 2025-12-11

### Changed
- Reduced package size from 8MB to 5MB
- Removed unused files and images from VSIX
- Added `.vscodeignore` rules for node_modules cleanup

## [2.0.1] - 2025-12-11

### Added
- New `check_changes` tool for reviewing local staged/unstaged changes
- Simplified review output format: `file:line` - [severity] [issue] → [suggestion]

### Changed
- Renamed tools for clarity (e.g., `get_pr_diff` → `get_diff`, `review_pr_changes` → `review_code`)
- Shortened tool descriptions to ~5 words each
- Streamlined review instructions output

### Removed
- `diff_stats` tool (unused)
- `suggest_tests` tool (unused)
- `generate_changelog` tool (unused)

## [2.0.0] - 2025-12-10

### Added
- TypeScript/Node.js MCP server implementation
- 7 MCP tools for AI-powered code review
- Bundled server (no external runtime required except Node.js)
- Full compatibility with VS Code 1.101+ MCP features
- Privacy-focused design with local-only operation
