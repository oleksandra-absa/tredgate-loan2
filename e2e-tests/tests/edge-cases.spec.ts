import { test } from '@playwright/test'
import { AppPage } from '../page-objects/AppPage'
import { generateUniqueApplicantName, calculateMonthlyPayment } from '../helpers/testHelpers'

test.describe('Edge Cases and Boundary Conditions', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.initialize()
  })

  test('should handle minimum valid values', async () => {
    const applicantName = generateUniqueApplicantName('Min Values')
    const amount = 1
    const term = 1
    const rate = 0

    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.verifyLoanExists(applicantName)

    const monthlyPayment = calculateMonthlyPayment(amount, term, rate)
    await app.loanList.verifyLoanDetails(applicantName, amount, term, rate, monthlyPayment)
  })

  test('should handle maximum reasonable values', async () => {
    const applicantName = generateUniqueApplicantName('Max Values')
    const amount = 10000000
    const term = 360
    const rate = 0.30

    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.verifyLoanExists(applicantName)
  })

  test('should handle auto-decision boundary - exactly at approval limit', async () => {
    const applicantName = generateUniqueApplicantName('Exact Boundary')
    const amount = 100000
    const term = 60
    const rate = 0.08

    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.autoDecideLoan(applicantName, 'approved')
  })

  test('should handle auto-decision boundary - one dollar over limit', async () => {
    const applicantName = generateUniqueApplicantName('Over Amount')
    const amount = 100001
    const term = 60
    const rate = 0.08

    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.autoDecideLoan(applicantName, 'rejected')
  })

  test('should handle auto-decision boundary - one month over limit', async () => {
    const applicantName = generateUniqueApplicantName('Over Term')
    const amount = 100000
    const term = 61
    const rate = 0.08

    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.autoDecideLoan(applicantName, 'rejected')
  })

  test('should handle auto-decision boundary - one dollar under limit', async () => {
    const applicantName = generateUniqueApplicantName('Under Amount')
    const amount = 99999
    const term = 60
    const rate = 0.08

    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.autoDecideLoan(applicantName, 'approved')
  })

  test('should handle auto-decision boundary - one month under limit', async () => {
    const applicantName = generateUniqueApplicantName('Under Term')
    const amount = 100000
    const term = 59
    const rate = 0.08

    await app.loanForm.createLoanApplication(applicantName, amount, term, rate)
    await app.loanList.autoDecideLoan(applicantName, 'approved')
  })

  test('should handle very long applicant names', async () => {
    const longName = 'A'.repeat(100) + ' ' + generateUniqueApplicantName()
    
    await app.loanForm.createLoanApplication(longName, 50000, 36, 0.08)
    await app.loanList.verifyLoanExists(longName)
  })

  test('should handle special characters in applicant names', async () => {
    const specialName = `John O'Brien-Smith ${generateUniqueApplicantName()}`
    
    await app.loanForm.createLoanApplication(specialName, 50000, 36, 0.08)
    await app.loanList.verifyLoanExists(specialName)
  })

  test('should handle Unicode characters in applicant names', async () => {
    const unicodeName = `José García ${generateUniqueApplicantName()}`
    
    await app.loanForm.createLoanApplication(unicodeName, 50000, 36, 0.08)
    await app.loanList.verifyLoanExists(unicodeName)
  })

  test('should handle rapid successive loan creation', async () => {
    const loans = Array.from({ length: 5 }, (_, i) => ({
      name: generateUniqueApplicantName(`Rapid ${i}`),
      amount: (i + 1) * 10000,
      term: (i + 1) * 12,
      rate: (i + 1) * 0.02,
    }))

    // Create all loans rapidly
    for (const loan of loans) {
      await app.loanForm.fillApplicantName(loan.name)
      await app.loanForm.fillAmount(loan.amount)
      await app.loanForm.fillTermMonths(loan.term)
      await app.loanForm.fillInterestRate(loan.rate)
      await app.loanForm.clickSubmit()
    }

    // Verify all exist
    await app.loanList.verifyLoanCountEquals(loans.length)
    for (const loan of loans) {
      await app.loanList.verifyLoanExists(loan.name)
    }
  })

  test('should handle switching between approve and reject', async () => {
    const applicantName = generateUniqueApplicantName('Status Switch')
    
    await app.loanForm.createLoanApplication(applicantName, 50000, 36, 0.08)
    
    // Approve
    await app.loanList.approveLoan(applicantName)
    
    // Note: Cannot change status once set (no buttons shown)
    await app.loanList.verifyNonPendingActionButtons(applicantName)
  })

  test('should maintain data integrity with mixed operations', async () => {
    // Create multiple loans
    const loan1 = { name: generateUniqueApplicantName('Mixed 1'), amount: 50000, term: 36, rate: 0.08 }
    const loan2 = { name: generateUniqueApplicantName('Mixed 2'), amount: 75000, term: 48, rate: 0.09 }
    const loan3 = { name: generateUniqueApplicantName('Mixed 3'), amount: 30000, term: 24, rate: 0.07 }

    await app.loanForm.createLoanApplication(loan1.name, loan1.amount, loan1.term, loan1.rate)
    await app.loanForm.createLoanApplication(loan2.name, loan2.amount, loan2.term, loan2.rate)
    await app.loanForm.createLoanApplication(loan3.name, loan3.amount, loan3.term, loan3.rate)

    // Approve first, reject second, keep third pending
    await app.loanList.approveLoan(loan1.name)
    await app.loanList.rejectLoan(loan2.name)

    // Verify summary
    await app.loanSummary.verifySummaryStats({
      total: 3,
      pending: 1,
      approved: 1,
      rejected: 1,
      totalApprovedAmount: loan1.amount,
    })

    // Delete rejected loan
    await app.loanList.deleteLoan(loan2.name)

    // Verify updated summary
    await app.loanSummary.verifySummaryStats({
      total: 2,
      pending: 1,
      approved: 1,
      rejected: 0,
      totalApprovedAmount: loan1.amount,
    })
  })
})
