import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { DataTable } from '@/components/common/DataTable'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FilterBar } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEss } from '@/context/EssContext'
import type { LeaveBalance, LeaveRequest } from '@/mock/essData'
import type { ColumnDef } from '@tanstack/react-table'
import {
  AlertCircle,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

export const LeaveManagementPage: React.FC = () => {
  const { leaveBalances, leaveRequests, applyLeave, cancelLeaveRequest } = useEss()

  // Apply Modal
  const [modal, setModal] = useState({
    isOpen: false,
    leaveType: 'Earned Leave (EL)',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
    attachmentName: '',
  })

  // Selected request for timeline drawer inspect
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null)

  // Calculate day count
  const calculateDays = (start: string, end: string, isHalf: boolean) => {
    if (!start || !end) return 0
    if (isHalf) return 0.5
    const s = new Date(start)
    const e = new Date(end)
    const diffTime = e.getTime() - s.getTime()
    if (diffTime < 0) return 0
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const requestedDaysCount = calculateDays(modal.startDate, modal.endDate, modal.isHalfDay)

  // Current balance of selected leave type
  const currentBalance = leaveBalances.find((b) => b.type === modal.leaveType)
  const balanceAfter = currentBalance ? Math.max(0, currentBalance.available - requestedDaysCount) : 0

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!modal.startDate || !modal.endDate || !modal.reason) return
    if (requestedDaysCount <= 0) {
      alert('End date must be greater than or equal to start date.')
      return
    }

    applyLeave({
      leaveType: modal.leaveType,
      startDate: modal.startDate,
      endDate: modal.endDate,
      daysCount: requestedDaysCount,
      isHalfDay: modal.isHalfDay,
      reason: modal.reason,
      attachmentName: modal.attachmentName || undefined,
    })

    setModal({
      isOpen: false,
      leaveType: 'Earned Leave (EL)',
      startDate: '',
      endDate: '',
      isHalfDay: false,
      reason: '',
      attachmentName: '',
    })

    alert('Leave application submitted to direct manager for review.')
  }

  const columns: ColumnDef<LeaveRequest>[] = [
    {
      accessorKey: 'id',
      header: 'Application ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-primary">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'leaveType',
      header: 'Leave Category',
      cell: ({ row }) => (
        <span className="font-semibold text-xs text-foreground">
          {row.original.leaveType}
        </span>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Dates Requested',
      cell: ({ row }) => (
        <div className="text-xs">
          <span className="text-foreground font-medium">
            {row.original.startDate} to {row.original.endDate}
          </span>
          <span className="text-[11px] text-muted-foreground block">
            {row.original.daysCount} {row.original.daysCount === 1 ? 'day' : 'days'}{' '}
            {row.original.isHalfDay && '(Half Day)'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground italic truncate max-w-xs block">
          “{row.original.reason}”
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Approval Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Audit & Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedReq(row.original)}
            className="text-xs text-primary hover:underline font-medium"
          >
            Track Ladder
          </button>
          {row.original.status === 'pending' && (
            <button
              type="button"
              onClick={() => cancelLeaveRequest(row.original.id)}
              className="text-rose-600 hover:text-rose-700 text-xs font-semibold px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <FeatureGate feature="LEAVE">
      <div className="space-y-6">
        <PageHeader
          title="Leave Management & Quota Wallets"
          subtitle="Track your annual leave entitlement balances, apply for planned time off, and inspect manager approvals"
          scope="Self"
          breadcrumbs={[{ label: 'ERP' }, { label: 'My Self-Service' }, { label: 'Leave' }]}
          action={
            <button
              type="button"
              onClick={() => setModal((prev) => ({ ...prev, isOpen: true }))}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Apply For Leave</span>
            </button>
          }
        />

        {/* Leave Balance Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {leaveBalances.map((bal) => (
            <div
              key={bal.code}
              className="bg-card border border-border rounded-2xl p-5 shadow-2xs hover:shadow-xs transition relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate">
                  {bal.type}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${bal.color}`}>
                  {bal.code}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <h4 className="text-3xl font-extrabold text-foreground tracking-tight">
                  {bal.available}
                </h4>
                <span className="text-xs text-muted-foreground font-medium">Days Available</span>
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Allocated: {bal.allocated}d</span>
                <span>Consumed: {bal.used}d</span>
              </div>
            </div>
          ))}
        </div>

        {/* Leave History Table */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                My Leave Application History
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {leaveRequests.length} Applications Recorded
            </span>
          </div>

          <DataTable columns={columns} data={leaveRequests} />
        </div>

        {/* Modal: Apply Leave */}
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6 relative text-xs">
              <button
                type="button"
                onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
                className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <span>Apply For Leave</span>
              </h3>
              <p className="text-muted-foreground mt-0.5">
                Submit planned absence request to direct reporting manager.
              </p>

              <form onSubmit={handleApplySubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Select Leave Category
                  </label>
                  <select
                    value={modal.leaveType}
                    onChange={(e) => setModal((prev) => ({ ...prev, leaveType: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  >
                    {leaveBalances.map((b) => (
                      <option key={b.code} value={b.type}>
                        {b.type} ({b.available} days balance remaining)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      required
                      value={modal.startDate}
                      onChange={(e) => setModal((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-foreground block mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      required
                      value={modal.endDate}
                      onChange={(e) => setModal((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="halfDayCheck"
                    checked={modal.isHalfDay}
                    onChange={(e) => setModal((prev) => ({ ...prev, isHalfDay: e.target.checked }))}
                    className="rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="halfDayCheck" className="font-medium text-foreground">
                    Half-Day Leave (Morning / Afternoon Session)
                  </label>
                </div>

                {/* Day Count and Balance After Preview */}
                <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Calculated Duration
                    </span>
                    <span className="font-bold text-sm text-foreground">
                      {requestedDaysCount} {requestedDaysCount === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                      Balance After Request
                    </span>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {balanceAfter} Days Remaining
                    </span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Reason for Leave (Mandatory)
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="e.g. Attending family function in native town..."
                    value={modal.reason}
                    onChange={(e) => setModal((prev) => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Medical / Supporting Document (Required if SL &gt; 2 days)
                  </label>
                  <div className="flex items-center gap-2 p-2 border border-dashed border-input rounded-xl bg-muted/20">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Simulated attachment (e.g. medical_certificate.pdf)"
                      value={modal.attachmentName}
                      onChange={(e) => setModal((prev) => ({ ...prev, attachmentName: e.target.value }))}
                      className="flex-1 bg-transparent border-none text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
                    className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drawer / Modal: Approval Timeline Details */}
        {selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 relative text-xs space-y-4">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-bold text-foreground">
                Approval Ladder Audit Trail ({selectedReq.id})
              </h3>
              <p className="text-muted-foreground text-xs">
                {selectedReq.leaveType} • {selectedReq.daysCount} Days ({selectedReq.startDate} to {selectedReq.endDate})
              </p>

              <ApprovalTimeline
                steps={[
                  {
                    id: '1',
                    title: 'Leave Request Submitted',
                    approverName: 'Aarav Patel',
                    approverRole: 'Applicant (Employee)',
                    status: 'approved',
                    timestamp: selectedReq.submittedAt,
                    comments: selectedReq.reason,
                  },
                  {
                    id: '2',
                    title: 'Direct Reporting Manager',
                    approverName: 'Vikram Malhotra',
                    approverRole: 'Engineering Manager',
                    status: selectedReq.status === 'approved' ? 'approved' : selectedReq.status === 'cancelled' ? 'rejected' : 'pending',
                    timestamp: selectedReq.status === 'approved' ? 'Approved' : 'Under Review',
                    comments: selectedReq.managerComments,
                  },
                  {
                    id: '3',
                    title: 'HR Operations Signoff',
                    approverName: 'Sarah Jenkins',
                    approverRole: 'Chief People Officer',
                    status: selectedReq.status === 'approved' ? 'approved' : 'waiting',
                    timestamp: selectedReq.status === 'approved' ? 'Synced to Payroll' : 'Pending Manager Signoff',
                  },
                ]}
              />

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
