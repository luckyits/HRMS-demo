import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import type { AttendancePolicy } from '@/mock/adminAttendance'
import {
  ShieldCheck,
  Plus,
  Clock,
  AlertTriangle,
  Sliders,
  Calendar,
  CheckCircle2,
  Trash2,
  Building,
  UserCheck,
  Smartphone,
  WifiOff,
  MapPin,
  Camera,
  Check,
} from 'lucide-react'

export const AttendancePolicyBuilderPage: React.FC = () => {
  const { policies, addPolicy, deletePolicy } = useAdminAttendance()

  const [showBuilder, setShowBuilder] = useState(false)
  const [successToast, setSuccessToast] = useState(false)

  // Builder form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [graceMinutes, setGraceMinutes] = useState(15)
  const [lateCountTrigger, setLateCountTrigger] = useState(3)
  const [deductionType, setDeductionType] = useState<'Half Day' | 'Full Day' | 'Loss of Pay'>('Half Day')
  const [halfDayHours, setHalfDayHours] = useState(4.5)
  const [fullDayHours, setFullDayHours] = useState(8.5)
  const [roundingMinutes, setRoundingMinutes] = useState<5 | 10 | 15 | 30 | 0>(15)
  const [weeklyOffs, setWeeklyOffs] = useState<string[]>(['Saturday', 'Sunday'])
  const [geoRequired, setGeoRequired] = useState(true)
  const [faceRequired, setFaceRequired] = useState(false)
  const [selfieRequired, setSelfieRequired] = useState(true)
  const [offlineAllowed, setOfflineAllowed] = useState(false)
  const [appliesToType, setAppliesToType] = useState<AttendancePolicy['appliesToType']>('Branch')
  const [appliesToTarget, setAppliesToTarget] = useState('Bengaluru HQ')
  const [effectiveFrom, setEffectiveFrom] = useState('2026-11-01')

  const toggleDay = (day: string) => {
    if (weeklyOffs.includes(day)) {
      setWeeklyOffs(weeklyOffs.filter((d) => d !== day))
    } else {
      setWeeklyOffs([...weeklyOffs, day])
    }
  }

  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const newPolicy: Omit<AttendancePolicy, 'id'> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      graceMinutes,
      lateRule: {
        lateCountTrigger,
        deductionType,
        description: `${lateCountTrigger} late marks in a month trigger a ${deductionType} deduction.`,
      },
      halfDayMinimumHours: halfDayHours,
      fullDayMinimumHours: fullDayHours,
      roundingMinutes,
      weeklyOffPattern: weeklyOffs,
      rules: {
        geoRequired,
        faceRequired,
        selfieRequired,
        offlineAllowed,
      },
      appliesToType,
      appliesToTarget,
      effectiveFrom,
      status: 'Active',
    }

    addPolicy(newPolicy)
    setShowBuilder(false)
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3000)

    // Reset
    setName('')
    setCode('')
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Attendance Policy Builder"
        subtitle="Configure grace thresholds, late deduction ladders, rounding, weekly-offs, and biometric enforcement"
        action={
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showBuilder ? 'Cancel Builder' : 'New Attendance Policy'}</span>
          </button>
        }
      />

      {successToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>New Attendance Policy successfully published and assigned!</span>
        </div>
      )}

      {/* Builder Form Card */}
      {showBuilder && (
        <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Rule & Threshold Builder</h3>
                <p className="text-xs text-muted-foreground">
                  Define business logic that governs employee punches and payroll deduction flags
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-1 bg-muted rounded text-muted-foreground">
              Drafting Policy
            </span>
          </div>

          <form onSubmit={handleCreatePolicy} className="space-y-6">
            {/* 1. Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Policy Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales Field Mobility Policy 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Policy Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-SALES-FLEX"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary uppercase font-mono"
                />
              </div>
            </div>

            {/* 2. Grace & Late Penalty Rules */}
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Grace Period & Late Deduction Ladder
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Morning Grace Minutes:</span>
                    <span className="text-primary font-bold">{graceMinutes} mins</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={5}
                    value={graceMinutes}
                    onChange={(e) => setGraceMinutes(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Arrivals after {graceMinutes} mins from shift start trigger a Late mark.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Late Arrival Trigger Count:
                  </label>
                  <select
                    value={lateCountTrigger}
                    onChange={(e) => setLateCountTrigger(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-card border border-border rounded-xl"
                  >
                    <option value={2}>2 Late marks in month</option>
                    <option value={3}>3 Late marks in month</option>
                    <option value={4}>4 Late marks in month</option>
                    <option value={5}>5 Late marks in month</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Threshold count before penalty kicks in.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Penalty Deduction Type:
                  </label>
                  <select
                    value={deductionType}
                    onChange={(e) => setDeductionType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-card border border-border rounded-xl"
                  >
                    <option value="Half Day">0.5 Day (Half Day Deduction)</option>
                    <option value="Full Day">1.0 Day (Full Day Deduction)</option>
                    <option value="Loss of Pay">Loss of Pay (LOP)</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Applied automatically to payroll salary register.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Work Hours & Rounding */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Half Day Minimum Work Hours:
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="2"
                  max="6"
                  value={halfDayHours}
                  onChange={(e) => setHalfDayHours(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                />
                <span className="text-[10px] text-muted-foreground">E.g., 4.5 hours required</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Full Day Minimum Work Hours:
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="6"
                  max="12"
                  value={fullDayHours}
                  onChange={(e) => setFullDayHours(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                />
                <span className="text-[10px] text-muted-foreground">E.g., 8.5 hours required</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Punch Time Rounding:
                </label>
                <select
                  value={roundingMinutes}
                  onChange={(e) => setRoundingMinutes(Number(e.target.value) as any)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                >
                  <option value={0}>Exact Time (No Rounding)</option>
                  <option value={5}>Nearest 5 Minutes</option>
                  <option value={10}>Nearest 10 Minutes</option>
                  <option value={15}>Nearest 15 Minutes</option>
                  <option value={30}>Nearest 30 Minutes</option>
                </select>
                <span className="text-[10px] text-muted-foreground">Simplifies shift boundary math</span>
              </div>
            </div>

            {/* 4. Weekly Off Days */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Weekly Off Days Schedule
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const isChecked = weeklyOffs.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-primary text-primary-foreground border-primary font-bold shadow-xs'
                          : 'bg-card border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Biometric & Location Enforcement Toggles */}
            <div className="p-4 bg-muted/20 border border-border rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-primary" /> Punch Authentication & Hardware Checks
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border cursor-pointer hover:bg-muted/40">
                  <input
                    type="checkbox"
                    checked={geoRequired}
                    onChange={(e) => setGeoRequired(e.target.checked)}
                    className="mt-0.5 rounded accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold block text-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Geo-Required
                    </span>
                    <span className="text-[10px] text-muted-foreground">Punch must be inside branch geofence</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border cursor-pointer hover:bg-muted/40">
                  <input
                    type="checkbox"
                    checked={faceRequired}
                    onChange={(e) => setFaceRequired(e.target.checked)}
                    className="mt-0.5 rounded accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold block text-foreground flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-blue-600" /> Face Biometric
                    </span>
                    <span className="text-[10px] text-muted-foreground">3D Liveness score verification</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border cursor-pointer hover:bg-muted/40">
                  <input
                    type="checkbox"
                    checked={selfieRequired}
                    onChange={(e) => setSelfieRequired(e.target.checked)}
                    className="mt-0.5 rounded accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold block text-foreground flex items-center gap-1">
                      <Camera className="w-3 h-3 text-amber-600" /> Selfie Capture
                    </span>
                    <span className="text-[10px] text-muted-foreground">Requires visual selfie on punch</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-card border border-border cursor-pointer hover:bg-muted/40">
                  <input
                    type="checkbox"
                    checked={offlineAllowed}
                    onChange={(e) => setOfflineAllowed(e.target.checked)}
                    className="mt-0.5 rounded accent-primary"
                  />
                  <div>
                    <span className="text-xs font-bold block text-foreground flex items-center gap-1">
                      <WifiOff className="w-3 h-3 text-purple-600" /> Offline Allowed
                    </span>
                    <span className="text-[10px] text-muted-foreground">Store offline punches when network drops</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 6. Assignment Scope & Effective Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Assign Policy Scope:
                </label>
                <select
                  value={appliesToType}
                  onChange={(e) => setAppliesToType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                >
                  <option value="Company">Whole Company</option>
                  <option value="Branch">Specific Branch</option>
                  <option value="Department">Specific Department</option>
                  <option value="Profile">Employee Profile / Type</option>
                  <option value="Employee">Single Employee</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Target Entity:
                </label>
                <input
                  type="text"
                  value={appliesToTarget}
                  onChange={(e) => setAppliesToTarget(e.target.value)}
                  placeholder="e.g. Pune Plant or Manufacturing"
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Effective From Date:
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(e) => setEffectiveFrom(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="px-4 py-2 text-xs font-medium border border-border rounded-xl hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-md"
              >
                Save & Deploy Policy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Policies Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {policies.map((pol) => {
          return (
            <div
              key={pol.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                      {pol.code}
                    </span>
                    <h4 className="font-bold text-base text-foreground mt-0.5">{pol.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {pol.status}
                  </span>
                </div>

                {/* Scope Badge */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                  <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    Applies to: <strong>{pol.appliesToType}</strong> &bull; {pol.appliesToTarget}
                  </span>
                </div>

                {/* Rules List */}
                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-muted-foreground">Morning Grace:</span>
                    <span className="font-semibold text-foreground">{pol.graceMinutes} minutes</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-muted-foreground">Late Deduction:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {pol.lateRule.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-muted-foreground">Half / Full Day Req:</span>
                    <span className="font-semibold text-foreground">
                      {pol.halfDayMinimumHours}h / {pol.fullDayMinimumHours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-muted-foreground">Punch Rounding:</span>
                    <span className="font-semibold text-foreground">
                      {pol.roundingMinutes === 0 ? 'None (Exact)' : `${pol.roundingMinutes} mins`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-muted-foreground">Weekly Offs:</span>
                    <span className="font-semibold text-foreground">
                      {pol.weeklyOffPattern.join(', ')}
                    </span>
                  </div>
                </div>

                {/* Toggles indicator tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      pol.rules.geoRequired
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Geo-Fence: {pol.rules.geoRequired ? 'On' : 'Off'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      pol.rules.faceRequired
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Face: {pol.rules.faceRequired ? 'On' : 'Off'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      pol.rules.selfieRequired
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Selfie: {pol.rules.selfieRequired ? 'On' : 'Off'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      pol.rules.offlineAllowed
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Offline: {pol.rules.offlineAllowed ? 'Allowed' : 'Blocked'}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">
                  Effective: {pol.effectiveFrom}
                </span>
                <button
                  onClick={() => deletePolicy(pol.id)}
                  className="text-muted-foreground hover:text-rose-600 p-1 rounded transition-colors"
                  title="Archive Policy"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
