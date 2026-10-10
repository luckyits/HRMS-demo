import React, { useState } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useOptionalModules,
  type AppraisalReviewCycle,
  type OkrGoalItem,
} from '@/context/OptionalModulesContext'
import {
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Flame,
  MessageSquare,
  Plus,
  Scale,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  User,
  Users,
} from 'lucide-react'

export const AdminPerformancePage: React.FC = () => {
  const {
    okrGoals,
    appraisalReviews,
    updateAppraisalReview,
    submit360Feedback,
  } = useOptionalModules()

  const [activeTab, setActiveTab] = useState<'appraisals' | 'okrs' | 'ninebox'>('appraisals')
  const [selectedReview, setSelectedReview] = useState<AppraisalReviewCycle | null>(null)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [managerRatingInput, setManagerRatingInput] = useState<number>(4.5)

  return (
    <FeatureGate feature="PERFORMANCE">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Target className="w-3 h-3" />
                PERFORMANCE & OKR ENGINE
              </span>
              <span className="text-xs text-slate-500">Self-Review, 360 Feedback & 9-Box Calibration</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Performance Appraisals & OKR Command Desk
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Set organizational and individual OKR weightages, manage multi-tier review cycles, gather peer 360-degree feedback, and conduct leadership calibration sessions.
            </p>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Active Review Cycle</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">Annual Appraisal 2026-27</div>
            <p className="text-xs text-slate-500 mt-1">Self + Manager + 360 Peer Evaluation</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">OKR Achievement Rate</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-indigo-600">85% Avg Progress</div>
            <p className="text-xs text-slate-500 mt-1">Across 3 core key results</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Calibrated Star Performers</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600">4.7 / 5.0 Rating</div>
            <p className="text-xs text-slate-500 mt-1">High Potential / Star tier in 9-Box</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">360 Feedback Responses</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">7 Peer Reviews</div>
            <p className="text-xs text-slate-500 mt-1">Anonymous multi-rater inputs recorded</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('appraisals')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'appraisals'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Appraisal Review Cycles ({appraisalReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('okrs')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'okrs'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Key Objectives & OKR Goals ({okrGoals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ninebox')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'ninebox'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>9-Box Talent Matrix Calibration</span>
          </button>
        </div>

        {/* TAB 1: APPRAISAL REVIEW CYCLES */}
        {activeTab === 'appraisals' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Workforce Appraisal Dossiers (Annual Cycle 2026-27)
                </h3>
                <span className="text-xs text-slate-500">Self-Review + Manager Evaluation + 360 Feedback</span>
              </div>

              <div className="space-y-4">
                {appraisalReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{rev.employeeName}</h4>
                          <span className="text-slate-400 font-mono">({rev.employeeId})</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                            {rev.nineBoxGridPosition}
                          </span>
                        </div>
                        <span className="text-slate-500">{rev.designation} • {rev.department}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px] uppercase">Final Calibrated Rating</span>
                          <span className="text-base font-bold text-emerald-600 font-mono">
                            ⭐ {rev.finalCalibratedScore} / 5.0
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                          {rev.status}
                        </span>
                      </div>
                    </div>

                    {/* Self vs Manager Comments */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                          <span>Self-Appraisal Statement</span>
                          <span className="text-indigo-600">Self Score: {rev.selfRating} / 5.0</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{rev.selfComments}</p>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                          <span>Reporting Manager Evaluation</span>
                          <span className="text-emerald-600">Manager Score: {rev.managerRating} / 5.0</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{rev.managerFeedback}</p>
                      </div>
                    </div>

                    {/* 360 Feedback count and action */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-purple-600 font-semibold">
                        <MessageSquare className="w-4 h-4" />
                        <span>{rev.feedback360Count} Peer Reviews Completed (360 Degree Feedback)</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedReview(rev)
                          setFeedbackInput('')
                        }}
                        className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add 360 Peer Feedback</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: KEY OBJECTIVES & OKR GOALS */}
        {activeTab === 'okrs' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active OKR Objective Goals</h3>
              <p className="text-xs text-slate-500 mt-0.5">Key results tied to quarterly business milestones and individual OKRs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {okrGoals.map((okr) => (
                <div
                  key={okr.id}
                  className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                      {okr.category}
                    </span>
                    <span className="text-slate-400 font-bold">Weight: {okr.weightagePct}%</span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{okr.title}</h4>
                  <div className="text-slate-500">Target Metric: <strong>{okr.targetMetric}</strong></div>

                  <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between font-semibold">
                      <span>Goal Completion Progress</span>
                      <span className="text-emerald-600 font-bold">{okr.currentProgressPct}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${okr.currentProgressPct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 9-BOX TALENT MATRIX */}
        {activeTab === 'ninebox' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">9-Box Leadership Talent Calibration Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">Potential vs Performance matrix for succession planning and talent calibration.</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-2">
                <div className="font-bold text-emerald-800 dark:text-emerald-300">⭐ High Potential - Star</div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs font-bold text-slate-900 dark:text-white">
                  Priya Sharma (Field Sales)
                </div>
              </div>

              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-300 dark:border-indigo-800 space-y-2">
                <div className="font-bold text-indigo-800 dark:text-indigo-300">🚀 High Performer</div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs font-bold text-slate-900 dark:text-white">
                  Rohan Mehta (Engineering)
                </div>
              </div>

              <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-300 dark:border-blue-800 space-y-2">
                <div className="font-bold text-blue-800 dark:text-blue-300">💎 High Potential - Enigma</div>
                <div className="text-slate-400 italic text-[11px]">No active placements</div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300">Core Performer</div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-2xs font-bold text-slate-900 dark:text-white">
                  Deepak Patel (Manufacturing)
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-700 dark:text-slate-300">Effective Performer</div>
                <div className="text-slate-400 italic text-[11px]">Placement ready</div>
              </div>

              <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-300 dark:border-amber-800 space-y-2">
                <div className="font-bold text-amber-800 dark:text-amber-300">Growth Needed / Training</div>
                <div className="text-slate-400 italic text-[11px]">Under performance review</div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD 360 FEEDBACK */}
        {selectedReview && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Submit 360-Degree Peer Feedback for {selectedReview.employeeName}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Qualitative Peer Observations</label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback on collaboration, domain expertise, and leadership..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedReview(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      submit360Feedback(selectedReview.id, feedbackInput, 5)
                      setSelectedReview(null)
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
                  >
                    Submit 360 Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}

export default AdminPerformancePage
