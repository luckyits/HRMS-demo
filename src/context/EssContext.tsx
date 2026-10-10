import {
  INITIAL_DOCUMENTS_CHECKLIST,
  INITIAL_HELPDESK_TICKETS,
  INITIAL_LEAVE_BALANCES,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYSLIPS,
  INITIAL_POLICIES,
  MOCK_CELEBRATIONS,
  type CelebrationItem,
  type DocumentChecklistItem,
  type HelpdeskTicket,
  type LeaveBalance,
  type LeaveRequest,
  type PayslipRecord,
  type PolicyDocument,
} from '@/mock/essData'
import { AuditLogService } from '@/services/auditLogService'
import React, { createContext, useContext, useEffect, useState } from 'react'

const LEAVE_BALANCES_KEY = 'hrms_ess_leave_balances'
const LEAVE_REQUESTS_KEY = 'hrms_ess_leave_requests'
const CELEBRATIONS_KEY = 'hrms_ess_celebrations'
const DOCUMENTS_KEY = 'hrms_ess_documents'
const POLICIES_KEY = 'hrms_ess_policies'
const TICKETS_KEY = 'hrms_ess_tickets'
const WORK_AGREEMENT_KEY = 'hrms_ess_work_agreement'
const PROFILE_EDITS_KEY = 'hrms_ess_profile_edits'

interface EssContextType {
  // Leaves
  leaveBalances: LeaveBalance[]
  leaveRequests: LeaveRequest[]
  applyLeave: (req: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => void
  cancelLeaveRequest: (id: string) => void

  // Celebrations
  celebrations: CelebrationItem[]
  sendWish: (celebrationId: string) => void

  // Documents
  documents: DocumentChecklistItem[]
  uploadDocument: (id: string, fileName: string) => void

  // Policies
  policies: PolicyDocument[]
  acknowledgePolicy: (policyId: string) => void

  // Work Agreement
  isAgreementSigned: boolean
  signatureTimestamp: string | null
  signatureDataUrl: string | null
  signAgreement: (dataUrl: string) => void

  // Helpdesk
  tickets: HelpdeskTicket[]
  createTicket: (ticket: Omit<HelpdeskTicket, 'id' | 'status' | 'createdAt' | 'lastUpdate'>) => void

  // Profile Edits
  pendingProfileEdit: Record<string, string> | null
  submitProfileEditRequest: (changes: Record<string, string>, reason: string) => void

  resetEssData: () => void
}

const EssContext = createContext<EssContextType | undefined>(undefined)

export const EssProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Leaves
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(() => {
    try {
      const s = localStorage.getItem(LEAVE_BALANCES_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return INITIAL_LEAVE_BALANCES
  })

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    try {
      const s = localStorage.getItem(LEAVE_REQUESTS_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return INITIAL_LEAVE_REQUESTS
  })

  // Celebrations
  const [celebrations, setCelebrations] = useState<CelebrationItem[]>(() => {
    try {
      const s = localStorage.getItem(CELEBRATIONS_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return MOCK_CELEBRATIONS
  })

  // Documents
  const [documents, setDocuments] = useState<DocumentChecklistItem[]>(() => {
    try {
      const s = localStorage.getItem(DOCUMENTS_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return INITIAL_DOCUMENTS_CHECKLIST
  })

  // Policies
  const [policies, setPolicies] = useState<PolicyDocument[]>(() => {
    try {
      const s = localStorage.getItem(POLICIES_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return INITIAL_POLICIES
  })

  // Helpdesk
  const [tickets, setTickets] = useState<HelpdeskTicket[]>(() => {
    try {
      const s = localStorage.getItem(TICKETS_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return INITIAL_HELPDESK_TICKETS
  })

  // Agreement
  const [isAgreementSigned, setIsAgreementSigned] = useState<boolean>(() => {
    return localStorage.getItem(`${WORK_AGREEMENT_KEY}_signed`) === 'true'
  })
  const [signatureTimestamp, setSignatureTimestamp] = useState<string | null>(() => {
    return localStorage.getItem(`${WORK_AGREEMENT_KEY}_timestamp`) || null
  })
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(() => {
    return localStorage.getItem(`${WORK_AGREEMENT_KEY}_dataUrl`) || null
  })

  // Profile Edit
  const [pendingProfileEdit, setPendingProfileEdit] = useState<Record<string, string> | null>(() => {
    try {
      const s = localStorage.getItem(PROFILE_EDITS_KEY)
      if (s) return JSON.parse(s)
    } catch {}
    return null
  })

  // Persistence
  useEffect(() => {
    localStorage.setItem(LEAVE_BALANCES_KEY, JSON.stringify(leaveBalances))
  }, [leaveBalances])

  useEffect(() => {
    localStorage.setItem(LEAVE_REQUESTS_KEY, JSON.stringify(leaveRequests))
  }, [leaveRequests])

  useEffect(() => {
    localStorage.setItem(CELEBRATIONS_KEY, JSON.stringify(celebrations))
  }, [celebrations])

  useEffect(() => {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents))
  }, [documents])

  useEffect(() => {
    localStorage.setItem(POLICIES_KEY, JSON.stringify(policies))
  }, [policies])

  useEffect(() => {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))
  }, [tickets])

  const applyLeave = (req: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: `LV-${Date.now().toString().slice(-4)}`,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }

    setLeaveRequests((prev) => [newReq, ...prev])

    // Deduct leave balance preview
    setLeaveBalances((prev) =>
      prev.map((bal) =>
        bal.type.includes(req.leaveType) || req.leaveType.includes(bal.code)
          ? {
              ...bal,
              used: bal.used + req.daysCount,
              available: Math.max(0, bal.available - req.daysCount),
            }
          : bal
      )
    )

    AuditLogService.addLog({
      actorName: 'Aarav Patel',
      actorRole: 'Employee',
      action: 'Leave Application Submitted',
      targetType: 'Employee',
      targetId: 'EMP-003',
      targetName: 'Aarav Patel',
      featureCode: 'LEAVE',
      beforeValue: 'None',
      afterValue: `${req.leaveType} (${req.daysCount} days: ${req.startDate} to ${req.endDate})`,
      reason: req.reason,
    })
  }

  const cancelLeaveRequest = (id: string) => {
    const target = leaveRequests.find((r) => r.id === id)
    if (!target) return

    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r))
    )

    // Restore balance if it was pending
    setLeaveBalances((prev) =>
      prev.map((bal) =>
        bal.type.includes(target.leaveType) || target.leaveType.includes(bal.code)
          ? {
              ...bal,
              used: Math.max(0, bal.used - target.daysCount),
              available: bal.available + target.daysCount,
            }
          : bal
      )
    )
  }

  const sendWish = (celebrationId: string) => {
    setCelebrations((prev) =>
      prev.map((c) => (c.id === celebrationId ? { ...c, wished: true } : c))
    )
  }

  const uploadDocument = (id: string, fileName: string) => {
    const now = new Date().toISOString().split('T')[0]
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'Uploaded',
              uploadedAt: now,
              fileName,
            }
          : d
      )
    )
  }

  const acknowledgePolicy = (policyId: string) => {
    const nowStr = new Date().toLocaleString()
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === policyId
          ? {
              ...p,
              acknowledged: true,
              acknowledgedAt: nowStr,
            }
          : p
      )
    )

    AuditLogService.addLog({
      actorName: 'Aarav Patel',
      actorRole: 'Employee',
      action: 'Policy Acknowledged & Signed',
      targetType: 'Employee',
      targetId: 'EMP-003',
      targetName: 'Aarav Patel',
      featureCode: 'POLICY',
      beforeValue: 'Unacknowledged',
      afterValue: 'Acknowledged & Agreed',
      reason: `Employee accepted policy ${policyId}`,
    })
  }

  const signAgreement = (dataUrl: string) => {
    const time = new Date().toLocaleString()
    setIsAgreementSigned(true)
    setSignatureTimestamp(time)
    setSignatureDataUrl(dataUrl)

    localStorage.setItem(`${WORK_AGREEMENT_KEY}_signed`, 'true')
    localStorage.setItem(`${WORK_AGREEMENT_KEY}_timestamp`, time)
    localStorage.setItem(`${WORK_AGREEMENT_KEY}_dataUrl`, dataUrl)

    AuditLogService.addLog({
      actorName: 'Aarav Patel',
      actorRole: 'Employee',
      action: 'Employment Work Agreement Executed (E-Sign)',
      targetType: 'Employee',
      targetId: 'EMP-003',
      targetName: 'Aarav Patel',
      featureCode: 'AGREEMENT',
      beforeValue: 'Pending Signature',
      afterValue: `E-Signed at ${time}`,
      reason: 'Digital signature verified by employee',
    })
  }

  const createTicket = (
    ticketData: Omit<HelpdeskTicket, 'id' | 'status' | 'createdAt' | 'lastUpdate'>
  ) => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    const newTkt: HelpdeskTicket = {
      ...ticketData,
      id: `TKT-${Date.now().toString().slice(-4)}`,
      status: 'Open',
      createdAt: now,
      lastUpdate: 'Ticket registered into HR queue',
    }
    setTickets((prev) => [newTkt, ...prev])
  }

  const submitProfileEditRequest = (changes: Record<string, string>, reason: string) => {
    setPendingProfileEdit(changes)
    localStorage.setItem(PROFILE_EDITS_KEY, JSON.stringify(changes))

    AuditLogService.addLog({
      actorName: 'Aarav Patel',
      actorRole: 'Employee',
      action: 'Profile Edit Request Submitted',
      targetType: 'Employee',
      targetId: 'EMP-003',
      targetName: 'Aarav Patel',
      featureCode: 'PROFILE',
      beforeValue: 'Current Master Profile',
      afterValue: `Requested updates on ${Object.keys(changes).join(', ')}`,
      reason: reason || 'Self-service profile information update',
    })
  }

  const resetEssData = () => {
    localStorage.removeItem(LEAVE_BALANCES_KEY)
    localStorage.removeItem(LEAVE_REQUESTS_KEY)
    localStorage.removeItem(CELEBRATIONS_KEY)
    localStorage.removeItem(DOCUMENTS_KEY)
    localStorage.removeItem(POLICIES_KEY)
    localStorage.removeItem(TICKETS_KEY)
    localStorage.removeItem(`${WORK_AGREEMENT_KEY}_signed`)
    localStorage.removeItem(`${WORK_AGREEMENT_KEY}_timestamp`)
    localStorage.removeItem(`${WORK_AGREEMENT_KEY}_dataUrl`)
    localStorage.removeItem(PROFILE_EDITS_KEY)

    setLeaveBalances(INITIAL_LEAVE_BALANCES)
    setLeaveRequests(INITIAL_LEAVE_REQUESTS)
    setCelebrations(MOCK_CELEBRATIONS)
    setDocuments(INITIAL_DOCUMENTS_CHECKLIST)
    setPolicies(INITIAL_POLICIES)
    setTickets(INITIAL_HELPDESK_TICKETS)
    setIsAgreementSigned(false)
    setSignatureTimestamp(null)
    setSignatureDataUrl(null)
    setPendingProfileEdit(null)
  }

  return (
    <EssContext.Provider
      value={{
        leaveBalances,
        leaveRequests,
        applyLeave,
        cancelLeaveRequest,
        celebrations,
        sendWish,
        documents,
        uploadDocument,
        policies,
        acknowledgePolicy,
        isAgreementSigned,
        signatureTimestamp,
        signatureDataUrl,
        signAgreement,
        tickets,
        createTicket,
        pendingProfileEdit,
        submitProfileEditRequest,
        resetEssData,
      }}
    >
      {children}
    </EssContext.Provider>
  )
}

export function useEss() {
  const context = useContext(EssContext)
  if (!context) {
    throw new Error('useEss must be used within an EssProvider')
  }
  return context
}
