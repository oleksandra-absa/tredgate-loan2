import { test } from '@playwright/test'
import { AppPage } from '../page-objects/AppPage'
import { TEXT, TEST_DATA } from '../texts/textLibrary'
import { generateUniqueApplicantName } from '../helpers/testHelpers'

test.describe('Loan Status Management', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.initialize()
  })

  test('should approve a pending loan manually', async () => {
    const applicantName = generateUniqueApplicantName('Approval Test')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.verifyLoanStatus(applicantName, TEXT.STATUS_PENDING)

    // Approve loan
    await app.loanList.approveLoan(applicantName)

    // Verify action buttons are hidden for approved loan
    await app.loanList.verifyNonPendingActionButtons(applicantName)

    // Verify summary updated
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
      totalApprovedAmount: amount,
    })
  })

  test('should reject a pending loan manually', async () => {
    const applicantName = generateUniqueApplicantName('Rejection Test')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.verifyLoanStatus(applicantName, TEXT.STATUS_PENDING)

    // Reject loan
    await app.loanList.rejectLoan(applicantName)

    // Verify action buttons are hidden for rejected loan
    await app.loanList.verifyNonPendingActionButtons(applicantName)

    // Verify summary updated
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 0,
      rejected: 1,
      totalApprovedAmount: 0,
    })
  })

  test('should auto-approve loan within limits', async () => {
    const applicantName = generateUniqueApplicantName('Auto Approve')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)

    // Auto-decide (should approve)
    await app.loanList.autoDecideLoan(applicantName, TEXT.STATUS_APPROVED)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
      totalApprovedAmount: amount,
    })
  })

  test('should auto-reject loan exceeding amount limit', async () => {
    const applicantName = generateUniqueApplicantName('Auto Reject Amount')
    const { amount, term, rate } = TEST_DATA.BOUNDARY_REJECTED_AMOUNT

    // Create loan with amount > $100,000
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)

    // Auto-decide (should reject)
    await app.loanList.autoDecideLoan(applicantName, TEXT.STATUS_REJECTED)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 0,
      rejected: 1,
      totalApprovedAmount: 0,
    })
  })

  test('should auto-reject loan exceeding term limit', async () => {
    const applicantName = generateUniqueApplicantName('Auto Reject Term')
    const { amount, term, rate } = TEST_DATA.BOUNDARY_REJECTED_TERM

    // Create loan with term > 60 months
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)

    // Auto-decide (should reject)
    await app.loanList.autoDecideLoan(applicantName, TEXT.STATUS_REJECTED)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 0,
      rejected: 1,
      totalApprovedAmount: 0,
    })
  })

  test('should auto-approve loan at exact boundary limits', async () => {
    const applicantName = generateUniqueApplicantName('Boundary Approve')
    const { amount, term, rate } = TEST_DATA.BOUNDARY_APPROVED

    // Create loan at exactly $100,000 and 60 months
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)

    // Auto-decide (should approve at boundary)
    await app.loanList.autoDecideLoan(applicantName, TEXT.STATUS_APPROVED)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
      totalApprovedAmount: amount,
    })
  })

  test('should handle multiple loans with different statuses', async () => {
    const loan1 = { name: generateUniqueApplicantName('Pending'), ...TEST_DATA.VALID_LOAN }
    const loan2 = { name: generateUniqueApplicantName('Approved'), ...TEST_DATA.SMALL_LOAN }
    const loan3 = { name: generateUniqueApplicantName('Rejected'), ...TEST_DATA.LARGE_LOAN }

    // Create loans
    await app.loanForm.createLoanApplication(loan1.name, loan1.amount, loan1.term, loan1.rate)
    await app.loanForm.createLoanApplication(loan2.name, loan2.amount, loan2.term, loan2.rate)
    await app.loanForm.createLoanApplication(loan3.name, loan3.amount, loan3.term, loan3.rate)

    // Change statuses
    await app.loanList.approveLoan(loan2.name)
    await app.loanList.rejectLoan(loan3.name)

    // Verify all loans have correct status
    await app.loanList.verifyLoanStatus(loan1.name, TEXT.STATUS_PENDING)
    await app.loanList.verifyLoanStatus(loan2.name, TEXT.STATUS_APPROVED)
    await app.loanList.verifyLoanStatus(loan3.name, TEXT.STATUS_REJECTED)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 3,
      pending: 1,
      approved: 1,
      rejected: 1,
      totalApprovedAmount: loan2.amount,
    })
  })

  test('should persist loan status after page reload', async ({ page }) => {
    const applicantName = generateUniqueApplicantName('Status Persist')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create and approve loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.approveLoan(applicantName)

    // Reload page
    await page.reload()

    // Verify status persists
    await app.loanList.verifyLoanStatus(applicantName, TEXT.STATUS_APPROVED)
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
      totalApprovedAmount: amount,
    })
  })

  test('should calculate total approved amount correctly with multiple approvals', async () => {
    const loans = [
      { name: generateUniqueApplicantName('Approved 1'), amount: 50000, term: 36, rate: 0.08 },
      { name: generateUniqueApplicantName('Approved 2'), amount: 75000, term: 48, rate: 0.09 },
      { name: generateUniqueApplicantName('Approved 3'), amount: 30000, term: 24, rate: 0.07 },
    ]

    // Create and approve all loans
    for (const loan of loans) {
      await app.loanForm.createLoanApplication(loan.name, loan.amount, loan.term, loan.rate)
      await app.loanList.approveLoan(loan.name)
    }

    // Calculate total
    const totalApproved = loans.reduce((sum, loan) => sum + loan.amount, 0)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 3,
      pending: 0,
      approved: 3,
      rejected: 0,
      totalApprovedAmount: totalApproved,
    })
  })
})
