import React, { createContext, useContext, useState, useMemo } from 'react'
import { AuditLogService } from '@/services/auditLogService'

// 1. POLICY LIBRARY TYPES
export interface PolicyVersionItem {
  version: string
  releaseDate: string
  changedBy: string
  changeSummary: string
}

export interface PolicyAcknowledgement {
  employeeId: string
  employeeName: string
  department: string
  branch: string
  status: 'Acknowledged' | 'Pending' | 'Overdue'
  acknowledgedAt?: string
  ipAddress?: string
  reminderSentAt?: string
}

export interface PolicyDocumentMaster {
  id: string
  code: string
  title: string
  category: 'Corporate Governance' | 'Workplace Safety' | 'Cybersecurity' | 'Compensation & Leave' | 'Ethics & POSH'
  currentVersion: string
  lastUpdated: string
  effectiveDate: string
  summary: string
  fullContent: string
  targetAudience: {
    branch: string // 'All' or specific
    department: string // 'All' or specific
    profile: string // 'All' or specific
  }
  isMandatoryAcknowledgement: boolean
  acknowledgementDeadlineDays: number
  versions: PolicyVersionItem[]
  acknowledgements: PolicyAcknowledgement[]
}

// 2. STATUTORY & LABOUR LAW TYPES
export interface StatePtSlab {
  id: string
  stateName: string
  slabs: {
    minGross: number
    maxGross: number
    ptPerMonth: number
    specialMonthNote?: string
  }[]
  effectiveFrom: string
  status: 'Active' | 'Draft'
  actReference: string
}

export interface MinimumWageSlab {
  id: string
  stateName: string
  zone: string
  skillLevel: 'Unskilled' | 'Semi-Skilled' | 'Skilled' | 'Highly Skilled'
  basicDailyRate: number
  vdaDailyRate: number // Variable Dearness Allowance
  totalDailyRate: number
  monthlyRate: number
  effectiveFrom: string
  notificationRef: string
}

export interface ShopsActRuleItem {
  id: string
  stateName: string
  maxDailyHours: number
  maxWeeklyHours: number
  maxSpreadoverHours: number
  intervalOfRestHours: number
  womenNightShiftAllowed: boolean
  womenNightShiftCutoff: string // e.g. "08:00 PM to 06:00 AM"
  transportMandatoryForWomen: boolean
  overtimeRateMultiplier: number // 2.0x
  effectiveFrom: string
}

// 3. COMPLIANCE ALERTS FEED
export interface ComplianceAlertItem {
  id: string
  title: string
  category: 'EPF & ESI' | 'Labour Laws' | 'POSH & Safety' | 'Taxation & TDS' | 'State PT'
  severity: 'Critical' | 'High' | 'Action Required' | 'Advisory'
  description: string
  effectiveDate: string
  deadlineDate?: string
  sourceAuthority: string
  status: 'Open' | 'Under Review' | 'Resolved'
  actionPlan?: string
  impactedEmployeeCount: number
}

// 4. ANNOUNCEMENTS & BROADCASTS
export interface AnnouncementItem {
  id: string
  title: string
  category: 'Company News' | 'Policy Update' | 'Celebration' | 'Urgent Broadcast' | 'Townhall'
  content: string
  priority: 'Normal' | 'High' | 'Urgent'
  targetBranch: string // 'All' | 'Bengaluru HQ' | 'Mumbai Tech Park' | 'Pune Plant'
  targetDepartment: string
  targetProfile: string
  isPinned: boolean
  publishedAt: string
  authorName: string
  authorAvatar: string
  readCount: number
  totalAudienceCount: number
}

// 5. CELEBRATION SETTINGS
export interface CelebrationSettings {
  birthdayWishTemplate: string
  anniversaryWishTemplate: string
  autoWishEnabled: boolean
  sendMorningNotification: boolean
  visibilityScope: 'Company-wide' | 'Same Branch Only' | 'Same Department Only' | 'Direct Team Only'
  includeWorkAnniversaries: boolean
  notifyManagersDaysBefore: number
}

// 6. HELPDESK & SERVICE DESK
export interface HelpdeskCategoryAdmin {
  id: string
  name: string
  description: string
  defaultAssigneeTeam: string
  responseSlaHours: number
  resolutionSlaHours: number
  priorityLevel: 'Low' | 'Medium' | 'High' | 'Urgent'
  activeTicketsCount: number
  satisfactionScorePct: number
}

// 7. POSH & GRIEVANCE (ICC COMMITTEE)
export interface GrievancePoshCase {
  id: string
  caseNumber: string
  category: 'POSH (Internal Complaints Committee)' | 'Workplace Harassment' | 'Wage & Overtime Dispute' | 'Unfair Treatment' | 'Code of Conduct'
  isAnonymous: boolean
  complainantName: string
  complainantDepartment?: string
  respondentName: string
  respondentDesignation: string
  incidentDate: string
  filedDate: string
  status: 'Under Preliminary Review' | 'ICC Inquiry Constituted' | 'Hearings in Progress' | 'Decision Pending' | 'Case Closed & Action Taken'
  summary: string
  confidentialNotes: {
    id: string
    note: string
    author: string
    timestamp: string
  }[]
  committeeMembers: string[]
  finalVerdict?: string
  correctiveActions?: string
  closureDate?: string
}

// 8. DOCUMENT VAULT & EXPIRY RADAR
export interface ComplianceVaultDocument {
  id: string
  documentName: string
  documentType: 'Work Visa' | 'Commercial Driving License' | 'Medical Fitness Certificate' | 'Fire Safety NOC' | 'FSSAI Food License' | 'Factory Boiler License'
  holderType: 'Employee' | 'Company Facility'
  holderName: string
  holderId: string
  issueDate: string
  expiryDate: string
  issuingAuthority: string
  documentNumber: string
  status: 'Valid' | 'Expiring Soon' | 'Expired'
  daysUntilExpiry: number
  fileName: string
}

interface ComplianceEngagementContextType {
  // Policies
  policies: PolicyDocumentMaster[]
  selectedPolicy: PolicyDocumentMaster | null
  setSelectedPolicyId: (id: string | null) => void
  sendAcknowledgementReminder: (policyId: string, employeeId: string) => void
  sendBulkReminders: (policyId: string) => void
  addNewPolicyVersion: (policyId: string, newVersion: string, changelogNote: string, updatedContent: string) => void
  createPolicy: (newDoc: Omit<PolicyDocumentMaster, 'id' | 'versions' | 'acknowledgements'>) => void

  // Statutory & Labour Law
  ptSlabs: StatePtSlab[]
  minimumWages: MinimumWageSlab[]
  shopsActRules: ShopsActRuleItem[]
  updatePtSlab: (slabId: string, updated: Partial<StatePtSlab>) => void
  updateMinimumWage: (wageId: string, updated: Partial<MinimumWageSlab>) => void
  updateShopsActRule: (ruleId: string, updated: Partial<ShopsActRuleItem>) => void

  // Compliance Alerts
  complianceAlerts: ComplianceAlertItem[]
  resolveAlert: (alertId: string, actionPlan: string) => void
  markAlertUnderReview: (alertId: string) => void

  // Announcements
  announcements: AnnouncementItem[]
  createAnnouncement: (announcement: Omit<AnnouncementItem, 'id' | 'publishedAt' | 'readCount' | 'totalAudienceCount'>) => void
  togglePinAnnouncement: (id: string) => void
  deleteAnnouncement: (id: string) => void

  // Celebrations
  celebrationSettings: CelebrationSettings
  updateCelebrationSettings: (newSettings: Partial<CelebrationSettings>) => void

  // Helpdesk
  helpdeskCategories: HelpdeskCategoryAdmin[]
  updateHelpdeskCategory: (categoryId: string, updated: Partial<HelpdeskCategoryAdmin>) => void
  createHelpdeskCategory: (newCategory: Omit<HelpdeskCategoryAdmin, 'id' | 'activeTicketsCount' | 'satisfactionScorePct'>) => void

  // POSH & Grievance (ICC Committee Mode)
  isIccCommitteeUnlocked: boolean
  setIccCommitteeUnlocked: (unlocked: boolean) => void
  poshCases: GrievancePoshCase[]
  addPoshCaseNote: (caseId: string, noteText: string) => void
  updatePoshCaseStatus: (caseId: string, newStatus: GrievancePoshCase['status'], verdict?: string, correctiveActions?: string) => void

  // Document Vault
  vaultDocuments: ComplianceVaultDocument[]
  renewVaultDocument: (docId: string, newExpiryDate: string, newDocNumber: string) => void
  addVaultDocument: (doc: Omit<ComplianceVaultDocument, 'id' | 'status' | 'daysUntilExpiry'>) => void
  sendDocumentRenewalReminder: (docId: string) => void
}

const ComplianceEngagementContext = createContext<ComplianceEngagementContextType | undefined>(undefined)

// INITIAL MOCK DATA
const INITIAL_POLICIES: PolicyDocumentMaster[] = [
  {
    id: 'POL-01',
    code: 'GOV-2026-01',
    title: 'Code of Business Conduct & Ethics',
    category: 'Corporate Governance',
    currentVersion: 'v3.2',
    lastUpdated: 'Aug 15, 2026',
    effectiveDate: '2026-08-01',
    summary: 'Core principles of ethical decision-making, anti-bribery, fair dealings, and conflict of interest standards.',
    fullContent: 'All workforce personnel are expected to conduct themselves with the utmost integrity, transparency, and compliance with statutory and organizational norms. No employee may solicit or accept gifts from vendors, or disclose proprietary intellectual property without explicit executive authorization.',
    targetAudience: { branch: 'All', department: 'All', profile: 'All' },
    isMandatoryAcknowledgement: true,
    acknowledgementDeadlineDays: 14,
    versions: [
      { version: 'v3.2', releaseDate: 'Aug 15, 2026', changedBy: 'Vikram Malhotra (HR Head)', changeSummary: 'Updated vendor gift threshold limits to ₹2,000 and added digital asset compliance.' },
      { version: 'v3.0', releaseDate: 'Jan 10, 2026', changedBy: 'Legal Counsel', changeSummary: 'Major overhaul aligning with 2026 Indian anti-bribery guidelines.' },
      { version: 'v2.0', releaseDate: 'Jun 12, 2025', changedBy: 'HR Operations', changeSummary: 'Included remote work integrity guidelines.' },
    ],
    acknowledgements: [
      { employeeId: 'EMP-104', employeeName: 'Priya Sharma', department: 'Field Sales', branch: 'Bengaluru HQ', status: 'Acknowledged', acknowledgedAt: '2026-08-16 11:20 AM', ipAddress: '106.51.78.22' },
      { employeeId: 'EMP-112', employeeName: 'Deepak Patel', department: 'Manufacturing', branch: 'Pune Plant', status: 'Acknowledged', acknowledgedAt: '2026-08-17 09:45 AM', ipAddress: '49.36.12.110' },
      { employeeId: 'EMP-115', employeeName: 'Rohan Mehta', department: 'Engineering', branch: 'Mumbai Tech Park', status: 'Pending', reminderSentAt: '2026-09-01 10:00 AM' },
      { employeeId: 'EMP-120', employeeName: 'Ananya Deshpande', department: 'Operations', branch: 'Bengaluru HQ', status: 'Overdue', reminderSentAt: '2026-09-15 02:30 PM' },
    ],
  },
  {
    id: 'POL-02',
    code: 'POSH-2026-04',
    title: 'Prevention of Sexual Harassment (POSH) Policy',
    category: 'Ethics & POSH',
    currentVersion: 'v4.0',
    lastUpdated: 'Sep 01, 2026',
    effectiveDate: '2026-09-01',
    summary: 'Guidelines for maintaining a safe, inclusive workplace free from discrimination and harassment, with Internal Complaints Committee (ICC) procedures.',
    fullContent: 'Our organization strictly enforces zero tolerance for sexual harassment and gender-based discrimination. The Internal Committee (ICC) is empowered to investigate any grievances impartially, ensuring confidentiality and protection from retaliation.',
    targetAudience: { branch: 'All', department: 'All', profile: 'All' },
    isMandatoryAcknowledgement: true,
    acknowledgementDeadlineDays: 7,
    versions: [
      { version: 'v4.0', releaseDate: 'Sep 01, 2026', changedBy: 'ICC Presiding Officer', changeSummary: 'Reconstituted 2026-27 ICC committee member roster with external NGO member details.' },
      { version: 'v3.1', releaseDate: 'Mar 08, 2026', changedBy: 'Legal Dept', changeSummary: 'Added explicit guidelines on virtual harassment and digital communications.' },
    ],
    acknowledgements: [
      { employeeId: 'EMP-104', employeeName: 'Priya Sharma', department: 'Field Sales', branch: 'Bengaluru HQ', status: 'Pending' },
      { employeeId: 'EMP-112', employeeName: 'Deepak Patel', department: 'Manufacturing', branch: 'Pune Plant', status: 'Acknowledged', acknowledgedAt: '2026-09-02 03:15 PM', ipAddress: '49.36.12.110' },
      { employeeId: 'EMP-115', employeeName: 'Rohan Mehta', department: 'Engineering', branch: 'Mumbai Tech Park', status: 'Acknowledged', acknowledgedAt: '2026-09-03 10:05 AM', ipAddress: '157.34.89.5' },
    ],
  },
  {
    id: 'POL-03',
    code: 'SEC-2026-02',
    title: 'Information Security & Digital Vault Standards',
    category: 'Cybersecurity',
    currentVersion: 'v2.1',
    lastUpdated: 'Jul 20, 2026',
    effectiveDate: '2026-07-01',
    summary: 'Rules regarding remote access, password rotation, data masking, and confidential enterprise IP storage.',
    fullContent: 'Employees must adhere to two-factor authentication requirements, secure hardware encryption, and must never export confidential customer or payroll data to unauthorized external drives or devices.',
    targetAudience: { branch: 'All', department: 'Engineering', profile: 'All' },
    isMandatoryAcknowledgement: true,
    acknowledgementDeadlineDays: 14,
    versions: [
      { version: 'v2.1', releaseDate: 'Jul 20, 2026', changedBy: 'Chief Information Security Officer', changeSummary: 'Updated 2FA enforcement and USB port lockdown requirements.' },
    ],
    acknowledgements: [
      { employeeId: 'EMP-115', employeeName: 'Rohan Mehta', department: 'Engineering', branch: 'Mumbai Tech Park', status: 'Acknowledged', acknowledgedAt: '2026-07-22 04:30 PM', ipAddress: '157.34.89.5' },
    ],
  },
]

const INITIAL_PT_SLABS: StatePtSlab[] = [
  {
    id: 'PT-KA',
    stateName: 'Karnataka',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    actReference: 'Karnataka Tax on Professions, Trades, Callings and Employments Act, 1976',
    slabs: [
      { minGross: 0, maxGross: 24999, ptPerMonth: 0 },
      { minGross: 25000, maxGross: 99999999, ptPerMonth: 200 },
    ],
  },
  {
    id: 'PT-MH',
    stateName: 'Maharashtra',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    actReference: 'Maharashtra State Tax on Professions, Trades, Callings and Employments Act, 1975',
    slabs: [
      { minGross: 0, maxGross: 7500, ptPerMonth: 0 },
      { minGross: 7501, maxGross: 10000, ptPerMonth: 175 },
      { minGross: 10001, maxGross: 99999999, ptPerMonth: 200, specialMonthNote: '₹300 in February' },
    ],
  },
  {
    id: 'PT-TG',
    stateName: 'Telangana',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    actReference: 'Telangana Tax on Professions, Trades, Callings and Employments Act',
    slabs: [
      { minGross: 0, maxGross: 15000, ptPerMonth: 0 },
      { minGross: 15001, maxGross: 20000, ptPerMonth: 150 },
      { minGross: 20001, maxGross: 99999999, ptPerMonth: 200 },
    ],
  },
  {
    id: 'PT-WB',
    stateName: 'West Bengal',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    actReference: 'West Bengal State Tax on Professions, Trades, Callings and Employments Act, 1979',
    slabs: [
      { minGross: 0, maxGross: 10000, ptPerMonth: 0 },
      { minGross: 10001, maxGross: 15000, ptPerMonth: 110 },
      { minGross: 15001, maxGross: 25000, ptPerMonth: 130 },
      { minGross: 25001, maxGross: 40000, ptPerMonth: 150 },
      { minGross: 40001, maxGross: 99999999, ptPerMonth: 200 },
    ],
  },
  {
    id: 'PT-DL',
    stateName: 'Delhi (NCT)',
    effectiveFrom: '2026-04-01',
    status: 'Active',
    actReference: 'No Professional Tax levied in NCT of Delhi',
    slabs: [{ minGross: 0, maxGross: 99999999, ptPerMonth: 0 }],
  },
]

const INITIAL_MINIMUM_WAGES: MinimumWageSlab[] = [
  {
    id: 'MW-KA-01',
    stateName: 'Karnataka',
    zone: 'Zone 1 (Bengaluru Urban & BBMP Limits)',
    skillLevel: 'Unskilled',
    basicDailyRate: 485.5,
    vdaDailyRate: 98.2,
    totalDailyRate: 583.7,
    monthlyRate: 15176,
    effectiveFrom: '2026-04-01',
    notificationRef: 'DES/MW/2026/KA-481',
  },
  {
    id: 'MW-KA-02',
    stateName: 'Karnataka',
    zone: 'Zone 1 (Bengaluru Urban & BBMP Limits)',
    skillLevel: 'Semi-Skilled',
    basicDailyRate: 535.0,
    vdaDailyRate: 98.2,
    totalDailyRate: 633.2,
    monthlyRate: 16463,
    effectiveFrom: '2026-04-01',
    notificationRef: 'DES/MW/2026/KA-481',
  },
  {
    id: 'MW-KA-03',
    stateName: 'Karnataka',
    zone: 'Zone 1 (Bengaluru Urban & BBMP Limits)',
    skillLevel: 'Skilled',
    basicDailyRate: 588.5,
    vdaDailyRate: 98.2,
    totalDailyRate: 686.7,
    monthlyRate: 17854,
    effectiveFrom: '2026-04-01',
    notificationRef: 'DES/MW/2026/KA-481',
  },
  {
    id: 'MW-MH-01',
    stateName: 'Maharashtra',
    zone: 'Zone 1 (Pune & Mumbai Municipal Corp)',
    skillLevel: 'Unskilled',
    basicDailyRate: 462.0,
    vdaDailyRate: 112.5,
    totalDailyRate: 574.5,
    monthlyRate: 14937,
    effectiveFrom: '2026-07-01',
    notificationRef: 'MHA/LABOUR/2026-90',
  },
  {
    id: 'MW-MH-02',
    stateName: 'Maharashtra',
    zone: 'Zone 1 (Pune & Mumbai Municipal Corp)',
    skillLevel: 'Skilled',
    basicDailyRate: 570.0,
    vdaDailyRate: 112.5,
    totalDailyRate: 682.5,
    monthlyRate: 17745,
    effectiveFrom: '2026-07-01',
    notificationRef: 'MHA/LABOUR/2026-90',
  },
]

const INITIAL_SHOPS_ACT_RULES: ShopsActRuleItem[] = [
  {
    id: 'SHOP-KA',
    stateName: 'Karnataka',
    maxDailyHours: 9,
    maxWeeklyHours: 48,
    maxSpreadoverHours: 12,
    intervalOfRestHours: 5,
    womenNightShiftAllowed: true,
    womenNightShiftCutoff: '08:00 PM to 06:00 AM (Consent & Safe Cab Drop Mandatory)',
    transportMandatoryForWomen: true,
    overtimeRateMultiplier: 2.0,
    effectiveFrom: '2026-01-01',
  },
  {
    id: 'SHOP-MH',
    stateName: 'Maharashtra',
    maxDailyHours: 9,
    maxWeeklyHours: 48,
    maxSpreadoverHours: 11,
    intervalOfRestHours: 5,
    womenNightShiftAllowed: true,
    womenNightShiftCutoff: '09:30 PM to 07:00 AM (24x7 Security & GPS Cabs Required)',
    transportMandatoryForWomen: true,
    overtimeRateMultiplier: 2.0,
    effectiveFrom: '2026-01-01',
  },
  {
    id: 'SHOP-TG',
    stateName: 'Telangana',
    maxDailyHours: 8,
    maxWeeklyHours: 48,
    maxSpreadoverHours: 12,
    intervalOfRestHours: 4,
    womenNightShiftAllowed: true,
    womenNightShiftCutoff: '08:30 PM to 06:00 AM',
    transportMandatoryForWomen: true,
    overtimeRateMultiplier: 2.0,
    effectiveFrom: '2026-01-01',
  },
]

const INITIAL_COMPLIANCE_ALERTS: ComplianceAlertItem[] = [
  {
    id: 'ALT-01',
    title: 'Proposed EPF Statutory Wage Ceiling Revision to ₹21,000',
    category: 'EPF & ESI',
    severity: 'High',
    description: 'Ministry of Labour & Employment proposal to revise mandatory EPF monthly wage ceiling from ₹15,000 to ₹21,000. Review potential employer contribution budget variance.',
    effectiveDate: 'Proposed Q4 FY 2026-27',
    sourceAuthority: 'Ministry of Labour & Employment (MoL&E) Gazette Draft',
    status: 'Open',
    impactedEmployeeCount: 142,
  },
  {
    id: 'ALT-02',
    title: 'Karnataka State PT Return & Remittance Due for Q2',
    category: 'State PT',
    severity: 'Action Required',
    description: 'Quarterly Professional Tax return e-filing (Form 5A) and electronic remittance due on or before 20th of this month.',
    effectiveDate: '2026-10-20',
    deadlineDate: '2026-10-20',
    sourceAuthority: 'Commercial Taxes Department, Govt of Karnataka',
    status: 'Under Review',
    actionPlan: 'Challan generated in Payroll batch. Pending CFO approval.',
    impactedEmployeeCount: 88,
  },
  {
    id: 'ALT-03',
    title: 'POSH Annual Compliance Report Filing Deadline Approaching',
    category: 'POSH & Safety',
    severity: 'Advisory',
    description: 'Annual report summarizing all complaints received, disposed, and pending by Internal Complaints Committee (ICC) must be submitted to the District Officer by December 31.',
    effectiveDate: '2026-12-31',
    deadlineDate: '2026-12-31',
    sourceAuthority: 'Ministry of Women and Child Development (PoSH Act 2013)',
    status: 'Open',
    impactedEmployeeCount: 340,
  },
]

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ANN-01',
    title: 'Diwali Festive Bonus Disbursement & Extended Long Weekend Schedule',
    category: 'Celebration',
    priority: 'High',
    content: 'We are pleased to announce that statutory and merit Diwali festive bonuses will be credited with October payroll. Our offices will observe optional holiday schedules from Oct 28th to Nov 2nd.',
    targetBranch: 'All',
    targetDepartment: 'All',
    targetProfile: 'All',
    isPinned: true,
    publishedAt: '2026-10-08 09:30 AM',
    authorName: 'Vikram Malhotra (HR Head)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    readCount: 298,
    totalAudienceCount: 340,
  },
  {
    id: 'ANN-02',
    title: 'Mandatory 2FA Enrollment & VPN Standard Upgrade by Oct 31',
    category: 'Policy Update',
    priority: 'Urgent',
    content: 'In accordance with our renewed Cybersecurity Policy (v2.1), all employees connecting remotely or handling financial/HR data must verify their hardware 2FA keys before October 31 to prevent access lockout.',
    targetBranch: 'All',
    targetDepartment: 'Engineering',
    targetProfile: 'Office Staff (Bengaluru)',
    isPinned: false,
    publishedAt: '2026-10-05 02:15 PM',
    authorName: 'Anil Kulkarni (IT Security Lead)',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    readCount: 112,
    totalAudienceCount: 120,
  },
]

const INITIAL_CELEBRATION_SETTINGS: CelebrationSettings = {
  birthdayWishTemplate: 'Wishing you a very Happy Birthday, {employee_name}! May your year ahead be filled with joy, health, and stellar professional milestones! 🎂🎉',
  anniversaryWishTemplate: 'Heartiest congratulations on completing {years} inspiring years at our organization, {employee_name}! Thank you for your dedication as {designation}! 🌟🚀',
  autoWishEnabled: true,
  sendMorningNotification: true,
  visibilityScope: 'Company-wide',
  includeWorkAnniversaries: true,
  notifyManagersDaysBefore: 3,
}

const INITIAL_HELPDESK_CATEGORIES: HelpdeskCategoryAdmin[] = [
  { id: 'HD-CAT-01', name: 'IT Hardware & Workstations', description: 'Laptop repairs, monitors, peripherals, and workstation dock issues.', defaultAssigneeTeam: 'IT Infra Desk', responseSlaHours: 2, resolutionSlaHours: 24, priorityLevel: 'High', activeTicketsCount: 8, satisfactionScorePct: 94 },
  { id: 'HD-CAT-02', name: 'Software, Access & VPN', description: 'License provisioning, password resets, GitHub/Jira access, and cloud VPN.', defaultAssigneeTeam: 'DevOps & IAM', responseSlaHours: 1, resolutionSlaHours: 12, priorityLevel: 'Urgent', activeTicketsCount: 14, satisfactionScorePct: 96 },
  { id: 'HD-CAT-03', name: 'Payroll, Tax & Form 16', description: 'Salary slips, TDS queries, PF UAN linking, bank account updates, and Form 16.', defaultAssigneeTeam: 'Payroll Operations', responseSlaHours: 4, resolutionSlaHours: 48, priorityLevel: 'Medium', activeTicketsCount: 5, satisfactionScorePct: 91 },
  { id: 'HD-CAT-04', name: 'Facilities & Workplace Safety', description: 'Seating, air conditioning, cafeteria hygiene, visitor badges, and parking.', defaultAssigneeTeam: 'Admin & Facilities', responseSlaHours: 4, resolutionSlaHours: 24, priorityLevel: 'Low', activeTicketsCount: 3, satisfactionScorePct: 88 },
  { id: 'HD-CAT-05', name: 'General HR & Employee Relations', description: 'Policy clarifications, background verification documents, and medical insurance cards.', defaultAssigneeTeam: 'People Operations', responseSlaHours: 4, resolutionSlaHours: 36, priorityLevel: 'Medium', activeTicketsCount: 6, satisfactionScorePct: 92 },
]

const INITIAL_POSH_CASES: GrievancePoshCase[] = [
  {
    id: 'CASE-2026-08',
    caseNumber: 'POSH/2026/KA-08',
    category: 'POSH (Internal Complaints Committee)',
    isAnonymous: false,
    complainantName: 'Confidential Complainant',
    complainantDepartment: 'Field Sales',
    respondentName: 'Senior Regional Manager',
    respondentDesignation: 'Associate Director',
    incidentDate: '2026-09-18',
    filedDate: '2026-09-20',
    status: 'Hearings in Progress',
    summary: 'Allegations of inappropriate verbal remarks and unwelcome conduct during regional offsite dinner in Goa.',
    confidentialNotes: [
      { id: 'N-1', note: 'Formal complaint received and acknowledged by Presiding Officer within 24 hours.', author: 'Dr. Sudha Rao (External NGO Presiding Officer)', timestamp: '2026-09-21 11:30 AM' },
      { id: 'N-2', note: 'Respondent notified. Written response submitted to ICC within statutory 10-day window.', author: 'Kavita Salunkhe (Plant HR & ICC Secretary)', timestamp: '2026-09-28 04:00 PM' },
      { id: 'N-3', note: 'Preliminary hearing conducted with complainant in Bengaluru confidential meeting room.', author: 'Dr. Sudha Rao', timestamp: '2026-10-04 02:00 PM' },
    ],
    committeeMembers: [
      'Dr. Sudha Rao (External Member, NGO Prerana)',
      'Kavita Salunkhe (ICC Member Secretary)',
      'Deepa Ramachandran (Sr. Director Engineering)',
      'Arun Varma (General Counsel)',
    ],
  },
  {
    id: 'CASE-2026-05',
    caseNumber: 'GRV/2026/MH-05',
    category: 'Wage & Overtime Dispute',
    isAnonymous: true,
    complainantName: 'Anonymous Whistleblower (Plant Shift Worker)',
    respondentName: 'Shift Supervisor A',
    respondentDesignation: 'Plant Shift Lead',
    incidentDate: '2026-08-14',
    filedDate: '2026-08-18',
    status: 'Case Closed & Action Taken',
    summary: 'Discrepancy in recorded punch hours vs approved overtime multiplier on night shifts at Pune Plant.',
    confidentialNotes: [
      { id: 'N-10', note: 'Biometric punch logs audited against supervisor signoffs. Discrepancy confirmed for 12 workers.', author: 'Audit Lead', timestamp: '2026-08-25 10:00 AM' },
      { id: 'N-11', note: 'Arrears of ₹14,200 credited in September payroll. Warning issued to Shift Lead.', author: 'HR Ops', timestamp: '2026-09-05 03:30 PM' },
    ],
    committeeMembers: ['Vikram Malhotra (HR Head)', 'Internal Grievance Committee'],
    finalVerdict: 'Unintentional roster coding omission confirmed. Corrective arrears payout executed.',
    correctiveActions: 'Standardized biometric punch auto-approval implemented without manual supervisor overrides.',
    closureDate: '2026-09-05',
  },
]

const INITIAL_VAULT_DOCUMENTS: ComplianceVaultDocument[] = [
  {
    id: 'VDOC-01',
    documentName: 'Commercial Boiler Operating License',
    documentType: 'Factory Boiler License',
    holderType: 'Company Facility',
    holderName: 'Pune Plant Boiler Room Unit 2',
    holderId: 'FAC-PUN-01',
    issueDate: '2024-11-01',
    expiryDate: '2026-10-28',
    issuingAuthority: 'Directorate of Steam Boilers, Maharashtra',
    documentNumber: 'MH/BLR/2024/9912',
    status: 'Expiring Soon',
    daysUntilExpiry: 18,
    fileName: 'boiler_safety_certificate_pune.pdf',
  },
  {
    id: 'VDOC-02',
    documentName: 'Employee International Work Visa (US B1/B2)',
    documentType: 'Work Visa',
    holderType: 'Employee',
    holderName: 'Rohan Mehta',
    holderId: 'EMP-115',
    issueDate: '2016-11-15',
    expiryDate: '2026-11-14',
    issuingAuthority: 'US Department of State',
    documentNumber: 'VISA-E9821721',
    status: 'Expiring Soon',
    daysUntilExpiry: 35,
    fileName: 'rohan_mehta_us_visa.pdf',
  },
  {
    id: 'VDOC-03',
    documentName: 'Heavy Vehicle Commercial Driving License',
    documentType: 'Commercial Driving License',
    holderType: 'Employee',
    holderName: 'Suresh Patil (Logistics Fleet)',
    holderId: 'EMP-140',
    issueDate: '2021-08-01',
    expiryDate: '2026-09-30',
    issuingAuthority: 'RTO Bengaluru Central (KA-01)',
    documentNumber: 'KA-01-202100892',
    status: 'Expired',
    daysUntilExpiry: -10,
    fileName: 'dl_suresh_patil_commercial.pdf',
  },
  {
    id: 'VDOC-04',
    documentName: 'Annual Medical Fitness & Audiometry Certificate',
    documentType: 'Medical Fitness Certificate',
    holderType: 'Employee',
    holderName: 'Deepak Patel',
    holderId: 'EMP-112',
    issueDate: '2026-03-10',
    expiryDate: '2027-03-09',
    issuingAuthority: 'Apollo Occupational Health Center',
    documentNumber: 'MED-2026-8819',
    status: 'Valid',
    daysUntilExpiry: 150,
    fileName: 'medical_fitness_deepak_patel.pdf',
  },
  {
    id: 'VDOC-05',
    documentName: 'State Fire Department Safety NOC Certificate',
    documentType: 'Fire Safety NOC',
    holderType: 'Company Facility',
    holderName: 'Bengaluru HQ Campus Tower A & B',
    holderId: 'FAC-BLR-01',
    issueDate: '2025-06-15',
    expiryDate: '2027-06-14',
    issuingAuthority: 'Karnataka State Fire and Emergency Services',
    documentNumber: 'KSFES/NOC/BLR/2025-441',
    status: 'Valid',
    daysUntilExpiry: 247,
    fileName: 'fire_safety_noc_blr_hq.pdf',
  },
]

export const ComplianceEngagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [policies, setPolicies] = useState<PolicyDocumentMaster[]>(INITIAL_POLICIES)
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(INITIAL_POLICIES[0]?.id || null)

  const [ptSlabs, setPtSlabs] = useState<StatePtSlab[]>(INITIAL_PT_SLABS)
  const [minimumWages, setMinimumWages] = useState<MinimumWageSlab[]>(INITIAL_MINIMUM_WAGES)
  const [shopsActRules, setShopsActRules] = useState<ShopsActRuleItem[]>(INITIAL_SHOPS_ACT_RULES)

  const [complianceAlerts, setComplianceAlerts] = useState<ComplianceAlertItem[]>(INITIAL_COMPLIANCE_ALERTS)
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS)
  const [celebrationSettings, setCelebrationSettings] = useState<CelebrationSettings>(INITIAL_CELEBRATION_SETTINGS)
  const [helpdeskCategories, setHelpdeskCategories] = useState<HelpdeskCategoryAdmin[]>(INITIAL_HELPDESK_CATEGORIES)

  const [isIccCommitteeUnlocked, setIccCommitteeUnlocked] = useState<boolean>(false)
  const [poshCases, setPoshCases] = useState<GrievancePoshCase[]>(INITIAL_POSH_CASES)
  const [vaultDocuments, setVaultDocuments] = useState<ComplianceVaultDocument[]>(INITIAL_VAULT_DOCUMENTS)

  const selectedPolicy = useMemo(() => {
    return policies.find((p) => p.id === selectedPolicyId) || null
  }, [policies, selectedPolicyId])

  // 1. Policy Actions
  const sendAcknowledgementReminder = (policyId: string, employeeId: string) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== policyId) return p
        return {
          ...p,
          acknowledgements: p.acknowledgements.map((a) => {
            if (a.employeeId !== employeeId) return a
            return { ...a, reminderSentAt: new Date().toLocaleString() }
          }),
        }
      })
    )

    AuditLogService.addLog({
      action: 'Policy Reminder Sent',
      actorName: 'Admin & Compliance Officer',
      actorRole: 'HR Admin',
      targetType: 'Policy',
      targetId: policyId,
      targetName: `Acknowledgement Reminder sent to ${employeeId}`,
      featureCode: 'ATT_POLICY',
      reason: 'Mandatory statutory policy acceptance tracking',
      notes: `Sent at ${new Date().toISOString()}`,
    })
  }

  const sendBulkReminders = (policyId: string) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== policyId) return p
        return {
          ...p,
          acknowledgements: p.acknowledgements.map((a) => {
            if (a.status === 'Acknowledged') return a
            return { ...a, reminderSentAt: new Date().toLocaleString() }
          }),
        }
      })
    )

    AuditLogService.addLog({
      action: 'Bulk Policy Reminders Sent',
      actorName: 'Admin & Compliance Officer',
      actorRole: 'HR Admin',
      targetType: 'Policy',
      targetId: policyId,
      targetName: 'Bulk Acknowledgement Reminders Dispatched',
      featureCode: 'ATT_POLICY',
      reason: 'Mandatory statutory policy acceptance tracking',
      notes: `Timestamp: ${new Date().toISOString()}`,
    })
  }

  const addNewPolicyVersion = (
    policyId: string,
    newVersion: string,
    changelogNote: string,
    updatedContent: string
  ) => {
    setPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== policyId) return p
        const newVerObj: PolicyVersionItem = {
          version: newVersion,
          releaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          changedBy: 'Admin & Compliance Officer',
          changeSummary: changelogNote,
        }
        return {
          ...p,
          currentVersion: newVersion,
          lastUpdated: newVerObj.releaseDate,
          fullContent: updatedContent,
          versions: [newVerObj, ...p.versions],
          acknowledgements: p.acknowledgements.map((a) => ({
            ...a,
            status: 'Pending',
            acknowledgedAt: undefined,
            reminderSentAt: undefined,
          })),
        }
      })
    )
  }

  const createPolicy = (newDoc: Omit<PolicyDocumentMaster, 'id' | 'versions' | 'acknowledgements'>) => {
    const id = `POL-${String(policies.length + 1).padStart(2, '0')}`
    const policy: PolicyDocumentMaster = {
      ...newDoc,
      id,
      versions: [
        {
          version: newDoc.currentVersion || 'v1.0',
          releaseDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          changedBy: 'Policy Administrator',
          changeSummary: 'Initial policy creation and publication.',
        },
      ],
      acknowledgements: [
        { employeeId: 'EMP-104', employeeName: 'Priya Sharma', department: 'Field Sales', branch: 'Bengaluru HQ', status: 'Pending' },
        { employeeId: 'EMP-112', employeeName: 'Deepak Patel', department: 'Manufacturing', branch: 'Pune Plant', status: 'Pending' },
        { employeeId: 'EMP-115', employeeName: 'Rohan Mehta', department: 'Engineering', branch: 'Mumbai Tech Park', status: 'Pending' },
      ],
    }
    setPolicies((prev) => [policy, ...prev])
  }

  // 2. Statutory Actions
  const updatePtSlab = (slabId: string, updated: Partial<StatePtSlab>) => {
    setPtSlabs((prev) => prev.map((s) => (s.id === slabId ? { ...s, ...updated } : s)))
  }

  const updateMinimumWage = (wageId: string, updated: Partial<MinimumWageSlab>) => {
    setMinimumWages((prev) => prev.map((w) => (w.id === wageId ? { ...w, ...updated } : w)))
  }

  const updateShopsActRule = (ruleId: string, updated: Partial<ShopsActRuleItem>) => {
    setShopsActRules((prev) => prev.map((r) => (r.id === ruleId ? { ...r, ...updated } : r)))
  }

  // 3. Compliance Alerts Actions
  const resolveAlert = (alertId: string, actionPlan: string) => {
    setComplianceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Resolved', actionPlan } : a))
    )
  }

  const markAlertUnderReview = (alertId: string) => {
    setComplianceAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Under Review' } : a))
    )
  }

  // 4. Announcements Actions
  const createAnnouncement = (announcement: Omit<AnnouncementItem, 'id' | 'publishedAt' | 'readCount' | 'totalAudienceCount'>) => {
    const id = `ANN-${String(announcements.length + 1).padStart(2, '0')}`
    const newAnn: AnnouncementItem = {
      ...announcement,
      id,
      publishedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      readCount: 1,
      totalAudienceCount: 340,
    }
    setAnnouncements((prev) => [newAnn, ...prev])
  }

  const togglePinAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isPinned: !a.isPinned } : a))
    )
  }

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  }

  // 5. Celebration Actions
  const updateCelebrationSettings = (newSettings: Partial<CelebrationSettings>) => {
    setCelebrationSettings((prev) => ({ ...prev, ...newSettings }))
  }

  // 6. Helpdesk Actions
  const updateHelpdeskCategory = (categoryId: string, updated: Partial<HelpdeskCategoryAdmin>) => {
    setHelpdeskCategories((prev) => prev.map((c) => (c.id === categoryId ? { ...c, ...updated } : c)))
  }

  const createHelpdeskCategory = (newCategory: Omit<HelpdeskCategoryAdmin, 'id' | 'activeTicketsCount' | 'satisfactionScorePct'>) => {
    const id = `HD-CAT-${String(helpdeskCategories.length + 1).padStart(2, '0')}`
    setHelpdeskCategories((prev) => [
      ...prev,
      { ...newCategory, id, activeTicketsCount: 0, satisfactionScorePct: 100 },
    ])
  }

  // 7. POSH & Grievance Actions
  const addPoshCaseNote = (caseId: string, noteText: string) => {
    setPoshCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        const newNote = {
          id: `N-${Date.now()}`,
          note: noteText,
          author: 'ICC Member / Investigator',
          timestamp: new Date().toLocaleString(),
        }
        return {
          ...c,
          confidentialNotes: [...c.confidentialNotes, newNote],
        }
      })
    )
  }

  const updatePoshCaseStatus = (
    caseId: string,
    newStatus: GrievancePoshCase['status'],
    verdict?: string,
    correctiveActions?: string
  ) => {
    setPoshCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c
        return {
          ...c,
          status: newStatus,
          finalVerdict: verdict || c.finalVerdict,
          correctiveActions: correctiveActions || c.correctiveActions,
          closureDate: newStatus === 'Case Closed & Action Taken' ? new Date().toISOString().split('T')[0] : c.closureDate,
        }
      })
    )
  }

  // 8. Document Vault Actions
  const renewVaultDocument = (docId: string, newExpiryDate: string, newDocNumber: string) => {
    setVaultDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d
        return {
          ...d,
          expiryDate: newExpiryDate,
          documentNumber: newDocNumber,
          status: 'Valid',
          daysUntilExpiry: 365,
        }
      })
    )
  }

  const addVaultDocument = (doc: Omit<ComplianceVaultDocument, 'id' | 'status' | 'daysUntilExpiry'>) => {
    const id = `VDOC-${String(vaultDocuments.length + 1).padStart(2, '0')}`
    const today = new Date()
    const expDate = new Date(doc.expiryDate)
    const diffTime = expDate.getTime() - today.getTime()
    const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const status: ComplianceVaultDocument['status'] =
      daysUntilExpiry < 0 ? 'Expired' : daysUntilExpiry <= 30 ? 'Expiring Soon' : 'Valid'

    setVaultDocuments((prev) => [...prev, { ...doc, id, status, daysUntilExpiry }])
  }

  const sendDocumentRenewalReminder = (docId: string) => {
    AuditLogService.addLog({
      action: 'Document Renewal Reminder',
      actorName: 'Admin & Compliance Officer',
      actorRole: 'HR Admin',
      targetType: 'Policy',
      targetId: docId,
      targetName: `Renewal reminder dispatched for document ${docId}`,
      featureCode: 'ATT_POLICY',
      reason: 'Statutory licence & certificate expiry tracking',
      notes: `Sent at ${new Date().toISOString()}`,
    })
  }

  return (
    <ComplianceEngagementContext.Provider
      value={{
        policies,
        selectedPolicy,
        setSelectedPolicyId,
        sendAcknowledgementReminder,
        sendBulkReminders,
        addNewPolicyVersion,
        createPolicy,
        ptSlabs,
        minimumWages,
        shopsActRules,
        updatePtSlab,
        updateMinimumWage,
        updateShopsActRule,
        complianceAlerts,
        resolveAlert,
        markAlertUnderReview,
        announcements,
        createAnnouncement,
        togglePinAnnouncement,
        deleteAnnouncement,
        celebrationSettings,
        updateCelebrationSettings,
        helpdeskCategories,
        updateHelpdeskCategory,
        createHelpdeskCategory,
        isIccCommitteeUnlocked,
        setIccCommitteeUnlocked,
        poshCases,
        addPoshCaseNote,
        updatePoshCaseStatus,
        vaultDocuments,
        renewVaultDocument,
        addVaultDocument,
        sendDocumentRenewalReminder,
      }}
    >
      {children}
    </ComplianceEngagementContext.Provider>
  )
}

export const useComplianceEngagement = () => {
  const context = useContext(ComplianceEngagementContext)
  if (!context) {
    throw new Error('useComplianceEngagement must be used within a ComplianceEngagementProvider')
  }
  return context
}
