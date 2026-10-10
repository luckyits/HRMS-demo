import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FeatureGate } from '@/components/common/FeatureGate'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useOvertimeBonus } from '@/context/OvertimeBonusContext'
import {
  Clock,
  ClockAlert,
  Coins,
  CalendarCheck,
  CalendarDays,
  Plus,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Sparkles,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Flame,
  Layers,
  ShieldCheck,
  X,
  FileCheck,
  Banknote,
  Lock,
} from 'lucide-react'

export const MyOvertimePage: React.FC = () => {
  const { settings, setEmployeeType } = useDemo()
  const { currentEmployee, hasFeature } = useAccess()
  const {
    otPolicy,
    otRequests,
    requestOvertime,
    bonusRecords,
    compOffRecords,
  } = useOvertimeBonus()

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [selectedRequestForTimeline, setSelectedRequestForTimeline] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Form for new OT request
  const [newRequestForm, setNewRequestForm] = useState({
    date: new Date().toISOString().split('T')[0],
    shiftName: 'Shift A (06:00 - 14:30)',
    hours: 2.0,
    dayType: 'normal' as 'normal' | 'weekly_off' | 'holiday',
    settlementPreference: 'pay' as 'pay' | 'compoff',
    reason: '',
  })

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Filter requests for current employee
  const myRequests = otRequests.filter((r) => r.employeeId === currentEmployee.id)
  const myCompOffRecords = compOffRecords.filter((c) => c.employeeId === currentEmployee.id)
  const myBonusRecord = bonusRecords.find((b) => b.employeeId === currentEmployee.id)

  // Computed metrics
  const preApprovedHours = 4.0
  const earnedThisMonthHours = myRequests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.hours, 0)
  const earnedEstimatedCash = myRequests
    .filter((r) => r.status === 'approved' && r.settlementPreference === 'pay')
    .reduce((sum, r) => sum + r.settlementCalculatedAmount, 0)

  const activeCompOffDays = myCompOffRecords
    .filter((c) => c.status !== 'utilized' && c.status !== 'expired')
    .reduce((sum, c) => sum + c.daysRemaining, 0)

  const expiringCompOff = myCompOffRecords.find((c) => c.status === 'expiring_soon')

  // Bonus progress bar calculation
  // E.g. "2 more late-free days to earn Rs 1000"
  const presentDays = myBonusRecord?.daysPresent ?? 24
  const targetDays = myBonusRecord?.totalWorkingDays ?? 26
  const daysLeft = Math.max(0, targetDays - presentDays)
  const progressPct = Math.min(100, Math.round((presentDays / targetDays) * 100))
  const lateMarks = myBonusRecord?.lateMarksCount ?? 0

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRequestForm.reason.trim()) {
      showToast('Please provide a reason or job card number for overtime duty.')
      return
    }

    const mult =
      newRequestForm.dayType === 'holiday'
        ? otPolicy.holidayMultiplier
        : newRequestForm.dayType === 'weekly_off'
        ? otPolicy.weeklyOffMultiplier
        : otPolicy.normalDayMultiplier

    requestOvertime({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      designation: currentEmployee.designation,
      department: currentEmployee.department,
      branch: currentEmployee.branch,
      shiftName: newRequestForm.shiftName,
      date: newRequestForm.date,
      hours: newRequestForm.hours,
      dayType: newRequestForm.dayType,
      multiplier: mult,
      settlementPreference: newRequestForm.settlementPreference,
      settlementCalculatedAmount: Math.round(newRequestForm.hours * 200 * mult),
      settlementCompOffDays: newRequestForm.hours >= 6 ? 1.0 : 0.5,
      reason: newRequestForm.reason,
      isPreApproved: true,
    })

    setIsRequestModalOpen(false)
    setNewRequestForm({
      date: new Date().toISOString().split('T')[0],
      shiftName: 'Shift A (06:00 - 14:30)',
      hours: 2.0,
      dayType: 'normal',
      settlementPreference: 'pay',
      reason: '',
    })
    showToast('Overtime authorization request submitted to Shift Supervisor.')
  }

  return (
    <div className="space-y-6">
      {/* Interactive Profile Switcher Banner for Instant Testing */}
      <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                Current Persona: {currentEmployee.name} ({settings.employeeType})
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  hasFeature('OVERTIME')
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                }`}
              >
                {hasFeature('OVERTIME') ? 'OVERTIME: ON' : 'OVERTIME: OFF'}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Verify profile entitlement: Factory Worker has full OT & Bonus access. Office Staff is gated.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEmployeeType('Factory Worker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              settings.employeeType === 'Factory Worker'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
          >
            Switch to Factory Worker (OT Enabled)
          </button>
          <button
            type="button"
            onClick={() => setEmployeeType('Office Staff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              settings.employeeType === 'Office Staff'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-card border border-border text-foreground hover:bg-muted'
            }`}
          >
            Switch to Office Staff (Gated / Hidden)
          </button>
        </div>
      </div>

      <FeatureGate
        feature="OVERTIME"
        fallback={
          <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Overtime & Attendance Bonus Gated</h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                The <strong>OVERTIME</strong> and <strong>ATT_BONUS</strong> features are disabled for the{' '}
                <strong>Office Staff</strong> employee profile.
              </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-xl max-w-md mx-auto text-left text-xs space-y-2 border border-border">
              <div className="flex items-center justify-between font-bold">
                <span>Profile: Office Staff</span>
                <span className="text-rose-600">Entitlement: OFF</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Corporate and desk employees are on standard monthly fixed compensation and do not participate in plant shift overtime or attendance regularity bonuses.
              </p>
              <button
                onClick={() => setEmployeeType('Factory Worker')}
                className="w-full mt-2 py-2 px-3 bg-primary text-primary-foreground rounded-lg font-bold text-xs hover:opacity-90"
              >
                Switch to Factory Worker Persona to View Live Screen
              </button>
            </div>
          </div>
        }
      >
        <PageHeader
          title="Overtime, Comp-Off & Attendance Bonus"
          subtitle="Track pre-authorized hours, compensation payout choices, compensatory holiday balances, and punctuality incentives"
          action={
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Request Overtime</span>
            </button>
          }
        />

        {toastMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 4 CORE KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Pre-approved OT */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Pre-Approved OT</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-foreground">{preApprovedHours} hrs</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Authorized for upcoming weekend maintenance
              </span>
            </div>
          </div>

          {/* Card 2: OT Earned This Month */}
          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">OT Earned This Month</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <ClockAlert className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">{earnedThisMonthHours} hrs</span>
                {earnedEstimatedCash > 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    (₹{earnedEstimatedCash.toLocaleString()})
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Approved by shift supervisor & HR
              </span>
            </div>
          </div>

          {/* Card 3: Comp-Off Balance & Expiry (Wrapped in COMPOFF gate) */}
          <FeatureGate feature="COMPOFF">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Comp-Off Balance</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-foreground">{activeCompOffDays} Days</span>
                {expiringCompOff && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 mt-0.5">
                    <Hourglass className="w-3.5 h-3.5" />
                    <span>{expiringCompOff.daysRemaining} Day expiring in {expiringCompOff.expiresInDays} days</span>
                  </div>
                )}
              </div>
            </div>
          </FeatureGate>

          {/* Card 4: Attendance Bonus Snapshot */}
          <FeatureGate feature="ATT_BONUS">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">Monthly Bonus Target</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-600">₹1,000</span>
                  <span className="text-xs font-bold text-muted-foreground">Full Incentive</span>
                </div>
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Tier 1: 100% attendance & 0 late marks
                </span>
              </div>
            </div>
          </FeatureGate>
        </div>

        {/* ATTENDANCE BONUS PROGRESS BAR WIDGET (Wrapped in ATT_BONUS) */}
        <FeatureGate feature="ATT_BONUS">
          <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Attendance Regularity Bonus Tracker • October 2026
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Achieve full attendance and zero late arrivals to claim the monthly incentive.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {daysLeft > 0 ? `${daysLeft} more late-free days to earn ₹1,000` : 'Target Achieved! ₹1,000 Earned'}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-foreground">
                  {presentDays} / {targetDays} Completed Shifts
                </span>
                <span className="text-emerald-600">
                  {progressPct}% • {lateMarks === 0 ? 'Zero Late Marks' : `${lateMarks} Late Marks`}
                </span>
              </div>

              <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>Start: Oct 1</span>
                <span>Tier 3 (24d): ₹400</span>
                <span>Tier 2 (25d): ₹700</span>
                <span className="font-bold text-emerald-600">Tier 1 (26d): ₹1,000</span>
              </div>
            </div>
          </div>
        </FeatureGate>

        {/* OVERTIME REQUESTS & HISTORY TABLE */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ClockAlert className="w-4 h-4 text-primary" />
                My Overtime Submissions & Duty Records
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any record to inspect the multi-stage approval timeline (Shift Supervisor → Plant HR).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Duty Date</th>
                  <th className="px-4 py-3">Shift</th>
                  <th className="px-4 py-3">OT Hours</th>
                  <th className="px-4 py-3">Day Type & Multiplier</th>
                  <th className="px-4 py-3">Compensation Mode</th>
                  <th className="px-4 py-3">Duty Description</th>
                  <th className="px-4 py-3">Approval Status</th>
                  <th className="px-4 py-3 text-right">Approval Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      No overtime requests on record for this month. Click "Request Overtime" to submit one.
                    </td>
                  </tr>
                ) : (
                  myRequests.map((req) => (
                    <React.Fragment key={req.id}>
                      <tr className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5 font-bold text-foreground">{req.date}</td>
                        <td className="px-4 py-3.5 text-muted-foreground">{req.shiftName}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground text-sm">{req.hours} hrs</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 capitalize">
                            {req.dayType} ({req.multiplier}x)
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {req.settlementPreference === 'pay' ? (
                            <span className="font-bold text-emerald-600">
                              ₹{req.settlementCalculatedAmount.toLocaleString()} Cash
                            </span>
                          ) : (
                            <span className="font-bold text-indigo-600">
                              {req.settlementCompOffDays} Day Comp-off
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <span className="truncate block font-medium text-foreground" title={req.reason}>
                            {req.reason}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {req.status === 'approved' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Approved
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              Rejected
                            </span>
                          )}
                          {req.status === 'pending_supervisor' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              With Supervisor
                            </span>
                          )}
                          {req.status === 'pending_plant_hr' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                              With Plant HR
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() =>
                              setSelectedRequestForTimeline(
                                selectedRequestForTimeline === req.id ? null : req.id
                              )
                            }
                            className="px-2.5 py-1 rounded-lg border border-border text-[11px] font-semibold text-primary hover:bg-muted transition"
                          >
                            {selectedRequestForTimeline === req.id ? 'Hide Timeline' : 'View Timeline'}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable ApprovalTimeline Row */}
                      {selectedRequestForTimeline === req.id && (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 bg-muted/20 border-t border-b border-border">
                            <div className="max-w-xl mx-auto space-y-2">
                              <span className="text-xs font-bold text-foreground block">
                                Approval Workflow Chain (Shift Supervisor → Plant HR)
                              </span>
                              <ApprovalTimeline steps={req.timeline} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMP-OFF BALANCE & EXPIRY LEDGER (Wrapped in COMPOFF gate) */}
        <FeatureGate feature="COMPOFF">
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  Compensatory Off Credits & Expiry Schedule
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overtime hours converted into leave credits. Valid for 45 days from duty date.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Total Available: {activeCompOffDays} Days
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Credit ID</th>
                    <th className="px-4 py-3">Duty Date</th>
                    <th className="px-4 py-3">Source Justification</th>
                    <th className="px-4 py-3">Credited</th>
                    <th className="px-4 py-3">Utilized</th>
                    <th className="px-4 py-3">Available</th>
                    <th className="px-4 py-3">Valid Until</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myCompOffRecords.map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition">
                      <td className="px-4 py-3 font-mono font-bold text-foreground">{c.id}</td>
                      <td className="px-4 py-3 text-foreground">{c.dateEarned}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{c.dutyDescription}</td>
                      <td className="px-4 py-3 font-bold text-foreground">{c.daysCredited} d</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.daysUsed} d</td>
                      <td className="px-4 py-3 font-bold text-indigo-600">{c.daysRemaining} d</td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground">{c.expiryDate}</span>
                        {c.expiresInDays > 0 && (
                          <span className="text-[10px] text-muted-foreground block">
                            ({c.expiresInDays} days left)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {c.status === 'expiring_soon' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            Expiring Soon
                          </span>
                        )}
                        {c.status === 'active' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            Active
                          </span>
                        )}
                        {c.status === 'utilized' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground">
                            Utilized
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FeatureGate>
      </FeatureGate>

      {/* REQUEST OVERTIME MODAL */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ClockAlert className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Raise Overtime Slip</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Duty Date</label>
                  <input
                    type="date"
                    required
                    value={newRequestForm.date}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Primary Shift</label>
                  <select
                    value={newRequestForm.shiftName}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, shiftName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                  >
                    <option value="Shift A (06:00 - 14:30)">Shift A (06:00 - 14:30)</option>
                    <option value="Shift B (14:00 - 22:30)">Shift B (14:00 - 22:30)</option>
                    <option value="Shift C (22:00 - 06:30)">Shift C (22:00 - 06:30)</option>
                    <option value="General Shift (09:00 - 18:00)">General Shift (09:00 - 18:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">OT Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max={otPolicy.dailyCapHours}
                    required
                    value={newRequestForm.hours}
                    onChange={(e) => setNewRequestForm({ ...newRequestForm, hours: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground">Daily cap: {otPolicy.dailyCapHours} hrs</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Day Classification</label>
                  <select
                    value={newRequestForm.dayType}
                    onChange={(e) =>
                      setNewRequestForm({
                        ...newRequestForm,
                        dayType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl font-medium"
                  >
                    <option value="normal">Standard Working Day (1.5x)</option>
                    <option value="weekly_off">Weekly-Off / Sunday (2.0x)</option>
                    <option value="holiday">Gazetted Public Holiday (2.5x)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Compensation Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRequestForm({ ...newRequestForm, settlementPreference: 'pay' })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      newRequestForm.settlementPreference === 'pay'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="block text-xs">Direct Cash Overtime Pay</span>
                    <span className="text-[10px] text-muted-foreground">Credited in payroll salary slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewRequestForm({ ...newRequestForm, settlementPreference: 'compoff' })}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      newRequestForm.settlementPreference === 'compoff'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'border-border bg-card text-muted-foreground'
                    }`}
                  >
                    <span className="block text-xs">Compensatory Off Leave</span>
                    <span className="text-[10px] text-muted-foreground">Added to leave wallet (45-day validity)</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Duty Reason & Job Card Number</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Line B emergency CNC motor maintenance, authorized under Job Card #JC-9821"
                  value={newRequestForm.reason}
                  onChange={(e) => setNewRequestForm({ ...newRequestForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-muted-foreground">
                <span className="font-bold text-foreground block">Two-Level Authorization Chain:</span>
                Shift Supervisor (Rajesh Verma) → Plant HR (Kavita Salunkhe).
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
