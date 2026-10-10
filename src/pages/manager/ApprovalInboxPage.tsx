import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useWorkflow, type WorkflowRequest, type WorkflowRequestType } from '@/context/WorkflowContext'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FastForward,
  Filter,
  Inbox,
  MoreVertical,
  Search,
  ShieldAlert,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export const ApprovalInboxPage: React.FC = () => {
  const {
    requests,
    approveRequest,
    rejectRequest,
    bulkApproveRequests,
    bulkRejectRequests,
    fastForwardTime,
    delegationRule,
  } = useWorkflow()

  const [activeTab, setActiveTab] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [searchTerm, setSearchTerm] = useState('')

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Detail drawer
  const [selectedReq, setSelectedReq] = useState<WorkflowRequest | null>(null)
  const [commentText, setCommentText] = useState('')

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchType = activeTab === 'All' || r.requestType === activeTab
      const matchStatus = statusFilter === 'all' || r.status === statusFilter
      const matchSearch =
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())

      return matchType && matchStatus && matchSearch
    })
  }, [requests, activeTab, statusFilter, searchTerm])

  const pendingCount = requests.filter((r) => r.status === 'pending').length

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredRequests.map((r) => r.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const handleQuickApprove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    approveRequest(id, 'Approved by manager')
  }

  const handleQuickReject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    rejectRequest(id, 'Declined due to operational conflict')
  }

  const handleDrawerAction = (action: 'approve' | 'reject') => {
    if (selectedReq) {
      if (action === 'approve') {
        approveRequest(selectedReq.id, commentText || 'Approved via detail drawer')
      } else {
        rejectRequest(selectedReq.id, commentText || 'Rejected via detail drawer')
      }
      setSelectedReq(null)
      setCommentText('')
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Unified Approvals Inbox"
        subtitle="Review, endorse, or decline cross-departmental requests across Leaves, Expenses, Overtime, and Loans."
        action={
          <div className="flex items-center gap-2.5">
            {/* Fast-forward time simulation button */}
            <button
              onClick={() => {
                fastForwardTime(24)
                alert('Fast-forwarded time +24 hours! Pending requests exceeding SLA are now flagged as Escalated.')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition shadow-2xs"
              title="Fast-forward time by 24h to simulate SLA escalation"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Fast-Forward Time (+24h)</span>
            </button>

            {delegationRule?.isActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Delegating to {delegationRule.delegateName}</span>
              </span>
            )}
          </div>
        }
      />

      {/* Tabs by Request Type */}
      <div className="flex items-center gap-1 border-b border-border overflow-x-auto scrollbar-none">
        {[
          'All',
          'Leave',
          'Expense',
          'Overtime',
          'Regularization',
          'Loan/Advance',
          'Resignation',
          'Profile Change',
        ].map((tab) => {
          const count =
            tab === 'All'
              ? requests.filter((r) => r.status === 'pending').length
              : requests.filter((r) => r.requestType === tab && r.status === 'pending').length

          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition -mb-px',
                isActive
                  ? 'border-primary text-primary bg-primary/5 rounded-t-lg'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              <span>{tab}</span>
              {count > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/20 text-primary font-bold">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {activeTab === 'Overtime' && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-foreground">
              Reviewing plant technician shift overtime? Access the specialized <strong>Supervisor OT Approval Workbench</strong> with multi-tier ApprovalTimeline (Supervisor → Plant HR).
            </span>
          </div>
          <Link
            to="/manager/overtime-approvals"
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shrink-0"
          >
            Open Supervisor OT Queue →
          </Link>
        </div>
      )}

      {/* Toolbar & Filter Bar */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by requester or request title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs py-1.5 px-3 bg-background border border-input rounded-lg"
          >
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Statuses</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border">
            <span className="text-xs text-muted-foreground px-2">
              <strong>{selectedIds.length}</strong> selected
            </span>
            <button
              onClick={() => {
                bulkApproveRequests(selectedIds)
                setSelectedIds([])
              }}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-500 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Bulk Approve</span>
            </button>
            <button
              onClick={() => {
                bulkRejectRequests(selectedIds)
                setSelectedIds([])
              }}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md bg-rose-600 text-white hover:bg-rose-500 shadow-2xs"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bulk Reject</span>
            </button>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3 w-8">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-input text-primary"
                />
              </th>
              <th className="p-3">Requester</th>
              <th className="p-3">Type & Title</th>
              <th className="p-3">Amount / Duration</th>
              <th className="p-3">Elapsed / SLA</th>
              <th className="p-3">Workflow Status</th>
              <th className="p-3 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-muted-foreground">
                  No requests matching the selected category and status.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const isSelected = selectedIds.includes(req.id)
                return (
                  <tr
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={cn(
                      'hover:bg-muted/40 cursor-pointer transition',
                      isSelected && 'bg-primary/5',
                      req.isEscalated && 'bg-rose-500/5'
                    )}
                  >
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(req.id)}
                        className="rounded border-input text-primary"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.requesterAvatar}
                          alt={req.requesterName}
                          className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{req.requesterName}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {req.requesterId} · {req.requesterDepartment}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-secondary text-secondary-foreground">
                          {req.requestType}
                        </span>
                        <p className="font-medium text-foreground">{req.title}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">{req.description}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-foreground">
                      {req.amountOrDays || '—'}
                    </td>
                    <td className="p-3">
                      {req.isEscalated ? (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[10px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Escalated ({req.hoursElapsed}h)
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">
                          {req.hoursElapsed}h ago
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold',
                          req.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : req.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        )}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => handleQuickApprove(req.id, e)}
                            className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition"
                            title="Quick Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleQuickReject(req.id, e)}
                            className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition"
                            title="Quick Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedReq(req)}
                            className="p-1.5 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground"
                            title="View Timeline & Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="px-2.5 py-1 text-[11px] rounded-md bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          View Audit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Slide-out Drawer */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-card border-l border-border h-full p-6 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedReq.requesterAvatar}
                  alt={selectedReq.requesterName}
                  className="w-12 h-12 rounded-xl object-cover border border-border"
                />
                <div>
                  <h3 className="font-bold text-foreground text-sm">{selectedReq.requesterName}</h3>
                  <p className="text-xs text-muted-foreground">{selectedReq.requesterDesignation}</p>
                  <span className="text-[10px] text-primary font-mono">{selectedReq.requesterId} · {selectedReq.requesterDepartment}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Request Summary Card */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                  {selectedReq.requestType}
                </span>
                <span className="font-mono text-muted-foreground">{selectedReq.submittedAt}</span>
              </div>
              <h4 className="font-bold text-foreground text-sm">{selectedReq.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{selectedReq.description}</p>
              {selectedReq.amountOrDays && (
                <div className="pt-2 border-t border-border flex justify-between font-medium">
                  <span className="text-muted-foreground">Scope / Amount:</span>
                  <strong className="text-foreground">{selectedReq.amountOrDays}</strong>
                </div>
              )}
            </div>

            {/* Requester Context (Leave Balance & Attendance) */}
            <div className="p-4 rounded-xl border border-border bg-background space-y-2 text-xs">
              <h4 className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Requester Context & Balances
              </h4>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 rounded-lg bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Leave Balance:</span>
                  <strong className="text-foreground text-sm">11.5 Days</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground block">Monthly Attendance:</span>
                  <strong className="text-emerald-600 text-sm">96.2% On-time</strong>
                </div>
              </div>
            </div>

            {/* Approval Timeline Component */}
            <div className="space-y-3">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                Approval Chain Timeline (Steps 1..{selectedReq.steps.length})
              </h4>
              <ApprovalTimeline steps={selectedReq.steps} />
            </div>

            {/* Action Buttons for Pending Request */}
            {selectedReq.status === 'pending' && (
              <div className="pt-4 border-t border-border space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Review Remarks</label>
                  <input
                    type="text"
                    placeholder="Optional comment / approval feedback..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDrawerAction('reject')}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-rose-600/10 text-rose-600 hover:bg-rose-600/20 transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDrawerAction('approve')}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-xs"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
