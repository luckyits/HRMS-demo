import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Moon,
  ArrowRight,
  ShieldCheck,
  Camera,
  FileText,
  UserCheck,
  AlertCircle,
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { MobileCalendar } from '@/mobile/components/MobileCalendar'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useAttendance } from '@/context/AttendanceContext'
import { useAccess } from '@/access/useAccess'
import type { DayAttendance } from '@/mock/attendance'

export const MobileAttendancePage: React.FC = () => {
  const navigate = useNavigate()
  const { monthDays } = useAttendance()
  const { hasFeature } = useAccess()

  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-05') // default to night shift example day
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(() => {
    return monthDays.find((d) => d.date === '2026-10-05') || monthDays[0] || null
  })

  // Map month days into dot status dictionary for calendar
  const dayStatuses: Record<string, 'P' | 'A' | 'HD' | 'L' | 'H' | 'WO'> = {}
  monthDays.forEach((day) => {
    switch (day.status) {
      case 'Present':
        dayStatuses[day.date] = 'P'
        break
      case 'Absent':
        dayStatuses[day.date] = 'A'
        break
      case 'Half day':
        dayStatuses[day.date] = 'HD'
        break
      case 'Leave':
        dayStatuses[day.date] = 'L'
        break
      case 'Weekly off':
        dayStatuses[day.date] = 'WO'
        break
      case 'Holiday':
        dayStatuses[day.date] = 'H'
        break
    }
  })

  // Summary counts
  const presentDaysCount = monthDays.reduce((acc, curr) => {
    if (curr.status === 'Present') return acc + 1
    if (curr.status === 'Half day') return acc + 0.5
    return acc
  }, 0)

  const lateMarksCount = monthDays.filter((d) => d.isLate).length
  const lopDaysCount = monthDays.filter((d) => d.status === 'Absent').length

  const handleSelectDate = (dateStr: string) => {
    setSelectedDateStr(dateStr)
    const day = monthDays.find((d) => d.date === dateStr)
    if (day) {
      setSelectedDay(day)
      setIsSheetOpen(true)
    }
  }

  const getStatusColor = (status: DayAttendance['status']) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'Absent':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      case 'Half day':
        return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
      case 'Leave':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'Holiday':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
      case 'Weekly off':
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="My Attendance"
        subtitle="Monthly log & biometric punch"
        showBack={false}
      />

      <div className="p-4 space-y-4">
        {/* Summary Metric Chips */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Present
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {presentDaysCount}
              </span>
              <span className="text-[10px] text-muted-foreground">Days</span>
            </div>
            <div className="w-full bg-emerald-500/20 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (presentDaysCount / 26) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Late Marks
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {lateMarksCount}
              </span>
              <span className="text-[10px] text-muted-foreground">Grace left: 2</span>
            </div>
            <div className="w-full bg-amber-500/20 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (lateMarksCount / 3) * 100)}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-card border border-border shadow-2xs flex flex-col">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Loss of Pay
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-rose-600 dark:text-rose-400">
                {lopDaysCount}
              </span>
              <span className="text-[10px] text-muted-foreground">LOP Days</span>
            </div>
            <div className="w-full bg-rose-500/20 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (lopDaysCount / 5) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Month Calendar with Color Dots */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              October 2026 Calendar
            </span>
            <span className="text-[11px] text-primary font-medium">Tap day for details</span>
          </div>
          <MobileCalendar
            dayStatuses={dayStatuses}
            selectedDate={selectedDateStr}
            onSelectDate={handleSelectDate}
          />
        </div>

        {/* Selected Day Quick Card if user hasn't opened bottom sheet */}
        {selectedDay && (
          <div
            onClick={() => setIsSheetOpen(true)}
            className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                  Selected Day
                </span>
                <h4 className="text-sm font-bold text-foreground">
                  {selectedDay.date} ({selectedDay.shiftName})
                </h4>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                  selectedDay.status
                )}`}
              >
                {selectedDay.status}
              </span>
            </div>

            {selectedDay.shiftBelongsToDate && (
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Moon className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Counts for shift date: {selectedDay.shiftBelongsToDate}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>
                  {selectedDay.inTime ? `${selectedDay.inTime} → ${selectedDay.outTime || '—'}` : 'No punches recorded'}
                </span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-primary">
                <span>View punches & selfie</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        )}

        {/* Regularize Action Banner */}
        {hasFeature('REGULARIZATION') && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-foreground">Missed a punch or late?</h4>
              <p className="text-[11px] text-muted-foreground">
                Apply for regularization with reason & evidence
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/employee/regularization')}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition shrink-0"
            >
              Regularize
            </button>
          </div>
        )}
      </div>

      {/* Tap-to-open Day Details BottomSheet */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={selectedDay ? `Attendance Details: ${selectedDay.date}` : 'Attendance Details'}
        subtitle={selectedDay ? `${selectedDay.shiftName} (${selectedDay.shiftTiming})` : undefined}
      >
        {selectedDay && (
          <div className="space-y-4">
            {/* Status & Shift Note */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                    selectedDay.status
                  )}`}
                >
                  {selectedDay.status}
                </span>
                {selectedDay.isLate && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Late Mark
                  </span>
                )}
              </div>

              {selectedDay.workHours && (
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                    Duration
                  </span>
                  <span className="text-xs font-black text-foreground font-mono">
                    {selectedDay.workHours}
                  </span>
                </div>
              )}
            </div>

            {/* Night shift notice */}
            {selectedDay.shiftBelongsToDate && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
                <Moon className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Night Shift Crosses Midnight</div>
                  <div className="text-[11px] text-amber-600/90 dark:text-amber-400/90 mt-0.5">
                    Counts for shift date: <strong>{selectedDay.shiftBelongsToDate}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Shift Timings Card */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Scheduled Shift:</span>
                <span className="font-bold text-foreground">{selectedDay.shiftTiming}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">First Punch In:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedDay.inTime || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Last Punch Out:</span>
                <span className="font-bold text-foreground">{selectedDay.outTime || '—'}</span>
              </div>
              {selectedDay.overtimeHours && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                  <span className="text-muted-foreground font-medium">Overtime Recorded:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    +{selectedDay.overtimeHours}
                  </span>
                </div>
              )}
            </div>

            {/* Punches Timeline & Selfie Thumbnails */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Punches Log ({selectedDay.punches.length})
              </h5>

              {selectedDay.punches.length === 0 ? (
                <div className="p-6 rounded-2xl bg-muted/20 border border-dashed border-border text-center space-y-1">
                  <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    No biometric punches registered for this day
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {selectedDay.status === 'Weekly off'
                      ? 'Scheduled weekly off day'
                      : selectedDay.status === 'Holiday'
                      ? 'Public holiday'
                      : 'Missing attendance logs'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDay.punches.map((punch) => (
                    <div
                      key={punch.id}
                      className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-black uppercase ${
                              punch.type === 'IN'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            Punch {punch.type}
                          </span>
                          <span className="text-xs font-bold text-foreground font-mono">
                            {punch.time}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            punch.geofenceStatus === 'Inside fence'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {punch.geofenceStatus}
                        </span>
                      </div>

                      {/* Location & Accuracy */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">
                          {punch.location} • ±{punch.accuracy}
                        </span>
                      </div>

                      {/* Selfie Thumbnail & Face Match Verification */}
                      <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {/* Simulated Selfie Thumbnail */}
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <Camera className="w-4 h-4 text-primary" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                              <ShieldCheck className="w-3 h-3 text-emerald-500" />
                              <span>Selfie & Liveness Verified</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                              Match score: 98.6% • Blink verified
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          Passed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSheetOpen(false)
                  navigate(`/employee/regularization?date=${selectedDay.date}`)
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Regularize This Day</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="py-3 px-4 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs active:scale-95 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
