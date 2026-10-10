import React, { createContext, useContext, useState } from 'react'
import type { ApprovalStep } from '@/components/common/ApprovalTimeline'

export interface OvertimePolicy {
  id: string
  name: string
  normalDayMultiplier: number // e.g. 1.5
  weeklyOffMultiplier: number // e.g. 2.0
  holidayMultiplier: number // e.g. 2.5
  minMinutesToQualify: number // e.g. 30
  dailyCapHours: number // e.g. 3.0
  monthlyCapHours: number // e.g. 45.0
  settlementMode: 'employee_choice' | 'pay_only' | 'compoff_only'
  roundingIntervalMinutes: number // 15
  preApprovalRequired: boolean
  allowWeeklyOffCompOff: boolean
  updatedAt: string
}

export interface OvertimeRequest {
  id: string
  employeeId: string
  employeeName: string
  employeeAvatar: string
  designation: string
  department: string
  branch: string
  shiftName: string
  date: string
  hours: number
  dayType: 'normal' | 'weekly_off' | 'holiday'
  multiplier: number
  settlementPreference: 'pay' | 'compoff'
  settlementCalculatedAmount: number // hours * 150/hr * multiplier
  settlementCompOffDays: number
  reason: string
  isPreApproved: boolean
  status: 'pending_supervisor' | 'pending_plant_hr' | 'approved' | 'rejected'
  timeline: ApprovalStep[]
  createdAt: string
}

export interface BonusSlab {
  id: string
  tierName: string
  minPresentDays: number
  maxLateMarks: number
  maxUnapprovedLeaves: number
  bonusAmount: number
  badgeColor: string
}

export interface AttendanceBonusPolicy {
  id: string
  name: string
  targetMonth: string
  totalWorkingDays: number
  baseBonusAmount: number
  slabs: BonusSlab[]
  disqualifyOnAnyLossOfPay: boolean
  disqualifyOnMissedPunches: boolean
  active: boolean
}

export interface BonusEligibilityRecord {
  employeeId: string
  employeeName: string
  avatar: string
  designation: string
  department: string
  profileType: string
  totalWorkingDays: number
  daysPresent: number
  lateMarksCount: number
  unapprovedAbsences: number
  isEligible: boolean
  achievedTier?: string
  bonusAmount: number
  ineligibilityReason?: string
  progressDaysRemaining: number
  lateMarksRemaining: number
}

export interface CompOffRecord {
  id: string
  employeeId: string
  dateEarned: string
  dutyDescription: string
  daysCredited: number
  daysUsed: number
  daysRemaining: number
  expiryDate: string
  expiresInDays: number
  status: 'active' | 'expiring_soon' | 'expired' | 'utilized'
}

interface OvertimeBonusContextType {
  otPolicy: OvertimePolicy
  updateOtPolicy: (policy: Partial<OvertimePolicy>) => void
  otRequests: OvertimeRequest[]
  requestOvertime: (req: Omit<OvertimeRequest, 'id' | 'status' | 'timeline' | 'createdAt'>) => void
  supervisorApproveOt: (id: string, comments?: string) => void
  supervisorRejectOt: (id: string, comments?: string) => void
  plantHrApproveOt: (id: string, comments?: string) => void
  plantHrRejectOt: (id: string, comments?: string) => void
  bonusPolicy: AttendanceBonusPolicy
  updateBonusPolicy: (policy: Partial<AttendanceBonusPolicy>) => void
  bonusRecords: BonusEligibilityRecord[]
  compOffRecords: CompOffRecord[]
}

const INITIAL_OT_POLICY: OvertimePolicy = {
  id: 'POL-OT-001',
  name: 'Standard Plant & Manufacturing OT Scheme',
  normalDayMultiplier: 1.5,
  weeklyOffMultiplier: 2.0,
  holidayMultiplier: 2.5,
  minMinutesToQualify: 30,
  dailyCapHours: 3.0,
  monthlyCapHours: 40.0,
  settlementMode: 'employee_choice',
  roundingIntervalMinutes: 15,
  preApprovalRequired: true,
  allowWeeklyOffCompOff: true,
  updatedAt: '2026-10-01',
}

const INITIAL_BONUS_POLICY: AttendanceBonusPolicy = {
  id: 'POL-BONUS-2026',
  name: 'Monthly 100% Attendance & Punctuality Incentive',
  targetMonth: 'October 2026',
  totalWorkingDays: 26,
  baseBonusAmount: 1000,
  disqualifyOnAnyLossOfPay: true,
  disqualifyOnMissedPunches: true,
  active: true,
  slabs: [
    {
      id: 'slab-1',
      tierName: 'Tier 1: Perfect Full Attendance (100%)',
      minPresentDays: 26,
      maxLateMarks: 0,
      maxUnapprovedLeaves: 0,
      bonusAmount: 1000,
      badgeColor: 'emerald',
    },
    {
      id: 'slab-2',
      tierName: 'Tier 2: High Regularity (25 Days, ≤1 Late Mark)',
      minPresentDays: 25,
      maxLateMarks: 1,
      maxUnapprovedLeaves: 0,
      bonusAmount: 700,
      badgeColor: 'blue',
    },
    {
      id: 'slab-3',
      tierName: 'Tier 3: Standard Attendance (24 Days, ≤2 Late Marks)',
      minPresentDays: 24,
      maxLateMarks: 2,
      maxUnapprovedLeaves: 0,
      bonusAmount: 400,
      badgeColor: 'amber',
    },
  ],
}

const INITIAL_OT_REQUESTS: OvertimeRequest[] = [
  {
    id: 'OT-REQ-101',
    employeeId: 'EMP-010',
    employeeName: 'Gopal Shinde',
    employeeAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    designation: 'CNC Milling Master Technician',
    department: 'Plant Operations',
    branch: 'Pune Plant 1',
    shiftName: 'Shift A (06:00 - 14:30)',
    date: '2026-10-08',
    hours: 3.5,
    dayType: 'normal',
    multiplier: 1.5,
    settlementPreference: 'pay',
    settlementCalculatedAmount: 1050,
    settlementCompOffDays: 0.5,
    reason: 'Emergency tooling backlog clearance for automotive chassis batch',
    isPreApproved: true,
    status: 'pending_supervisor',
    createdAt: '2026-10-08 17:30',
    timeline: [
      {
        id: 'step-1',
        title: 'Level 1: Shift Supervisor',
        approverName: 'Rajesh Verma',
        approverRole: 'Plant Shift Superintendent',
        status: 'pending',
      },
      {
        id: 'step-2',
        title: 'Level 2: Plant HR Signoff',
        approverName: 'Kavita Salunkhe',
        approverRole: 'Plant HR Officer',
        status: 'waiting',
      },
    ],
  },
  {
    id: 'OT-REQ-102',
    employeeId: 'EMP-011',
    employeeName: 'Santosh Yadav',
    employeeAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    designation: 'Heat Treatment Furnace Operator',
    department: 'Plant Operations',
    branch: 'Pune Plant 1',
    shiftName: 'Shift B (14:00 - 22:30)',
    date: '2026-10-05',
    hours: 8.0,
    dayType: 'weekly_off',
    multiplier: 2.0,
    settlementPreference: 'compoff',
    settlementCalculatedAmount: 3200,
    settlementCompOffDays: 1.0,
    reason: 'Sunday furnace refractory maintenance and high-temp heat cycling',
    isPreApproved: true,
    status: 'pending_plant_hr',
    createdAt: '2026-10-05 23:00',
    timeline: [
      {
        id: 'step-1',
        title: 'Level 1: Shift Supervisor',
        approverName: 'Rajesh Verma',
        approverRole: 'Plant Shift Superintendent',
        status: 'approved',
        timestamp: '2026-10-06 08:30 AM',
        comments: 'Verified Sunday physical attendance and furnace maintenance log.',
      },
      {
        id: 'step-2',
        title: 'Level 2: Plant HR Signoff',
        approverName: 'Kavita Salunkhe',
        approverRole: 'Plant HR Officer',
        status: 'pending',
      },
    ],
  },
  {
    id: 'OT-REQ-103',
    employeeId: 'EMP-012',
    employeeName: 'Babu Rao Ganpat',
    employeeAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    designation: 'Assembly Line Specialist',
    department: 'Plant Operations',
    branch: 'Pune Plant 2',
    shiftName: 'Shift C (22:00 - 06:30)',
    date: '2026-10-02',
    hours: 4.0,
    dayType: 'holiday',
    multiplier: 2.5,
    settlementPreference: 'pay',
    settlementCalculatedAmount: 2000,
    settlementCompOffDays: 0.5,
    reason: 'Gandhi Jayanti urgent export container loading',
    isPreApproved: true,
    status: 'approved',
    createdAt: '2026-10-02 18:00',
    timeline: [
      {
        id: 'step-1',
        title: 'Level 1: Shift Supervisor',
        approverName: 'Rajesh Verma',
        approverRole: 'Plant Shift Superintendent',
        status: 'approved',
        timestamp: '2026-10-03 09:15 AM',
        comments: 'Critical export dispatch target met.',
      },
      {
        id: 'step-2',
        title: 'Level 2: Plant HR Signoff',
        approverName: 'Kavita Salunkhe',
        approverRole: 'Plant HR Officer',
        status: 'approved',
        timestamp: '2026-10-03 14:00 PM',
        comments: 'Holiday OT payout registered for Oct payroll run.',
      },
    ],
  },
  {
    id: 'OT-REQ-104',
    employeeId: 'EMP-013',
    employeeName: 'Mahesh Jadhav',
    employeeAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    designation: 'Safety & Quality Inspector',
    department: 'Quality & Tooling',
    branch: 'Pune Plant 1',
    shiftName: 'Shift A (06:00 - 14:30)',
    date: '2026-09-28',
    hours: 2.0,
    dayType: 'normal',
    multiplier: 1.5,
    settlementPreference: 'pay',
    settlementCalculatedAmount: 600,
    settlementCompOffDays: 0.0,
    reason: 'Unplanned calibration check after shift change',
    isPreApproved: false,
    status: 'rejected',
    createdAt: '2026-09-28 17:00',
    timeline: [
      {
        id: 'step-1',
        title: 'Level 1: Shift Supervisor',
        approverName: 'Rajesh Verma',
        approverRole: 'Plant Shift Superintendent',
        status: 'rejected',
        timestamp: '2026-09-29 10:00 AM',
        comments: 'No prior approval or authorization from QA head was logged.',
      },
      {
        id: 'step-2',
        title: 'Level 2: Plant HR Signoff',
        approverName: 'Kavita Salunkhe',
        approverRole: 'Plant HR Officer',
        status: 'waiting',
      },
    ],
  },
]

const INITIAL_BONUS_RECORDS: BonusEligibilityRecord[] = [
  {
    employeeId: 'EMP-010',
    employeeName: 'Gopal Shinde',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    designation: 'CNC Milling Master Technician',
    department: 'Plant Operations',
    profileType: 'Factory Worker',
    totalWorkingDays: 26,
    daysPresent: 24,
    lateMarksCount: 0,
    unapprovedAbsences: 0,
    isEligible: true,
    achievedTier: 'Tier 1: Perfect Full Attendance (100%)',
    bonusAmount: 1000,
    progressDaysRemaining: 2,
    lateMarksRemaining: 0,
  },
  {
    employeeId: 'EMP-011',
    employeeName: 'Santosh Yadav',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    designation: 'Heat Treatment Furnace Operator',
    department: 'Plant Operations',
    profileType: 'Factory Worker',
    totalWorkingDays: 26,
    daysPresent: 25,
    lateMarksCount: 1,
    unapprovedAbsences: 0,
    isEligible: true,
    achievedTier: 'Tier 2: High Regularity (25 Days, ≤1 Late Mark)',
    bonusAmount: 700,
    progressDaysRemaining: 1,
    lateMarksRemaining: 0,
  },
  {
    employeeId: 'EMP-012',
    employeeName: 'Babu Rao Ganpat',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    designation: 'Assembly Line Specialist',
    department: 'Plant Operations',
    profileType: 'Factory Worker',
    totalWorkingDays: 26,
    daysPresent: 22,
    lateMarksCount: 3,
    unapprovedAbsences: 1,
    isEligible: false,
    bonusAmount: 0,
    ineligibilityReason: 'Disqualified: 1 Unapproved Absence on 4th Oct & 3 Late Marks (exceeded limit of 2)',
    progressDaysRemaining: 4,
    lateMarksRemaining: 0,
  },
  {
    employeeId: 'EMP-013',
    employeeName: 'Mahesh Jadhav',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    designation: 'Safety & Quality Inspector',
    department: 'Quality & Tooling',
    profileType: 'Factory Worker',
    totalWorkingDays: 26,
    daysPresent: 24,
    lateMarksCount: 2,
    unapprovedAbsences: 0,
    isEligible: true,
    achievedTier: 'Tier 3: Standard Attendance (24 Days, ≤2 Late Marks)',
    bonusAmount: 400,
    progressDaysRemaining: 2,
    lateMarksRemaining: 0,
  },
  {
    employeeId: 'EMP-003',
    employeeName: 'Aarav Patel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    designation: 'Senior Frontend Engineer',
    department: 'Engineering',
    profileType: 'Office Staff',
    totalWorkingDays: 26,
    daysPresent: 21,
    lateMarksCount: 0,
    unapprovedAbsences: 0,
    isEligible: false,
    bonusAmount: 0,
    ineligibilityReason: 'Profile Ineligible: Attendance Bonus policy restricted to Factory & Plant profiles',
    progressDaysRemaining: 5,
    lateMarksRemaining: 0,
  },
]

const INITIAL_COMPOFF_RECORDS: CompOffRecord[] = [
  {
    id: 'CMP-001',
    employeeId: 'EMP-010',
    dateEarned: '2026-09-15',
    dutyDescription: 'Sunday emergency shift maintenance duty (8.0 hrs)',
    daysCredited: 1.0,
    daysUsed: 0.0,
    daysRemaining: 1.0,
    expiryDate: '2026-10-31',
    expiresInDays: 22,
    status: 'expiring_soon',
  },
  {
    id: 'CMP-002',
    employeeId: 'EMP-010',
    dateEarned: '2026-09-27',
    dutyDescription: 'Weekend Line B overhaul support (6.0 hrs)',
    daysCredited: 1.0,
    daysUsed: 0.0,
    daysRemaining: 1.0,
    expiryDate: '2026-11-15',
    expiresInDays: 37,
    status: 'active',
  },
  {
    id: 'CMP-003',
    employeeId: 'EMP-010',
    dateEarned: '2026-08-10',
    dutyDescription: 'Independence week night-shift coverage',
    daysCredited: 0.5,
    daysUsed: 0.5,
    daysRemaining: 0.0,
    expiryDate: '2026-09-30',
    expiresInDays: 0,
    status: 'utilized',
  },
]

const OvertimeBonusContext = createContext<OvertimeBonusContextType | undefined>(undefined)

export const OvertimeBonusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [otPolicy, setOtPolicy] = useState<OvertimePolicy>(INITIAL_OT_POLICY)
  const [bonusPolicy, setBonusPolicy] = useState<AttendanceBonusPolicy>(INITIAL_BONUS_POLICY)
  const [otRequests, setOtRequests] = useState<OvertimeRequest[]>(INITIAL_OT_REQUESTS)
  const [bonusRecords, setBonusRecords] = useState<BonusEligibilityRecord[]>(INITIAL_BONUS_RECORDS)
  const [compOffRecords, setCompOffRecords] = useState<CompOffRecord[]>(INITIAL_COMPOFF_RECORDS)

  const updateOtPolicy = (updated: Partial<OvertimePolicy>) => {
    setOtPolicy((prev) => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString().split('T')[0],
    }))
  }

  const updateBonusPolicy = (updated: Partial<AttendanceBonusPolicy>) => {
    setBonusPolicy((prev) => ({
      ...prev,
      ...updated,
    }))
  }

  const requestOvertime = (req: Omit<OvertimeRequest, 'id' | 'status' | 'timeline' | 'createdAt'>) => {
    const newId = `OT-REQ-${Date.now().toString().slice(-4)}`
    const now = new Date()
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const newRequest: OvertimeRequest = {
      ...req,
      id: newId,
      status: 'pending_supervisor',
      createdAt: timestampStr,
      timeline: [
        {
          id: 'step-1',
          title: 'Level 1: Shift Supervisor',
          approverName: 'Rajesh Verma',
          approverRole: 'Plant Shift Superintendent',
          status: 'pending',
        },
        {
          id: 'step-2',
          title: 'Level 2: Plant HR Signoff',
          approverName: 'Kavita Salunkhe',
          approverRole: 'Plant HR Officer',
          status: 'waiting',
        },
      ],
    }

    setOtRequests((prev) => [newRequest, ...prev])
  }

  const supervisorApproveOt = (id: string, comments = 'Approved by shift supervisor. Overtime hours verified against plant gate punch log.') => {
    const timestamp = new Date().toLocaleString()
    setOtRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          status: 'pending_plant_hr',
          timeline: [
            {
              ...r.timeline[0],
              status: 'approved',
              timestamp,
              comments,
            },
            {
              ...r.timeline[1],
              status: 'pending',
            },
          ],
        }
      })
    )
  }

  const supervisorRejectOt = (id: string, comments = 'Rejected by shift supervisor. Exceeds daily overtime authorization limit.') => {
    const timestamp = new Date().toLocaleString()
    setOtRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          status: 'rejected',
          timeline: [
            {
              ...r.timeline[0],
              status: 'rejected',
              timestamp,
              comments,
            },
            r.timeline[1],
          ],
        }
      })
    )
  }

  const plantHrApproveOt = (id: string, comments = 'Final Plant HR signoff completed. Forwarded to payroll/comp-off wallet.') => {
    const timestamp = new Date().toLocaleString()
    setOtRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          status: 'approved',
          timeline: [
            r.timeline[0],
            {
              ...r.timeline[1],
              status: 'approved',
              timestamp,
              comments,
            },
          ],
        }
      })
    )

    // If request settlement is comp-off, credit to employee's comp-off records
    const target = otRequests.find((r) => r.id === id)
    if (target && target.settlementPreference === 'compoff') {
      const newCompOff: CompOffRecord = {
        id: `CMP-${Date.now().toString().slice(-3)}`,
        employeeId: target.employeeId,
        dateEarned: target.date,
        dutyDescription: `Approved OT: ${target.hours}h on ${target.date} (${target.reason})`,
        daysCredited: target.settlementCompOffDays || 0.5,
        daysUsed: 0,
        daysRemaining: target.settlementCompOffDays || 0.5,
        expiryDate: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
        expiresInDays: 45,
        status: 'active',
      }
      setCompOffRecords((prev) => [newCompOff, ...prev])
    }
  }

  const plantHrRejectOt = (id: string, comments = 'Rejected at HR audit level.') => {
    const timestamp = new Date().toLocaleString()
    setOtRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          status: 'rejected',
          timeline: [
            r.timeline[0],
            {
              ...r.timeline[1],
              status: 'rejected',
              timestamp,
              comments,
            },
          ],
        }
      })
    )
  }

  return (
    <OvertimeBonusContext.Provider
      value={{
        otPolicy,
        updateOtPolicy,
        otRequests,
        requestOvertime,
        supervisorApproveOt,
        supervisorRejectOt,
        plantHrApproveOt,
        plantHrRejectOt,
        bonusPolicy,
        updateBonusPolicy,
        bonusRecords,
        compOffRecords,
      }}
    >
      {children}
    </OvertimeBonusContext.Provider>
  )
}

export const useOvertimeBonus = () => {
  const context = useContext(OvertimeBonusContext)
  if (!context) {
    throw new Error('useOvertimeBonus must be used within an OvertimeBonusProvider')
  }
  return context
}
