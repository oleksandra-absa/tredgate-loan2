import { Page, Locator, expect, test } from '@playwright/test'
import { BasePage } from './BasePage'
import { TEXT } from '../texts/textLibrary'
import { formatCurrency } from '../helpers/testHelpers'

/**
 * Page Object for Loan Summary component
 * Handles all interactions with the summary statistics display
 */
export class LoanSummaryPage extends BasePage {
  // Atomic locators
  readonly summaryContainer: Locator

  constructor(page: Page) {
    super(page)
    
    this.summaryContainer = this.page.locator('.loan-summary')
  }

  // ==================== ATOMIC METHODS ====================

  /**
   * Get stat card by label
   */
  getStatCard(label: string): Locator {
    return this.summaryContainer.locator('.stat-card').filter({ 
      has: this.page.locator('.stat-label').filter({ hasText: new RegExp(`^${label}$`) }) 
    })
  }

  /**
   * Get stat value from a stat card
   */
  async getStatValue(label: string): Promise<string> {
    const statCard = this.getStatCard(label)
    const valueElement = statCard.locator('.stat-value')
    return await valueElement.textContent() || ''
  }

  /**
   * Verify summary container is visible
   */
  async verifySummaryVisible(): Promise<void> {
    await expect(
      this.summaryContainer,
      'Summary container should be visible'
    ).toBeVisible()
  }

  /**
   * Verify total applications count
   */
  async verifyTotalApplications(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(TEXT.SUMMARY_TOTAL)
    expect(
      parseInt(value),
      `Total applications should be ${expectedCount}`
    ).toBe(expectedCount)
  }

  /**
   * Verify pending count
   */
  async verifyPendingCount(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(TEXT.SUMMARY_PENDING)
    expect(
      parseInt(value),
      `Pending count should be ${expectedCount}`
    ).toBe(expectedCount)
  }

  /**
   * Verify approved count
   */
  async verifyApprovedCount(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(TEXT.SUMMARY_APPROVED)
    expect(
      parseInt(value),
      `Approved count should be ${expectedCount}`
    ).toBe(expectedCount)
  }

  /**
   * Verify rejected count
   */
  async verifyRejectedCount(expectedCount: number): Promise<void> {
    const value = await this.getStatValue(TEXT.SUMMARY_REJECTED)
    expect(
      parseInt(value),
      `Rejected count should be ${expectedCount}`
    ).toBe(expectedCount)
  }

  /**
   * Verify total approved amount
   */
  async verifyTotalApprovedAmount(expectedAmount: number): Promise<void> {
    const value = await this.getStatValue(TEXT.SUMMARY_TOTAL_APPROVED)
    const expectedFormatted = formatCurrency(expectedAmount, false)
    expect(
      value,
      `Total approved amount should be ${expectedFormatted}`
    ).toBe(expectedFormatted)
  }

  /**
   * Verify all stat cards are visible
   */
  async verifyAllStatCardsVisible(): Promise<void> {
    const labels = [
      TEXT.SUMMARY_TOTAL,
      TEXT.SUMMARY_PENDING,
      TEXT.SUMMARY_APPROVED,
      TEXT.SUMMARY_REJECTED,
      TEXT.SUMMARY_TOTAL_APPROVED,
    ]

    for (const label of labels) {
      await expect(
        this.getStatCard(label),
        `Stat card "${label}" should be visible`
      ).toBeVisible()
    }
  }

  // ==================== GROUPED ACTION METHODS ====================

  /**
   * Verify all summary statistics
   */
  async verifySummaryStats(stats: {
    total: number
    pending: number
    approved: number
    rejected: number
    totalApprovedAmount: number
  }): Promise<void> {
    await test.step('Verify summary statistics', async () => {
      await this.verifyTotalApplications(stats.total)
      await this.verifyPendingCount(stats.pending)
      await this.verifyApprovedCount(stats.approved)
      await this.verifyRejectedCount(stats.rejected)
      await this.verifyTotalApprovedAmount(stats.totalApprovedAmount)
    })
  }

  /**
   * Verify initial state (all zeros)
   */
  async verifyInitialState(): Promise<void> {
    await test.step('Verify initial summary state', async () => {
      await this.verifySummaryStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalApprovedAmount: 0,
      })
    })
  }

  /**
   * Verify summary after creating a single loan
   */
  async verifyAfterCreatingLoan(): Promise<void> {
    await test.step('Verify summary after creating loan', async () => {
      await this.verifySummaryStats({
        total: 1,
        pending: 1,
        approved: 0,
        rejected: 0,
        totalApprovedAmount: 0,
      })
    })
  }

  /**
   * Verify summary after approving a loan
   */
  async verifyAfterApprovingLoan(loanAmount: number, totalLoans: number, pendingLoans: number): Promise<void> {
    await test.step('Verify summary after approving loan', async () => {
      await this.verifySummaryStats({
        total: totalLoans,
        pending: pendingLoans,
        approved: 1,
        rejected: 0,
        totalApprovedAmount: loanAmount,
      })
    })
  }
}
