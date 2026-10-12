import React, { useState } from 'react'
import {
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Compass,
  Building,
  Phone,
  ChevronRight
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ChipFilterRow } from '@/mobile/components/ChipFilterRow'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useVisit } from '@/context/VisitContext'
import { useAccess } from '@/access/useAccess'
import type { VisitPlan } from '@/context/VisitContext'

export const MobileManagerVisitsPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { visitPlans } = useVisit()

  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedVisit, setSelectedVisit] = useState<VisitPlan | null>(null)

  const filteredVisits = visitPlans.filter((v) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'Missed') return v.status === 'Missed'
    if (activeFilter === 'Completed') return v.status === 'Completed'
    if (activeFilter === 'In Progress') return v.status === 'In Progress'
    return true
  })

  const missedCount = visitPlans.filter((v) => v.status === 'Missed').length
  const completedCount = visitPlans.filter((v) => v.status === 'Completed').length

  if (!hasFeature('VISIT')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Client visit tracking is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Field Visit Monitoring"
        subtitle="GPS beat plan & client check-ins"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Missed Visit Alert Banner */}
        {missedCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Missed Client Visit Detected</strong>
              <span>
                {missedCount} scheduled customer visit missed without geo-checkin. Follow up with field executive.
              </span>
            </div>
          </div>
        )}

        {/* Interactive Map Visual Placeholder */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '8s' }} />
              <span>Live GPS Beat Plan</span>
            </div>
            <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
              3 Reps Active
            </span>
          </div>

          <div className="relative w-full h-40 rounded-2xl bg-slate-900 border border-border/80 overflow-hidden flex items-center justify-center text-center">
            {/* Grid background simulation */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Geofence Ring */}
            <div className="absolute w-24 h-24 rounded-full border-2 border-primary/40 bg-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute w-28 h-28 rounded-full border border-emerald-500/40 bg-emerald-500/5" />

            {/* Live GPS Pins */}
            <div className="absolute top-8 left-12 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                ✓
              </div>
              <span className="text-[9px] font-bold text-emerald-400 mt-0.5">Apollo Corp (Inside)</span>
            </div>

            <div className="absolute bottom-6 right-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                !
              </div>
              <span className="text-[9px] font-bold text-rose-400 mt-0.5">Hindustan Retail (Missed)</span>
            </div>

            <div className="relative z-10 p-2 rounded-xl bg-black/60 backdrop-blur-xs text-[10px] text-white">
              Bengaluru Urban Beat Route #4 • 12.9716° N, 77.5946° E
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        <ChipFilterRow
          chips={[
            { id: 'all', label: `All (${visitPlans.length})` },
            { id: 'Completed', label: `Completed (${completedCount})` },
            { id: 'Missed', label: `Missed (${missedCount})` },
          ]}
          selectedId={activeFilter}
          onSelect={setActiveFilter}
        />

        {/* Visits List */}
        <div className="space-y-2.5">
          {filteredVisits.map((v) => (
            <div
              key={v.id}
              onClick={() => setSelectedVisit(v)}
              className="p-4 rounded-3xl bg-card border border-border shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={v.employeeAvatar}
                    alt={v.employeeName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">
                      {v.clientName}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Executive: {v.employeeName}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    v.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : v.status === 'Missed'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-blue-500/10 text-blue-600'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span>Slot: {v.scheduledTimeSlot}</span>
                </div>

                {v.checkInDistanceMeters !== undefined && (
                  <span
                    className={
                      v.isInsideGeofence
                        ? 'text-emerald-600 font-bold'
                        : 'text-amber-600 font-bold'
                    }
                  >
                    {v.isInsideGeofence ? '✓ Geofence Verified' : `±${v.checkInDistanceMeters}m outside`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visit Detail BottomSheet */}
      <BottomSheet
        isOpen={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        title={selectedVisit?.clientName}
        subtitle={selectedVisit ? `${selectedVisit.beatRoute} • Ref #${selectedVisit.id}` : undefined}
      >
        {selectedVisit && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Field Representative:</span>
                <span className="font-bold text-foreground">{selectedVisit.employeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled Date:</span>
                <span className="font-semibold text-foreground">{selectedVisit.scheduledDate} ({selectedVisit.scheduledTimeSlot})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client Address:</span>
                <span className="font-semibold text-foreground text-right max-w-[200px] truncate">{selectedVisit.clientAddress}</span>
              </div>
              {selectedVisit.checkInTime && (
                <div className="flex justify-between pt-1 border-t border-border/60">
                  <span className="text-muted-foreground">Geo Check-In:</span>
                  <span className="font-bold text-emerald-600">{selectedVisit.checkInTime}</span>
                </div>
              )}
              {selectedVisit.outcome && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visit Outcome:</span>
                  <span className="font-bold text-foreground">{selectedVisit.outcome}</span>
                </div>
              )}
              {selectedVisit.orderValue && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Value Booked:</span>
                  <span className="font-bold text-emerald-600 font-mono">₹{selectedVisit.orderValue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedVisit(null)}
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
