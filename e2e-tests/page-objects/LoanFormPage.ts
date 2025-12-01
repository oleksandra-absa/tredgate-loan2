import { Page, Locator, expect, test } from '@playwright/test'
import { BasePage } from './BasePage'
import { TEXT } from '../texts/textLibrary'

/**
 * Page Object for Loan Form component
 * Handles all interactions with the loan application form
 */
export class LoanFormPage extends BasePage {
  // Atomic locators
  readonly formContainer: Locator
  readonly applicantNameInput: Locator
  readonly amountInput: Locator
  readonly termMonthsInput: Locator
  readonly interestRateInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    
    // Initialize locators - using ID selectors for form inputs
    this.formContainer = this.page.locator('.loan-form')
    this.applicantNameInput = this.page.locator('#applicantName')
    this.amountInput = this.page.locator('#amount')
    this.termMonthsInput = this.page.locator('#termMonths')
    this.interestRateInput = this.page.locator('#interestRate')
    this.submitButton = this.page.locator('button[type="submit"]')
    this.errorMessage = this.page.locator('.error-message')
  }

  // ==================== ATOMIC METHODS ====================
  
  /**
   * Fill applicant name field
   */
  async fillApplicantName(name: string): Promise<void> {
    await this.applicantNameInput.fill(name)
  }

  /**
   * Fill loan amount field
   */
  async fillAmount(amount: number): Promise<void> {
    await this.amountInput.fill(amount.toString())
  }

  /**
   * Fill term months field
   */
  async fillTermMonths(months: number): Promise<void> {
    await this.termMonthsInput.fill(months.toString())
  }

  /**
   * Fill interest rate field
   */
  async fillInterestRate(rate: number): Promise<void> {
    await this.interestRateInput.fill(rate.toString())
  }

  /**
   * Click submit button
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click()
  }

  /**
   * Check if form is visible
   */
  async isFormVisible(): Promise<boolean> {
    return await this.formContainer.isVisible()
  }

  /**
   * Check if error message is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorMessage.isVisible()
  }

  /**
   * Get error message text
   */
  async getErrorText(): Promise<string> {
    return await this.errorMessage.textContent() || ''
  }

  /**
   * Verify form header is visible
   */
  async verifyFormHeaderVisible(): Promise<void> {
    await expect(
      this.formContainer.locator('h2'),
      'Loan form header should be visible'
    ).toContainText(TEXT.NEW_LOAN_HEADER)
  }

  /**
   * Verify form is empty
   */
  async verifyFormIsEmpty(): Promise<void> {
    await expect(
      this.applicantNameInput,
      'Applicant name field should be empty'
    ).toHaveValue('')
    
    await expect(
      this.amountInput,
      'Amount field should be empty'
    ).toHaveValue('')
    
    await expect(
      this.termMonthsInput,
      'Term months field should be empty'
    ).toHaveValue('')
    
    await expect(
      this.interestRateInput,
      'Interest rate field should be empty'
    ).toHaveValue('')
  }

  /**
   * Verify error message is displayed with expected text
   */
  async verifyErrorMessage(expectedMessage: string): Promise<void> {
    await expect(
      this.errorMessage,
      `Error message should display: "${expectedMessage}"`
    ).toBeVisible()
    
    await expect(
      this.errorMessage,
      `Error message should contain expected text: "${expectedMessage}"`
    ).toContainText(expectedMessage)
  }

  /**
   * Verify no error is displayed
   */
  async verifyNoError(): Promise<void> {
    await expect(
      this.errorMessage,
      'Error message should not be visible'
    ).not.toBeVisible()
  }

  // ==================== GROUPED ACTION METHODS ====================

  /**
   * Complete loan application form
   * This is a grouped action that fills all fields and submits
   */
  async createLoanApplication(applicantName: string, amount: number, termMonths: number, interestRate: number): Promise<void> {
    await test.step(`Create loan application for ${applicantName}`, async () => {
      await this.fillApplicantName(applicantName)
      await this.fillAmount(amount)
      await this.fillTermMonths(termMonths)
      await this.fillInterestRate(interestRate)
      await this.clickSubmit()
    })
  }

  /**
   * Attempt to submit form without filling fields
   * Useful for validation testing
   */
  async submitEmptyForm(): Promise<void> {
    await test.step('Submit empty form', async () => {
      await this.clickSubmit()
    })
  }

  /**
   * Fill form with partial data (for validation testing)
   */
  async fillPartialForm(data: Partial<{
    applicantName: string
    amount: number
    termMonths: number
    interestRate: number
  }>): Promise<void> {
    await test.step('Fill partial form data', async () => {
      if (data.applicantName !== undefined) {
        await this.fillApplicantName(data.applicantName)
      }
      if (data.amount !== undefined) {
        await this.fillAmount(data.amount)
      }
      if (data.termMonths !== undefined) {
        await this.fillTermMonths(data.termMonths)
      }
      if (data.interestRate !== undefined) {
        await this.fillInterestRate(data.interestRate)
      }
    })
  }

  /**
   * Create loan and verify form resets
   */
  async createLoanAndVerifyReset(applicantName: string, amount: number, termMonths: number, interestRate: number): Promise<void> {
    await test.step('Create loan and verify form reset', async () => {
      await this.createLoanApplication(applicantName, amount, termMonths, interestRate)
      await this.verifyFormIsEmpty()
    })
  }

  /**
   * Verify all form labels are present
   */
  async verifyFormLabels(): Promise<void> {
    await test.step('Verify form labels', async () => {
      await expect(
        this.page.locator('label[for="applicantName"]'),
        'Applicant name label should be visible'
      ).toContainText(TEXT.LABEL_APPLICANT_NAME)
      
      await expect(
        this.page.locator('label[for="amount"]'),
        'Amount label should be visible'
      ).toContainText(TEXT.LABEL_AMOUNT)
      
      await expect(
        this.page.locator('label[for="termMonths"]'),
        'Term months label should be visible'
      ).toContainText(TEXT.LABEL_TERM)
      
      await expect(
        this.page.locator('label[for="interestRate"]'),
        'Interest rate label should be visible'
      ).toContainText(TEXT.LABEL_INTEREST_RATE)
    })
  }
}
