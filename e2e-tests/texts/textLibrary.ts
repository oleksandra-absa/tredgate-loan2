/**
 * Text Library - Centralized text constants for E2E tests
 * This prevents hardcoding text in tests and page objects, making tests more maintainable
 */

export const TEXT = {
  // Page titles and headers
  PAGE_TITLE: 'Tredgate Loan',
  HEADER_TAGLINE: 'Simple loan application management',
  NEW_LOAN_HEADER: 'New Loan Application',
  LOAN_APPLICATIONS_HEADER: 'Loan Applications',
  
  // Form labels
  LABEL_APPLICANT_NAME: 'Applicant Name',
  LABEL_AMOUNT: 'Loan Amount ($)',
  LABEL_TERM: 'Term (Months)',
  LABEL_INTEREST_RATE: 'Interest Rate (e.g., 0.08 for 8%)',
  
  // Button labels
  BTN_CREATE_APPLICATION: 'Create Application',
  BTN_APPROVE: 'Approve',
  BTN_REJECT: 'Reject',
  BTN_AUTO_DECIDE: 'Auto-decide',
  BTN_DELETE: 'Delete',
  
  // Table headers
  TH_APPLICANT: 'Applicant',
  TH_AMOUNT: 'Amount',
  TH_TERM: 'Term',
  TH_RATE: 'Rate',
  TH_MONTHLY_PAYMENT: 'Monthly Payment',
  TH_STATUS: 'Status',
  TH_CREATED: 'Created',
  TH_ACTIONS: 'Actions',
  
  // Status badges
  STATUS_PENDING: 'pending',
  STATUS_APPROVED: 'approved',
  STATUS_REJECTED: 'rejected',
  
  // Summary labels
  SUMMARY_TOTAL: 'Total Applications',
  SUMMARY_PENDING: 'Pending',
  SUMMARY_APPROVED: 'Approved',
  SUMMARY_REJECTED: 'Rejected',
  SUMMARY_TOTAL_APPROVED: 'Total Approved',
  
  // Empty state
  EMPTY_STATE_MESSAGE: 'No loan applications yet. Create one using the form.',
  
  // Error messages
  ERROR_NAME_REQUIRED: 'Applicant name is required',
  ERROR_AMOUNT_POSITIVE: 'Amount must be greater than 0',
  ERROR_TERM_POSITIVE: 'Term months must be greater than 0',
  ERROR_RATE_REQUIRED: 'Interest rate is required and cannot be negative',
  
  // Confirmation dialogs
  CONFIRM_DELETE: 'Are you sure you want to delete this loan application? This action cannot be undone.',
  
  // Placeholders
  PLACEHOLDER_NAME: 'Enter applicant name',
  PLACEHOLDER_AMOUNT: 'Enter loan amount',
  PLACEHOLDER_TERM: 'Enter term in months',
  PLACEHOLDER_RATE: 'Enter interest rate',
} as const

/**
 * Test data constants
 */
export const TEST_DATA = {
  VALID_LOAN: {
    name: 'John Doe',
    amount: 50000,
    term: 36,
    rate: 0.08,
  },
  LARGE_LOAN: {
    name: 'Jane Smith',
    amount: 150000,
    term: 72,
    rate: 0.10,
  },
  SMALL_LOAN: {
    name: 'Bob Johnson',
    amount: 5000,
    term: 12,
    rate: 0.05,
  },
  BOUNDARY_APPROVED: {
    name: 'Alice Williams',
    amount: 100000,
    term: 60,
    rate: 0.09,
  },
  BOUNDARY_REJECTED_AMOUNT: {
    name: 'Charlie Brown',
    amount: 100001,
    term: 60,
    rate: 0.09,
  },
  BOUNDARY_REJECTED_TERM: {
    name: 'David Davis',
    amount: 100000,
    term: 61,
    rate: 0.09,
  },
} as const
