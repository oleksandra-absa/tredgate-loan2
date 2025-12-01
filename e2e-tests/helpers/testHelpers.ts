import type { Page } from '@playwright/test'

/**
 * Helper utilities for E2E tests
 * Contains reusable functions and utilities
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, includeDecimals = true): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(value)
}

/**
 * Format a decimal as percentage (e.g., 0.08 => "8.0%")
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

/**
 * Calculate monthly payment based on loan details
 * Uses the same formula as the application
 */
export function calculateMonthlyPayment(amount: number, termMonths: number, interestRate: number): number {
  const total = amount * (1 + interestRate)
  return total / termMonths
}

/**
 * Determine if a loan should be auto-approved based on business rules
 * - Approved if amount <= $100,000 AND term <= 60 months
 * - Rejected otherwise
 */
export function shouldAutoApprove(amount: number, termMonths: number): boolean {
  return amount <= 100000 && termMonths <= 60
}

/**
 * Generate a unique applicant name for test isolation
 */
export function generateUniqueApplicantName(prefix = 'Test User'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 7)
  return `${prefix} ${timestamp}${random}`
}

/**
 * Wait for a specific amount of time (for specific edge cases)
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Clear localStorage via browser context
 * Useful for test isolation
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear()
  })
}

/**
 * Get loan data from localStorage
 */
export async function getLoansFromStorage(page: Page): Promise<unknown[]> {
  return await page.evaluate(() => {
    const stored = localStorage.getItem('tredgate_loans')
    return stored ? JSON.parse(stored) : []
  })
}

/**
 * Set loan data in localStorage
 */
export async function setLoansInStorage(page: Page, loans: unknown[]): Promise<void> {
  await page.evaluate((loansData) => {
    localStorage.setItem('tredgate_loans', JSON.stringify(loansData))
  }, loans)
}
