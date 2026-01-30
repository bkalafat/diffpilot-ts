# Copilot Instructions for DiffPilot

## Project Overview

DiffPilot is a **Model Context Protocol (MCP) server** written in TypeScript/Node.js that provides PR code review and developer productivity tools. It's designed to work with GitHub Copilot, Claude, and other AI assistants.

### Key Technologies
- **Runtime**: Node.js 18+
- **Language**: TypeScript (ES2022, NodeNext modules)
- **Testing**: Vitest
- **Dependencies**: `@modelcontextprotocol/sdk`
- **Build**: `tsc` (TypeScript Compiler)

## Project Structure

```
diffpilot-ts/
├── src/
│   ├── index.ts              # MCP Server entry point, tool definitions, request handlers
│   ├── git/
│   │   └── git-service.ts    # Git command execution, branch detection
│   ├── security/
│   │   └── security-helpers.ts # Input validation, rate limiting, secret detection
│   └── tools/
│       ├── pr-review.ts      # PR review tools (get_diff, review_code, etc.)
│       ├── developer.ts      # Developer tools (create_commit_message, find_secrets)
│       └── types.ts          # Shared types and result helpers
├── tests/                    # Vitest test files
├── vscode-extension/         # VS Code Extension wrapper
│   ├── src/extension.ts      # Extension activation, MCP server registration
│   ├── server/               # Bundled MCP server for extension
│   └── build-server.js       # Build script for bundling server
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 7 MCP Tools

The server provides these tools:

| Tool | Purpose | File |
|------|---------|------|
| `check_changes` | Review local staged/unstaged | `src/tools/developer.ts` |
| `get_diff` | Get branch diff vs main | `src/tools/pr-review.ts` |
| `review_code` | Review branch diff vs main | `src/tools/pr-review.ts` |
| `create_pr_title` | Create a PR title | `src/tools/pr-review.ts` |
| `create_pr_body` | Create PR description text | `src/tools/pr-review.ts` |
| `create_commit_message` | Create commit message | `src/tools/developer.ts` |
| `find_secrets` | Find leaked passwords or keys | `src/tools/developer.ts` |

## Coding Standards

### TypeScript Patterns
- Use ES modules (`import`/`export`) with `.js` extensions in imports
- Use `type` imports for type-only imports: `import type { Tool } from '...'`
- Prefer `interface` for object shapes, `type` for unions and function types
- Use strict TypeScript (`strict: true`)
- All async functions return `Promise<T>`

### Function Documentation
- Use JSDoc comments for all public functions
- Include `@param` and `@returns` annotations
- Document security considerations where applicable

### File Organization
- Group related functions with section comments: `// ============================================================================`
- Export types with their related functions
- Keep helper functions private unless needed externally

### Error Handling
- Use the `ToolResult` type from `src/tools/types.ts` for tool return values
- Use helper functions: `success()`, `error()`, `gitError()`
- Sanitize error messages before returning to prevent information disclosure

### Git Operations
- All git commands go through `git-service.ts`
- Use `runGitCommand()` for executing git commands
- Validate branch names with `isValidBranchName()` before use
- Use `findBaseBranch()` for auto-detecting main/master/develop

## Security Requirements

The codebase implements multiple security protections (see `src/security/security-helpers.ts`):

- **CWE-20**: Input validation - validate all user inputs
- **CWE-22**: Path traversal prevention - validate working directories
- **CWE-78**: OS command injection prevention - sanitize command arguments
- **CWE-158**: Null byte injection prevention
- **CWE-200**: Information disclosure prevention - sanitize outputs
- **CWE-400**: DoS prevention - rate limiting, input length limits
- **CWE-532**: Log injection prevention - sanitize log messages

**When adding new features:**
1. Validate all input parameters
2. Use `sanitizeOutput()` for responses containing user data
3. Use `sanitizeErrorMessage()` before returning errors
4. Log security events with `logSecurityEvent()`
5. Check rate limits for new tools

## Testing

Tests use Vitest and are in the `tests/` directory.

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

**Test file naming**: `*.test.ts` (e.g., `pr-review.test.ts`)

**Test patterns**:
```typescript
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  it('should do something', () => {
    expect(result).toBe(expected);
  });
});
```

## Common Tasks

### Adding a New Tool

1. Define the tool interface in `src/tools/developer.ts` or `src/tools/pr-review.ts`
2. Implement the tool function returning `ToolResult`
3. Export the function and types
4. Add tool definition to `TOOLS` array in `src/index.ts`
5. Add case to the switch statement in `createServer()`
6. Import the new types in `src/index.ts`
7. Add tests in `tests/`

### Building

```bash
npm run build    # Compile TypeScript to dist/
npm run dev      # Watch mode for development
```

### VS Code Extension

The extension in `vscode-extension/` bundles the MCP server:

```bash
cd vscode-extension
node build-server.js  # Bundle server into extension
```

## MCP Protocol Notes

- Server communicates via **stdio** (stdin/stdout for JSON-RPC)
- Use `console.error()` for logging (stdout is reserved for protocol)
- Tools return `CallToolResult` compatible objects
- Input schemas use JSON Schema format

## Environment Variables

- `DIFFPILOT_WORKSPACE`: Working directory for git operations (set by VS Code extension)

## Git Branch Detection

The server auto-detects the base branch in this priority:
1. Explicitly provided branch name
2. `main` branch
3. `master` branch
4. `develop` branch

## Copilot Customizations

This repository includes GitHub Copilot customizations in `.github/`:

### Skills
- `.github/skills/diffpilot/` - DiffPilot code review skill with tool reference

### Path-Specific Instructions
- `.github/instructions/typescript.instructions.md` - TypeScript coding standards
- `.github/instructions/security.instructions.md` - Security implementation guidelines
- `.github/instructions/testing.instructions.md` - Testing standards with Vitest

### Prompt Files
- `.github/prompts/pre-commit-review.prompt.md` - Pre-commit review workflow
- `.github/prompts/prepare-pr.prompt.md` - PR preparation workflow
- `.github/prompts/security-audit.prompt.md` - Security audit workflow

Use these with GitHub Copilot by referencing the skill or running the prompts.
