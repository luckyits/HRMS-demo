import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Gift,
  Heart,
  Palmtree,
  Sparkles,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

interface TeamCalendarEvent {
  id: string
  title: string
  date: string
  type: 'leave' | 'holiday' | 'birthday' | 'anniversary'
  employeeName?: string
  avatar?: string
}

export const TeamCalendarPage: React.FC = () => {
  const { employees } = useEmployees()

  const [currentMonth, setCurrentMonth] = useState('October 2026')
  const [filterType, setFilterType] = useState<'all' | 'leave' | 'holiday' | 'birthday'>('all')

  const team = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  const events: TeamCalendarEvent[] = useMemo(() => {
    return [
      {
        id: 'EV-1',
        title: 'Aarav Patel (Annual Leave)',
        date: '2026-10-14',
        type: 'leave',
        employeeName: 'Aarav Patel',
        avatar: team[0]?.avatar,
      },
      {
        id: 'EV-2',
        title: 'Dussehra / Vijayadashami',
        date: '2026-10-20',
        type: 'holiday',
      },
      {
        id: 'EV-3',
        title: 'Devika Nair Birthday 🎂',
        date: '2026-10-24',
        type: 'birthday',
        employeeName: 'Devika Nair',
        avatar: team[1]?.avatar,
      },
      {
        id: 'EV-4',
        title: 'Kavita Rao 2-Year Anniversary 🌟',
        date: '2026-10-28',
        type: 'anniversary',
        employeeName: 'Kavita Rao',
        avatar: team[2]?.avatar,
      },
      {
        id: 'EV-5',
        title: 'Deepavali / Diwali',
        date: '2026-10-31',
        type: 'holiday',
      },
    ]
  }, [team])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => filterType === 'all' || e.type === filterType)
  }, [events, filterType])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Team Shared Calendar"
        subtitle="Consolidated roster view of approved leaves, public holidays, birthdays, and work milestone anniversaries."
      />

      {/* Calendar Header Controls */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-foreground px-2">{currentMonth}</span>
            <button className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'leave', label: 'Leaves' },
            { key: 'holiday', label: 'Holidays' },
            { key: 'birthday', label: 'Celebrations' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key as any)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-lg transition',
                filterType === f.key
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid Representation (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground border-b border-border pb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1
              const dateStr = `2026-10-${day.toString().padStart(2, '0')}`
              const dayEvents = filteredEvents.filter((e) => e.date === dateStr)

              return (
                <div
                  key={day}
                  className={cn(
                    'min-h-[80px] p-1.5 rounded-xl border transition flex flex-col justify-between text-left',
                    dayEvents.length > 0
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border/60 bg-background/50 hover:bg-muted/30'
                  )}
                >
                  <span className="font-semibold text-[11px] text-muted-foreground">{day}</span>
                  <div className="space-y-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={cn(
                          'p-1 rounded text-[9px] font-bold truncate leading-tight',
                          ev.type === 'holiday'
                            ? 'bg-rose-500/10 text-rose-600'
                            : ev.type === 'leave'
                            ? 'bg-blue-500/10 text-blue-600'
                            : 'bg-amber-500/10 text-amber-600'
                        )}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Events Agenda List */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
            <CalendarIcon className="w-4 h-4 text-primary" /> Upcoming Team Milestones
          </h3>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-3 rounded-xl border border-border bg-background space-y-1 shadow-2xs text-xs"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold capitalize',
                      ev.type === 'holiday'
                        ? 'bg-rose-500/10 text-rose-600'
                        : ev.type === 'leave'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-amber-500/10 text-amber-600'
                    )}
                  >
                    {ev.type}
                  </span>
                  <span className="font-mono text-muted-foreground text-[11px]">{ev.date}</span>
                </div>
                <p className="font-bold text-foreground text-xs mt-1">{ev.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
