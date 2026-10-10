import { MOCK_EMPLOYEES } from './employees'

export interface LeaveTypeDefinition {
  id: string
  code: string
  name: string
  description: string
  isPaid: boolean
  accrualRule: 'Monthly' | 'Quarterly' | 'Annual Upfront' | 'Pro-rata on Joining'
  accrualRateDays: number // e.g. 1.5 days per month
  maxCarryForwardDays: number
  carryForwardExpiryMonths: number // e.g. 3 months into new year
  isEncashable: boolean
  encashmentMaxDaysPerYear?: number
  maxBalanceCap: number // e.g. 45 days ceiling
  genderApplicability: 'All' | 'Female Only' | 'Male Only'
  documentRequiredAfterDays: number // 0 = not required, 2 = required if > 2 days
  color: string
  isActive: boolean
}

export interface LeavePolicyBundle {
  id: string
  code: string
  name: string
  description: string
  quotas: {
    leaveTypeId: string
    leaveTypeCode: string
    annualQuota: number
  }[]
  appliesToType: 'Company' | 'Branch' | 'Department' | 'Profile' | 'Employee'
  appliesToTarget: string
  effectiveFrom: string
  assignedEmployeeCount: number
  status: 'Active' | 'Draft' | 'Archived'
}

export interface LeaveLedgerEntry {
  id: string
  timestamp: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  leaveTypeCode: string
  transactionType: 'Credit (Accrual)' | 'Debit (Availed)' | 'Admin Adjustment' | 'Lapsed' | 'Encashment'
  daysDelta: number // positive or negative
  closingBalance: number
  reason: string
  adjustedBy: string
}

export interface HolidayEntry {
  id: string
  name: string
  date: string // YYYY-MM-DD
  dayOfWeek: string
  type: 'Mandatory' | 'Optional / Restricted'
  description?: string
}

export interface HolidayProfile {
  id: string
  name: string
  stateOrRegion: string
  applicableBranches: string[]
  year: number
  holidays: HolidayEntry[]
  totalMandatory: number
  totalOptional: number
  maxOptionalAllowedPerEmployee: number
}

export interface TeamLeaveEvent {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  branch: string
  leaveTypeCode: string
  startDate: string
  endDate: string
  daysCount: number
  status: 'Approved' | 'Pending'
}

export interface CompOffRequest {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  branch: string
  workedDate: string
  dutyDescription: string
  workedHours: number
  creditedDays: number
  earnedDate: string
  expiryDate: string
  status: 'Pending' | 'Approved' | 'Rejected' | 'Availed' | 'Expired'
}

export interface LeaveEncashmentRequest {
  id: string
  employeeId: string
  employeeName: string
  avatar: string
  department: string
  branch: string
  leaveTypeCode: string
  availableBalance: number
  requestedDays: number
  perDaySalaryRate: number
  grossPayout: number
  taxDeduction: number
  netPayout: number
  submittedAt: string
  status: 'Pending' | 'Approved' | 'Processed to Payroll' | 'Rejected'
  remarks?: string
}

// Workflow Step definition
export interface WorkflowStepRule {
  id: string
  title: string
  approverType: 'reporting_manager' | 'skip_level' | 'dept_head' | 'hr' | 'role' | 'person' | 'group'
  approverTargetName?: string // e.g. "Finance Head" or specific person name
  executionMode: 'sequential' | 'parallel'
  consensusRule: 'anyone' | 'all' | 'majority'
  slaHours: number
  escalationTarget: string
  fallbackApprover: string
  timeoutAction: 'auto_approve' | 'auto_reject' | 'escalate'
}

export interface CustomWorkflowDefinition {
  id: string
  requestType: 'Leave' | 'Expense' | 'Overtime' | 'Regularization' | 'Loan/Advance' | 'Resignation' | 'Profile Change'
  name: string
  description: string
  conditions: {
    minDays?: number
    minAmount?: number
    branch?: string
    profile?: string
  }
  steps: WorkflowStepRule[]
  isActive: boolean
  version: number
  lastUpdatedAt: string
}

export interface NotificationTemplate {
  id: string
  event: 'leave_applied' | 'leave_approved' | 'leave_rejected' | 'sla_warning' | 'comp_off_granted' | 'encashment_approved'
  eventName: string
  channel: 'In-App' | 'Email' | 'SMS' | 'WhatsApp'
  language: 'English' | 'Hindi'
  subject?: string
  templateBody: string
  isActive: boolean
  availableMergeFields: string[]
}

// 1. Initial Leave Types
export const INITIAL_LEAVE_TYPES: LeaveTypeDefinition[] = [
  {
    id: 'LT-01',
    code: 'CL',
    name: 'Casual Leave',
    description: 'Short unplanned personal leave for personal errands or short emergencies.',
    isPaid: true,
    accrualRule: 'Monthly',
    accrualRateDays: 1.0,
    maxCarryForwardDays: 0, // resets annually
    carryForwardExpiryMonths: 0,
    isEncashable: false,
    maxBalanceCap: 12,
    genderApplicability: 'All',
    documentRequiredAfterDays: 0,
    color: '#3B82F6',
    isActive: true,
  },
  {
    id: 'LT-02',
    code: 'EL',
    name: 'Earned / Privilege Leave',
    description: 'Planned vacation leave accumulated based on active duty working days.',
    isPaid: true,
    accrualRule: 'Monthly',
    accrualRateDays: 1.5,
    maxCarryForwardDays: 30,
    carryForwardExpiryMonths: 36,
    isEncashable: true,
    encashmentMaxDaysPerYear: 15,
    maxBalanceCap: 45,
    genderApplicability: 'All',
    documentRequiredAfterDays: 0,
    color: '#10B981',
    isActive: true,
  },
  {
    id: 'LT-03',
    code: 'SL',
    name: 'Sick / Medical Leave',
    description: 'Medical health leave for illness, surgery, or health recuperation.',
    isPaid: true,
    accrualRule: 'Annual Upfront',
    accrualRateDays: 10,
    maxCarryForwardDays: 10,
    carryForwardExpiryMonths: 12,
    isEncashable: false,
    maxBalanceCap: 20,
    genderApplicability: 'All',
    documentRequiredAfterDays: 2, // Medical certificate mandatory > 2 days
    color: '#F59E0B',
    isActive: true,
  },
  {
    id: 'LT-04',
    code: 'ML',
    name: 'Maternity Leave',
    description: 'Statutory maternity leave under Maternity Benefit Act (26 weeks paid).',
    isPaid: true,
    accrualRule: 'Annual Upfront',
    accrualRateDays: 182,
    maxCarryForwardDays: 0,
    carryForwardExpiryMonths: 0,
    isEncashable: false,
    maxBalanceCap: 182,
    genderApplicability: 'Female Only',
    documentRequiredAfterDays: 1,
    color: '#EC4899',
    isActive: true,
  },
  {
    id: 'LT-05',
    code: 'PL',
    name: 'Paternity Leave',
    description: 'Paid parental leave granted to biological/adoptive fathers upon childbirth.',
    isPaid: true,
    accrualRule: 'Annual Upfront',
    accrualRateDays: 10,
    maxCarryForwardDays: 0,
    carryForwardExpiryMonths: 6,
    isEncashable: false,
    maxBalanceCap: 10,
    genderApplicability: 'Male Only',
    documentRequiredAfterDays: 1,
    color: '#6366F1',
    isActive: true,
  },
  {
    id: 'LT-06',
    code: 'LWP',
    name: 'Leave Without Pay (Unpaid)',
    description: 'Authorized absence without salary compensation after exhausting all quotas.',
    isPaid: false,
    accrualRule: 'Pro-rata on Joining',
    accrualRateDays: 0,
    maxCarryForwardDays: 0,
    carryForwardExpiryMonths: 0,
    isEncashable: false,
    maxBalanceCap: 90,
    genderApplicability: 'All',
    documentRequiredAfterDays: 3,
    color: '#64748B',
    isActive: true,
  },
]

// 2. Initial Leave Policies (Bundles)
export const INITIAL_LEAVE_POLICIES: LeavePolicyBundle[] = [
  {
    id: 'LP-001',
    code: 'CORP-STD-2026',
    name: 'Corporate HQ Standard Leave Policy',
    description: 'White-collar office staff policy with 12 CL, 18 EL, and 10 SL.',
    quotas: [
      { leaveTypeId: 'LT-01', leaveTypeCode: 'CL', annualQuota: 12 },
      { leaveTypeId: 'LT-02', leaveTypeCode: 'EL', annualQuota: 18 },
      { leaveTypeId: 'LT-03', leaveTypeCode: 'SL', annualQuota: 10 },
      { leaveTypeId: 'LT-04', leaveTypeCode: 'ML', annualQuota: 182 },
      { leaveTypeId: 'LT-05', leaveTypeCode: 'PL', annualQuota: 10 },
    ],
    appliesToType: 'Company',
    appliesToTarget: 'Apex Global Corp',
    effectiveFrom: '2026-01-01',
    assignedEmployeeCount: 28,
    status: 'Active',
  },
  {
    id: 'LP-002',
    code: 'PLANT-MFG-2026',
    name: 'Manufacturing & Plant Operations Bundle',
    description: 'Tailored for factory shift staff with higher encashment and assembly coverage.',
    quotas: [
      { leaveTypeId: 'LT-01', leaveTypeCode: 'CL', annualQuota: 8 },
      { leaveTypeId: 'LT-02', leaveTypeCode: 'EL', annualQuota: 15 },
      { leaveTypeId: 'LT-03', leaveTypeCode: 'SL', annualQuota: 8 },
      { leaveTypeId: 'LT-06', leaveTypeCode: 'LWP', annualQuota: 30 },
    ],
    appliesToType: 'Branch',
    appliesToTarget: 'Pune Plant',
    effectiveFrom: '2026-01-01',
    assignedEmployeeCount: 16,
    status: 'Active',
  },
  {
    id: 'LP-003',
    code: 'SALES-MOB-2026',
    name: 'Field Sales & Business Development Policy',
    description: 'Higher casual flexibility for field client travel schedules.',
    quotas: [
      { leaveTypeId: 'LT-01', leaveTypeCode: 'CL', annualQuota: 14 },
      { leaveTypeId: 'LT-02', leaveTypeCode: 'EL', annualQuota: 16 },
      { leaveTypeId: 'LT-03', leaveTypeCode: 'SL', annualQuota: 10 },
    ],
    appliesToType: 'Department',
    appliesToTarget: 'Sales',
    effectiveFrom: '2026-03-01',
    assignedEmployeeCount: 8,
    status: 'Active',
  },
]

// 3. Initial Leave Ledger
export const INITIAL_LEAVE_LEDGER: LeaveLedgerEntry[] = [
  {
    id: 'LL-01',
    timestamp: '2026-10-08 11:30 AM',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    leaveTypeCode: 'CL',
    transactionType: 'Debit (Availed)',
    daysDelta: -1.0,
    closingBalance: 7.0,
    reason: 'Approved leave request for personal errand on 2026-10-07',
    adjustedBy: 'Vikram Malhotra (Manager)',
  },
  {
    id: 'LL-02',
    timestamp: '2026-10-01 00:00 AM',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    leaveTypeCode: 'EL',
    transactionType: 'Credit (Accrual)',
    daysDelta: 1.5,
    closingBalance: 16.5,
    reason: 'Monthly automated accrual for September duty',
    adjustedBy: 'System Payroll Engine',
  },
  {
    id: 'LL-03',
    timestamp: '2026-09-24 16:45 PM',
    employeeId: 'EMP-002',
    employeeName: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Engineering',
    leaveTypeCode: 'EL',
    transactionType: 'Admin Adjustment',
    daysDelta: 2.0,
    closingBalance: 24.0,
    reason: 'Compensation credit granted for release sprint weekend overtime',
    adjustedBy: 'Sarah Jenkins (HR Lead)',
  },
  {
    id: 'LL-04',
    timestamp: '2026-09-15 14:10 PM',
    employeeId: 'EMP-006',
    employeeName: 'Sneha Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    department: 'Manufacturing',
    leaveTypeCode: 'EL',
    transactionType: 'Encashment',
    daysDelta: -5.0,
    closingBalance: 12.0,
    reason: 'Pre-Diwali encashment payout processed via payroll batch',
    adjustedBy: 'Finance Operations',
  },
]

// 4. Initial Holiday Profiles
export const INITIAL_HOLIDAY_PROFILES: HolidayProfile[] = [
  {
    id: 'HP-KAR-2026',
    name: 'Karnataka State Holiday List 2026',
    stateOrRegion: 'Karnataka',
    applicableBranches: ['Bengaluru HQ'],
    year: 2026,
    totalMandatory: 11,
    totalOptional: 3,
    maxOptionalAllowedPerEmployee: 2,
    holidays: [
      { id: 'H-01', name: 'New Year Day', date: '2026-01-01', dayOfWeek: 'Thursday', type: 'Mandatory', description: 'Global holiday' },
      { id: 'H-02', name: 'Republic Day', date: '2026-01-26', dayOfWeek: 'Monday', type: 'Mandatory', description: 'National flag hoisting' },
      { id: 'H-03', name: 'Ugadi / Gudi Padwa', date: '2026-03-20', dayOfWeek: 'Friday', type: 'Mandatory', description: 'Regional New Year' },
      { id: 'H-04', name: 'May Day (Labour Day)', date: '2026-05-01', dayOfWeek: 'Friday', type: 'Mandatory' },
      { id: 'H-05', name: 'Independence Day', date: '2026-08-15', dayOfWeek: 'Saturday', type: 'Mandatory' },
      { id: 'H-06', name: 'Gandhi Jayanti', date: '2026-10-02', dayOfWeek: 'Friday', type: 'Mandatory' },
      { id: 'H-07', name: 'Dussehra / Vijayadashami', date: '2026-10-20', dayOfWeek: 'Tuesday', type: 'Mandatory' },
      { id: 'H-08', name: 'Kannada Rajyotsava', date: '2026-11-01', dayOfWeek: 'Sunday', type: 'Mandatory', description: 'Statehood day' },
      { id: 'H-09', name: 'Deepavali', date: '2026-11-08', dayOfWeek: 'Sunday', type: 'Mandatory' },
      { id: 'H-10', name: 'Christmas', date: '2026-12-25', dayOfWeek: 'Friday', type: 'Mandatory' },
      { id: 'H-11', name: 'Makar Sankranti', date: '2026-01-14', dayOfWeek: 'Wednesday', type: 'Optional / Restricted', description: 'Harvest festival' },
      { id: 'H-12', name: 'Maha Shivratri', date: '2026-02-15', dayOfWeek: 'Sunday', type: 'Optional / Restricted' },
      { id: 'H-13', name: 'Guru Nanak Jayanti', date: '2026-11-24', dayOfWeek: 'Tuesday', type: 'Optional / Restricted' },
    ],
  },
  {
    id: 'HP-MAH-2026',
    name: 'Maharashtra State & Factory Schedule 2026',
    stateOrRegion: 'Maharashtra',
    applicableBranches: ['Mumbai Hub', 'Pune Plant'],
    year: 2026,
    totalMandatory: 12,
    totalOptional: 2,
    maxOptionalAllowedPerEmployee: 1,
    holidays: [
      { id: 'H-21', name: 'Republic Day', date: '2026-01-26', dayOfWeek: 'Monday', type: 'Mandatory' },
      { id: 'H-22', name: 'Chhatrapati Shivaji Maharaj Jayanti', date: '2026-02-19', dayOfWeek: 'Thursday', type: 'Mandatory' },
      { id: 'H-23', name: 'Maharashtra Day', date: '2026-05-01', dayOfWeek: 'Friday', type: 'Mandatory' },
      { id: 'H-24', name: 'Ganesh Chaturthi', date: '2026-09-14', dayOfWeek: 'Monday', type: 'Mandatory' },
      { id: 'H-25', name: 'Gandhi Jayanti', date: '2026-10-02', dayOfWeek: 'Friday', type: 'Mandatory' },
      { id: 'H-26', name: 'Diwali Balipratipada', date: '2026-11-10', dayOfWeek: 'Tuesday', type: 'Mandatory' },
    ],
  },
]

// 5. Team Leave Calendar Events (who is off when)
export const INITIAL_LEAVE_CALENDAR_EVENTS: TeamLeaveEvent[] = [
  {
    id: 'EVT-01',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    leaveTypeCode: 'EL',
    startDate: '2026-10-14',
    endDate: '2026-10-21',
    daysCount: 6,
    status: 'Pending',
  },
  {
    id: 'EVT-02',
    employeeId: 'EMP-007',
    employeeName: 'Kavita Menon',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    department: 'Finance',
    branch: 'Bengaluru HQ',
    leaveTypeCode: 'SL',
    startDate: '2026-10-08',
    endDate: '2026-10-10',
    daysCount: 3,
    status: 'Approved',
  },
  {
    id: 'EVT-03',
    employeeId: 'EMP-004',
    employeeName: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    department: 'Marketing',
    branch: 'Mumbai Hub',
    leaveTypeCode: 'CL',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    daysCount: 2,
    status: 'Approved',
  },
  {
    id: 'EVT-04',
    employeeId: 'EMP-012',
    employeeName: 'Manish Kumar',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    leaveTypeCode: 'EL',
    startDate: '2026-10-16',
    endDate: '2026-10-20',
    daysCount: 4,
    status: 'Approved',
  },
  {
    id: 'EVT-05',
    employeeId: 'EMP-015',
    employeeName: 'Deepak Joshi',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    leaveTypeCode: 'CL',
    startDate: '2026-10-18',
    endDate: '2026-10-19',
    daysCount: 2,
    status: 'Approved',
  },
]

// 6. Initial Comp-off & Encashment records
export const INITIAL_COMPOFF_REQUESTS: CompOffRequest[] = [
  {
    id: 'CO-01',
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    workedDate: '2026-10-04 (Sunday)',
    dutyDescription: 'Emergency AWS Cloud database failover migration & performance testing.',
    workedHours: 8.5,
    creditedDays: 1.0,
    earnedDate: '2026-10-05',
    expiryDate: '2026-12-04 (60 days validity)',
    status: 'Approved',
  },
  {
    id: 'CO-02',
    employeeId: 'EMP-006',
    employeeName: 'Sneha Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    department: 'Manufacturing',
    branch: 'Pune Plant',
    workedDate: '2026-10-02 (Gandhi Jayanti Holiday)',
    dutyDescription: 'Supervised urgent client export batch packaging and truck dispatch.',
    workedHours: 9.0,
    creditedDays: 1.0,
    earnedDate: '2026-10-03',
    expiryDate: '2026-12-02',
    status: 'Pending',
  },
]

export const INITIAL_ENCASHMENT_REQUESTS: LeaveEncashmentRequest[] = [
  {
    id: 'ENC-01',
    employeeId: 'EMP-002',
    employeeName: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    department: 'Engineering',
    branch: 'Bengaluru HQ',
    leaveTypeCode: 'EL',
    availableBalance: 24,
    requestedDays: 8,
    perDaySalaryRate: 6450,
    grossPayout: 51600,
    taxDeduction: 10320,
    netPayout: 41280,
    submittedAt: '2026-10-07 15:30 PM',
    status: 'Pending',
    remarks: 'Pre-festival encashment payout request.',
  },
  {
    id: 'ENC-02',
    employeeId: 'EMP-005',
    employeeName: 'Rohan Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    department: 'Sales',
    branch: 'Mumbai Hub',
    leaveTypeCode: 'EL',
    availableBalance: 18,
    requestedDays: 5,
    perDaySalaryRate: 4800,
    grossPayout: 24000,
    taxDeduction: 4800,
    netPayout: 19200,
    submittedAt: '2026-09-28 10:15 AM',
    status: 'Approved',
    remarks: 'Approved by Branch Head; queued for Oct salary payroll.',
  },
]

// 7. Initial Custom Workflow Definitions
export const INITIAL_WORKFLOW_DEFINITIONS: CustomWorkflowDefinition[] = [
  {
    id: 'WF-DEF-LEAVE',
    requestType: 'Leave',
    name: 'Dynamic Leave Approval Matrix',
    description: 'Casual <= 2 days goes to Manager. Leave > 5 days escalates to Manager then HR.',
    conditions: { minDays: 5 },
    steps: [
      {
        id: 'WS-1',
        title: 'Direct Reporting Manager',
        approverType: 'reporting_manager',
        executionMode: 'sequential',
        consensusRule: 'anyone',
        slaHours: 24,
        escalationTarget: 'Skip-level Head',
        fallbackApprover: 'People Operations / HR',
        timeoutAction: 'escalate',
      },
      {
        id: 'WS-2',
        title: 'People Operations (Central HR)',
        approverType: 'hr',
        approverTargetName: 'Sarah Jenkins',
        executionMode: 'sequential',
        consensusRule: 'anyone',
        slaHours: 48,
        escalationTarget: 'VP HR',
        fallbackApprover: 'Executive Director',
        timeoutAction: 'auto_approve',
      },
    ],
    isActive: true,
    version: 3,
    lastUpdatedAt: '2026-10-08 17:00 PM',
  },
  {
    id: 'WF-DEF-EXPENSE',
    requestType: 'Expense',
    name: 'High-Value Financial Claims Workflow',
    description: 'Expenses > ₹5,000 require Manager, Dept Head, and Finance clearance.',
    conditions: { minAmount: 5000 },
    steps: [
      {
        id: 'WS-EXP-1',
        title: 'Reporting Manager Review',
        approverType: 'reporting_manager',
        executionMode: 'sequential',
        consensusRule: 'anyone',
        slaHours: 24,
        escalationTarget: 'Finance Controller',
        fallbackApprover: 'Finance Desk',
        timeoutAction: 'escalate',
      },
      {
        id: 'WS-EXP-2',
        title: 'Department Head Approval',
        approverType: 'dept_head',
        executionMode: 'sequential',
        consensusRule: 'anyone',
        slaHours: 24,
        escalationTarget: 'VP Finance',
        fallbackApprover: 'HR Lead',
        timeoutAction: 'escalate',
      },
      {
        id: 'WS-EXP-3',
        title: 'Finance & Treasury Disbursement',
        approverType: 'group',
        approverTargetName: 'Finance Disbursement Committee',
        executionMode: 'parallel',
        consensusRule: 'majority',
        slaHours: 48,
        escalationTarget: 'Chief Financial Officer',
        fallbackApprover: 'Payroll Lead',
        timeoutAction: 'auto_reject',
      },
    ],
    isActive: true,
    version: 2,
    lastUpdatedAt: '2026-10-05 11:20 AM',
  },
  {
    id: 'WF-DEF-LOAN',
    requestType: 'Loan/Advance',
    name: 'Salary Advance & Employee Loan Protocol',
    description: 'Multi-stage verification: Line Manager -> HR Operations -> Finance Head.',
    conditions: { minAmount: 20000 },
    steps: [
      {
        id: 'WS-LN-1',
        title: 'Manager Recommendation',
        approverType: 'reporting_manager',
        executionMode: 'sequential',
        consensusRule: 'anyone',
        slaHours: 24,
        escalationTarget: 'HR Lead',
        fallbackApprover: 'HR Lead',
        timeoutAction: 'escalate',
      },
      {
        id: 'WS-LN-2',
        title: 'HR Eligibility & Background Check',
        approverType: 'hr',
        executionMode: 'sequential',
        consensusRule: 'anyone',
        slaHours: 48,
        escalationTarget: 'Director',
        fallbackApprover: 'Finance Head',
        timeoutAction: 'auto_reject',
      },
      {
        id: 'WS-LN-3',
        title: 'Finance Head Authorization',
        approverType: 'person',
        approverTargetName: 'Ramesh Sundaram (Finance VP)',
        executionMode: 'sequential',
        consensusRule: 'anyone',
        slaHours: 48,
        escalationTarget: 'CFO',
        fallbackApprover: 'Managing Director',
        timeoutAction: 'auto_reject',
      },
    ],
    isActive: true,
    version: 1,
    lastUpdatedAt: '2026-09-30 14:00 PM',
  },
]

// 8. Notification Templates
export const INITIAL_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'NOTIF-01',
    event: 'leave_applied',
    eventName: 'Leave Request Raised by Staff',
    channel: 'In-App',
    language: 'English',
    subject: 'New Leave Request: {{employee_name}}',
    templateBody: '{{employee_name}} has applied for {{days_count}} days of {{leave_type}} from {{start_date}} to {{end_date}}. Reason: "{{reason}}". Click here to review.',
    isActive: true,
    availableMergeFields: ['employee_name', 'leave_type', 'days_count', 'start_date', 'end_date', 'reason', 'approver_name'],
  },
  {
    id: 'NOTIF-02',
    event: 'leave_approved',
    eventName: 'Leave Request Approved',
    channel: 'Email',
    language: 'English',
    subject: 'Your {{leave_type}} Request has been Approved',
    templateBody: 'Hello {{employee_name}},\n\nYour application for {{days_count}} days of {{leave_type}} ({{start_date}} - {{end_date}}) has been approved by {{approver_name}}.\n\nYour updated leave balance is reflected in the employee self-service portal.\n\nWarm regards,\nPeople Operations Team',
    isActive: true,
    availableMergeFields: ['employee_name', 'leave_type', 'days_count', 'start_date', 'end_date', 'approver_name', 'closing_balance'],
  },
  {
    id: 'NOTIF-03',
    event: 'sla_warning',
    eventName: 'SLA Escalation Warning Notice',
    channel: 'WhatsApp',
    language: 'English',
    templateBody: 'URGENT: A pending {{request_type}} from {{employee_name}} has exceeded {{sla_hours}} hours SLA. Please approve or decline immediately to prevent auto-escalation to your department head.',
    isActive: true,
    availableMergeFields: ['employee_name', 'request_type', 'sla_hours', 'approver_name', 'submitted_at'],
  },
  {
    id: 'NOTIF-04',
    event: 'comp_off_granted',
    eventName: 'Comp-Off Credit Authorization',
    channel: 'In-App',
    language: 'English',
    templateBody: 'Congratulations {{employee_name}}! 1.0 Comp-Off day has been credited for your weekend duty on {{worked_date}}. Valid for 60 calendar days.',
    isActive: true,
    availableMergeFields: ['employee_name', 'worked_date', 'credited_days', 'expiry_date'],
  },
]
