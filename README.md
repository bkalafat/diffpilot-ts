# DiffPilot

**Review your code before creating a PR. 100% local.**

Catch bugs, security issues, and code smells *before* they reach your team. DiffPilot brings AI-powered code review directly into your workflow—no cloud uploads, no waiting.

![DiffPilot](https://raw.githubusercontent.com/bkalafat/DiffPilot-TS/main/vscode-extension/images/diffpilot.png)

---

## Why DiffPilot?

> "I wish I had reviewed that before pushing..."

We've all been there. DiffPilot solves this by making self-review **instant** and **automatic**.

| 🔍 **Self-Review** | 👀 **Code Review** | 🎯 **Auto Detection** |
|:------------------:|:------------------:|:---------------------:|
| Review your own changes before pushing | Checkout any branch and review | No need to specify base branch |

**Stop pushing code blindly.** Get AI-powered feedback *before* creating a PR.

---

## Features

✅ **Local Code Review** — AI reviews your uncommitted changes instantly  
✅ **Branch Diff Analysis** — Compare any branch against main/master  
✅ **Secret Detection** — Catch API keys, passwords, tokens before commit  
✅ **Commit Messages** — Generate conventional commit messages automatically  
✅ **PR Generation** — Create PR titles and descriptions from your changes  
✅ **Zero Config** — Auto-detects base branch (main, master, develop)  
✅ **Enterprise Ready** — Works with Azure DevOps, TFS, air-gapped environments  
✅ **100% Local** — No cloud, no uploads, your code stays on your machine  

---

## Quick Start

Just ask your AI assistant:

```
# Review local changes (staged first, then unstaged)
@workspace #check_changes

# Review branch diff against main
@workspace #review_code

# Generate a commit message
@workspace #create_commit_message

# Check for leaked secrets
@workspace #find_secrets
```

---

## MCP Tools

DiffPilot provides 7 powerful MCP tools for GitHub Copilot, Claude, and other AI assistants:

| Tool | What it does |
|------|--------------|
| `#check_changes` | Review your local staged/unstaged changes |
| `#get_diff` | Get the diff between your branch and main |
| `#review_code` | AI code review with issue detection |
| `#create_pr_title` | Generate a PR title from your changes |
| `#create_pr_body` | Create a complete PR description |
| `#create_commit_message` | Generate conventional commit messages |
| `#find_secrets` | Detect leaked API keys, passwords, tokens |

---

## Use Cases

### 🔍 Self-Review Before PR

```
# After finishing your work, before creating a PR:
@workspace #check_changes

# AI finds issues → you fix locally → then push
```

### 👀 Code Reviewer Workflow

```bash
git checkout feature/user-authentication
```
```
@workspace #review_code focus on security
```

### 🔐 Pre-Commit Secret Check

```
@workspace #find_secrets

# Catches API keys, passwords, JWT tokens before commit
```

### 📝 Quick Commit Message

```
@workspace #create_commit_message

# Generates: feat(auth): add JWT token validation
```

---

## Installation

### VS Code Extension (Recommended)

Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=BurakKalafat.diffpilot)

### npm

```bash
npm install -g diffpilot
```

### npx (No install)

```bash
npx diffpilot
```

### Manual MCP Configuration

For Claude Desktop or other MCP clients:

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

## Requirements

- **VS Code** 1.101+
- **Node.js** 18+
- **Git**

---

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `diffpilot.nodePath` | `node` | Path to Node.js executable |
| `diffpilot.serverPath` | (bundled) | Custom MCP server path |

---

## How It Works

1. **You make changes** to your code
2. **Ask AI** to review with `#check_changes` or `#review_code`
3. **DiffPilot** fetches the git diff and sends to your AI assistant
4. **AI analyzes** and reports issues in `file:line` format
5. **You fix** issues locally before pushing

All processing happens locally. Your code never leaves your machine.

---

## Version History

| Version | Changes |
|---------|---------|
| **2.1.1** | Base branch detection now prioritizes git history; large diff review prompts now recommend `#runsubagents` |
| **2.1.0** | Edge case fix for main/master branch, enterprise security docs |
| **2.0.4** | Documentation cleanup |
| **2.0.3** | Privacy & security docs, architecture diagram |
| **2.0.2** | Reduced package size (8MB → 5MB) |
| **2.0.1** | Added `check_changes` for local review |
| **2.0.0** | Initial release with 7 MCP tools |

---

## Links

- 📦 [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=BurakKalafat.diffpilot)
- 🐙 [GitHub](https://github.com/bkalafat/DiffPilot-TS)
- 🐛 [Report Issues](https://github.com/bkalafat/DiffPilot-TS/issues)

---

## License

MIT © [Burak Kalafat](https://github.com/bkalafat)
