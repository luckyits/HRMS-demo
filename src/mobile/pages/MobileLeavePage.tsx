import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Send,
  X,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { ApprovalTimeline, type ApprovalStep } from '@/components/common/ApprovalTimeline'
import { useEss } from '@/context/EssContext'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useOfflineQueue } from '@/context/OfflineQueueContext'
import { useToast } from '@/context/ToastContext'
import type { LeaveRequest } from '@/mock/essData'

export const MobileLeavePage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { settings } = useDemo()
  const { enqueueItem } = useOfflineQueue()
  const { leaveBalances, leaveRequests, applyLeave, cancelLeaveRequest } = useEss()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'apply' | 'history'>('apply')

  // Form State
  const [selectedTypeCode, setSelectedTypeCode] = useState<string>('EL')
  const [startDate, setStartDate] = useState<string>('2026-10-19')
  const [endDate, setEndDate] = useState<string>('2026-10-20')
  const [isHalfDay, setIsHalfDay] = useState<boolean>(false)
  const [halfDaySession, setHalfDaySession] = useState<'first' | 'second'>('first')
  const [reason, setReason] = useState<string>('')
  const [hasAttachment, setHasAttachment] = useState<boolean>(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<LeaveRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false)

  // Find currently selected balance
  const currentBalance = useMemo(() => {
    return leaveBalances.find((b) => b.code === selectedTypeCode) || leaveBalances[0]
  }, [leaveBalances, selectedTypeCode])

  // Calculate live days count
  const calculatedDays = useMemo(() => {
    if (isHalfDay) return 0.5
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = end.getTime() - start.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return diffDays > 0 ? diffDays : 1
    } catch {
      return 1
    }
  }, [startDate, endDate, isHalfDay])

  const balanceAfter = useMemo(() => {
    if (!currentBalance) return 0
    return Math.max(0, currentBalance.available - calculatedDays)
  }, [currentBalance, calculatedDays])

  // Does this require a medical certificate? (SL > 2 days)
  const isDocRequired = useMemo(() => {
    return selectedTypeCode === 'SL' && calculatedDays > (currentBalance?.requiresDocAfterDays || 2)
  }, [selectedTypeCode, calculatedDays, currentBalance])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      showToast('Please specify a reason for your leave application', 'warning')
      return
    }

    if (calculatedDays > (currentBalance?.available || 0)) {
      showToast(`Warning: Requested days (${calculatedDays}) exceed available balance (${currentBalance?.available})`, 'warning')
    }

    applyLeave({
      leaveType: currentBalance.type,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      daysCount: calculatedDays,
      isHalfDay,
      reason,
      attachmentName: hasAttachment ? 'medical_certificate_scanned.pdf' : undefined,
    })

    if (settings.offlineMode) {
      enqueueItem({
        idempotencyKey: `leave-${startDate}-${endDate}-${currentBalance.code}`,
        type: 'leave',
        title: `Offline Leave: ${currentBalance.type}`,
        subtitle: `${calculatedDays} day(s) from ${startDate}`,
        payload: {
          leaveType: currentBalance.type,
          startDate,
          endDate,
          daysCount: calculatedDays,
        },
      })
    }

    showToast(`Leave application submitted for ${calculatedDays} day(s) of ${currentBalance.code}!`, 'success')
    setReason('')
    setHasAttachment(false)
    setActiveTab('history')
  }

  const handleCancelPending = (id: string) => {
    cancelLeaveRequest(id)
    showToast('Leave application withdrawn', 'info')
    setIsDetailOpen(false)
  }

  // Approval journey steps for history item
  const getApprovalSteps = (item: LeaveRequest): ApprovalStep[] => [
    {
      id: 'step-1',
      title: 'Leave Requested',
      approverName: 'Aarav Patel (You)',
      approverRole: 'Applicant',
      status: 'approved',
      timestamp: item.submittedAt,
      comments: item.reason,
    },
    {
      id: 'step-2',
      title: 'Reporting Manager Sign-off',
      approverName: 'Vikram Malhotra',
      approverRole: 'Direct Supervisor',
      status: item.status === 'approved' ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending',
      timestamp: item.status === 'approved' ? 'Oct 08, 11:30 AM' : undefined,
      comments: item.managerComments || (item.status === 'pending' ? 'Checking project coverage.' : undefined),
    },
    {
      id: 'step-3',
      title: 'HRMS Wallet Debit',
      approverName: 'Sarah Jenkins',
      approverRole: 'HR Operations',
      status: item.status === 'approved' ? 'approved' : 'waiting',
      comments: 'Muster roll payroll sync.',
    },
  ]

  if (!hasFeature('LEAVE')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Leave management is not permitted for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-24">
      <MobileHeader
        title="Leave Management"
        subtitle="Wallets, applications & approvals"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Horizontal Scroll of Balance Cards */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              My Leave Wallets
            </span>
            <span className="text-[11px] text-muted-foreground">Cycle: 2026</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 snap-x">
            {leaveBalances.map((bal) => {
              const isSelected = selectedTypeCode === bal.code
              const percentUsed = Math.min(100, Math.round((bal.used / bal.allocated) * 100))

              return (
                <div
                  key={bal.code}
                  onClick={() => setSelectedTypeCode(bal.code)}
                  className={`min-w-[150px] p-3.5 rounded-2xl border transition-all cursor-pointer snap-start shadow-2xs flex flex-col justify-between ${
                    isSelected
                      ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'bg-card border-border hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-foreground">{bal.code}</span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Tot: {bal.allocated}
                    </span>
                  </div>

                  <div className="my-2">
                    <span className="text-2xl font-black text-primary font-mono block">
                      {bal.available}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                      {bal.type}
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* View Switcher: Apply vs History */}
        <div className="flex p-1 bg-muted/60 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'apply' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Apply for Leave
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              activeTab === 'history' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Leave History ({leaveRequests.length})
          </button>
        </div>

        {activeTab === 'apply' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Live Summary Card: Days + Balance After */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Selected: {currentBalance.type}</span>
                <span className="text-primary font-bold">
                  {calculatedDays} Day{calculatedDays > 1 ? 's' : ''} requested
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Available</span>
                  <span className="text-sm font-black text-foreground font-mono">
                    {currentBalance.available}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Deducting</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                    -{calculatedDays}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Remaining</span>
                  <span
                    className={`text-sm font-black font-mono ${
                      balanceAfter < 0 ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {balanceAfter}
                  </span>
                </div>
              </div>
            </div>

            {/* Leave Type Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Leave Category
              </label>
              <select
                value={selectedTypeCode}
                onChange={(e) => setSelectedTypeCode(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                {leaveBalances.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.type} (Available: {b.available} days)
                  </option>
                ))}
              </select>
            </div>

            {/* Dates Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  From Date
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  To Date
                </label>
                <input
                  type="date"
                  required
                  disabled={isHalfDay}
                  value={isHalfDay ? startDate : endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2.5 text-xs bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none ${
                    isHalfDay ? 'opacity-50' : ''
                  }`}
                />
              </div>
            </div>

            {/* Half Day Option */}
            <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">Half Day Application</span>
                  <span className="text-[11px] text-muted-foreground">Counts as 0.5 day off</span>
                </div>
                <input
                  type="checkbox"
                  checked={isHalfDay}
                  onChange={(e) => setIsHalfDay(e.target.checked)}
                  className="w-5 h-5 rounded-md text-primary accent-primary"
                />
              </div>

              {isHalfDay && (
                <div className="flex gap-2 pt-1 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setHalfDaySession('first')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      halfDaySession === 'first'
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    First Half (Morning)
                  </button>
                  <button
                    type="button"
                    onClick={() => setHalfDaySession('second')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      halfDaySession === 'second'
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Second Half (Afternoon)
                  </button>
                </div>
              )}
            </div>

            {/* Reason Textarea */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Reason / Detailed Description
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Attending sister's wedding ceremony in Pune..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Medical Certificate Alert / Document Upload */}
            {isDocRequired && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Medical Certificate Required</span>
                </div>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">
                  Sick leave exceeding 2 consecutive days mandates a physician's prescription or certificate.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasAttachment(!hasAttachment)
                    showToast(hasAttachment ? 'Attachment removed' : 'Document attached', 'info')
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold transition ${
                    hasAttachment
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                      : 'border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/5'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{hasAttachment ? '✓ medical_prescription.pdf attached' : 'Tap to attach certificate'}</span>
                </button>
              </div>
            )}

            {/* Sticky Submit Bar */}
            <StickyActionBar>
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Leave Application</span>
              </button>
            </StickyActionBar>
          </form>
        ) : (
          /* History View */
          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed border-border space-y-1">
                <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">No leave history found</p>
              </div>
            ) : (
              leaveRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedHistoryItem(req)
                    setIsDetailOpen(true)
                  }}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{req.leaveType}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : req.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : req.status === 'cancelled'
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {req.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ''}
                    </span>
                    <span className="font-semibold text-foreground">
                      {req.daysCount} Day{req.daysCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
                    "{req.reason}"
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Leave Details Sheet & Approval Journey */}
      <BottomSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedHistoryItem ? selectedHistoryItem.leaveType : 'Leave Details'}
        subtitle={selectedHistoryItem ? `ID: ${selectedHistoryItem.id}` : undefined}
      >
        {selectedHistoryItem && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Dates:</span>
                <span className="font-bold text-foreground">
                  {selectedHistoryItem.startDate} {selectedHistoryItem.startDate !== selectedHistoryItem.endDate ? `to ${selectedHistoryItem.endDate}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Total Duration:</span>
                <span className="font-bold text-foreground">
                  {selectedHistoryItem.daysCount} Day{selectedHistoryItem.daysCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Applied On:</span>
                <span className="font-bold text-foreground">{selectedHistoryItem.submittedAt}</span>
              </div>
              <div className="pt-1 border-t border-border/60">
                <span className="text-muted-foreground block font-medium mb-0.5">Reason:</span>
                <p className="text-foreground italic bg-background p-2 rounded-lg border border-border/60">
                  "{selectedHistoryItem.reason}"
                </p>
              </div>
              {selectedHistoryItem.managerComments && (
                <div className="pt-1">
                  <span className="text-muted-foreground block font-medium mb-0.5">Manager Notes:</span>
                  <p className="text-emerald-600 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                    {selectedHistoryItem.managerComments}
                  </p>
                </div>
              )}
            </div>

            {/* Approval Journey */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Approval Workflow Progress
              </h4>
              <ApprovalTimeline steps={getApprovalSteps(selectedHistoryItem)} />
            </div>

            {/* Cancel Pending Request Button */}
            <div className="pt-2 flex gap-2">
              {selectedHistoryItem.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => handleCancelPending(selectedHistoryItem.id)}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Withdraw Application</span>
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
