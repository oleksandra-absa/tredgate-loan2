import { test, expect } from '@playwright/test'
import { AppPage } from '../page-objects/AppPage'
import { TEXT, TEST_DATA } from '../texts/textLibrary'
import { calculateMonthlyPayment, generateUniqueApplicantName } from '../helpers/testHelpers'

test.describe('Loan Creation Flow', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.initialize()
  })

  test('should display initial empty state', async () => {
    await app.loanForm.verifyFormHeaderVisible()
    await app.loanList.verifyListHeaderVisible()
    await app.loanList.verifyEmptyState()
    await app.loanSummary.verifyInitialState()
  })

  test('should create a valid loan application successfully', async () => {
    const applicantName = generateUniqueApplicantName('Valid User')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanAndVerifyReset(applicantName, amount, term, rate)

    // Verify loan appears in list with correct details
    await app.loanList.verifyLoanExists(applicantName)
    await app.loanList.verifyLoanStatus(applicantName, TEXT.STATUS_PENDING)
    
    const monthlyPayment = calculateMonthlyPayment(amount, term, rate)
    await app.loanList.verifyLoanDetails(applicantName, amount, term, rate, monthlyPayment)

    // Verify summary is updated
    await app.loanSummary.verifyAfterCreatingLoan()

    // Verify pending action buttons are visible
    await app.loanList.verifyPendingActionButtons(applicantName)
  })

  test('should create multiple loan applications', async () => {
    const loans = [
      { name: generateUniqueApplicantName('User 1'), ...TEST_DATA.VALID_LOAN },
      { name: generateUniqueApplicantName('User 2'), ...TEST_DATA.SMALL_LOAN },
      { name: generateUniqueApplicantName('User 3'), ...TEST_DATA.LARGE_LOAN },
    ]

    // Create all loans
    for (const loan of loans) {
      await app.loanForm.createLoanApplication(loan.name, loan.amount, loan.term, loan.rate)
    }

    // Verify all loans exist
    for (const loan of loans) {
      await app.loanList.verifyLoanExists(loan.name)
    }

    // Verify count
    await app.loanList.verifyLoanCountEquals(loans.length)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 3,
      pending: 3,
      approved: 0,
      rejected: 0,
      totalApprovedAmount: 0,
    })
  })

  test('should persist loans after page reload', async ({ page }) => {
    const applicantName = generateUniqueApplicantName('Persistent User')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.verifyLoanExists(applicantName)

    // Reload page
    await page.reload()

    // Verify loan still exists
    await app.loanList.verifyLoanExists(applicantName)
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 1,
      approved: 0,
      rejected: 0,
      totalApprovedAmount: 0,
    })
  })

  test('should display correct form labels and placeholders', async () => {
    await app.loanForm.verifyFormLabels()
    
    // Verify placeholders
    await expect(
      app.loanForm.applicantNameInput,
      'Applicant name should have placeholder'
    ).toHaveAttribute('placeholder', TEXT.PLACEHOLDER_NAME)
    
    await expect(
      app.loanForm.amountInput,
      'Amount should have placeholder'
    ).toHaveAttribute('placeholder', TEXT.PLACEHOLDER_AMOUNT)
    
    await expect(
      app.loanForm.termMonthsInput,
      'Term should have placeholder'
    ).toHaveAttribute('placeholder', TEXT.PLACEHOLDER_TERM)
    
    await expect(
      app.loanForm.interestRateInput,
      'Interest rate should have placeholder'
    ).toHaveAttribute('placeholder', TEXT.PLACEHOLDER_RATE)
  })

  test('should display table headers correctly', async () => {
    // Create at least one loan to show table
    const applicantName = generateUniqueApplicantName()
    await app.loanForm.createLoanApplication(applicantName, 50000, 36, 0.08)

    // Verify table headers
    await app.loanList.verifyTableHeaders()
  })
})
