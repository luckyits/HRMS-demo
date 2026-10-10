import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves } from '@/context/AdminLeavesContext'
import {
  CalendarRange,
  AlertTriangle,
  Users,
  Search,
  Filter,
  Calendar,
  Building,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react'

export const LeaveCalendarHeatmapPage: React.FC = () => {
  const { leaveCalendarEvents, getHeatmapDates } = useAdminLeaves()

  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedDate, setSelectedDate] = useState('2026-10-16')

  const heatmapDates = getHeatmapDates()

  // Filter events by department
  const filteredEvents = leaveCalendarEvents.filter(
    (e) => selectedDept === 'All' || e.department === selectedDept
  )

  // 31 days in October 2026
  const octDays = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1
    const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`
    const dateStr = `2026-10-${dayStr}`
    const data = heatmapDates[dateStr] || { totalOff: 0, isConflictHigh: false, employees: [] }
    return {
      dayNum,
      dateStr,
      dayOfWeek: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(dayNum + 3) % 7],
      totalOff: data.totalOff,
      isConflictHigh: data.isConflictHigh,
      employees: data.employees,
    }
  })

  // Selected date details
  const selectedDayData = octDays.find((d) => d.dateStr === selectedDate) || octDays[15]

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Leave Calendar & Absence Conflict Heatmap"
        subtitle="Cross-department workforce absence schedule with automated concurrent leave clash warnings"
        action={
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs bg-card border border-border rounded-xl px-3 py-2"
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
        }
      />

      {/* Conflict Heatmap Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-foreground">
              Concurrent Absence Conflict Flagged: Oct 16 &ndash; Oct 18, 2026
            </h4>
            <p className="text-xs text-muted-foreground">
              3 key engineers (Aarav Patel, Manish Kumar, Deepak Joshi) have overlapping leave requests. Team coverage drops below 75% for Engineering sprint deliverables.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 shrink-0">
          High Conflict
        </span>
      </div>

      {/* 31-Day Heatmap Strip */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-foreground">
              October 2026 &mdash; Daily Absence Density Heatmap
            </h4>
            <p className="text-xs text-muted-foreground">
              Click any calendar day to inspect staff on leave and coverage impact
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/40" /> 0-1 Off (Normal)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/50" /> 2 Off (Moderate)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500" /> &ge;3 Off (Conflict)
            </span>
          </div>
        </div>

        {/* The Grid Strip */}
        <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-16 lg:grid-cols-31 gap-1.5 overflow-x-auto py-2">
          {octDays.map((d) => {
            const isSelected = selectedDate === d.dateStr
            let heatColor = 'bg-muted/30 border-border text-foreground hover:bg-muted/60'
            if (d.totalOff === 1) heatColor = 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            if (d.totalOff === 2) heatColor = 'bg-amber-500/25 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold'
            if (d.totalOff >= 3) heatColor = 'bg-rose-500/30 border-rose-500 text-rose-700 dark:text-rose-300 font-black ring-1 ring-rose-500'

            return (
              <button
                key={d.dateStr}
                onClick={() => setSelectedDate(d.dateStr)}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all min-h-[58px] ${heatColor} ${
                  isSelected ? 'ring-2 ring-primary scale-105 shadow-md' : ''
                }`}
              >
                <span className="text-[9px] uppercase font-mono opacity-70">{d.dayOfWeek}</span>
                <span className="text-xs font-extrabold">{d.dayNum}</span>
                <span className="text-[10px] font-mono mt-0.5 opacity-90">
                  {d.totalOff > 0 ? `${d.totalOff} off` : '—'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Inspection & Active Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Selected Day Details Panel */}
        <div className="lg:col-span-5 bg-card border border-border p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <span className="text-xs font-mono text-muted-foreground uppercase">
                Inspecting Day
              </span>
              <h4 className="font-bold text-base text-foreground mt-0.5">
                {selectedDayData.dayOfWeek}, October {selectedDayData.dayNum}, 2026
              </h4>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedDayData.isConflictHigh
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                  : selectedDayData.totalOff > 0
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
              }`}
            >
              {selectedDayData.totalOff} Staff on Leave
            </span>
          </div>

          <div>
            <span className="text-xs font-bold text-foreground block mb-2">
              Staff Absent on this Date:
            </span>
            {selectedDayData.employees.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                Full squad present &mdash; No scheduled leaves recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayData.employees.map((name, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between"
                  >
                    <span className="font-bold text-xs text-foreground">{name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-card border border-border text-primary font-mono">
                      Out of Office
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Timeline Table */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-primary" />
              Active Leave Bookings ({filteredEvents.length})
            </h4>
            <span className="text-xs text-muted-foreground font-mono">October 2026</span>
          </div>

          <div className="divide-y divide-border overflow-y-auto max-h-[380px]">
            {filteredEvents.map((evt) => {
              return (
                <div key={evt.id} className="p-4 flex items-center justify-between hover:bg-muted/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <img
                      src={evt.avatar}
                      alt={evt.employeeName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-foreground">{evt.employeeName}</h5>
                      <p className="text-[11px] text-muted-foreground">
                        {evt.department} &bull; {evt.branch}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-primary font-bold">
                          {evt.startDate} &rarr; {evt.endDate}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          ({evt.daysCount} days)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-muted text-foreground">
                      {evt.leaveTypeCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        evt.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
