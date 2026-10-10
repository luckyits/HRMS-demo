import React, { createContext, useContext, useState } from 'react'
import type { ApprovalStep } from '@/components/common/ApprovalTimeline'
import { AuditLogService } from '@/services/auditLogService'

export interface ExpenseCategory {
  id: string
  name: string
  icon: string
  limitL1L3: number
  limitL4L5: number
  limitExecutive: number
  isReceiptMandatory: boolean
  description: string
}

export interface ForeignCurrency {
  code: string
  name: string
  symbol: string
  rateToINR: number
}

export interface ExpensePolicy {
  receiptMandatoryAbove: number
  distanceRateTwoWheeler: number
  distanceRateFourWheeler: number
  perDiemStandardCity: number
  perDiemMetroCity: number
  foreignCurrencies: ForeignCurrency[]
}

export interface ExpenseClaimLine {
  id: string
  category: string
  date: string
  description: string
  currency: string
  originalAmount: number
  exchangeRate: number
  amountINR: number
  receiptFileName?: string
  receiptUrl?: string
  isOverLimit: boolean
  limitForGrade: number
  isDuplicateReceipt: boolean
  hasMissingReceiptViolation: boolean
  violationNote?: string
}

export interface ExpenseClaim {
  id: string
  claimNumber: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  employeeGrade: string
  department: string
  title: string
  date: string
  lines: ExpenseClaimLine[]
  totalAmountINR: number
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Paid'
  hasPolicyViolation: boolean
  violationSummary?: string
  steps: ApprovalStep[]
  submittedAt: string
  paymentMode?: 'Monthly Payroll Run' | 'Direct Bank Transfer'
  paymentDate?: string
  paymentRef?: string
}

export interface LoanType {
  id: string
  name: string
  interestRate: number // e.g. 0% or 2.5%
  maxAmount: number
  maxTenureMonths: number
  minServiceMonths: number
  description: string
  active: boolean
}

export interface LoanRepaymentInstallment {
  installmentNo: number
  dueDate: string
  emiAmount: number
  principalComponent: number
  interestComponent: number
  balanceAfter: number
  status: 'Recovered' | 'Pending' | 'Upcoming'
}

export interface LoanApplication {
  id: string
  applicationNumber: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  employeeGrade: string
  department: string
  loanTypeId: string
  loanTypeName: string
  principalAmount: number
  interestRate: number
  tenureMonths: number
  monthlyEmi: number
  totalRepayment: number
  serviceMonths: number
  isEligible: boolean
  reason: string
  status: 'Pending Approval' | 'Active / Disbursing' | 'Completed' | 'Rejected'
  submittedAt: string
  disbursedDate?: string
  steps: ApprovalStep[]
  recoverySchedule: LoanRepaymentInstallment[]
}

interface ExpenseFinanceContextType {
  categories: ExpenseCategory[]
  updateCategory: (id: string, updated: Partial<ExpenseCategory>) => void
  addCategory: (cat: Omit<ExpenseCategory, 'id'>) => void
  policy: ExpensePolicy
  updatePolicy: (updated: Partial<ExpensePolicy>) => void
  loanTypes: LoanType[]
  updateLoanType: (id: string, updated: Partial<LoanType>) => void
  addLoanType: (lt: Omit<LoanType, 'id'>) => void
  claims: ExpenseClaim[]
  createClaim: (claim: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'status' | 'steps' | 'submittedAt'>) => ExpenseClaim
  approveClaim: (claimId: string, approverRole: string, comments?: string) => void
  rejectClaim: (claimId: string, approverRole: string, comments?: string) => void
  settleClaimsBatch: (claimIds: string[], paymentMode: 'Monthly Payroll Run' | 'Direct Bank Transfer') => void
  loans: LoanApplication[]
  applyForLoan: (loan: Omit<LoanApplication, 'id' | 'applicationNumber' | 'status' | 'steps' | 'submittedAt' | 'recoverySchedule'>) => LoanApplication
  approveLoan: (loanId: string, approverRole: string, comments?: string) => void
  rejectLoan: (loanId: string, approverRole: string, comments?: string) => void
  calculateEmi: (principal: number, annualInterestRate: number, tenureMonths: number) => { emi: number; totalPayment: number; totalInterest: number }
  generateSchedule: (principal: number, annualInterestRate: number, tenureMonths: number) => LoanRepaymentInstallment[]
}

const INITIAL_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'CAT-01',
    name: 'Travel & Conveyance',
    icon: 'Plane',
    limitL1L3: 3500,
    limitL4L5: 7500,
    limitExecutive: 18000,
    isReceiptMandatory: true,
    description: 'Flights, trains, taxi, ride-hailing and local transit vouchers',
  },
  {
    id: 'CAT-02',
    name: 'Meals & Per-Diem',
    icon: 'Utensils',
    limitL1L3: 800,
    limitL4L5: 1800,
    limitExecutive: 4500,
    isReceiptMandatory: true,
    description: 'Daily client and tour meals subject to metro / standard slab',
  },
  {
    id: 'CAT-03',
    name: 'Hotel & Lodging',
    icon: 'Hotel',
    limitL1L3: 2500,
    limitL4L5: 5500,
    limitExecutive: 15000,
    isReceiptMandatory: true,
    description: 'Accommodation room tariff and incidental stay receipts',
  },
  {
    id: 'CAT-04',
    name: 'Client Entertainment',
    icon: 'Wine',
    limitL1L3: 1500,
    limitL4L5: 5000,
    limitExecutive: 25000,
    isReceiptMandatory: true,
    description: 'Client dinners, business meeting refreshments & hospitality',
  },
  {
    id: 'CAT-05',
    name: 'Fuel & Mileage Allowance',
    icon: 'Fuel',
    limitL1L3: 3000,
    limitL4L5: 6000,
    limitExecutive: 12000,
    isReceiptMandatory: false,
    description: 'Odometer distance reimbursement @ ₹4.50/km (2W) / ₹9.00/km (4W)',
  },
  {
    id: 'CAT-06',
    name: 'Office & Tech Supplies',
    icon: 'Laptop',
    limitL1L3: 1500,
    limitL4L5: 3500,
    limitExecutive: 8000,
    isReceiptMandatory: true,
    description: 'Stationery, cables, dongles, monitor peripherals',
  },
  {
    id: 'CAT-07',
    name: 'Internet & Mobile Reimbursement',
    icon: 'Wifi',
    limitL1L3: 1000,
    limitL4L5: 2000,
    limitExecutive: 4000,
    isReceiptMandatory: true,
    description: 'Monthly broadband wifi and cellular postpaid phone bills',
  },
]

const INITIAL_POLICY: ExpensePolicy = {
  receiptMandatoryAbove: 500,
  distanceRateTwoWheeler: 4.5,
  distanceRateFourWheeler: 9.0,
  perDiemStandardCity: 800,
  perDiemMetroCity: 1500,
  foreignCurrencies: [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToINR: 1.0 },
    { code: 'USD', name: 'US Dollar', symbol: '$', rateToINR: 84.2 },
    { code: 'EUR', name: 'Euro', symbol: '€', rateToINR: 91.5 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rateToINR: 109.8 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'AED', rateToINR: 22.9 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateToINR: 64.3 },
  ],
}

const INITIAL_LOAN_TYPES: LoanType[] = [
  {
    id: 'LOAN-TYPE-1',
    name: 'Salary Advance (Short Term)',
    interestRate: 0.0,
    maxAmount: 50000,
    maxTenureMonths: 3,
    minServiceMonths: 3,
    description: 'Zero-interest advance recovered in 1 to 3 equal payroll deductions',
    active: true,
  },
  {
    id: 'LOAN-TYPE-2',
    name: 'Emergency Medical Loan',
    interestRate: 2.5,
    maxAmount: 150000,
    maxTenureMonths: 18,
    minServiceMonths: 6,
    description: 'Low-interest assistance for hospitalizations and medical emergencies',
    active: true,
  },
  {
    id: 'LOAN-TYPE-3',
    name: 'Technology & Laptop Advance',
    interestRate: 0.0,
    maxAmount: 80000,
    maxTenureMonths: 12,
    minServiceMonths: 6,
    description: 'Company-subsidized device purchase advance with 12-month EMI recovery',
    active: true,
  },
  {
    id: 'LOAN-TYPE-4',
    name: 'Festival & Annual Advance',
    interestRate: 0.0,
    maxAmount: 25000,
    maxTenureMonths: 6,
    minServiceMonths: 3,
    description: 'Annual festive bonus advance recovered across upcoming salary cycles',
    active: true,
  },
]

const INITIAL_CLAIMS: ExpenseClaim[] = [
  {
    id: 'EXP-101',
    claimNumber: 'EXP-2026-088',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    employeeGrade: 'L4 - Senior',
    department: 'Engineering',
    title: 'Client Onsite Flight & Hotel Workshop',
    date: '2026-10-07',
    totalAmountINR: 14250,
    status: 'Pending Approval',
    hasPolicyViolation: false,
    submittedAt: '2026-10-08 14:00 PM',
    lines: [
      {
        id: 'L-1',
        category: 'Travel & Conveyance',
        date: '2026-10-07',
        description: 'Indigo Flight BLR -> DEL roundtrip',
        currency: 'INR',
        originalAmount: 8400,
        exchangeRate: 1.0,
        amountINR: 8400,
        receiptFileName: 'Indigo_Ticket_BLR_DEL.pdf',
        receiptUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80',
        isOverLimit: false,
        limitForGrade: 7500,
        isDuplicateReceipt: false,
        hasMissingReceiptViolation: false,
      },
      {
        id: 'L-2',
        category: 'Hotel & Lodging',
        date: '2026-10-07',
        description: 'Radisson Blu Aerocity Delhi (1 night)',
        currency: 'INR',
        originalAmount: 4650,
        exchangeRate: 1.0,
        amountINR: 4650,
        receiptFileName: 'Radisson_Folio_9821.pdf',
        receiptUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80',
        isOverLimit: false,
        limitForGrade: 5500,
        isDuplicateReceipt: false,
        hasMissingReceiptViolation: false,
      },
      {
        id: 'L-3',
        category: 'Meals & Per-Diem',
        date: '2026-10-07',
        description: 'Airport & Dinner Meeting Meal',
        currency: 'INR',
        originalAmount: 1200,
        exchangeRate: 1.0,
        amountINR: 1200,
        receiptFileName: 'Airport_Cafe_Bill.jpg',
        receiptUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
        isOverLimit: false,
        limitForGrade: 1800,
        isDuplicateReceipt: false,
        hasMissingReceiptViolation: false,
      },
    ],
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Approval',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'Department Head Endorsement',
        approverName: 'Rohan Joshi',
        approverRole: 'VP Engineering',
        status: 'waiting',
      },
      {
        id: 'STEP-3',
        title: 'Finance Disbursal Audit',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Controller',
        status: 'waiting',
      },
    ],
  },
  {
    id: 'EXP-102',
    claimNumber: 'EXP-2026-089',
    employeeId: 'EMP-018',
    employeeName: 'Hardik Trivedi',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    employeeGrade: 'L3 - Executive',
    department: 'Field Sales',
    title: 'Client Dinner & Odometer Fuel',
    date: '2026-10-08',
    totalAmountINR: 3250,
    status: 'Pending Approval',
    hasPolicyViolation: true,
    violationSummary: 'Over-limit on Meals category: ₹2,400 claimed exceeds L3 cap of ₹800',
    submittedAt: '2026-10-08 19:30 PM',
    lines: [
      {
        id: 'L-1',
        category: 'Meals & Per-Diem',
        date: '2026-10-08',
        description: 'Dinner with Apollo Pharmacy Procurement Head',
        currency: 'INR',
        originalAmount: 2400,
        exchangeRate: 1.0,
        amountINR: 2400,
        receiptFileName: 'Havmor_Restaurant_Bill.jpg',
        receiptUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&auto=format&fit=crop&q=80',
        isOverLimit: true,
        limitForGrade: 800,
        isDuplicateReceipt: false,
        hasMissingReceiptViolation: false,
        violationNote: 'Exceeds Grade L3 Meal limit of ₹800 by ₹1,600',
      },
      {
        id: 'L-2',
        category: 'Fuel & Mileage Allowance',
        date: '2026-10-08',
        description: 'Territory beat travel (188 km @ ₹4.50/km)',
        currency: 'INR',
        originalAmount: 850,
        exchangeRate: 1.0,
        amountINR: 850,
        isOverLimit: false,
        limitForGrade: 3000,
        isDuplicateReceipt: false,
        hasMissingReceiptViolation: false,
      },
    ],
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Review (Over-Limit Flagged)',
        approverName: 'Priya Sharma',
        approverRole: 'Sales Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'Finance Disbursal Audit',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Controller',
        status: 'waiting',
      },
    ],
  },
  {
    id: 'EXP-103',
    claimNumber: 'EXP-2026-072',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    employeeGrade: 'L4 - Senior',
    department: 'Engineering',
    title: 'AWS Summit Pass & Uber Taxi (US Dollars FX)',
    date: '2026-09-22',
    totalAmountINR: 8420,
    status: 'Paid',
    hasPolicyViolation: false,
    submittedAt: '2026-09-23 11:00 AM',
    paymentMode: 'Monthly Payroll Run',
    paymentDate: '2026-09-30',
    paymentRef: 'PAYROLL-SEP26-ADJ-492',
    lines: [
      {
        id: 'L-1',
        category: 'Travel & Conveyance',
        date: '2026-09-22',
        description: 'AWS Developer Day Online Pass ($100 USD @ 84.20)',
        currency: 'USD',
        originalAmount: 100,
        exchangeRate: 84.2,
        amountINR: 8420,
        receiptFileName: 'AWS_Invoice_USD_100.pdf',
        isOverLimit: false,
        limitForGrade: 7500,
        isDuplicateReceipt: false,
        hasMissingReceiptViolation: false,
      },
    ],
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Approval',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'approved',
        timestamp: '2026-09-24 10:15 AM',
        comments: 'Verified skill upgrade event.',
      },
      {
        id: 'STEP-2',
        title: 'Department Head Endorsement',
        approverName: 'Rohan Joshi',
        approverRole: 'VP Engineering',
        status: 'approved',
        timestamp: '2026-09-25 14:00 PM',
      },
      {
        id: 'STEP-3',
        title: 'Finance Disbursal Audit',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Controller',
        status: 'approved',
        timestamp: '2026-09-26 16:30 PM',
        comments: 'Disbursed in September salary credit.',
      },
    ],
  },
]

const INITIAL_LOANS: LoanApplication[] = [
  {
    id: 'LOAN-101',
    applicationNumber: 'LOAN-2026-042',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    employeeGrade: 'L4 - Senior',
    department: 'Engineering',
    loanTypeId: 'LOAN-TYPE-1',
    loanTypeName: 'Salary Advance (Short Term)',
    principalAmount: 45000,
    interestRate: 0.0,
    tenureMonths: 3,
    monthlyEmi: 15000,
    totalRepayment: 45000,
    serviceMonths: 14,
    isEligible: true,
    reason: 'Home renovation deposit and personal contingency advance',
    status: 'Active / Disbursing',
    submittedAt: '2026-09-10 10:00 AM',
    disbursedDate: '2026-09-15',
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Recommendation',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'approved',
        timestamp: '2026-09-11 11:30 AM',
        comments: 'Recommended for 3-month salary advance.',
      },
      {
        id: 'STEP-2',
        title: 'HR Policy & Tenancy Audit',
        approverName: 'Sarah Jenkins',
        approverRole: 'HR Lead',
        status: 'approved',
        timestamp: '2026-09-12 15:00 PM',
        comments: 'Service eligibility (14 mos) and clean credit record verified.',
      },
      {
        id: 'STEP-3',
        title: 'Finance Head Approval',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Head',
        status: 'approved',
        timestamp: '2026-09-14 09:30 AM',
        comments: 'Sanctioned ₹45,000 via NEFT.',
      },
    ],
    recoverySchedule: [
      {
        installmentNo: 1,
        dueDate: 'Sep 2026 Payroll',
        emiAmount: 15000,
        principalComponent: 15000,
        interestComponent: 0,
        balanceAfter: 30000,
        status: 'Recovered',
      },
      {
        installmentNo: 2,
        dueDate: 'Oct 2026 Payroll',
        emiAmount: 15000,
        principalComponent: 15000,
        interestComponent: 0,
        balanceAfter: 15000,
        status: 'Pending',
      },
      {
        installmentNo: 3,
        dueDate: 'Nov 2026 Payroll',
        emiAmount: 15000,
        principalComponent: 15000,
        interestComponent: 0,
        balanceAfter: 0,
        status: 'Upcoming',
      },
    ],
  },
  {
    id: 'LOAN-102',
    applicationNumber: 'LOAN-2026-049',
    employeeId: 'EMP-004',
    employeeName: 'Devika Nair',
    employeeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    employeeGrade: 'L3 - Mid',
    department: 'Engineering',
    loanTypeId: 'LOAN-TYPE-3',
    loanTypeName: 'Technology & Laptop Advance',
    principalAmount: 60000,
    interestRate: 0.0,
    tenureMonths: 12,
    monthlyEmi: 5000,
    totalRepayment: 60000,
    serviceMonths: 18,
    isEligible: true,
    reason: 'Purchase of Apple MacBook Pro for mobile application development',
    status: 'Pending Approval',
    submittedAt: '2026-10-08 16:20 PM',
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Recommendation',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'HR Policy & Tenancy Audit',
        approverName: 'Sarah Jenkins',
        approverRole: 'HR Lead',
        status: 'waiting',
      },
      {
        id: 'STEP-3',
        title: 'Finance Head Approval',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Head',
        status: 'waiting',
      },
    ],
    recoverySchedule: [
      {
        installmentNo: 1,
        dueDate: 'Oct 2026 Payroll',
        emiAmount: 5000,
        principalComponent: 5000,
        interestComponent: 0,
        balanceAfter: 55000,
        status: 'Upcoming',
      },
      {
        installmentNo: 2,
        dueDate: 'Nov 2026 Payroll',
        emiAmount: 5000,
        principalComponent: 5000,
        interestComponent: 0,
        balanceAfter: 50000,
        status: 'Upcoming',
      },
      {
        installmentNo: 3,
        dueDate: 'Dec 2026 Payroll',
        emiAmount: 5000,
        principalComponent: 5000,
        interestComponent: 0,
        balanceAfter: 45000,
        status: 'Upcoming',
      },
    ],
  },
]

const ExpenseFinanceContext = createContext<ExpenseFinanceContextType | undefined>(undefined)

export const ExpenseFinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<ExpenseCategory[]>(INITIAL_CATEGORIES)
  const [policy, setPolicy] = useState<ExpensePolicy>(INITIAL_POLICY)
  const [loanTypes, setLoanTypes] = useState<LoanType[]>(INITIAL_LOAN_TYPES)
  const [claims, setClaims] = useState<ExpenseClaim[]>(INITIAL_CLAIMS)
  const [loans, setLoans] = useState<LoanApplication[]>(INITIAL_LOANS)

  const updateCategory = (id: string, updated: Partial<ExpenseCategory>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)))
  }

  const addCategory = (cat: Omit<ExpenseCategory, 'id'>) => {
    const id = `CAT-${(categories.length + 1).toString().padStart(2, '0')}`
    setCategories((prev) => [...prev, { ...cat, id }])
  }

  const updatePolicy = (updated: Partial<ExpensePolicy>) => {
    setPolicy((prev) => ({ ...prev, ...updated }))
  }

  const updateLoanType = (id: string, updated: Partial<LoanType>) => {
    setLoanTypes((prev) => prev.map((lt) => (lt.id === id ? { ...lt, ...updated } : lt)))
  }

  const addLoanType = (lt: Omit<LoanType, 'id'>) => {
    const id = `LOAN-TYPE-${loanTypes.length + 1}`
    setLoanTypes((prev) => [...prev, { ...lt, id }])
  }

  const calculateEmi = (principal: number, annualInterestRate: number, tenureMonths: number) => {
    if (annualInterestRate === 0) {
      const emi = Math.round(principal / tenureMonths)
      return { emi, totalPayment: principal, totalInterest: 0 }
    }
    const monthlyRate = annualInterestRate / 12 / 100
    const emi = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    )
    const totalPayment = emi * tenureMonths
    const totalInterest = totalPayment - principal
    return { emi, totalPayment, totalInterest }
  }

  const generateSchedule = (
    principal: number,
    annualInterestRate: number,
    tenureMonths: number
  ): LoanRepaymentInstallment[] => {
    const { emi } = calculateEmi(principal, annualInterestRate, tenureMonths)
    const schedule: LoanRepaymentInstallment[] = []
    let balance = principal
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
    const startYear = 2026

    for (let i = 1; i <= tenureMonths; i++) {
      const monthIdx = (9 + i - 1) % 12
      const yearOffset = Math.floor((9 + i - 1) / 12)
      const dueStr = `${months[monthIdx]} ${startYear + yearOffset} Payroll`
      const interestComp = annualInterestRate > 0 ? Math.round((balance * annualInterestRate) / 12 / 100) : 0
      const principalComp = Math.min(balance, emi - interestComp)
      balance = Math.max(0, balance - principalComp)

      schedule.push({
        installmentNo: i,
        dueDate: dueStr,
        emiAmount: emi,
        principalComponent: principalComp,
        interestComponent: interestComp,
        balanceAfter: balance,
        status: i === 1 ? 'Pending' : 'Upcoming',
      })
    }
    return schedule
  }

  const createClaim = (
    claimData: Omit<ExpenseClaim, 'id' | 'claimNumber' | 'status' | 'steps' | 'submittedAt'>
  ): ExpenseClaim => {
    const id = `EXP-${Date.now().toString().slice(-4)}`
    const claimNumber = `EXP-2026-${(claims.length + 101).toString()}`
    const now = new Date()
    const submittedAt = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    // Multi-tier Workflow logic:
    // Expense > 5,000 -> Manager -> Dept Head -> Finance
    // Expense <= 5,000 -> Manager -> Finance
    const isHighValue = claimData.totalAmountINR > 5000
    const steps: ApprovalStep[] = isHighValue
      ? [
          {
            id: 'STEP-1',
            title: 'Manager Approval',
            approverName: 'Vikram Malhotra',
            approverRole: 'Engineering Manager',
            status: 'pending',
          },
          {
            id: 'STEP-2',
            title: 'Department Head Endorsement',
            approverName: 'Rohan Joshi',
            approverRole: 'VP Engineering',
            status: 'waiting',
          },
          {
            id: 'STEP-3',
            title: 'Finance Disbursal Audit',
            approverName: 'Priya Sundaram',
            approverRole: 'Finance Controller',
            status: 'waiting',
          },
        ]
      : [
          {
            id: 'STEP-1',
            title: 'Manager Approval',
            approverName: 'Vikram Malhotra',
            approverRole: 'Engineering Manager',
            status: 'pending',
          },
          {
            id: 'STEP-2',
            title: 'Finance Disbursal Audit',
            approverName: 'Priya Sundaram',
            approverRole: 'Finance Controller',
            status: 'waiting',
          },
        ]

    const newClaim: ExpenseClaim = {
      ...claimData,
      id,
      claimNumber,
      status: 'Pending Approval',
      submittedAt,
      steps,
    }

    setClaims((prev) => [newClaim, ...prev])
    return newClaim
  }

  const approveClaim = (claimId: string, approverRole: string, comments = 'Approved in audit') => {
    const timestamp = new Date().toLocaleString()
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return rIfClaim(c)

        // Find active pending step
        const stepIdx = c.steps.findIndex((s) => s.status === 'pending')
        if (stepIdx === -1) return c

        const updatedSteps = [...c.steps]
        updatedSteps[stepIdx] = {
          ...updatedSteps[stepIdx],
          status: 'approved',
          timestamp,
          comments,
        }

        const isLastStep = stepIdx === updatedSteps.length - 1
        if (!isLastStep) {
          updatedSteps[stepIdx + 1] = {
            ...updatedSteps[stepIdx + 1],
            status: 'pending',
          }
        }

        return {
          ...c,
          steps: updatedSteps,
          status: isLastStep ? 'Approved' : 'Pending Approval',
        }
      })
    )
  }

  const rIfClaim = (c: ExpenseClaim) => c

  const rejectClaim = (claimId: string, approverRole: string, comments = 'Declined during claim review') => {
    const timestamp = new Date().toLocaleString()
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c
        const stepIdx = c.steps.findIndex((s) => s.status === 'pending')
        const updatedSteps = [...c.steps]
        if (stepIdx !== -1) {
          updatedSteps[stepIdx] = {
            ...updatedSteps[stepIdx],
            status: 'rejected',
            timestamp,
            comments,
          }
        }
        return {
          ...c,
          steps: updatedSteps,
          status: 'Rejected',
        }
      })
    )
  }

  const settleClaimsBatch = (
    claimIds: string[],
    paymentMode: 'Monthly Payroll Run' | 'Direct Bank Transfer'
  ) => {
    const today = new Date().toISOString().split('T')[0]
    const batchRef =
      paymentMode === 'Monthly Payroll Run'
        ? `PAYROLL-BATCH-OCT26-${Date.now().toString().slice(-4)}`
        : `NEFT-HDFC-${Date.now().toString().slice(-4)}`

    setClaims((prev) =>
      prev.map((c) => {
        if (claimIds.includes(c.id)) {
          return {
            ...c,
            status: 'Paid',
            paymentMode,
            paymentDate: today,
            paymentRef: batchRef,
          }
        }
        return c
      })
    )

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'Finance Lead',
      action: `Settled ${claimIds.length} Expense Claims via ${paymentMode}`,
      targetType: 'Company',
      targetId: batchRef,
      targetName: `Disbursal Batch (${paymentMode})`,
      featureCode: 'EXPENSE',
      reason: `Batch disbursement of approved employee expense vouchers via ${paymentMode}. Reference: ${batchRef}`,
    })
  }

  const applyForLoan = (
    loanData: Omit<LoanApplication, 'id' | 'applicationNumber' | 'status' | 'steps' | 'submittedAt' | 'recoverySchedule'>
  ): LoanApplication => {
    const id = `LOAN-${Date.now().toString().slice(-4)}`
    const applicationNumber = `LOAN-2026-${(loans.length + 101).toString()}`
    const now = new Date()
    const submittedAt = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    // Loan Workflow Chain: Manager -> HR -> Finance Head
    const steps: ApprovalStep[] = [
      {
        id: 'STEP-1',
        title: 'Manager Recommendation',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'HR Policy & Tenancy Audit',
        approverName: 'Sarah Jenkins',
        approverRole: 'HR Lead',
        status: 'waiting',
      },
      {
        id: 'STEP-3',
        title: 'Finance Head Approval',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Head',
        status: 'waiting',
      },
    ]

    const recoverySchedule = generateSchedule(
      loanData.principalAmount,
      loanData.interestRate,
      loanData.tenureMonths
    )

    const newLoan: LoanApplication = {
      ...loanData,
      id,
      applicationNumber,
      status: 'Pending Approval',
      submittedAt,
      steps,
      recoverySchedule,
    }

    setLoans((prev) => [newLoan, ...prev])
    return newLoan
  }

  const approveLoan = (loanId: string, approverRole: string, comments = 'Approved') => {
    const timestamp = new Date().toLocaleString()
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l
        const stepIdx = l.steps.findIndex((s) => s.status === 'pending')
        if (stepIdx === -1) return l

        const updatedSteps = [...l.steps]
        updatedSteps[stepIdx] = {
          ...updatedSteps[stepIdx],
          status: 'approved',
          timestamp,
          comments,
        }

        const isLastStep = stepIdx === updatedSteps.length - 1
        if (!isLastStep) {
          updatedSteps[stepIdx + 1] = {
            ...updatedSteps[stepIdx + 1],
            status: 'pending',
          }
        }

        return {
          ...l,
          steps: updatedSteps,
          status: isLastStep ? 'Active / Disbursing' : 'Pending Approval',
          disbursedDate: isLastStep ? new Date().toISOString().split('T')[0] : l.disbursedDate,
        }
      })
    )
  }

  const rejectLoan = (loanId: string, approverRole: string, comments = 'Declined loan request') => {
    const timestamp = new Date().toLocaleString()
    setLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l
        const stepIdx = l.steps.findIndex((s) => s.status === 'pending')
        const updatedSteps = [...l.steps]
        if (stepIdx !== -1) {
          updatedSteps[stepIdx] = {
            ...updatedSteps[stepIdx],
            status: 'rejected',
            timestamp,
            comments,
          }
        }
        return {
          ...l,
          steps: updatedSteps,
          status: 'Rejected',
        }
      })
    )
  }

  return (
    <ExpenseFinanceContext.Provider
      value={{
        categories,
        updateCategory,
        addCategory,
        policy,
        updatePolicy,
        loanTypes,
        updateLoanType,
        addLoanType,
        claims,
        createClaim,
        approveClaim,
        rejectClaim,
        settleClaimsBatch,
        loans,
        applyForLoan,
        approveLoan,
        rejectLoan,
        calculateEmi,
        generateSchedule,
      }}
    >
      {children}
    </ExpenseFinanceContext.Provider>
  )
}

export const useExpenseFinance = () => {
  const context = useContext(ExpenseFinanceContext)
  if (!context) {
    throw new Error('useExpenseFinance must be used within an ExpenseFinanceProvider')
  }
  return context
}
