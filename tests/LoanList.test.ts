import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanList from '../src/components/LoanList.vue'
import type { LoanApplication } from '../src/types/loan'

describe('LoanList.vue', () => {
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
      amount: 150000,
      termMonths: 72,
      interestRate: 0.10,
      status: 'rejected',
      createdAt: '2024-03-01T00:00:00.000Z'
    }
  ]

  it('renders loan applications list title', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })

    expect(wrapper.find('h2').text()).toBe('Loan Applications')
  })

  it('displays empty state when no loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state p').text()).toBe('No loan applications yet. Create one using the form.')
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('displays table with loans when loans exist', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('table').exists()).toBe(true)
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
  })

  it('displays loan applicant names correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('John Doe')
    expect(rows[1]?.text()).toContain('Jane Smith')
    expect(rows[2]?.text()).toContain('Bob Johnson')
  })

  it('formats currency correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('$50,000.00')
  })

  it('displays term months correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('24 mo')
  })

  it('formats interest rate as percentage', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('8.0%')
  })

  it('calculates and displays monthly payment', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    // For loan amount 50000, interest 0.08, term 24:
    // total = 50000 * 1.08 = 54000
    // monthly = 54000 / 24 = 2250
    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('$2,250.00')
  })

  it('displays status badge with correct class for pending', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const badge = wrapper.find('.status-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.classes()).toContain('status-pending')
    expect(badge.text()).toBe('pending')
  })

  it('displays status badge with correct class for approved', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[1]!] }
    })

    const badge = wrapper.find('.status-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.classes()).toContain('status-approved')
    expect(badge.text()).toBe('approved')
  })

  it('displays status badge with correct class for rejected', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[2]!] }
    })

    const badge = wrapper.find('.status-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.classes()).toContain('status-rejected')
    expect(badge.text()).toBe('rejected')
  })

  it('formats date correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('Jan 1, 2024')
  })

  it('shows action buttons for pending loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const actionButtons = wrapper.findAll('.action-btn')
    expect(actionButtons).toHaveLength(3)
    expect(actionButtons[0]?.classes()).toContain('success')
    expect(actionButtons[1]?.classes()).toContain('danger')
    expect(actionButtons[2]?.classes()).toContain('secondary')
  })

  it('does not show action buttons for approved loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[1]!] }
    })

    const actionButtons = wrapper.findAll('.action-btn')
    expect(actionButtons).toHaveLength(0)
    expect(wrapper.find('.no-actions').exists()).toBe(true)
  })

  it('does not show action buttons for rejected loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[2]!] }
    })

    const actionButtons = wrapper.findAll('.action-btn')
    expect(actionButtons).toHaveLength(0)
    expect(wrapper.find('.no-actions').exists()).toBe(true)
  })

  it('emits approve event when approve button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const approveButton = wrapper.findAll('.action-btn')[0]
    await approveButton?.trigger('click')

    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('approve')?.[0]).toEqual(['1'])
  })

  it('emits reject event when reject button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const rejectButton = wrapper.findAll('.action-btn')[1]
    await rejectButton?.trigger('click')

    expect(wrapper.emitted('reject')).toBeTruthy()
    expect(wrapper.emitted('reject')?.[0]).toEqual(['1'])
  })

  it('emits autoDecide event when auto-decide button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const autoDecideButton = wrapper.findAll('.action-btn')[2]
    await autoDecideButton?.trigger('click')

    expect(wrapper.emitted('autoDecide')).toBeTruthy()
    expect(wrapper.emitted('autoDecide')?.[0]).toEqual(['1'])
  })

  it('renders all table headers correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const headers = wrapper.findAll('thead th')
    expect(headers).toHaveLength(8)
    expect(headers[0]?.text()).toBe('Applicant')
    expect(headers[1]?.text()).toBe('Amount')
    expect(headers[2]?.text()).toBe('Term')
    expect(headers[3]?.text()).toBe('Rate')
    expect(headers[4]?.text()).toBe('Monthly Payment')
    expect(headers[5]?.text()).toBe('Status')
    expect(headers[6]?.text()).toBe('Created')
    expect(headers[7]?.text()).toBe('Actions')
  })

  it('handles multiple loans correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(3)

    // Check first loan has action buttons (pending)
    expect(rows[0]?.findAll('.action-btn')).toHaveLength(3)

    // Check second loan has no action buttons (approved)
    expect(rows[1]?.findAll('.action-btn')).toHaveLength(0)

    // Check third loan has no action buttons (rejected)
    expect(rows[2]?.findAll('.action-btn')).toHaveLength(0)
  })
})
