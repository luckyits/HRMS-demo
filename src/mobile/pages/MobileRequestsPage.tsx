import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  Receipt,
  Navigation,
  TrendingUp,
  LifeBuoy,
  UserCheck,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Trash2,
  Send,
  FileText
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ChipFilterRow } from '@/mobile/components/ChipFilterRow'
import { ListCard } from '@/mobile/components/ListCard'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { ApprovalTimeline, type ApprovalStep } from '@/components/common/ApprovalTimeline'
import { useAccess } from '@/access/useAccess'
import { useEss } from '@/context/EssContext'
import { useAttendance } from '@/context/AttendanceContext'
import { useToast } from '@/context/ToastContext'

interface AggregatedRequest {
  id: string
  module: 'Leave' | 'Attendance' | 'Expense' | 'Helpdesk'
  title: string
  subtitle: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  date: string
  reason: string
  comments?: string
  canCancel?: boolean
  approvalSteps: ApprovalStep[]
}

export const MobileRequestsPage: React.FC = () => {
  const navigate = useNavigate()
  const { hasFeature } = useAccess()
  const { leaveRequests, cancelLeaveRequest, tickets } = useEss()
  const { regularizations } = useAttendance()
  const { showToast } = useToast()

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedRequest, setSelectedRequest] = useState<AggregatedRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Aggregate real user requests
  const aggregatedRequests: AggregatedRequest[] = [
    // 1. Leave Requests
    ...leaveRequests.map((l) => ({
      id: l.id,
      module: 'Leave' as const,
      title: `${l.leaveType} (${l.daysCount} Day${l.daysCount > 1 ? 's' : ''})`,
      subtitle: `${l.startDate} ${l.startDate !== l.endDate ? `to ${l.endDate}` : ''}`,
      status: l.status,
      date: l.submittedAt,
      reason: l.reason,
      comments: l.managerComments,
      canCancel: l.status === 'pending',
      approvalSteps: [
        {
          id: 'step-1',
          title: 'Submitted by Employee',
          approverName: 'Aarav Patel (You)',
          approverRole: 'Applicant',
          status: 'approved' as const,
          timestamp: l.submittedAt,
          comments: l.reason,
        },
        {
          id: 'step-2',
          title: 'Direct Manager Approval',
          approverName: 'Vikram Malhotra',
          approverRole: 'Reporting Manager',
          status: l.status === 'approved' ? ('approved' as const) : l.status === 'rejected' ? ('rejected' as const) : ('pending' as const),
          timestamp: l.status === 'approved' ? 'Oct 08, 11:30 AM' : undefined,
          comments: l.managerComments || (l.status === 'pending' ? 'Reviewing team leave calendar.' : undefined),
        },
        {
          id: 'step-3',
          title: 'HR Leave Balance Sync',
          approverName: 'Sarah Jenkins',
          approverRole: 'HR Executive',
          status: l.status === 'approved' ? ('approved' as const) : ('waiting' as const),
          comments: 'Statutory leave wallet update.',
        },
      ],
    })),

    // 2. Attendance Regularizations
    ...regularizations.map((r) => ({
      id: r.id,
      module: 'Attendance' as const,
      title: `Regularization: ${r.issueType}`,
      subtitle: `${r.date} • ${r.requestedInTime} - ${r.requestedOutTime}`,
      status: r.status,
      date: r.submittedAt,
      reason: r.reason,
      comments: r.comments,
      canCancel: r.status === 'pending',
      approvalSteps: [
        {
          id: 'step-1',
          title: 'Punch Correction Applied',
          approverName: 'Aarav Patel (You)',
          approverRole: 'Applicant',
          status: 'approved' as const,
          timestamp: r.submittedAt,
          comments: r.reason,
        },
        {
          id: 'step-2',
          title: 'Shift In-charge Verification',
          approverName: 'Vikram Malhotra',
          approverRole: 'Manager',
          status: r.status === 'approved' ? ('approved' as const) : r.status === 'rejected' ? ('rejected' as const) : ('pending' as const),
          comments: r.comments,
        },
      ],
    })),

    // 3. Helpdesk Tickets
    ...tickets.map((t) => ({
      id: t.id,
      module: 'Helpdesk' as const,
      title: `Ticket: ${t.subject}`,
      subtitle: `${t.category} • Priority: ${t.priority}`,
      status: t.status === 'Resolved' || t.status === 'Closed' ? ('approved' as const) : ('pending' as const),
      date: t.createdAt,
      reason: t.description,
      approvalSteps: [
        {
          id: 'step-1',
          title: 'Ticket Raised',
          approverName: t.isAnonymous ? 'Anonymous Employee' : 'Aarav Patel',
          approverRole: 'Requester',
          status: 'approved' as const,
          timestamp: t.createdAt,
        },
        {
          id: 'step-2',
          title: 'Helpdesk SLA Resolution',
          approverName: 'IT & Facilities Support Desk',
          approverRole: 'Helpdesk Admin',
          status: t.status === 'Resolved' ? ('approved' as const) : ('pending' as const),
          comments: 'Assigned within 4h SLA.',
        },
      ],
    })),
  ]

  // Filter requests
  const filteredRequests = aggregatedRequests.filter((item) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'pending') return item.status === 'pending'
    if (activeFilter === 'approved') return item.status === 'approved'
    if (activeFilter === 'rejected') return item.status === 'rejected' || item.status === 'cancelled'
    return true
  })

  const handleCancel = (id: string) => {
    cancelLeaveRequest(id)
    showToast('Request cancelled successfully', 'info')
    setIsDetailOpen(false)
  }

  const getStatusVariant = (status: AggregatedRequest['status']) => {
    switch (status) {
      case 'approved':
        return 'success'
      case 'rejected':
      case 'cancelled':
        return 'danger'
      default:
        return 'warning'
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Requests Hub"
        subtitle="Submit & track self-service requests"
        showBack={false}
      />

      <div className="p-4 space-y-5">
        {/* Large Permitted Action Tiles */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            New Application
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            {hasFeature('LEAVE') && (
              <button
                type="button"
                onClick={() => navigate('/employee/leaves')}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col items-start gap-2 active:scale-95 transition text-left hover:border-primary/50"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Apply Leave</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">EL, CL & SL Balances</p>
                </div>
              </button>
            )}

            {hasFeature('REGULARIZATION') && (
              <button
                type="button"
                onClick={() => navigate('/employee/regularization')}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col items-start gap-2 active:scale-95 transition text-left hover:border-primary/50"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Regularize Punch</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Missed biometric mark</p>
                </div>
              </button>
            )}

            {hasFeature('EXPENSE') && (
              <button
                type="button"
                onClick={() => navigate('/employee/claims')}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col items-start gap-2 active:scale-95 transition text-left hover:border-primary/50"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Expense Claim</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Upload bills & slips</p>
                </div>
              </button>
            )}

            {hasFeature('VISIT') && (
              <button
                type="button"
                onClick={() => navigate('/employee/visits')}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col items-start gap-2 active:scale-95 transition text-left hover:border-primary/50"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Client Visit</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Geo-beat check in</p>
                </div>
              </button>
            )}

            {hasFeature('OVERTIME') && (
              <button
                type="button"
                onClick={() => navigate('/employee/overtime')}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col items-start gap-2 active:scale-95 transition text-left hover:border-primary/50"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Overtime Claim</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">2.0x Double rate shift</p>
                </div>
              </button>
            )}

            {hasFeature('HELPDESK') && (
              <button
                type="button"
                onClick={() => navigate('/employee/helpdesk')}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex flex-col items-start gap-2 active:scale-95 transition text-left hover:border-primary/50"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Helpdesk Ticket</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">HR & anonymous issue</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* My Requests Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              My Applications ({filteredRequests.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">Tap to view journey</span>
          </div>

          {/* Filter Chips */}
          <ChipFilterRow
            chips={[
              { id: 'all', label: 'All Requests' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected / Cancelled' },
            ]}
            selectedId={activeFilter}
            onSelect={(id) => setActiveFilter(id as any)}
          />

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <div className="p-8 rounded-2xl bg-muted/20 border border-dashed border-border text-center space-y-1">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">No applications found</p>
              <p className="text-[10px] text-muted-foreground/70">
                You have no {activeFilter !== 'all' ? activeFilter : ''} requests recorded yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequest(req)
                    setIsDetailOpen(true)
                  }}
                  className="cursor-pointer"
                >
                  <ListCard
                    title={req.title}
                    subtitle={`${req.date} • Ref #${req.id}`}
                    status={req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    statusVariant={getStatusVariant(req.status)}
                    fields={[
                      { label: 'Reason', value: req.reason },
                      { label: 'Module', value: req.module },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details & ApprovalTimeline BottomSheet */}
      <BottomSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedRequest ? selectedRequest.title : 'Application Details'}
        subtitle={selectedRequest ? `Ref: ${selectedRequest.id} • ${selectedRequest.module}` : undefined}
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Application Type:</span>
                <span className="font-bold text-foreground">{selectedRequest.module}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Submitted On:</span>
                <span className="font-bold text-foreground">{selectedRequest.date}</span>
              </div>
              <div className="pt-1 border-t border-border/60">
                <span className="text-muted-foreground block font-medium mb-0.5">Reason / Justification:</span>
                <p className="text-foreground italic bg-background p-2 rounded-lg border border-border/60">
                  "{selectedRequest.reason}"
                </p>
              </div>
              {selectedRequest.comments && (
                <div className="pt-1">
                  <span className="text-muted-foreground block font-medium mb-0.5">Manager Feedback:</span>
                  <p className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    {selectedRequest.comments}
                  </p>
                </div>
              )}
            </div>

            {/* Approval Workflow Journey */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Approval Workflow Progress
              </h4>
              <ApprovalTimeline steps={selectedRequest.approvalSteps} />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              {selectedRequest.canCancel && (
                <button
                  type="button"
                  onClick={() => handleCancel(selectedRequest.id)}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Withdraw Request</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs active:scale-95 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
