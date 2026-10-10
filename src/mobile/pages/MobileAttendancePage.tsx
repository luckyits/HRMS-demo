import React, { useState, useEffect } from 'react'
import { Clock, MapPin, Camera, Calendar, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { TrackingIndicator } from '@/mobile/components/TrackingIndicator'
import { ListCard } from '@/mobile/components/ListCard'
import { MobileCalendar } from '@/mobile/components/MobileCalendar'
import { useToast } from '@/context/ToastContext'
import { useAccess } from '@/access/useAccess'

export const MobileAttendancePage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { showToast } = useToast()

  const [currentTime, setCurrentTime] = useState('')
  const [punchedIn, setPunchedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const handlePunchToggle = () => {
    setPunchedIn(!punchedIn)
    if (!punchedIn) {
      showToast('Punch IN verified! GPS location: 12.9716° N, 77.5946° E (Inside Geofence)', 'success')
    } else {
      showToast('Punch OUT marked at ' + currentTime + '. Great job today!', 'info')
    }
  }

  const mockPunches = [
    { date: 'Oct 09, 2026', in: '09:05 AM', out: '06:12 PM', hours: '9h 07m', status: 'Present' as const },
    { date: 'Oct 08, 2026', in: '09:12 AM', out: '06:05 PM', hours: '8h 53m', status: 'Present' as const },
    { date: 'Oct 07, 2026', in: '09:28 AM', out: '06:30 PM', hours: '9h 02m', status: 'Present' as const },
    { date: 'Oct 06, 2026', in: '—', out: '—', hours: '0h', status: 'Leave' as const },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader title="Attendance & Clock" subtitle="Biometric punch & geofence" showBack={false} />

      <div className="p-4 space-y-4">
        {/* Sub-tab switcher */}
        <div className="flex p-1 bg-muted/60 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'today' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Today's Punch
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'history' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Monthly History
          </button>
        </div>

        {activeTab === 'today' ? (
          <>
            {/* Live Clock & Big Touch Target */}
            <div className="p-6 rounded-3xl bg-card border border-border text-center shadow-xs space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Time (IST)
                </span>
                <div className="text-3xl font-black text-foreground font-mono tracking-tight">
                  {currentTime || '09:30:00 AM'}
                </div>
                <p className="text-xs text-muted-foreground">Saturday, 10 October 2026</p>
              </div>

              {/* Verified Geofence Indicator */}
              <div className="flex justify-center">
                <TrackingIndicator status="geofenced" label="Inside Geofence (45m)" />
              </div>

              {/* Huge Circular Punch Button */}
              <div className="py-2 flex justify-center">
                <button
                  type="button"
                  onClick={handlePunchToggle}
                  className={`relative w-40 h-40 rounded-full flex flex-col items-center justify-center gap-1.5 text-white font-black shadow-xl active:scale-95 transition-all select-none ${
                    punchedIn
                      ? 'bg-gradient-to-tr from-rose-600 to-rose-500 shadow-rose-600/30'
                      : 'bg-gradient-to-tr from-emerald-600 to-emerald-500 shadow-emerald-600/30'
                  }`}
                >
                  <Clock className="w-9 h-9 stroke-[2.5px]" />
                  <span className="text-base tracking-wide uppercase">
                    {punchedIn ? 'Punch OUT' : 'Punch IN'}
                  </span>
                  <span className="text-[10px] font-normal opacity-90">
                    {punchedIn ? 'Working since 09:30' : 'Tap to mark presence'}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Shift: 09:00 AM – 06:00 PM • 9h 00m</span>
              </div>
            </div>

            {/* Today's Punch Timeline */}
            <div className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Today's Log
              </h4>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground block">First In</span>
                  <span className="font-bold text-foreground">{punchedIn ? '09:30 AM' : '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Last Out</span>
                  <span className="font-bold text-foreground">—</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Total Hours</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {punchedIn ? 'In Progress' : '0h 00m'}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <MobileCalendar
              dayStatuses={{
                '2026-10-09': 'P',
                '2026-10-08': 'P',
                '2026-10-07': 'P',
                '2026-10-06': 'L',
                '2026-10-05': 'P',
                '2026-10-02': 'H',
              }}
            />

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Recent Daily Punches
              </h4>
              {mockPunches.map((p, i) => (
                <ListCard
                  key={i}
                  title={p.date}
                  subtitle={`In: ${p.in} • Out: ${p.out}`}
                  status={p.status}
                  statusVariant={p.status === 'Present' ? 'success' : 'warning'}
                  fields={[
                    { label: 'Work Duration', value: p.hours, highlight: true },
                    { label: 'Shift Rule', value: 'General (9h)' },
                  ]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
