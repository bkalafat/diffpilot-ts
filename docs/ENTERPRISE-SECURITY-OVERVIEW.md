# DiffPilot Enterprise Security Overview

## One-Page Security Summary for Procurement Teams

---

### What is DiffPilot?

An AI-powered code review assistant that runs **entirely within your network**. It analyzes Git diffs and helps developers write better commit messages, PR descriptions, and catch issues before code review.

---

### Key Security Guarantees

| Concern | DiffPilot Answer |
|---------|-----------------|
| **"Does it send our code to external servers?"** | ❌ NO. Zero external network calls. All processing is local. |
| **"What services does it connect to?"** | Only your existing Git remote (Azure DevOps, GitHub Enterprise, GitLab). |
| **"Does it have telemetry/analytics?"** | ❌ NO. No tracking, no usage analytics, no call-home. |
| **"Can it work air-gapped?"** | ✅ YES. Fully offline operation supported. |
| **"Does it store our code?"** | ❌ NO. Stateless - processes data in memory only. |
| **"What data does it access?"** | Git diff output only. Never reads raw files. |

---

### Technical Verification

**Dependencies** (total: 1)
```
@modelcontextprotocol/sdk - Official Anthropic MCP protocol only
```

**Network Verification**
```bash
# Confirm no external calls
grep -r "http\|fetch\|axios" src/ --include="*.ts"
# Result: Only pattern detection for analyzing USER code, not actual HTTP calls
```

**Security Tests**
```bash
npm test -- tests/security.test.ts
# 98 security tests passing
```

---

### Compliance Ready

| Standard | Status |
|----------|--------|
| SOC 2 Type II | ✅ Compatible (no external data transfer) |
| GDPR | ✅ Compatible (no data storage/transfer) |
| HIPAA | ✅ Compatible (no PHI exposure risk) |
| FedRAMP | ✅ Compatible (on-premise only) |

---

### Architecture Diagram

```
┌─────────────── YOUR NETWORK ───────────────┐
│                                            │
│  Developer  ──►  VS Code  ──►  DiffPilot   │
│     IDE           + AI         (local)     │
│                                    │       │
│                                    ▼       │
│                            Your Git Remote │
│                         (Azure DevOps/etc) │
│                                            │
└────────────────────────────────────────────┘
         ▲
         │ NOTHING leaves your network
         │ NO external API calls
         │ NO telemetry
         ▼
    ─── INTERNET ─── (not accessed)
```

---

### Security Features Built-In

- **Input Validation**: Prevents command injection, path traversal
- **Secret Redaction**: Auto-masks passwords, API keys, tokens in output
- **Rate Limiting**: DoS protection (120 requests/minute/tool)
- **Audit Logging**: Security events logged locally for review
- **CWE Compliance**: Protects against OWASP/MITRE common weaknesses

---

### Deployment Options

| Option | Description |
|--------|-------------|
| **VS Code Extension** | Install from marketplace or private registry |
| **NPM Package** | `npm install diffpilot` (or from internal registry) |
| **Source Build** | Clone, audit, build yourself |
| **Air-Gapped** | Transfer pre-built package to isolated network |

---

### Frequently Asked Questions

**Q: Can DiffPilot read files outside the repository?**
A: No. It only sees git diff output, never raw file contents.

**Q: What if we use Azure DevOps, not GitHub?**
A: DiffPilot uses standard git CLI. It works with any git remote.

**Q: Do we need to open firewall ports?**
A: No. DiffPilot requires zero network configuration.

**Q: Can we audit the source code?**
A: Yes. MIT licensed, fully open source, available on GitHub.

**Q: What happens to our code review data?**
A: Nothing. Data is processed in-memory and discarded. No persistence.

---

### Verification Checklist for IT Security

- [ ] Review [docs/SECURITY.md](./SECURITY.md) for full technical details
- [ ] Run `npm audit` - confirms no vulnerable dependencies
- [ ] Run security tests: `npm test -- tests/security.test.ts`
- [ ] Grep source for network calls (none found)
- [ ] Verify single dependency: `@modelcontextprotocol/sdk`
- [ ] Test in isolated environment with network monitoring

---

### Contact

**Enterprise Inquiries**: enterprise@diffpilot.dev  
**Security Questions**: security@diffpilot.dev  
**Source Code**: https://github.com/AzureBurak/DiffPilot

---

*This document is intended for enterprise security review. See SECURITY.md for complete technical documentation.*
