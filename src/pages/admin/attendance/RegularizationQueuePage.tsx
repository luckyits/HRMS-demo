import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import type { AdminRegularizationRequest } from '@/mock/adminAttendance'
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  Building,
} from 'lucide-react'

export const RegularizationQueuePage: React.FC = () => {
  const { regularizations, approveRegularization, rejectRegularization } = useAdminAttendance()

  const [statusFilter, setStatusFilter] = useState('Pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')

  // Rejection modal
  const [rejectingItem, setRejectingItem] = useState<AdminRegularizationRequest | null>(null)
  const [rejectRemarks, setRejectRemarks] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const filteredItems = regularizations.filter((item) => {
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    const matchesDept = selectedDept === 'All' || item.department === selectedDept
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesDept && matchesSearch
  })

  const pendingCount = regularizations.filter((r) => r.status === 'Pending').length

  const handleApprove = (id: string, name: string) => {
    approveRegularization(id, 'Approved by HR Operations')
    setToastMessage(`Regularization request for ${name} has been approved.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingItem || !rejectRemarks.trim()) return

    rejectRegularization(rejectingItem.id, rejectRemarks.trim())
    setRejectingItem(null)
    setRejectRemarks('')
    setToastMessage(`Request rejected: ${rejectingItem.employeeName}`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleApproveAllPending = () => {
    const pendingList = regularizations.filter((r) => r.status === 'Pending')
    pendingList.forEach((p) => approveRegularization(p.id, 'Batch approved by HR Admin'))
    setToastMessage(`Approved ${pendingList.length} pending regularizations in batch.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Attendance Regularization Queue"
        subtitle="Review, approve, or reject employee missed punch requests and biometric glitch claims"
        action={
          pendingCount > 0 ? (
            <button
              onClick={handleApproveAllPending}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-all shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve All Pending ({pendingCount})</span>
            </button>
          ) : undefined
        }
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
        <div className="flex items-center gap-1">
          {['Pending', 'Approved', 'Rejected', 'All'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search staff or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg px-3 py-1.5"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="People Operations">People Operations</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Queue Cards Grid */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-2xl">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h4 className="font-bold text-sm text-foreground">No Regularizations Found</h4>
            <p className="text-xs text-muted-foreground mt-1">
              There are no regularization items matching your active filter criteria.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-border">
                  {/* Employee Identity */}
                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.employeeName}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{item.employeeName}</h4>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.employeeId}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground">
                          {item.branch}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.department} &bull; Submitted {item.submittedAt}
                      </p>
                    </div>
                  </div>

                  {/* Status & Issue Type Tag */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      {item.issueType}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : item.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Punch Difference Comparison Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 p-3 bg-muted/20 border border-border rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                      Target Date
                    </span>
                    <span className="font-extrabold text-foreground text-sm">{item.date}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                      Original Punch Record
                    </span>
                    <div className="font-mono text-muted-foreground">
                      IN: <span className="font-semibold">{item.originalIn || '—'}</span> &bull; OUT:{' '}
                      <span className="font-semibold">{item.originalOut || '—'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-primary block mb-0.5">
                      Requested Regularized Punches
                    </span>
                    <div className="font-mono text-primary font-bold">
                      IN: {item.requestedIn} &bull; OUT: {item.requestedOut}
                    </div>
                  </div>
                </div>

                {/* Reason & Comments */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2 text-foreground">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span>
                      <strong>Employee Reason:</strong> &ldquo;{item.reason}&rdquo;
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground pl-5.5">
                    Manager Endorsement: <span className="text-emerald-600 font-semibold">{item.managerApprovalStatus}</span>
                  </div>
                  {item.reviewerRemarks && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 pl-5.5 font-medium">
                      Admin Remarks: {item.reviewerRemarks}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {item.status === 'Pending' && (
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-4">
                    <button
                      onClick={() => {
                        setRejectingItem(item)
                        setRejectRemarks('')
                      }}
                      className="px-4 py-2 border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reject Request
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.employeeName)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve & Update Register
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setRejectingItem(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Reject Regularization</h4>
                <p className="text-xs text-muted-foreground">
                  Employee: {rejectingItem.employeeName} ({rejectingItem.date})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Reason for Rejection <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectRemarks}
                  onChange={(e) => setRejectRemarks(e.target.value)}
                  placeholder="e.g. Turnstile access logs show exit at 16:30, requested time conflicts with CCTV..."
                  className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 text-xs font-medium border border-border rounded-xl hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
