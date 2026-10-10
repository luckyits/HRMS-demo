import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  INITIAL_COMPOFF_REQUESTS,
  INITIAL_ENCASHMENT_REQUESTS,
  INITIAL_HOLIDAY_PROFILES,
  INITIAL_LEAVE_CALENDAR_EVENTS,
  INITIAL_LEAVE_LEDGER,
  INITIAL_LEAVE_POLICIES,
  INITIAL_LEAVE_TYPES,
  INITIAL_NOTIFICATION_TEMPLATES,
  INITIAL_WORKFLOW_DEFINITIONS,
  type CompOffRequest,
  type CustomWorkflowDefinition,
  type HolidayEntry,
  type HolidayProfile,
  type LeaveEncashmentRequest,
  type LeaveLedgerEntry,
  type LeavePolicyBundle,
  type LeaveTypeDefinition,
  type NotificationTemplate,
  type TeamLeaveEvent,
  type WorkflowStepRule,
} from '@/mock/adminLeaves'
import { AuditLogService } from '@/services/auditLogService'

const STORAGE_KEYS = {
  LEAVE_TYPES: 'hrms_admin_leave_types',
  LEAVE_POLICIES: 'hrms_admin_leave_policies',
  LEDGER: 'hrms_admin_leave_ledger',
  HOLIDAYS: 'hrms_admin_holiday_profiles',
  COMPOFF: 'hrms_admin_compoff_requests',
  ENCASHMENT: 'hrms_admin_encashment_requests',
  WORKFLOWS: 'hrms_admin_custom_workflows',
  TEMPLATES: 'hrms_admin_notif_templates',
}

export interface SimulationResult {
  requestType: string
  matchedWorkflow: CustomWorkflowDefinition
  evaluatedConditions: string[]
  generatedChain: {
    stepIndex: number
    title: string
    approverRole: string
    approverName: string
    slaHours: number
    escalationTarget: string
    fallback: string
    consensus: string
  }[]
}

interface AdminLeavesContextType {
  // 1. Leave Types
  leaveTypes: LeaveTypeDefinition[]
  addLeaveType: (type: Omit<LeaveTypeDefinition, 'id'>) => void
  updateLeaveType: (id: string, partial: Partial<LeaveTypeDefinition>) => void
  deleteLeaveType: (id: string) => void

  // 2. Leave Policies
  leavePolicies: LeavePolicyBundle[]
  addLeavePolicy: (policy: Omit<LeavePolicyBundle, 'id' | 'assignedEmployeeCount'>) => void
  updateLeavePolicy: (id: string, partial: Partial<LeavePolicyBundle>) => void
  deleteLeavePolicy: (id: string) => void

  // 3. Balance Adjustment & Ledger
  ledger: LeaveLedgerEntry[]
  adjustBalance: (employeeId: string, employeeName: string, avatar: string, department: string, leaveTypeCode: string, daysDelta: number, reason: string) => void

  // 4. Holiday Profiles
  holidayProfiles: HolidayProfile[]
  copyHolidaysFromLastYear: (profileId: string) => void
  addHolidayEntry: (profileId: string, holiday: Omit<HolidayEntry, 'id'>) => void

  // 5. Leave Calendar & Heatmap
  leaveCalendarEvents: TeamLeaveEvent[]
  getHeatmapDates: () => Record<string, { totalOff: number; isConflictHigh: boolean; employees: string[] }>

  // 6. Comp-off & Encashment
  compOffRequests: CompOffRequest[]
  approveCompOff: (id: string) => void
  rejectCompOff: (id: string) => void

  encashmentRequests: LeaveEncashmentRequest[]
  approveEncashment: (id: string) => void
  processEncashmentToPayroll: (id: string) => void

  // 7. Workflow Designer & Simulator
  workflowDefinitions: CustomWorkflowDefinition[]
  saveWorkflowDefinition: (def: CustomWorkflowDefinition) => void
  simulateWorkflow: (requestType: string, params: { amountOrDays?: number; branch?: string; profile?: string; requesterName?: string }) => SimulationResult

  // 8. Notification Templates
  notificationTemplates: NotificationTemplate[]
  updateNotificationTemplate: (id: string, partial: Partial<NotificationTemplate>) => void
}

const AdminLeavesContext = createContext<AdminLeavesContextType | undefined>(undefined)

export const AdminLeavesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Leave Types
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeDefinition[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_TYPES)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_LEAVE_TYPES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVE_TYPES, JSON.stringify(leaveTypes))
  }, [leaveTypes])

  const addLeaveType = (type: Omit<LeaveTypeDefinition, 'id'>) => {
    const newLT: LeaveTypeDefinition = {
      ...type,
      id: `LT-${Date.now().toString().slice(-4)}`,
    }
    setLeaveTypes((prev) => [...prev, newLT])
    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: 'Created Leave Type',
      targetType: 'Policy',
      targetId: newLT.id,
      targetName: newLT.name,
      featureCode: 'LEAVE',
      reason: `Created leave type ${newLT.name} (${newLT.code})`,
    })
  }

  const updateLeaveType = (id: string, partial: Partial<LeaveTypeDefinition>) => {
    setLeaveTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
    )
  }

  const deleteLeaveType = (id: string) => {
    setLeaveTypes((prev) => prev.filter((t) => t.id !== id))
  }

  // 2. Policies
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicyBundle[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEAVE_POLICIES)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_LEAVE_POLICIES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEAVE_POLICIES, JSON.stringify(leavePolicies))
  }, [leavePolicies])

  const addLeavePolicy = (policy: Omit<LeavePolicyBundle, 'id' | 'assignedEmployeeCount'>) => {
    const newPolicy: LeavePolicyBundle = {
      ...policy,
      id: `LP-${Date.now().toString().slice(-4)}`,
      assignedEmployeeCount: 0,
    }
    setLeavePolicies((prev) => [...prev, newPolicy])
  }

  const updateLeavePolicy = (id: string, partial: Partial<LeavePolicyBundle>) => {
    setLeavePolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...partial } : p))
    )
  }

  const deleteLeavePolicy = (id: string) => {
    setLeavePolicies((prev) => prev.filter((p) => p.id !== id))
  }

  // 3. Ledger & Adjustments
  const [ledger, setLedger] = useState<LeaveLedgerEntry[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEDGER)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_LEAVE_LEDGER
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger))
  }, [ledger])

  const adjustBalance = (
    employeeId: string,
    employeeName: string,
    avatar: string,
    department: string,
    leaveTypeCode: string,
    daysDelta: number,
    reason: string
  ) => {
    const prevClosing = ledger
      .filter((l) => l.employeeId === employeeId && l.leaveTypeCode === leaveTypeCode)
      .slice(-1)[0]?.closingBalance || 10

    const newClosing = Math.max(0, prevClosing + daysDelta)

    const newEntry: LeaveLedgerEntry = {
      id: `LL-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      employeeId,
      employeeName,
      avatar,
      department,
      leaveTypeCode,
      transactionType: 'Admin Adjustment',
      daysDelta,
      closingBalance: newClosing,
      reason,
      adjustedBy: 'HR Admin',
    }

    setLedger((prev) => [newEntry, ...prev])

    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: `Adjusted Leave Balance (${daysDelta > 0 ? '+' : ''}${daysDelta} ${leaveTypeCode})`,
      targetType: 'Employee',
      targetId: employeeId,
      targetName: employeeName,
      featureCode: 'LEAVE',
      reason,
      beforeValue: `${prevClosing} days`,
      afterValue: `${newClosing} days`,
    })
  }

  // 4. Holiday Profiles
  const [holidayProfiles, setHolidayProfiles] = useState<HolidayProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HOLIDAYS)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_HOLIDAY_PROFILES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidayProfiles))
  }, [holidayProfiles])

  const copyHolidaysFromLastYear = (profileId: string) => {
    setHolidayProfiles((prev) =>
      prev.map((prof) => {
        if (prof.id !== profileId) return prof
        // Replicate holidays adjusting dates for current year
        const clonedHolidays = prof.holidays.map((h) => ({
          ...h,
          id: `H-CLONE-${Date.now().toString().slice(-4)}-${h.id}`,
        }))
        return {
          ...prof,
          holidays: clonedHolidays,
        }
      })
    )
  }

  const addHolidayEntry = (profileId: string, holiday: Omit<HolidayEntry, 'id'>) => {
    setHolidayProfiles((prev) =>
      prev.map((prof) => {
        if (prof.id !== profileId) return prof
        const newH: HolidayEntry = {
          ...holiday,
          id: `H-${Date.now().toString().slice(-4)}`,
        }
        return {
          ...prof,
          holidays: [...prof.holidays, newH],
          totalMandatory: holiday.type === 'Mandatory' ? prof.totalMandatory + 1 : prof.totalMandatory,
          totalOptional: holiday.type === 'Optional / Restricted' ? prof.totalOptional + 1 : prof.totalOptional,
        }
      })
    )
  }

  // 5. Leave Calendar & Heatmap
  const [leaveCalendarEvents] = useState<TeamLeaveEvent[]>(INITIAL_LEAVE_CALENDAR_EVENTS)

  const getHeatmapDates = () => {
    const datesMap: Record<string, { totalOff: number; isConflictHigh: boolean; employees: string[] }> = {}
    leaveCalendarEvents.forEach((evt) => {
      // populate date range
      const s = new Date(evt.startDate)
      const e = new Date(evt.endDate)
      for (let cur = new Date(s); cur <= e; cur.setDate(cur.getDate() + 1)) {
        const dStr = cur.toISOString().split('T')[0]
        if (!datesMap[dStr]) {
          datesMap[dStr] = { totalOff: 0, isConflictHigh: false, employees: [] }
        }
        datesMap[dStr].totalOff++
        datesMap[dStr].employees.push(evt.employeeName)
        if (datesMap[dStr].totalOff >= 3) {
          datesMap[dStr].isConflictHigh = true
        }
      }
    })
    return datesMap
  }

  // 6. Comp-off & Encashment
  const [compOffRequests, setCompOffRequests] = useState<CompOffRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPOFF)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_COMPOFF_REQUESTS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPOFF, JSON.stringify(compOffRequests))
  }, [compOffRequests])

  const approveCompOff = (id: string) => {
    setCompOffRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Approved' } : c))
    )
  }

  const rejectCompOff = (id: string) => {
    setCompOffRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Rejected' } : c))
    )
  }

  const [encashmentRequests, setEncashmentRequests] = useState<LeaveEncashmentRequest[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ENCASHMENT)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_ENCASHMENT_REQUESTS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENCASHMENT, JSON.stringify(encashmentRequests))
  }, [encashmentRequests])

  const approveEncashment = (id: string) => {
    setEncashmentRequests((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Approved' } : e))
    )
  }

  const processEncashmentToPayroll = (id: string) => {
    setEncashmentRequests((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Processed to Payroll' } : e))
    )
  }

  // 7. Workflow Designer & Simulator
  const [workflowDefinitions, setWorkflowDefinitions] = useState<CustomWorkflowDefinition[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WORKFLOWS)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_WORKFLOW_DEFINITIONS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflowDefinitions))
  }, [workflowDefinitions])

  const saveWorkflowDefinition = (def: CustomWorkflowDefinition) => {
    setWorkflowDefinitions((prev) => {
      const exists = prev.some((w) => w.id === def.id)
      if (exists) {
        return prev.map((w) => (w.id === def.id ? def : w))
      }
      return [...prev, def]
    })
    AuditLogService.addLog({
      actorName: 'HR Admin',
      actorRole: 'HR Admin',
      action: `Saved Workflow Definition (${def.name})`,
      targetType: 'Policy',
      targetId: def.id,
      targetName: def.name,
      featureCode: 'MSS_APPROVALS',
      reason: `Updated ${def.requestType} approval graph to version ${def.version}`,
    })
  }

  const simulateWorkflow = (
    requestType: string,
    params: { amountOrDays?: number; branch?: string; profile?: string; requesterName?: string }
  ): SimulationResult => {
    const matched =
      workflowDefinitions.find((w) => w.requestType === requestType && w.isActive) ||
      workflowDefinitions[0]

    const evaluatedConditions: string[] = []
    if (matched.conditions.minDays) {
      const actualDays = params.amountOrDays || 6
      evaluatedConditions.push(
        `Days Rule: Requested ${actualDays} days ${actualDays >= matched.conditions.minDays ? '>=' : '<'} Threshold ${matched.conditions.minDays} days`
      )
    }
    if (matched.conditions.minAmount) {
      const actualAmount = params.amountOrDays || 12000
      evaluatedConditions.push(
        `Financial Rule: Requested ₹${actualAmount.toLocaleString()} ${actualAmount >= matched.conditions.minAmount ? '>=' : '<'} Threshold ₹${matched.conditions.minAmount.toLocaleString()}`
      )
    }

    const generatedChain = matched.steps.map((step, idx) => {
      let approverName = step.approverTargetName || 'Vikram Malhotra'
      let approverRole = 'Line Manager'

      if (step.approverType === 'hr') {
        approverName = 'Sarah Jenkins'
        approverRole = 'People Operations Lead'
      } else if (step.approverType === 'dept_head') {
        approverName = 'Sunil Mehta'
        approverRole = 'Department Head'
      } else if (step.approverType === 'skip_level') {
        approverName = 'Ananya Roy'
        approverRole = 'VP of Engineering'
      } else if (step.approverType === 'group') {
        approverName = step.approverTargetName || 'Finance Committee'
        approverRole = 'Consensus Group'
      }

      return {
        stepIndex: idx + 1,
        title: step.title,
        approverRole,
        approverName,
        slaHours: step.slaHours,
        escalationTarget: step.escalationTarget,
        fallback: step.fallbackApprover,
        consensus: step.consensusRule === 'majority' ? 'Majority Vote (2/3)' : 'Single Approval Sufficient',
      }
    })

    return {
      requestType,
      matchedWorkflow: matched,
      evaluatedConditions,
      generatedChain,
    }
  }

  // 8. Notification Templates
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_NOTIFICATION_TEMPLATES
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(notificationTemplates))
  }, [notificationTemplates])

  const updateNotificationTemplate = (id: string, partial: Partial<NotificationTemplate>) => {
    setNotificationTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...partial } : t))
    )
  }

  return (
    <AdminLeavesContext.Provider
      value={{
        leaveTypes,
        addLeaveType,
        updateLeaveType,
        deleteLeaveType,
        leavePolicies,
        addLeavePolicy,
        updateLeavePolicy,
        deleteLeavePolicy,
        ledger,
        adjustBalance,
        holidayProfiles,
        copyHolidaysFromLastYear,
        addHolidayEntry,
        leaveCalendarEvents,
        getHeatmapDates,
        compOffRequests,
        approveCompOff,
        rejectCompOff,
        encashmentRequests,
        approveEncashment,
        processEncashmentToPayroll,
        workflowDefinitions,
        saveWorkflowDefinition,
        simulateWorkflow,
        notificationTemplates,
        updateNotificationTemplate,
      }}
    >
      {children}
    </AdminLeavesContext.Provider>
  )
}

export const useAdminLeaves = () => {
  const ctx = useContext(AdminLeavesContext)
  if (!ctx) {
    throw new Error('useAdminLeaves must be used within an AdminLeavesProvider')
  }
  return ctx
}
