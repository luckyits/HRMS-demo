import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  INITIAL_ADMIN_REGULARIZATIONS,
  INITIAL_DEVICES,
  INITIAL_FACE_ENROLLMENTS,
  INITIAL_GEOFENCES,
  INITIAL_LIVE_PUNCHES,
  INITIAL_POLICIES,
  INITIAL_SHIFTS,
  INITIAL_SUSPICIOUS_PUNCHES,
  generateEmployeeMonthRegister,
  type AdminRegularizationRequest,
  type AttendancePolicy,
  type AttendanceStatusCode,
  type BiometricDevice,
  type EmployeeMonthRow,
  type FaceEnrollmentRecord,
  type GeofenceZone,
  type LiveEmployeePunch,
  type ShiftDefinition,
  type SuspiciousPunchItem,
} from '@/mock/adminAttendance'
import { AuditLogService } from '@/services/auditLogService'

const STORAGE_KEYS = {
  POLICIES: 'hrms_admin_att_policies',
  SHIFTS: 'hrms_admin_att_shifts',
  REGISTER: 'hrms_admin_att_register',
  IS_LOCKED: 'hrms_admin_att_month_locked',
  GEOFENCES: 'hrms_admin_att_geofences',
  ENROLLMENTS: 'hrms_admin_att_enrollments',
  SUSPICIOUS: 'hrms_admin_att_suspicious',
  DEVICES: 'hrms_admin_att_devices',
  REGULARIZATIONS: 'hrms_admin_att_regularizations',
  ROSTER: 'hrms_admin_att_roster',
}

export interface RosterCell {
  employeeId: string
  date: string // YYYY-MM-DD
  shiftId: string
}

export interface ConflictWarning {
  type: 'double_shift' | 'rest_period_violation'
  message: string
}

interface AdminAttendanceContextType {
  // 1. Live Dashboard
  livePunches: LiveEmployeePunch[]
  refreshLivePunches: () => void
  isLiveRefreshing: boolean

  // 2. Attendance Register
  monthRegister: EmployeeMonthRow[]
  isMonthLocked: boolean
  toggleMonthLock: () => void
  updateRegisterCell: (employeeId: string, day: number, newCode: AttendanceStatusCode, reason: string) => void

  // 3. Policies
  policies: AttendancePolicy[]
  addPolicy: (policy: Omit<AttendancePolicy, 'id'>) => void
  updatePolicy: (id: string, policy: Partial<AttendancePolicy>) => void
  deletePolicy: (id: string) => void

  // 4. Shifts
  shifts: ShiftDefinition[]
  addShift: (shift: Omit<ShiftDefinition, 'id' | 'assignedCount'>) => void
  updateShift: (id: string, shift: Partial<ShiftDefinition>) => void
  deleteShift: (id: string) => void

  // 5. Roster Planner
  roster: Record<string, string> // key: `${employeeId}_${date}` -> shiftId
  assignRosterShift: (employeeId: string, date: string, shiftId: string) => void
  copyLastWeekRoster: (startDate: string) => void
  getConflictWarnings: (employeeId: string, date: string, nextShiftId: string) => ConflictWarning[]

  // 6. Geofences
  geofences: GeofenceZone[]
  addGeofence: (fence: Omit<GeofenceZone, 'id'>) => void
  updateGeofence: (id: string, fence: Partial<GeofenceZone>) => void
  deleteGeofence: (id: string) => void

  // 7. Face Biometrics
  faceEnrollments: FaceEnrollmentRecord[]
  triggerReEnroll: (id: string) => void
  updateFallbackMethod: (id: string, method: FaceEnrollmentRecord['fallbackMethod']) => void

  // 8. Regularizations
  regularizations: AdminRegularizationRequest[]
  approveRegularization: (id: string, remarks?: string) => void
  rejectRegularization: (id: string, remarks: string) => void

  // 9. Suspicious Punches
  suspiciousPunches: SuspiciousPunchItem[]
  acceptSuspiciousPunch: (id: string, remarks?: string) => void
  rejectSuspiciousPunch: (id: string, remarks: string) => void
  requestExplanation: (id: string) => void

  // 10. Devices
  devices: BiometricDevice[]
  syncDevice: (id: string) => void
  rebootDevice: (id: string) => void
}

const AdminAttendanceContext = createContext<AdminAttendanceContextType | undefined>(undefined)

export const AdminAttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Live Punches
  const [livePunches, setLivePunches] = useState<LiveEmployeePunch[]>(INITIAL_LIVE_PUNCHES)
  const [isLiveRefreshing, setIsLiveRefreshing] = useState(false)

  const refreshLivePunches = () => {
    setIsLiveRefreshing(true)
    setTimeout(() => {
      setLivePunches((prev) =>
        prev.map((p) => ({
          ...p,
          lastSeen: 'Just now',
          batteryLevel: p.batteryLevel ? Math.max(10, p.batteryLevel - 1) : 85,
        }))
      )
      setIsLiveRefreshing(false)
    }, 600)
  }

  // 2. Attendance Register
  const [monthRegister, setMonthRegister] = useState<EmployeeMonthRow[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTER)
      if (stored) return JSON.parse(stored)
    } catch {}
    return generateEmployeeMonthRegister()
  })

  const [isMonthLocked, setIsMonthLocked] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_LOCKED) === 'true'
  })

  const toggleMonthLock = () => {
    setIsMonthLocked((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEYS.IS_LOCKED, String(next))
      AuditLogService.addLog({
        actorName: 'HR Admin',
        actorRole: 'HR Admin',
        action: next ? 'Locked Attendance Register (October 2026)' : 'Unlocked Attendance Register (October 2026)',
        targetType: 'Attendance',
        targetId: 'OCT-2026',
        targetName: 'October 2026 Register',
        featureCode: 'ATT_POLICY',
        reason: next ? 'Locked for payroll freeze' : 'Unlocked for admin adjustments',
        notes: next ? 'Prevented all further manual overrides for payroll cycle.' : 'Granted editing override access.',
      })
      return next
    })
  }

  const updateRegisterCell = (employeeId: string, day: number, newCode: AttendanceStatusCode, reason: string) => {
    setMonthRegister((prev) => {
      const next = prev.map((row) => {
        if (row.employeeId !== employeeId) return row
        const oldCode = row.days[day]
        const updatedDays = { ...row.days, [day]: newCode }
        const updatedOverrides = {
          ...(row.overrideReasons || {}),
          [day]: {
            reason,
            updatedBy: 'HR Admin',
            updatedAt: new Date().toISOString(),
          },
        }

        AuditLogService.addLog({
          actorName: 'HR Admin',
          actorRole: 'HR Admin',
          action: `Overrode Attendance Day ${day}`,
          targetType: 'Employee',
          targetId: employeeId,
          targetName: row.name,
          featureCode: 'ATT_POLICY',
          beforeValue: oldCode,
          afterValue: newCode,
          reason,
          notes: `Reason: ${reason}`,
        })

        return { ...row, days: updatedDays, overrideReasons: updatedOverrides }
      })
      localStorage.setItem(STORAGE_KEYS.REGISTER, JSON.stringify(next))
      return next
    })
  }

  // 3. Policies
  const [policies, setPolicies] = useState<AttendancePolicy[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.POLICIES)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_POLICIES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POLICIES, JSON.stringify(policies))
  }, [policies])

  const addPolicy = (policy: Omit<AttendancePolicy, 'id'>) => {
    const newPol: AttendancePolicy = {
      ...policy,
      id: `POL-${Date.now().toString().slice(-4)}`,
    }
    setPolicies((prev) => [newPol, ...prev])
    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'Created Attendance Policy',
      targetType: 'Policy',
      targetId: newPol.id,
      targetName: newPol.name,
      featureCode: 'ATT_POLICY',
      reason: `New policy: ${newPol.name}`,
      notes: `Grace: ${newPol.graceMinutes}m, Rule: ${newPol.lateRule.description}`,
    })
  }

  const updatePolicy = (id: string, partial: Partial<AttendancePolicy>) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...partial } : p))
    )
  }

  const deletePolicy = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id))
  }

  // 4. Shifts
  const [shifts, setShifts] = useState<ShiftDefinition[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHIFTS)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_SHIFTS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts))
  }, [shifts])

  const addShift = (shift: Omit<ShiftDefinition, 'id' | 'assignedCount'>) => {
    const newShift: ShiftDefinition = {
      ...shift,
      id: `SHIFT-${Date.now().toString().slice(-4)}`,
      assignedCount: 0,
    }
    setShifts((prev) => [...prev, newShift])
    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'Created Shift Definition',
      targetType: 'Shift',
      targetId: newShift.id,
      targetName: newShift.name,
      featureCode: 'SHIFT_ROSTER',
      reason: `New shift definition: ${newShift.name}`,
      notes: `${newShift.startTime} - ${newShift.endTime} (Night Shift: ${newShift.isNightShift ? 'Yes' : 'No'})`,
    })
  }

  const updateShift = (id: string, partial: Partial<ShiftDefinition>) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...partial } : s))
    )
  }

  const deleteShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id))
  }

  // 5. Roster Planner
  const [roster, setRoster] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROSTER)
      if (stored) return JSON.parse(stored)
    } catch {}
    // Seed sample week
    const sample: Record<string, string> = {
      'EMP-001_2026-10-12': 'SHIFT-01',
      'EMP-001_2026-10-13': 'SHIFT-01',
      'EMP-002_2026-10-12': 'SHIFT-01',
      'EMP-006_2026-10-12': 'SHIFT-02',
      'EMP-006_2026-10-13': 'SHIFT-03',
      'EMP-009_2026-10-12': 'SHIFT-04', // Night shift
      'EMP-009_2026-10-13': 'SHIFT-04',
    }
    return sample
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(roster))
  }, [roster])

  const assignRosterShift = (employeeId: string, date: string, shiftId: string) => {
    setRoster((prev) => {
      const key = `${employeeId}_${date}`
      if (!shiftId) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: shiftId }
    })
  }

  const copyLastWeekRoster = (startDateStr: string) => {
    // Copy assignments from 7 days prior
    setRoster((prev) => {
      const next = { ...prev }
      const start = new Date(startDateStr)
      for (let i = 0; i < 7; i++) {
        const curr = new Date(start)
        curr.setDate(start.getDate() + i)
        const currIso = curr.toISOString().split('T')[0]

        const prevDate = new Date(curr)
        prevDate.setDate(curr.getDate() - 7)
        const prevIso = prevDate.toISOString().split('T')[0]

        Object.keys(prev).forEach((key) => {
          if (key.endsWith(`_${prevIso}`)) {
            const empId = key.split('_')[0]
            const shiftId = prev[key]
            next[`${empId}_${currIso}`] = shiftId
          }
        })
      }
      return next
    })
  }

  const getConflictWarnings = (employeeId: string, date: string, nextShiftId: string): ConflictWarning[] => {
    const warnings: ConflictWarning[] = []
    const nextShift = shifts.find((s) => s.id === nextShiftId)
    if (!nextShift) return warnings

    // Check adjacent day for rest-hour violation (< 11 hours rest)
    const prevDateObj = new Date(date)
    prevDateObj.setDate(prevDateObj.getDate() - 1)
    const prevDateStr = prevDateObj.toISOString().split('T')[0]
    const prevShiftId = roster[`${employeeId}_${prevDateStr}`]

    if (prevShiftId) {
      const prevShift = shifts.find((s) => s.id === prevShiftId)
      if (prevShift && prevShift.isNightShift && !nextShift.isNightShift) {
        warnings.push({
          type: 'rest_period_violation',
          message: `Mandatory Rest Warning: Previous day was Night Shift (${prevShift.name} ends 06:00). Next shift begins at ${nextShift.startTime} (< 11 hours rest gap).`,
        })
      }
    }

    return warnings
  }

  // 6. Geofences
  const [geofences, setGeofences] = useState<GeofenceZone[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GEOFENCES)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_GEOFENCES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GEOFENCES, JSON.stringify(geofences))
  }, [geofences])

  const addGeofence = (fence: Omit<GeofenceZone, 'id'>) => {
    const newFence: GeofenceZone = {
      ...fence,
      id: `GEO-${Date.now().toString().slice(-4)}`,
    }
    setGeofences((prev) => [...prev, newFence])
  }

  const updateGeofence = (id: string, partial: Partial<GeofenceZone>) => {
    setGeofences((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...partial } : g))
    )
  }

  const deleteGeofence = (id: string) => {
    setGeofences((prev) => prev.filter((g) => g.id !== id))
  }

  // 7. Face Biometrics
  const [faceEnrollments, setFaceEnrollments] = useState<FaceEnrollmentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_FACE_ENROLLMENTS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify(faceEnrollments))
  }, [faceEnrollments])

  const triggerReEnroll = (id: string) => {
    setFaceEnrollments((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: 'Pending',
              notes: 'Re-enrollment session link pushed to employee mobile app.',
            }
          : f
      )
    )
  }

  const updateFallbackMethod = (id: string, method: FaceEnrollmentRecord['fallbackMethod']) => {
    setFaceEnrollments((prev) =>
      prev.map((f) => (f.id === id ? { ...f, fallbackMethod: method } : f))
    )
  }

  // 8. Regularizations
  const [regularizations, setRegularizations] = useState<AdminRegularizationRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGULARIZATIONS)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_ADMIN_REGULARIZATIONS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REGULARIZATIONS, JSON.stringify(regularizations))
  }, [regularizations])

  const approveRegularization = (id: string, remarks?: string) => {
    setRegularizations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Approved',
              reviewerRemarks: remarks || 'Approved by HR Operations',
            }
          : r
      )
    )
  }

  const rejectRegularization = (id: string, remarks: string) => {
    setRegularizations((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Rejected',
              reviewerRemarks: remarks,
            }
          : r
      )
    )
  }

  // 9. Suspicious Punches
  const [suspiciousPunches, setSuspiciousPunches] = useState<SuspiciousPunchItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUSPICIOUS)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_SUSPICIOUS_PUNCHES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUSPICIOUS, JSON.stringify(suspiciousPunches))
  }, [suspiciousPunches])

  const acceptSuspiciousPunch = (id: string, remarks?: string) => {
    setSuspiciousPunches((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Accepted',
              adminRemarks: remarks || 'Accepted as genuine punch by HR Admin',
            }
          : p
      )
    )
    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'Accepted Suspicious Punch',
      targetType: 'Punch',
      targetId: id,
      targetName: 'Biometric Flag Resolution',
      featureCode: 'PUNCH',
      reason: remarks || 'Accepted genuine punch override',
      notes: remarks || 'Override approved after review.',
    })
  }

  const rejectSuspiciousPunch = (id: string, remarks: string) => {
    setSuspiciousPunches((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Rejected',
              adminRemarks: remarks,
            }
          : p
      )
    )
    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'Rejected Suspicious Punch',
      targetType: 'Punch',
      targetId: id,
      targetName: 'Biometric Flag Resolution',
      featureCode: 'PUNCH',
      reason: remarks,
      notes: `Rejected fraud punch: ${remarks}`,
    })
  }

  const requestExplanation = (id: string) => {
    setSuspiciousPunches((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Explanation Requested',
              adminRemarks: 'Automated notice sent to employee requesting justification.',
            }
          : p
      )
    )
  }

  // 10. Devices
  const [devices, setDevices] = useState<BiometricDevice[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEVICES)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_DEVICES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices))
  }, [devices])

  const syncDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Syncing' } : d))
    )
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                status: 'Online',
                lastSyncAt: 'Just now',
                totalPunchesToday: d.totalPunchesToday + 4,
              }
            : d
        )
      )
    }, 1200)
  }

  const rebootDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Syncing' } : d))
    )
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: 'Online', lastSyncAt: 'Just now' } : d
        )
      )
    }, 2000)
  }

  return (
    <AdminAttendanceContext.Provider
      value={{
        livePunches,
        refreshLivePunches,
        isLiveRefreshing,
        monthRegister,
        isMonthLocked,
        toggleMonthLock,
        updateRegisterCell,
        policies,
        addPolicy,
        updatePolicy,
        deletePolicy,
        shifts,
        addShift,
        updateShift,
        deleteShift,
        roster,
        assignRosterShift,
        copyLastWeekRoster,
        getConflictWarnings,
        geofences,
        addGeofence,
        updateGeofence,
        deleteGeofence,
        faceEnrollments,
        triggerReEnroll,
        updateFallbackMethod,
        regularizations,
        approveRegularization,
        rejectRegularization,
        suspiciousPunches,
        acceptSuspiciousPunch,
        rejectSuspiciousPunch,
        requestExplanation,
        devices,
        syncDevice,
        rebootDevice,
      }}
    >
      {children}
    </AdminAttendanceContext.Provider>
  )
}

export const useAdminAttendance = () => {
  const ctx = useContext(AdminAttendanceContext)
  if (!ctx) {
    throw new Error('useAdminAttendance must be used within an AdminAttendanceProvider')
  }
  return ctx
}
