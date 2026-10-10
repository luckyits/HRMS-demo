import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAttendance } from '@/context/AttendanceContext'
import type { DayAttendance, RegularizationItem } from '@/mock/attendance'
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileEdit,
  Fingerprint,
  Info,
  MapPin,
  Moon,
  Plus,
  Sun,
  Upload,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

export const MyAttendancePage: React.FC = () => {
  const { monthDays, regularizations, submitRegularization } = useAttendance()

  // Selected Day State for detail inspect drawer
  const [selectedDay, setSelectedDay] = useState<DayAttendance>(monthDays[7]) // Oct 8 by default

  // Regularization Modal State
  const [regModal, setRegModal] = useState<{
    isOpen: boolean
    date: string
    issueType: 'Missed Punch In' | 'Missed Punch Out' | 'Both Punches Missed' | 'Biometric Device Glitch' | 'Wrong Punch Recorded'
    requestedIn: string
    requestedOut: string
    reason: string
    attachmentName: string
  }>({
    isOpen: false,
    date: '2026-10-08',
    issueType: 'Missed Punch Out',
    requestedIn: '09:30 AM',
    requestedOut: '06:30 PM',
    reason: '',
    attachmentName: '',
  })

  const handleOpenRegularizeForDay = (day: DayAttendance) => {
    setRegModal({
      isOpen: true,
      date: day.date,
      issueType: 'Missed Punch Out',
      requestedIn: day.inTime || '09:30 AM',
      requestedOut: '06:30 PM',
      reason: '',
      attachmentName: '',
    })
  }

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!regModal.reason) return

    submitRegularization({
      date: regModal.date,
      issueType: regModal.issueType,
      requestedInTime: regModal.requestedIn,
      requestedOutTime: regModal.requestedOut,
      reason: regModal.reason,
      attachmentName: regModal.attachmentName || undefined,
    })

    setRegModal((prev) => ({ ...prev, isOpen: false }))
    alert('Regularization application submitted to direct manager for approval.')
  }

  const getStatusColor = (status: DayAttendance['status']) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'Half day':
        return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'Leave':
        return 'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800'
      case 'Holiday':
        return 'bg-sky-50 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800'
      case 'Weekly off':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 border-slate-200 dark:border-slate-700'
      case 'Absent':
      default:
        return 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Attendance Calendar"
        subtitle="Monthly attendance logs, punch timeline breakdown, night-shift attribution, and regularisation requests"
        scope="Self"
        breadcrumbs={[{ label: 'ERP' }, { label: 'My Self-Service' }, { label: 'Attendance' }]}
        action={
          <button
            type="button"
            onClick={() =>
              setRegModal((prev) => ({ ...prev, isOpen: true, date: '2026-10-09' }))
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            <FileEdit className="w-4 h-4" />
            <span>Apply Regularization</span>
          </button>
        }
      />

      {/* Main Grid: Calendar on Left (8 cols) & Day Punch Details on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Month Calendar */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground text-sm">
                October 2026 Attendance
              </h3>
            </div>

            {/* Quick Status Legend */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Present
              </span>
              <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Half Day
              </span>
              <span className="flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Leave
              </span>
              <span className="flex items-center gap-1 font-medium text-sky-600 dark:text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                Holiday
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Weekly Off
              </span>
            </div>
          </div>

          {/* Calendar 7-Day Grid */}
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dw) => (
              <div
                key={dw}
                className="text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground py-1"
              >
                {dw}
              </div>
            ))}

            {monthDays.map((day) => {
              const isSelected = selectedDay.date === day.date
              const style = getStatusColor(day.status)

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[76px] p-2 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-primary border-primary shadow-xs bg-primary/5'
                      : 'hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">
                      {day.dayNumber}
                    </span>
                    {day.isLate && (
                      <span className="px-1 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Late
                      </span>
                    )}
                  </div>

                  <div>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${style}`}
                    >
                      {day.status}
                    </span>

                    {day.workHours && (
                      <span className="block text-[10px] font-mono text-muted-foreground mt-0.5">
                        {day.workHours}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column (4 cols): Selected Day Detail & Punch Breakdown */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 shadow-2xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Day Inspection
                </span>
                <h4 className="text-base font-bold text-foreground">
                  {selectedDay.date} (Day {selectedDay.dayNumber})
                </h4>
              </div>
              <StatusBadge status="active" label={selectedDay.status} />
            </div>

            {/* Shift Attribution & Night Shift Card */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  Shift: {selectedDay.shiftName}
                </span>
                <span className="font-mono text-[11px] text-primary">
                  {selectedDay.shiftTiming}
                </span>
              </div>

              {selectedDay.shiftBelongsToDate && (
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold text-[11px] pt-1">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Belongs to shift date: {selectedDay.shiftBelongsToDate}</span>
                </div>
              )}
            </div>

            {/* Punch In / Out Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-border bg-background">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  First In Time:
                </span>
                <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedDay.inTime || '--:--'}
                </span>
                {selectedDay.isLate && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-medium">
                    Grace exceeded (+14m)
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl border border-border bg-background">
                <span className="text-[10px] text-muted-foreground block font-medium">
                  Last Out Time:
                </span>
                <span className="text-sm font-bold font-mono text-foreground">
                  {selectedDay.outTime || '--:--'}
                </span>
                {selectedDay.overtimeHours && (
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">
                    OT: {selectedDay.overtimeHours}
                  </span>
                )}
              </div>
            </div>

            {/* Daily Punches Log Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Biometric Punch Timeline ({selectedDay.punches.length} records)
              </span>

              {selectedDay.punches.length === 0 ? (
                <p className="text-xs text-muted-foreground italic p-3 bg-muted/20 rounded-lg text-center">
                  No punch records captured on this date.
                </p>
              ) : (
                selectedDay.punches.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-2.5 rounded-lg border border-border bg-background text-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                          p.type === 'IN'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {p.type}
                      </span>
                      <div>
                        <span className="font-mono font-bold text-foreground">
                          {p.time}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                          {p.location}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {p.geofenceStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Day Regularization CTA */}
          <button
            type="button"
            onClick={() => handleOpenRegularizeForDay(selectedDay)}
            className="w-full py-2 px-3 rounded-xl border border-primary/30 text-primary bg-primary/10 hover:bg-primary/20 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Regularize This Day's Attendance</span>
          </button>
        </div>
      </div>

      {/* REGULARIZATION AUDIT TRAIL HISTORY */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileEdit className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-foreground text-sm">
              My Regularization Requests & Approvals
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {regularizations.length} Applications Logged
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regularizations.map((reg) => (
            <div
              key={reg.id}
              className="p-4 rounded-xl border border-border bg-background/50 space-y-3 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">
                      {reg.issueType}
                    </span>
                    <span className="font-mono text-[10px] text-primary">
                      {reg.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Requested Timings: {reg.requestedInTime} – {reg.requestedOutTime}
                  </p>
                </div>

                <StatusBadge status={reg.status} />
              </div>

              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 text-[11px] italic text-muted-foreground">
                “{reg.reason}”
              </div>

              {/* Multi-Tier Approval Trail for this regularization */}
              <div className="pt-2">
                <ApprovalTimeline
                  steps={[
                    {
                      id: `${reg.id}-1`,
                      title: 'Regularization Submitted',
                      approverName: 'Aarav Patel',
                      approverRole: 'Applicant (Employee)',
                      status: 'approved',
                      timestamp: reg.submittedAt,
                    },
                    {
                      id: `${reg.id}-2`,
                      title: 'Direct Manager Approval',
                      approverName: 'Vikram Malhotra',
                      approverRole: 'Engineering Manager',
                      status: reg.status === 'approved' ? 'approved' : 'pending',
                      timestamp: reg.status === 'approved' ? 'Verified' : 'Under Review',
                      comments: reg.comments,
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REGULARIZATION MODAL */}
      {regModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6 relative text-xs">
            <button
              type="button"
              onClick={() => setRegModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-primary" />
              <span>Submit Attendance Regularization Request</span>
            </h3>
            <p className="text-muted-foreground mt-1">
              Apply for punch regularisation with supervisor approval verification.
            </p>

            <form onSubmit={handleRegSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Attendance Date
                  </label>
                  <input
                    type="date"
                    required
                    value={regModal.date}
                    onChange={(e) =>
                      setRegModal((prev) => ({ ...prev, date: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Issue Category
                  </label>
                  <select
                    value={regModal.issueType}
                    onChange={(e) =>
                      setRegModal((prev) => ({
                        ...prev,
                        issueType: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  >
                    <option value="Missed Punch Out">Missed Punch Out</option>
                    <option value="Missed Punch In">Missed Punch In</option>
                    <option value="Both Punches Missed">Both Punches Missed</option>
                    <option value="Biometric Device Glitch">Biometric Device Glitch</option>
                    <option value="Wrong Punch Recorded">Wrong Punch Recorded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Requested In Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="09:30 AM"
                    value={regModal.requestedIn}
                    onChange={(e) =>
                      setRegModal((prev) => ({ ...prev, requestedIn: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Requested Out Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="06:30 PM"
                    value={regModal.requestedOut}
                    onChange={(e) =>
                      setRegModal((prev) => ({ ...prev, requestedOut: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Reason / Explanation (Mandatory)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Turnstile scanner timed out while exiting building..."
                  value={regModal.reason}
                  onChange={(e) =>
                    setRegModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full p-2.5 bg-background border border-input rounded-xl text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Supporting Document / Evidence (Optional)
                </label>
                <div className="flex items-center gap-2 p-2 border border-dashed border-input rounded-xl bg-muted/20">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Simulate attachment (e.g. gate_pass.pdf)"
                    value={regModal.attachmentName}
                    onChange={(e) =>
                      setRegModal((prev) => ({
                        ...prev,
                        attachmentName: e.target.value,
                      }))
                    }
                    className="flex-1 bg-transparent border-none text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs"
                >
                  Submit Regularization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
