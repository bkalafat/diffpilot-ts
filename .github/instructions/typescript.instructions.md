---
applyTo: "**/*.ts"
---
# TypeScript Coding Standards for DiffPilot

## Module System
- Use ES modules with `.js` extensions in imports
- Use `type` imports for type-only imports: `import type { Tool } from '...'`
- Prefer `interface` for object shapes, `type` for unions and function types

## Async/Await
- All async functions must return `Promise<T>`
- Use try/catch for error handling in async operations
- Never use `.then()` chains when async/await is available

## Type Safety
- Enable `strict: true` in tsconfig
- Avoid `any` type - use `unknown` and type guards instead
- All public functions must have explicit return types
- Use const assertions for literal types

## Error Handling
- Use `ToolResult` type from `src/tools/types.ts` for tool returns
- Use helper functions: `success()`, `error()`, `gitError()`
- Sanitize error messages before returning to users

## Function Documentation
- Use JSDoc comments for all public functions
- Include `@param` and `@returns` annotations
- Document security considerations where applicable

## Git Operations
- All git commands go through `git-service.ts`
- Use `runGitCommand()` for executing git commands
- Validate branch names with `isValidBranchName()` before use
- Use `findBaseBranch()` for auto-detecting main/master/develop

## Security Requirements
- Validate all input parameters
- Use `sanitizeOutput()` for responses containing user data
- Use `sanitizeErrorMessage()` before returning errors
- Log security events with `logSecurityEvent()`
- Check rate limits for new tools
