import React, { useState } from 'react'
import {
  CalendarDays,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Send,
  Users
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'

interface MemberRoster {
  id: string
  name: string
  avatar: string
  shifts: Record<string, 'G' | 'M' | 'E' | 'N' | 'WO'>
}

export const MobileTeamRosterPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { showToast } = useToast()

  const dates = [
    { key: '12', label: 'Mon 12' },
    { key: '13', label: 'Tue 13' },
    { key: '14', label: 'Wed 14' },
    { key: '15', label: 'Thu 15' },
    { key: '16', label: 'Fri 16' },
    { key: '17', label: 'Sat 17' },
    { key: '18', label: 'Sun 18' },
  ]

  const [roster, setRoster] = useState<MemberRoster[]>([
    {
      id: 'emp-1',
      name: 'Aarav Patel',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      shifts: { '12': 'G', '13': 'G', '14': 'G', '15': 'G', '16': 'G', '17': 'WO', '18': 'WO' },
    },
    {
      id: 'emp-2',
      name: 'Devika Nair',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      shifts: { '12': 'M', '13': 'M', '14': 'M', '15': 'M', '16': 'M', '17': 'WO', '18': 'WO' },
    },
    {
      id: 'emp-3',
      name: 'Gopal Shinde',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      shifts: { '12': 'N', '13': 'N', '14': 'N', '15': 'N', '16': 'N', '17': 'WO', '18': 'WO' },
    },
  ])

  // Assign shift state
  const [selectedAssignment, setSelectedAssignment] = useState<{
    memberId: string
    memberName: string
    dateKey: string
    dateLabel: string
    currentShift: 'G' | 'M' | 'E' | 'N' | 'WO'
  } | null>(null)

  const [newShift, setNewShift] = useState<'G' | 'M' | 'E' | 'N' | 'WO'>('G')

  const shiftDetails = {
    G: { name: 'General Shift', hours: '09:30 AM – 06:30 PM', bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    M: { name: 'Morning Shift', hours: '06:00 AM – 02:30 PM', bg: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    E: { name: 'Evening Shift', hours: '02:00 PM – 10:30 PM', bg: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    N: { name: 'Night Shift C', hours: '10:00 PM – 06:00 AM (+1)', bg: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    WO: { name: 'Weekly Off', hours: 'Off Duty (Rest Day)', bg: 'bg-muted text-muted-foreground border-border' },
  }

  // Conflict detection
  const hasRestBreakConflict = selectedAssignment && newShift === 'M' && selectedAssignment.currentShift === 'N'
  const hasLeaveConflict = selectedAssignment?.memberName === 'Aarav Patel' && (selectedAssignment.dateKey === '14' || selectedAssignment.dateKey === '15')

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAssignment) return

    setRoster((prev) =>
      prev.map((m) =>
        m.id === selectedAssignment.memberId
          ? {
              ...m,
              shifts: {
                ...m.shifts,
                [selectedAssignment.dateKey]: newShift,
              },
            }
          : m
      )
    )

    showToast(`Shift updated to ${shiftDetails[newShift].name} for ${selectedAssignment.memberName}!`, 'success')
    setSelectedAssignment(null)
  }

  if (!hasFeature('SHIFT_ROSTER')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Roster and shift planning is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Team Roster"
        subtitle="Shift assignment & rest-period compliance"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Compliance Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
          <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <span>
            Model Standing Orders rule: Minimum 16-hour continuous rest interval mandatory between shift changes.
          </span>
        </div>

        {/* Horizontal Scroll Roster Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current Week: Oct 12 – Oct 18, 2026
            </span>
            <span className="text-[11px] text-primary font-bold">Tap cell to reassign</span>
          </div>

          <div className="p-3.5 rounded-3xl bg-card border border-border shadow-2xs space-y-4 overflow-x-auto">
            {roster.map((member) => (
              <div key={member.id} className="space-y-2 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {member.name}
                  </h4>
                </div>

                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {dates.map((d) => {
                    const shiftCode = member.shifts[d.key] || 'G'
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => {
                          setSelectedAssignment({
                            memberId: member.id,
                            memberName: member.name,
                            dateKey: d.key,
                            dateLabel: d.label,
                            currentShift: shiftCode,
                          })
                          setNewShift(shiftCode)
                        }}
                        className={`py-2 rounded-xl border text-center transition-all active:scale-95 ${shiftDetails[shiftCode].bg}`}
                      >
                        <span className="text-[10px] text-muted-foreground font-semibold block leading-none mb-1">
                          {d.key}
                        </span>
                        <span className="text-xs font-black block leading-none">
                          {shiftCode}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 rounded-2xl bg-card border border-border/70 grid grid-cols-3 gap-2 text-[10px] font-medium text-muted-foreground">
          <div><strong className="text-foreground">G:</strong> General (9h)</div>
          <div><strong className="text-foreground">M:</strong> Morning (6 AM)</div>
          <div><strong className="text-foreground">E:</strong> Evening (2 PM)</div>
          <div><strong className="text-foreground">N:</strong> Night (10 PM)</div>
          <div><strong className="text-foreground">WO:</strong> Weekly Off</div>
        </div>
      </div>

      {/* Assign Shift BottomSheet */}
      <BottomSheet
        isOpen={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment ? `Reassign Shift: ${selectedAssignment.memberName}` : 'Assign Shift'}
        subtitle={selectedAssignment ? `${selectedAssignment.dateLabel} Oct 2026` : undefined}
      >
        {selectedAssignment && (
          <form onSubmit={handleSaveShift} className="space-y-4">
            {/* Shift Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Shift
              </label>

              <div className="space-y-2">
                {(['G', 'M', 'E', 'N', 'WO'] as const).map((code) => {
                  const detail = shiftDetails[code]
                  const isPicked = newShift === code

                  return (
                    <div
                      key={code}
                      onClick={() => setNewShift(code)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isPicked
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-muted">
                            {code}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {detail.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          {detail.hours}
                        </span>
                      </div>

                      {isPicked && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Conflict Warnings */}
            {hasRestBreakConflict && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Rest-Break Compliance Warning!</strong>
                  <span>
                    Employee is on Night Shift ending at 06:00 AM. Assigning Morning shift does not provide the mandatory 16-hour interval.
                  </span>
                </div>
              </div>
            )}

            {hasLeaveConflict && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Approved Leave Conflict!</strong>
                  <span>
                    Aarav Patel has an approved Earned Leave application for this date.
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Shift Assignment</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="py-3 px-4 rounded-xl bg-muted text-foreground font-bold text-xs active:scale-95 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </BottomSheet>
    </div>
  )
}
