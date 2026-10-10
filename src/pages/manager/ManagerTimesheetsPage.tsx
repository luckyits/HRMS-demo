import React, { useState } from 'react'
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Search,
  Check,
  X,
  MessageSquare,
  AlertCircle
} from 'lucide-react'
import { useOptionalModules, WeeklyTimesheetEntry } from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'

export const ManagerTimesheetsPage: React.FC = () => {
  const { weeklyTimesheets, approveTimesheet, rejectTimesheet } = useOptionalModules()
  const { showToast } = useToast()

  const [searchQuery, setSearchQuery] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [targetTimesheet, setTargetTimesheet] = useState<WeeklyTimesheetEntry | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = (ts: WeeklyTimesheetEntry) => {
    approveTimesheet(ts.id)
    showToast(`Timesheet for ${ts.employeeName} (${ts.totalHours} hrs) approved successfully`, 'success')
  }

  const openRejectModal = (ts: WeeklyTimesheetEntry) => {
    setTargetTimesheet(ts)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetTimesheet) return
    if (!rejectReason.trim()) {
      showToast('Please provide a reason for rejecting the timesheet', 'warning')
      return
    }
    rejectTimesheet(targetTimesheet.id, rejectReason)
    showToast(`Timesheet for ${targetTimesheet.employeeName} returned with comments`, 'info')
    setRejectModalOpen(false)
  }

  const filteredTimesheets = weeklyTimesheets.filter((ts) =>
    ts.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ts.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pendingCount = weeklyTimesheets.filter((ts) => ts.status === 'Submitted').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Team Timesheet Approvals
              </h1>
              <p className="text-sm text-muted-foreground">
                Review weekly client hours, billable utilization, and grant supervisor approval
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 font-semibold text-xs border border-amber-500/20">
            {pendingCount} Pending Manager Sign-off
          </span>
        </div>
      </div>

      {/* Search and filter */}
      <div className="relative w-full max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search team member or project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Approvals Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3.5">Employee</th>
                <th className="px-5 py-3.5">Week Cycle</th>
                <th className="px-5 py-3.5">Project & Task</th>
                <th className="px-5 py-3.5">Total Hours</th>
                <th className="px-5 py-3.5">Billable vs Non-Billable</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTimesheets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    No timesheets currently pending review.
                  </td>
                </tr>
              ) : (
                filteredTimesheets.map((ts) => (
                  <tr key={ts.id} className="hover:bg-muted/30 transition">
                    <td className="px-5 py-3.5 font-medium">
                      <div className="text-foreground">{ts.employeeName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{ts.employeeId}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {ts.weekStartDate}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground">{ts.projectName}</div>
                      <div className="text-xs text-muted-foreground">{ts.taskName}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-foreground">
                      {ts.totalHours} hrs
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs font-semibold text-emerald-500">
                        {ts.billableHours} hrs billable
                      </div>
                      {ts.nonBillableHours > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {ts.nonBillableHours} hrs internal
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          ts.status === 'Approved'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : ts.status === 'Submitted'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-rose-500/10 text-rose-500'
                        }`}
                      >
                        {ts.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {ts.status === 'Submitted' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(ts)}
                            className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition"
                            title="Approve Timesheet"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(ts)}
                            className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-500/20 transition"
                            title="Reject & Request Revision"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && targetTimesheet && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Reject Timesheet</h3>
            <p className="text-xs text-muted-foreground">
              Provide feedback for {targetTimesheet.employeeName} regarding the required adjustments.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Reason for Revision</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Overstated hours on non-billable code reviews..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-sm border border-border rounded-xl hover:bg-muted font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
