---
agent: 'agent'
description: 'Run a comprehensive security audit on the codebase'
---
Perform a comprehensive security audit:

1. Run `#find_secrets` to detect any exposed credentials
2. Run `#review_code` with focus on security vulnerabilities

Check for these security issues:
- **CWE-20**: Input validation failures
- **CWE-22**: Path traversal vulnerabilities
- **CWE-78**: OS command injection
- **CWE-89**: SQL injection
- **CWE-79**: Cross-site scripting (XSS)
- **CWE-200**: Information disclosure
- **CWE-400**: Denial of service vectors
- **CWE-532**: Log injection

Report format:
```
## Security Audit Results

### Critical (Fix Immediately)
- [file:line] Description and remediation

### High (Fix Before Release)
- [file:line] Description and remediation

### Medium (Should Fix)
- [file:line] Description and remediation

### Low (Consider Fixing)
- [file:line] Description and remediation

### Secrets Detected
- [status] No secrets found / List of findings
```
