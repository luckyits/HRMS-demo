import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import type { ShiftDefinition } from '@/mock/adminAttendance'
import {
  Clock,
  Plus,
  Moon,
  Sun,
  AlertCircle,
  CheckCircle2,
  Trash2,
  CalendarDays,
  Coffee,
  Sparkles,
  Info,
} from 'lucide-react'

export const ShiftBuilderPage: React.FC = () => {
  const { shifts, addShift, deleteShift } = useAdminAttendance()

  const [showBuilder, setShowBuilder] = useState(false)
  const [successToast, setSuccessToast] = useState(false)

  // Builder form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [breakDurationMinutes, setBreakDurationMinutes] = useState(60)
  const [graceMinutes, setGraceMinutes] = useState(15)
  const [isNightShift, setIsNightShift] = useState(false)
  const [shiftColor, setShiftColor] = useState('#3B82F6')
  const [description, setDescription] = useState('')

  // Calculate if crosses midnight
  const startHour = parseInt(startTime.split(':')[0] || '0', 10)
  const endHour = parseInt(endTime.split(':')[0] || '0', 10)
  const crossesMidnight = isNightShift || endHour < startHour

  // Total shift duration calculation
  const calcTotalHours = () => {
    let startMin = startHour * 60 + parseInt(startTime.split(':')[1] || '0', 10)
    let endMin = endHour * 60 + parseInt(endTime.split(':')[1] || '0', 10)
    if (crossesMidnight && endMin <= startMin) {
      endMin += 24 * 60
    }
    const totalMinutes = endMin - startMin
    const netMinutes = Math.max(0, totalMinutes - breakDurationMinutes)
    return {
      gross: (totalMinutes / 60).toFixed(1),
      net: (netMinutes / 60).toFixed(1),
    }
  }

  const { gross, net } = calcTotalHours()

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const newShift: Omit<ShiftDefinition, 'id' | 'assignedCount'> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      startTime,
      endTime,
      breakDurationMinutes,
      graceMinutes,
      isNightShift,
      crossesMidnight,
      color: shiftColor,
      description: description.trim() || undefined,
    }

    addShift(newShift)
    setShowBuilder(false)
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3000)

    // Reset
    setName('')
    setCode('')
    setDescription('')
  }

  const colorPresets = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Shift Builder & Timing Master"
        subtitle="Standard, rotational, and midnight crossover shifts with start-date attribution enforcement"
        action={
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showBuilder ? 'Cancel Builder' : 'New Shift Definition'}</span>
          </button>
        }
      />

      {successToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Shift definition created successfully!</span>
        </div>
      )}

      {/* Builder Modal / Card */}
      {showBuilder && (
        <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Create Shift Timing</h3>
                <p className="text-xs text-muted-foreground">
                  Specify shift hours, meal breaks, grace limits, and night rollover behavior
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-2 py-1 bg-muted rounded text-muted-foreground">
              New Shift
            </span>
          </div>

          <form onSubmit={handleCreateShift} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Shift Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manufacturing Graveyard Shift C"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Shift Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SH-NIGHT-C"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary uppercase font-mono"
                />
              </div>
            </div>

            {/* Shift Timing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 border border-border rounded-xl">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Start Time (HH:MM):
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-card border border-border rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  End Time (HH:MM):
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-card border border-border rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Break Duration (mins):
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={breakDurationMinutes}
                  onChange={(e) => setBreakDurationMinutes(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-card border border-border rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Grace Period (mins):
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-card border border-border rounded-xl"
                />
              </div>
            </div>

            {/* Calculated Hours Banner */}
            <div className="flex items-center gap-4 text-xs bg-muted/40 p-3 rounded-xl">
              <span className="text-muted-foreground">
                Gross Span: <strong className="text-foreground">{gross} hrs</strong>
              </span>
              <span className="text-muted-foreground">&bull;</span>
              <span className="text-muted-foreground">
                Meal Break: <strong className="text-foreground">{breakDurationMinutes} mins</strong>
              </span>
              <span className="text-muted-foreground">&bull;</span>
              <span className="text-muted-foreground">
                Net Work Hours: <strong className="text-primary font-bold">{net} hrs</strong>
              </span>
            </div>

            {/* Night Shift & Crosses Midnight Section */}
            <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-foreground">Night Shift Flag</h5>
                    <p className="text-[11px] text-muted-foreground">
                      Enable for shifts operating overnight past 00:00 midnight
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNightShift}
                    onChange={(e) => setIsNightShift(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Crosses Midnight Notice (Mandatory Requirement) */}
              {crossesMidnight && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300 block">
                      Crosses Midnight Active: Shift start date attribution applies
                    </span>
                    <p className="text-purple-700 dark:text-purple-400">
                      Even though the punch-out occurs on the following calendar morning (e.g. at {endTime}), the entire attendance record, work duration, and daily overtime will strictly belong to the <strong>shift start date</strong> ({startTime}).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Roster Color Picker */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Shift Roster Badge Color:
              </label>
              <div className="flex items-center gap-3">
                {colorPresets.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setShiftColor(c)}
                    style={{ backgroundColor: c }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      shiftColor === c ? 'scale-125 ring-2 ring-foreground ring-offset-2' : 'hover:scale-110'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Description / Operational Guidelines:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Operational notes, handover criteria, rotational details..."
                className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
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
                Save Shift Definition
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shifts Catalogue */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shifts.map((shift) => {
          return (
            <div
              key={shift.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: shift.color }}
              />

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                      {shift.code}
                    </span>
                    <h4 className="font-bold text-base text-foreground mt-0.5">{shift.name}</h4>
                  </div>
                  {shift.isNightShift ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Night Shift
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1">
                      <Sun className="w-3 h-3" /> Day Shift
                    </span>
                  )}
                </div>

                {/* Timing Badge */}
                <div className="mt-4 p-3 bg-muted/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-xs font-extrabold text-foreground">
                        {shift.startTime} &rarr; {shift.endTime}
                      </span>
                      {shift.crossesMidnight && (
                        <span className="text-[10px] text-purple-600 block font-semibold">
                          +1 Day (Rolls past midnight)
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    Grace: {shift.graceMinutes}m
                  </span>
                </div>

                {/* Details Breakdown */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> Break Duration:
                    </span>
                    <span className="font-semibold text-foreground">{shift.breakDurationMinutes} mins</span>
                  </div>
                  <div className="flex items-center justify-between pb-1 border-b border-border/50">
                    <span className="text-muted-foreground">Active Headcount:</span>
                    <span className="font-semibold text-primary">{shift.assignedCount} staff</span>
                  </div>
                </div>

                {/* Crosses Midnight Advisory Note */}
                {shift.crossesMidnight && (
                  <div className="mt-3 p-2.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 rounded-xl text-[11px] text-purple-700 dark:text-purple-300 flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Attendance belongs to the shift start date.</span>
                  </div>
                )}

                {shift.description && (
                  <p className="mt-3 text-[11px] text-muted-foreground line-clamp-2">
                    {shift.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground font-mono">
                  ID: {shift.id}
                </span>
                <button
                  onClick={() => deleteShift(shift.id)}
                  className="text-muted-foreground hover:text-rose-600 p-1 rounded transition-colors"
                  title="Delete Shift"
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
