import React, { useState } from 'react'
import {
  Calendar,
  Sparkles,
  PartyPopper,
  Users,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { MobileCalendar } from '@/mobile/components/MobileCalendar'
import { MOCK_HOLIDAYS, MOCK_CELEBRATIONS } from '@/mock/essData'
import { useAccess } from '@/access/useAccess'

export const MobileTeamCalendarPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const [selectedDateStr, setSelectedDateStr] = useState('2026-10-14')

  const teamLeaves: Record<string, { name: string; avatar: string; leaveType: string }[]> = {
    '2026-10-14': [
      {
        name: 'Aarav Patel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        leaveType: 'Earned Leave (Day 1/2)',
      },
    ],
    '2026-10-15': [
      {
        name: 'Aarav Patel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        leaveType: 'Earned Leave (Day 2/2)',
      },
    ],
    '2026-10-12': [
      {
        name: 'Devika Nair',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        leaveType: 'Casual Leave (Emergency)',
      },
    ],
  }

  const dayStatuses: Record<string, 'P' | 'A' | 'HD' | 'L' | 'H' | 'WO'> = {
    '2026-10-02': 'H',
    '2026-10-03': 'WO',
    '2026-10-04': 'WO',
    '2026-10-10': 'WO',
    '2026-10-11': 'WO',
    '2026-10-12': 'L',
    '2026-10-14': 'L',
    '2026-10-15': 'L',
    '2026-10-17': 'WO',
    '2026-10-18': 'WO',
    '2026-10-20': 'H',
    '2026-10-24': 'WO',
    '2026-10-25': 'WO',
  }

  const selectedHoliday = MOCK_HOLIDAYS.find((h) => h.date === selectedDateStr)
  const selectedLeaves = teamLeaves[selectedDateStr] || []
  const selectedCelebration = MOCK_CELEBRATIONS.find((c) => c.date === selectedDateStr)

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Team Calendar"
        subtitle="Team leaves, holidays & milestones"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Month Calendar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              October 2026
            </span>
            <span className="text-[11px] text-primary font-semibold">Tap to inspect day</span>
          </div>

          <MobileCalendar
            dayStatuses={dayStatuses}
            selectedDate={selectedDateStr}
            onSelectDate={setSelectedDateStr}
          />
        </div>

        {/* Selected Date Timeline */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Schedule for {selectedDateStr}
          </span>

          {selectedHoliday && (
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2.5 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-foreground block">{selectedHoliday.name}</span>
                <span className="text-muted-foreground text-[11px]">Paid Public Holiday ({selectedHoliday.type})</span>
              </div>
            </div>
          )}

          {selectedLeaves.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground block">
                Team Members on Leave ({selectedLeaves.length})
              </span>
              {selectedLeaves.map((l, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs"
                >
                  <img
                    src={l.avatar}
                    alt={l.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div>
                    <span className="font-bold text-foreground block">{l.name}</span>
                    <span className="text-amber-700 dark:text-amber-300 text-[11px]">{l.leaveType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCelebration && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2.5 text-xs">
              <PartyPopper className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <span className="font-bold text-foreground block">
                  {selectedCelebration.employeeName}’s {selectedCelebration.type}
                </span>
                <span className="text-muted-foreground text-[11px]">{selectedCelebration.department}</span>
              </div>
            </div>
          )}

          {!selectedHoliday && selectedLeaves.length === 0 && !selectedCelebration && (
            <div className="text-xs text-muted-foreground py-2 text-center">
              All team members scheduled on regular general shift duty.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
