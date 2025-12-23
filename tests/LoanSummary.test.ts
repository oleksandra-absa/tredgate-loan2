import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanSummary from '../src/components/LoanSummary.vue'
import type { LoanApplication } from '../src/types/loan'

describe('LoanSummary.vue', () => {
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
    },
    {
      id: '3',
      applicantName: 'Bob Johnson',
      amount: 25000,
      termMonths: 12,
      interestRate: 0.05,
      status: 'approved',
      createdAt: '2024-02-15T00:00:00.000Z'
    },
    {
      id: '4',
      applicantName: 'Alice Williams',
      amount: 150000,
      termMonths: 72,
      interestRate: 0.10,
      status: 'rejected',
      createdAt: '2024-03-01T00:00:00.000Z'
    }
  ]

  it('renders all stat cards', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards).toHaveLength(5)
  })

  it('displays correct total count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const totalCard = statCards[0]
    expect(totalCard?.find('.stat-value').text()).toBe('4')
    expect(totalCard?.find('.stat-label').text()).toBe('Total Applications')
  })

  it('displays correct pending count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const pendingCard = statCards[1]
    expect(pendingCard?.find('.stat-value').text()).toBe('1')
    expect(pendingCard?.find('.stat-label').text()).toBe('Pending')
    expect(pendingCard?.classes()).toContain('pending')
  })

  it('displays correct approved count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const approvedCard = statCards[2]
    expect(approvedCard?.find('.stat-value').text()).toBe('2')
    expect(approvedCard?.find('.stat-label').text()).toBe('Approved')
    expect(approvedCard?.classes()).toContain('approved')
  })

  it('displays correct rejected count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const rejectedCard = statCards[3]
    expect(rejectedCard?.find('.stat-value').text()).toBe('1')
    expect(rejectedCard?.find('.stat-label').text()).toBe('Rejected')
    expect(rejectedCard?.classes()).toContain('rejected')
  })

  it('displays correct total approved amount', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const amountCard = statCards[4]
    // 75000 + 25000 = 100000
    expect(amountCard?.find('.stat-value').text()).toBe('$100,000')
    expect(amountCard?.find('.stat-label').text()).toBe('Total Approved')
    expect(amountCard?.classes()).toContain('amount')
  })

  it('shows zero values when no loans', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('0')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0')
    expect(statCards[2]?.find('.stat-value').text()).toBe('0')
    expect(statCards[3]?.find('.stat-value').text()).toBe('0')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0')
  })

  it('handles all pending loans', () => {
    const pendingLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Test 1',
        amount: 10000,
        termMonths: 12,
        interestRate: 0.05,
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        applicantName: 'Test 2',
        amount: 20000,
        termMonths: 24,
        interestRate: 0.06,
        status: 'pending',
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: pendingLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('2') // total
    expect(statCards[1]?.find('.stat-value').text()).toBe('2') // pending
    expect(statCards[2]?.find('.stat-value').text()).toBe('0') // approved
    expect(statCards[3]?.find('.stat-value').text()).toBe('0') // rejected
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0') // total approved
  })

  it('handles all approved loans', () => {
    const approvedLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Test 1',
        amount: 30000,
        termMonths: 12,
        interestRate: 0.05,
        status: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        applicantName: 'Test 2',
        amount: 40000,
        termMonths: 24,
        interestRate: 0.06,
        status: 'approved',
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: approvedLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('2') // total
    expect(statCards[1]?.find('.stat-value').text()).toBe('0') // pending
    expect(statCards[2]?.find('.stat-value').text()).toBe('2') // approved
    expect(statCards[3]?.find('.stat-value').text()).toBe('0') // rejected
    expect(statCards[4]?.find('.stat-value').text()).toBe('$70,000') // total approved: 30000 + 40000
  })

  it('handles all rejected loans', () => {
    const rejectedLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Test 1',
        amount: 200000,
        termMonths: 72,
        interestRate: 0.10,
        status: 'rejected',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: rejectedLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('1') // total
    expect(statCards[1]?.find('.stat-value').text()).toBe('0') // pending
    expect(statCards[2]?.find('.stat-value').text()).toBe('0') // approved
    expect(statCards[3]?.find('.stat-value').text()).toBe('1') // rejected
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0') // total approved
  })

  it('formats large approved amounts correctly', () => {
    const largeLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Test 1',
        amount: 1500000,
        termMonths: 60,
        interestRate: 0.08,
        status: 'approved',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '2',
        applicantName: 'Test 2',
        amount: 2500000,
        termMonths: 60,
        interestRate: 0.08,
        status: 'approved',
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: largeLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    // 1500000 + 2500000 = 4000000
    expect(statCards[4]?.find('.stat-value').text()).toBe('$4,000,000')
  })

  it('computes statistics reactively', async () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })

    let statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('0')

    await wrapper.setProps({ loans: mockLoans })

    statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('4')
    expect(statCards[1]?.find('.stat-value').text()).toBe('1')
    expect(statCards[2]?.find('.stat-value').text()).toBe('2')
    expect(statCards[3]?.find('.stat-value').text()).toBe('1')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$100,000')
  })
})
