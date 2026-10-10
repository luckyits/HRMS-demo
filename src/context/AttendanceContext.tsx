import {
  generateMockMonthAttendance,
  INITIAL_REGULARIZATIONS,
  type DayAttendance,
  type PunchRecord,
  type RegularizationItem,
} from '@/mock/attendance'
import { AuditLogService } from '@/services/auditLogService'
import React, { createContext, useContext, useEffect, useState } from 'react'

const PUNCH_STATE_KEY = 'hrms_ess_punch_state'
const REGULARIZATIONS_KEY = 'hrms_ess_regularizations'
const CONSENT_KEY = 'hrms_biometric_consent'

interface PunchState {
  isPunchedIn: boolean
  punchInTime: string | null
  punchesToday: PunchRecord[]
  workSeconds: number
}

interface AttendanceContextType {
  // Live Punch
  isPunchedIn: boolean
  punchInTime: string | null
  punchesToday: PunchRecord[]
  workSeconds: number
  recordPunch: (record: Omit<PunchRecord, 'id'>) => void

  // Month Calendar Records
  monthDays: DayAttendance[]

  // Regularization
  regularizations: RegularizationItem[]
  submitRegularization: (item: Omit<RegularizationItem, 'id' | 'submittedAt' | 'status'>) => void

  // Biometric / Location Consent
  hasConsent: boolean
  setConsent: (consent: boolean) => void

  // Active Scan Indicator
  isScanInProgress: boolean
  setIsScanInProgress: (val: boolean) => void

  resetAttendanceData: () => void
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined)

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Live Punch State
  const [punchState, setPunchState] = useState<PunchState>(() => {
    try {
      const stored = localStorage.getItem(PUNCH_STATE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return {
      isPunchedIn: true,
      punchInTime: '09:34 AM',
      punchesToday: [
        {
          id: 'punch-init-1',
          time: '09:34 AM',
          type: 'IN',
          location: 'Bengaluru Tech Park - Tower 2',
          accuracy: '8 meters',
          geofenceStatus: 'Inside fence',
          selfieVerified: true,
          status: 'Approved',
        },
      ],
      workSeconds: 29840, // ~8 hours 17 mins running timer
    }
  })

  // 2. Month Calendar State
  const [monthDays] = useState<DayAttendance[]>(() => generateMockMonthAttendance())

  // 3. Regularizations State
  const [regularizations, setRegularizations] = useState<RegularizationItem[]>(() => {
    try {
      const stored = localStorage.getItem(REGULARIZATIONS_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_REGULARIZATIONS
  })

  // 4. Biometric Consent
  const [hasConsent, setHasConsentState] = useState<boolean>(() => {
    return localStorage.getItem(CONSENT_KEY) === 'true'
  })

  // 5. Active Scan Indicator
  const [isScanInProgress, setIsScanInProgress] = useState<boolean>(false)

  // Running work timer tick
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    if (punchState.isPunchedIn) {
      timer = setInterval(() => {
        setPunchState((prev) => ({
          ...prev,
          workSeconds: prev.workSeconds + 1,
        }))
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [punchState.isPunchedIn])

  // Save punch state
  useEffect(() => {
    localStorage.setItem(PUNCH_STATE_KEY, JSON.stringify(punchState))
  }, [punchState])

  // Save regularizations
  useEffect(() => {
    localStorage.setItem(REGULARIZATIONS_KEY, JSON.stringify(regularizations))
  }, [regularizations])

  const setConsent = (consent: boolean) => {
    setHasConsentState(consent)
    localStorage.setItem(CONSENT_KEY, consent ? 'true' : 'false')
  }

  const recordPunch = (punchData: Omit<PunchRecord, 'id'>) => {
    const newRecord: PunchRecord = {
      ...punchData,
      id: `PUNCH-${Date.now().toString().slice(-4)}`,
    }

    const nextPunchedIn = punchData.type === 'IN'

    setPunchState((prev) => ({
      ...prev,
      isPunchedIn: nextPunchedIn,
      punchInTime: nextPunchedIn ? punchData.time : prev.punchInTime,
      punchesToday: [newRecord, ...prev.punchesToday],
    }))

    AuditLogService.addLog({
      actorName: 'Aarav Patel',
      actorRole: 'Employee',
      action: `Attendance Punch ${punchData.type}`,
      targetType: 'Employee',
      targetId: 'EMP-003',
      targetName: 'Aarav Patel',
      featureCode: 'PUNCH',
      beforeValue: punchState.isPunchedIn ? 'Punched In' : 'Punched Out',
      afterValue: `${punchData.type} at ${punchData.time} (${punchData.geofenceStatus})`,
      reason: punchData.outsideFenceReason || 'Web Biometric Check-In',
    })
  }

  const submitRegularization = (
    itemData: Omit<RegularizationItem, 'id' | 'submittedAt' | 'status'>
  ) => {
    const now = new Date()
    const submittedAt = `${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`

    const newItem: RegularizationItem = {
      ...itemData,
      id: `REG-${Date.now().toString().slice(-4)}`,
      submittedAt,
      status: 'pending',
      comments: 'Application sent for supervisor verification.',
    }

    setRegularizations((prev) => [newItem, ...prev])

    AuditLogService.addLog({
      actorName: 'Aarav Patel',
      actorRole: 'Employee',
      action: 'Attendance Regularization Submitted',
      targetType: 'Employee',
      targetId: 'EMP-003',
      targetName: 'Aarav Patel',
      featureCode: 'REGULARIZATION',
      beforeValue: 'Missing Punch',
      afterValue: `Correction Requested (${itemData.requestedInTime} - ${itemData.requestedOutTime})`,
      reason: itemData.reason,
    })
  }

  const resetAttendanceData = () => {
    localStorage.removeItem(PUNCH_STATE_KEY)
    localStorage.removeItem(REGULARIZATIONS_KEY)
    localStorage.removeItem(CONSENT_KEY)
    setHasConsentState(false)
    setPunchState({
      isPunchedIn: false,
      punchInTime: null,
      punchesToday: [],
      workSeconds: 0,
    })
    setRegularizations(INITIAL_REGULARIZATIONS)
  }

  return (
    <AttendanceContext.Provider
      value={{
        isPunchedIn: punchState.isPunchedIn,
        punchInTime: punchState.punchInTime,
        punchesToday: punchState.punchesToday,
        workSeconds: punchState.workSeconds,
        recordPunch,
        monthDays,
        regularizations,
        submitRegularization,
        hasConsent,
        setConsent,
        isScanInProgress,
        setIsScanInProgress,
        resetAttendanceData,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  )
}

export function useAttendance() {
  const context = useContext(AttendanceContext)
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider')
  }
  return context
}
