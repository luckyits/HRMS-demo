import React, { createContext, useContext, useState } from 'react'
import type { ApprovalStep } from '@/components/common/ApprovalTimeline'
import { AuditLogService } from '@/services/auditLogService'

// -------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------

export interface OnboardingTask {
  id: string
  title: string
  category: 'Documents' | 'IT & Hardware' | 'HR & Policy' | 'Finance & Bank' | 'Team & Training'
  description: string
  required: boolean
  assignedTo: string // e.g. 'Employee', 'IT Support', 'HR Admin', 'Reporting Manager'
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified'
  completedAt?: string
  verifiedBy?: string
}

export interface OnboardingTemplate {
  id: string
  name: string
  targetProfile: string // 'Corporate / Tech', 'Plant / Factory', 'Field Sales', 'Executive'
  description: string
  tasks: Array<Omit<OnboardingTask, 'status' | 'completedAt' | 'verifiedBy'>>
}

export interface EmployeeOnboarding {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  designation: string
  department: string
  doj: string
  templateId: string
  status: 'In Progress' | 'Completed' | 'Delayed'
  tasks: OnboardingTask[]
}

export interface AgreementTemplate {
  id: string
  name: string
  type: 'NDA' | 'Offer Contract' | 'IP Assignment' | 'Service Bond' | 'Non-Compete'
  version: string
  mandatoryFor: string // 'All Employees', 'Engineering & Product', 'Sales', 'Executives'
  content: string
}

export interface EmployeeAgreementRecord {
  id: string
  agreementTemplateId: string
  agreementName: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  department: string
  status: 'Signed' | 'Pending Signature' | 'Expired'
  sentDate: string
  signedDate?: string
  ipAddress?: string
  signatureDataUrl?: string
}

export interface LetterTemplate {
  id: string
  type: 'Offer Letter' | 'Appointment Letter' | 'Increment / Appraisal' | 'Experience Letter' | 'Relieving Letter'
  title: string
  description: string
  availableVariables: string[]
  bodyTemplate: string
}

export interface GeneratedLetter {
  id: string
  letterNumber: string
  templateType: 'Offer Letter' | 'Appointment Letter' | 'Increment / Appraisal' | 'Experience Letter' | 'Relieving Letter'
  employeeId: string
  employeeName: string
  generatedDate: string
  content: string
  issuedBy: string
}

export interface ResignationRequest {
  id: string
  requestId: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  employeeGrade: string
  department: string
  designation: string
  doj: string
  applyDate: string
  noticePeriodDays: number
  calculatedLwd: string // Last Working Day
  requestedLwd: string
  reasonCategory: 'Career Growth / Higher Studies' | 'Personal / Relocation' | 'Compensation & Role' | 'Health / Family' | 'Other'
  reasonDetails: string
  handoverPlan: string
  status: 'Pending Manager Review' | 'Pending HR Review' | 'Serving Notice' | 'Exit Clearance' | 'Settled & Relieved' | 'Withdrawn' | 'Rejected'
  managerRetentionNote?: string
  managerRecommendedLwd?: string
  managerDecision?: 'Retained' | 'Approved' | 'Waived Shortfall'
  steps: ApprovalStep[]
}

export interface ExitClearanceItem {
  id: string
  department: 'IT & Hardware' | 'Finance & Loans' | 'Admin & Facilities' | 'Department Handover' | 'HR Exit Interview'
  itemTitle: string
  status: 'Pending' | 'Cleared' | 'Deduction Required'
  deductionAmount: number
  clearedBy?: string
  clearedAt?: string
  notes?: string
}

export interface FullAndFinalSettlement {
  id: string
  resignationId: string
  employeeId: string
  employeeName: string
  designation: string
  department: string
  lastWorkingDay: string
  settlementDate: string
  monthlyGrossSalary: number
  // Earnings & Credits
  unpaidSalaryDays: number
  unpaidSalaryAmount: number
  earnedLeaveBalance: number
  leaveEncashmentAmount: number
  gratuityEligible: boolean
  gratuityAmount: number
  variablePayOrBonus: number
  // Deductions & Recoveries
  noticeShortfallDays: number
  noticeRecoveryAmount: number
  pendingLoanEmiRecovery: number
  assetDamageOrLossDeduction: number
  taxTdsDeduction: number
  // Final Computed Figures
  totalEarnings: number
  totalDeductions: number
  netPayableOrRecoverable: number // positive = company pays employee, negative = employee pays company
  paymentStatus: 'Draft' | 'Approved by Finance' | 'Disbursed'
}

export interface RehireRecord {
  id: string
  formerEmployeeId: string
  employeeName: string
  previousDesignation: string
  previousDepartment: string
  previousTenure: string // e.g. "Aug 2021 - Sep 2024 (3 yrs 1 mo)"
  exitReason: string
  rehireEligibility: 'Eligible (Clean Record)' | 'Conditional Approval Required' | 'Not Eligible'
  linkedNewEmployeeId?: string
  uanNumber: string
  rehireDate?: string
  notes: string
}

export interface AssetRecord {
  id: string
  assetTag: string
  category: 'Laptop / MacBook' | 'Monitor / Display' | 'Company Smartphone' | 'Access Card & Keys' | 'Uniform & Safety Gear'
  model: string
  serialNumber: string
  brand: string
  condition: 'Brand New' | 'Good' | 'Fair' | 'Damaged / Needs Repair'
  assignedToEmployeeId?: string
  assignedToEmployeeName?: string
  assignedDate?: string
  returnDate?: string
  status: 'In Use' | 'Available in Stock' | 'Returned' | 'Under Maintenance' | 'Scrapped'
  damagePenaltyAmount: number
}

// -------------------------------------------------------------
// CONTEXT INTERFACE
// -------------------------------------------------------------

interface LifecycleContextType {
  // Onboarding
  onboardingTemplates: OnboardingTemplate[]
  employeeOnboardings: EmployeeOnboarding[]
  updateOnboardingTaskStatus: (employeeId: string, taskId: string, status: OnboardingTask['status'], verifiedBy?: string) => void
  
  // Agreements & E-sign
  agreementTemplates: AgreementTemplate[]
  employeeAgreements: EmployeeAgreementRecord[]
  sendAgreementToEmployee: (templateId: string, employeeId: string, employeeName: string, dept: string) => void
  signEmployeeAgreement: (agreementId: string, signatureDataUrl: string) => void

  // Letter Generator
  letterTemplates: LetterTemplate[]
  generatedLetters: GeneratedLetter[]
  generateEmployeeLetter: (templateType: LetterTemplate['type'], employeeId: string, customVars: Record<string, string>) => GeneratedLetter

  // Resignation & Exit
  resignations: ResignationRequest[]
  submitResignation: (data: {
    employeeId: string
    employeeName: string
    employeeAvatar: string
    employeeGrade: string
    department: string
    designation: string
    doj: string
    noticePeriodDays: number
    requestedLwd: string
    reasonCategory: ResignationRequest['reasonCategory']
    reasonDetails: string
    handoverPlan: string
  }) => ResignationRequest
  withdrawResignation: (requestId: string) => void
  managerActionResignation: (requestId: string, action: 'Approve' | 'Reject' | 'Retain', retentionNote: string, recommendedLwd?: string) => void
  hrApproveResignation: (requestId: string, confirmedLwd: string) => void

  // Exit Clearances & FnF
  exitClearances: Record<string, ExitClearanceItem[]> // key: resignationId
  updateExitClearance: (resignationId: string, itemId: string, status: ExitClearanceItem['status'], deductionAmount: number, notes?: string) => void
  fnfSettlements: FullAndFinalSettlement[]
  calculateFnF: (resignationId: string) => FullAndFinalSettlement
  approveFnFSettlement: (fnfId: string) => void

  // Rehire Flow
  rehireRecords: RehireRecord[]
  processRehire: (formerEmployeeId: string, newEmployeeId: string, notes: string) => void

  // Asset Management
  assets: AssetRecord[]
  issueAsset: (assetId: string, employeeId: string, employeeName: string) => void
  returnAsset: (assetId: string, condition: AssetRecord['condition'], damagePenalty: number) => void
  addAsset: (asset: Omit<AssetRecord, 'id' | 'status' | 'damagePenaltyAmount'>) => void
}

// -------------------------------------------------------------
// INITIAL MOCK DATA
// -------------------------------------------------------------

const INITIAL_ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    id: 'OB-TMP-01',
    name: 'Corporate & Engineering Onboarding',
    targetProfile: 'Corporate / Tech',
    description: 'Standard 7-day technical & compliance onboarding checklist',
    tasks: [
      { id: 'T-01', title: 'Submit ID Proof & Government Tax IDs (PAN, Aadhaar)', category: 'Documents', description: 'Upload clear scans to digital document vault', required: true, assignedTo: 'Employee' },
      { id: 'T-02', title: 'Sign Non-Disclosure Agreement (NDA) & Code of Conduct', category: 'HR & Policy', description: 'Complete digital e-signature', required: true, assignedTo: 'Employee' },
      { id: 'T-03', title: 'Provision Workstation & Secure VPN Access', category: 'IT & Hardware', description: 'Assign laptop, email alias, and 2FA tokens', required: true, assignedTo: 'IT Support' },
      { id: 'T-04', title: 'Bank Salary Account & Direct Deposit Setup', category: 'Finance & Bank', description: 'Verify IFSC, account holder details & cancelled cheque', required: true, assignedTo: 'Finance & Bank' },
      { id: 'T-05', title: 'Manager 1-on-1 & 30-60-90 Day Goal Alignment', category: 'Team & Training', description: 'Initial roadmap discussion and buddy allocation', required: false, assignedTo: 'Reporting Manager' },
    ],
  },
  {
    id: 'OB-TMP-02',
    name: 'Plant & Manufacturing Worker Onboarding',
    targetProfile: 'Plant / Factory',
    description: 'Factory floor compliance, safety gear, biometric enrollment and shift orientation',
    tasks: [
      { id: 'T-11', title: 'Medical Fitness Certificate & Blood Group Verification', category: 'Documents', description: 'Submit verified occupational health certificate', required: true, assignedTo: 'Employee' },
      { id: 'T-12', title: 'Issue Safety Boots, Helmet & High-Vis Uniform', category: 'IT & Hardware', description: 'Fit safety gear and record asset serial tag', required: true, assignedTo: 'HR Admin' },
      { id: 'T-13', title: 'Biometric Face & Fingerprint Register Enrollment', category: 'HR & Policy', description: 'Register in factory gate turnstile terminal', required: true, assignedTo: 'HR Admin' },
      { id: 'T-14', title: 'Factory Floor Hazard & Fire Safety Walkthrough', category: 'Team & Training', description: 'Safety drill and emergency assembly area briefing', required: true, assignedTo: 'Reporting Manager' },
    ],
  },
]

const INITIAL_EMPLOYEE_ONBOARDINGS: EmployeeOnboarding[] = [
  {
    id: 'EOB-101',
    employeeId: 'EMP-108',
    employeeName: 'Kunal Verma',
    employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    designation: 'Frontend Engineer',
    department: 'Engineering',
    doj: '2026-10-01',
    templateId: 'OB-TMP-01',
    status: 'In Progress',
    tasks: [
      { id: 'T-01', title: 'Submit ID Proof & Government Tax IDs (PAN, Aadhaar)', category: 'Documents', description: 'Upload clear scans to digital document vault', required: true, assignedTo: 'Employee', status: 'Completed', completedAt: '2026-10-02', verifiedBy: 'Pooja (HR)' },
      { id: 'T-02', title: 'Sign Non-Disclosure Agreement (NDA) & Code of Conduct', category: 'HR & Policy', description: 'Complete digital e-signature', required: true, assignedTo: 'Employee', status: 'Completed', completedAt: '2026-10-02', verifiedBy: 'Pooja (HR)' },
      { id: 'T-03', title: 'Provision Workstation & Secure VPN Access', category: 'IT & Hardware', description: 'Assign laptop, email alias, and 2FA tokens', required: true, assignedTo: 'IT Support', status: 'In Progress' },
      { id: 'T-04', title: 'Bank Salary Account & Direct Deposit Setup', category: 'Finance & Bank', description: 'Verify IFSC, account holder details & cancelled cheque', required: true, assignedTo: 'Finance & Bank', status: 'Pending' },
      { id: 'T-05', title: 'Manager 1-on-1 & 30-60-90 Day Goal Alignment', category: 'Team & Training', description: 'Initial roadmap discussion and buddy allocation', required: false, assignedTo: 'Reporting Manager', status: 'Pending' },
    ],
  },
  {
    id: 'EOB-102',
    employeeId: 'EMP-112',
    employeeName: 'Deepak Patel',
    employeeAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=faces',
    designation: 'Assembly Technician',
    department: 'Manufacturing',
    doj: '2026-09-20',
    templateId: 'OB-TMP-02',
    status: 'Completed',
    tasks: [
      { id: 'T-11', title: 'Medical Fitness Certificate & Blood Group Verification', category: 'Documents', description: 'Submit verified occupational health certificate', required: true, assignedTo: 'Employee', status: 'Completed', completedAt: '2026-09-20', verifiedBy: 'Kavita (Plant HR)' },
      { id: 'T-12', title: 'Issue Safety Boots, Helmet & High-Vis Uniform', category: 'IT & Hardware', description: 'Fit safety gear and record asset serial tag', required: true, assignedTo: 'HR Admin', status: 'Completed', completedAt: '2026-09-20', verifiedBy: 'Kavita (Plant HR)' },
      { id: 'T-13', title: 'Biometric Face & Fingerprint Register Enrollment', category: 'HR & Policy', description: 'Register in factory gate turnstile terminal', required: true, assignedTo: 'HR Admin', status: 'Completed', completedAt: '2026-09-21', verifiedBy: 'IT Security' },
      { id: 'T-14', title: 'Factory Floor Hazard & Fire Safety Walkthrough', category: 'Team & Training', description: 'Safety drill and emergency assembly area briefing', required: true, assignedTo: 'Reporting Manager', status: 'Completed', completedAt: '2026-09-22', verifiedBy: 'Vikram (Supervisor)' },
    ],
  },
]

const INITIAL_AGREEMENT_TEMPLATES: AgreementTemplate[] = [
  {
    id: 'AGT-01',
    name: 'Mutual Non-Disclosure & Confidentiality Agreement',
    type: 'NDA',
    version: 'v2.4 (2026)',
    mandatoryFor: 'All Employees',
    content: 'This Non-Disclosure Agreement governs all proprietary code, customer lists, technical secrets, and strategic blueprints disclosed during active employment...',
  },
  {
    id: 'AGT-02',
    name: 'Intellectual Property Assignment & Inventions Deed',
    type: 'IP Assignment',
    version: 'v1.8',
    mandatoryFor: 'Engineering & Product',
    content: 'The employee assigns all right, title, and interest worldwide in any software, algorithmic patents, architectural designs, and trademarks authored during employment...',
  },
  {
    id: 'AGT-03',
    name: 'Specialized Technical Training Service Bond (12 Months)',
    type: 'Service Bond',
    version: 'v3.0',
    mandatoryFor: 'Plant / Factory',
    content: 'In consideration of advanced specialized equipment certifications provided by the Company, the employee commits to a minimum 12-month service period...',
  },
]

const INITIAL_EMPLOYEE_AGREEMENTS: EmployeeAgreementRecord[] = [
  {
    id: 'EAG-01',
    agreementTemplateId: 'AGT-01',
    agreementName: 'Mutual Non-Disclosure & Confidentiality Agreement',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    department: 'Engineering',
    status: 'Signed',
    sentDate: '2025-04-01',
    signedDate: '2025-04-02 11:24 AM',
    ipAddress: '103.21.144.62 (Bangalore)',
  },
  {
    id: 'EAG-02',
    agreementTemplateId: 'AGT-02',
    agreementName: 'Intellectual Property Assignment & Inventions Deed',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    department: 'Engineering',
    status: 'Signed',
    sentDate: '2025-04-01',
    signedDate: '2025-04-02 11:26 AM',
    ipAddress: '103.21.144.62 (Bangalore)',
  },
  {
    id: 'EAG-03',
    agreementTemplateId: 'AGT-01',
    agreementName: 'Mutual Non-Disclosure & Confidentiality Agreement',
    employeeId: 'EMP-108',
    employeeName: 'Kunal Verma',
    employeeAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    department: 'Engineering',
    status: 'Pending Signature',
    sentDate: '2026-10-01',
  },
]

const INITIAL_LETTER_TEMPLATES: LetterTemplate[] = [
  {
    id: 'LET-01',
    type: 'Offer Letter',
    title: 'Standard Employment Offer Letter',
    description: 'Formal employment offer specifying compensation, role, joining date, and standard probation terms.',
    availableVariables: ['{{employee_name}}', '{{designation}}', '{{department}}', '{{doj}}', '{{ctc}}', '{{location}}', '{{manager_name}}'],
    bodyTemplate: `Dear {{employee_name}},

We are delighted to offer you the position of {{designation}} in our {{department}} team at our {{location}} facility.

Your proposed date of joining is {{doj}}. Your annual Total Cost to Company (CTC) will be INR {{ctc}}, payable in monthly disbursements subject to statutory taxes.

You will report to {{manager_name}}. We look forward to building groundbreaking products together.

Sincerely,
HR & People Operations`,
  },
  {
    id: 'LET-02',
    type: 'Appointment Letter',
    title: 'Formal Letter of Appointment',
    description: 'Post-joining official appointment with employee code, grade structure, and employment terms.',
    availableVariables: ['{{employee_name}}', '{{employee_id}}', '{{designation}}', '{{grade}}', '{{doj}}', '{{probation_months}}'],
    bodyTemplate: `To,
{{employee_name}} (Emp ID: {{employee_id}})
Designation: {{designation}} (Grade: {{grade}})

Sub: Official Letter of Appointment

Following your successful joining on {{doj}}, we formally confirm your appointment. You shall be on probation for a period of {{probation_months}} months from your joining date.

Your services will be governed by company standing orders, code of ethics, and statutory guidelines.

Sincerely,
Head of Human Resources`,
  },
  {
    id: 'LET-03',
    type: 'Increment / Appraisal',
    title: 'Annual Compensation Revision Letter',
    description: 'Annual performance revision confirming revised CTC, new grade, and effective date.',
    availableVariables: ['{{employee_name}}', '{{employee_id}}', '{{previous_ctc}}', '{{new_ctc}}', '{{hike_pct}}', '{{effective_date}}', '{{performance_rating}}'],
    bodyTemplate: `Dear {{employee_name}},

In recognition of your exceptional contributions and performance rating of {{performance_rating}} during the recent performance appraisal cycle, we are pleased to revise your compensation.

Your annual Cost to Company is revised from INR {{previous_ctc}} to INR {{new_ctc}} (an increment of {{hike_pct}}%), effective {{effective_date}}.

Thank you for your continuous dedication.

Sincerely,
Compensation & Benefits Committee`,
  },
  {
    id: 'LET-04',
    type: 'Experience Letter',
    title: 'Relieving & Experience Certificate',
    description: 'Official service certificate detailing tenure, last designation, and conduct.',
    availableVariables: ['{{employee_name}}', '{{employee_id}}', '{{designation}}', '{{department}}', '{{doj}}', '{{last_working_day}}'],
    bodyTemplate: `TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{employee_name}} (Emp ID: {{employee_id}}) was employed with our organization from {{doj}} to {{last_working_day}}.

At the time of leaving, they were designated as {{designation}} in the {{department}} department. During their tenure with us, we found them to be sincere, diligent, and professional.

We wish them the very best in all their future endeavors.

Sincerely,
Authorized Signatory`,
  },
  {
    id: 'LET-05',
    type: 'Relieving Letter',
    title: 'Official Relieving Order',
    description: 'Formal release confirming full exit clearance, handover completion, and release from company duties.',
    availableVariables: ['{{employee_name}}', '{{employee_id}}', '{{last_working_day}}', '{{designation}}'],
    bodyTemplate: `Dear {{employee_name}},

With reference to your resignation dated and subsequent handover completion, you are hereby relieved from your duties as {{designation}} with effect from the close of business hours on {{last_working_day}}.

All organizational assets, keys, and credentials have been returned in full. Your Full & Final settlement has been processed.

Sincerely,
Human Resources Operations`,
  },
]

const INITIAL_GENERATED_LETTERS: GeneratedLetter[] = [
  {
    id: 'GEN-001',
    letterNumber: 'LTR/2026/041',
    templateType: 'Appointment Letter',
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    generatedDate: '2025-04-05',
    content: `To,
Priya Sharma (Emp ID: EMP-104)
Designation: Senior Software Engineer (Grade: L2)

Sub: Official Letter of Appointment

Following your successful joining on 2025-04-01, we formally confirm your appointment. You shall be on probation for a period of 3 months from your joining date.

Your services will be governed by company standing orders, code of ethics, and statutory guidelines.

Sincerely,
Head of Human Resources`,
    issuedBy: 'HR Operations',
  },
]

const INITIAL_RESIGNATIONS: ResignationRequest[] = [
  {
    id: 'RES-01',
    requestId: 'RES/2026/012',
    employeeId: 'EMP-106',
    employeeName: 'Rahul Verma',
    employeeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    employeeGrade: 'L3',
    department: 'Product',
    designation: 'Product Designer',
    doj: '2024-03-15',
    applyDate: '2026-10-01',
    noticePeriodDays: 60,
    calculatedLwd: '2026-11-30',
    requestedLwd: '2026-11-15',
    reasonCategory: 'Career Growth / Higher Studies',
    reasonDetails: 'Pursuing MS in Human-Computer Interaction starting Spring semester.',
    handoverPlan: 'Documenting Figma UI library design tokens, handing over onboarding flows to Senior Designer.',
    status: 'Pending Manager Review',
    steps: [
      { id: 'S1', title: 'Resignation Submitted', approverRole: 'Employee', approverName: 'Rahul Verma', status: 'approved', timestamp: '2026-10-01 09:30 AM', comments: 'Formal notice served' },
      { id: 'S2', title: 'Manager Retention Review', approverRole: 'Direct Manager', approverName: 'Rajiv Mehta', status: 'pending' },
      { id: 'S3', title: 'HR Head Approval & Exit Clearance', approverRole: 'HR Head', approverName: 'Kavita Nair', status: 'pending' },
      { id: 'S4', title: 'Exit Clearance & FnF Settlement', approverRole: 'Finance & Operations', approverName: 'Dinesh Kumar', status: 'pending' },
    ],
  },
  {
    id: 'RES-02',
    requestId: 'RES/2026/009',
    employeeId: 'EMP-109',
    employeeName: 'Ananya Gupta',
    employeeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    employeeGrade: 'L4',
    department: 'Marketing',
    designation: 'Growth Lead',
    doj: '2023-01-10',
    applyDate: '2026-09-15',
    noticePeriodDays: 30,
    calculatedLwd: '2026-10-15',
    requestedLwd: '2026-10-15',
    reasonCategory: 'Personal / Relocation',
    reasonDetails: 'Relocating to Singapore for family reasons.',
    handoverPlan: 'Complete quarterly ad campaign wrap-ups and transfer agency contracts.',
    status: 'Exit Clearance',
    managerRetentionNote: 'Discussed remote work flexibility, but employee must relocate internationally.',
    managerDecision: 'Approved',
    steps: [
      { id: 'S1', title: 'Resignation Submitted', approverRole: 'Employee', approverName: 'Ananya Gupta', status: 'approved', timestamp: '2026-09-15 10:00 AM' },
      { id: 'S2', title: 'Manager Retention Review', approverRole: 'Direct Manager', approverName: 'Sneha Iyer', status: 'approved', timestamp: '2026-09-16 02:15 PM', comments: 'Approved with retention discussion documented.' },
      { id: 'S3', title: 'HR Head Approval & Exit Clearance', approverRole: 'HR Head', approverName: 'Kavita Nair', status: 'approved', timestamp: '2026-09-18 11:30 AM', comments: 'Notice period confirmed. Initiated exit clearances.' },
      { id: 'S4', title: 'Exit Clearance & FnF Settlement', approverRole: 'Finance & Operations', approverName: 'Dinesh Kumar', status: 'pending' },
    ],
  },
]

const INITIAL_EXIT_CLEARANCES: Record<string, ExitClearanceItem[]> = {
  'RES-02': [
    { id: 'EC-01', department: 'IT & Hardware', itemTitle: 'Return MacBook Pro & Accessories', status: 'Cleared', deductionAmount: 0, clearedBy: 'Amit (IT Admin)', clearedAt: '2026-10-08', notes: 'Device in excellent condition, wiped and unlocked.' },
    { id: 'EC-02', department: 'Finance & Loans', itemTitle: 'Zero Outstanding Advance / Company Loan', status: 'Cleared', deductionAmount: 0, clearedBy: 'Dinesh (Finance)', clearedAt: '2026-10-09', notes: 'All prior expense claims settled.' },
    { id: 'EC-03', department: 'Admin & Facilities', itemTitle: 'Return RFID Access Card, Locker Key & Parking Tag', status: 'Cleared', deductionAmount: 0, clearedBy: 'Sunil (Admin)', clearedAt: '2026-10-09' },
    { id: 'EC-04', department: 'Department Handover', itemTitle: 'Knowledge Transfer & Project Document Signoff', status: 'Cleared', deductionAmount: 0, clearedBy: 'Sneha (Dept Head)', clearedAt: '2026-10-09', notes: 'All accounts and ad credentials transferred.' },
    { id: 'EC-05', department: 'HR Exit Interview', itemTitle: 'Formal Exit Feedback & Confidential Survey', status: 'Cleared', deductionAmount: 0, clearedBy: 'Pooja (HR)', clearedAt: '2026-10-09', notes: 'Completed feedback survey. High NPS.' },
  ],
}

const INITIAL_FNF_SETTLEMENTS: FullAndFinalSettlement[] = [
  {
    id: 'FNF-2026-009',
    resignationId: 'RES-02',
    employeeId: 'EMP-109',
    employeeName: 'Ananya Gupta',
    designation: 'Growth Lead',
    department: 'Marketing',
    lastWorkingDay: '2026-10-15',
    settlementDate: '2026-10-16',
    monthlyGrossSalary: 110000,
    unpaidSalaryDays: 15,
    unpaidSalaryAmount: 55000,
    earnedLeaveBalance: 14,
    leaveEncashmentAmount: 51333,
    gratuityEligible: false, // < 5 years
    gratuityAmount: 0,
    variablePayOrBonus: 25000,
    noticeShortfallDays: 0,
    noticeRecoveryAmount: 0,
    pendingLoanEmiRecovery: 0,
    assetDamageOrLossDeduction: 0,
    taxTdsDeduction: 12500,
    totalEarnings: 131333, // 55k + 51.3k + 25k
    totalDeductions: 12500,
    netPayableOrRecoverable: 118833,
    paymentStatus: 'Approved by Finance',
  },
]

const INITIAL_REHIRE_RECORDS: RehireRecord[] = [
  {
    id: 'REH-01',
    formerEmployeeId: 'EMP-088',
    employeeName: 'Vikas Malhotra',
    previousDesignation: 'Senior Backend Engineer',
    previousDepartment: 'Engineering',
    previousTenure: 'Jun 2021 - Mar 2024 (2 yrs 9 mos)',
    exitReason: 'Higher studies overseas',
    rehireEligibility: 'Eligible (Clean Record)',
    uanNumber: '100984712034',
    notes: 'Exemplary performance during prior tenure. Left on great terms. Rehire expedited.',
  },
  {
    id: 'REH-02',
    formerEmployeeId: 'EMP-072',
    employeeName: 'Meera Deshmukh',
    previousDesignation: 'Territory Sales Manager',
    previousDepartment: 'Field Sales',
    previousTenure: 'Jan 2020 - Aug 2023 (3 yrs 7 mos)',
    exitReason: 'Relocation to Pune',
    rehireEligibility: 'Eligible (Clean Record)',
    uanNumber: '100452398711',
    notes: 'Top sales performer across West Region. Reapplying for Pune Branch Regional Lead.',
  },
]

const INITIAL_ASSETS: AssetRecord[] = [
  {
    id: 'AST-001',
    assetTag: 'AST-LPT-041',
    category: 'Laptop / MacBook',
    brand: 'Apple',
    model: 'MacBook Pro 14" M3 Pro (18GB/512GB)',
    serialNumber: 'C02G89XYMD6T',
    condition: 'Brand New',
    assignedToEmployeeId: 'EMP-104',
    assignedToEmployeeName: 'Priya Sharma',
    assignedDate: '2025-04-02',
    status: 'In Use',
    damagePenaltyAmount: 0,
  },
  {
    id: 'AST-002',
    assetTag: 'AST-LPT-042',
    category: 'Laptop / MacBook',
    brand: 'Dell',
    model: 'Latitude 7440 (i7 13th Gen, 32GB)',
    serialNumber: 'DL7440-89102X',
    condition: 'Good',
    assignedToEmployeeId: 'EMP-106',
    assignedToEmployeeName: 'Rahul Verma',
    assignedDate: '2024-03-16',
    status: 'In Use',
    damagePenaltyAmount: 0,
  },
  {
    id: 'AST-003',
    assetTag: 'AST-LPT-039',
    category: 'Laptop / MacBook',
    brand: 'Apple',
    model: 'MacBook Air 15" M2 (16GB/512GB)',
    serialNumber: 'C02F55MNMD6T',
    condition: 'Good',
    status: 'Available in Stock',
    damagePenaltyAmount: 0,
  },
  {
    id: 'AST-004',
    assetTag: 'AST-MON-018',
    category: 'Monitor / Display',
    brand: 'Dell',
    model: 'UltraSharp 27" 4K USB-C Hub (U2723QE)',
    serialNumber: 'CN-0G678P-74400',
    condition: 'Good',
    assignedToEmployeeId: 'EMP-104',
    assignedToEmployeeName: 'Priya Sharma',
    assignedDate: '2025-04-02',
    status: 'In Use',
    damagePenaltyAmount: 0,
  },
  {
    id: 'AST-005',
    assetTag: 'AST-KEY-104',
    category: 'Access Card & Keys',
    brand: 'HID Global',
    model: 'Encrypted RFID Proximity SmartCard #104',
    serialNumber: 'HID-RFID-0104',
    condition: 'Good',
    assignedToEmployeeId: 'EMP-104',
    assignedToEmployeeName: 'Priya Sharma',
    assignedDate: '2025-04-01',
    status: 'In Use',
    damagePenaltyAmount: 0,
  },
]

// -------------------------------------------------------------
// PROVIDER
// -------------------------------------------------------------

const LifecycleContext = createContext<LifecycleContextType | undefined>(undefined)

export const LifecycleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingTemplates] = useState<OnboardingTemplate[]>(INITIAL_ONBOARDING_TEMPLATES)
  const [employeeOnboardings, setEmployeeOnboardings] = useState<EmployeeOnboarding[]>(INITIAL_EMPLOYEE_ONBOARDINGS)
  const [agreementTemplates] = useState<AgreementTemplate[]>(INITIAL_AGREEMENT_TEMPLATES)
  const [employeeAgreements, setEmployeeAgreements] = useState<EmployeeAgreementRecord[]>(INITIAL_EMPLOYEE_AGREEMENTS)
  const [letterTemplates] = useState<LetterTemplate[]>(INITIAL_LETTER_TEMPLATES)
  const [generatedLetters, setGeneratedLetters] = useState<GeneratedLetter[]>(INITIAL_GENERATED_LETTERS)
  const [resignations, setResignations] = useState<ResignationRequest[]>(INITIAL_RESIGNATIONS)
  const [exitClearances, setExitClearances] = useState<Record<string, ExitClearanceItem[]>>(INITIAL_EXIT_CLEARANCES)
  const [fnfSettlements, setFnfSettlements] = useState<FullAndFinalSettlement[]>(INITIAL_FNF_SETTLEMENTS)
  const [rehireRecords, setRehireRecords] = useState<RehireRecord[]>(INITIAL_REHIRE_RECORDS)
  const [assets, setAssets] = useState<AssetRecord[]>(INITIAL_ASSETS)

  // 1. Onboarding Task Updates
  const updateOnboardingTaskStatus = (
    employeeId: string,
    taskId: string,
    status: OnboardingTask['status'],
    verifiedBy?: string
  ) => {
    setEmployeeOnboardings((prev) =>
      prev.map((eob) => {
        if (eob.employeeId !== employeeId) return eob
        const updatedTasks = eob.tasks.map((t) => {
          if (t.id !== taskId) return t
          return {
            ...t,
            status,
            completedAt: status === 'Completed' || status === 'Verified' ? new Date().toISOString().split('T')[0] : undefined,
            verifiedBy: verifiedBy || t.verifiedBy,
          }
        })
        const allCompleted = updatedTasks.every((t) => t.status === 'Completed' || t.status === 'Verified')
        return {
          ...eob,
          tasks: updatedTasks,
          status: allCompleted ? 'Completed' : 'In Progress',
        }
      })
    )

    AuditLogService.addLog({
      actorName: verifiedBy || 'HR Admin',
      actorRole: 'HR Admin',
      action: 'UPDATE_ONBOARDING_TASK',
      targetType: 'Employee',
      targetId: employeeId,
      targetName: `Task ${taskId}`,
      featureCode: 'JOINING_DOCS',
      reason: `Updated onboarding task status to ${status}`,
    })
  }

  // 2. Agreements
  const sendAgreementToEmployee = (
    templateId: string,
    employeeId: string,
    employeeName: string,
    department: string
  ) => {
    const tmpl = agreementTemplates.find((t) => t.id === templateId)
    if (!tmpl) return
    const newRecord: EmployeeAgreementRecord = {
      id: `EAG-${Date.now().toString().slice(-4)}`,
      agreementTemplateId: tmpl.id,
      agreementName: tmpl.name,
      employeeId,
      employeeName,
      employeeAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
      department,
      status: 'Pending Signature',
      sentDate: new Date().toISOString().split('T')[0],
    }
    setEmployeeAgreements((prev) => [newRecord, ...prev])
  }

  const signEmployeeAgreement = (agreementId: string, signatureDataUrl: string) => {
    setEmployeeAgreements((prev) =>
      prev.map((ag) => {
        if (ag.id !== agreementId) return ag
        return {
          ...ag,
          status: 'Signed',
          signedDate: new Date().toLocaleString(),
          signatureDataUrl,
          ipAddress: '103.21.144.62 (Bangalore)',
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'Employee',
      actorRole: 'Employee',
      action: 'SIGN_AGREEMENT',
      targetType: 'Policy',
      targetId: agreementId,
      targetName: 'Digital E-Signature',
      featureCode: 'AGREEMENT',
      reason: 'Employee signed legal agreement digitally with timestamp',
    })
  }

  // 3. Letters
  const generateEmployeeLetter = (
    templateType: LetterTemplate['type'],
    employeeId: string,
    customVars: Record<string, string>
  ): GeneratedLetter => {
    const tmpl = letterTemplates.find((t) => t.type === templateType) || letterTemplates[0]
    let compiled = tmpl.bodyTemplate
    Object.entries(customVars).forEach(([k, v]) => {
      compiled = compiled.replaceAll(k, v)
    })

    const newLetter: GeneratedLetter = {
      id: `GEN-${Date.now().toString().slice(-4)}`,
      letterNumber: `LTR/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      templateType,
      employeeId,
      employeeName: customVars['{{employee_name}}'] || 'Employee',
      generatedDate: new Date().toISOString().split('T')[0],
      content: compiled,
      issuedBy: 'HR & People Operations',
    }

    setGeneratedLetters((prev) => [newLetter, ...prev])

    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'GENERATE_LETTER',
      targetType: 'Employee',
      targetId: newLetter.letterNumber,
      targetName: templateType,
      featureCode: 'JOINING_DOCS',
      reason: `Generated official ${templateType} for ${newLetter.employeeName}`,
    })

    return newLetter
  }

  // 4. Resignation Workflow
  const submitResignation = (data: {
    employeeId: string
    employeeName: string
    employeeAvatar: string
    employeeGrade: string
    department: string
    designation: string
    doj: string
    noticePeriodDays: number
    requestedLwd: string
    reasonCategory: ResignationRequest['reasonCategory']
    reasonDetails: string
    handoverPlan: string
  }): ResignationRequest => {
    const today = new Date()
    const lwdDate = new Date(today.getTime() + data.noticePeriodDays * 24 * 60 * 60 * 1000)
    const calculatedLwd = lwdDate.toISOString().split('T')[0]

    const newReq: ResignationRequest = {
      id: `RES-${Date.now().toString().slice(-4)}`,
      requestId: `RES/${new Date().getFullYear()}/${Math.floor(10 + Math.random() * 90)}`,
      ...data,
      applyDate: today.toISOString().split('T')[0],
      calculatedLwd,
      status: 'Pending Manager Review',
      steps: [
        { id: 'S1', title: 'Resignation Submitted', approverRole: 'Employee', approverName: data.employeeName, status: 'approved', timestamp: new Date().toLocaleString(), comments: 'Formal notice served' },
        { id: 'S2', title: 'Manager Retention Review', approverRole: 'Direct Manager', approverName: 'Reporting Manager', status: 'pending' },
        { id: 'S3', title: 'HR Head Approval & Exit Clearance', approverRole: 'HR Head', approverName: 'HR Head', status: 'pending' },
        { id: 'S4', title: 'Exit Clearance & FnF Settlement', approverRole: 'Finance & Operations', approverName: 'Finance Operations', status: 'pending' },
      ],
    }

    setResignations((prev) => [newReq, ...prev])

    // Initialize Exit Checklist for this resignation
    setExitClearances((prev) => ({
      ...prev,
      [newReq.id]: [
        { id: `EC-1-${newReq.id}`, department: 'IT & Hardware', itemTitle: 'Return Laptop, Monitor & Accessories', status: 'Pending', deductionAmount: 0 },
        { id: `EC-2-${newReq.id}`, department: 'Finance & Loans', itemTitle: 'Clear Salary Advances & Outstanding Loans', status: 'Pending', deductionAmount: 0 },
        { id: `EC-3-${newReq.id}`, department: 'Admin & Facilities', itemTitle: 'Return ID Card, Locker Keys & Parking Pass', status: 'Pending', deductionAmount: 0 },
        { id: `EC-4-${newReq.id}`, department: 'Department Handover', itemTitle: 'Knowledge Transfer & Project Artifact Signoff', status: 'Pending', deductionAmount: 0 },
        { id: `EC-5-${newReq.id}`, department: 'HR Exit Interview', itemTitle: 'Conduct Exit Feedback & Experience Survey', status: 'Pending', deductionAmount: 0 },
      ],
    }))

    AuditLogService.addLog({
      actorName: data.employeeName,
      actorRole: 'Employee',
      action: 'SUBMIT_RESIGNATION',
      targetType: 'Employee',
      targetId: newReq.requestId,
      targetName: data.reasonCategory,
      featureCode: 'RESIGNATION',
      reason: `Resignation submitted with notice period of ${data.noticePeriodDays} days`,
    })

    return newReq
  }

  const withdrawResignation = (requestId: string) => {
    setResignations((prev) =>
      prev.map((r) => {
        if (r.id !== requestId && r.requestId !== requestId) return r
        const updatedSteps = r.steps.map((s) => ({ ...s, status: s.status === 'approved' ? s.status : 'rejected' as const }))
        return {
          ...r,
          status: 'Withdrawn',
          steps: updatedSteps,
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'Employee',
      actorRole: 'Employee',
      action: 'WITHDRAW_RESIGNATION',
      targetType: 'Employee',
      targetId: requestId,
      targetName: 'Resignation Withdrawal',
      featureCode: 'RESIGNATION',
      reason: 'Employee withdrew resignation request',
    })
  }

  const managerActionResignation = (
    requestId: string,
    action: 'Approve' | 'Reject' | 'Retain',
    retentionNote: string,
    recommendedLwd?: string
  ) => {
    setResignations((prev) =>
      prev.map((r) => {
        if (r.id !== requestId && r.requestId !== requestId) return r
        const updatedSteps = [...r.steps]
        if (updatedSteps[1]) {
          updatedSteps[1] = {
            ...updatedSteps[1],
            status: action === 'Reject' ? 'rejected' : 'approved',
            timestamp: new Date().toLocaleString(),
            comments: retentionNote,
          }
        }
        return {
          ...r,
          status: action === 'Reject' ? 'Rejected' : action === 'Retain' ? 'Withdrawn' : 'Pending HR Review',
          managerRetentionNote: retentionNote,
          managerRecommendedLwd: recommendedLwd || r.requestedLwd,
          managerDecision: action === 'Retain' ? 'Retained' : action === 'Approve' ? 'Approved' : 'Waived Shortfall',
          steps: updatedSteps,
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'Reporting Manager',
      actorRole: 'Manager',
      action: 'MANAGER_REVIEW_RESIGNATION',
      targetType: 'Employee',
      targetId: requestId,
      targetName: action,
      featureCode: 'RESIGNATION',
      reason: `Manager action: ${action}. Note: ${retentionNote}`,
    })
  }

  const hrApproveResignation = (requestId: string, confirmedLwd: string) => {
    setResignations((prev) =>
      prev.map((r) => {
        if (r.id !== requestId && r.requestId !== requestId) return r
        const updatedSteps = [...r.steps]
        if (updatedSteps[2]) {
          updatedSteps[2] = {
            ...updatedSteps[2],
            status: 'approved',
            timestamp: new Date().toLocaleString(),
            comments: `Notice confirmed. LWD finalized to ${confirmedLwd}`,
          }
        }
        return {
          ...r,
          status: 'Exit Clearance',
          requestedLwd: confirmedLwd,
          steps: updatedSteps,
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'HR Head',
      actorRole: 'HR Admin',
      action: 'HR_APPROVE_RESIGNATION',
      targetType: 'Employee',
      targetId: requestId,
      targetName: 'Confirmed Exit',
      featureCode: 'RESIGNATION',
      reason: `HR finalized LWD as ${confirmedLwd} and initiated exit clearance checklist`,
    })
  }

  // 5. Exit Clearances & FnF
  const updateExitClearance = (
    resignationId: string,
    itemId: string,
    status: ExitClearanceItem['status'],
    deductionAmount: number,
    notes?: string
  ) => {
    setExitClearances((prev) => {
      const items = prev[resignationId] || []
      const updated = items.map((i) => {
        if (i.id !== itemId) return i
        return {
          ...i,
          status,
          deductionAmount,
          clearedBy: 'HR & Operations',
          clearedAt: new Date().toISOString().split('T')[0],
          notes: notes || i.notes,
        }
      })
      return { ...prev, [resignationId]: updated }
    })
  }

  const calculateFnF = (resignationId: string): FullAndFinalSettlement => {
    const res = resignations.find((r) => r.id === resignationId || r.requestId === resignationId)
    const existing = fnfSettlements.find((f) => f.resignationId === resignationId)
    if (existing) return existing

    const grossSalary = 85000 // mock base
    const dailyRate = Math.round(grossSalary / 30)

    // Calculate clearance deductions
    const clearances = exitClearances[resignationId] || []
    const assetDeductions = clearances.reduce((sum, item) => sum + (item.deductionAmount || 0), 0)

    // Notice shortfall calculation
    const noticeShortfall = res && res.noticePeriodDays > 30 ? 15 : 0
    const noticeRecovery = noticeShortfall * dailyRate

    const unpaidDays = 12
    const unpaidSalary = unpaidDays * dailyRate
    const leaveBal = 8
    const leaveEncash = leaveBal * dailyRate
    const gratuity = 0 // < 5 years
    const bonus = 15000
    const loanRecovery = 0
    const tds = 8500

    const totalEarnings = unpaidSalary + leaveEncash + gratuity + bonus
    const totalDeductions = noticeRecovery + loanRecovery + assetDeductions + tds
    const net = totalEarnings - totalDeductions

    const newFnF: FullAndFinalSettlement = {
      id: `FNF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      resignationId,
      employeeId: res?.employeeId || 'EMP-106',
      employeeName: res?.employeeName || 'Rahul Verma',
      designation: res?.designation || 'Product Designer',
      department: res?.department || 'Product',
      lastWorkingDay: res?.requestedLwd || '2026-11-15',
      settlementDate: new Date().toISOString().split('T')[0],
      monthlyGrossSalary: grossSalary,
      unpaidSalaryDays: unpaidDays,
      unpaidSalaryAmount: unpaidSalary,
      earnedLeaveBalance: leaveBal,
      leaveEncashmentAmount: leaveEncash,
      gratuityEligible: false,
      gratuityAmount: gratuity,
      variablePayOrBonus: bonus,
      noticeShortfallDays: noticeShortfall,
      noticeRecoveryAmount: noticeRecovery,
      pendingLoanEmiRecovery: loanRecovery,
      assetDamageOrLossDeduction: assetDeductions,
      taxTdsDeduction: tds,
      totalEarnings,
      totalDeductions,
      netPayableOrRecoverable: net,
      paymentStatus: 'Draft',
    }

    setFnfSettlements((prev) => [newFnF, ...prev])
    return newFnF
  }

  const approveFnFSettlement = (fnfId: string) => {
    setFnfSettlements((prev) =>
      prev.map((f) => (f.id === fnfId ? { ...f, paymentStatus: 'Approved by Finance' } : f))
    )

    AuditLogService.addLog({
      actorName: 'Finance Head',
      actorRole: 'Finance',
      action: 'APPROVE_FNF_SETTLEMENT',
      targetType: 'Policy',
      targetId: fnfId,
      targetName: 'FnF Settlement Approved',
      featureCode: 'RESIGNATION',
      reason: 'FnF settlement verified with all exit clearance deductions and approved for payout',
    })
  }

  // 6. Rehire Flow
  const processRehire = (formerEmployeeId: string, newEmployeeId: string, notes: string) => {
    setRehireRecords((prev) =>
      prev.map((r) => {
        if (r.formerEmployeeId !== formerEmployeeId) return r
        return {
          ...r,
          linkedNewEmployeeId: newEmployeeId,
          rehireDate: new Date().toISOString().split('T')[0],
          notes: `${r.notes} | Rehire processed into new code ${newEmployeeId}: ${notes}`,
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'PROCESS_REHIRE',
      targetType: 'Employee',
      targetId: newEmployeeId,
      targetName: formerEmployeeId,
      featureCode: 'JOINING_DOCS',
      reason: `Rehired former employee ${formerEmployeeId} into new employee ID ${newEmployeeId}, linking past UAN and seniority records`,
    })
  }

  // 7. Assets Management
  const issueAsset = (assetId: string, employeeId: string, employeeName: string) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a
        return {
          ...a,
          assignedToEmployeeId: employeeId,
          assignedToEmployeeName: employeeName,
          assignedDate: new Date().toISOString().split('T')[0],
          status: 'In Use',
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'IT / Operations Admin',
      actorRole: 'HR Admin',
      action: 'ISSUE_ASSET',
      targetType: 'Employee',
      targetId: assetId,
      targetName: employeeName,
      featureCode: 'ASSET',
      reason: `Issued asset ${assetId} to ${employeeName}`,
    })
  }

  const returnAsset = (assetId: string, condition: AssetRecord['condition'], damagePenalty: number) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== assetId) return a
        return {
          ...a,
          condition,
          returnDate: new Date().toISOString().split('T')[0],
          status: condition === 'Damaged / Needs Repair' ? 'Under Maintenance' : 'Available in Stock',
          damagePenaltyAmount: damagePenalty,
        }
      })
    )

    AuditLogService.addLog({
      actorName: 'IT / Operations Admin',
      actorRole: 'HR Admin',
      action: 'RETURN_ASSET',
      targetType: 'Policy',
      targetId: assetId,
      targetName: condition,
      featureCode: 'ASSET',
      reason: `Asset ${assetId} returned. Condition: ${condition}. Damage penalty: ₹${damagePenalty}`,
    })
  }

  const addAsset = (asset: Omit<AssetRecord, 'id' | 'status' | 'damagePenaltyAmount'>) => {
    const newAsset: AssetRecord = {
      id: `AST-${Date.now().toString().slice(-4)}`,
      ...asset,
      status: asset.assignedToEmployeeId ? 'In Use' : 'Available in Stock',
      damagePenaltyAmount: 0,
    }
    setAssets((prev) => [newAsset, ...prev])
  }

  return (
    <LifecycleContext.Provider
      value={{
        onboardingTemplates,
        employeeOnboardings,
        updateOnboardingTaskStatus,
        agreementTemplates,
        employeeAgreements,
        sendAgreementToEmployee,
        signEmployeeAgreement,
        letterTemplates,
        generatedLetters,
        generateEmployeeLetter,
        resignations,
        submitResignation,
        withdrawResignation,
        managerActionResignation,
        hrApproveResignation,
        exitClearances,
        updateExitClearance,
        fnfSettlements,
        calculateFnF,
        approveFnFSettlement,
        rehireRecords,
        processRehire,
        assets,
        issueAsset,
        returnAsset,
        addAsset,
      }}
    >
      {children}
    </LifecycleContext.Provider>
  )
}

export const useLifecycle = () => {
  const context = useContext(LifecycleContext)
  if (!context) {
    throw new Error('useLifecycle must be used within a LifecycleProvider')
  }
  return context
}
