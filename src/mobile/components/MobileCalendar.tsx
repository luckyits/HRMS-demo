import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface CalendarDayStatus {
  date: string // "YYYY-MM-DD"
  status: 'P' | 'A' | 'HD' | 'L' | 'H' | 'WO' // Present, Absent, Half day, Leave, Holiday, Weekly Off
  label?: string
}

interface MobileCalendarProps {
  dayStatuses?: Record<string, 'P' | 'A' | 'HD' | 'L' | 'H' | 'WO'>
  onSelectDate?: (dateStr: string) => void
  selectedDate?: string
}

export const MobileCalendar: React.FC<MobileCalendarProps> = ({
  dayStatuses = {},
  onSelectDate,
  selectedDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 9, 1)) // Oct 2026

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const getStatusDot = (dayNum: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const st = dayStatuses[dayStr]

    switch (st) {
      case 'P':
        return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      case 'A':
        return <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      case 'HD':
        return <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
      case 'L':
        return <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      case 'H':
        return <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
      case 'WO':
        return <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
      default:
        return null
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-2xs select-none">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-foreground">{monthName}</h4>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center mb-1">
        {daysOfWeek.map((d, i) => (
          <span key={i} className="text-[11px] font-bold text-muted-foreground py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {/* Days */}
        {Array.from({ length: totalDays }).map((_, i) => {
          const dayNum = i + 1
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
          const isSelected = selectedDate === dateStr
          const isToday = dayNum === 10 && month === 9 // Oct 10 2026 mock today

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              onClick={() => onSelectDate?.(dateStr)}
              className={`h-9 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                  : isToday
                  ? 'border border-primary text-primary font-bold bg-primary/5'
                  : 'text-foreground hover:bg-muted active:scale-95'
              }`}
            >
              <span className="text-xs leading-none">{dayNum}</span>
              <div className="h-1 flex items-center justify-center mt-0.5">
                {getStatusDot(dayNum)}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-[10px] font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
          <span>Half day</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span>Leave</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 shrink-0" />
          <span>Weekly off</span>
        </div>
      </div>
    </div>
  )
}
