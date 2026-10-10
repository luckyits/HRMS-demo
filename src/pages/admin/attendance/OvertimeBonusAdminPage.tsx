import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useOvertimeBonus,
  type BonusSlab,
} from '@/context/OvertimeBonusContext'
import {
  Clock,
  ClockAlert,
  Coins,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  DollarSign,
  Calendar,
  Save,
  Check,
  X,
  FileSpreadsheet,
  Users,
  Search,
  Filter,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react'

export const OvertimeBonusAdminPage: React.FC = () => {
  const {
    otPolicy,
    updateOtPolicy,
    otRequests,
    supervisorApproveOt,
    supervisorRejectOt,
    plantHrApproveOt,
    plantHrRejectOt,
    bonusPolicy,
    updateBonusPolicy,
    bonusRecords,
  } = useOvertimeBonus()

  const [activeTab, setActiveTab] = useState<'policy' | 'approvals' | 'bonus_policy' | 'eligibility'>('policy')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Policy form state
  const [policyForm, setPolicyForm] = useState({ ...otPolicy })
  const [hasPolicyChanges, setHasPolicyChanges] = useState(false)

  // Approval filters
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [approvalSearch, setApprovalSearch] = useState('')

  // Bonus form state
  const [bonusForm, setBonusForm] = useState({ ...bonusPolicy })
  const [bonusSearch, setBonusSearch] = useState('')
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'eligible' | 'ineligible'>('all')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handlePolicyChange = (field: keyof typeof policyForm, val: any) => {
    setPolicyForm((prev) => ({ ...prev, [field]: val }))
    setHasPolicyChanges(true)
  }

  const handleSavePolicy = () => {
    updateOtPolicy(policyForm)
    setHasPolicyChanges(false)
    showToast('Overtime rate multipliers, caps, and settlement rules saved successfully.')
  }

  const handleSaveBonusPolicy = () => {
    updateBonusPolicy(bonusForm)
    showToast('Attendance bonus tiers and slab rules updated.')
  }

  const filteredApprovals = otRequests.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      r.employeeId.toLowerCase().includes(approvalSearch.toLowerCase()) ||
      r.reason.toLowerCase().includes(approvalSearch.toLowerCase())
    if (!matchesSearch) return false

    if (approvalStatusFilter === 'pending') {
      return r.status === 'pending_supervisor' || r.status === 'pending_plant_hr'
    }
    if (approvalStatusFilter === 'approved') return r.status === 'approved'
    if (approvalStatusFilter === 'rejected') return r.status === 'rejected'
    return true
  })

  const filteredBonusRecords = bonusRecords.filter((b) => {
    const matchesSearch =
      b.employeeName.toLowerCase().includes(bonusSearch.toLowerCase()) ||
      b.employeeId.toLowerCase().includes(bonusSearch.toLowerCase()) ||
      b.department.toLowerCase().includes(bonusSearch.toLowerCase())
    if (!matchesSearch) return false

    if (eligibilityFilter === 'eligible') return b.isEligible
    if (eligibilityFilter === 'ineligible') return !b.isEligible
    return true
  })

  const pendingApprovalsCount = otRequests.filter(
    (r) => r.status === 'pending_supervisor' || r.status === 'pending_plant_hr'
  ).length

  return (
    <FeatureGate
      feature="OVERTIME"
      fallback={
        <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xs">
          <ClockAlert className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold">Feature Gated: Overtime & Attendance Bonus</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            This module requires the <strong>OVERTIME</strong> feature flag to be enabled in your company subscription plan or assigned profile.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <AttendanceSubNav />

        <PageHeader
          title="Overtime, Comp-Off & Attendance Bonus Administration"
          subtitle="Configure rate multipliers, hourly caps, multi-tier bonus slabs, and monitor workforce eligibility reports"
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                FeatureGate Active: OVERTIME • ATT_BONUS • COMPOFF
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'policy'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>OT Policy & Multipliers</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'approvals'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <ClockAlert className="w-4 h-4" />
            <span>OT Approvals Queue</span>
            {pendingApprovalsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-black">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bonus_policy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bonus_policy'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Attendance Bonus Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('eligibility')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'eligibility'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Bonus Eligibility Report</span>
          </button>
        </div>

        {/* TAB 1: OT POLICY */}
        {activeTab === 'policy' && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Overtime Multipliers & Threshold Rules
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define base rate multipliers for weekdays, weekly-offs, and public holidays, plus daily/monthly caps.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSavePolicy}
                    disabled={!hasPolicyChanges}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      hasPolicyChanges
                        ? 'bg-primary text-primary-foreground shadow-md hover:opacity-90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Policy Changes</span>
                  </button>
                </div>
              </div>

              {/* Rate Multipliers Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Rate Multipliers (Statutory & Plant Standards)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Standard Working Day</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-600">
                        Post Shift
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Applied after shift completion beyond minimum qualifying minutes.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="3.0"
                        value={policyForm.normalDayMultiplier}
                        onChange={(e) => handlePolicyChange('normalDayMultiplier', parseFloat(e.target.value))}
                        className="w-24 px-3 py-1.5 text-sm font-bold bg-background border border-input rounded-lg"
                      />
                      <span className="text-sm font-bold text-foreground">x Hourly Rate</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span>e.g., 1.5x = 150% of basic pay</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">Weekly-Off Day (Sunday)</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600">
                        Double Time
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Overtime rate when called to duty on scheduled weekly day off.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="4.0"
                        value={policyForm.weeklyOffMultiplier}
                        onChange={(e) => handlePolicyChange('weeklyOffMultiplier', parseFloat(e.target.value))}
                        className="w-24 px-3 py-1.5 text-sm font-bold bg-background border border-input rounded-lg"
                      />
                      <span className="text-sm font-bold text-foreground">x Hourly Rate</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span>Factories Act standard: 2.0x</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">National & Gazetted Holiday</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/10 text-rose-600">
                        Premium Holiday
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Paid for emergency plant shutdown or continuous manufacturing shifts.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="4.0"
                        value={policyForm.holidayMultiplier}
                        onChange={(e) => handlePolicyChange('holidayMultiplier', parseFloat(e.target.value))}
                        className="w-24 px-3 py-1.5 text-sm font-bold bg-background border border-input rounded-lg"
                      />
                      <span className="text-sm font-bold text-foreground">x Hourly Rate</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <span>Standard default: 2.5x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thresholds and Caps */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Safety Caps & Qualifying Thresholds
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Daily OT Maximum Cap</label>
                    <p className="text-[11px] text-muted-foreground">Fatigue prevention limit per worker per shift</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="8"
                        value={policyForm.dailyCapHours}
                        onChange={(e) => handlePolicyChange('dailyCapHours', parseFloat(e.target.value))}
                        className="w-24 px-3 py-1.5 text-sm bg-background border border-input rounded-lg"
                      />
                      <span className="text-xs font-medium text-foreground">Hours / day</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Monthly Overtime Cap</label>
                    <p className="text-[11px] text-muted-foreground">Maximum allowable monthly cumulative OT</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        step="5"
                        min="10"
                        max="100"
                        value={policyForm.monthlyCapHours}
                        onChange={(e) => handlePolicyChange('monthlyCapHours', parseFloat(e.target.value))}
                        className="w-24 px-3 py-1.5 text-sm bg-background border border-input rounded-lg"
                      />
                      <span className="text-xs font-medium text-foreground">Hours / month</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Minimum Minutes Threshold</label>
                    <p className="text-[11px] text-muted-foreground">Punches below this threshold are not counted as OT</p>
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        step="5"
                        min="15"
                        max="60"
                        value={policyForm.minMinutesToQualify}
                        onChange={(e) => handlePolicyChange('minMinutesToQualify', parseInt(e.target.value))}
                        className="w-24 px-3 py-1.5 text-sm bg-background border border-input rounded-lg"
                      />
                      <span className="text-xs font-medium text-foreground">Minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Preference */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Settlement & Compensation Choice
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'employee_choice',
                      title: 'Employee Choice (Recommended)',
                      desc: 'Employee selects between direct Cash Payout or Compensatory Off credit upon raising request.',
                    },
                    {
                      id: 'pay_only',
                      title: 'Cash Overtime Pay Only',
                      desc: 'All approved overtime is routed directly into monthly payroll disbursement.',
                    },
                    {
                      id: 'compoff_only',
                      title: 'Compensatory Off Credit Only',
                      desc: 'Overtime hours convert into leave wallet balances with a 45-day expiry validity.',
                    },
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handlePolicyChange('settlementMode', opt.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        policyForm.settlementMode === opt.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-foreground">{opt.title}</span>
                        <input
                          type="radio"
                          checked={policyForm.settlementMode === opt.id}
                          onChange={() => handlePolicyChange('settlementMode', opt.id)}
                          className="accent-primary"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Governance & Pre-approval */}
              <div className="pt-4 border-t border-border flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="preApprovalToggle"
                    checked={policyForm.preApprovalRequired}
                    onChange={(e) => handlePolicyChange('preApprovalRequired', e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="preApprovalToggle" className="text-xs font-semibold text-foreground cursor-pointer">
                    Require Pre-Approval Authorization before Shift Commencement
                    <span className="block text-[11px] font-normal text-muted-foreground">
                      Workers must submit a planned OT slip 2 hours before standard shift ends.
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPolicyForm({
                        ...policyForm,
                        normalDayMultiplier: 1.5,
                        weeklyOffMultiplier: 2.0,
                        holidayMultiplier: 2.5,
                        dailyCapHours: 3.0,
                        monthlyCapHours: 40.0,
                        minMinutesToQualify: 30,
                      })
                      setHasPolicyChanges(true)
                    }}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition"
                  >
                    Reset to Indian Factories Act Preset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OT APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by worker name, ID or task..."
                    value={approvalSearch}
                    onChange={(e) => setApprovalSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setApprovalStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      approvalStatusFilter === st
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {st === 'pending' ? `Pending (${pendingApprovalsCount})` : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Approvals Table */}
            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Worker ID & Name</th>
                      <th className="px-4 py-3">Shift & Date</th>
                      <th className="px-4 py-3">OT Hours</th>
                      <th className="px-4 py-3">Multiplier & Mode</th>
                      <th className="px-4 py-3">Payout / Comp-off</th>
                      <th className="px-4 py-3">Duty Justification</th>
                      <th className="px-4 py-3">Approval Stage</th>
                      <th className="px-4 py-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredApprovals.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                          No overtime requests match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredApprovals.map((req) => (
                        <tr key={req.id} className="hover:bg-muted/30 transition">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={req.employeeAvatar}
                                alt={req.employeeName}
                                className="w-8 h-8 rounded-full object-cover border border-border"
                              />
                              <div>
                                <span className="font-bold text-foreground block">{req.employeeName}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {req.employeeId} • {req.department}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-medium text-foreground block">{req.date}</span>
                            <span className="text-[11px] text-muted-foreground">{req.shiftName}</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-bold text-foreground text-sm">{req.hours} hrs</span>
                            <span className="text-[10px] text-muted-foreground block capitalize">{req.dayType} day</span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded font-bold font-mono text-[11px] bg-indigo-500/10 text-indigo-600">
                                {req.multiplier}x
                              </span>
                              <span className="capitalize text-[11px] text-muted-foreground font-medium">
                                ({req.settlementPreference})
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {req.settlementPreference === 'pay' ? (
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                ₹{req.settlementCalculatedAmount.toLocaleString()}
                              </span>
                            ) : (
                              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {req.settlementCompOffDays} Day Comp-off
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 max-w-[220px]">
                            <p className="truncate text-foreground font-medium" title={req.reason}>
                              {req.reason}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            {req.status === 'approved' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                Fully Approved
                              </span>
                            )}
                            {req.status === 'rejected' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                Rejected
                              </span>
                            )}
                            {req.status === 'pending_supervisor' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                Level 1: Supervisor
                              </span>
                            )}
                            {req.status === 'pending_plant_hr' && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                Level 2: Plant HR
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {req.status === 'pending_supervisor' && (
                                <>
                                  <button
                                    onClick={() => {
                                      supervisorApproveOt(req.id)
                                      showToast(`Approved Level 1 for ${req.employeeName}. Sent to Plant HR.`)
                                    }}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20"
                                    title="Approve as Supervisor"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      supervisorRejectOt(req.id)
                                      showToast(`Rejected OT request for ${req.employeeName}.`)
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20"
                                    title="Reject"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {req.status === 'pending_plant_hr' && (
                                <>
                                  <button
                                    onClick={() => {
                                      plantHrApproveOt(req.id)
                                      showToast(`Plant HR signoff completed for ${req.employeeName}. Settled!`)
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                                    title="Plant HR Final Signoff"
                                  >
                                    HR Signoff
                                  </button>
                                  <button
                                    onClick={() => {
                                      plantHrRejectOt(req.id)
                                      showToast(`Rejected at Plant HR stage for ${req.employeeName}.`)
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              )}

                              {(req.status === 'approved' || req.status === 'rejected') && (
                                <span className="text-[11px] font-mono text-muted-foreground">Settled</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ATTENDANCE BONUS BUILDER */}
        {activeTab === 'bonus_policy' && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    Attendance Incentive Scheme & Slab Builder
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define zero-late mark rules and graduated slabs for plant staff to drive punctuality and eliminate absenteeism.
                  </p>
                </div>
                <button
                  onClick={handleSaveBonusPolicy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Bonus Rules</span>
                </button>
              </div>

              {/* Policy Header Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <label className="text-xs font-bold text-foreground">Active Target Cycle</label>
                  <input
                    type="text"
                    value={bonusForm.targetMonth}
                    onChange={(e) => setBonusForm({ ...bonusForm, targetMonth: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-input rounded-lg font-bold"
                  />
                  <p className="text-[11px] text-muted-foreground">Cycle period evaluated during salary processing</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <label className="text-xs font-bold text-foreground">Standard Working Shifts in Month</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={bonusForm.totalWorkingDays}
                      onChange={(e) => setBonusForm({ ...bonusForm, totalWorkingDays: parseInt(e.target.value) })}
                      className="w-24 px-3 py-1.5 text-xs bg-background border border-input rounded-lg font-bold"
                    />
                    <span className="text-xs text-muted-foreground">Working days</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Standard 26 days (excluding weekly-offs)</p>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <label className="text-xs font-bold text-foreground">Base Benchmark Payout</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">₹</span>
                    <input
                      type="number"
                      value={bonusForm.baseBonusAmount}
                      onChange={(e) => setBonusForm({ ...bonusForm, baseBonusAmount: parseInt(e.target.value) })}
                      className="w-28 px-3 py-1.5 text-xs bg-background border border-input rounded-lg font-bold text-emerald-600"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Reference incentive for 100% full attendance</p>
                </div>
              </div>

              {/* Slab Rules */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Slab-Based Tier Definitions
                  </h4>
                  <span className="text-[11px] text-muted-foreground">
                    Evaluating punctuality and excused presence
                  </span>
                </div>

                <div className="space-y-3">
                  {bonusForm.slabs.map((slab, idx) => (
                    <div
                      key={slab.id}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition flex items-center justify-between flex-wrap gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                          T{idx + 1}
                        </div>
                        <div>
                          <input
                            type="text"
                            value={slab.tierName}
                            onChange={(e) => {
                              const updated = [...bonusForm.slabs]
                              updated[idx].tierName = e.target.value
                              setBonusForm({ ...bonusForm, slabs: updated })
                            }}
                            className="text-xs font-bold text-foreground bg-transparent border-b border-dashed border-border focus:border-primary pb-0.5"
                          />
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Min {slab.minPresentDays} Days Present • Max {slab.maxLateMarks} Late Marks • 0 Unapproved Absent
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Min Days:</span>
                          <input
                            type="number"
                            value={slab.minPresentDays}
                            onChange={(e) => {
                              const updated = [...bonusForm.slabs]
                              updated[idx].minPresentDays = parseInt(e.target.value)
                              setBonusForm({ ...bonusForm, slabs: updated })
                            }}
                            className="w-16 px-2 py-1 text-xs bg-background border border-input rounded text-center"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Max Late:</span>
                          <input
                            type="number"
                            value={slab.maxLateMarks}
                            onChange={(e) => {
                              const updated = [...bonusForm.slabs]
                              updated[idx].maxLateMarks = parseInt(e.target.value)
                              setBonusForm({ ...bonusForm, slabs: updated })
                            }}
                            className="w-16 px-2 py-1 text-xs bg-background border border-input rounded text-center"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <span>₹</span>
                          <input
                            type="number"
                            value={slab.bonusAmount}
                            onChange={(e) => {
                              const updated = [...bonusForm.slabs]
                              updated[idx].bonusAmount = parseInt(e.target.value)
                              setBonusForm({ ...bonusForm, slabs: updated })
                            }}
                            className="w-20 bg-transparent text-emerald-600 font-bold text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Automatic Disqualification Rules */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Automatic Disqualification Criteria
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-rose-700 dark:text-rose-400">
                        Zero Unapproved Absenteeism Policy
                      </span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Even 1 single day of unexcused absence (loss of pay without approved leave slip) immediately voids eligibility for the entire monthly bonus cycle.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        Late-Mark Penalty Escalation
                      </span>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Workers exceeding 2 late punch-ins across the month are disqualified from all bonus tiers regardless of total shifts completed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BONUS ELIGIBILITY REPORT */}
        {activeTab === 'eligibility' && (
          <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total Workers Audited
                </span>
                <span className="text-2xl font-black text-foreground mt-1 block">
                  {bonusRecords.length}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  Plant & Manufacturing workforce
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 shadow-2xs">
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Eligible for Bonus
                </span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {bonusRecords.filter((b) => b.isEligible).length}
                </span>
                <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
                  Qualifying under Tiers 1, 2, or 3
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 shadow-2xs">
                <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                  Disqualified Workers
                </span>
                <span className="text-2xl font-black text-rose-600 mt-1 block">
                  {bonusRecords.filter((b) => !b.isEligible).length}
                </span>
                <span className="text-[11px] text-rose-600/80 mt-0.5 block">
                  Breached late mark or absence rules
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Projected Bonus Payout
                </span>
                <span className="text-2xl font-black text-primary mt-1 block">
                  ₹{bonusRecords.reduce((acc, b) => acc + b.bonusAmount, 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  For October 2026 payroll run
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by worker name, ID or department..."
                    value={bonusSearch}
                    onChange={(e) => setBonusSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(['all', 'eligible', 'ineligible'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setEligibilityFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      eligibilityFilter === st
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {st === 'all' ? 'All Workforce' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Report Table */}
            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Profile Type</th>
                      <th className="px-4 py-3">Days Present</th>
                      <th className="px-4 py-3">Late Marks</th>
                      <th className="px-4 py-3">Unapproved Absences</th>
                      <th className="px-4 py-3">Status & Achieved Tier</th>
                      <th className="px-4 py-3">Payout</th>
                      <th className="px-4 py-3">Audit Reason / Ineligibility Rationale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredBonusRecords.map((rec) => (
                      <tr key={rec.employeeId} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={rec.avatar}
                              alt={rec.employeeName}
                              className="w-8 h-8 rounded-full object-cover border border-border"
                            />
                            <div>
                              <span className="font-bold text-foreground block">{rec.employeeName}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {rec.employeeId} • {rec.designation}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.profileType === 'Factory Worker'
                                ? 'bg-indigo-500/10 text-indigo-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {rec.profileType}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground text-sm">
                            {rec.daysPresent} / {rec.totalWorkingDays}
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            {Math.round((rec.daysPresent / rec.totalWorkingDays) * 100)}% attendance
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`font-bold ${
                              rec.lateMarksCount === 0
                                ? 'text-emerald-600'
                                : rec.lateMarksCount <= 2
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {rec.lateMarksCount} Late
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`font-bold ${
                              rec.unapprovedAbsences === 0 ? 'text-muted-foreground' : 'text-rose-600'
                            }`}
                          >
                            {rec.unapprovedAbsences} Days
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {rec.isEligible ? (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 block w-fit">
                                Eligible
                              </span>
                              <span className="text-[11px] font-medium text-foreground block mt-1">
                                {rec.achievedTier?.split(':')[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                              Disqualified
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`text-sm font-bold ${
                              rec.bonusAmount > 0 ? 'text-emerald-600 font-black' : 'text-muted-foreground'
                            }`}
                          >
                            ₹{rec.bonusAmount.toLocaleString()}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 max-w-[280px]">
                          {rec.isEligible ? (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              Zero LOP & met threshold criteria
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              {rec.ineligibilityReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
