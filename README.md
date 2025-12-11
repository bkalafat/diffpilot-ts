# DiffPilot v2.0.0

**Local AI Code Review for GitHub Copilot, Claude, and AI Assistants**

> 🔌 MCP Server - TypeScript/Node.js Implementation  
> ⚡ Node.js 18+ required

---

## 💡 Why DiffPilot?

| 🔍 **Self-Review** | 👀 **Code Review** | 🎯 **Auto Detection** |
|:------------------:|:------------------:|:---------------------:|
| Review your own changes before pushing | Checkout any branch and review | No need to specify base branch |

**Stop pushing code blindly.** Get AI-powered feedback on your changes *before* creating a PR.

---

## 📦 Installation

### VS Code Extension (Recommended)

Install from [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=BurakKalafat.diffpilot)

### npm (Global)

```bash
npm install -g diffpilot
```

### npx (Direct Usage)

```bash
npx diffpilot
```

### Manual MCP Configuration

Add to your MCP settings (Claude Desktop, etc.):

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

## 🚀 Quick Start

```
# Review local changes (staged first, then unstaged)
@workspace #check_changes

# Review branch diff vs main
@workspace #review_code

# Generate commit message
@workspace #create_commit_message

# Scan for secrets
@workspace #find_secrets
```

---

## 🛠️ 7 MCP Tools

| Tool | Description |
|------|-------------|
| `check_changes` | Review local staged/unstaged |
| `get_diff` | Get branch diff vs main |
| `review_code` | Review branch diff vs main |
| `create_pr_title` | Create a PR title |
| `create_pr_body` | Create PR description |
| `create_commit_message` | Create commit message |
| `find_secrets` | Find leaked passwords/keys |

---

## ✨ Key Features

- 🔄 **Auto Branch Detection** - Finds `main`, `master`, `develop` automatically
- 🔐 **Secret Scanning** - Detects API keys, passwords, tokens, JWT, private keys
- 🏢 **Enterprise Ready** - Azure DevOps, TFS, air-gapped environments
- ⚡ **Zero External Dependencies** - Pure TypeScript/Node.js

---

## 📁 Project Structure

```
diffpilot-ts/
├── src/
│   ├── index.ts           # MCP Server entry point
│   ├── git/               # Git operations
│   │   └── git-service.ts
│   ├── security/          # Security helpers
│   │   └── security-helpers.ts
│   ├── tools/             # MCP tool implementations
│   │   ├── pr-review.ts   # PR review tools
│   │   ├── developer.ts   # Developer tools
│   │   └── types.ts       # Shared types
│   └── utils/             # Utilities
├── tests/                 # Vitest tests
├── vscode-extension/      # VS Code Extension
│   ├── src/
│   │   └── extension.ts
│   ├── images/
│   └── package.json
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## 🔧 Development

### Prerequisites

- Node.js 18+
- Git

### Setup

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run in development
npm run dev
```

### Build Extension

```bash
cd vscode-extension
npm install
npm run package
```

This creates `diffpilot-2.0.0.vsix` in the vscode-extension folder.

---

## 🆚 C# vs TypeScript Version

| Feature | C# (.NET 9) | TypeScript (Node.js) |
|---------|-------------|---------------------|
| Runtime | .NET 9 SDK | Node.js 18+ |
| Startup | Slower (JIT) | Faster |
| Binary Size | ~50MB | ~7MB |
| Dependencies | None | @modelcontextprotocol/sdk |
| Performance | Excellent | Very Good |

Choose TypeScript if:
- You don't have .NET SDK installed
- You want faster startup time
- You prefer smaller extension size

Choose C# if:
- You already have .NET 9 SDK
- You want maximum performance
- You're in a .NET-heavy environment

---

## 📄 License

MIT - [Burak Kalafat](https://github.com/bkalafat)

---

## 📋 Version History

| Version | Changes |
|---------|--------|
| **2.0.2** | Reduced package size (8MB → 5MB), cleanup unused files |
| **2.0.1** | Added `check_changes` tool for local staged/unstaged review |
| **2.0.0** | Renamed tools, simplified descriptions, removed 3 unused tools |
| **1.x** | Initial release with 9 MCP tools |

---

## 🔗 Links

- **VS Code Marketplace**: [DiffPilot Extension](https://marketplace.visualstudio.com/items?itemName=BurakKalafat.diffpilot)
- **C# Version**: [DiffPilot (C#)](https://github.com/bkalafat/DiffPilot)
- **Issues**: [GitHub Issues](https://github.com/bkalafat/DiffPilot-TS/issues)
