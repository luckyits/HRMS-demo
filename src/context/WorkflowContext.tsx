import type { ApprovalStep } from '@/components/common/ApprovalTimeline'
import { MOCK_EMPLOYEES } from '@/mock/employees'
import { AuditLogService } from '@/services/auditLogService'
import React, { createContext, useContext, useEffect, useState } from 'react'

export type WorkflowRequestType =
  | 'Leave'
  | 'Expense'
  | 'Overtime'
  | 'Regularization'
  | 'Loan/Advance'
  | 'Resignation'
  | 'Profile Change'

export type WorkflowStatus = 'approved' | 'pending' | 'rejected' | 'escalated' | 'cancelled'

export interface WorkflowRequest {
  id: string
  requestType: WorkflowRequestType
  requesterId: string
  requesterName: string
  requesterAvatar: string
  requesterDesignation: string
  requesterDepartment: string
  requesterBranch: string
  date: string
  title: string
  description: string
  amountOrDays?: string
  status: WorkflowStatus
  currentApproverId: string
  currentApproverName: string
  currentApproverRole: string
  steps: ApprovalStep[]
  submittedAt: string
  isEscalated?: boolean
  hoursElapsed: number
  metadata?: Record<string, any>
}

export interface DelegationRule {
  id: string
  managerId: string
  managerName: string
  delegateId: string
  delegateName: string
  startDate: string
  endDate: string
  reason: string
  isActive: boolean
}

interface WorkflowContextType {
  requests: WorkflowRequest[]
  delegationRule: DelegationRule | null
  currentManagerId: string
  currentManagerName: string
  approveRequest: (requestId: string, comments?: string) => void
  rejectRequest: (requestId: string, comments?: string) => void
  bulkApproveRequests: (requestIds: string[], comments?: string) => void
  bulkRejectRequests: (requestIds: string[], comments?: string) => void
  createWorkflowRequest: (newReq: Partial<WorkflowRequest>) => WorkflowRequest
  fastForwardTime: (hours: number) => void
  setDelegation: (rule: Omit<DelegationRule, 'id' | 'isActive'>) => void
  revokeDelegation: () => void
  regularizeOnBehalf: (employeeId: string, date: string, checkIn: string, checkOut: string, reason: string) => void
}

const STORAGE_KEY_WORKFLOW = 'hrms_workflow_requests_v1'
const STORAGE_KEY_DELEGATION = 'hrms_workflow_delegation_v1'

// Generate realistic initial requests across the 7 types
const INITIAL_WORKFLOW_REQUESTS: WorkflowRequest[] = [
  // 1. Leave (> 5 days -> Manager -> HR)
  {
    id: 'REQ-101',
    requestType: 'Leave',
    requesterId: 'EMP-003',
    requesterName: 'Aarav Patel',
    requesterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    requesterDesignation: 'Senior Frontend Engineer',
    requesterDepartment: 'Engineering',
    requesterBranch: 'Bengaluru HQ',
    date: '2026-10-14 to 2026-10-21',
    title: 'Earned Leave (Annual Family Vacation)',
    description: 'Traveling out of state for family wedding and annual vacation.',
    amountOrDays: '6 Days',
    status: 'pending',
    currentApproverId: 'EMP-002',
    currentApproverName: 'Vikram Malhotra',
    currentApproverRole: 'Engineering Manager',
    submittedAt: '2026-10-09 09:30 AM',
    hoursElapsed: 6,
    steps: [
      {
        id: 'STEP-1',
        title: 'Reporting Manager Review',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'Central HR Final Signoff',
        approverName: 'Sarah Jenkins',
        approverRole: 'HR Lead',
        status: 'waiting',
      },
    ],
    metadata: {
      leaveBalanceAfter: '8.5 Days Remaining',
      leaveType: 'Earned Leave',
    },
  },

  // 2. Casual Leave (<= 2 days -> Manager only)
  {
    id: 'REQ-102',
    requestType: 'Leave',
    requesterId: 'EMP-004',
    requesterName: 'Devika Nair',
    requesterAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    requesterDesignation: 'Full Stack Developer',
    requesterDepartment: 'Engineering',
    requesterBranch: 'Bengaluru HQ',
    date: '2026-10-12',
    title: 'Casual Leave (Personal Emergency)',
    description: 'Home maintenance and bank paperwork.',
    amountOrDays: '1 Day',
    status: 'pending',
    currentApproverId: 'EMP-002',
    currentApproverName: 'Vikram Malhotra',
    currentApproverRole: 'Engineering Manager',
    submittedAt: '2026-10-09 10:15 AM',
    hoursElapsed: 5,
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Approval',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
    ],
    metadata: {
      leaveBalanceAfter: '11 Days Remaining',
      leaveType: 'Casual Leave',
    },
  },

  // 3. Expense (> 5,000 -> Manager -> Dept Head -> Finance)
  {
    id: 'REQ-103',
    requestType: 'Expense',
    requesterId: 'EMP-003',
    requesterName: 'Aarav Patel',
    requesterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    requesterDesignation: 'Senior Frontend Engineer',
    requesterDepartment: 'Engineering',
    requesterBranch: 'Bengaluru HQ',
    date: '2026-10-07',
    title: 'Client Onsite Flight & Hotel Reimbursement',
    description: 'Round-trip airfare and lodging for client integration workshop.',
    amountOrDays: '₹ 14,250',
    status: 'pending',
    currentApproverId: 'EMP-002',
    currentApproverName: 'Vikram Malhotra',
    currentApproverRole: 'Engineering Manager',
    submittedAt: '2026-10-08 14:00 PM',
    hoursElapsed: 26,
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Approval',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'Department Head Endorsement',
        approverName: 'Rohan Joshi',
        approverRole: 'VP Engineering',
        status: 'waiting',
      },
      {
        id: 'STEP-3',
        title: 'Finance Disbursal Audit',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Controller',
        status: 'waiting',
      },
    ],
  },

  // 4. Overtime (Supervisor -> Plant HR)
  {
    id: 'REQ-104',
    requestType: 'Overtime',
    requesterId: 'EMP-015',
    requesterName: 'Kavita Rao',
    requesterAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    requesterDesignation: 'Shift Supervisor',
    requesterDepartment: 'Plant Operations',
    requesterBranch: 'Pune Plant 1',
    date: '2026-10-08',
    title: 'Weekend Maintenance Extended Shift',
    description: 'Supervised urgent tooling recalibration and boiler safety test.',
    amountOrDays: '4.5 Hours',
    status: 'pending',
    currentApproverId: 'EMP-002',
    currentApproverName: 'Vikram Malhotra',
    currentApproverRole: 'Functional Head',
    submittedAt: '2026-10-08 18:30 PM',
    hoursElapsed: 21,
    steps: [
      {
        id: 'STEP-1',
        title: 'Supervisor Verification',
        approverName: 'Vikram Malhotra',
        approverRole: 'Functional Head',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'Plant HR Statutory Signoff',
        approverName: 'Sarah Jenkins',
        approverRole: 'Plant HR Lead',
        status: 'waiting',
      },
    ],
  },

  // 5. Regularization
  {
    id: 'REQ-105',
    requestType: 'Regularization',
    requesterId: 'EMP-004',
    requesterName: 'Devika Nair',
    requesterAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    requesterDesignation: 'Full Stack Developer',
    requesterDepartment: 'Engineering',
    requesterBranch: 'Bengaluru HQ',
    date: '2026-10-08',
    title: 'Missed Biometric Out Punch',
    description: 'Left office at 7:30 PM, biometric reader was undergoing maintenance.',
    amountOrDays: '1 Punch',
    status: 'pending',
    currentApproverId: 'EMP-002',
    currentApproverName: 'Vikram Malhotra',
    currentApproverRole: 'Engineering Manager',
    submittedAt: '2026-10-09 08:45 AM',
    hoursElapsed: 7,
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Attendance Rectification',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
    ],
  },

  // 6. Loan / Advance (Manager -> HR -> Finance Head)
  {
    id: 'REQ-106',
    requestType: 'Loan/Advance',
    requesterId: 'EMP-003',
    requesterName: 'Aarav Patel',
    requesterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    requesterDesignation: 'Senior Frontend Engineer',
    requesterDepartment: 'Engineering',
    requesterBranch: 'Bengaluru HQ',
    date: '2026-10-09',
    title: 'Salary Advance for Medical Emergency',
    description: 'Advance against November salary for family hospitalization deposit.',
    amountOrDays: '₹ 50,000',
    status: 'pending',
    currentApproverId: 'EMP-002',
    currentApproverName: 'Vikram Malhotra',
    currentApproverRole: 'Engineering Manager',
    submittedAt: '2026-10-09 11:00 AM',
    hoursElapsed: 4,
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Endorsement',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'HR Eligibility Check',
        approverName: 'Sarah Jenkins',
        approverRole: 'HR Lead',
        status: 'waiting',
      },
      {
        id: 'STEP-3',
        title: 'Finance Head Disbursement',
        approverName: 'Priya Sundaram',
        approverRole: 'Finance Head',
        status: 'waiting',
      },
    ],
  },

  // 7. Resignation (Manager -> HR)
  {
    id: 'REQ-107',
    requestType: 'Resignation',
    requesterId: 'EMP-012',
    requesterName: 'Manish Verma',
    requesterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    requesterDesignation: 'QA Automation Engineer',
    requesterDepartment: 'Engineering',
    requesterBranch: 'Bengaluru HQ',
    date: '2026-10-08',
    title: 'Voluntary Resignation Notice',
    description: 'Pursuing higher studies overseas. Requested release date: 2026-12-08.',
    amountOrDays: '60 Days Notice',
    status: 'pending',
    currentApproverId: 'EMP-002',
    currentApproverName: 'Vikram Malhotra',
    currentApproverRole: 'Engineering Manager',
    submittedAt: '2026-10-08 10:00 AM',
    hoursElapsed: 30,
    steps: [
      {
        id: 'STEP-1',
        title: 'Manager Exit Interview & Relieving',
        approverName: 'Vikram Malhotra',
        approverRole: 'Engineering Manager',
        status: 'pending',
      },
      {
        id: 'STEP-2',
        title: 'HR Exit Formalities & Clearance',
        approverName: 'Sarah Jenkins',
        approverRole: 'HR Lead',
        status: 'waiting',
      },
    ],
  },
]

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentManagerId = 'EMP-002'
  const currentManagerName = 'Vikram Malhotra'

  const [requests, setRequests] = useState<WorkflowRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WORKFLOW)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return INITIAL_WORKFLOW_REQUESTS
  })

  const [delegationRule, setDelegationRule] = useState<DelegationRule | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DELEGATION)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return null
  })

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WORKFLOW, JSON.stringify(requests))
  }, [requests])

  useEffect(() => {
    if (delegationRule) {
      localStorage.setItem(STORAGE_KEY_DELEGATION, JSON.stringify(delegationRule))
    } else {
      localStorage.removeItem(STORAGE_KEY_DELEGATION)
    }
  }, [delegationRule])

  const approveRequest = (requestId: string, comments = 'Approved by manager.') => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req

        // Find active step
        const currentStepIndex = req.steps.findIndex((s) => s.status === 'pending')
        if (currentStepIndex === -1) return req

        const isLastStep = currentStepIndex === req.steps.length - 1
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const updatedSteps = req.steps.map((s, idx) => {
          if (idx === currentStepIndex) {
            return {
              ...s,
              status: 'approved' as const,
              timestamp: `Today at ${nowStr}`,
              comments,
              isDelegated: delegationRule?.isActive,
              delegatedTo: delegationRule?.isActive ? delegationRule.delegateName : undefined,
            }
          }
          if (idx === currentStepIndex + 1) {
            return {
              ...s,
              status: 'pending' as const,
            }
          }
          return s
        })

        const newStatus = isLastStep ? 'approved' : 'pending'

        AuditLogService.addLog({
          action: 'APPROVE_REQUEST',
          targetType: 'Employee',
          targetId: req.requesterId,
          targetName: req.requesterName,
          actorName: currentManagerName,
          actorRole: 'Engineering Manager',
          featureCode: req.requestType === 'Leave' ? 'LEAVE' : 'MSS_APPROVALS',
          beforeValue: 'Pending',
          afterValue: newStatus,
          reason: comments,
        })

        return {
          ...req,
          status: newStatus,
          steps: updatedSteps,
        }
      })
    )
  }

  const rejectRequest = (requestId: string, comments = 'Rejected by manager.') => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req

        const currentStepIndex = req.steps.findIndex((s) => s.status === 'pending')
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        const updatedSteps = req.steps.map((s, idx) => {
          if (idx === currentStepIndex) {
            return {
              ...s,
              status: 'rejected' as const,
              timestamp: `Today at ${nowStr}`,
              comments,
            }
          }
          return s
        })

        AuditLogService.addLog({
          action: 'REJECT_REQUEST',
          targetType: 'Employee',
          targetId: req.requesterId,
          targetName: req.requesterName,
          actorName: currentManagerName,
          actorRole: 'Engineering Manager',
          featureCode: req.requestType === 'Leave' ? 'LEAVE' : 'MSS_APPROVALS',
          beforeValue: 'Pending',
          afterValue: 'Rejected',
          reason: comments,
        })

        return {
          ...req,
          status: 'rejected',
          steps: updatedSteps,
        }
      })
    )
  }

  const bulkApproveRequests = (requestIds: string[], comments?: string) => {
    requestIds.forEach((id) => approveRequest(id, comments || 'Bulk approved by manager'))
  }

  const bulkRejectRequests = (requestIds: string[], comments?: string) => {
    requestIds.forEach((id) => rejectRequest(id, comments || 'Bulk rejected by manager'))
  }

  // Fast forward simulation for escalation
  const fastForwardTime = (hours: number) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.status !== 'pending') return req
        const newHours = req.hoursElapsed + hours
        const isEscalated = newHours >= 24

        const updatedSteps = req.steps.map((step) => {
          if (step.status === 'pending' && isEscalated) {
            return {
              ...step,
              isEscalated: true,
              escalationHours: 24,
            }
          }
          return step
        })

        return {
          ...req,
          hoursElapsed: newHours,
          isEscalated,
          steps: updatedSteps,
        }
      })
    )
  }

  const setDelegation = (ruleData: Omit<DelegationRule, 'id' | 'isActive'>) => {
    const rule: DelegationRule = {
      ...ruleData,
      id: `DEL-${Date.now()}`,
      isActive: true,
    }
    setDelegationRule(rule)

    AuditLogService.addLog({
      action: 'SET_DELEGATION',
      targetType: 'Employee',
      targetId: rule.managerId,
      targetName: rule.managerName,
      actorName: rule.managerName,
      actorRole: 'Manager',
      featureCode: 'MSS_APPROVALS',
      beforeValue: 'Self Approver',
      afterValue: `Delegated to ${rule.delegateName}`,
      reason: rule.reason,
    })
  }

  const revokeDelegation = () => {
    setDelegationRule(null)
  }

  const regularizeOnBehalf = (
    employeeId: string,
    date: string,
    checkIn: string,
    checkOut: string,
    reason: string
  ) => {
    const emp = MOCK_EMPLOYEES.find((e) => e.id === employeeId)
    const newReq: WorkflowRequest = {
      id: `REQ-${Date.now().toString().slice(-4)}`,
      requestType: 'Regularization',
      requesterId: employeeId,
      requesterName: emp?.name || 'Team Member',
      requesterAvatar:
        emp?.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      requesterDesignation: emp?.designation || 'Specialist',
      requesterDepartment: emp?.department || 'Engineering',
      requesterBranch: emp?.branch || 'Bengaluru HQ',
      date,
      title: `Regularization on Behalf (${checkIn} - ${checkOut})`,
      description: `Submitted by manager on behalf of employee: ${reason}`,
      amountOrDays: '1 Day Rectification',
      status: 'approved', // Auto approved because manager submitted
      currentApproverId: currentManagerId,
      currentApproverName: currentManagerName,
      currentApproverRole: 'Engineering Manager',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hoursElapsed: 0,
      steps: [
        {
          id: 'STEP-1',
          title: 'Manager Direct Authorization',
          approverName: currentManagerName,
          approverRole: 'Engineering Manager',
          status: 'approved',
          timestamp: 'Just now',
          comments: `Raised on behalf: ${reason}`,
        },
      ],
    }

    setRequests((prev) => [newReq, ...prev])
  }

  const createWorkflowRequest = (newReqData: Partial<WorkflowRequest>): WorkflowRequest => {
    const id = `REQ-${Date.now().toString().slice(-4)}`
    const isSelfApproval = newReqData.requesterId === currentManagerId

    // Check if custom workflow definition exists from Workflow Designer
    let defaultSteps: ApprovalStep[] = []
    try {
      const storedDefs = localStorage.getItem('hrms_admin_custom_workflows')
      if (storedDefs) {
        const parsed = JSON.parse(storedDefs)
        const customDef = parsed.find(
          (w: any) => w.requestType === newReqData.requestType && w.isActive
        )
        if (customDef && customDef.steps && customDef.steps.length > 0) {
          defaultSteps = customDef.steps.map((st: any, idx: number) => {
            let appName = st.approverTargetName || currentManagerName
            let appRole = 'Manager'

            if (st.approverType === 'hr') {
              appName = 'Sarah Jenkins'
              appRole = 'People Operations Lead'
            } else if (st.approverType === 'dept_head') {
              appName = 'Sunil Mehta'
              appRole = 'Department Head'
            } else if (st.approverType === 'skip_level') {
              appName = 'Ananya Roy'
              appRole = 'VP of Engineering'
            }

            const stepBlocked = idx === 0 && isSelfApproval
            if (stepBlocked && st.fallbackApprover) {
              appName = st.fallbackApprover
              appRole = 'Fallback Approver'
            }

            return {
              id: `S${idx + 1}`,
              title: st.title || `Tier ${idx + 1} Review`,
              approverName: appName,
              approverRole: appRole,
              status: idx === 0 ? 'pending' : 'waiting',
              selfApprovalBlocked: stepBlocked,
              isParallel: st.executionMode === 'parallel',
              escalationHours: st.slaHours,
            }
          })
        }
      }
    } catch {}

    // Fallback to defaults if no custom definition found
    if (defaultSteps.length === 0) {
      if (newReqData.requestType === 'Leave') {
        const days = parseInt(newReqData.amountOrDays || '1') || 1
        if (days <= 2) {
          defaultSteps = [
            {
              id: 'S1',
              title: 'Manager Approval',
              approverName: isSelfApproval ? 'Sarah Jenkins' : currentManagerName,
              approverRole: isSelfApproval ? 'HR Lead (Fallback)' : 'Engineering Manager',
              status: 'pending',
              selfApprovalBlocked: isSelfApproval,
            },
          ]
        } else {
          defaultSteps = [
            {
              id: 'S1',
              title: 'Manager Approval',
              approverName: currentManagerName,
              approverRole: 'Engineering Manager',
              status: isSelfApproval ? 'skipped' : 'pending',
              selfApprovalBlocked: isSelfApproval,
            },
            {
              id: 'S2',
              title: 'HR Approval',
              approverName: 'Sarah Jenkins',
              approverRole: 'HR Lead',
              status: isSelfApproval ? 'pending' : 'waiting',
            },
          ]
        }
      } else if (newReqData.requestType === 'Expense') {
        const amount = parseInt((newReqData.amountOrDays || '0').replace(/[^0-9]/g, ''))
        if (amount <= 500) {
          // Auto approve
          defaultSteps = [
            {
              id: 'S1',
              title: 'Auto-Approval (Below Limit ₹500)',
              approverName: 'System Rule Engine',
              approverRole: 'Automated',
              status: 'approved',
              timestamp: 'Instant',
            },
          ]
        } else {
          defaultSteps = [
            {
              id: 'S1',
              title: 'Manager Approval',
              approverName: currentManagerName,
              approverRole: 'Engineering Manager',
              status: 'pending',
            },
            {
              id: 'S2',
              title: 'Finance Disbursal',
              approverName: 'Priya Sundaram',
              approverRole: 'Finance Controller',
              status: 'waiting',
            },
          ]
        }
      } else {
        defaultSteps = [
          {
            id: 'S1',
            title: 'Manager Approval',
            approverName: currentManagerName,
            approverRole: 'Engineering Manager',
            status: 'pending',
          },
        ]
      }
    }

    const created: WorkflowRequest = {
      id,
      requestType: newReqData.requestType || 'Leave',
      requesterId: newReqData.requesterId || 'EMP-003',
      requesterName: newReqData.requesterName || 'Aarav Patel',
      requesterAvatar:
        newReqData.requesterAvatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      requesterDesignation: newReqData.requesterDesignation || 'Senior Frontend Engineer',
      requesterDepartment: newReqData.requesterDepartment || 'Engineering',
      requesterBranch: newReqData.requesterBranch || 'Bengaluru HQ',
      date: newReqData.date || new Date().toISOString().split('T')[0],
      title: newReqData.title || 'Service Request',
      description: newReqData.description || 'Request details',
      amountOrDays: newReqData.amountOrDays || '1',
      status: defaultSteps[0]?.status === 'approved' ? 'approved' : 'pending',
      currentApproverId: currentManagerId,
      currentApproverName: currentManagerName,
      currentApproverRole: 'Engineering Manager',
      submittedAt: 'Just now',
      hoursElapsed: 0,
      steps: defaultSteps,
      ...newReqData,
    }

    setRequests((prev) => [created, ...prev])
    return created
  }

  return (
    <WorkflowContext.Provider
      value={{
        requests,
        delegationRule,
        currentManagerId,
        currentManagerName,
        approveRequest,
        rejectRequest,
        bulkApproveRequests,
        bulkRejectRequests,
        createWorkflowRequest,
        fastForwardTime,
        setDelegation,
        revokeDelegation,
        regularizeOnBehalf,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  )
}

export const useWorkflow = () => {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider')
  }
  return context
}
