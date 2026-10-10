import React, { useState, useMemo } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import { useLifecycle, ResignationRequest } from '@/context/LifecycleContext'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import {
  UserMinus,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Send,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react'

export const ManagerResignationsPage: React.FC = () => {
  const { resignations, managerActionResignation } = useLifecycle()

  // Review Modal State
  const [selectedResignation, setSelectedResignation] = useState<ResignationRequest | null>(null)
  const [retentionNote, setRetentionNote] = useState('')
  const [recommendedLwd, setRecommendedLwd] = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'pending' | 'all'>('pending')

  // Filter team resignations
  const teamResignations = useMemo(() => {
    if (activeFilter === 'pending') {
      return resignations.filter((r) => r.status === 'Pending Manager Review')
    }
    return resignations
  }, [resignations, activeFilter])

  // Open Review Modal
  const handleOpenReview = (res: ResignationRequest) => {
    setSelectedResignation(res)
    setRetentionNote(res.managerRetentionNote || '')
    setRecommendedLwd(res.requestedLwd || res.calculatedLwd)
    setReviewError(null)
  }

  // Handle Action Submit
  const handleAction = (action: 'Approve' | 'Reject' | 'Retain') => {
    if (!selectedResignation) return

    if (!retentionNote.trim()) {
      setReviewError('Please record notes regarding your 1-on-1 retention discussion with the employee.')
      return
    }

    managerActionResignation(selectedResignation.id, action, retentionNote, recommendedLwd)
    setSelectedResignation(null)
    setRetentionNote('')
  }

  return (
    <FeatureGate feature="RESIGNATION">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <UserMinus className="w-3 h-3" />
                MANAGER MSS REVIEW
              </span>
              <span className="text-xs text-slate-500">Separation Governance</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Team Resignations & Retention Desk
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review subordinate resignation notices, document 1-on-1 retention counseling, and endorse transition timelines.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveFilter('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'pending'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Action Required ({resignations.filter((r) => r.status === 'Pending Manager Review').length})
            </button>
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Team Exits ({resignations.length})
            </button>
          </div>
        </div>

        {/* Resignation Cards List */}
        {teamResignations.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Pending Resignations
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              All subordinate resignation requests have been reviewed and forwarded to HR operations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {teamResignations.map((res) => (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:border-purple-400/50 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <img
                      src={res.employeeAvatar}
                      alt={res.employeeName}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-400">{res.requestId}</span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          {res.employeeName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            res.status === 'Pending Manager Review'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 animate-pulse'
                              : res.status === 'Exit Clearance'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400'
                          }`}
                        >
                          {res.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {res.designation} • {res.department} • Notice: <strong>{res.noticePeriodDays} Days</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:text-right">
                    <div>
                      <div className="text-xs text-slate-400">Standard LWD</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {res.calculatedLwd}
                      </div>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                      <div className="text-xs text-slate-400">Requested LWD</div>
                      <div className="text-sm font-bold text-purple-600">
                        {res.requestedLwd}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenReview(res)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <span>Review & Endorse</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stated Reason & Handover Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Stated Reason: {res.reasonCategory}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">{res.reasonDetails}</p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Proposed Handover Plan
                    </span>
                    <p className="text-slate-600 dark:text-slate-400">{res.handoverPlan}</p>
                  </div>
                </div>

                {/* Embedded Approval Timeline */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <ApprovalTimeline steps={res.steps} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: MANAGER RETENTION REVIEW & ENDORSEMENT */}
        {selectedResignation && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedResignation.employeeAvatar}
                    alt={selectedResignation.employeeName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Manager Resignation Action — {selectedResignation.employeeName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Request ID: {selectedResignation.requestId} • Notice: {selectedResignation.noticePeriodDays} Days
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResignation(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {reviewError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{reviewError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Employee Stated Reason: {selectedResignation.reasonCategory}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">{selectedResignation.reasonDetails}</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Manager Retention Discussion Notes * (Mandatory for HR Governance)
                  </label>
                  <textarea
                    rows={3}
                    value={retentionNote}
                    onChange={(e) => setRetentionNote(e.target.value)}
                    placeholder="Document your conversation regarding retention options (role change, project swap, compensation, work-life flexibility)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Recommended Last Working Day (LWD)
                  </label>
                  <input
                    type="date"
                    value={recommendedLwd}
                    onChange={(e) => setRecommendedLwd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Calculated Standard LWD: {selectedResignation.calculatedLwd}. Early release will be sent to HR for buyout assessment.
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleAction('Retain')}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Employee Retained (Withdraw Notice)
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedResignation(null)}
                      className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('Approve')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Endorse & Forward to HR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
