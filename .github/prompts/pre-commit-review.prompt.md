---
agent: 'agent'
description: 'Perform a pre-commit code review checking for security issues, code quality, and leaked secrets'
---
Perform a comprehensive pre-commit code review:

1. First, run `#find_secrets` to check for any leaked credentials, API keys, or sensitive data
2. Then run `#check_changes` to review all staged and unstaged changes
3. Focus on:
   - Security vulnerabilities (SQL injection, XSS, command injection)
   - Input validation issues
   - Error handling problems
   - Code quality and maintainability
   - Missing type annotations

Report findings in this format:
- **Critical**: Security issues that must be fixed
- **Warning**: Code quality issues to consider
- **Info**: Suggestions for improvement

If no issues found, confirm the code is ready to commit.
