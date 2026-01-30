---
applyTo: "**/security/**/*.ts,**/security-helpers.ts"
---
# Security Implementation Standards

## Input Validation (CWE-20)
- Validate all user inputs before processing
- Use allowlists over denylists
- Reject invalid input early with clear error messages

## Path Traversal Prevention (CWE-22)
- Validate working directories before operations
- Reject paths containing `..` or absolute paths outside workspace
- Normalize paths before validation

## OS Command Injection Prevention (CWE-78)
- Never pass user input directly to shell commands
- Use parameterized arguments with `runGitCommand()`
- Validate and sanitize all command arguments

## Null Byte Injection Prevention (CWE-158)
- Reject inputs containing null bytes (`\x00`)
- Validate string inputs for unexpected terminators

## Information Disclosure Prevention (CWE-200)
- Use `sanitizeOutput()` for all user-facing responses
- Never expose internal paths, system info, or stack traces
- Sanitize error messages before returning

## DoS Prevention (CWE-400)
- Implement rate limiting on all tools
- Set maximum input length limits
- Timeout long-running operations

## Log Injection Prevention (CWE-532)
- Use `sanitizeForLog()` for all log messages
- Never log sensitive data (secrets, credentials, tokens)
- Log security events with `logSecurityEvent()`

## Secure Patterns
```typescript
// Always validate before use
if (!isValidBranchName(branch)) {
  return error('Invalid branch name');
}

// Sanitize outputs
return success(sanitizeOutput(result));

// Log security events
logSecurityEvent('rate-limit-exceeded', { tool, timestamp });
```
