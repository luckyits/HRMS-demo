import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FeatureGate } from '@/components/common/FeatureGate'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { useOvertimeBonus } from '@/context/OvertimeBonusContext'
import {
  ClockAlert,
  Check,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  MessageSquare,
} from 'lucide-react'

export const SupervisorOtApprovalPage: React.FC = () => {
  const {
    otRequests,
    supervisorApproveOt,
    supervisorRejectOt,
    plantHrApproveOt,
    plantHrRejectOt,
  } = useOvertimeBonus()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [remarksModal, setRemarksModal] = useState<{
    id: string
    action: 'approve' | 'reject'
    employeeName: string
  } | null>(null)
  const [customRemark, setCustomRemark] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const filteredRequests = otRequests.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    if (filter === 'pending') {
      return r.status === 'pending_supervisor' || r.status === 'pending_plant_hr'
    }
    if (filter === 'approved') return r.status === 'approved'
    if (filter === 'rejected') return r.status === 'rejected'
    return true
  })

  const pendingSupervisorCount = otRequests.filter((r) => r.status === 'pending_supervisor').length
  const pendingHrCount = otRequests.filter((r) => r.status === 'pending_plant_hr').length

  const handleActionConfirm = () => {
    if (!remarksModal) return

    if (remarksModal.action === 'approve') {
      supervisorApproveOt(
        remarksModal.id,
        customRemark.trim() || 'Verified against plant shift roster and biometric gate logs.'
      )
      showToast(`Level 1 Approved for ${remarksModal.employeeName}. Escalated to Plant HR for final signoff.`)
    } else {
      supervisorRejectOt(
        remarksModal.id,
        customRemark.trim() || 'Overtime not authorized by supervisor for this shift.'
      )
      showToast(`Overtime request rejected for ${remarksModal.employeeName}.`)
    }

    setRemarksModal(null)
    setCustomRemark('')
  }

  return (
    <FeatureGate
      feature="OVERTIME"
      fallback={
        <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xs">
          <ClockAlert className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold">Feature Gated: Supervisor Overtime Approvals</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            This module requires the <strong>OVERTIME</strong> feature flag to be enabled.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Supervisor Overtime Approval Hub"
          subtitle="Review technician overtime duty slips with multi-tier approval chain (Shift Supervisor → Plant HR)"
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Chain: Supervisor (L1) → Plant HR (L2)
              </span>
            </div>
          }
        />

        {toastMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search requests by employee name, ID or task..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filter === st
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {st === 'pending'
                  ? `Pending (${pendingSupervisorCount + pendingHrCount})`
                  : st}
              </button>
            ))}
          </div>
        </div>

        {/* Request Cards with Integrated ApprovalTimeline */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-2xs text-muted-foreground text-xs">
              No overtime requests matching your filter.
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4 hover:border-primary/30 transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.employeeAvatar}
                      alt={req.employeeName}
                      className="w-11 h-11 rounded-full object-cover border border-border shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{req.employeeName}</h4>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {req.employeeId}
                        </span>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {req.department}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.designation} • {req.branch}
                      </p>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">
                        {req.hours} hrs ({req.multiplier}x Multiplier)
                      </span>
                      <span className="text-[11px] text-muted-foreground block capitalize">
                        {req.settlementPreference === 'pay'
                          ? `₹${req.settlementCalculatedAmount.toLocaleString()} Cash Pay`
                          : `${req.settlementCompOffDays} Day Comp-off`}
                      </span>
                    </div>

                    {req.status === 'pending_supervisor' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setRemarksModal({
                              id: req.id,
                              action: 'approve',
                              employeeName: req.employeeName,
                            })
                          }
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve (L1)</span>
                        </button>
                        <button
                          onClick={() =>
                            setRemarksModal({
                              id: req.id,
                              action: 'reject',
                              employeeName: req.employeeName,
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded-xl text-xs font-bold transition"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {req.status === 'pending_plant_hr' && (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Awaiting Plant HR Signoff
                        </span>
                        <button
                          onClick={() => {
                            plantHrApproveOt(req.id)
                            showToast(`Plant HR signoff completed for ${req.employeeName}.`)
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                          title="Simulate Plant HR Signoff"
                        >
                          HR Quick Signoff
                        </button>
                      </div>
                    )}

                    {req.status === 'approved' && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Fully Approved & Settled
                      </span>
                    )}

                    {req.status === 'rejected' && (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Duty Details & Reason */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl border border-border/80">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Duty Date & Shift:</span>
                    <span className="font-bold text-foreground">
                      {req.date} • {req.shiftName}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Day Type:</span>
                    <span className="font-bold text-foreground capitalize">
                      {req.dayType.replace('_', ' ')} (Rate {req.multiplier}x)
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px]">Pre-Approval Status:</span>
                    <span className="font-bold text-emerald-600">
                      {req.isPreApproved ? 'Pre-Authorized by Maintenance Lead' : 'Post-Facto Submission'}
                    </span>
                  </div>

                  <div className="col-span-full pt-1">
                    <span className="text-muted-foreground block text-[11px]">Job Description / Reason:</span>
                    <p className="font-medium text-foreground italic mt-0.5">“{req.reason}”</p>
                  </div>
                </div>

                {/* APPROVAL TIMELINE EMBEDDED */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-2">
                    Multi-Tier Approval Timeline (Supervisor → Plant HR)
                  </span>
                  <div className="bg-background rounded-xl p-4 border border-border">
                    <ApprovalTimeline steps={req.timeline} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Remarks / Action Modal */}
      {remarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">
                {remarksModal.action === 'approve' ? 'Approve Overtime Slip' : 'Reject Overtime Slip'}
              </h3>
              <button
                type="button"
                onClick={() => setRemarksModal(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-foreground">
                Worker: <strong>{remarksModal.employeeName}</strong>
              </p>
              <p className="text-muted-foreground">
                {remarksModal.action === 'approve'
                  ? 'Your approval moves this request to Level 2 (Plant HR Kavita Salunkhe) for payroll booking.'
                  : 'Specify why this overtime request cannot be authorized.'}
              </p>

              <label className="font-semibold text-foreground block pt-2">Supervisor Remarks / Notes</label>
              <textarea
                rows={3}
                placeholder={
                  remarksModal.action === 'approve'
                    ? 'e.g. Verified machine uptime requirements and shift punch records.'
                    : 'e.g. Exceeded daily overtime ceiling without advance notice.'
                }
                value={customRemark}
                onChange={(e) => setCustomRemark(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setRemarksModal(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleActionConfirm}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${
                  remarksModal.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {remarksModal.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeatureGate>
  )
}
