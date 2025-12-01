import { Page, Locator, expect, test } from '@playwright/test'
import { BasePage } from './BasePage'
import { TEXT } from '../texts/textLibrary'
import { formatCurrency, formatPercent } from '../helpers/testHelpers'

/**
 * Page Object for Loan List component
 * Handles all interactions with the loan applications table
 */
export class LoanListPage extends BasePage {
  // Atomic locators
  readonly listContainer: Locator
  readonly emptyStateMessage: Locator
  readonly table: Locator
  readonly tableRows: Locator

  constructor(page: Page) {
    super(page)
    
    this.listContainer = this.page.locator('.loan-list')
    this.emptyStateMessage = this.page.locator('.empty-state')
    this.table = this.page.locator('table')
    this.tableRows = this.page.locator('tbody tr')
  }

  // ==================== ATOMIC METHODS ====================

  /**
   * Get a specific loan row by applicant name
   * Note: This is not perfectly stable as names could duplicate
   * TODO: Add data-testid to rows for better stability
   */
  getLoanRowByApplicant(applicantName: string): Locator {
    return this.page.locator(`tbody tr:has-text("${applicantName}")`)
  }

  /**
   * Get approve button for a specific loan
   */
  getApproveButton(applicantName: string): Locator {
    return this.getLoanRowByApplicant(applicantName).locator('button[title="Approve"]')
  }

  /**
   * Get reject button for a specific loan
   */
  getRejectButton(applicantName: string): Locator {
    return this.getLoanRowByApplicant(applicantName).locator('button[title="Reject"]')
  }

  /**
   * Get auto-decide button for a specific loan
   */
  getAutoDecideButton(applicantName: string): Locator {
    return this.getLoanRowByApplicant(applicantName).locator('button[title="Auto-decide"]')
  }

  /**
   * Get delete button for a specific loan
   */
  getDeleteButton(applicantName: string): Locator {
    return this.getLoanRowByApplicant(applicantName).locator('button[title="Delete"]')
  }

  /**
   * Get status badge for a specific loan
   */
  getStatusBadge(applicantName: string): Locator {
    return this.getLoanRowByApplicant(applicantName).locator('.status-badge')
  }

  /**
   * Click approve button for a loan
   */
  async clickApprove(applicantName: string): Promise<void> {
    await this.getApproveButton(applicantName).click()
  }

  /**
   * Click reject button for a loan
   */
  async clickReject(applicantName: string): Promise<void> {
    await this.getRejectButton(applicantName).click()
  }

  /**
   * Click auto-decide button for a loan
   */
  async clickAutoDecide(applicantName: string): Promise<void> {
    await this.getAutoDecideButton(applicantName).click()
  }

  /**
   * Click delete button for a loan
   */
  async clickDelete(applicantName: string): Promise<void> {
    await this.getDeleteButton(applicantName).click()
  }

  /**
   * Get the number of loan rows in the table
   */
  async getLoanCount(): Promise<number> {
    return await this.tableRows.count()
  }

  /**
   * Check if empty state is visible
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return await this.emptyStateMessage.isVisible()
  }

  /**
   * Check if table is visible
   */
  async isTableVisible(): Promise<boolean> {
    return await this.table.isVisible()
  }

  /**
   * Verify list header is visible
   */
  async verifyListHeaderVisible(): Promise<void> {
    await expect(
      this.listContainer.locator('h2'),
      'Loan list header should be visible'
    ).toContainText(TEXT.LOAN_APPLICATIONS_HEADER)
  }

  /**
   * Verify empty state message
   */
  async verifyEmptyState(): Promise<void> {
    await expect(
      this.emptyStateMessage,
      'Empty state message should be visible'
    ).toBeVisible()
    
    await expect(
      this.emptyStateMessage,
      'Empty state should show correct message'
    ).toContainText(TEXT.EMPTY_STATE_MESSAGE)
  }

  /**
   * Verify table headers are present
   */
  async verifyTableHeaders(): Promise<void> {
    const headers = [
      TEXT.TH_APPLICANT,
      TEXT.TH_AMOUNT,
      TEXT.TH_TERM,
      TEXT.TH_RATE,
      TEXT.TH_MONTHLY_PAYMENT,
      TEXT.TH_STATUS,
      TEXT.TH_CREATED,
      TEXT.TH_ACTIONS,
    ]

    for (const header of headers) {
      await expect(
        this.table.locator('th', { hasText: header }),
        `Table header "${header}" should be visible`
      ).toBeVisible()
    }
  }

  /**
   * Verify loan exists in the table
   */
  async verifyLoanExists(applicantName: string): Promise<void> {
    await expect(
      this.getLoanRowByApplicant(applicantName),
      `Loan for ${applicantName} should exist in table`
    ).toBeVisible()
  }

  /**
   * Verify loan does not exist in the table
   */
  async verifyLoanNotExists(applicantName: string): Promise<void> {
    await expect(
      this.getLoanRowByApplicant(applicantName),
      `Loan for ${applicantName} should not exist in table`
    ).not.toBeVisible()
  }

  /**
   * Verify loan status
   */
  async verifyLoanStatus(applicantName: string, expectedStatus: string): Promise<void> {
    await expect(
      this.getStatusBadge(applicantName),
      `Status for ${applicantName} should be ${expectedStatus}`
    ).toContainText(expectedStatus)
  }

  /**
   * Verify loan details in the table
   */
  async verifyLoanDetails(
    applicantName: string,
    amount: number,
    termMonths: number,
    interestRate: number,
    monthlyPayment: number
  ): Promise<void> {
    const row = this.getLoanRowByApplicant(applicantName)
    
    await expect(
      row,
      `Row for ${applicantName} should contain correct amount`
    ).toContainText(formatCurrency(amount))
    
    await expect(
      row,
      `Row for ${applicantName} should contain correct term`
    ).toContainText(`${termMonths} mo`)
    
    await expect(
      row,
      `Row for ${applicantName} should contain correct rate`
    ).toContainText(formatPercent(interestRate))
    
    await expect(
      row,
      `Row for ${applicantName} should contain correct monthly payment`
    ).toContainText(formatCurrency(monthlyPayment))
  }

  /**
   * Verify action buttons are visible for pending loan
   */
  async verifyPendingActionButtons(applicantName: string): Promise<void> {
    await expect(
      this.getApproveButton(applicantName),
      `Approve button should be visible for ${applicantName}`
    ).toBeVisible()
    
    await expect(
      this.getRejectButton(applicantName),
      `Reject button should be visible for ${applicantName}`
    ).toBeVisible()
    
    await expect(
      this.getAutoDecideButton(applicantName),
      `Auto-decide button should be visible for ${applicantName}`
    ).toBeVisible()
    
    await expect(
      this.getDeleteButton(applicantName),
      `Delete button should be visible for ${applicantName}`
    ).toBeVisible()
  }

  /**
   * Verify action buttons for non-pending loan (only delete visible)
   */
  async verifyNonPendingActionButtons(applicantName: string): Promise<void> {
    await expect(
      this.getApproveButton(applicantName),
      `Approve button should not be visible for ${applicantName}`
    ).not.toBeVisible()
    
    await expect(
      this.getRejectButton(applicantName),
      `Reject button should not be visible for ${applicantName}`
    ).not.toBeVisible()
    
    await expect(
      this.getAutoDecideButton(applicantName),
      `Auto-decide button should not be visible for ${applicantName}`
    ).not.toBeVisible()
    
    await expect(
      this.getDeleteButton(applicantName),
      `Delete button should be visible for ${applicantName}`
    ).toBeVisible()
  }

  // ==================== GROUPED ACTION METHODS ====================

  /**
   * Approve a loan application
   */
  async approveLoan(applicantName: string): Promise<void> {
    await test.step(`Approve loan for ${applicantName}`, async () => {
      await this.clickApprove(applicantName)
      await this.verifyLoanStatus(applicantName, TEXT.STATUS_APPROVED)
    })
  }

  /**
   * Reject a loan application
   */
  async rejectLoan(applicantName: string): Promise<void> {
    await test.step(`Reject loan for ${applicantName}`, async () => {
      await this.clickReject(applicantName)
      await this.verifyLoanStatus(applicantName, TEXT.STATUS_REJECTED)
    })
  }

  /**
   * Auto-decide a loan application
   */
  async autoDecideLoan(applicantName: string, expectedStatus: string): Promise<void> {
    await test.step(`Auto-decide loan for ${applicantName}`, async () => {
      await this.clickAutoDecide(applicantName)
      await this.verifyLoanStatus(applicantName, expectedStatus)
    })
  }

  /**
   * Delete a loan application with confirmation
   */
  async deleteLoan(applicantName: string): Promise<void> {
    await test.step(`Delete loan for ${applicantName}`, async () => {
      // Set up dialog handler
      await this.handleDialog(true, TEXT.CONFIRM_DELETE)
      
      // Click delete button
      await this.clickDelete(applicantName)
      
      // Verify loan is removed
      await this.verifyLoanNotExists(applicantName)
    })
  }

  /**
   * Verify loan count matches expected
   */
  async verifyLoanCountEquals(expectedCount: number): Promise<void> {
    await test.step(`Verify loan count equals ${expectedCount}`, async () => {
      if (expectedCount === 0) {
        await this.verifyEmptyState()
      } else {
        await expect(
          this.tableRows,
          `Should have exactly ${expectedCount} loan(s)`
        ).toHaveCount(expectedCount)
      }
    })
  }
}
