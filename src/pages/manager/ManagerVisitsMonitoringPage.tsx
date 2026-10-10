import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FeatureGate } from '@/components/common/FeatureGate'
import { useVisit, type VisitPlan } from '@/context/VisitContext'
import {
  Navigation,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Compass,
  TrendingUp,
  Search,
  Filter,
  Users,
  Building,
  Crosshair,
  ShieldCheck,
  ChevronRight,
  Phone,
  MessageSquare,
  AlertCircle,
  XCircle,
} from 'lucide-react'

export const ManagerVisitsMonitoringPage: React.FC = () => {
  const { visitPlans } = useVisit()

  const [selectedRep, setSelectedRep] = useState<string>('All')
  const [selectedPin, setSelectedPin] = useState<VisitPlan | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Filter plans based on representative
  const filteredPlans = visitPlans.filter((p) => {
    if (selectedRep === 'All') return true
    return p.employeeName === selectedRep
  })

  // Missed visit alerts
  const missedAlerts = visitPlans.filter((p) => p.status === 'Missed')
  const inProgressPlans = visitPlans.filter((p) => p.status === 'In Progress')
  const completedPlans = visitPlans.filter((p) => p.status === 'Completed')

  // Performance totals
  const totalBookedRevenue = visitPlans
    .filter((p) => p.orderValue)
    .reduce((sum, p) => sum + (p.orderValue || 0), 0)

  return (
    <FeatureGate
      feature="VISIT"
      fallback={
        <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xs">
          <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold">Feature Gated: Field Visit Monitoring</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            This screen requires the <strong>VISIT</strong> feature flag.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Team Field Visit Monitoring & Live Telemetry"
          subtitle="Supervise sales rep beat execution, track live check-in waypoints on territory maps, and address missed client calls"
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live GPS Surveillance Active
              </span>
            </div>
          }
        />

        {toastMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* MISSED-VISIT ALERTS WIDGET */}
        {missedAlerts.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-700 dark:text-rose-400">
                    Missed Beat Schedule Alerts ({missedAlerts.length})
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Scheduled client visits skipped or delayed beyond allocated time slot.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
                Action Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {missedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl bg-card border border-rose-500/20 flex items-start justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{alert.clientName}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">({alert.scheduledTimeSlot})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Rep: <strong>{alert.employeeName}</strong> • {alert.beatRoute}
                    </p>
                    <p className="text-[11px] text-rose-600 font-medium italic mt-1">
                      Reason: “{alert.notes || 'No check-in detected within scheduled slot'}”
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => showToast(`Dispatched WhatsApp nudge to ${alert.employeeName}.`)}
                      className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-lg hover:opacity-90 transition"
                    >
                      Nudge Rep
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast(`Rescheduled visit for ${alert.clientName} to tomorrow 10:00 AM.`)}
                      className="px-2.5 py-1 border border-border text-foreground text-[10px] font-bold rounded-lg hover:bg-muted transition"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 MONITORING SCOREBOARD CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Active Reps in Field
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-foreground">2 Reps</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Hardik Trivedi • Jayesh Patel
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Live Check-Ins Right Now
            </span>
            <span className="text-2xl font-black text-sky-600 mt-1 block">
              {inProgressPlans.length} In-Progress
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Inside client store geo-fence
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Visits Completed Today
            </span>
            <span className="text-2xl font-black text-emerald-600 mt-1 block">
              {completedPlans.length} Calls Done
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Average duration: 44 mins
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Booked Order Value
            </span>
            <span className="text-2xl font-black text-primary mt-1 block">
              ₹{totalBookedRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5 block">
              Across retail distributor orders
            </span>
          </div>
        </div>

        {/* LIVE MAP & REP TELEMETRY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Territory Map Visualizer */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-border p-5 text-white min-h-[440px] flex flex-col justify-between relative overflow-hidden shadow-xs">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `radial-gradient(#38bdf8 1.5px, transparent 1.5px), linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                }}
              />
            </div>

            {/* Header Overlay */}
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-emerald-400 font-bold">MANAGER BEAT RADAR</span>
                <span className="text-white/40">|</span>
                <span className="text-white/80">Active Beat: Western Gujarat FMCG</span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedRep}
                  onChange={(e) => setSelectedRep(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-black/70 border border-white/20 rounded-xl text-white font-bold"
                >
                  <option value="All">All Representatives</option>
                  <option value="Hardik Trivedi">Hardik Trivedi</option>
                  <option value="Jayesh Patel">Jayesh Patel</option>
                </select>
              </div>
            </div>

            {/* Simulated Live Territory Pins */}
            <div className="relative z-10 my-8 py-6 px-4">
              <div className="grid grid-cols-3 gap-4">
                {filteredPlans.map((plan, idx) => {
                  const isInProgress = plan.status === 'In Progress'
                  const isCompleted = plan.status === 'Completed'
                  const isMissed = plan.status === 'Missed'

                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPin(plan)}
                      className={`cursor-pointer p-3.5 rounded-2xl backdrop-blur-md border transition-all transform hover:-translate-y-1 hover:shadow-xl ${
                        isInProgress
                          ? 'bg-sky-950/90 border-sky-400 ring-2 ring-sky-400/50 shadow-sky-500/20'
                          : isCompleted
                          ? 'bg-emerald-950/70 border-emerald-500/70'
                          : isMissed
                          ? 'bg-rose-950/70 border-rose-500/70'
                          : 'bg-black/60 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-white/60">
                          Stop #{idx + 1}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isInProgress
                              ? 'bg-sky-400 text-black font-black animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-500 text-black font-black'
                              : isMissed
                              ? 'bg-rose-500 text-white font-black'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          {plan.status}
                        </span>
                      </div>

                      <h5 className="font-bold text-xs truncate text-white" title={plan.clientName}>
                        {plan.clientName}
                      </h5>
                      <p className="text-[10px] text-white/60 truncate mt-0.5">{plan.employeeName}</p>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-white/60">Fence: {plan.geofenceRadiusMeters}m</span>
                        <span className="text-sky-300 font-mono">
                          {isInProgress ? '📍 CHECKED-IN' : isCompleted ? 'COMPLETED' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Map Footer Legend */}
            <div className="relative z-10 flex items-center justify-between bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-xs">
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" /> Active In-Progress
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Missed Call
                </span>
              </div>
              <span className="text-[11px] text-white/60 font-mono">Refreshed: Real-time</span>
            </div>
          </div>

          {/* Rep Telemetry & Live Call Inspector */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
            <div className="border-b border-border pb-3">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-primary" />
                Live Call Verification Inspector
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select any stop on the territory radar to inspect biometric storefront photos and fence distance.
              </p>
            </div>

            {selectedPin ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-muted/40 rounded-xl border border-border space-y-1">
                  <span className="text-[10px] font-mono text-primary font-bold">{selectedPin.id}</span>
                  <h5 className="font-bold text-sm text-foreground">{selectedPin.clientName}</h5>
                  <p className="text-[11px] text-muted-foreground">{selectedPin.clientAddress}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Field Representative:</span>
                    <span className="font-bold text-foreground">{selectedPin.employeeName}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Check-in Status:</span>
                    <span className="font-bold text-sky-600">{selectedPin.status}</span>
                  </div>

                  {selectedPin.checkInTime && (
                    <div className="flex items-center justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Arrival Timestamp:</span>
                      <span className="font-bold text-foreground">{selectedPin.checkInTime}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground">Geo-Fence Boundary:</span>
                    <span className="font-bold text-emerald-600">
                      {selectedPin.geofenceRadiusMeters} meters (Verified)
                    </span>
                  </div>

                  {selectedPin.outcome && (
                    <div className="flex items-center justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Recorded Outcome:</span>
                      <span className="font-bold text-foreground">{selectedPin.outcome}</span>
                    </div>
                  )}

                  {selectedPin.orderValue && (
                    <div className="flex items-center justify-between py-1 border-b border-border">
                      <span className="text-muted-foreground">Booked Revenue:</span>
                      <span className="font-bold text-emerald-600">
                        ₹{selectedPin.orderValue.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {selectedPin.checkInPhoto && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Live Storefront Capture:</span>
                    <img
                      src={selectedPin.checkInPhoto}
                      alt="Storefront photo"
                      className="w-full h-32 object-cover rounded-xl border border-border"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-xs">
                Click any waypoint stop on the territory radar to review arrival times, storefront photo proof, and order details.
              </div>
            )}
          </div>
        </div>
      </div>
    </FeatureGate>
  )
}
