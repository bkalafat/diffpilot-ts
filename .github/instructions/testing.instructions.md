---
applyTo: "**/tests/**/*.ts,**/*.test.ts"
---
# Testing Standards for DiffPilot

## Test Framework
- Use Vitest for all tests
- Import from 'vitest': `describe`, `it`, `expect`, `vi`, `beforeEach`, `afterEach`

## Test File Naming
- Test files must end with `.test.ts`
- Match source file names: `pr-review.ts` → `pr-review.test.ts`

## Test Structure
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('functionName', () => {
  beforeEach(() => {
    // Reset mocks and state
    vi.resetAllMocks();
  });

  it('should handle valid input correctly', () => {
    // Arrange
    const input = 'valid-input';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });

  it('should handle edge cases', () => {
    // Test edge cases
  });

  it('should handle errors gracefully', () => {
    // Test error scenarios
  });
});
```

## Mocking
- Mock external dependencies (git commands, file system)
- Use `vi.mock()` for module mocking
- Use `vi.spyOn()` for partial mocking
- Reset mocks in `beforeEach` to prevent test pollution

## Coverage Requirements
- Test happy path scenarios
- Test error handling paths
- Test edge cases (empty inputs, special characters)
- Test security-related validation

## Async Testing
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});
```

## Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```
