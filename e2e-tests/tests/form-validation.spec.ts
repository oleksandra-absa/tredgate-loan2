import { test } from '@playwright/test'
import { AppPage } from '../page-objects/AppPage'
import { TEXT } from '../texts/textLibrary'
import { generateUniqueApplicantName } from '../helpers/testHelpers'

test.describe('Form Validation', () => {
  let app: AppPage

  test.beforeEach(async ({ page }) => {
    app = new AppPage(page)
    await app.initialize()
  })

  test('should show error when applicant name is only spaces', async () => {
    await app.loanForm.fillPartialForm({
      applicantName: '   ',
      amount: 50000,
      termMonths: 36,
      interestRate: 0.08,
    })
    
    await app.loanForm.clickSubmit()
    await app.loanForm.verifyErrorMessage(TEXT.ERROR_NAME_REQUIRED)
  })

  test('should accept zero interest rate', async () => {
    const applicantName = generateUniqueApplicantName('Zero Rate User')
    
    await app.loanForm.createLoanApplication(applicantName, 50000, 36, 0)
    await app.loanList.verifyLoanExists(applicantName)
    await app.loanForm.verifyNoError()
  })

  test('should clear error message on successful submission', async () => {
    // First submit with error (name with only spaces)
    await app.loanForm.fillPartialForm({
      applicantName: '   ',
      amount: 50000,
      termMonths: 36,
      interestRate: 0.08,
    })
    await app.loanForm.clickSubmit()
    await app.loanForm.verifyErrorMessage(TEXT.ERROR_NAME_REQUIRED)

    // Now fill proper name and submit successfully
    const applicantName = generateUniqueApplicantName()
    await app.loanForm.fillApplicantName(applicantName)
    await app.loanForm.clickSubmit()
    
    // Error should be gone
    await app.loanForm.verifyNoError()
    await app.loanList.verifyLoanExists(applicantName)
  })

  test('should handle very large loan amounts', async () => {
    const applicantName = generateUniqueApplicantName('Large Amount User')
    const largeAmount = 999999999
    
    await app.loanForm.createLoanApplication(applicantName, largeAmount, 360, 0.10)
    await app.loanList.verifyLoanExists(applicantName)
  })

  test('should handle very long term periods', async () => {
    const applicantName = generateUniqueApplicantName('Long Term User')
    const longTerm = 999
    
    await app.loanForm.createLoanApplication(applicantName, 50000, longTerm, 0.08)
    await app.loanList.verifyLoanExists(applicantName)
  })

  test('should handle very high interest rates', async () => {
    const applicantName = generateUniqueApplicantName('High Rate User')
    const highRate = 0.99
    
    await app.loanForm.createLoanApplication(applicantName, 50000, 36, highRate)
    await app.loanList.verifyLoanExists(applicantName)
  })

  test('should trim whitespace from applicant name', async () => {
    const baseName = generateUniqueApplicantName()
    const nameWithSpaces = `  ${baseName}  `
    
    await app.loanForm.createLoanApplication(nameWithSpaces, 50000, 36, 0.08)
    
    // Should appear without leading/trailing spaces
    await app.loanList.verifyLoanExists(baseName)
  })
})
