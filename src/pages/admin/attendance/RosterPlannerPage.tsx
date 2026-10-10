import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import { MOCK_EMPLOYEES } from '@/mock/employees'
import {
  CalendarRange,
  Copy,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  Sparkles,
  Info,
  Filter,
} from 'lucide-react'

export const RosterPlannerPage: React.FC = () => {
  const { shifts, roster, assignRosterShift, copyLastWeekRoster, getConflictWarnings } =
    useAdminAttendance()

  const [currentWeekStart, setCurrentWeekStart] = useState('2026-10-12')
  const [selectedShiftForPlacement, setSelectedShiftForPlacement] = useState<string>(shifts[0]?.id || '')
  const [copySuccessToast, setCopySuccessToast] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState('All')

  // Generate 7 days of the week starting from currentWeekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart)
    d.setDate(d.getDate() + i)
    return {
      dateStr: d.toISOString().split('T')[0],
      dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      dateNumber: d.getDate(),
      monthName: d.toLocaleString('default', { month: 'short' }),
    }
  })

  const sampleStaff = MOCK_EMPLOYEES.slice(0, 10).filter(
    (e) => selectedDepartment === 'All' || e.department === selectedDepartment
  )

  const handleCopyLastWeek = () => {
    copyLastWeekRoster(currentWeekStart)
    setCopySuccessToast(true)
    setTimeout(() => setCopySuccessToast(false), 3000)
  }

  const handleCellClick = (employeeId: string, date: string) => {
    const key = `${employeeId}_${date}`
    const currentShift = roster[key]
    // If same, toggle off; else assign selectedShiftForPlacement
    if (currentShift === selectedShiftForPlacement) {
      assignRosterShift(employeeId, date, '')
    } else {
      assignRosterShift(employeeId, date, selectedShiftForPlacement)
    }
  }

  // Calculate coverage count per day
  const getDayCoverage = (dateStr: string) => {
    const count: Record<string, number> = {}
    shifts.forEach((s) => (count[s.id] = 0))
    sampleStaff.forEach((emp) => {
      const sId = roster[`${emp.id}_${dateStr}`]
      if (sId && count[sId] !== undefined) {
        count[sId]++
      }
    })
    return count
  }

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Workforce Shift Roster Planner"
        subtitle="Schedule weekly shifts with one-click copy, coverage balancing, and automated rest-period conflict alerts"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLastWeek}
              className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4 text-primary" />
              <span>Copy Last Week</span>
            </button>
          </div>
        }
      />

      {copySuccessToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Roster successfully replicated from previous week!</span>
        </div>
      )}

      {/* Shift Palette Bar (Click to select active tool) */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block mb-1">
            Active Placement Shift (Click a cell to apply):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {shifts.map((shift) => {
              const isSelected = selectedShiftForPlacement === shift.id
              return (
                <button
                  key={shift.id}
                  onClick={() => setSelectedShiftForPlacement(shift.id)}
                  style={{
                    borderColor: isSelected ? shift.color : undefined,
                    backgroundColor: isSelected ? `${shift.color}20` : undefined,
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    isSelected ? 'ring-2 ring-primary ring-offset-1' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: shift.color }}
                  />
                  <span>{shift.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({shift.startTime}-{shift.endTime})
                  </span>
                  {shift.isNightShift && (
                    <span className="text-[9px] px-1 rounded bg-purple-500 text-white font-bold">
                      Night
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-xl px-3 py-1.5"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="People Operations">People Operations</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-foreground">
              Roster Week: {weekDays[0].monthName} {weekDays[0].dateNumber} &ndash;{' '}
              {weekDays[6].monthName} {weekDays[6].dateNumber}, 2026
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-2">Click any cell to stamp active shift</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground">
                <th className="p-3 min-w-[200px] border-r border-border font-semibold">Employee</th>
                {weekDays.map((d) => (
                  <th key={d.dateStr} className="p-2.5 text-center min-w-[120px] border-r border-border">
                    <div className="font-mono text-[10px] uppercase font-bold text-muted-foreground">
                      {d.dayName}
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {d.dateNumber} {d.monthName}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {sampleStaff.map((emp) => {
                return (
                  <tr key={emp.id} className="hover:bg-muted/10 transition-colors">
                    {/* Fixed staff info */}
                    <td className="p-3 border-r border-border flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{emp.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {emp.designation} &bull; {emp.department}
                        </div>
                      </div>
                    </td>

                    {/* 7 Days */}
                    {weekDays.map((d) => {
                      const shiftId = roster[`${emp.id}_${d.dateStr}`]
                      const assignedShift = shifts.find((s) => s.id === shiftId)
                      const conflicts = shiftId ? getConflictWarnings(emp.id, d.dateStr, shiftId) : []

                      return (
                        <td
                          key={d.dateStr}
                          onClick={() => handleCellClick(emp.id, d.dateStr)}
                          className="p-1.5 border-r border-border text-center align-top cursor-pointer hover:bg-muted/40 transition-colors select-none"
                        >
                          {assignedShift ? (
                            <div
                              style={{
                                borderColor: assignedShift.color,
                                backgroundColor: `${assignedShift.color}15`,
                              }}
                              className="p-2 rounded-xl border flex flex-col items-center justify-center gap-1 relative group shadow-xs"
                            >
                              <span
                                className="font-bold text-[11px] truncate w-full text-foreground"
                                title={assignedShift.name}
                              >
                                {assignedShift.code}
                              </span>
                              <span className="text-[10px] font-mono opacity-80">
                                {assignedShift.startTime} - {assignedShift.endTime}
                              </span>
                              {assignedShift.isNightShift && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-purple-600 text-white font-bold">
                                  Night
                                </span>
                              )}

                              {/* Conflict Warning Indicator */}
                              {conflicts.length > 0 && (
                                <div
                                  className="mt-1 flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded border border-rose-300"
                                  title={conflicts[0].message}
                                >
                                  <AlertTriangle className="w-3 h-3 shrink-0" />
                                  <span>Rest Alert</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-14 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground hover:border-primary/50 text-[11px]">
                              <span>Off / Open</span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}

              {/* Coverage row per day */}
              <tr className="bg-muted/30 font-semibold border-t-2 border-border text-[11px]">
                <td className="p-3 border-r border-border text-foreground font-bold">
                  Daily Shift Coverage:
                </td>
                {weekDays.map((d) => {
                  const coverage = getDayCoverage(d.dateStr)
                  const totalFilled = Object.values(coverage).reduce((a, b) => a + b, 0)
                  return (
                    <td key={d.dateStr} className="p-2 border-r border-border text-center">
                      <span className="font-bold text-foreground block">{totalFilled} scheduled</span>
                      <div className="flex justify-center gap-1 mt-1 text-[9px] text-muted-foreground">
                        {shifts.slice(0, 3).map((s) => (
                          <span key={s.id} title={s.name}>
                            {s.code.split('-')[0]}:{coverage[s.id] || 0}
                          </span>
                        ))}
                      </div>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Rest-Period Law & Conflict Guidance */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h5 className="font-bold text-amber-900 dark:text-amber-300">
            Labor Compliance & Rest Period Guardrails
          </h5>
          <p className="text-amber-800/90 dark:text-amber-400">
            The system automatically scans for rest-hour violations (&lt; 11 hours interval between rotational shifts) and blocks double shifts on the same calendar day. Employees transitioning off a Night Shift require mandatory 24-hour acclimatization rest.
          </p>
        </div>
      </div>
    </div>
  )
}
