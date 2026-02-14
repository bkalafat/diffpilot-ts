# DiffPilot

**AI code review that runs entirely on your machine.**

Catch bugs, security issues, and code smells *before* they reach your team. DiffPilot is an MCP server that brings AI-powered code review directly into VS Code—with complete privacy.

![DiffPilot](https://raw.githubusercontent.com/bkalafat/DiffPilot-TS/main/vscode-extension/images/diffpilot.png)

---

## How It Works

```
You write code → Ask AI to review → DiffPilot reads your local git diff → AI analyzes → You fix issues
```

**Everything happens on your workstation.** DiffPilot uses standard `git diff` commands to read your changes, then passes them to your AI assistant (GitHub Copilot, Claude, etc.) for analysis. No external servers, no uploads, no network calls.

---

## Why DiffPilot?

| Traditional Code Review | With DiffPilot |
|------------------------|----------------|
| Push first, review later | Review before pushing |
| Wait for teammates | Instant AI feedback |
| Issues found in PR | Issues fixed locally |
| Code visible on servers | Code stays on your machine |

---

## Quick Start

Open GitHub Copilot Chat and try:

```
@workspace #check_changes
```

That's it. DiffPilot will analyze your uncommitted changes and report issues.

### More Examples

```
# Review your branch vs main
@workspace #review_code

# Focus on specific concerns
@workspace #review_code focus on security and SQL injection

# Generate a commit message
@workspace #create_commit_message

# Check for accidentally committed secrets
@workspace #find_secrets
```

---

## 7 MCP Tools

| Tool | What It Does |
|------|--------------|
| `check_changes` | Review local staged/unstaged changes |
| `get_diff` | Get diff between your branch and base |
| `review_code` | AI-powered code review with issue detection |
| `create_pr_title` | Generate PR title from changes |
| `create_pr_body` | Create complete PR description |
| `create_commit_message` | Generate conventional commit message |
| `find_secrets` | Detect API keys, passwords, tokens |

---

## Privacy & Security

DiffPilot is designed for environments where code confidentiality matters:

- **Offline Operation** — Works without internet access
- **No Telemetry** — Zero usage data collection
- **No External Calls** — Only runs local git commands
- **Open Source** — Full source code available for audit
- **Standard Git** — Uses only `git diff`, `git status`, `git branch`

Your source code is read by `git` on your machine, processed locally, and passed to your configured AI assistant. DiffPilot itself does not store, transmit, or log any code content.

> **For Regulated Industries:** DiffPilot is suitable for air-gapped environments, on-premises deployments, and organizations with strict data residency requirements. The extension contains no outbound network code.

---

## Use Cases

### Self-Review Before PR

```
# After finishing your feature:
@workspace #check_changes

# AI reports issues → You fix locally → Then push clean code
```

### Security-Focused Review

```bash
git checkout feature/payment-integration
```
```
@workspace #review_code focus on security, input validation, and SQL injection
```

### Pre-Commit Secret Detection

```
@workspace #find_secrets

# Catches: API keys, AWS credentials, JWT tokens, private keys, passwords
```

### Automated Commit Messages

```
@workspace #create_commit_message

# Output: feat(auth): add JWT token refresh with 24h expiry
```

---

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search "DiffPilot"
4. Click Install

### For Other MCP Clients

```json
{
  "mcpServers": {
    "diffpilot": {
      "command": "npx",
      "args": ["diffpilot"]
    }
  }
}
```

---

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `diffpilot.nodePath` | `node` | Path to Node.js executable |
| `diffpilot.serverPath` | (bundled) | Custom MCP server path |

---

## Requirements

- **VS Code** 1.101 or later
- **Node.js** 18 or later
- **Git** (any recent version)

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   VS Code       │────▶│   DiffPilot     │────▶│   Git CLI       │
│   + Copilot     │     │   MCP Server    │     │   (local)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │ stdio (JSON-RPC)
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│   AI Assistant  │◀────│   Diff Output   │
│   (your choice) │     │   (text only)   │
└─────────────────┘     └─────────────────┘
```

DiffPilot communicates with VS Code via MCP (Model Context Protocol) over stdio. It spawns `git` subprocesses to read repository state. All data flows through local pipes—no sockets, no HTTP.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.2.0 | 2026-02-14 | `check_changes` output now matches `review_code` format with severity ordering (Critical → Major → Minor) and mandatory `file:line` references |
| 2.1.1 | 2026-02-11 | Base branch detection now prioritizes git history; large diff review prompts now recommend `#runsubagents` |
| 2.1.0 | 2026-01-30 | Edge case fix for main/master branch, enterprise security docs |
| 2.0.4 | 2025-12-11 | Documentation cleanup |
| 2.0.3 | 2025-12-11 | Privacy & security docs, architecture diagram |
| 2.0.2 | 2025-12-11 | Reduced package size (8MB → 5MB) |
| 2.0.1 | 2025-12-11 | Added `check_changes` for local review |
| 2.0.0 | 2025-12-10 | Initial release with 7 MCP tools |

---

## Links

- [Source Code](https://github.com/bkalafat/DiffPilot-TS)
- [Report Issues](https://github.com/bkalafat/DiffPilot-TS/issues)

---

## License

MIT © [Burak Kalafat](https://github.com/bkalafat)
