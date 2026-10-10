import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import type { SuspiciousFlag, SuspiciousPunchItem } from '@/mock/adminAttendance'
import {
  AlertTriangle,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  ExternalLink,
  Smartphone,
  Wifi,
  Search,
  Filter,
  Camera,
  ScanFace,
  Check,
  Building,
} from 'lucide-react'

export const SuspiciousPunchReviewPage: React.FC = () => {
  const {
    suspiciousPunches,
    acceptSuspiciousPunch,
    rejectSuspiciousPunch,
    requestExplanation,
  } = useAdminAttendance()

  const [selectedPunch, setSelectedPunch] = useState<SuspiciousPunchItem | null>(
    suspiciousPunches[0] || null
  )
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const filteredPunches = suspiciousPunches.filter((p) => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Pending') return p.status === 'Pending Review'
    if (activeFilter === 'Accepted') return p.status === 'Accepted'
    if (activeFilter === 'Rejected') return p.status === 'Rejected'
    return p.flags.includes(activeFilter as SuspiciousFlag)
  })

  const pendingCount = suspiciousPunches.filter((p) => p.status === 'Pending Review').length

  const handleAccept = (item: SuspiciousPunchItem) => {
    acceptSuspiciousPunch(item.id, 'Verified as legitimate punch by HR administrator')
    setToastMessage(`Accepted punch for ${item.employeeName}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPunch || !rejectReason.trim()) return

    rejectSuspiciousPunch(selectedPunch.id, rejectReason.trim())
    setShowRejectModal(false)
    setRejectReason('')
    setToastMessage(`Flagged punch rejected for ${selectedPunch.employeeName}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleRequestExplanation = (item: SuspiciousPunchItem) => {
    requestExplanation(item.id)
    setToastMessage(`Explanation notice sent to ${item.employeeName}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const getFlagBadge = (flag: SuspiciousFlag) => {
    switch (flag) {
      case 'Mock location':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Mock Location
          </span>
        )
      case 'Outside fence':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Outside Fence
          </span>
        )
      case 'Low face score':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Low Face Match
          </span>
        )
      case 'Offline':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Offline Stored
          </span>
        )
      case 'Time mismatch':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            Time Mismatch
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Suspicious Punch & Anti-Fraud Security"
        subtitle="Review anomalies flagged by GPS spoofing detectors, geofence breaches, and AI face mismatch engines"
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-card border border-border p-2 rounded-xl">
        {[
          'All',
          'Pending',
          'Mock location',
          'Outside fence',
          'Low face score',
          'Offline',
          'Time mismatch',
          'Accepted',
          'Rejected',
        ].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeFilter === f
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Master Review Layout: Table on left, Detail Drawer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Flagged Punches List */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Flagged Incidents ({filteredPunches.length})
            </h4>
            <span className="text-xs text-muted-foreground">Select to inspect evidence</span>
          </div>

          <div className="divide-y divide-border overflow-y-auto max-h-[620px]">
            {filteredPunches.map((punch) => {
              const isSelected = selectedPunch?.id === punch.id
              const isPending = punch.status === 'Pending Review'

              return (
                <div
                  key={punch.id}
                  onClick={() => setSelectedPunch(punch)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/30 ${
                    isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={punch.avatar}
                        alt={punch.employeeName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-xs text-foreground">{punch.employeeName}</h5>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {punch.employeeId}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {punch.department} &bull; {punch.branch}
                        </p>
                      </div>
                    </div>

                    {/* Risk Score Pill */}
                    <div className="flex flex-col items-end">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          punch.riskScore >= 80
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                            : punch.riskScore >= 60
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                        }`}
                      >
                        {punch.riskScore}% RISK
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {punch.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-muted-foreground mr-1">Flags:</span>
                    {punch.flags.map((flag) => (
                      <span key={flag}>{getFlagBadge(flag)}</span>
                    ))}
                  </div>

                  {/* Status Banner */}
                  <div className="mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">
                      Status: <strong className="text-foreground">{punch.status}</strong>
                    </span>
                    <span className="text-primary font-medium hover:underline flex items-center gap-0.5">
                      Inspect Evidence &rarr;
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed Evidence Drawer / Inspection Panel */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 shadow-sm space-y-5">
          {selectedPunch ? (
            <>
              <div className="flex items-start justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                    Incident Case #{selectedPunch.id}
                  </span>
                  <h4 className="font-bold text-base text-foreground mt-0.5">
                    {selectedPunch.employeeName}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Punch {selectedPunch.punchType} &bull; {selectedPunch.timestamp}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {selectedPunch.riskScore}%
                  </div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Composite Risk Score
                  </span>
                </div>
              </div>

              {/* Captured Selfie Evidence */}
              <div>
                <label className="text-xs font-bold text-foreground block mb-2 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-primary" /> Captured Punch Selfie Verification
                </label>
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-border h-48 flex items-center justify-center">
                  <img
                    src={selectedPunch.selfieUrl}
                    alt="Captured punch selfie"
                    className="w-full h-full object-cover"
                  />
                  {/* Facial AI Bounding Box overlay */}
                  <div className="absolute inset-x-16 inset-y-6 border-2 border-dashed border-emerald-400 rounded-xl flex items-end justify-between p-2 pointer-events-none bg-emerald-500/10">
                    <span className="text-[10px] font-bold bg-slate-900/90 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                      Face Score: {selectedPunch.faceMatchScore}%
                    </span>
                    <span className="text-[10px] font-bold bg-slate-900/90 text-white px-1.5 py-0.5 rounded font-mono">
                      Liveness: PASS
                    </span>
                  </div>
                </div>
              </div>

              {/* GPS Discrepancy Map simulation */}
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-rose-500" /> GPS Discrepancy
                  </span>
                  <span className="text-rose-600 font-extrabold">
                    {selectedPunch.distanceFromFenceMeters}m from boundary
                  </span>
                </div>

                <div className="h-24 bg-slate-950 rounded-lg relative overflow-hidden flex items-center justify-center border border-slate-800">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle, #38bdf8 1px, transparent 1px), linear-gradient(to right, #334155 1px, transparent 1px)',
                      backgroundSize: '16px 16px, 32px 32px',
                    }}
                  />
                  {/* Branch center marker */}
                  <div className="flex items-center gap-1 text-[10px] bg-sky-950 text-sky-300 border border-sky-700 px-2 py-1 rounded-md z-10">
                    <Building className="w-3 h-3" /> Branch Fence Center
                  </div>
                  {/* Distance line */}
                  <div className="w-20 border-t-2 border-dashed border-rose-500 mx-2 z-10 relative">
                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-rose-400 font-mono whitespace-nowrap">
                      {selectedPunch.distanceFromFenceMeters}m
                    </span>
                  </div>
                  {/* Punch actual marker */}
                  <div className="flex items-center gap-1 text-[10px] bg-rose-950 text-rose-300 border border-rose-700 px-2 py-1 rounded-md z-10">
                    <MapPin className="w-3 h-3 text-rose-400" /> Device Location
                  </div>
                </div>
              </div>

              {/* Hardware & Telemetry Fingerprint */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-card border border-border rounded-xl">
                  <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> Device Model
                  </span>
                  <span className="font-semibold text-foreground text-xs block mt-0.5">
                    {selectedPunch.deviceModel}
                  </span>
                </div>

                <div className="p-3 bg-card border border-border rounded-xl">
                  <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Network IP
                  </span>
                  <span className="font-mono text-foreground text-xs block mt-0.5">
                    {selectedPunch.ipAddress}
                  </span>
                </div>

                {selectedPunch.mockProviderDetected && (
                  <div className="col-span-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-300">
                    <span className="font-bold text-[10px] uppercase block">
                      Spoofing Engine Intercepted:
                    </span>
                    <span className="font-mono text-xs">{selectedPunch.mockProviderDetected}</span>
                  </div>
                )}
              </div>

              {/* Employee Explanation */}
              {selectedPunch.explanation && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-0.5">
                    Employee Explanation:
                  </span>
                  <p className="text-amber-800 dark:text-amber-400">
                    &ldquo;{selectedPunch.explanation}&rdquo;
                  </p>
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAccept(selectedPunch)}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Punch</span>
                  </button>

                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <X className="w-4 h-4" />
                    <span>Reject Punch</span>
                  </button>
                </div>

                <button
                  onClick={() => handleRequestExplanation(selectedPunch)}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4 text-amber-500" />
                  <span>Request Employee Explanation</span>
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Select a suspicious punch from the left panel to examine evidence.
            </div>
          )}
        </div>
      </div>

      {/* Reject Confirmation Modal */}
      {showRejectModal && selectedPunch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowRejectModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Reject Suspicious Punch</h4>
                <p className="text-xs text-muted-foreground">
                  Case #{selectedPunch.id} &bull; {selectedPunch.employeeName}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Rejection Reason for Audit Log <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Third-party mock location provider detected, employee was not physically present at office..."
                  className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-medium border border-border rounded-xl hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
