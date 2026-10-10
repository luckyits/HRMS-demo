import type { FeatureDefinition } from './types'

export const FEATURE_CODES = {
  PUNCH: 'PUNCH',
  GEOFENCE: 'GEOFENCE',
  FACE_SELFIE: 'FACE_SELFIE',
  ATT_POLICY: 'ATT_POLICY',
  ATT_BONUS: 'ATT_BONUS',
  SHIFT_ROSTER: 'SHIFT_ROSTER',
  OVERTIME: 'OVERTIME',
  TIMESHEET: 'TIMESHEET',
  VISIT: 'VISIT',
  EXPENSE: 'EXPENSE',
  LEAVE: 'LEAVE',
  COMPOFF: 'COMPOFF',
  HOLIDAY: 'HOLIDAY',
  PAYROLL: 'PAYROLL',
  PAYSLIP: 'PAYSLIP',
  FINANCE: 'FINANCE',
  INCENTIVE: 'INCENTIVE',
  CALENDAR: 'CALENDAR',
  BIRTHDAY_ANNIV: 'BIRTHDAY_ANNIV',
  PROFILE: 'PROFILE',
  POLICY: 'POLICY',
  AGREEMENT: 'AGREEMENT',
  JOINING_DOCS: 'JOINING_DOCS',
  RESIGNATION: 'RESIGNATION',
  REGULARIZATION: 'REGULARIZATION',
  DOC_VAULT: 'DOC_VAULT',
  ASSET: 'ASSET',
  HELPDESK: 'HELPDESK',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  ORG_CHART: 'ORG_CHART',
  TRAINING: 'TRAINING',
  PERFORMANCE: 'PERFORMANCE',
  RECRUITMENT: 'RECRUITMENT',
  MSS_APPROVALS: 'MSS_APPROVALS',
  TEAM_REPORTS: 'TEAM_REPORTS',
  ENGAGEMENT: 'ENGAGEMENT',
} as const

export const FEATURE_MASTER: FeatureDefinition[] = [
  // 1. Time & Attendance
  { code: 'PUNCH', name: 'Web & Mobile Punch In/Out', module: 'Attendance', icon: 'Clock', is_core: true, description: 'Daily attendance mark and check-in' },
  { code: 'GEOFENCE', name: 'Geofenced Attendance', module: 'Attendance', icon: 'MapPin', depends_on: ['PUNCH'], description: 'Location boundary radius enforcement' },
  { code: 'FACE_SELFIE', name: 'Face Match / Selfie Verification', module: 'Attendance', icon: 'Camera', depends_on: ['PUNCH'], description: 'Selfie capture and facial audit' },
  { code: 'ATT_POLICY', name: 'Attendance & Late-Mark Policies', module: 'Attendance', icon: 'ShieldCheck', is_core: true, description: 'Grace periods, late mark penalties' },
  { code: 'ATT_BONUS', name: 'Attendance Bonus & Incentives', module: 'Attendance', icon: 'Coins', depends_on: ['ATT_POLICY'], description: 'Zero absenteeism monthly incentives' },
  { code: 'SHIFT_ROSTER', name: 'Shift Roster & Rotations', module: 'Attendance', icon: 'CalendarDays', description: 'Multi-shift weekly planning and swaps' },
  { code: 'OVERTIME', name: 'Overtime Calculation & Hours', module: 'Attendance', icon: 'ClockAlert', depends_on: ['ATT_POLICY'], description: 'Double rate OT rules & supervisor signoff' },
  { code: 'TIMESHEET', name: 'Project Timesheets & Tasks', module: 'Attendance', icon: 'FileSpreadsheet', description: 'Billable client hours and task breakdown' },
  { code: 'REGULARIZATION', name: 'Attendance Regularization', module: 'Attendance', icon: 'FileEdit', depends_on: ['PUNCH'], description: 'Correction requests for missed punches' },

  // 2. Leaves & Holidays
  { code: 'LEAVE', name: 'Leave Application & Wallets', module: 'Leave', icon: 'CalendarCheck', is_core: true, description: 'Annual, casual, sick and maternity quotas' },
  { code: 'COMPOFF', name: 'Compensatory Off Tracking', module: 'Leave', icon: 'CalendarPlus', depends_on: ['LEAVE'], description: 'Weekend duty compensation credits' },
  { code: 'HOLIDAY', name: 'Holiday Calendar & Optional Days', module: 'Leave', icon: 'CalendarHeart', is_core: true, description: 'National, state and festival calendar' },

  // 3. Field & Claims
  { code: 'VISIT', name: 'Client Visits & GPS Geo-Tracking', module: 'Field Sales', icon: 'Navigation', description: 'Beats, client check-ins and location logs' },
  { code: 'EXPENSE', name: 'Expense Reimbursements & Claims', module: 'Claims', icon: 'Receipt', description: 'Travel, food, lodging voucher submissions' },
  { code: 'INCENTIVE', name: 'Sales Incentives & Commissions', module: 'Payroll', icon: 'TrendingUp', description: 'Volume bonuses and milestone commissions' },

  // 4. Payroll & Finance
  { code: 'PAYROLL', name: 'Payroll Run & Statutory Deductions', module: 'Payroll', icon: 'Banknote', is_core: true, description: 'Salary register, PF/ESI/PT tax deductions' },
  { code: 'PAYSLIP', name: 'Employee Payslips & Form 16', module: 'Payroll', icon: 'FileText', is_core: true, description: 'Downloadable pay vouchers and year-end forms' },
  { code: 'FINANCE', name: 'Salary Advances & Loans', module: 'Finance', icon: 'CreditCard', description: 'Company loan management and EMI deductions' },

  // 5. Employee Self Service & Documents
  { code: 'PROFILE', name: 'Employee Master Profile', module: 'ESS', icon: 'User', is_core: true, description: 'Personal, contact, and statutory profile' },
  { code: 'CALENDAR', name: 'Personal Work Calendar', module: 'ESS', icon: 'Calendar', is_core: true, description: 'Combined shift, leave and holiday schedule' },
  { code: 'BIRTHDAY_ANNIV', name: 'Birthdays & Work Anniversaries', module: 'ESS', icon: 'Cake', description: 'Social greetings and peer recognitions' },
  { code: 'POLICY', name: 'Company Policy Repository', module: 'Governance', icon: 'BookOpen', description: 'Employee handbook, code of conduct' },
  { code: 'AGREEMENT', name: 'Contracts & Non-Disclosure Agreements', module: 'Governance', icon: 'FileCode', description: 'Service bonds, IP agreements' },
  { code: 'JOINING_DOCS', name: 'Onboarding & Joining Documents', module: 'Onboarding', icon: 'FolderPlus', is_core: true, description: 'Certificates, identity proof verification' },
  { code: 'DOC_VAULT', name: 'Employee Digital Document Vault', module: 'Documents', icon: 'Archive', description: 'Secure encrypted document depository' },
  { code: 'RESIGNATION', name: 'Resignation & Separation Process', module: 'Lifecycle', icon: 'UserMinus', description: 'Notice period, handover and exit clearance' },

  // 6. Organization & Operations
  { code: 'ASSET', name: 'Company Asset Tracking', module: 'Operations', icon: 'Laptop', description: 'Hardware, ID cards, uniform and tool issuance' },
  { code: 'HELPDESK', name: 'HR Internal Helpdesk Tickets', module: 'Support', icon: 'LifeBuoy', description: 'Query resolution SLA workflow' },
  { code: 'ANNOUNCEMENT', name: 'Broadcast Bulletins & News', module: 'Communication', icon: 'Megaphone', description: 'Company-wide townhalls and alerts' },
  { code: 'ORG_CHART', name: 'Interactive Organization Hierarchy', module: 'Organization', icon: 'GitMerge', description: 'Reporting lines and functional tree' },
  { code: 'TRAINING', name: 'L&D / Training Modules', module: 'Learning', icon: 'GraduationCap', description: 'Courses, certifications and assessments' },
  { code: 'PERFORMANCE', name: 'Performance Appraisals & OKRs', module: 'Performance', icon: 'Target', description: 'Annual reviews, KPI rating matrix' },
  { code: 'RECRUITMENT', name: 'Recruitment & Candidate Tracking', module: 'Talent', icon: 'Briefcase', description: 'ATS pipeline, interview rounds, offers' },
  { code: 'ENGAGEMENT', name: 'Employee Engagement & Surveys', module: 'Engagement', icon: 'HeartHandshake', description: 'Pulse surveys, quick polls, and sentiment tracking' },

  // 7. Manager Specific
  { code: 'MSS_APPROVALS', name: 'Manager Self-Service Approvals', module: 'Manager', icon: 'CheckSquare', description: 'Action on team leaves, expenses, regularizations' },
  { code: 'TEAM_REPORTS', name: 'Direct Team Performance & Analytics', module: 'Manager', icon: 'BarChart2', description: 'Subordinate attendance summaries and reports' },
]

export const FEATURE_MAP = new Map<string, FeatureDefinition>(
  FEATURE_MASTER.map((f) => [f.code, f])
)
