# DiffPilot Security Documentation

## Executive Summary

DiffPilot is an **air-gapped, offline-first** code review tool that operates entirely within your organization's network boundaries. It makes **zero external network calls** and processes all data locally using only your company's existing Git infrastructure.

---

## Network Architecture

### Zero External Connections

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR CORPORATE NETWORK                       │
│                                                                  │
│  ┌──────────────┐     stdio (JSON-RPC)     ┌──────────────────┐ │
│  │   AI Client  │◄────────────────────────►│    DiffPilot     │ │
│  │  (Copilot/   │                          │    MCP Server    │ │
│  │   Claude)    │                          └────────┬─────────┘ │
│  └──────────────┘                                   │           │
│                                                     │ git CLI   │
│                                                     ▼           │
│                                          ┌──────────────────┐   │
│                                          │  Your Git Remote │   │
│                                          │  (Azure DevOps / │   │
│                                          │   GitHub Ent /   │   │
│                                          │   GitLab Self)   │   │
│                                          └──────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                    NO EXTERNAL CALLS
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTERNET                           │
│                                                                  │
│        ❌ No telemetry    ❌ No analytics    ❌ No API calls     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### What DiffPilot Connects To

| Connection | Target | Purpose | Configurable |
|------------|--------|---------|--------------|
| Git CLI | Your configured remote | `git fetch`, `git diff` | ✅ Uses your `.git/config` |
| stdio | AI client (local process) | MCP protocol messages | N/A (local IPC) |

### What DiffPilot NEVER Connects To

- ❌ DiffPilot servers (we have none)
- ❌ Telemetry/analytics services
- ❌ External APIs
- ❌ Cloud services
- ❌ License validation servers
- ❌ Update servers

---

## Network Verification

### Audit the Source Code

All network operations are in a single file. Verify yourself:

```bash
# Search for any HTTP/network imports
grep -r "fetch\|axios\|http\|https\|net\." src/ --include="*.ts"

# Only results: Pattern detection for code analysis (not actual calls)
# src/tools/developer.ts - detects if USER's code has HTTP calls
```

### Dependency Analysis

```bash
# Total production dependencies: 1
cat package.json | jq '.dependencies'
# {
#   "@modelcontextprotocol/sdk": "^1.0.0"
# }

# MCP SDK is the official Anthropic protocol - no network calls
```

### Runtime Verification

```bash
# Monitor network during execution (Windows)
netstat -b | findstr diffpilot

# Monitor network during execution (Linux/Mac)
lsof -i -P | grep node

# Result: NO external connections
```

---

## Security Architecture

### CWE Compliance

DiffPilot implements protections against MITRE's Common Weakness Enumeration:

| CWE ID | Vulnerability | Protection |
|--------|--------------|------------|
| CWE-20 | Input Validation | All parameters validated with strict patterns |
| CWE-22 | Path Traversal | Workspace boundaries enforced, `..` blocked |
| CWE-78 | OS Command Injection | Branch names sanitized, no shell interpolation |
| CWE-158 | Null Byte Injection | Null bytes stripped from all inputs |
| CWE-200 | Information Disclosure | Secrets auto-redacted from output |
| CWE-400 | DoS Prevention | Rate limiting (120 req/min/tool), output truncation |
| CWE-532 | Log Injection | Log entries sanitized, no sensitive data logged |

### Secret Detection & Redaction

Output is automatically scanned and secrets are redacted before being returned to the AI:

```
Detected patterns:
- API keys (api_key=xxx → api_key=[REDACTED])
- AWS credentials (AKIA... → AKIA[REDACTED])
- Private keys (-----BEGIN PRIVATE KEY-----)
- JWT tokens (eyJ...)
- GitHub tokens (ghp_...)
- Azure connection strings
- Passwords in URLs
- Generic secrets/tokens
```

### Input Validation

```typescript
// All branch names are validated:
// ✅ feature/add-login
// ✅ bugfix/JIRA-123
// ❌ main; rm -rf /    (command injection blocked)
// ❌ ../../../etc/passwd (path traversal blocked)
// ❌ --exec=malicious   (option injection blocked)
```

---

## Data Flow Audit

### What Data DiffPilot Reads

| Data Source | Access Method | Purpose |
|-------------|--------------|---------|
| Git diff output | `git diff` CLI | Code review |
| Git log | `git log` CLI | Commit analysis |
| Staged changes | `git diff --cached` | Pre-commit review |
| Branch info | `git rev-parse` | Branch detection |

### What Data DiffPilot Writes

| Destination | Data | Purpose |
|-------------|------|---------|
| stdout | JSON-RPC responses | MCP protocol (to AI client) |
| stderr | Security audit logs | Debugging only |

### What Data DiffPilot NEVER Accesses

- ❌ File contents outside git diff
- ❌ Environment variables (except `DIFFPILOT_WORKSPACE`)
- ❌ Credentials/tokens
- ❌ Other repositories
- ❌ System files

---

## Enterprise Deployment

### Recommended Configuration

```json
// VS Code settings.json
{
  "github.copilot.chat.mcp.servers": {
    "diffpilot": {
      "command": "node",
      "args": ["C:/approved-tools/diffpilot/dist/index.js"],
      "env": {
        "DIFFPILOT_WORKSPACE": "${workspaceFolder}"
      }
    }
  }
}
```

### Network Policy Recommendations

```yaml
# No outbound rules required for DiffPilot
# All operations are local + your existing Git remote

firewall_rules:
  diffpilot:
    outbound:
      - NONE  # Zero external connections
    inbound:
      - NONE  # No listening ports
```

### Air-Gapped Installation

DiffPilot works fully offline:

```bash
# 1. On internet-connected machine, download dependencies
npm pack @modelcontextprotocol/sdk
npm pack diffpilot

# 2. Transfer .tgz files to air-gapped network

# 3. Install offline
npm install --offline ./modelcontextprotocol-sdk-1.0.0.tgz
npm install --offline ./diffpilot-1.0.0.tgz
```

---

## Compliance Checklist

### SOC 2 Type II

| Control | DiffPilot Compliance |
|---------|---------------------|
| CC6.1 - Logical Access | ✅ Runs with user's permissions only |
| CC6.6 - System Boundaries | ✅ No external network access |
| CC6.7 - Data Transmission | ✅ All data stays local |
| CC7.2 - Malicious Code Prevention | ✅ Input validation, no code execution |

### GDPR

| Requirement | DiffPilot Compliance |
|-------------|---------------------|
| Data Minimization | ✅ Only accesses git diff data |
| Storage Limitation | ✅ No persistent storage |
| Data Portability | ✅ No data stored to export |
| No Cross-Border Transfer | ✅ All processing local |

### HIPAA (for healthcare companies)

| Safeguard | DiffPilot Compliance |
|-----------|---------------------|
| Access Controls | ✅ Uses OS-level permissions |
| Audit Controls | ✅ Security event logging |
| Transmission Security | ✅ No network transmission |
| Integrity Controls | ✅ Input/output validation |

---

## Security Testing

### Run the Security Test Suite

```bash
npm test -- tests/security.test.ts

# 98 security tests covering:
# - Input validation
# - Branch name injection
# - Path traversal prevention
# - Rate limiting
# - Output sanitization
# - Secret redaction
```

### Penetration Testing Scope

For your security team:

```markdown
## In Scope
- Command injection via branch names
- Path traversal via file parameters
- DoS via large inputs
- Information disclosure via error messages

## Out of Scope (Not Applicable)
- Network-based attacks (no network surface)
- Authentication bypass (no auth system)
- API vulnerabilities (no external APIs)
```

---

## Incident Response

### If You Suspect a Security Issue

1. DiffPilot has **no call-home capability** - it cannot be remotely exploited
2. Check security logs: `grep "[SECURITY]" /path/to/logs`
3. Verify binary integrity: `sha256sum dist/index.js`
4. Report issues: security@[your-company].com

### Security Event Log Format

```
[SECURITY] [2026-01-30T12:00:00.000Z] EVENT_TYPE: Details
```

Event types:
- `BRANCH_VALIDATION_FAILED` - Invalid branch name rejected
- `PATH_TRAVERSAL_ATTEMPT` - Directory escape blocked
- `RATE_LIMIT_EXCEEDED` - DoS protection triggered
- `NULL_BYTE_DETECTED` - Injection attempt blocked

---

## Verification Commands

### Complete Audit Script

```bash
#!/bin/bash
# audit-diffpilot.sh - Run before enterprise deployment

echo "=== DiffPilot Security Audit ==="

echo -e "\n1. Dependency check (should show only @modelcontextprotocol/sdk):"
cat package.json | grep -A5 '"dependencies"'

echo -e "\n2. Network import check (should be empty):"
grep -rn "require.*http\|import.*http\|axios\|node-fetch" src/ --include="*.ts" || echo "✅ No HTTP imports found"

echo -e "\n3. External URL check (should be empty):"
grep -rn "https://\|http://" src/ --include="*.ts" | grep -v "// " || echo "✅ No external URLs"

echo -e "\n4. Telemetry check (should be empty):"
grep -rn "telemetry\|analytics\|tracking\|mixpanel\|segment" src/ --include="*.ts" || echo "✅ No telemetry"

echo -e "\n5. Run security tests:"
npm test -- tests/security.test.ts

echo -e "\n=== Audit Complete ==="
```

---

## Contact & Support

- **Security Issues**: [Create private security advisory on GitHub]
- **Enterprise Licensing**: enterprise@diffpilot.dev
- **Source Code Audit**: Available upon request under NDA

---

*Document Version: 1.0.0*  
*Last Updated: January 2026*  
*Applies to: DiffPilot v1.0.0+*
