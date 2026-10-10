import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarOff,
  Navigation,
  RefreshCw,
  Search,
  Battery,
  MapPin,
  Building,
  Layers,
  ShieldAlert,
} from 'lucide-react'

export const LiveDashboardPage: React.FC = () => {
  const { livePunches, refreshLivePunches, isLiveRefreshing } = useAdminAttendance()

  const [selectedBranch, setSelectedBranch] = useState<string>('All Branches')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPunchId, setSelectedPunchId] = useState<string | null>(livePunches[0]?.id || null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [countdown, setCountdown] = useState(20)

  // Auto-refresh countdown simulation
  useEffect(() => {
    if (!autoRefreshEnabled) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refreshLivePunches()
          return 20
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [autoRefreshEnabled, refreshLivePunches])

  const branches = ['All Branches', 'Bengaluru HQ', 'Mumbai Hub', 'Pune Plant']

  const filteredPunches = livePunches.filter((punch) => {
    const matchesBranch = selectedBranch === 'All Branches' || punch.branch === selectedBranch
    const matchesSearch =
      punch.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      punch.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      punch.designation.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesBranch && matchesSearch
  })

  // Metric counts
  const presentCount = livePunches.filter((p) => p.status === 'Present').length
  const lateCount = livePunches.filter((p) => p.status === 'Late').length
  const absentCount = livePunches.filter((p) => p.status === 'Absent').length
  const onLeaveCount = livePunches.filter((p) => p.status === 'On Leave').length
  const onVisitCount = livePunches.filter((p) => p.status === 'On Visit').length
  const totalTracked = livePunches.length

  const selectedPunch = livePunches.find((p) => p.id === selectedPunchId) || filteredPunches[0]

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Live Attendance Operations"
        subtitle="Real-time geo-located workforce telemetry, biometric arrivals, and field visits"
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  autoRefreshEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="text-muted-foreground">
                {autoRefreshEnabled ? `Auto-sync in ${countdown}s` : 'Auto-sync Paused'}
              </span>
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className="text-[11px] font-semibold text-primary hover:underline ml-1"
              >
                {autoRefreshEnabled ? 'Pause' : 'Resume'}
              </button>
            </div>

            <button
              onClick={() => {
                refreshLivePunches()
                setCountdown(20)
              }}
              disabled={isLiveRefreshing}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLiveRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Now</span>
            </button>
          </div>
        }
      />

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-emerald-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Present On Time
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{presentCount}</span>
            <span className="text-xs text-muted-foreground font-medium">
              ({Math.round((presentCount / totalTracked) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-emerald-100 dark:bg-emerald-950/40 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${(presentCount / totalTracked) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-amber-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Late Arrivals
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{lateCount}</span>
            <span className="text-xs text-muted-foreground font-medium">exceeded grace</span>
          </div>
          <div className="w-full bg-amber-100 dark:bg-amber-950/40 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{ width: `${(lateCount / totalTracked) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-blue-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              On Field Visit
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{onVisitCount}</span>
            <span className="text-xs text-muted-foreground font-medium">GPS tracked</span>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-950/40 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${(onVisitCount / totalTracked) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-purple-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Approved Leave
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <CalendarOff className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">{onLeaveCount}</span>
            <span className="text-xs text-muted-foreground font-medium">scheduled off</span>
          </div>
          <div className="w-full bg-purple-100 dark:bg-purple-950/40 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${(onLeaveCount / totalTracked) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-card border border-rose-500/20 rounded-xl p-4 shadow-sm relative overflow-hidden col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Unaccounted Absent
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">{absentCount}</span>
            <span className="text-xs text-muted-foreground font-medium">no punch</span>
          </div>
          <div className="w-full bg-rose-100 dark:bg-rose-950/40 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full"
              style={{ width: `${(absentCount / totalTracked) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-3 rounded-xl">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building className="w-4 h-4 text-muted-foreground ml-1" />
          <div className="flex items-center gap-1.5">
            {branches.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedBranch === b
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff, dept, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Main Map + Side Staff Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map Visualizer */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">Geo-Telemetry Multi-Branch View</span>
              <span className="text-xs text-muted-foreground">({filteredPunches.length} pins plotted)</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
              </span>
              <span className="inline-flex items-center gap-1 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Late
              </span>
              <span className="inline-flex items-center gap-1 text-blue-600">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Visit
              </span>
              <span className="inline-flex items-center gap-1 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Absent
              </span>
            </div>
          </div>

          {/* Map Canvas Simulation */}
          <div className="relative flex-1 min-h-[460px] bg-slate-900 overflow-hidden select-none">
            {/* Grid styling & terrain simulation */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #38bdf8 1px, transparent 1px), linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)',
                backgroundSize: '32px 32px, 64px 64px, 64px 64px',
              }}
            />

            {/* Geographical Zones Watermarks */}
            <div className="absolute top-8 left-8 p-3 rounded-lg bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-300 text-xs shadow-lg">
              <div className="font-semibold text-sky-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> High-Density Geofence Radar
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bengaluru Outer Ring Road &bull; BKC Mumbai &bull; Pune Chakan
              </p>
            </div>

            {/* Interactive Pins plotted across map */}
            {filteredPunches.map((punch, idx) => {
              // Calculate deterministic positions on canvas
              const xPercent = 18 + ((idx * 27) % 64)
              const yPercent = 20 + ((idx * 33) % 60)
              const isSelected = selectedPunch?.id === punch.id

              let pinColor = 'bg-emerald-500 ring-emerald-400'
              if (punch.status === 'Late') pinColor = 'bg-amber-500 ring-amber-400'
              if (punch.status === 'On Visit') pinColor = 'bg-blue-500 ring-blue-400'
              if (punch.status === 'Absent') pinColor = 'bg-rose-500 ring-rose-400'
              if (punch.status === 'On Leave') pinColor = 'bg-purple-500 ring-purple-400'

              return (
                <div
                  key={punch.id}
                  onClick={() => setSelectedPunchId(punch.id)}
                  style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 z-10 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                >
                  <div className="relative group">
                    {/* Radar Pulse for active staff */}
                    {punch.status === 'Present' || punch.status === 'On Visit' ? (
                      <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping" />
                    ) : null}

                    {/* Pin Marker */}
                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-xl ${pinColor} ring-4 ring-opacity-30`}
                    >
                      <img
                        src={punch.avatar}
                        alt={punch.employeeName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    </div>

                    {/* Hover tooltip label */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-8 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border border-slate-700">
                      {punch.employeeName} &bull; {punch.status}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Selected Employee Floating Overlay Card */}
            {selectedPunch && (
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 bg-card/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl z-20">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedPunch.avatar}
                      alt={selectedPunch.employeeName}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{selectedPunch.employeeName}</h4>
                      <p className="text-xs text-muted-foreground">
                        {selectedPunch.designation} &bull; {selectedPunch.department}
                      </p>
                      <span className="text-[10px] text-primary font-medium">{selectedPunch.branch}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedPunch.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : selectedPunch.status === 'Late'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : selectedPunch.status === 'On Visit'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : selectedPunch.status === 'On Leave'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {selectedPunch.status}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Punch In Time</span>
                    <span className="font-semibold text-foreground">
                      {selectedPunch.punchInTime || 'No punch yet'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Active Shift</span>
                    <span className="font-semibold text-foreground">{selectedPunch.shiftName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[10px]">Reported Geo-Location</span>
                    <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-primary shrink-0" />
                      {selectedPunch.locationName}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-500" />{' '}
                    {selectedPunch.batteryLevel ? `${selectedPunch.batteryLevel}% battery` : 'Device AC'}
                  </span>
                  <span>Ping: {selectedPunch.lastSeen}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Employee Stream List */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Live Punch Feed ({filteredPunches.length})
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono">Realtime</span>
          </div>

          <div className="divide-y divide-border overflow-y-auto max-h-[500px]">
            {filteredPunches.map((punch) => {
              const isSelected = selectedPunch?.id === punch.id
              return (
                <div
                  key={punch.id}
                  onClick={() => setSelectedPunchId(punch.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between hover:bg-muted/40 ${
                    isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={punch.avatar}
                      alt={punch.employeeName}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div>
                      <h5 className="font-semibold text-xs text-foreground">{punch.employeeName}</h5>
                      <p className="text-[11px] text-muted-foreground">{punch.designation}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {punch.branch}
                        </span>
                        {punch.punchInTime && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            IN: {punch.punchInTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      punch.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : punch.status === 'Late'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : punch.status === 'On Visit'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : punch.status === 'On Leave'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                    }`}
                  >
                    {punch.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
