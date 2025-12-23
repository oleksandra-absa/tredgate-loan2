import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../src/App.vue'
import LoanForm from '../src/components/LoanForm.vue'
import LoanList from '../src/components/LoanList.vue'
import LoanSummary from '../src/components/LoanSummary.vue'
import * as loanService from '../src/services/loanService'
import type { LoanApplication } from '../src/types/loan'

// Mock loanService with partial mocking to keep calculateMonthlyPayment
vi.mock('../src/services/loanService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/loanService')>()
  return {
    ...actual,
    getLoans: vi.fn(),
    updateLoanStatus: vi.fn(),
    autoDecideLoan: vi.fn()
  }
})

describe('App.vue', () => {
  const mockLoans: LoanApplication[] = [
    {
      id: '1',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      applicantName: 'Jane Smith',
      amount: 75000,
      termMonths: 36,
      interestRate: 0.06,
      status: 'approved',
      createdAt: '2024-02-01T00:00:00.000Z'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders app header with logo and title', () => {
    vi.mocked(loanService.getLoans).mockReturnValue([])

    const wrapper = mount(App)

    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Tredgate Loan')
    expect(wrapper.find('.tagline').text()).toBe('Simple loan application management')
    expect(wrapper.find('.logo').exists()).toBe(true)
  })

  it('renders all main components', () => {
    vi.mocked(loanService.getLoans).mockReturnValue([])

    const wrapper = mount(App)

    expect(wrapper.findComponent(LoanForm).exists()).toBe(true)
    expect(wrapper.findComponent(LoanList).exists()).toBe(true)
    expect(wrapper.findComponent(LoanSummary).exists()).toBe(true)
  })

  it('loads loans on mount', () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)

    mount(App)

    expect(loanService.getLoans).toHaveBeenCalled()
  })

  it('passes loans to LoanList component', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    const loanList = wrapper.findComponent(LoanList)
    expect(loanList.props('loans')).toEqual(mockLoans)
  })

  it('passes loans to LoanSummary component', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    const loanSummary = wrapper.findComponent(LoanSummary)
    expect(loanSummary.props('loans')).toEqual(mockLoans)
  })

  it('refreshes loans when LoanForm emits created event', async () => {
    const initialLoans = [mockLoans[0]!]
    const updatedLoans = [...mockLoans]

    vi.mocked(loanService.getLoans)
      .mockReturnValueOnce(initialLoans)
      .mockReturnValueOnce(updatedLoans)

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    // Initial state
    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(initialLoans)

    // Emit created event from LoanForm
    const loanForm = wrapper.findComponent(LoanForm)
    await loanForm.vm.$emit('created')
    await wrapper.vm.$nextTick()

    // Should refresh loans
    expect(loanService.getLoans).toHaveBeenCalledTimes(2)
    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(updatedLoans)
  })

  it('approves loan when approve event is emitted from LoanList', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)

    const wrapper = mount(App)

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', '1')

    expect(loanService.updateLoanStatus).toHaveBeenCalledWith('1', 'approved')
    expect(loanService.getLoans).toHaveBeenCalledTimes(2) // once on mount, once after approve
  })

  it('rejects loan when reject event is emitted from LoanList', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)

    const wrapper = mount(App)

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('reject', '2')

    expect(loanService.updateLoanStatus).toHaveBeenCalledWith('2', 'rejected')
    expect(loanService.getLoans).toHaveBeenCalledTimes(2) // once on mount, once after reject
  })

  it('auto-decides loan when autoDecide event is emitted from LoanList', async () => {
    vi.mocked(loanService.getLoans).mockReturnValue(mockLoans)

    const wrapper = mount(App)

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('autoDecide', '1')

    expect(loanService.autoDecideLoan).toHaveBeenCalledWith('1')
    expect(loanService.getLoans).toHaveBeenCalledTimes(2) // once on mount, once after auto-decide
  })

  it('refreshes loans list after approving', async () => {
    const initialLoans = [mockLoans[0]!]
    const updatedLoans = [{ ...mockLoans[0]!, status: 'approved' as const }]

    vi.mocked(loanService.getLoans)
      .mockReturnValueOnce(initialLoans)
      .mockReturnValueOnce(updatedLoans)

    const wrapper = mount(App)

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', '1')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(updatedLoans)
  })

  it('refreshes loans list after rejecting', async () => {
    const initialLoans = [mockLoans[0]!]
    const updatedLoans = [{ ...mockLoans[0]!, status: 'rejected' as const }]

    vi.mocked(loanService.getLoans)
      .mockReturnValueOnce(initialLoans)
      .mockReturnValueOnce(updatedLoans)

    const wrapper = mount(App)

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('reject', '1')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(updatedLoans)
  })

  it('refreshes loans list after auto-deciding', async () => {
    const initialLoans = [mockLoans[0]!]
    const updatedLoans = [{ ...mockLoans[0]!, status: 'approved' as const }]

    vi.mocked(loanService.getLoans)
      .mockReturnValueOnce(initialLoans)
      .mockReturnValueOnce(updatedLoans)

    const wrapper = mount(App)

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('autoDecide', '1')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(LoanList).props('loans')).toEqual(updatedLoans)
  })

  it('handles empty loans array', () => {
    vi.mocked(loanService.getLoans).mockReturnValue([])

    const wrapper = mount(App)

    expect(wrapper.findComponent(LoanList).props('loans')).toEqual([])
    expect(wrapper.findComponent(LoanSummary).props('loans')).toEqual([])
  })

  it('renders main content layout correctly', () => {
    vi.mocked(loanService.getLoans).mockReturnValue([])

    const wrapper = mount(App)

    const mainContent = wrapper.find('.main-content')
    expect(mainContent.exists()).toBe(true)
    expect(mainContent.findComponent(LoanForm).exists()).toBe(true)
    expect(mainContent.findComponent(LoanList).exists()).toBe(true)
  })
})
