import React, { createContext, useContext, useState } from 'react'
import { AuditLogService } from '@/services/auditLogService'

// -------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------

export type SalaryComponentType = 'Earning' | 'Deduction' | 'Statutory' | 'Reimbursement'
export type CalculationType = 'Flat Amount' | 'Formula' | 'Percentage of Basic' | 'Per-Day Wage' | 'Hourly Rate'
export type PaymentMode = 'Direct Bank Transfer (Salaried)' | 'Daily Wage (Punch-Based)' | 'Contractor Retainer (Invoice + 10% TDS)'

export interface SalaryComponent {
  id: string
  name: string
  code: string // e.g. 'BASIC', 'HRA', 'SPECIAL_ALLW', 'OT_PAY', 'PF_EMP', 'ESI_EMP', 'PT', 'TDS'
  type: SalaryComponentType
  calculationType: CalculationType
  formulaExpression?: string // e.g. "0.40 * BASIC" or "(BASIC / 26 / 8) * 2 * ot_hours"
  isTaxable: boolean
  isPfApplicable: boolean
  isEsiApplicable: boolean
  isActive: boolean
  description: string
}

export interface SalaryStructureItem {
  componentCode: string
  componentName: string
  type: SalaryComponentType
  formulaOrValue: string
  calculatedMonthlyAmount: number
}

export interface SalaryStructure {
  id: string
  name: string
  grade: string // e.g. 'L1-L3 (Associate)', 'L4-L5 (Lead/Manager)', 'Plant Worker', 'Freelance Contractor'
  paymentMode: PaymentMode
  description: string
  items: SalaryStructureItem[]
  baseMonthlyGross: number
  annualCtc: number
}

export interface EmployeeSalaryRecord {
  employeeId: string
  employeeName: string
  employeeAvatar: string
  grade: string
  department: string
  designation: string
  paymentMode: PaymentMode
  structureId: string
  structureName: string
  monthlyGross: number
  annualCtc: number
  dailyRate?: number
  effectiveFrom: string
  previousMonthlyGross?: number
  previousEffectiveFrom?: string
  arrearsEligible: boolean
  calculatedArrearsAmount: number
  bankAccount: {
    bankName: string
    accountNumber: string
    ifscCode: string
    branch: string
  }
}

export interface PayrollInputItem {
  employeeId: string
  employeeName: string
  paymentMode: PaymentMode
  lopDays: number // Loss of Pay days synced from Attendance Register
  payableDays: number
  totalWorkingDays: number
  overtimeHours: number
  overtimeAmount: number
  incentiveCommission: number // From Incentive engine
  claimsReimbursements: number // From Expense claims
  loanEmiRecovery: number // From Finance Loan engine
  loanEmiDeduction?: number // Alias
  manualBonusOrAdjustment: number
  taxRegime: 'New Tax Regime (Sec 115BAC)' | 'Old Tax Regime'
}

export interface PayrollEmployeePayslip {
  id: string
  payslipNumber: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  designation: string
  department: string
  grade: string
  paymentMode: PaymentMode
  month: string // e.g. "October 2026"
  periodCode: string // e.g. "2026-10"
  paidDays: number
  lopDays: number
  totalWorkingDays: number
  // Earnings
  basic: number
  hra: number
  specialAllowance: number
  overtimePay: number
  incentives: number
  reimbursements: number
  arrearsAmount: number
  grossEarnings: number
  // Deductions
  providentFund: number
  employeeStateInsurance: number
  professionalTax: number
  taxDeductedAtSource: number
  loanEmiRecovery: number
  assetDamageRecovery: number
  contractorTds?: number // 10% under Sec 194J
  totalDeductions: number
  // Net
  netSalary: number
  status: 'Draft' | 'Approved' | 'Published'
  bankAccount: {
    bankName: string
    accountNumber: string
    ifscCode: string
  }
}

export interface PayrollRun {
  id: string
  cycleMonth: string // e.g. "October 2026"
  periodCode: string // e.g. "2026-10"
  status: 'Draft' | 'Calculating' | 'Review & Variance' | 'Approved' | 'Locked & Published'
  totalEmployees: number
  totalGrossPayroll: number
  totalDeductions: number
  totalNetPayout: number
  momVariancePct: number // Month-on-Month variance percentage e.g. +4.2%
  exceptionsCount: number
  negativeSalaryCount: number
  lockedAt?: string
  lockedBy?: string
  payslips: PayrollEmployeePayslip[]
  bankBatchRef?: string
}

export interface StatutorySlabItem {
  id: string
  statutoryName: 'Provident Fund (EPF)' | 'Employee State Insurance (ESI)' | 'Professional Tax (PT)' | 'TDS Income Tax' | 'Labour Welfare Fund (LWF)' | 'Gratuity (15/26)' | 'Statutory Bonus (8.33%)'
  description: string
  employeeRate: string
  employerRate: string
  wageCeiling: string
  effectiveDate: string
  status: 'Active' | 'Upcoming Revision'
}

export interface IncentiveSlab {
  id: string
  schemeName: string
  targetAchievementMinPct: number
  targetAchievementMaxPct: number
  commissionPct: number
  description: string
}

export interface EmployeeIncentiveRecord {
  id: string
  employeeId: string
  employeeName: string
  department: string
  period: string
  salesTarget: number
  actualSalesAchieved: number
  achievementPct: number
  calculatedCommission: number
  status: 'Approved for Payroll' | 'Pending Verification'
}

// -------------------------------------------------------------
// CONTEXT INTERFACE
// -------------------------------------------------------------

interface PayrollContextType {
  // Salary Components & Formulas
  components: SalaryComponent[]
  addComponent: (comp: Omit<SalaryComponent, 'id'>) => void
  updateComponent: (id: string, updated: Partial<SalaryComponent>) => void
  evaluateFormula: (expression: string, contextVars: Record<string, number>) => number

  // Salary Structures
  structures: SalaryStructure[]
  addStructure: (structure: Omit<SalaryStructure, 'id'>) => void
  updateStructure: (id: string, updated: Partial<SalaryStructure>) => void

  // Employee Salary Revisions & Arrears
  employeeSalaries: EmployeeSalaryRecord[]
  reviseEmployeeSalary: (data: {
    employeeId: string
    newMonthlyGross: number
    effectiveFrom: string
    reason: string
  }) => void

  // Payroll Inputs
  payrollInputs: PayrollInputItem[]
  updatePayrollInput: (employeeId: string, updated: Partial<PayrollInputItem>) => void

  // Payroll Runs & 5-Step Wizard
  payrollRuns: PayrollRun[]
  activeRun: PayrollRun | null
  setActiveRunId: (runId: string) => void
  startPayrollCalculation: (cycleMonth: string, periodCode: string) => PayrollRun
  approvePayrollRun: (runId: string) => void
  lockAndPublishPayrollRun: (runId: string) => void

  // Statutory Slabs
  statutorySlabs: StatutorySlabItem[]
  updateStatutorySlab: (id: string, updated: Partial<StatutorySlabItem>) => void

  // Incentive Engine
  incentiveSlabs: IncentiveSlab[]
  employeeIncentives: EmployeeIncentiveRecord[]
  calculateIncentive: (target: number, achieved: number) => number

  // Bank Export Generation
  generateBankFileContent: (runId: string) => string
}

// -------------------------------------------------------------
// INITIAL MOCK DATA (India Compliant)
// -------------------------------------------------------------

const INITIAL_COMPONENTS: SalaryComponent[] = [
  {
    id: 'COMP-01',
    name: 'Basic Salary',
    code: 'BASIC',
    type: 'Earning',
    calculationType: 'Percentage of Basic',
    formulaExpression: '0.50 * GROSS',
    isTaxable: true,
    isPfApplicable: true,
    isEsiApplicable: true,
    isActive: true,
    description: 'Core wage component (usually 40-50% of monthly gross salary)',
  },
  {
    id: 'COMP-02',
    name: 'House Rent Allowance (HRA)',
    code: 'HRA',
    type: 'Earning',
    calculationType: 'Formula',
    formulaExpression: '0.50 * BASIC',
    isTaxable: true,
    isPfApplicable: false,
    isEsiApplicable: true,
    isActive: true,
    description: 'HRA computed at 50% of Basic for Metro or 40% for Non-Metro cities',
  },
  {
    id: 'COMP-03',
    name: 'Special Allowance',
    code: 'SPECIAL_ALLW',
    type: 'Earning',
    calculationType: 'Formula',
    formulaExpression: 'GROSS - BASIC - HRA',
    isTaxable: true,
    isPfApplicable: false,
    isEsiApplicable: true,
    isActive: true,
    description: 'Flexible balancing earning component',
  },
  {
    id: 'COMP-04',
    name: 'Overtime Allowance (OT)',
    code: 'OT_PAY',
    type: 'Earning',
    calculationType: 'Formula',
    formulaExpression: '(BASIC / 26 / 8) * 2 * ot_hours',
    isTaxable: true,
    isPfApplicable: false,
    isEsiApplicable: false,
    isActive: true,
    description: 'Double hourly wage multiplier for plant & floor extended shifts',
  },
  {
    id: 'COMP-05',
    name: 'Employee Provident Fund (EPF)',
    code: 'PF_EMP',
    type: 'Deduction',
    calculationType: 'Formula',
    formulaExpression: '0.12 * min(BASIC, 15000)',
    isTaxable: false,
    isPfApplicable: false,
    isEsiApplicable: false,
    isActive: true,
    description: '12% statutory employee deduction subject to ₹15,000 wage ceiling',
  },
  {
    id: 'COMP-06',
    name: 'Employee State Insurance (ESI)',
    code: 'ESI_EMP',
    type: 'Deduction',
    calculationType: 'Formula',
    formulaExpression: 'GROSS <= 21000 ? (0.0075 * GROSS) : 0',
    isTaxable: false,
    isPfApplicable: false,
    isEsiApplicable: false,
    isActive: true,
    description: '0.75% deduction applicable if monthly gross does not exceed ₹21,000',
  },
  {
    id: 'COMP-07',
    name: 'Professional Tax (PT)',
    code: 'PT',
    type: 'Deduction',
    calculationType: 'Flat Amount',
    formulaExpression: '200',
    isTaxable: false,
    isPfApplicable: false,
    isEsiApplicable: false,
    isActive: true,
    description: 'State government statutory deduction (₹200/month flat in Karnataka)',
  },
  {
    id: 'COMP-08',
    name: 'Income Tax (TDS)',
    code: 'TDS',
    type: 'Deduction',
    calculationType: 'Formula',
    formulaExpression: 'TDS_MONTHLY_PROJECTION',
    isTaxable: false,
    isPfApplicable: false,
    isEsiApplicable: false,
    isActive: true,
    description: 'Monthly calculated tax deduction as per selected New/Old Tax Regime',
  },
]

const INITIAL_STRUCTURES: SalaryStructure[] = [
  {
    id: 'STR-01',
    name: 'Engineering & Executive CTC Structure',
    grade: 'L1-L3 (Associate)',
    paymentMode: 'Direct Bank Transfer (Salaried)',
    description: 'Standard IT corporate compensation with EPF, Professional Tax, and Performance Pay',
    baseMonthlyGross: 65000,
    annualCtc: 780000,
    items: [
      { componentCode: 'BASIC', componentName: 'Basic Salary', type: 'Earning', formulaOrValue: '50% of Gross', calculatedMonthlyAmount: 32500 },
      { componentCode: 'HRA', componentName: 'House Rent Allowance', type: 'Earning', formulaOrValue: '50% of Basic', calculatedMonthlyAmount: 16250 },
      { componentCode: 'SPECIAL_ALLW', componentName: 'Special Allowance', type: 'Earning', formulaOrValue: 'Balancing Component', calculatedMonthlyAmount: 16250 },
      { componentCode: 'PF_EMP', componentName: 'Employee Provident Fund', type: 'Deduction', formulaOrValue: '12% of Capped Basic (₹15,000)', calculatedMonthlyAmount: 1800 },
      { componentCode: 'PT', componentName: 'Professional Tax', type: 'Deduction', formulaOrValue: '₹200 Flat', calculatedMonthlyAmount: 200 },
      { componentCode: 'TDS', componentName: 'Income Tax TDS', type: 'Deduction', formulaOrValue: 'Tax Regime Estimate', calculatedMonthlyAmount: 2500 },
    ],
  },
  {
    id: 'STR-02',
    name: 'Plant Floor & Manufacturing Wage Structure',
    grade: 'Plant Worker',
    paymentMode: 'Daily Wage (Punch-Based)',
    description: 'Factory shift compensation with daily rates, ESI medical coverage, and overtime multipliers',
    baseMonthlyGross: 19500,
    annualCtc: 234000,
    items: [
      { componentCode: 'BASIC', componentName: 'Basic Wage', type: 'Earning', formulaOrValue: 'Day rate x 26 days', calculatedMonthlyAmount: 13000 },
      { componentCode: 'HRA', componentName: 'House Rent Allowance', type: 'Earning', formulaOrValue: '40% of Basic', calculatedMonthlyAmount: 5200 },
      { componentCode: 'SPECIAL_ALLW', componentName: 'Shift Allowance', type: 'Earning', formulaOrValue: 'Fixed Shift Aid', calculatedMonthlyAmount: 1300 },
      { componentCode: 'PF_EMP', componentName: 'Employee Provident Fund', type: 'Deduction', formulaOrValue: '12% of Basic', calculatedMonthlyAmount: 1560 },
      { componentCode: 'ESI_EMP', componentName: 'ESI Contribution', type: 'Deduction', formulaOrValue: '0.75% of Gross (< ₹21k)', calculatedMonthlyAmount: 146 },
      { componentCode: 'PT', componentName: 'Professional Tax', type: 'Deduction', formulaOrValue: '₹200 Flat', calculatedMonthlyAmount: 200 },
    ],
  },
  {
    id: 'STR-03',
    name: 'Professional Retainer & Contractor Structure',
    grade: 'Freelance Contractor',
    paymentMode: 'Contractor Retainer (Invoice + 10% TDS)',
    description: 'Invoice-based consultant compensation with flat 10% Section 194J TDS deduction (No PF/ESI)',
    baseMonthlyGross: 90000,
    annualCtc: 1080000,
    items: [
      { componentCode: 'BASIC', componentName: 'Professional Fee / Retainer', type: 'Earning', formulaOrValue: 'Agreed Contract Amount', calculatedMonthlyAmount: 90000 },
      { componentCode: 'TDS', componentName: 'TDS Sec 194J (10% Flat)', type: 'Deduction', formulaOrValue: '10% of Invoice Value', calculatedMonthlyAmount: 9000 },
    ],
  },
]

const INITIAL_EMPLOYEE_SALARIES: EmployeeSalaryRecord[] = [
  {
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    grade: 'L2',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    paymentMode: 'Direct Bank Transfer (Salaried)',
    structureId: 'STR-01',
    structureName: 'Engineering & Executive CTC Structure',
    monthlyGross: 65000,
    annualCtc: 780000,
    effectiveFrom: '2026-04-01',
    previousMonthlyGross: 55000,
    previousEffectiveFrom: '2025-04-01',
    arrearsEligible: false,
    calculatedArrearsAmount: 0,
    bankAccount: {
      bankName: 'HDFC Bank Ltd',
      accountNumber: '50100492819201',
      ifscCode: 'HDFC0001042',
      branch: 'Koramangala, Bangalore',
    },
  },
  {
    employeeId: 'EMP-112',
    employeeName: 'Deepak Patel',
    employeeAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=faces',
    grade: 'Plant Worker',
    department: 'Manufacturing',
    designation: 'Assembly Technician',
    paymentMode: 'Daily Wage (Punch-Based)',
    structureId: 'STR-02',
    structureName: 'Plant Floor & Manufacturing Wage Structure',
    monthlyGross: 19500,
    annualCtc: 234000,
    dailyRate: 750,
    effectiveFrom: '2026-01-01',
    arrearsEligible: false,
    calculatedArrearsAmount: 0,
    bankAccount: {
      bankName: 'State Bank of India',
      accountNumber: '309182390192',
      ifscCode: 'SBIN0004018',
      branch: 'Industrial Estate, Pune',
    },
  },
  {
    employeeId: 'EMP-115',
    employeeName: 'Rohan Mehta',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    grade: 'Consultant',
    department: 'Design',
    designation: 'UI/UX Design Consultant',
    paymentMode: 'Contractor Retainer (Invoice + 10% TDS)',
    structureId: 'STR-03',
    structureName: 'Professional Retainer & Contractor Structure',
    monthlyGross: 90000,
    annualCtc: 1080000,
    effectiveFrom: '2026-06-01',
    arrearsEligible: false,
    calculatedArrearsAmount: 0,
    bankAccount: {
      bankName: 'ICICI Bank',
      accountNumber: '001205019283',
      ifscCode: 'ICIC0000012',
      branch: 'Bandra West, Mumbai',
    },
  },
]

const INITIAL_PAYROLL_INPUTS: PayrollInputItem[] = [
  {
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    paymentMode: 'Direct Bank Transfer (Salaried)',
    lopDays: 0,
    payableDays: 31,
    totalWorkingDays: 31,
    overtimeHours: 0,
    overtimeAmount: 0,
    incentiveCommission: 5000,
    claimsReimbursements: 3500,
    loanEmiRecovery: 2500,
    manualBonusOrAdjustment: 0,
    taxRegime: 'New Tax Regime (Sec 115BAC)',
  },
  {
    employeeId: 'EMP-112',
    employeeName: 'Deepak Patel',
    paymentMode: 'Daily Wage (Punch-Based)',
    lopDays: 2,
    payableDays: 24,
    totalWorkingDays: 26,
    overtimeHours: 14,
    overtimeAmount: 1885,
    incentiveCommission: 1000, // Attendance Bonus
    claimsReimbursements: 0,
    loanEmiRecovery: 0,
    manualBonusOrAdjustment: 0,
    taxRegime: 'New Tax Regime (Sec 115BAC)',
  },
  {
    employeeId: 'EMP-115',
    employeeName: 'Rohan Mehta',
    paymentMode: 'Contractor Retainer (Invoice + 10% TDS)',
    lopDays: 0,
    payableDays: 31,
    totalWorkingDays: 31,
    overtimeHours: 0,
    overtimeAmount: 0,
    incentiveCommission: 0,
    claimsReimbursements: 0,
    loanEmiRecovery: 0,
    manualBonusOrAdjustment: 0,
    taxRegime: 'New Tax Regime (Sec 115BAC)',
  },
]

const INITIAL_PAYROLL_RUNS: PayrollRun[] = [
  {
    id: 'PR-2026-09',
    cycleMonth: 'September 2026',
    periodCode: '2026-09',
    status: 'Locked & Published',
    totalEmployees: 3,
    totalGrossPayroll: 174500,
    totalDeductions: 17746,
    totalNetPayout: 156754,
    momVariancePct: 3.8,
    exceptionsCount: 0,
    negativeSalaryCount: 0,
    lockedAt: '2026-09-30 18:30:00',
    lockedBy: 'Finance Head (Dinesh Kumar)',
    bankBatchRef: 'NEFT-HDFC-20260930-89102',
    payslips: [
      {
        id: 'PS-SEP-104',
        payslipNumber: 'PAY/2026/09/104',
        employeeId: 'EMP-104',
        employeeName: 'Priya Sharma',
        employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
        designation: 'Senior Software Engineer',
        department: 'Engineering',
        grade: 'L2',
        paymentMode: 'Direct Bank Transfer (Salaried)',
        month: 'September 2026',
        periodCode: '2026-09',
        paidDays: 30,
        lopDays: 0,
        totalWorkingDays: 30,
        basic: 32500,
        hra: 16250,
        specialAllowance: 16250,
        overtimePay: 0,
        incentives: 0,
        reimbursements: 2500,
        arrearsAmount: 0,
        grossEarnings: 67500,
        providentFund: 1800,
        employeeStateInsurance: 0,
        professionalTax: 200,
        taxDeductedAtSource: 2500,
        loanEmiRecovery: 2500,
        assetDamageRecovery: 0,
        totalDeductions: 7000,
        netSalary: 60500,
        status: 'Published',
        bankAccount: {
          bankName: 'HDFC Bank Ltd',
          accountNumber: '50100492819201',
          ifscCode: 'HDFC0001042',
        },
      },
    ],
  },
  {
    id: 'PR-2026-10',
    cycleMonth: 'October 2026',
    periodCode: '2026-10',
    status: 'Approved',
    totalEmployees: 3,
    totalGrossPayroll: 180385,
    totalDeductions: 18046,
    totalNetPayout: 162339,
    momVariancePct: 3.4,
    exceptionsCount: 1, // LOP flag on Deepak Patel
    negativeSalaryCount: 0,
    payslips: [
      {
        id: 'PS-OCT-104',
        payslipNumber: 'PAY/2026/10/104',
        employeeId: 'EMP-104',
        employeeName: 'Priya Sharma',
        employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
        designation: 'Senior Software Engineer',
        department: 'Engineering',
        grade: 'L2',
        paymentMode: 'Direct Bank Transfer (Salaried)',
        month: 'October 2026',
        periodCode: '2026-10',
        paidDays: 31,
        lopDays: 0,
        totalWorkingDays: 31,
        basic: 32500,
        hra: 16250,
        specialAllowance: 16250,
        overtimePay: 0,
        incentives: 5000,
        reimbursements: 3500,
        arrearsAmount: 0,
        grossEarnings: 73500,
        providentFund: 1800,
        employeeStateInsurance: 0,
        professionalTax: 200,
        taxDeductedAtSource: 2500,
        loanEmiRecovery: 2500,
        assetDamageRecovery: 0,
        totalDeductions: 7000,
        netSalary: 66500,
        status: 'Approved',
        bankAccount: {
          bankName: 'HDFC Bank Ltd',
          accountNumber: '50100492819201',
          ifscCode: 'HDFC0001042',
        },
      },
      {
        id: 'PS-OCT-112',
        payslipNumber: 'PAY/2026/10/112',
        employeeId: 'EMP-112',
        employeeName: 'Deepak Patel',
        employeeAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=faces',
        designation: 'Assembly Technician',
        department: 'Manufacturing',
        grade: 'Plant Worker',
        paymentMode: 'Daily Wage (Punch-Based)',
        month: 'October 2026',
        periodCode: '2026-10',
        paidDays: 24,
        lopDays: 2,
        totalWorkingDays: 26,
        basic: 12000,
        hra: 4800,
        specialAllowance: 1200,
        overtimePay: 1885,
        incentives: 1000,
        reimbursements: 0,
        arrearsAmount: 0,
        grossEarnings: 20885,
        providentFund: 1440,
        employeeStateInsurance: 156,
        professionalTax: 200,
        taxDeductedAtSource: 0,
        loanEmiRecovery: 0,
        assetDamageRecovery: 0,
        totalDeductions: 1796,
        netSalary: 19089,
        status: 'Approved',
        bankAccount: {
          bankName: 'State Bank of India',
          accountNumber: '309182390192',
          ifscCode: 'SBIN0004018',
        },
      },
      {
        id: 'PS-OCT-115',
        payslipNumber: 'PAY/2026/10/115',
        employeeId: 'EMP-115',
        employeeName: 'Rohan Mehta',
        employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
        designation: 'UI/UX Design Consultant',
        department: 'Design',
        grade: 'Consultant',
        paymentMode: 'Contractor Retainer (Invoice + 10% TDS)',
        month: 'October 2026',
        periodCode: '2026-10',
        paidDays: 31,
        lopDays: 0,
        totalWorkingDays: 31,
        basic: 90000,
        hra: 0,
        specialAllowance: 0,
        overtimePay: 0,
        incentives: 0,
        reimbursements: 0,
        arrearsAmount: 0,
        grossEarnings: 90000,
        providentFund: 0,
        employeeStateInsurance: 0,
        professionalTax: 0,
        taxDeductedAtSource: 0,
        loanEmiRecovery: 0,
        assetDamageRecovery: 0,
        contractorTds: 9000,
        totalDeductions: 9000,
        netSalary: 81000,
        status: 'Approved',
        bankAccount: {
          bankName: 'ICICI Bank',
          accountNumber: '001205019283',
          ifscCode: 'ICIC0000012',
        },
      },
    ],
  },
]

const INITIAL_STATUTORY_SLABS: StatutorySlabItem[] = [
  {
    id: 'STAT-01',
    statutoryName: 'Provident Fund (EPF)',
    description: 'Employees Provident Funds and Miscellaneous Provisions Act, 1952',
    employeeRate: '12% on Basic',
    employerRate: '12% (3.67% EPF + 8.33% EPS)',
    wageCeiling: '₹15,000 / month (or actual if opted)',
    effectiveDate: '2025-04-01',
    status: 'Active',
  },
  {
    id: 'STAT-02',
    statutoryName: 'Employee State Insurance (ESI)',
    description: 'ESI Act, 1948 medical cover for employees with gross <= ₹21,000',
    employeeRate: '0.75% of Gross',
    employerRate: '3.25% of Gross',
    wageCeiling: '₹21,000 / month',
    effectiveDate: '2025-04-01',
    status: 'Active',
  },
  {
    id: 'STAT-03',
    statutoryName: 'Professional Tax (PT)',
    description: 'Karnataka State Tax on Professions, Trades, Callings & Employments Act',
    employeeRate: '₹200 / month flat',
    employerRate: 'N/A',
    wageCeiling: 'Gross > ₹15,000',
    effectiveDate: '2025-04-01',
    status: 'Active',
  },
  {
    id: 'STAT-04',
    statutoryName: 'TDS Income Tax',
    description: 'Section 192 (Salaried) & Section 194J (Contractors/Professionals)',
    employeeRate: 'Slab-based (0% to 30%) or 10% on Contractors',
    employerRate: 'N/A',
    wageCeiling: 'Taxable Income > ₹7,00,000 (New Regime)',
    effectiveDate: '2026-04-01',
    status: 'Active',
  },
  {
    id: 'STAT-05',
    statutoryName: 'Gratuity (15/26)',
    description: 'Payment of Gratuity Act, 1972 (15 days basic per year of service for 5+ years)',
    employeeRate: 'N/A',
    employerRate: '4.81% Provisioning',
    wageCeiling: 'Max ₹20,00,000 tax-free limit',
    effectiveDate: '2025-04-01',
    status: 'Active',
  },
]

const INITIAL_INCENTIVE_SLABS: IncentiveSlab[] = [
  {
    id: 'INC-01',
    schemeName: 'Sales Quarterly Target Booster',
    targetAchievementMinPct: 80,
    targetAchievementMaxPct: 100,
    commissionPct: 3.0,
    description: '3% bonus on qualifying sales for meeting 80% to 100% of volume target',
  },
  {
    id: 'INC-02',
    schemeName: 'Super Achiever Accelerator',
    targetAchievementMinPct: 100,
    targetAchievementMaxPct: 125,
    commissionPct: 5.5,
    description: '5.5% commission on all incremental sales beyond 100% quota',
  },
  {
    id: 'INC-03',
    schemeName: 'President Club Pinnacle Tier',
    targetAchievementMinPct: 125,
    targetAchievementMaxPct: 999,
    commissionPct: 8.0,
    description: '8% top-tier kicker on total achieved volume for >125% quota',
  },
]

const INITIAL_EMPLOYEE_INCENTIVES: EmployeeIncentiveRecord[] = [
  {
    id: 'EINC-01',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    period: 'October 2026',
    salesTarget: 100000,
    actualSalesAchieved: 115000,
    achievementPct: 115,
    calculatedCommission: 5000,
    status: 'Approved for Payroll',
  },
]

// -------------------------------------------------------------
// PROVIDER
// -------------------------------------------------------------

const PayrollContext = createContext<PayrollContextType | undefined>(undefined)

export const PayrollProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<SalaryComponent[]>(INITIAL_COMPONENTS)
  const [structures, setStructures] = useState<SalaryStructure[]>(INITIAL_STRUCTURES)
  const [employeeSalaries, setEmployeeSalaries] = useState<EmployeeSalaryRecord[]>(INITIAL_EMPLOYEE_SALARIES)
  const [payrollInputs, setPayrollInputs] = useState<PayrollInputItem[]>(INITIAL_PAYROLL_INPUTS)
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(INITIAL_PAYROLL_RUNS)
  const [activeRunId, setActiveRunId] = useState<string>('PR-2026-10')
  const [statutorySlabs, setStatutorySlabs] = useState<StatutorySlabItem[]>(INITIAL_STATUTORY_SLABS)
  const [incentiveSlabs, setIncentiveSlabs] = useState<IncentiveSlab[]>(INITIAL_INCENTIVE_SLABS)
  const [employeeIncentives, setEmployeeIncentives] = useState<EmployeeIncentiveRecord[]>(INITIAL_EMPLOYEE_INCENTIVES)

  const activeRun = payrollRuns.find((r) => r.id === activeRunId) || payrollRuns[0]

  // Formula Evaluator Function
  const evaluateFormula = (expression: string, contextVars: Record<string, number>): number => {
    try {
      let expr = expression
      Object.entries(contextVars).forEach(([k, v]) => {
        const regex = new RegExp(`\\b${k}\\b`, 'gi')
        expr = expr.replace(regex, v.toString())
      })
      // Simple safe evaluation of arithmetic
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${expr})`)()
      return typeof result === 'number' && !isNaN(result) ? Math.round(result) : 0
    } catch (e) {
      return 0
    }
  }

  // Component Actions
  const addComponent = (comp: Omit<SalaryComponent, 'id'>) => {
    const newComp: SalaryComponent = {
      id: `COMP-${Date.now().toString().slice(-4)}`,
      ...comp,
    }
    setComponents((prev) => [...prev, newComp])
  }

  const updateComponent = (id: string, updated: Partial<SalaryComponent>) => {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)))
  }

  // Structure Actions
  const addStructure = (struct: Omit<SalaryStructure, 'id'>) => {
    const newStruct: SalaryStructure = {
      id: `STR-${Date.now().toString().slice(-4)}`,
      ...struct,
    }
    setStructures((prev) => [...prev, newStruct])
  }

  const updateStructure = (id: string, updated: Partial<SalaryStructure>) => {
    setStructures((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
  }

  // Salary Revisions with Effective Dating & Arrears
  const reviseEmployeeSalary = (data: {
    employeeId: string
    newMonthlyGross: number
    effectiveFrom: string
    reason: string
  }) => {
    setEmployeeSalaries((prev) =>
      prev.map((rec) => {
        if (rec.employeeId !== data.employeeId) return rec

        // Calculate retrospective arrears (e.g. if effective from past 2 months)
        const oldGross = rec.monthlyGross
        const diff = data.newMonthlyGross - oldGross
        const arrearsMonths = 2 // mock 2 months retrospective
        const arrears = diff > 0 ? diff * arrearsMonths : 0

        return {
          ...rec,
          previousMonthlyGross: oldGross,
          previousEffectiveFrom: rec.effectiveFrom,
          monthlyGross: data.newMonthlyGross,
          annualCtc: data.newMonthlyGross * 12,
          effectiveFrom: data.effectiveFrom,
          arrearsEligible: arrears > 0,
          calculatedArrearsAmount: arrears,
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'REVISE_SALARY',
      targetType: 'Employee',
      targetId: data.employeeId,
      targetName: 'Salary Revision',
      featureCode: 'PAYROLL',
      reason: `Revised monthly gross to ₹${data.newMonthlyGross.toLocaleString('en-IN')}. Effective: ${data.effectiveFrom}. Reason: ${data.reason}`,
    })
  }

  // Update Payroll Inputs
  const updatePayrollInput = (employeeId: string, updated: Partial<PayrollInputItem>) => {
    setPayrollInputs((prev) =>
      prev.map((inp) => (inp.employeeId === employeeId ? { ...inp, ...updated } : inp))
    )
  }

  // 5-Step Run Payroll Wizard Actions
  const startPayrollCalculation = (cycleMonth: string, periodCode: string): PayrollRun => {
    const generatedPayslips: PayrollEmployeePayslip[] = employeeSalaries.map((emp) => {
      const input = payrollInputs.find((i) => i.employeeId === emp.employeeId) || {
        lopDays: 0,
        payableDays: 30,
        totalWorkingDays: 30,
        overtimeHours: 0,
        overtimeAmount: 0,
        incentiveCommission: 0,
        claimsReimbursements: 0,
        loanEmiRecovery: 0,
        manualBonusOrAdjustment: 0,
        taxRegime: 'New Tax Regime (Sec 115BAC)' as const,
      }

      // Pro-rata factor based on LOP
      const totalDays = input.totalWorkingDays || 30
      const paidDays = Math.max(0, totalDays - input.lopDays)
      const proRata = paidDays / totalDays

      // Earnings calculations
      const basic = Math.round(emp.monthlyGross * 0.5 * proRata)
      const hra = emp.paymentMode === 'Contractor Retainer (Invoice + 10% TDS)' ? 0 : Math.round(basic * 0.5)
      const special = emp.paymentMode === 'Contractor Retainer (Invoice + 10% TDS)' ? 0 : Math.round((emp.monthlyGross * proRata) - basic - hra)
      const ot = input.overtimeAmount
      const incentives = input.incentiveCommission
      const claims = input.claimsReimbursements
      const arrears = emp.calculatedArrearsAmount

      const grossEarnings = basic + hra + special + ot + incentives + claims + arrears

      // Deductions calculations
      const isContractor = emp.paymentMode === 'Contractor Retainer (Invoice + 10% TDS)'
      const pf = isContractor ? 0 : Math.round(Math.min(basic, 15000) * 0.12)
      const esi = !isContractor && emp.monthlyGross <= 21000 ? Math.round(grossEarnings * 0.0075) : 0
      const pt = isContractor ? 0 : 200
      const tds = isContractor ? 0 : emp.monthlyGross > 50000 ? 2500 : 0
      const contractorTds = isContractor ? Math.round(grossEarnings * 0.10) : 0
      const loanEmi = input.loanEmiRecovery

      const totalDeductions = pf + esi + pt + tds + (contractorTds || 0) + loanEmi
      const netSalary = grossEarnings - totalDeductions

      return {
        id: `PS-${periodCode}-${emp.employeeId}`,
        payslipNumber: `PAY/${periodCode.replace('-', '/')}/${emp.employeeId}`,
        employeeId: emp.employeeId,
        employeeName: emp.employeeName,
        employeeAvatar: emp.employeeAvatar,
        designation: emp.designation,
        department: emp.department,
        grade: emp.grade,
        paymentMode: emp.paymentMode,
        month: cycleMonth,
        periodCode,
        paidDays,
        lopDays: input.lopDays,
        totalWorkingDays: totalDays,
        basic,
        hra,
        specialAllowance: special,
        overtimePay: ot,
        incentives,
        reimbursements: claims,
        arrearsAmount: arrears,
        grossEarnings,
        providentFund: pf,
        employeeStateInsurance: esi,
        professionalTax: pt,
        taxDeductedAtSource: tds,
        loanEmiRecovery: loanEmi,
        assetDamageRecovery: 0,
        contractorTds: contractorTds || undefined,
        totalDeductions,
        netSalary,
        status: 'Draft',
        bankAccount: emp.bankAccount,
      }
    })

    const totalGross = generatedPayslips.reduce((s, p) => s + p.grossEarnings, 0)
    const totalDeductions = generatedPayslips.reduce((s, p) => s + p.totalDeductions, 0)
    const totalNet = generatedPayslips.reduce((s, p) => s + p.netSalary, 0)

    const newRun: PayrollRun = {
      id: `PR-${periodCode}`,
      cycleMonth,
      periodCode,
      status: 'Review & Variance',
      totalEmployees: generatedPayslips.length,
      totalGrossPayroll: totalGross,
      totalDeductions,
      totalNetPayout: totalNet,
      momVariancePct: 3.4,
      exceptionsCount: generatedPayslips.filter((p) => p.lopDays > 0).length,
      negativeSalaryCount: generatedPayslips.filter((p) => p.netSalary < 0).length,
      payslips: generatedPayslips,
    }

    setPayrollRuns((prev) => [newRun, ...prev.filter((r) => r.id !== newRun.id)])
    setActiveRunId(newRun.id)

    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'CALCULATE_PAYROLL',
      targetType: 'Policy',
      targetId: newRun.id,
      targetName: cycleMonth,
      featureCode: 'PAYROLL',
      reason: `Executed payroll calculation engine for ${cycleMonth} with ${generatedPayslips.length} employee payslips`,
    })

    return newRun
  }

  const approvePayrollRun = (runId: string) => {
    setPayrollRuns((prev) =>
      prev.map((r) => {
        if (r.id !== runId) return r
        return {
          ...r,
          status: 'Approved',
          payslips: r.payslips.map((p) => ({ ...p, status: 'Approved' })),
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'Finance Head',
      actorRole: 'Finance',
      action: 'APPROVE_PAYROLL',
      targetType: 'Policy',
      targetId: runId,
      targetName: 'Payroll Approved',
      featureCode: 'PAYROLL',
      reason: 'Payroll cycle reviewed and approved for statutory compliance & disbursement',
    })
  }

  const lockAndPublishPayrollRun = (runId: string) => {
    const batchRef = `NEFT-BULK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

    setPayrollRuns((prev) =>
      prev.map((r) => {
        if (r.id !== runId) return r
        return {
          ...r,
          status: 'Locked & Published',
          lockedAt: new Date().toLocaleString(),
          lockedBy: 'Finance Head (Dinesh Kumar)',
          bankBatchRef: batchRef,
          payslips: r.payslips.map((p) => ({ ...p, status: 'Published' })),
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'Finance Head',
      actorRole: 'Finance',
      action: 'LOCK_AND_PUBLISH_PAYROLL',
      targetType: 'Policy',
      targetId: runId,
      targetName: batchRef,
      featureCode: 'PAYROLL',
      reason: `Locked payroll cycle and published employee payslips to ESS portal. Generated bank batch ${batchRef}`,
    })
  }

  // Statutory Slabs
  const updateStatutorySlab = (id: string, updated: Partial<StatutorySlabItem>) => {
    setStatutorySlabs((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)))
  }

  // Incentive Calculation
  const calculateIncentive = (target: number, achieved: number): number => {
    if (target <= 0) return 0
    const pct = (achieved / target) * 100
    const slab = incentiveSlabs.find(
      (s) => pct >= s.targetAchievementMinPct && pct < s.targetAchievementMaxPct
    )
    if (!slab) return 0
    return Math.round((achieved * slab.commissionPct) / 100)
  }

  // Bank NEFT/RTGS Batch File Generator
  const generateBankFileContent = (runId: string): string => {
    const targetRun = payrollRuns.find((r) => r.id === runId) || activeRun
    if (!targetRun) return ''

    const headers = 'Transaction_Type,Beneficiary_Account_No,Beneficiary_IFSC,Beneficiary_Name,Amount_INR,Payment_Reference,Narrative\n'
    const rows = targetRun.payslips
      .map((p) => {
        return `NEFT,${p.bankAccount.accountNumber},${p.bankAccount.ifscCode},"${p.employeeName}",${p.netSalary},${p.payslipNumber},"Salary for ${p.month}"`
      })
      .join('\n')

    return headers + rows
  }

  return (
    <PayrollContext.Provider
      value={{
        components,
        addComponent,
        updateComponent,
        evaluateFormula,
        structures,
        addStructure,
        updateStructure,
        employeeSalaries,
        reviseEmployeeSalary,
        payrollInputs,
        updatePayrollInput,
        payrollRuns,
        activeRun,
        setActiveRunId,
        startPayrollCalculation,
        approvePayrollRun,
        lockAndPublishPayrollRun,
        statutorySlabs,
        updateStatutorySlab,
        incentiveSlabs,
        employeeIncentives,
        calculateIncentive,
        generateBankFileContent,
      }}
    >
      {children}
    </PayrollContext.Provider>
  )
}

export const usePayroll = () => {
  const context = useContext(PayrollContext)
  if (!context) {
    throw new Error('usePayroll must be used within a PayrollProvider')
  }
  return context
}
