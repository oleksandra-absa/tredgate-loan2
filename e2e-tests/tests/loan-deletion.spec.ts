import { test } from '@playwright/test'
import { AppPage } from '../page-objects/AppPage'
import { TEXT, TEST_DATA } from '../texts/textLibrary'
import { generateUniqueApplicantName } from '../helpers/testHelpers'

test.describe('Loan Deletion', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.initialize()
  })

  test('should delete a pending loan', async () => {
    const applicantName = generateUniqueApplicantName('Delete Pending')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.verifyLoanExists(applicantName)

    // Delete loan
    await app.loanList.deleteLoan(applicantName)

    // Verify empty state
    await app.loanList.verifyEmptyState()
    await app.loanSummary.verifyInitialState()
  })

  test('should delete an approved loan', async () => {
    const applicantName = generateUniqueApplicantName('Delete Approved')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create and approve loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.approveLoan(applicantName)

    // Delete loan
    await app.loanList.deleteLoan(applicantName)

    // Verify empty state
    await app.loanList.verifyEmptyState()
    await app.loanSummary.verifyInitialState()
  })

  test('should delete a rejected loan', async () => {
    const applicantName = generateUniqueApplicantName('Delete Rejected')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create and reject loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.rejectLoan(applicantName)

    // Delete loan
    await app.loanList.deleteLoan(applicantName)

    // Verify empty state
    await app.loanList.verifyEmptyState()
    await app.loanSummary.verifyInitialState()
  })

  test('should delete one loan from multiple loans', async () => {
    const loans = [
      { name: generateUniqueApplicantName('Keep 1'), ...TEST_DATA.VALID_LOAN },
      { name: generateUniqueApplicantName('Delete This'), ...TEST_DATA.SMALL_LOAN },
      { name: generateUniqueApplicantName('Keep 2'), ...TEST_DATA.LARGE_LOAN },
    ]

    // Create all loans
    for (const loan of loans) {
      await app.loanForm.createLoanApplication(loan.name, loan.amount, loan.term, loan.rate)
    }

    // Delete middle loan
    await app.loanList.deleteLoan(loans[1].name)

    // Verify remaining loans exist
    await app.loanList.verifyLoanExists(loans[0].name)
    await app.loanList.verifyLoanExists(loans[2].name)
    await app.loanList.verifyLoanNotExists(loans[1].name)

    // Verify count
    await app.loanList.verifyLoanCountEquals(2)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 2,
      pending: 2,
      approved: 0,
      rejected: 0,
      totalApprovedAmount: 0,
    })
  })

  test('should update summary when deleting approved loan', async () => {
    const loan1 = { name: generateUniqueApplicantName('Approved 1'), amount: 50000, term: 36, rate: 0.08 }
    const loan2 = { name: generateUniqueApplicantName('Approved 2'), amount: 75000, term: 48, rate: 0.09 }

    // Create and approve both loans
    await app.loanForm.createLoanApplication(loan1.name, loan1.amount, loan1.term, loan1.rate)
    await app.loanForm.createLoanApplication(loan2.name, loan2.amount, loan2.term, loan2.rate)
    await app.loanList.approveLoan(loan1.name)
    await app.loanList.approveLoan(loan2.name)

    // Verify initial summary
    await app.loanSummary.verifySummaryStats({
      total: 2,
      pending: 0,
      approved: 2,
      rejected: 0,
      totalApprovedAmount: loan1.amount + loan2.amount,
    })

    // Delete first loan
    await app.loanList.deleteLoan(loan1.name)

    // Verify updated summary
    await app.loanSummary.verifySummaryStats({
      total: 1,
      pending: 0,
      approved: 1,
      rejected: 0,
      totalApprovedAmount: loan2.amount,
    })
  })

  test('should cancel deletion when dialog is dismissed', async ({ page }) => {
    const applicantName = generateUniqueApplicantName('Cancel Delete')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)

    // Set up dialog handler to dismiss
    page.once('dialog', async dialog => {
      await dialog.dismiss()
    })

    // Click delete button
    await app.loanList.clickDelete(applicantName)

    // Verify loan still exists
    await app.loanList.verifyLoanExists(applicantName)
    await app.loanList.verifyLoanCountEquals(1)
  })

  test('should persist deletion after page reload', async ({ page }) => {
    const applicantName = generateUniqueApplicantName('Persist Delete')
    const { amount, term, rate } = TEST_DATA.VALID_LOAN

    // Create loan
    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.verifyLoanExists(applicantName)

    // Delete loan
    await app.loanList.deleteLoan(applicantName)

    // Reload page
    await page.reload()

    // Verify loan is still deleted
    await app.loanList.verifyEmptyState()
  })

  test('should delete all loans one by one', async () => {
    const loans = [
      { name: generateUniqueApplicantName('User 1'), ...TEST_DATA.VALID_LOAN },
      { name: generateUniqueApplicantName('User 2'), ...TEST_DATA.SMALL_LOAN },
      { name: generateUniqueApplicantName('User 3'), ...TEST_DATA.LARGE_LOAN },
    ]

    // Create all loans
    for (const loan of loans) {
      await app.loanForm.createLoanApplication(loan.name, loan.amount, loan.term, loan.rate)
    }

    // Delete all loans
    for (let i = 0; i < loans.length; i++) {
      await app.loanList.deleteLoan(loans[i].name)
      await app.loanList.verifyLoanCountEquals(loans.length - i - 1)
    }

    // Verify empty state
    await app.loanList.verifyEmptyState()
    await app.loanSummary.verifyInitialState()
  })
})
