import React, { useState, useMemo } from 'react'
import {
  Clock,
  UserMinus,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  Send,
  MessageSquare,
  Building,
  Check,
  X,
  ChevronRight,
  ClipboardList,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import { useWorkflow, type WorkflowRequest } from '@/context/WorkflowContext'
import { useEmployees } from '@/context/EmployeeContext'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { AuditLogService } from '@/services/auditLogService'

export const MobileHrQueuesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'resignation' ? 'resignation' : 'regularization'

  const [activeQueue, setActiveQueue] = useState<'regularization' | 'resignation'>(defaultTab)

  const { regularizations, approveRegularization, rejectRegularization } = useAdminAttendance()
  const { requests, approveRequest, rejectRequest } = useWorkflow()
  const { employees, updateEmployee } = useEmployees()
  const { settings } = useDemo()
  const { showToast } = useToast()

  const isBranchHr = settings.role === 'Branch HR'
  const activeBranch = settings.currentUser.branch || 'Mumbai Branch'

  // Reject / Reason Sheet state
  const [rejectItem, setRejectItem] = useState<{ id: string; type: 'regularization' | 'resignation'; name: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Scoped regularizations
  const scopedRegularizations = useMemo(() => {
    return regularizations.filter((r) => {
      if (r.status !== 'Pending') return false
      if (isBranchHr) {
        const emp = employees.find((e) => e.id === r.employeeId)
        return emp?.branch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [regularizations, isBranchHr, activeBranch, employees])

  // Scoped resignations
  const scopedResignations = useMemo(() => {
    return requests.filter((r) => {
      if (r.requestType !== 'Resignation' || r.status !== 'pending') return false
      if (isBranchHr) {
        return r.requesterBranch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [requests, isBranchHr, activeBranch])

  // Regularization Approve
  const handleApproveReg = (id: string, empName: string) => {
    approveRegularization(id, 'HR mobile verification approved')

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Attendance Regularization Approved',
      module: 'Attendance',
      targetType: 'Attendance',
      targetId: id,
      targetName: empName,
      featureCode: 'REGULARIZATION',
      beforeValue: 'Pending',
      afterValue: 'Approved',
      reason: 'HR verified punch correction and updated live register',
    })

    showToast({
      type: 'success',
      title: 'Regularization Approved',
      message: `Punch correction for ${empName} has been approved.`,
    })
  }

  // Resignation Accept
  const handleAcceptResignation = (req: WorkflowRequest) => {
    approveRequest(req.id, 'HR accepted resignation and initiated notice period transition')

    // Transition employee status to Notice Period
    updateEmployee(req.requesterId, { status: 'On Notice' })

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Resignation Accepted (Notice Period Initiated)',
      module: 'Lifecycle',
      targetType: 'Employee',
      targetId: req.requesterId,
      targetName: req.requesterName,
      featureCode: 'RESIGNATION',
      beforeValue: 'Active',
      afterValue: 'Notice Period',
      reason: 'HR separation desk accepted formal resignation request',
    })

    showToast({
      type: 'success',
      title: 'Resignation Accepted',
      message: `${req.requesterName} has transitioned to Notice Period. Handover initiated.`,
    })
  }

  // Schedule Exit Interview
  const handleScheduleExitInterview = (req: WorkflowRequest) => {
    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Exit Interview Scheduled',
      module: 'Lifecycle',
      targetType: 'Employee',
      targetId: req.requesterId,
      targetName: req.requesterName,
      featureCode: 'RESIGNATION',
      beforeValue: 'Pending Interview',
      afterValue: 'Interview Scheduled',
      reason: 'HR exit interview invitation sent for separation feedback',
    })

    showToast({
      type: 'info',
      title: 'Exit Interview Scheduled',
      message: `Calendar invitation dispatched to ${req.requesterName}.`,
    })
  }

  // Confirm Reject
  const handleConfirmReject = () => {
    if (!rejectItem || !rejectReason.trim()) {
      showToast({
        type: 'error',
        title: 'Reason Required',
        message: 'Please provide rejection remarks.',
      })
      return
    }

    if (rejectItem.type === 'regularization') {
      rejectRegularization(rejectItem.id, rejectReason)
      AuditLogService.addLog({
        actorName: settings.currentUser.name,
        actorRole: settings.role,
        action: 'Regularization Rejected',
        module: 'Attendance',
        targetType: 'Attendance',
        targetId: rejectItem.id,
        targetName: rejectItem.name,
        featureCode: 'REGULARIZATION',
        beforeValue: 'Pending',
        afterValue: 'Rejected',
        reason: rejectReason,
      })
    } else {
      rejectRequest(rejectItem.id, rejectReason)
      AuditLogService.addLog({
        actorName: settings.currentUser.name,
        actorRole: settings.role,
        action: 'Resignation Rejected / Retained',
        module: 'Lifecycle',
        targetType: 'Employee',
        targetId: rejectItem.id,
        targetName: rejectItem.name,
        featureCode: 'RESIGNATION',
        beforeValue: 'Pending',
        afterValue: 'Rejected',
        reason: rejectReason,
      })
    }

    showToast({
      type: 'info',
      title: 'Request Rejected',
      message: `The request for ${rejectItem.name} has been rejected.`,
    })

    setRejectItem(null)
    setRejectReason('')
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="Admin Exceptions Queues"
        subtitle={isBranchHr ? `${activeBranch} Queue` : 'Enterprise Workforce Queues'}
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      {/* Segmented Queue Selector */}
      <div className="p-3 bg-card border-b border-border">
        <div className="flex p-1 bg-muted rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveQueue('regularization')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeQueue === 'regularization'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Regularization</span>
            {scopedRegularizations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-600 dark:text-blue-400">
                {scopedRegularizations.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveQueue('resignation')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeQueue === 'resignation'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserMinus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
            <span>Resignation / Exit</span>
            {scopedResignations.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                {scopedResignations.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* REGULARIZATION QUEUE */}
        {activeQueue === 'regularization' && (
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pending Missed Punches ({scopedRegularizations.length})
              </span>
              <span className="text-[11px] text-primary font-medium">
                Auto-updates muster
              </span>
            </div>

            {scopedRegularizations.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-foreground">All Clear!</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  No attendance regularization requests currently awaiting HR review.
                </p>
              </div>
            ) : (
              scopedRegularizations.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-foreground">
                        {item.employeeName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        Shift Date: <strong>{item.date}</strong>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Pending
                    </span>
                  </div>

                  {/* Punch Timing Comparison */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Original Clocked:</span>
                      <span className="font-mono text-foreground font-semibold">
                        {item.originalIn || '—'} to {item.originalOut || 'Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Requested Corrected:</span>
                      <span className="font-mono text-primary font-bold">
                        {item.requestedIn} to {item.requestedOut}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">Reason: </span>
                    "{item.reason}"
                  </div>

                  {/* Approve / Reject Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                    <button
                      type="button"
                      onClick={() =>
                        setRejectItem({
                          id: item.id,
                          type: 'regularization',
                          name: item.employeeName,
                        })
                      }
                      className="py-2.5 rounded-xl border border-rose-500 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-500/10 active:scale-95 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveReg(item.id, item.employeeName)}
                      className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Punch</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* RESIGNATION QUEUE */}
        {activeQueue === 'resignation' && (
          <div className="space-y-3 flex-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Separation Requests ({scopedResignations.length})
              </span>
              <span className="text-[11px] text-primary font-medium">
                Notice & Clearance Desk
              </span>
            </div>

            {scopedResignations.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-foreground">No Resignations Pending</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Workforce retention is strong; no pending exits in this scope.
                </p>
              </div>
            ) : (
              scopedResignations.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.requesterAvatar}
                        alt={req.requesterName}
                        className="w-10 h-10 rounded-full object-cover border border-border"
                      />
                      <div>
                        <h4 className="text-xs font-black text-foreground">
                          {req.requesterName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {req.requesterDesignation} • {req.requesterBranch}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      Separation Request
                    </span>
                  </div>

                  {/* Resignation Notice Metrics */}
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Submitted On:</span>
                      <span className="font-semibold text-foreground">{req.submittedAt}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Notice Duration:</span>
                      <span className="font-bold text-primary">60 Days Mandatory</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Requested LWD:</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">
                        {req.date}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">Reason Note: </span>
                    "{req.description}"
                  </div>

                  {/* Action Buttons: Accept / Exit Interview / Retain */}
                  <div className="space-y-2 pt-1 border-t border-border">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleScheduleExitInterview(req)}
                        className="py-2.5 rounded-xl border border-primary text-primary font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/10 active:scale-95 transition"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Exit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptResignation(req)}
                        className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept Notice</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setRejectItem({
                          id: req.id,
                          type: 'resignation',
                          name: req.requesterName,
                        })
                      }
                      className="w-full py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground font-semibold flex items-center justify-center gap-1 transition"
                    >
                      <span>Decline / Retain Employee</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* REJECT MODAL BOTTOM SHEET */}
      <BottomSheet
        isOpen={Boolean(rejectItem)}
        onClose={() => {
          setRejectItem(null)
          setRejectReason('')
        }}
        title="Provide Rejection Justification"
      >
        {rejectItem && (
          <div className="space-y-4 pb-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-950 dark:text-rose-200">
              Rejecting {rejectItem.type === 'regularization' ? 'punch correction' : 'separation request'} for <strong>{rejectItem.name}</strong>.
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Explanation Remarks *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="State the administrative policy reason for declining this request..."
                rows={3}
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectItem(null)}
                className="py-3 px-4 rounded-xl border border-border text-foreground font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
