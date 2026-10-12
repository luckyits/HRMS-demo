import React, { useState, useMemo } from 'react'
import {
  Clock,
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Building,
  MapPin,
  AlertTriangle,
  Check,
  X,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Send,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import { useEmployees } from '@/context/EmployeeContext'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { AuditLogService } from '@/services/auditLogService'
import type { SuspiciousPunchItem } from '@/mock/adminAttendance'

export const MobileHrAttendancePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') === 'suspicious' ? 'suspicious' : 'live'

  const [activeMainTab, setActiveMainTab] = useState<'live' | 'suspicious'>(initialTab)
  const [selectedBranch, setSelectedBranch] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  const { settings } = useDemo()
  const { employees } = useEmployees()
  const {
    livePunches,
    suspiciousPunches,
    acceptSuspiciousPunch,
    rejectSuspiciousPunch,
    requestExplanation,
    refreshLivePunches,
    isLiveRefreshing,
  } = useAdminAttendance()
  const { showToast } = useToast()

  // Modal states for Suspicious Actions
  const [explainingPunch, setExplainingPunch] = useState<SuspiciousPunchItem | null>(null)
  const [explanationNote, setExplanationNote] = useState('')

  const isBranchHr = settings.role === 'Branch HR'
  const activeBranch = settings.currentUser.branch || 'Mumbai Branch'

  // Branch list
  const branches = [
    'All',
    'Bengaluru HQ',
    'Mumbai Branch',
    'Pune Dev Center',
    'Field Sales',
  ]

  // Filter scoped punches
  const scopedPunches = useMemo(() => {
    return livePunches.filter((p) => {
      if (isBranchHr) {
        return p.branch?.toLowerCase() === activeBranch.toLowerCase()
      }
      if (selectedBranch !== 'All') {
        return p.branch?.toLowerCase().includes(selectedBranch.toLowerCase().split(' ')[0])
      }
      return true
    })
  }, [livePunches, isBranchHr, activeBranch, selectedBranch])

  // Filter scoped suspicious
  const scopedSuspicious = useMemo(() => {
    return suspiciousPunches.filter((s) => {
      if (isBranchHr) {
        const emp = employees.find((e) => e.id === s.employeeId)
        return emp?.branch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [suspiciousPunches, isBranchHr, activeBranch, employees])

  // Branch statistics
  const branchCounts = useMemo(() => {
    const counts: Record<string, { present: number; total: number }> = {
      'Bengaluru HQ': { present: 18, total: 22 },
      'Mumbai Branch': { present: 12, total: 14 },
      'Pune Dev Center': { present: 8, total: 10 },
      'Field Sales': { present: 6, total: 8 },
    }
    return counts
  }, [])

  // Filtered live list by search and status
  const filteredLiveList = useMemo(() => {
    return scopedPunches.filter((p) => {
      const matchSearch =
        p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false

      if (selectedStatus === 'All') return true
      if (selectedStatus === 'Present') return p.status === 'Present' || p.status === 'Late'
      if (selectedStatus === 'Late') return p.status === 'Late'
      if (selectedStatus === 'Outside Fence') return p.status === 'On Visit' || Boolean(p.isOffline)
      return p.status.toLowerCase() === selectedStatus.toLowerCase()
    })
  }, [scopedPunches, searchQuery, selectedStatus])

  // Suspicious actions
  const handleAcceptSuspicious = (punch: SuspiciousPunchItem) => {
    acceptSuspiciousPunch(punch.id, 'HR verified on-site field validation')

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Suspicious Punch Accepted',
      module: 'Attendance',
      targetType: 'Punch',
      targetId: punch.id,
      targetName: `${punch.employeeName} (${punch.timestamp})`,
      featureCode: 'PUNCH',
      beforeValue: `Flagged (${punch.flags.join(', ')})`,
      afterValue: 'Accepted & Verified',
      reason: 'Biometric and field discrepancy cleared by HR verification',
    })

    showToast({
      type: 'success',
      title: 'Punch Accepted',
      message: `Punch for ${punch.employeeName} marked as valid.`,
    })
  }

  const handleRejectSuspicious = (punch: SuspiciousPunchItem) => {
    rejectSuspiciousPunch(punch.id, 'Unverified location mismatch')

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Suspicious Punch Rejected',
      module: 'Attendance',
      targetType: 'Punch',
      targetId: punch.id,
      targetName: `${punch.employeeName} (${punch.timestamp})`,
      featureCode: 'PUNCH',
      beforeValue: `Flagged (${punch.flags.join(', ')})`,
      afterValue: 'Rejected & Void',
      reason: 'Rejected due to failed geofence / spoofing check',
    })

    showToast({
      type: 'info',
      title: 'Punch Rejected',
      message: `Flagged punch for ${punch.employeeName} has been voided.`,
    })
  }

  const handleSendExplanationRequest = () => {
    if (!explainingPunch) return
    requestExplanation(explainingPunch.id)

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Punch Explanation Requested',
      module: 'Attendance',
      targetType: 'Punch',
      targetId: explainingPunch.id,
      targetName: explainingPunch.employeeName,
      featureCode: 'PUNCH',
      beforeValue: 'Flagged',
      afterValue: 'Explanation Requested',
      reason: explanationNote || 'HR requested reason for geofence/time mismatch',
    })

    showToast({
      type: 'info',
      title: 'Explanation Requested',
      message: `A notification has been sent to ${explainingPunch.employeeName} to explain this punch.`,
    })

    setExplainingPunch(null)
    setExplanationNote('')
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="Live Attendance Desk"
        subtitle={isBranchHr ? activeBranch : 'All Organization Branches'}
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      {/* Top Main Segmented Toggle */}
      <div className="p-3 bg-card border-b border-border">
        <div className="flex p-1 bg-muted rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveMainTab('live')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeMainTab === 'live'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Live Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainTab('suspicious')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeMainTab === 'suspicious'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Suspicious Punches</span>
            {scopedSuspicious.filter((s) => s.status === 'Pending Review').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-white text-rose-600">
                {scopedSuspicious.filter((s) => s.status === 'Pending Review').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE ATTENDANCE */}
      {activeMainTab === 'live' && (
        <div className="flex-1 flex flex-col space-y-3 p-4">
          {/* Branch Counts Pills (Only if not single branch) */}
          {!isBranchHr && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Attendance by Branch
              </span>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                {Object.entries(branchCounts).map(([branchName, stats]) => {
                  const isSelected = selectedBranch === branchName
                  return (
                    <button
                      key={branchName}
                      type="button"
                      onClick={() =>
                        setSelectedBranch(isSelected ? 'All' : branchName)
                      }
                      className={`shrink-0 p-2.5 rounded-2xl border text-left transition ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-card border-border hover:border-primary/30 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Building className="w-3 h-3" />
                        <span className="truncate">{branchName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black">
                          {stats.present}/{stats.total} In
                        </span>
                        <span className="text-[10px] opacity-80">
                          ({Math.round((stats.present / stats.total) * 100)}%)
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Search Bar & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff, code or team..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={refreshLivePunches}
              disabled={isLiveRefreshing}
              className="p-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted active:scale-95 transition"
              title="Refresh Live Muster"
            >
              <RefreshCw className={`w-4 h-4 ${isLiveRefreshing ? 'animate-spin text-primary' : ''}`} />
            </button>
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {['All', 'Present', 'Late', 'Outside Fence', 'On Leave', 'Absent'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition ${
                  selectedStatus === st
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Employee Punches List */}
          <div className="space-y-2.5 flex-1">
            {filteredLiveList.length === 0 ? (
              <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
                <p className="text-xs text-muted-foreground">
                  No attendance records found matching filters.
                </p>
              </div>
            ) : (
              filteredLiveList.map((punch) => {
                const isLate = punch.status === 'Late'
                const isPresent = punch.status === 'Late' || punch.status === 'Present'

                return (
                  <div
                    key={punch.employeeId}
                    className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={punch.avatar}
                        alt={punch.employeeName}
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {punch.employeeName}
                          </h4>
                          <span className="text-[10px] text-muted-foreground">
                            {punch.employeeId}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {punch.department} • {punch.shiftName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">
                            {punch.locationName || 'Branch Office'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isLate
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : isPresent
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {punch.status}
                      </span>
                      <p className="text-xs font-black text-foreground mt-1">
                        {punch.punchInTime || '—'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {punch.lastSeen}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUSPICIOUS PUNCHES REVIEW */}
      {activeMainTab === 'suspicious' && (
        <div className="flex-1 p-4 space-y-3">
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-950 dark:text-rose-200 flex items-center justify-between">
            <div>
              <p className="font-bold">Automated Integrity Monitor</p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                AI and location engine flagged {scopedSuspicious.length} punch anomalies.
              </p>
            </div>
            <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
          </div>

          {scopedSuspicious.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-foreground">Clean Biometric Records!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                No suspicious punch activities requiring HR intervention.
              </p>
            </div>
          ) : (
            scopedSuspicious.map((punch) => {
              const isPending = punch.status === 'Pending Review'

              return (
                <div
                  key={punch.id}
                  className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {punch.punchType}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">
                          {punch.employeeName}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {punch.department} • {punch.timestamp}
                        </p>
                        <span className="text-[10px] text-primary font-semibold">
                          Branch: {punch.branch || 'Headquarters'}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isPending
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : punch.status === 'Accepted'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {punch.status}
                    </span>
                  </div>

                  {/* Risk Flags Badges */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">
                      Anomalies Detected:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {punch.flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-500" />
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Geolocation Details */}
                  {punch.coordinates && (
                    <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Reported Coords:</span>
                        <span className="font-mono text-foreground">
                          {punch.coordinates.lat.toFixed(4)}, {punch.coordinates.lng.toFixed(4)}
                        </span>
                      </div>
                      {punch.faceMatchScore !== undefined && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Biometric Match:</span>
                          <span className="font-bold text-foreground">{punch.faceMatchScore}%</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons: Accept / Reject / Request Explanation */}
                  {isPending && (
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
                      <button
                        type="button"
                        onClick={() => handleAcceptSuspicious(punch)}
                        className="py-2 px-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 hover:bg-emerald-700 active:scale-95 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRejectSuspicious(punch)}
                        className="py-2 px-2.5 rounded-xl border border-rose-500 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-1 hover:bg-rose-500/10 active:scale-95 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setExplainingPunch(punch)
                          setExplanationNote('')
                        }}
                        className="py-2 px-2 rounded-xl bg-card border border-border text-foreground font-bold text-xs flex items-center justify-center gap-1 hover:bg-muted active:scale-95 transition"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Explain</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Request Explanation Sheet */}
      <BottomSheet
        isOpen={Boolean(explainingPunch)}
        onClose={() => {
          setExplainingPunch(null)
          setExplanationNote('')
        }}
        title="Request Punch Explanation"
      >
        {explainingPunch && (
          <div className="space-y-4 pb-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 dark:text-amber-200">
              Asking <strong>{explainingPunch.employeeName}</strong> to justify the punch taken at {explainingPunch.timestamp} ({explainingPunch.flags.join(', ')}).
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Inquiry Message to Employee
              </label>
              <textarea
                value={explanationNote}
                onChange={(e) => setExplanationNote(e.target.value)}
                placeholder="e.g. Please clarify why you punched in from outside the designated geofence zone..."
                rows={3}
                className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExplainingPunch(null)}
                className="py-3 px-4 rounded-xl border border-border text-foreground font-bold text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendExplanationRequest}
                className="py-3 px-4 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 active:scale-95 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
