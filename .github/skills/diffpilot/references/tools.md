# DiffPilot MCP Tools Reference

## Tool Definitions

### check_changes
Reviews local uncommitted changes (staged first, then unstaged).

**Parameters:**
- `workingDirectory` (optional): Directory to check. Defaults to `DIFFPILOT_WORKSPACE` env var.

**Use When:**
- Before committing changes
- Quick self-review of recent work
- Checking what you've modified

**Example:**
```
@workspace #check_changes
```

---

### get_diff
Gets the raw diff between current branch and base branch.

**Parameters:**
- `workingDirectory` (optional): Repository directory
- `baseBranch` (optional): Branch to compare against. Auto-detects main/master/develop if not specified.

**Use When:**
- Need to see exact changes in diff format
- Comparing against a specific branch
- Feeding diff to other tools

**Example:**
```
@workspace #get_diff baseBranch:develop
```

---

### review_code
Performs AI-powered code review with issue detection.

**Parameters:**
- `workingDirectory` (optional): Repository directory
- `baseBranch` (optional): Branch to compare against
- `focus` (optional): Areas to focus on (e.g., "security", "performance")

**Use When:**
- Pre-PR comprehensive review
- Focused review on specific concerns
- Code quality assessment

**Examples:**
```
@workspace #review_code
@workspace #review_code focus on security and input validation
@workspace #review_code focus on error handling
```

---

### create_pr_title
Generates a PR title based on changes.

**Parameters:**
- `workingDirectory` (optional): Repository directory
- `baseBranch` (optional): Branch to compare against

**Use When:**
- Preparing a Pull Request
- Need a concise summary of changes

**Example:**
```
@workspace #create_pr_title
```

**Output Format:**
```
feat(auth): Add JWT token validation
```

---

### create_pr_body
Creates a complete PR description.

**Parameters:**
- `workingDirectory` (optional): Repository directory
- `baseBranch` (optional): Branch to compare against

**Use When:**
- Creating a Pull Request
- Need structured description of changes

**Example:**
```
@workspace #create_pr_body
```

**Output Format:**
```markdown
## Summary
Brief description of changes

## Changes
- List of changes made

## Type of Change
- [ ] Bug fix
- [x] New feature
- [ ] Breaking change

## Testing
How the changes were tested
```

---

### create_commit_message
Generates a conventional commit message.

**Parameters:**
- `workingDirectory` (optional): Repository directory
- `staged` (optional): Whether to analyze staged changes only. Default: true

**Use When:**
- Ready to commit changes
- Need consistent commit format
- Following conventional commits spec

**Example:**
```
@workspace #create_commit_message
```

**Output Format:**
```
feat(auth): add OAuth2 provider integration

- Add Google OAuth provider
- Add GitHub OAuth provider
- Update user model with provider field
```

---

### find_secrets
Detects leaked credentials and sensitive data.

**Parameters:**
- `workingDirectory` (optional): Repository directory

**Use When:**
- Before every commit (recommended)
- Security audit
- Pre-push verification

**Detects:**
- API keys and tokens
- AWS credentials
- Private keys
- Passwords in code
- JWT tokens
- Database connection strings
- Generic secrets patterns

**Example:**
```
@workspace #find_secrets
```

## Best Practice Workflows

### Daily Development
1. `#check_changes` - Quick review of work
2. `#find_secrets` - Security check
3. `#create_commit_message` - Generate commit

### Pre-PR
1. `#review_code` - Full review
2. `#find_secrets` - Security check
3. `#create_pr_title` - Generate title
4. `#create_pr_body` - Generate description

### Code Review (Reviewer)
1. Checkout feature branch
2. `#review_code focus on [concern]` - Targeted review
3. `#find_secrets` - Security verification
