# Testing Guide

## Overview

This document describes the testing setup and practices for the Tredgate Loan application. The project uses **Vitest** as the testing framework with comprehensive unit tests for all components and services.

## Test Coverage

- **All service functions**: Complete coverage of `loanService.ts`
- **All Vue components**: LoanForm, LoanList, LoanSummary, and App
- **Overall coverage**: 99%+ across statements, branches, and functions

## Running Tests

### Run all tests once
```bash
npm test
```

### Run tests in watch mode (continuous testing during development)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

This generates:
- Terminal coverage summary
- HTML coverage report in `coverage/` directory
- JSON coverage summary for CI/CD integration

### Open interactive test UI
```bash
npm run test:ui
```

Opens a browser-based UI at `http://localhost:51204` for exploring tests and results.

## Test Structure

```
tests/
├── loanService.test.ts  # Business logic tests
├── LoanForm.test.ts     # Form component tests
├── LoanList.test.ts     # List component tests
├── LoanSummary.test.ts  # Summary component tests
└── App.test.ts          # Main app integration tests
```

## Test Descriptions

### loanService.test.ts (19 tests)

Tests all business logic functions:

- **getLoans**: Loading loans from localStorage, handling empty state
- **saveLoans**: Persisting loans to localStorage
- **createLoanApplication**: Creating loans with validation
  - Validates applicant name (required, non-empty)
  - Validates amount (must be > 0)
  - Validates term months (must be > 0)
  - Validates interest rate (cannot be negative)
- **updateLoanStatus**: Changing loan status, error handling
- **calculateMonthlyPayment**: Payment calculation logic
- **autoDecideLoan**: Auto-approval/rejection rules
  - Approves if amount ≤ $100,000 AND term ≤ 60 months
  - Rejects otherwise

### LoanForm.test.ts (10 tests)

Tests the loan application form component:

- Renders all form fields correctly
- Validates user input (name, amount, term, interest rate)
- Shows appropriate error messages for invalid input
- Creates loan applications with valid data
- Resets form after successful submission
- Emits events to parent component
- Trims whitespace from applicant names
- Handles service errors gracefully

### LoanList.test.ts (20 tests)

Tests the loan listing table component:

- Displays empty state when no loans exist
- Renders table with all loan data
- Formats currency, percentages, and dates correctly
- Calculates and displays monthly payments
- Shows status badges with appropriate styling
- Displays action buttons only for pending loans
- Emits approve/reject/auto-decide events
- Handles multiple loans with different statuses

### LoanSummary.test.ts (12 tests)

Tests the statistics summary component:

- Displays total application count
- Shows counts by status (pending, approved, rejected)
- Calculates total approved loan amount
- Formats large currency amounts correctly
- Handles empty state (zero values)
- Updates reactively when loan data changes
- Applies correct CSS classes for status colors

### App.test.ts (14 tests)

Tests the main application component:

- Renders header, logo, and all child components
- Loads loans on component mount
- Passes loan data to child components
- Refreshes loans when new application is created
- Handles approve/reject/auto-decide actions
- Updates UI after status changes
- Integrates all components correctly

## Test Patterns

### Mocking

Tests use Vitest's `vi.mock()` with partial mocking to:
- Isolate components from external dependencies
- Mock localStorage for service tests
- Mock service functions for component tests
- Preserve original implementations where needed

Example:
```typescript
vi.mock('../src/services/loanService', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    createLoanApplication: vi.fn()
  }
})
```

### Component Testing

Vue components are tested using `@vue/test-utils`:
- Mount components with props
- Simulate user interactions (clicks, form inputs)
- Verify emitted events
- Check rendered output
- Validate reactive updates

### Isolation

- Each test is independent
- Mocks are cleared before each test
- localStorage state is reset between tests
- No test depends on another test's state

## HTML Reports

### Test Results Report

After running tests, an HTML report is generated in the `html/` directory showing:
- Test execution summary
- Pass/fail status for each test
- Execution time
- Detailed test results

View it with:
```bash
npx vite preview --outDir html
```

### Coverage Report

After running `npm run test:coverage`, a coverage report is generated in `coverage/` directory showing:
- Line coverage
- Branch coverage
- Function coverage
- Uncovered lines

View it by opening `coverage/index.html` in a browser.

## Continuous Integration

Tests run automatically on:
- Every push to main branch
- Every pull request to main branch

The CI workflow:
1. Installs dependencies
2. Runs linter
3. Runs all tests with coverage
4. Generates HTML reports
5. Uploads reports as artifacts
6. Displays summary in workflow output

## Best Practices

1. **Write tests first** when adding new features (TDD)
2. **Keep tests focused** - one concept per test
3. **Use descriptive test names** that explain what is being tested
4. **Mock external dependencies** to isolate units under test
5. **Test edge cases** - empty data, invalid input, error conditions
6. **Maintain high coverage** - aim for >95% coverage
7. **Review coverage reports** to identify untested code paths
8. **Run tests before committing** to catch issues early

## Troubleshooting

### Tests fail with "localStorage is not defined"
- This is handled automatically by the localStorage mock in `loanService.test.ts`
- Ensure the mock is properly configured before each test

### Component tests fail to find elements
- Use `await wrapper.vm.$nextTick()` to wait for DOM updates
- Check that you're using the correct selectors (class, id, component)

### Coverage is lower than expected
- Run `npm run test:coverage` to see detailed coverage report
- Check `coverage/index.html` to identify uncovered lines
- Add tests for missing scenarios

## Contributing

When adding new features:
1. Write tests for new functionality
2. Ensure all tests pass (`npm test`)
3. Maintain or improve coverage (`npm run test:coverage`)
4. Update this documentation if adding new test patterns
