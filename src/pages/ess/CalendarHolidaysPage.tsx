import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAccess } from '@/access/useAccess'
import { useAttendance } from '@/context/AttendanceContext'
import { useEss } from '@/context/EssContext'
import { MOCK_HOLIDAYS, type HolidayItem } from '@/mock/essData'
import {
  Cake,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Gift,
  Info,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const CalendarHolidaysPage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { monthDays } = useAttendance()
  const { leaveRequests, celebrations } = useEss()

  const [activeTab, setActiveTab] = useState<'calendar' | 'holidays'>('calendar')

  // Filter holidays for employee's branch
  const branchHolidays = useMemo(() => {
    return MOCK_HOLIDAYS.filter(
      (h) => h.applicableBranches.includes('All') || h.applicableBranches.includes(currentEmployee.branch)
    )
  }, [currentEmployee.branch])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Calendar & Branch Holidays"
        subtitle={`Branch: ${currentEmployee.branch} • Multi-event schedule combining leaves, shifts, holidays, and peer milestones`}
        scope="Self"
        breadcrumbs={[{ label: 'ERP' }, { label: 'My Self-Service' }, { label: 'Calendar & Holidays' }]}
        action={
          <div className="flex items-center gap-1.5 p-1 bg-card border border-border rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'calendar'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unified Work Calendar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('holidays')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeTab === 'holidays'
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Branch Holiday List ({branchHolidays.length})
            </button>
          </div>
        }
      />

      {/* COMBINED CALENDAR VIEW */}
      {activeTab === 'calendar' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground text-sm">
                October 2026 Master Event Matrix
              </h3>
            </div>

            {/* Dynamic Event Legend (shows only for enabled features) */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Shift Duty
              </span>
              <FeatureGate feature="LEAVE">
                <span className="flex items-center gap-1 font-medium text-purple-600">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Approved Leaves
                </span>
              </FeatureGate>
              <FeatureGate feature="HOLIDAY">
                <span className="flex items-center gap-1 font-medium text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Branch Holidays
                </span>
              </FeatureGate>
              <FeatureGate feature="BIRTHDAY_ANNIV">
                <span className="flex items-center gap-1 font-medium text-pink-600">
                  <Cake className="w-3 h-3 text-pink-500" />
                  Peer Celebrations
                </span>
              </FeatureGate>
            </div>
          </div>

          {/* 7-Day Calendar Grid */}
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
              // Find matching holiday
              const holiday = branchHolidays.find((h) => h.date === day.date)
              // Find matching leave request
              const leave = leaveRequests.find((l) => l.startDate <= day.date && l.endDate >= day.date && l.status === 'approved')
              // Find matching birthday/anniversary
              const celebration = celebrations.find((c) => c.date === day.date)

              return (
                <div
                  key={day.date}
                  className="min-h-[96px] p-2 rounded-xl border border-border bg-background/50 flex flex-col justify-between text-xs space-y-1 hover:border-primary/40 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs">{day.dayNumber}</span>
                    {day.status === 'Present' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    {/* Holiday Event Badge */}
                    {hasFeature('HOLIDAY') && holiday && (
                      <span className="block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 truncate">
                        🎉 {holiday.name}
                      </span>
                    )}

                    {/* Approved Leave Event Badge */}
                    {hasFeature('LEAVE') && leave && (
                      <span className="block px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 truncate">
                        ✈️ {leave.leaveType.slice(0, 10)}
                      </span>
                    )}

                    {/* Celebration Badge */}
                    {hasFeature('BIRTHDAY_ANNIV') && celebration && (
                      <span className="block px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-100 text-pink-900 dark:bg-pink-950 dark:text-pink-200 truncate">
                        🎂 {celebration.employeeName.split(' ')[0]}
                      </span>
                    )}

                    {/* Shift Timing */}
                    {day.status === 'Present' && !leave && !holiday && (
                      <span className="block text-[9px] font-mono text-muted-foreground truncate">
                        {day.shiftTiming.split(' - ')[0]}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* HOLIDAY LIST VIEW */}
      {activeTab === 'holidays' && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">
              Official Branch Holiday Schedule (2026)
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Branch: {currentEmployee.branch}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {branchHolidays.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-foreground block text-sm">
                    {h.name}
                  </span>
                  <span className="font-mono text-primary text-[11px] block mt-0.5">
                    {h.date} ({h.dayName})
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Scope: {h.applicableBranches.join(', ')}
                  </span>
                </div>

                <StatusBadge status="active" label={h.type} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
