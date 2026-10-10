import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useDemo } from '@/context/DemoContext'
import type { ShiftRosterDay } from '@/mock/attendance'
import {
  CalendarDays,
  Clock,
  Info,
  Moon,
  RefreshCw,
  Sun,
  Users,
} from 'lucide-react'
import React, { useState } from 'react'

const MOCK_WEEKLY_ROSTER: ShiftRosterDay[] = [
  { date: '2026-10-05', dayName: 'Monday', shiftCode: 'SHIFT-C', shiftName: 'Night Shift C', timings: '10:00 PM – 06:00 AM', isNightShift: true, isWeeklyOff: false },
  { date: '2026-10-06', dayName: 'Tuesday', shiftCode: 'SHIFT-C', shiftName: 'Night Shift C', timings: '10:00 PM – 06:00 AM', isNightShift: true, isWeeklyOff: false },
  { date: '2026-10-07', dayName: 'Wednesday', shiftCode: 'SHIFT-C', shiftName: 'Night Shift C', timings: '10:00 PM – 06:00 AM', isNightShift: true, isWeeklyOff: false },
  { date: '2026-10-08', dayName: 'Thursday', shiftCode: 'SHIFT-C', shiftName: 'Night Shift C', timings: '10:00 PM – 06:00 AM', isNightShift: true, isWeeklyOff: false },
  { date: '2026-10-09', dayName: 'Friday', shiftCode: 'SHIFT-C', shiftName: 'Night Shift C', timings: '10:00 PM – 06:00 AM', isNightShift: true, isWeeklyOff: false },
  { date: '2026-10-10', dayName: 'Saturday', shiftCode: 'OFF', shiftName: 'Weekly Off', timings: 'Off Duty', isNightShift: false, isWeeklyOff: true },
  { date: '2026-10-11', dayName: 'Sunday', shiftCode: 'OFF', shiftName: 'Weekly Off', timings: 'Off Duty', isNightShift: false, isWeeklyOff: true },
]

export const MyShiftRosterPage: React.FC = () => {
  const { settings } = useDemo()
  const [roster] = useState<ShiftRosterDay[]>(MOCK_WEEKLY_ROSTER)

  return (
    <FeatureGate
      feature="SHIFT_ROSTER"
      fallback={
        <div className="p-8 text-center bg-card rounded-2xl border border-border">
          <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-base font-semibold text-foreground">
            Shift Roster Not Enabled For Your Profile
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Standard corporate hours apply. Shift rotations are available for Plant Workers, Hospital Nurses, and Retail Staff.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="My Shift Schedule & Weekly Roster"
          subtitle="Rotational shift planning, night allowances, and assigned operational timings"
          scope="Self"
          breadcrumbs={[{ label: 'ERP' }, { label: 'My Self-Service' }, { label: 'Shift Roster' }]}
          action={
            <button
              type="button"
              onClick={() => alert('Shift swap request sent to supervisor.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-muted text-foreground transition shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Request Shift Swap</span>
            </button>
          }
        />

        {/* Current Roster Info Card */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground text-sm">
                  Active Roster: Oct 05, 2026 – Oct 11, 2026
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  Night Rotation
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Assigned Line: Plant Assembly Operations • Supervisor: Rajesh Verma
              </p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Night Shift Allowance: <span className="font-bold text-emerald-600">₹ 250 / Shift</span>
          </div>
        </div>

        {/* Weekly Day Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {roster.map((day) => (
            <div
              key={day.date}
              className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[140px] text-xs transition-all ${
                day.isWeeklyOff
                  ? 'bg-muted/30 border-border/80 opacity-70'
                  : 'bg-card border-border shadow-2xs hover:border-primary/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-bold text-foreground">
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {day.date.slice(-2)}th Oct
                  </span>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                      day.isNightShift
                        ? 'text-purple-700 dark:text-purple-300'
                        : day.isWeeklyOff
                        ? 'text-muted-foreground'
                        : 'text-primary'
                    }`}
                  >
                    {day.isNightShift && <Moon className="w-3 h-3" />}
                    {day.shiftName}
                  </span>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    {day.timings}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border/60 text-[10px] font-medium text-muted-foreground">
                {day.isWeeklyOff ? 'Rest Day' : 'Duty Assigned'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </FeatureGate>
  )
}
