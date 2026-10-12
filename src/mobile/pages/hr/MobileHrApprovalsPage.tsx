import React, { useState, useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  Filter,
  Check,
  X,
  Clock,
  Calendar,
  Receipt,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  CheckSquare,
  Square,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Building,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { SwipeableCard } from '@/mobile/components/SwipeableCard'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { useWorkflow, type WorkflowRequest, type WorkflowRequestType } from '@/context/WorkflowContext'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { AuditLogService } from '@/services/auditLogService'

export const MobileHrApprovalsPage: React.FC = () => {
  const navigate = useNavigate()
  const { hasFeature, can } = useAccess()
  const { settings } = useDemo()
  const { requests, approveRequest, rejectRequest, bulkApproveRequests } = useWorkflow()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<string>('All')
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<WorkflowRequest | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [hrComments, setHrComments] = useState('')

  // Bulk select state
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const isBranchHr = settings.role === 'Branch HR'
  const activeBranch = settings.currentUser.branch || 'Mumbai Branch'

  // Filter requests based on data scope
  const scopedRequests = useMemo(() => {
    return requests.filter((r) => {
      if (r.status !== 'pending') return false
      if (isBranchHr) {
        return r.requesterBranch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [requests, isBranchHr, activeBranch])

  // Filter tabs for HR focus
  const tabTypes: { id: string; label: string; filterFn?: (r: WorkflowRequest) => boolean }[] = [
    { id: 'All', label: 'All Pending' },
    {
      id: 'Leave5d',
      label: 'Leave > 5d',
      filterFn: (r) => {
        if (r.requestType !== 'Leave') return false
        const days = parseInt(r.amountOrDays || '0', 10)
        return days >= 5 || r.description?.toLowerCase().includes('annual') || r.title?.toLowerCase().includes('earned')
      },
    },
    {
      id: 'Loan',
      label: 'Loans',
      filterFn: (r) => r.requestType === 'Loan/Advance',
    },
    {
      id: 'Resignation',
      label: 'Resignations',
      filterFn: (r) => r.requestType === 'Resignation',
    },
    {
      id: 'Regularization',
      label: 'Regularize',
      filterFn: (r) => r.requestType === 'Regularization',
    },
    {
      id: 'Expense',
      label: 'Expenses',
      filterFn: (r) => r.requestType === 'Expense',
    },
  ]

  const filteredRequests = useMemo(() => {
    const activeTabObj = tabTypes.find((t) => t.id === activeTab)
    if (!activeTabObj || activeTab === 'All') return scopedRequests
    if (activeTabObj.filterFn) {
      return scopedRequests.filter(activeTabObj.filterFn)
    }
    return scopedRequests
  }, [scopedRequests, activeTab])

  // Single Approve Handler
  const handleApprove = (id: string, customComment?: string) => {
    const req = requests.find((r) => r.id === id)
    approveRequest(id, customComment || 'Approved by HR People Operations')

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: `HR Approved ${req?.requestType || 'Request'}`,
      module: 'Leaves',
      targetType: 'Employee',
      targetId: id,
      targetName: req?.requesterName || id,
      featureCode: 'MSS_APPROVALS',
      beforeValue: 'Pending',
      afterValue: 'Approved',
      reason: customComment || 'Standard HR signoff verification completed',
    })

    showToast({
      type: 'success',
      title: 'Request Approved',
      message: `${req?.requesterName || 'Employee'}'s ${req?.requestType || 'request'} signed off.`,
    })

    if (selectedRequest?.id === id) {
      setSelectedRequest(null)
      setHrComments('')
    }
  }

  // Single Reject Trigger
  const handleOpenReject = (id: string) => {
    const req = requests.find((r) => r.id === id)
    if (req) {
      setRejectingRequest(req)
      setRejectReason('')
    }
  }

  // Confirm Reject
  const handleConfirmReject = () => {
    if (!rejectingRequest) return
    if (!rejectReason.trim()) {
      showToast({
        type: 'error',
        title: 'Reason Required',
        message: 'Please provide an HR explanation for rejection.',
      })
      return
    }

    rejectRequest(rejectingRequest.id, rejectReason)

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: `HR Rejected ${rejectingRequest.requestType}`,
      module: 'Leaves',
      targetType: 'Employee',
      targetId: rejectingRequest.id,
      targetName: rejectingRequest.requesterName,
      featureCode: 'MSS_APPROVALS',
      beforeValue: 'Pending',
      afterValue: 'Rejected',
      reason: rejectReason,
    })

    showToast({
      type: 'info',
      title: 'Request Rejected',
      message: `${rejectingRequest.requesterName} has been notified with the rejection remarks.`,
    })

    if (selectedRequest?.id === rejectingRequest.id) {
      setSelectedRequest(null)
    }
    setRejectingRequest(null)
    setRejectReason('')
  }

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRequests.map((r) => r.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    bulkApproveRequests(selectedIds, 'Bulk HR signoff authorization')

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: `Bulk HR Approved ${selectedIds.length} Requests`,
      module: 'Leaves',
      targetType: 'Employee',
      targetId: 'BULK',
      targetName: `${selectedIds.length} Requests`,
      featureCode: 'MSS_APPROVALS',
      beforeValue: 'Pending',
      afterValue: 'Approved',
      reason: 'Bulk administrative approval batch',
    })

    showToast({
      type: 'success',
      title: 'Batch Approved',
      message: `Successfully approved ${selectedIds.length} requests in bulk.`,
    })

    setSelectedIds([])
    setIsBulkMode(false)
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="HR Approvals Inbox"
        subtitle={isBranchHr ? `${activeBranch} • ${scopedRequests.length} pending` : `Enterprise • ${scopedRequests.length} pending`}
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      {/* Scope Banner if Branch HR */}
      {isBranchHr && (
        <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
          <span className="flex items-center gap-1.5 font-medium">
            <Building className="w-3.5 h-3.5 text-blue-500" />
            Filtered to <strong>{activeBranch}</strong> staff
          </span>
          <span className="text-[10px] uppercase font-bold bg-blue-500/20 px-2 py-0.5 rounded-full">
            Branch Scope
          </span>
        </div>
      )}

      {/* Controls Bar: Bulk Toggle & Counters */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {filteredRequests.length} Requests to Review
        </span>

        <button
          type="button"
          onClick={() => {
            setIsBulkMode(!isBulkMode)
            setSelectedIds([])
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
            isBulkMode
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          }`}
        >
          {isBulkMode ? (
            <>
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Cancel Bulk</span>
            </>
          ) : (
            <>
              <Square className="w-3.5 h-3.5" />
              <span>Bulk Select</span>
            </>
          )}
        </button>
      </div>

      {/* Segmented Filter Pills */}
      <div className="px-4 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
        {tabTypes.map((tab) => {
          const count =
            tab.id === 'All'
              ? scopedRequests.length
              : tab.filterFn
              ? scopedRequests.filter(tab.filterFn).length
              : 0

          const active = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                active
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bulk Action Bar when Active */}
      {isBulkMode && filteredRequests.length > 0 && (
        <div className="mx-4 my-2 p-3 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-bold text-foreground"
          >
            {selectedIds.length === filteredRequests.length ? (
              <CheckSquare className="w-4 h-4 text-primary" />
            ) : (
              <Square className="w-4 h-4 text-muted-foreground" />
            )}
            <span>Select All ({selectedIds.length}/{filteredRequests.length})</span>
          </button>

          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={handleBulkApprove}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center gap-1.5 active:scale-95 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve Selected</span>
          </button>
        </div>
      )}

      {/* Swiping Guidance Hint */}
      {!isBulkMode && filteredRequests.length > 0 && (
        <div className="px-4 py-1 text-center">
          <p className="text-[11px] text-muted-foreground">
            👉 Swipe right to <strong>Approve</strong> • 👈 Swipe left to <strong>Reject</strong> • Tap for details
          </p>
        </div>
      )}

      {/* Request Cards List */}
      <div className="flex-1 px-4 py-2 space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border mt-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-foreground">Inbox is Clear!</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              No pending requests matching this filter requiring HR action.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <SwipeableCard
              key={req.id}
              id={req.id}
              title={req.requesterName}
              subtitle={`${req.requesterDesignation} • ${req.requesterDepartment}`}
              category={req.requestType}
              statusBadge={req.amountOrDays}
              details={[
                { label: 'Topic', value: req.title },
                { label: 'Date/Range', value: req.date },
                { label: 'Branch', value: req.requesterBranch },
              ]}
              selectable={isBulkMode}
              isSelected={selectedIds.includes(req.id)}
              onToggleSelect={toggleSelect}
              onApprove={(id) => handleApprove(id)}
              onReject={(id) => handleOpenReject(id)}
              onClick={() => setSelectedRequest(req)}
            />
          ))
        )}
      </div>

      {/* Details Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedRequest)}
        onClose={() => {
          setSelectedRequest(null)
          setHrComments('')
        }}
        title="Request Review & Signoff"
      >
        {selectedRequest && (
          <div className="space-y-4 pb-4">
            {/* Requester Mini Profile */}
            <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRequest.requesterAvatar}
                  alt={selectedRequest.requesterName}
                  className="w-12 h-12 rounded-full object-cover border border-border"
                />
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {selectedRequest.requesterName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedRequest.requesterDesignation} • {selectedRequest.requesterId}
                  </p>
                  <span className="text-[10px] font-semibold text-primary">
                    {selectedRequest.requesterBranch}
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                {selectedRequest.requestType}
              </span>
            </div>

            {/* Request Summary */}
            <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Subject</span>
                <span className="font-bold text-foreground">{selectedRequest.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Applied Duration/Amount</span>
                <span className="font-bold text-primary">{selectedRequest.amountOrDays || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Schedule Dates</span>
                <span className="font-bold text-foreground">{selectedRequest.date}</span>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-[11px] text-muted-foreground font-medium">Reason Note:</p>
                <p className="text-xs text-foreground mt-0.5 leading-relaxed bg-card p-2 rounded-xl border border-border">
                  "{selectedRequest.description}"
                </p>
              </div>

              {selectedRequest.metadata?.leaveBalanceAfter && (
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  Remaining Leave Balance: {selectedRequest.metadata.leaveBalanceAfter}
                </div>
              )}
            </div>

            {/* Multi-Level Approval Hierarchy Timeline */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Approval Flow Hierarchy
              </h5>
              <div className="p-3.5 rounded-2xl bg-card border border-border">
                <ApprovalTimeline steps={selectedRequest.steps} />
              </div>
            </div>

            {/* HR Comments Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>HR Audit Comment (Optional)</span>
              </label>
              <textarea
                value={hrComments}
                onChange={(e) => setHrComments(e.target.value)}
                placeholder="Enter regulatory verification or audit notes..."
                rows={2}
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Sticky Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenReject(selectedRequest.id)}
                className="py-3 px-4 rounded-xl border border-rose-500 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-rose-500/10 active:scale-95 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={() => handleApprove(selectedRequest.id, hrComments)}
                className="py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Rejection Reason Sheet */}
      <BottomSheet
        isOpen={Boolean(rejectingRequest)}
        onClose={() => {
          setRejectingRequest(null)
          setRejectReason('')
        }}
        title="Reject Request"
      >
        {rejectingRequest && (
          <div className="space-y-4 pb-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-950 dark:text-rose-200">
              Rejecting <strong>{rejectingRequest.requesterName}</strong>'s {rejectingRequest.requestType} ({rejectingRequest.title}).
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Mandatory Rejection Remarks *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this request does not meet policy criteria..."
                rows={3}
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Common Rejection Shortcuts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground">Quick remarks:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Insufficient documentation attached',
                  'Exceeds policy budget limit',
                  'Leave blackout date period',
                  'Notice period required',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setRejectReason(txt)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-muted hover:bg-muted/80 text-foreground"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="py-3 px-4 rounded-xl border border-border text-foreground font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
