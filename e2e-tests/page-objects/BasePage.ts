import { Page, Locator, expect } from '@playwright/test'
import { TEXT } from '../texts/textLibrary'

/**
 * Base Page Object
 * Contains common functionality shared across all page objects
 */
export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Navigate to the application home page
   */
  async goto(): Promise<void> {
    await this.page.goto('/')
  }

  /**
   * Verify the page has loaded correctly
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.page.locator('h1'), 'Page header should be visible').toContainText(TEXT.PAGE_TITLE)
    await expect(this.page.locator('.tagline'), 'Tagline should be visible').toContainText(TEXT.HEADER_TAGLINE)
  }

  /**
   * Wait for page to be stable (network idle)
   */
  async waitForPageStable(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Reload the page
   */
  async reload(): Promise<void> {
    await this.page.reload()
    await this.waitForPageStable()
  }

  /**
   * Clear browser storage
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  }

  /**
   * Get a locator by test ID
   * Useful for elements with data-testid attributes
   */
  getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`)
  }

  /**
   * Get a locator by role and name
   */
  getByRoleAndName(role: string, name: string | RegExp): Locator {
    return this.page.getByRole(role as any, { name })
  }

  /**
   * Handle browser dialogs (confirm, alert)
   */
  async handleDialog(accept: boolean, message?: string): Promise<void> {
    this.page.once('dialog', async dialog => {
      if (message) {
        expect(dialog.message(), 'Dialog message should match expected').toBe(message)
      }
      if (accept) {
        await dialog.accept()
      } else {
        await dialog.dismiss()
      }
    })
  }
}
