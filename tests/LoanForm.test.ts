import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanForm from '../src/components/LoanForm.vue'
import * as loanService from '../src/services/loanService'

// Mock loanService with partial mocking
vi.mock('../src/services/loanService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/loanService')>()
  return {
    ...actual,
    createLoanApplication: vi.fn()
  }
})

describe('LoanForm.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all fields', () => {
    const wrapper = mount(LoanForm)

    expect(wrapper.find('h2').text()).toBe('New Loan Application')
    expect(wrapper.find('#applicantName').exists()).toBe(true)
    expect(wrapper.find('#amount').exists()).toBe(true)
    expect(wrapper.find('#termMonths').exists()).toBe(true)
    expect(wrapper.find('#interestRate').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toBe('Create Application')
  })

  it('shows error when applicant name is empty', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Applicant name is required')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('shows error when amount is invalid', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(0)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Amount must be greater than 0')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('shows error when term months is invalid', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(0)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Term months must be greater than 0')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('shows error when interest rate is negative', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(-1)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Interest rate is required and cannot be negative')
    expect(loanService.createLoanApplication).not.toHaveBeenCalled()
  })

  it('creates loan application with valid data', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }

    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)

    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(50000)
    await wrapper.find('#termMonths').setValue(24)
    await wrapper.find('#interestRate').setValue(0.08)
    await wrapper.find('form').trigger('submit.prevent')

    expect(loanService.createLoanApplication).toHaveBeenCalledWith({
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08
    })
  })

  it('resets form after successful submission', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'Jane Smith',
      amount: 25000,
      termMonths: 12,
      interestRate: 0.05,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }

    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)

    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('Jane Smith')
    await wrapper.find('#amount').setValue(25000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    // Wait for next tick
    await wrapper.vm.$nextTick()

    expect((wrapper.find('#applicantName').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#amount').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#termMonths').element as HTMLInputElement).value).toBe('')
    expect((wrapper.find('#interestRate').element as HTMLInputElement).value).toBe('')
  })

  it('emits created event after successful submission', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'Test User',
      amount: 10000,
      termMonths: 6,
      interestRate: 0.04,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }

    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)

    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(6)
    await wrapper.find('#interestRate').setValue(0.04)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')?.length).toBe(1)
  })

  it('handles error from createLoanApplication', async () => {
    vi.mocked(loanService.createLoanApplication).mockImplementation(() => {
      throw new Error('Database error')
    })

    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Database error')
  })

  it('trims applicant name before submission', async () => {
    const mockLoan = {
      id: 'test-id',
      applicantName: 'John Doe',
      amount: 10000,
      termMonths: 12,
      interestRate: 0.05,
      status: 'pending' as const,
      createdAt: '2024-01-01T00:00:00.000Z'
    }

    vi.mocked(loanService.createLoanApplication).mockReturnValue(mockLoan)

    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('  John Doe  ')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(loanService.createLoanApplication).toHaveBeenCalledWith({
      applicantName: 'John Doe',
      amount: 10000,
      termMonths: 12,
      interestRate: 0.05
    })
  })
})
