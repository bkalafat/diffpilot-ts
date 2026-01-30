---
name: diffpilot
description: 'AI-powered code review and PR preparation using DiffPilot MCP tools. Use when reviewing local changes, generating commit messages, creating PR descriptions, detecting secrets, or performing pre-push code review. Triggers on "review code", "check changes", "create commit message", "generate PR", "find secrets", "review my work", or any code review workflow.'
license: MIT
metadata:
  author: DiffPilot
  version: "2.0"
---

# DiffPilot Code Review Skill

## Overview

DiffPilot provides AI-powered code review that runs 100% locally. Review your code before creating a PR, catch issues before they reach your team.

## Available Tools

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `check_changes` | Review local staged/unstaged changes | Before committing, self-review |
| `get_diff` | Get diff between branch and main | Compare branch changes |
| `review_code` | Full code review with issue detection | Pre-PR review |
| `create_commit_message` | Generate conventional commit message | After making changes |
| `create_pr_title` | Generate PR title from changes | PR preparation |
| `create_pr_body` | Create complete PR description | PR preparation |
| `find_secrets` | Detect API keys, passwords, tokens | Pre-commit safety check |

## Workflow

### Self-Review Before Push

```
1. Make your code changes
2. Run check_changes to review staged/unstaged work
3. Fix any issues found
4. Run find_secrets to catch leaked credentials
5. Generate commit message with create_commit_message
6. Commit and push clean code
```

### PR Preparation

```
1. Ensure branch has all changes committed
2. Run review_code for comprehensive review
3. Address any security or quality issues
4. Generate PR title with create_pr_title
5. Generate PR body with create_pr_body
6. Create PR with confidence
```

### Reviewer Workflow

```bash
# Checkout the feature branch
git checkout feature/user-authentication
```

Then review with focus areas:

```
review_code focus on security and input validation
review_code focus on error handling
review_code focus on performance
```

## Tool Usage Examples

### Quick Self-Review

```
@workspace #check_changes
```

Analyzes staged changes first, then unstaged. Reports issues in `file:line` format.

### Security-Focused Review

```
@workspace #review_code focus on security, SQL injection, XSS
```

### Pre-Commit Secret Detection

```
@workspace #find_secrets
```

Catches:
- API keys and tokens
- AWS credentials
- Private keys
- Passwords in code
- JWT tokens
- Database connection strings

### Generate Commit Message

```
@workspace #create_commit_message
```

Generates conventional commit format:
- `feat(scope): description` for features
- `fix(scope): description` for bug fixes
- `docs(scope): description` for documentation
- `refactor(scope): description` for refactoring
- `test(scope): description` for tests
- `chore(scope): description` for maintenance

### Generate PR Description

```
@workspace #create_pr_title
@workspace #create_pr_body
```

Creates structured PR with:
- Summary of changes
- Type of change
- Testing performed
- Checklist items

## Best Practices

1. **Review before push** - Catch issues locally, not in PR review
2. **Check for secrets first** - Run `find_secrets` before every commit
3. **Use focused reviews** - Specify areas of concern for targeted feedback
4. **Generate consistent commits** - Use `create_commit_message` for conventional format
5. **Complete PR descriptions** - Use both title and body generators

## Issue Format

DiffPilot reports issues in a clickable format:

```
src/auth/login.ts:45 - Potential SQL injection vulnerability
src/api/users.ts:123 - Missing input validation
```

## Privacy & Security

- **100% Local** - All processing on your machine
- **No Cloud** - Code never leaves your workstation
- **No Telemetry** - Zero data collection
- **Git Only** - Uses standard `git diff` commands

## Integration

DiffPilot works with:
- GitHub Copilot Chat
- Claude Desktop
- Any MCP-compatible client

Configure in your MCP settings:

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
