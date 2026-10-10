import React, { useState } from 'react'
import { CalendarDays, Clock, ArrowRight, ShieldCheck } from 'lucide-react'
import { useAccess } from '@/access/useAccess'

export interface RosterDayItem {
  dayName: string
  dateNum: number
  shiftCode: 'G' | 'M' | 'E' | 'N' | 'WO' // General, Morning, Evening, Night, Weekly Off
  shiftTiming: string
  shiftLabel: string
  isNight?: boolean
}

const MOCK_WEEK_ROSTER: RosterDayItem[] = [
  { dayName: 'Mon', dateNum: 5, shiftCode: 'N', shiftTiming: '10:00 PM - 06:00 AM (+1)', shiftLabel: 'Night Shift C', isNight: true },
  { dayName: 'Tue', dateNum: 6, shiftCode: 'N', shiftTiming: '10:00 PM - 06:00 AM (+1)', shiftLabel: 'Night Shift C', isNight: true },
  { dayName: 'Wed', dateNum: 7, shiftCode: 'G', shiftTiming: '09:30 AM - 06:30 PM', shiftLabel: 'General Shift' },
  { dayName: 'Thu', dateNum: 8, shiftCode: 'G', shiftTiming: '09:30 AM - 06:30 PM', shiftLabel: 'General Shift' },
  { dayName: 'Fri', dateNum: 9, shiftCode: 'M', shiftTiming: '06:00 AM - 02:30 PM', shiftLabel: 'Morning Line 1' },
  { dayName: 'Sat', dateNum: 10, shiftCode: 'G', shiftTiming: '09:00 AM - 06:00 PM', shiftLabel: 'General Duty' },
  { dayName: 'Sun', dateNum: 11, shiftCode: 'WO', shiftTiming: 'Off Duty', shiftLabel: 'Weekly Off' },
]

export const MobileRosterStrip: React.FC = () => {
  const { hasFeature } = useAccess()
  const [selectedDayIndex, setSelectedDayIndex] = useState(5) // Saturday mock today

  if (!hasFeature('SHIFT_ROSTER')) {
    return null
  }

  const selectedDay = MOCK_WEEK_ROSTER[selectedDayIndex]

  const getShiftBadgeStyle = (code: string) => {
    switch (code) {
      case 'N':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
      case 'M':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
      case 'E':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
      case 'WO':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    }
  }

  return (
    <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            My Shift Roster (Oct 05 – Oct 11)
          </h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          Weekly Rotation
        </span>
      </div>

      {/* Horizontal Day Chips Strip */}
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
        {MOCK_WEEK_ROSTER.map((item, idx) => {
          const isSelected = selectedDayIndex === idx
          const isToday = idx === 5

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`flex-1 min-w-[44px] py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs font-bold'
                  : isToday
                  ? 'bg-primary/5 text-primary border-primary/30'
                  : 'bg-muted/30 border-border text-foreground hover:bg-muted'
              }`}
            >
              <span className="text-[10px] uppercase opacity-75">{item.dayName}</span>
              <span className="text-sm font-black leading-none">{item.dateNum}</span>
              <span
                className={`text-[9px] font-bold px-1 rounded-md border ${
                  isSelected ? 'bg-primary-foreground/20 text-white border-white/20' : getShiftBadgeStyle(item.shiftCode)
                }`}
              >
                {item.shiftCode}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected Day Shift Detail Card */}
      <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{selectedDay.shiftLabel}</span>
            {selectedDay.isNight && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                Night Shift
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Timing: {selectedDay.shiftTiming}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-muted-foreground block">Supervisor</span>
          <span className="font-semibold text-foreground">Vikram M.</span>
        </div>
      </div>
    </div>
  )
}
