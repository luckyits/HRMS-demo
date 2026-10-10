export interface LeaveBalance {
  type: string
  code: string
  allocated: number
  used: number
  available: number
  color: string
  requiresDocAfterDays?: number
}

export interface LeaveRequest {
  id: string
  leaveType: string
  startDate: string
  endDate: string
  daysCount: number
  isHalfDay: boolean
  reason: string
  attachmentName?: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  submittedAt: string
  managerComments?: string
}

export interface HolidayItem {
  id: string
  name: string
  date: string
  dayName: string
  type: 'National' | 'Festival' | 'Optional'
  applicableBranches: string[]
}

export interface CelebrationItem {
  id: string
  employeeName: string
  employeeAvatar: string
  designation: string
  department: string
  date: string
  type: 'Birthday' | 'Work Anniversary'
  yearsCount?: number
  isToday: boolean
  isThisWeek: boolean
  wished: boolean
}

export interface DocumentChecklistItem {
  id: string
  name: string
  category: 'Identity' | 'Academic' | 'Experience' | 'Legal'
  status: 'Pending' | 'Uploaded' | 'Verified' | 'Rejected'
  uploadedAt?: string
  expiryDate?: string
  fileName?: string
  isMandatory: boolean
}

export interface PolicyDocument {
  id: string
  title: string
  category: string
  version: string
  lastUpdated: string
  summary: string
  fullContent: string
  acknowledged: boolean
  acknowledgedAt?: string
}

export interface PayslipRecord {
  id: string
  monthYear: string // e.g. "September 2026"
  period: string
  payDate: string
  grossSalary: number
  totalDeductions: number
  netPay: number
  earnings: { name: string; amount: number }[]
  deductions: { name: string; amount: number }[]
  employerContributions: { name: string; amount: number }[]
}

export interface HelpdeskTicket {
  id: string
  subject: string
  category: 'HR Operations' | 'Payroll & Tax' | 'IT & Equipment' | 'Workplace Grievance'
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  isAnonymous: boolean
  description: string
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  createdAt: string
  lastUpdate: string
}

export interface UnifiedRequest {
  id: string
  module: 'Leave' | 'Attendance Regularization' | 'Shift Swap' | 'Helpdesk' | 'Profile Edit' | 'Expense Claim'
  summary: string
  submittedAt: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  linkTo: string
}

export const INITIAL_LEAVE_BALANCES: LeaveBalance[] = [
  { type: 'Earned Leave (EL)', code: 'EL', allocated: 15, used: 5, available: 10, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60' },
  { type: 'Casual Leave (CL)', code: 'CL', allocated: 8, used: 3.5, available: 4.5, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' },
  { type: 'Sick Leave (SL)', code: 'SL', allocated: 7, used: 1, available: 6, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60', requiresDocAfterDays: 2 },
  { type: 'Compensatory Off', code: 'COMPOFF', allocated: 2, used: 0, available: 2, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60' },
]

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LV-901',
    leaveType: 'Earned Leave (EL)',
    startDate: '2026-10-15',
    endDate: '2026-10-16',
    daysCount: 2,
    isHalfDay: false,
    reason: 'Family event and personal commitments in Ahmedabad.',
    status: 'pending',
    submittedAt: 'Oct 07, 2026',
  },
  {
    id: 'LV-900',
    leaveType: 'Casual Leave (CL)',
    startDate: '2026-09-24',
    endDate: '2026-09-24',
    daysCount: 1,
    isHalfDay: false,
    reason: 'Bank documentation visit and municipal appointment.',
    status: 'approved',
    submittedAt: 'Sep 21, 2026',
    managerComments: 'Approved by Vikram Malhotra.',
  },
]

export const MOCK_HOLIDAYS: HolidayItem[] = [
  { id: 'HOL-1', name: 'Gandhi Jayanti', date: '2026-10-02', dayName: 'Friday', type: 'National', applicableBranches: ['All'] },
  { id: 'HOL-2', name: 'Dussehra / Vijayadashami', date: '2026-10-20', dayName: 'Tuesday', type: 'Festival', applicableBranches: ['All'] },
  { id: 'HOL-3', name: 'Diwali (Deepavali Break)', date: '2026-11-08', dayName: 'Sunday', type: 'Festival', applicableBranches: ['All'] },
  { id: 'HOL-4', name: 'Diwali New Year', date: '2026-11-09', dayName: 'Monday', type: 'Festival', applicableBranches: ['Bengaluru HQ', 'Ahmedabad Hub', 'Pune Plant 1'] },
  { id: 'HOL-5', name: 'Guru Nanak Jayanti', date: '2026-11-24', dayName: 'Tuesday', type: 'Festival', applicableBranches: ['All'] },
  { id: 'HOL-6', name: 'Christmas Day', date: '2026-12-25', dayName: 'Friday', type: 'National', applicableBranches: ['All'] },
]

export const MOCK_CELEBRATIONS: CelebrationItem[] = [
  {
    id: 'CEL-1',
    employeeName: 'Priya Sharma',
    employeeAvatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    designation: 'Regional Sales Manager',
    department: 'Field Sales',
    date: '2026-10-09', // Today
    type: 'Work Anniversary',
    yearsCount: 3,
    isToday: true,
    isThisWeek: true,
    wished: false,
  },
  {
    id: 'CEL-2',
    employeeName: 'Rohan Deshmukh',
    employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    designation: 'Cloud Architect',
    department: 'Engineering',
    date: '2026-10-12', // This week
    type: 'Birthday',
    isToday: false,
    isThisWeek: true,
    wished: false,
  },
  {
    id: 'CEL-3',
    employeeName: 'Kavita Salunkhe',
    employeeAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    designation: 'Plant HR Officer',
    department: 'HR & Safety',
    date: '2026-10-24', // This month
    type: 'Work Anniversary',
    yearsCount: 2,
    isToday: false,
    isThisWeek: false,
    wished: false,
  },
]

export const INITIAL_DOCUMENTS_CHECKLIST: DocumentChecklistItem[] = [
  { id: 'DOC-1', name: 'Government Photo ID (Aadhaar / Passport)', category: 'Identity', status: 'Verified', uploadedAt: '2022-08-01', expiryDate: '2032-05-14', fileName: 'aadhaar_card_verified.pdf', isMandatory: true },
  { id: 'DOC-2', name: 'Permanent Account Number (PAN Card)', category: 'Identity', status: 'Verified', uploadedAt: '2022-08-01', fileName: 'pan_card.pdf', isMandatory: true },
  { id: 'DOC-3', name: 'Highest Degree Certificate', category: 'Academic', status: 'Verified', uploadedAt: '2022-08-05', fileName: 'btech_degree_cert.pdf', isMandatory: true },
  { id: 'DOC-4', name: 'Previous Employer Relieving Letter', category: 'Experience', status: 'Verified', uploadedAt: '2022-08-05', fileName: 'relieving_letter.pdf', isMandatory: true },
  { id: 'DOC-5', name: 'Form 12BB (Annual Investment Declaration Proofs)', category: 'Legal', status: 'Pending', isMandatory: false },
]

export const INITIAL_POLICIES: PolicyDocument[] = [
  {
    id: 'POL-01',
    title: 'Code of Business Conduct & Ethics',
    category: 'Corporate Governance',
    version: 'v3.2',
    lastUpdated: 'Aug 2026',
    summary: 'Core principles of ethical decision-making, anti-bribery, fair dealings, and conflict of interest standards.',
    fullContent: 'All workforce personnel are expected to conduct themselves with the utmost integrity, transparency, and compliance with statutory and organizational norms. No employee may solicit or accept gifts from vendors, or disclose proprietary intellectual property without explicit executive authorization.',
    acknowledged: true,
    acknowledgedAt: '2026-08-15 10:20 AM',
  },
  {
    id: 'POL-02',
    title: 'Prevention of Sexual Harassment (POSH) Policy',
    category: 'Workplace Safety',
    version: 'v4.0',
    lastUpdated: 'Sep 2026',
    summary: 'Guidelines for maintaining a safe, inclusive workplace free from discrimination and harassment, with Internal Complaints Committee (ICC) procedures.',
    fullContent: 'Our organization strictly enforces zero tolerance for sexual harassment and gender-based discrimination. The Internal Committee (ICC) is empowered to investigate any grievances impartially, ensuring confidentiality and protection from retaliation.',
    acknowledged: false,
  },
  {
    id: 'POL-03',
    title: 'Information Security & Digital Vault Standards',
    category: 'Cybersecurity',
    version: 'v2.1',
    lastUpdated: 'Jul 2026',
    summary: 'Rules regarding remote access, password rotation, data masking, and confidential enterprise IP storage.',
    fullContent: 'Employees must adhere to two-factor authentication requirements, secure hardware encryption, and must never export confidential customer or payroll data to unauthorized external drives or devices.',
    acknowledged: false,
  },
]

export const INITIAL_PAYSLIPS: PayslipRecord[] = [
  {
    id: 'PAY-2026-09',
    monthYear: 'September 2026',
    period: '01 Sep 2026 – 30 Sep 2026',
    payDate: '30 Sep 2026',
    grossSalary: 154166,
    totalDeductions: 29666,
    netPay: 124500,
    earnings: [
      { name: 'Basic Salary', amount: 77083 },
      { name: 'House Rent Allowance (HRA)', amount: 38541 },
      { name: 'Special Allowance', amount: 30000 },
      { name: 'Statutory Bonus Advance', amount: 8542 },
    ],
    deductions: [
      { name: 'Provident Fund (Employee PF)', amount: 9250 },
      { name: 'Income Tax (TDS Deduction)', amount: 20216 },
      { name: 'Professional Tax (PT)', amount: 200 },
    ],
    employerContributions: [
      { name: 'Employer PF Contribution', amount: 9250 },
      { name: 'Gratuity Provisioning', amount: 3707 },
    ],
  },
  {
    id: 'PAY-2026-08',
    monthYear: 'August 2026',
    period: '01 Aug 2026 – 31 Aug 2026',
    payDate: '31 Aug 2026',
    grossSalary: 154166,
    totalDeductions: 29666,
    netPay: 124500,
    earnings: [
      { name: 'Basic Salary', amount: 77083 },
      { name: 'House Rent Allowance (HRA)', amount: 38541 },
      { name: 'Special Allowance', amount: 30000 },
      { name: 'Statutory Bonus Advance', amount: 8542 },
    ],
    deductions: [
      { name: 'Provident Fund (Employee PF)', amount: 9250 },
      { name: 'Income Tax (TDS Deduction)', amount: 20216 },
      { name: 'Professional Tax (PT)', amount: 200 },
    ],
    employerContributions: [
      { name: 'Employer PF Contribution', amount: 9250 },
      { name: 'Gratuity Provisioning', amount: 3707 },
    ],
  },
]

export const INITIAL_HELPDESK_TICKETS: HelpdeskTicket[] = [
  {
    id: 'TKT-1082',
    subject: 'Request for New Ergonomic Laptop Stand & Monitor Cable',
    category: 'IT & Equipment',
    priority: 'Medium',
    isAnonymous: false,
    description: 'Working at Bengaluru Tower 2 desk. Need an HDMI adapter and height-adjustable stand.',
    status: 'In Progress',
    createdAt: 'Oct 05, 2026',
    lastUpdate: 'Oct 06, 2026 (Assigned to IT Support desk)',
  },
  {
    id: 'TKT-1081',
    subject: 'Form 16 Assessment Year 2026-27 Revision Inquiry',
    category: 'Payroll & Tax',
    priority: 'Low',
    isAnonymous: false,
    description: 'Query regarding Chapter VI-A 80D medical insurance deduction credit in Form 16 Part B.',
    status: 'Resolved',
    createdAt: 'Sep 28, 2026',
    lastUpdate: 'Sep 30, 2026 (Clarification provided by Payroll Lead)',
  },
]
