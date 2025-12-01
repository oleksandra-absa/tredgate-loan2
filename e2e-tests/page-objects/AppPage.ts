import { Page } from '@playwright/test'
import { BasePage } from './BasePage'
import { LoanFormPage } from './LoanFormPage'
import { LoanListPage } from './LoanListPage'
import { LoanSummaryPage } from './LoanSummaryPage'

/**
 * Main App Page Object
 * Combines all page objects for the Tredgate Loan application
 */
export class AppPage extends BasePage {
  readonly loanForm: LoanFormPage
  readonly loanList: LoanListPage
  readonly loanSummary: LoanSummaryPage

  constructor(page: Page) {
    super(page)
    
    this.loanForm = new LoanFormPage(page)
    this.loanList = new LoanListPage(page)
    this.loanSummary = new LoanSummaryPage(page)
  }

  /**
   * Initialize the application - navigate and verify load
   */
  async initialize(): Promise<void> {
    await this.goto()
    await this.verifyPageLoaded()
  }

  /**
   * Reset the application to initial state
   */
  async reset(): Promise<void> {
    await this.clearStorage()
    await this.reload()
  }
}
