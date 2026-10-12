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
  ArrowRight
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { SwipeableCard } from '@/mobile/components/SwipeableCard'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { useWorkflow, type WorkflowRequest, type WorkflowRequestType } from '@/context/WorkflowContext'
import { useEss } from '@/context/EssContext'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'

export const MobileApprovalsPage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { requests, approveRequest, rejectRequest, bulkApproveRequests, delegationRule } = useWorkflow()
  const { updateLeaveRequestStatus } = useEss()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<string>('All')
  const [selectedRequest, setSelectedRequest] = useState<WorkflowRequest | null>(null)
  const [rejectingRequest, setRejectingRequest] = useState<WorkflowRequest | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [managerComments, setManagerComments] = useState('')

  // Bulk select state
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Only show pending requests
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'pending')
  }, [requests])

  // Tabs configuration
  const tabTypes: { id: string; label: string; type?: WorkflowRequestType }[] = [
    { id: 'All', label: 'All' },
    { id: 'Leave', label: 'Leave', type: 'Leave' },
    { id: 'Expense', label: 'Expense', type: 'Expense' },
    { id: 'Overtime', label: 'OT', type: 'Overtime' },
    { id: 'Regularization', label: 'Regularize', type: 'Regularization' },
    { id: 'Loan/Advance', label: 'Loan', type: 'Loan/Advance' },
    { id: 'Resignation', label: 'Exit', type: 'Resignation' },
    { id: 'Profile Change', label: 'Profile', type: 'Profile Change' },
  ]

  const getTabCount = (type?: WorkflowRequestType) => {
    if (!type) return pendingRequests.length
    return pendingRequests.filter((r) => r.requestType === type).length
  }

  // Filtered requests by active tab
  const filteredRequests = useMemo(() => {
    if (activeTab === 'All') return pendingRequests
    return pendingRequests.filter((r) => r.requestType === activeTab)
  }, [pendingRequests, activeTab])

  // Single Approve handler
  const handleApprove = (id: string, customComment?: string) => {
    const target = requests.find((r) => r.id === id)
    const comment = customComment || managerComments || 'Approved by reporting manager.'
    approveRequest(id, comment)

    // Immediate sync with Employee side status
    if (target?.requestType === 'Leave') {
      updateLeaveRequestStatus(id, 'approved', comment)
    }

    showToast(`Approved ${target?.title || 'request'} for ${target?.requesterName || 'employee'}!`, 'success')
    setSelectedRequest(null)
    setManagerComments('')
    setSelectedIds((prev) => prev.filter((i) => i !== id))
  }

  // Single Reject handler
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingRequest) return
    const reason = rejectReason.trim() || 'Request does not meet operational policy requirements.'
    rejectRequest(rejectingRequest.id, reason)

    // Immediate sync with Employee side status
    if (rejectingRequest.requestType === 'Leave') {
      updateLeaveRequestStatus(rejectingRequest.id, 'rejected', reason)
    }

    showToast(`Rejected request for ${rejectingRequest.requesterName} with remarks`, 'info')
    setRejectingRequest(null)
    setSelectedRequest(null)
    setRejectReason('')
    setSelectedIds((prev) => prev.filter((i) => i !== rejectingRequest.id))
  }

  // Bulk Approve handler
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    bulkApproveRequests(selectedIds, 'Bulk approved by reporting manager.')

    // Sync all leaves
    selectedIds.forEach((id) => {
      const target = requests.find((r) => r.id === id)
      if (target?.requestType === 'Leave') {
        updateLeaveRequestStatus(id, 'approved', 'Bulk approved by reporting manager.')
      }
    })

    showToast(`Bulk approved ${selectedIds.length} team applications!`, 'success')
    setSelectedIds([])
    setIsBulkMode(false)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRequests.map((r) => r.id))
    }
  }

  if (!hasFeature('MSS_APPROVALS')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Manager approvals inbox is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-24">
      <MobileHeader
        title="Approvals Inbox"
        subtitle={`${pendingRequests.length} team items awaiting sign-off`}
        showBack={false}
        rightAction={
          <button
            type="button"
            onClick={() => {
              setIsBulkMode(!isBulkMode)
              if (isBulkMode) setSelectedIds([])
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
              isBulkMode
                ? 'bg-primary text-primary-foreground'
                : 'text-primary bg-primary/10'
            }`}
          >
            {isBulkMode ? 'Done' : 'Select'}
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Horizontal Scroll Segmented Tabs with Count Badges */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 snap-x select-none">
          {tabTypes.map((tab) => {
            const count = getTabCount(tab.type)
            const isSelected = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 rounded-2xl text-xs font-bold shrink-0 snap-start flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`min-w-4 h-4 px-1 rounded-full text-[10px] font-black flex items-center justify-center ${
                      isSelected
                        ? 'bg-white text-primary'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Swipe instructions & Bulk Control Header */}
        <div className="flex items-center justify-between px-1">
          {isBulkMode ? (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-bold text-primary flex items-center gap-1.5"
            >
              {selectedIds.length === filteredRequests.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Select All ({filteredRequests.length})</span>
            </button>
          ) : (
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <span>Swipe right: <strong>Approve</strong> • Left: <strong>Reject</strong></span>
            </div>
          )}

          {delegationRule?.isActive && (
            <span className="text-[10px] font-bold text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded-full">
              Delegated from Vikram
            </span>
          )}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-3xl space-y-2 mt-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-foreground">Inbox Zero!</h4>
            <p className="text-xs text-muted-foreground">
              All {activeTab !== 'All' ? activeTab : ''} requests have been processed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => {
              // Self-approval blocked indicator
              const isSelfApprovalBlocked = req.requesterId === currentEmployee.id || req.requesterName === currentEmployee.name

              return (
                <SwipeableCard
                  key={req.id}
                  id={req.id}
                  title={`${req.requesterName} • ${req.requestType}`}
                  subtitle={`${req.title} • ${req.amountOrDays || req.date}`}
                  category={req.requestType}
                  details={[
                    { label: 'Department', value: req.requesterDepartment },
                    { label: 'Reason', value: req.description },
                  ]}
                  statusBadge={req.amountOrDays || req.requestType}
                  onApprove={(id) => handleApprove(id)}
                  onReject={(id) => {
                    setRejectingRequest(req)
                    setRejectReason('')
                  }}
                  onClick={() => setSelectedRequest(req)}
                  selectable={isBulkMode}
                  isSelected={selectedIds.includes(req.id)}
                  onToggleSelect={toggleSelect}
                  isSelfApprovalBlocked={isSelfApprovalBlocked}
                  delegationBadge={delegationRule?.isActive ? `Acting for ${delegationRule.managerName}` : undefined}
                  isEscalated={req.isEscalated || req.hoursElapsed > 24}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Bulk Action Sticky Bar */}
      {isBulkMode && selectedIds.length > 0 && (
        <StickyActionBar>
          <button
            type="button"
            onClick={handleBulkApprove}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Selected ({selectedIds.length} Requests)</span>
          </button>
        </StickyActionBar>
      )}

      {/* Request Details BottomSheet */}
      <BottomSheet
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        title={selectedRequest ? `${selectedRequest.requestType} Request: ${selectedRequest.requesterName}` : 'Approval Details'}
        subtitle={selectedRequest ? `Ref: ${selectedRequest.id} • ${selectedRequest.submittedAt}` : undefined}
      >
        {selectedRequest && (
          <div className="space-y-4">
            {/* Employee Summary Card */}
            <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center gap-3">
              <img
                src={selectedRequest.requesterAvatar}
                alt={selectedRequest.requesterName}
                className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">
                  {selectedRequest.requesterName}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {selectedRequest.requesterDesignation} • {selectedRequest.requesterDepartment}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  Location: {selectedRequest.requesterBranch}
                </span>
              </div>
            </div>

            {/* Request Data & Context Box */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Application:</span>
                <span className="font-bold text-foreground">{selectedRequest.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration / Amount:</span>
                <span className="font-bold text-primary font-mono">{selectedRequest.amountOrDays || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Effective Dates:</span>
                <span className="font-semibold text-foreground">{selectedRequest.date}</span>
              </div>
              <div className="pt-1 border-t border-border/50">
                <span className="text-muted-foreground block font-medium mb-0.5">Employee Reason:</span>
                <p className="text-foreground italic bg-background p-2 rounded-lg border border-border/60">
                  "{selectedRequest.description}"
                </p>
              </div>

              {/* Context: Leave Balance or Attendance Record */}
              {selectedRequest.metadata?.leaveBalanceAfter && (
                <div className="pt-1 flex items-center justify-between text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg">
                  <span>Balance After Approval:</span>
                  <span className="font-bold">{selectedRequest.metadata.leaveBalanceAfter}</span>
                </div>
              )}
            </div>

            {/* Approval Workflow Journey */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Approval Workflow Journey
              </h4>
              <ApprovalTimeline steps={selectedRequest.steps} />
            </div>

            {/* Optional Manager Comments Box */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Decision Comments (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Approved. Coverage arranged with team."
                value={managerComments}
                onChange={(e) => setManagerComments(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Sticky Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingRequest(selectedRequest)
                  setRejectReason('')
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>

              <button
                type="button"
                onClick={() => handleApprove(selectedRequest.id)}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Approve Request</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Reject Reason BottomSheet */}
      <BottomSheet
        isOpen={Boolean(rejectingRequest)}
        onClose={() => setRejectingRequest(null)}
        title="Reject Application"
        subtitle={rejectingRequest ? `Ref: ${rejectingRequest.id} for ${rejectingRequest.requesterName}` : undefined}
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200">
            Please provide remarks for this rejection. The feedback will be shared with the employee.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Rejection Reason / Remarks
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Client deployment sprint deadline; please reschedule to next week."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
            >
              <X className="w-4 h-4" />
              <span>Confirm Rejection</span>
            </button>
            <button
              type="button"
              onClick={() => setRejectingRequest(null)}
              className="py-3 px-4 rounded-xl bg-muted text-foreground font-bold text-xs active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
