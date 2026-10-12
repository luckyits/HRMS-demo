import React, { useState } from 'react'
import {
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Gift,
  PartyPopper,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { MobileCalendar } from '@/mobile/components/MobileCalendar'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { MOCK_HOLIDAYS, MOCK_CELEBRATIONS, type HolidayItem } from '@/mock/essData'
import { useAccess } from '@/access/useAccess'
import { useEss } from '@/context/EssContext'

export const MobileCalendarPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { celebrations, leaveRequests } = useEss()

  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-20') // Dussehra by default
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayItem | null>(null)

  // Map calendar dots for current month (Oct 2026)
  const dayStatuses: Record<string, 'P' | 'A' | 'HD' | 'L' | 'H' | 'WO'> = {
    '2026-10-02': 'H', // Gandhi Jayanti
    '2026-10-03': 'WO',
    '2026-10-04': 'WO',
    '2026-10-06': 'L',  // Leave taken
    '2026-10-10': 'WO',
    '2026-10-11': 'WO',
    '2026-10-14': 'HD', // Half Day
    '2026-10-17': 'WO',
    '2026-10-18': 'WO',
    '2026-10-20': 'H',  // Dussehra
    '2026-10-24': 'WO',
    '2026-10-25': 'WO',
    '2026-10-31': 'WO',
  }

  // Populate dynamic user leaves
  leaveRequests.forEach((req) => {
    if (req.status === 'approved' && req.startDate.startsWith('2026-10')) {
      dayStatuses[req.startDate] = 'L'
    }
  })

  // Find info for selected date
  const selectedHolidayInfo = MOCK_HOLIDAYS.find((h) => h.date === selectedDateStr)
  const selectedCelebration = celebrations.find((c) => c.date === selectedDateStr)
  const hasLeaveOnDate = leaveRequests.find((l) => l.startDate === selectedDateStr && l.status === 'approved')

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Calendar & Holidays"
        subtitle="Public holidays, leaves & roster shifts"
        showBack={true}
      />

      <div className="p-4 space-y-5">
        {/* Month Calendar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              October 2026
            </span>
            <span className="text-[11px] text-primary font-semibold">
              Tap date to inspect
            </span>
          </div>

          <MobileCalendar
            dayStatuses={dayStatuses}
            selectedDate={selectedDateStr}
            onSelectDate={(date) => setSelectedDateStr(date)}
          />
        </div>

        {/* Selected Date Summary Card */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Events on {selectedDateStr}
            </span>
            {selectedHolidayInfo ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Public Holiday
              </span>
            ) : hasLeaveOnDate ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600">
                Approved Leave
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Working Day
              </span>
            )}
          </div>

          {selectedHolidayInfo && (
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {selectedHolidayInfo.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedHolidayInfo.type} Holiday • Applicable to {selectedHolidayInfo.applicableBranches.join(', ')}
                </p>
              </div>
            </div>
          )}

          {hasFeature('BIRTHDAY_ANNIV') && selectedCelebration && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
              <PartyPopper className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-foreground">
                  {selectedCelebration.employeeName}’s {selectedCelebration.type}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {selectedCelebration.designation} • {selectedCelebration.department}
                </p>
              </div>
            </div>
          )}

          {!selectedHolidayInfo && !selectedCelebration && (
            <div className="text-xs text-muted-foreground flex items-center gap-2 py-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>Standard Shift: General (09:30 AM – 06:30 PM)</span>
            </div>
          )}
        </div>

        {/* Upcoming Holidays List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Upcoming Holidays 2026 ({MOCK_HOLIDAYS.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">Statutory Calendar</span>
          </div>

          <div className="space-y-2">
            {MOCK_HOLIDAYS.map((h) => {
              const isPast = new Date(h.date) < new Date('2026-10-10')

              return (
                <div
                  key={h.id}
                  onClick={() => {
                    setSelectedHoliday(h)
                    setSelectedDateStr(h.date)
                  }}
                  className={`p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition hover:border-primary/50 ${
                    isPast ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold uppercase">
                        {new Date(h.date).toLocaleDateString([], { month: 'short' })}
                      </span>
                      <span className="text-xs font-black font-mono">
                        {new Date(h.date).getDate()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {h.name}
                      </h4>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {h.dayName} • {h.type} Holiday
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      h.type === 'National'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {h.type}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Holiday Details Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedHoliday)}
        onClose={() => setSelectedHoliday(null)}
        title={selectedHoliday?.name}
        subtitle={`${selectedHoliday?.date} (${selectedHoliday?.dayName})`}
      >
        {selectedHoliday && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Holiday Category:</span>
                <span className="font-bold text-foreground">{selectedHoliday.type} Holiday</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Applicable Branches:</span>
                <span className="font-bold text-foreground">
                  {selectedHoliday.applicableBranches.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Payroll Treatment:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Paid Public Holiday (Full Wages)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200">
              Under Indian Factories & Shop Establishments Act, attendance on this national holiday is eligible for 2.0x Overtime wages or Compensatory Off credit.
            </div>

            <button
              type="button"
              onClick={() => setSelectedHoliday(null)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs"
            >
              Close
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
