import type { ActionPermission, DataScope, FeatureGrant } from '@/access/types'
import type { CompanyType } from '@/types'

export interface CompanyEntity {
  id: string
  name: string
  code: string
  industry: CompanyType
  headquarters: string
  branches: string[]
  departments: string[]
  featureToggles: Record<string, FeatureGrant>
}

// 3 Real Companies + Template Settings
export const MOCK_COMPANIES: CompanyEntity[] = [
  // 1. IT Office Company
  {
    id: 'COMP-001',
    name: 'Apex Technologies Pvt Ltd',
    code: 'APEX',
    industry: 'IT',
    headquarters: 'Bengaluru Tech Park',
    branches: ['Bengaluru HQ', 'Pune Dev Center', 'Hyderabad Hub'],
    departments: ['Engineering', 'Product & Design', 'Sales & Mktg', 'People Operations'],
    featureToggles: {
      PUNCH: { state: 'Allow' },
      TIMESHEET: { state: 'Allow' },
      FACE_SELFIE: { state: 'Allow' },
      GEOFENCE: { state: 'Allow' },
      VISIT: { state: 'Allow' },
      OVERTIME: { state: 'Deny', locked: false }, // Typically exempt for IT
      ATT_BONUS: { state: 'Deny' },
      SHIFT_ROSTER: { state: 'Allow' },
      LEAVE: { state: 'Allow' },
      PAYROLL: { state: 'Allow' },
      PAYSLIP: { state: 'Allow' },
      FINANCE: { state: 'Allow' },
      EXPENSE: { state: 'Allow' },
      MSS_APPROVALS: { state: 'Allow' },
      TEAM_REPORTS: { state: 'Allow' },
    },
  },

  // 2. Factory / Manufacturing Company
  {
    id: 'COMP-002',
    name: 'Bharat Heavy Forge & Tooling Ltd',
    code: 'BHARAT',
    industry: 'Manufacturing',
    headquarters: 'Pune Industrial Area',
    branches: ['Pune Plant 1', 'Pune Plant 2', 'Mumbai Corp Office'],
    departments: ['Plant Operations', 'Quality & Tooling', 'Supply Chain', 'HR & Safety'],
    featureToggles: {
      PUNCH: { state: 'Allow' },
      SHIFT_ROSTER: { state: 'Allow', locked: true }, // Plant mandatory locked
      OVERTIME: { state: 'Allow', locked: true }, // Double rate OT mandatory
      ATT_BONUS: { state: 'Allow' },
      FACE_SELFIE: { state: 'Allow' },
      GEOFENCE: { state: 'Allow' },
      VISIT: { state: 'Deny', locked: false }, // Not a field company
      TIMESHEET: { state: 'Deny' },
      LEAVE: { state: 'Allow' },
      PAYROLL: { state: 'Allow' },
      PAYSLIP: { state: 'Allow' },
      FINANCE: { state: 'Allow' },
      EXPENSE: { state: 'Deny' }, // Limited expense claims for factory workers
      MSS_APPROVALS: { state: 'Allow' },
      TEAM_REPORTS: { state: 'Allow' },
    },
  },

  // 3. Field Sales & Distribution
  {
    id: 'COMP-003',
    name: 'Zenith FMCG Logistics & Retail Distributors',
    code: 'ZENITH',
    industry: 'Field Sales',
    headquarters: 'Ahmedabad Logistics Park',
    branches: ['Ahmedabad Hub', 'Surat Depot', 'Vadodara Hub'],
    departments: ['Field Sales', 'Logistics & Fleet', 'Key Accounts', 'Admin'],
    featureToggles: {
      PUNCH: { state: 'Allow' },
      VISIT: { state: 'Allow', locked: true }, // GPS client visits mandatory
      EXPENSE: { state: 'Allow', locked: true }, // Field travel vouchers mandatory
      INCENTIVE: { state: 'Allow' },
      FACE_SELFIE: { state: 'Allow' },
      GEOFENCE: { state: 'Allow' },
      SHIFT_ROSTER: { state: 'Deny' },
      OVERTIME: { state: 'Deny' },
      TIMESHEET: { state: 'Deny' },
      LEAVE: { state: 'Allow' },
      PAYROLL: { state: 'Allow' },
      PAYSLIP: { state: 'Allow' },
      FINANCE: { state: 'Allow' },
      MSS_APPROVALS: { state: 'Allow' },
      TEAM_REPORTS: { state: 'Allow' },
    },
  },
]

// Company Type Templates rules (Ceiling features at company level)
export function getCompanyTemplateToggles(companyType: CompanyType): Record<string, FeatureGrant> {
  const baseToggles: Record<string, FeatureGrant> = {
    PUNCH: { state: 'Allow' },
    LEAVE: { state: 'Allow' },
    HOLIDAY: { state: 'Allow' },
    PAYSLIP: { state: 'Allow' },
    PROFILE: { state: 'Allow' },
  }

  switch (companyType) {
    case 'School':
      return {
        ...baseToggles,
        VISIT: { state: 'Deny', locked: true }, // Schools hide client visits
        OVERTIME: { state: 'Deny', locked: true }, // Schools hide factory overtime
        SHIFT_ROSTER: { state: 'Allow' },
        CALENDAR: { state: 'Allow' },
        MSS_APPROVALS: { state: 'Allow' },
        TEAM_REPORTS: { state: 'Allow' },
      }

    case 'Small Shop':
      // Minimal essentials only: Punch, Leave and Payslip
      return {
        PUNCH: { state: 'Allow' },
        LEAVE: { state: 'Allow' },
        PAYSLIP: { state: 'Allow' },
        PROFILE: { state: 'Allow' },
        HOLIDAY: { state: 'Allow' },
        REGULARIZATION: { state: 'Deny', locked: true },
        EXPENSE: { state: 'Deny', locked: true },
        FINANCE: { state: 'Deny', locked: true },
        VISIT: { state: 'Deny', locked: true },
        OVERTIME: { state: 'Deny', locked: true },
        TIMESHEET: { state: 'Deny', locked: true },
        SHIFT_ROSTER: { state: 'Deny', locked: true },
        MSS_APPROVALS: { state: 'Deny', locked: true },
        TEAM_REPORTS: { state: 'Deny', locked: true },
        ASSET: { state: 'Deny', locked: true },
        RECRUITMENT: { state: 'Deny', locked: true },
        BIRTHDAY_ANNIV: { state: 'Deny', locked: true },
        ANNOUNCEMENT: { state: 'Deny', locked: true },
      }

    case 'Hospital':
      return {
        ...baseToggles,
        SHIFT_ROSTER: { state: 'Allow', locked: true }, // 24x7 Emergency shifts
        OVERTIME: { state: 'Allow' },
        VISIT: { state: 'Deny' },
        TIMESHEET: { state: 'Allow' },
        MSS_APPROVALS: { state: 'Allow' },
        TEAM_REPORTS: { state: 'Allow' },
      }

    case 'Manufacturing':
    case 'Construction':
      return {
        ...baseToggles,
        SHIFT_ROSTER: { state: 'Allow', locked: true },
        OVERTIME: { state: 'Allow', locked: true },
        ATT_BONUS: { state: 'Allow' },
        FACE_SELFIE: { state: 'Allow' },
        VISIT: { state: 'Deny' },
        MSS_APPROVALS: { state: 'Allow' },
        TEAM_REPORTS: { state: 'Allow' },
      }

    case 'Retail':
      return {
        ...baseToggles,
        SHIFT_ROSTER: { state: 'Allow' },
        OVERTIME: { state: 'Allow' },
        EXPENSE: { state: 'Allow' },
        MSS_APPROVALS: { state: 'Allow' },
        TEAM_REPORTS: { state: 'Allow' },
      }

    case 'Field Sales':
    case 'Logistics':
      return {
        ...baseToggles,
        VISIT: { state: 'Allow', locked: true },
        EXPENSE: { state: 'Allow', locked: true },
        INCENTIVE: { state: 'Allow' },
        FACE_SELFIE: { state: 'Allow' },
        MSS_APPROVALS: { state: 'Allow' },
        TEAM_REPORTS: { state: 'Allow' },
      }

    case 'IT':
    default:
      return {
        ...baseToggles,
        TIMESHEET: { state: 'Allow' },
        SHIFT_ROSTER: { state: 'Allow' },
        EXPENSE: { state: 'Allow' },
        MSS_APPROVALS: { state: 'Allow' },
        TEAM_REPORTS: { state: 'Allow' },
        VISIT: { state: 'Allow' },
      }
  }
}
