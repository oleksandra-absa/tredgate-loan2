# Playwright E2E Tests

Comprehensive end-to-end test suite for the Tredgate Loan application built with Playwright and following industry best practices.

## Test Architecture

### Page Object Model (POM)
Tests use the Page Object Model design pattern with:
- **Atomic methods**: Low-level actions (click, fill, verify single elements)
- **Grouped action methods**: Higher-level workflows using `test.step()` for better reporting
- **Clear separation**: Page objects contain all locators and assertions, tests contain test logic

### Directory Structure

```
e2e-tests/
├── page-objects/          # Page Object classes
│   ├── BasePage.ts       # Common page functionality
│   ├── AppPage.ts        # Main app page object
│   ├── LoanFormPage.ts   # Loan creation form
│   ├── LoanListPage.ts   # Loan applications table
│   └── LoanSummaryPage.ts # Summary statistics
├── helpers/              # Utility functions
│   └── testHelpers.ts    # Formatting, calculations, storage utils
├── texts/                # Text constants library
│   └── textLibrary.ts    # All UI text and test data
└── tests/                # Test specifications
    ├── loan-creation.spec.ts
    ├── form-validation.spec.ts
    ├── loan-status.spec.ts
    ├── loan-deletion.spec.ts
    └── edge-cases.spec.ts
```

## Test Principles

### 1. Deterministic and Isolated
- Each test generates unique data using timestamps
- Tests clean up after themselves
- No test dependencies - all can run independently

### 2. Readable and Maintainable
- Custom error messages on all assertions
- Clear test names describing what is being tested
- Test steps for complex workflows

### 3. Reusable Components
- Page objects shared across tests
- Helper functions for common operations
- Text library prevents hardcoding

### 4. Stable Locators
- Prefer ID selectors: `#applicantName`, `#amount`
- Use title attributes for buttons: `button[title="Approve"]`
- Notes in code where better selectors would help (e.g., data-testid)

## Running Tests

### All Tests
```bash
npm run test:e2e
```

### Interactive Mode (UI)
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Headed Mode (Watch Browser)
```bash
npm run test:e2e:headed
```

### Specific Test File
```bash
npx playwright test loan-creation.spec.ts
```

### Specific Test
```bash
npx playwright test -g "should create a valid loan"
```

## Test Coverage

### Loan Creation (6 tests)
- ✅ Initial empty state
- ✅ Valid loan creation
- ✅ Multiple loan creation
- ✅ Data persistence across page reloads
- ✅ Form labels and placeholders
- ✅ Table headers display

### Form Validation (7 tests)
- ✅ Empty name with spaces validation
- ✅ Zero interest rate acceptance
- ✅ Error message clearing
- ✅ Very large amounts
- ✅ Very long terms
- ✅ High interest rates
- ✅ Whitespace trimming

### Loan Status Management (10 tests)
- ✅ Manual approval
- ✅ Manual rejection
- ✅ Auto-approval within limits
- ✅ Auto-rejection exceeding amount limit
- ✅ Auto-rejection exceeding term limit
- ✅ Boundary condition at exact limits
- ✅ Multiple loans with mixed statuses
- ✅ Status persistence across reloads
- ✅ Total approved amount calculation
- ✅ Action button visibility by status

### Loan Deletion (8 tests)
- ✅ Delete pending loan
- ✅ Delete approved loan
- ✅ Delete rejected loan
- ✅ Delete from multiple loans
- ✅ Summary update on deletion
- ✅ Dialog cancellation
- ✅ Deletion persistence
- ✅ Delete all loans sequentially

### Edge Cases & Boundaries (12 tests)
- ✅ Minimum valid values
- ✅ Maximum reasonable values
- ✅ Exact boundary at approval limit ($100k, 60 months)
- ✅ One dollar/month over limit
- ✅ One dollar/month under limit
- ✅ Very long applicant names
- ✅ Special characters in names
- ✅ Unicode characters
- ✅ Rapid successive creation
- ✅ Status change workflow
- ✅ Mixed operations data integrity

## Test Data

Test data is centralized in `texts/textLibrary.ts`:
- `TEXT`: All UI labels, messages, and text constants
- `TEST_DATA`: Predefined loan scenarios for testing

Examples:
- `TEST_DATA.VALID_LOAN`: Standard valid loan ($50k, 36 months, 8%)
- `TEST_DATA.BOUNDARY_APPROVED`: At approval boundary ($100k, 60 months)
- `TEST_DATA.LARGE_LOAN`: Exceeds auto-approval limits

## Business Logic Tested

### Auto-Decision Rules
- ✅ Approved if amount ≤ $100,000 AND term ≤ 60 months
- ✅ Rejected otherwise
- ✅ All boundary conditions verified

### Monthly Payment Calculation
- ✅ Formula: total = amount × (1 + rate), monthly = total / term
- ✅ Displayed correctly in table

### Summary Statistics
- ✅ Total applications count
- ✅ Pending, approved, rejected counts
- ✅ Total approved amount
- ✅ Updates on all CRUD operations

## Locator Strategy

### Current Approach
- ✅ **Best**: HTML form IDs (`#applicantName`, `#amount`)
- ✅ **Good**: Button titles (`button[title="Approve"]`)
- ⚠️ **Acceptable**: Text content matching (noted as unstable)
- 📝 **Future**: Add `data-testid` attributes for more stable selectors

### Known Unstable Locators
Documented in code comments where improvements would help:
- Loan rows identified by applicant name (could have duplicates)
- Status badges by text content

## Assertions

All assertions include custom error messages for better debugging:
```typescript
await expect(
  this.errorMessage,
  `Error message should display: "${expectedMessage}"`
).toContainText(expectedMessage)
```

## Debugging Failed Tests

### View Test Report
```bash
npx playwright show-report
```

### View Trace
```bash
npx playwright show-trace test-results/[test-path]/trace.zip
```

### Screenshots
Failed tests automatically capture screenshots in `test-results/`

### Videos
Failed tests record videos in `test-results/` (when retried)

## Best Practices Followed

1. ✅ **Test isolation**: Each test is independent
2. ✅ **No magic strings**: All text in text library
3. ✅ **Descriptive names**: Test names explain what is tested
4. ✅ **Custom assertions**: All expects have meaningful messages
5. ✅ **Page Object Model**: Clear separation of concerns
6. ✅ **Atomic and grouped methods**: Flexibility in test writing
7. ✅ **Test steps**: Better reporting for complex workflows
8. ✅ **Unique test data**: Timestamp-based to avoid conflicts
9. ✅ **Edge case coverage**: Boundaries, extremes, special inputs
10. ✅ **Documentation**: Comments explain non-obvious choices

## Configuration

See `playwright.config.ts` for:
- Browser configuration (currently Chromium only)
- Timeout settings
- Retry strategy (2 retries on CI)
- Report generation (HTML + list)
- Auto-start dev server before tests
- Screenshot/video capture settings

## Continuous Integration

Tests are configured for CI with:
- `forbidOnly`: Prevents accidentally committed `.only()`
- Automatic retries on failure
- Dev server auto-start
- Artifact collection (screenshots, videos, traces)
