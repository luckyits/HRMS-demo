import React, { useState } from 'react'
import {
  TrendingUp,
  Clock,
  Plus,
  Coins,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import {
  useOvertimeBonus,
  type OvertimeRequest,
} from '@/context/OvertimeBonusContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'

export const MobileOvertimePage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const {
    otPolicy,
    otRequests,
    requestOvertime,
    bonusPolicy,
    bonusRecords,
    compOffRecords,
  } = useOvertimeBonus()
  const { showToast } = useToast()

  // Tab: 'overview' | 'request'
  const [activeTab, setActiveTab] = useState<'overview' | 'request'>('overview')
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<OvertimeRequest | null>(null)

  // OT Form State
  const [otDate, setOtDate] = useState(new Date().toISOString().split('T')[0])
  const [otHours, setOtHours] = useState(2.0)
  const [dayType, setDayType] = useState<'normal' | 'weekly_off' | 'holiday'>('normal')
  const [settlementChoice, setSettlementChoice] = useState<'pay' | 'compoff'>('pay')
  const [otReason, setOtReason] = useState('Critical plant assembly line machine maintenance')

  if (!hasFeature('OVERTIME') && !hasFeature('ATT_BONUS')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Overtime & Bonus" subtitle="Plant Operations" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <TrendingUp className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Overtime and plant bonus tracking is not enabled for your workforce profile.</p>
        </div>
      </div>
    )
  }

  // Active multiplier
  const multiplier =
    dayType === 'holiday'
      ? otPolicy.holidayMultiplier
      : dayType === 'weekly_off'
      ? otPolicy.weeklyOffMultiplier
      : otPolicy.normalDayMultiplier

  // Rate estimation (₹150/hr standard worker base rate)
  const estimatedAmount = otHours * 150 * multiplier

  const handleHoursStep = (delta: number) => {
    setOtHours((prev) => Math.min(Math.max(0.5, prev + delta), otPolicy.dailyCapHours || 4.0))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    requestOvertime({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      designation: currentEmployee.designation,
      department: currentEmployee.department,
      branch: currentEmployee.branch || 'Pune Plant 1',
      shiftName: 'General Shift (09:00 - 18:00)',
      date: otDate,
      hours: otHours,
      dayType,
      multiplier,
      settlementPreference: settlementChoice,
      settlementCalculatedAmount: estimatedAmount,
      settlementCompOffDays: settlementChoice === 'compoff' ? otHours / 8 : 0,
      reason: otReason,
      isPreApproved: true,
    })

    showToast(`Requested ${otHours}h overtime for ${otDate}!`, 'success')
    setActiveTab('overview')
  }

  // Calculate my current stats
  const totalOtHoursMonth = otRequests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.hours, 0)

  const activeCompOffDays = compOffRecords
    .filter((c) => c.status === 'active' || c.status === 'expiring_soon')
    .reduce((sum, c) => sum + c.daysRemaining, 0)

  // Current employee bonus record
  const myBonus = bonusRecords.find((b) => b.employeeId === currentEmployee.id) || bonusRecords[0]

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Overtime & Bonus"
        subtitle={activeTab === 'overview' ? 'Accruals & Comp-Off' : 'Request Overtime'}
        rightAction={
          activeTab === 'overview' ? (
            <button
              type="button"
              onClick={() => setActiveTab('request')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply OT</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-3 py-1.5 rounded-xl bg-muted text-foreground text-xs font-bold active:scale-95 transition"
            >
              Cancel
            </button>
          )
        }
      />

      {activeTab === 'overview' ? (
        <div className="p-4 space-y-4 animate-in fade-in duration-200">
          {/* Attendance Bonus Progress Card */}
          {hasFeature('ATT_BONUS') && myBonus && (
            <div className="p-4 rounded-3xl bg-linear-to-br from-amber-500/15 via-amber-500/5 to-card border border-amber-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">
                      Punctuality & Attendance Bonus
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {bonusPolicy.targetMonth} Cycle
                    </span>
                  </div>
                </div>

                <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                  ₹{bonusPolicy.baseBonusAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Progress Bar & Milestone Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-foreground">
                    {myBonus.progressDaysRemaining > 0
                      ? `${myBonus.progressDaysRemaining} more late-free days to earn ₹${bonusPolicy.baseBonusAmount}`
                      : 'Bonus Qualified (100% attendance achieved!)'}
                  </span>
                  <span className="text-muted-foreground">
                    {myBonus.daysPresent} / {myBonus.totalWorkingDays} days
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(myBonus.daysPresent / myBonus.totalWorkingDays) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Late marks: {myBonus.lateMarksCount} / max 2</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Tier: {myBonus.achievedTier || '100% Punctuality Target'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-3xl bg-card border border-border shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                OT Hours This Month
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-foreground">
                  {totalOtHoursMonth.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-muted-foreground">hrs</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
                Pre-Approved: Yes
              </span>
            </div>

            <div className="p-3.5 rounded-3xl bg-card border border-border shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Comp-Off Balance
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-foreground">
                  {activeCompOffDays.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-muted-foreground">Days</span>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
                Expires in 18 days
              </span>
            </div>
          </div>

          {/* Comp-Off Expiry Cards */}
          {compOffRecords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Compensatory Off Balances
              </h4>
              <div className="space-y-2">
                {compOffRecords.map((co) => (
                  <div
                    key={co.id}
                    className="p-3 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-foreground">
                        {co.dutyDescription}
                      </h5>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Earned on {co.dateEarned} • Valid until {co.expiryDate}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-foreground block">
                        +{co.daysRemaining} Day
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          co.status === 'expiring_soon'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {co.status === 'expiring_soon'
                          ? `${co.expiresInDays}d left`
                          : 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overtime Requests History */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Recent Overtime Logs ({otRequests.length})
            </h4>

            <div className="space-y-2">
              {otRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestForDetail(req)}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer hover:border-primary/40 active:scale-[0.99] transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {req.date}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {req.hours} hrs ({req.multiplier}x)
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                      {req.reason}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-foreground block">
                      {req.settlementPreference === 'pay'
                        ? `₹${req.settlementCalculatedAmount}`
                        : `${req.settlementCompOffDays}d CompOff`}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        req.status === 'approved'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : req.status === 'rejected'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {req.status === 'approved'
                        ? 'Approved'
                        : req.status === 'rejected'
                        ? 'Rejected'
                        : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Apply Overtime Form */
        <div className="p-4 space-y-4 animate-in fade-in duration-200">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Overtime Duty Date
              </label>
              <input
                type="date"
                value={otDate}
                onChange={(e) => setOtDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Hours Stepper */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Overtime Hours Logged (Cap: {otPolicy.dailyCapHours} hrs/day)
              </label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border">
                <button
                  type="button"
                  onClick={() => handleHoursStep(-0.5)}
                  className="w-10 h-10 rounded-xl bg-card border border-border text-foreground font-black text-lg flex items-center justify-center active:scale-95 transition"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-2xl font-black text-foreground block">
                    {otHours.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-bold">
                    Hours ({multiplier}x Rate Multiplier)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleHoursStep(0.5)}
                  className="w-10 h-10 rounded-xl bg-card border border-border text-foreground font-black text-lg flex items-center justify-center active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Day Type Multiplier Chips */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Day Category
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'normal', label: 'Normal', mult: otPolicy.normalDayMultiplier },
                    { id: 'weekly_off', label: 'Weekly Off', mult: otPolicy.weeklyOffMultiplier },
                    { id: 'holiday', label: 'Holiday', mult: otPolicy.holidayMultiplier },
                  ] as const
                ).map((dt) => (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setDayType(dt.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border text-center transition ${
                      dayType === dt.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-muted/40 text-muted-foreground border-border'
                    }`}
                  >
                    <div>{dt.label}</div>
                    <div className="text-[10px] opacity-80">{dt.mult}x Rate</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Settlement Preference */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Compensation Settlement Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettlementChoice('pay')}
                  className={`p-3 rounded-2xl text-left border transition ${
                    settlementChoice === 'pay'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border'
                  }`}
                >
                  <span className="text-xs font-bold block">Payroll Payout</span>
                  <span className="text-[10px] opacity-80">
                    ≈ ₹{estimatedAmount.toFixed(0)} added to salary
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementChoice('compoff')}
                  className={`p-3 rounded-2xl text-left border transition ${
                    settlementChoice === 'compoff'
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 text-muted-foreground border-border'
                  }`}
                >
                  <span className="text-xs font-bold block">Comp-Off Credit</span>
                  <span className="text-[10px] opacity-80">
                    +{(otHours / 8).toFixed(2)} days leave credit
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Supervisor Authorization & Reason
              </label>
              <textarea
                rows={2}
                value={otReason}
                onChange={(e) => setOtReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-[0.99] transition"
            >
              Submit Overtime Claim
            </button>
          </form>
        </div>
      )}

      {/* Details Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedRequestForDetail)}
        onClose={() => setSelectedRequestForDetail(null)}
        title="Overtime Record Details"
      >
        {selectedRequestForDetail && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {selectedRequestForDetail.date} ({selectedRequestForDetail.hours} hrs)
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Multiplier: {selectedRequestForDetail.multiplier}x • {selectedRequestForDetail.shiftName}
                  </p>
                </div>
                <span className="text-sm font-black text-foreground">
                  {selectedRequestForDetail.settlementPreference === 'pay'
                    ? `₹${selectedRequestForDetail.settlementCalculatedAmount}`
                    : `${selectedRequestForDetail.settlementCompOffDays}d CompOff`}
                </span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              <strong>Duty Reason:</strong> {selectedRequestForDetail.reason}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
