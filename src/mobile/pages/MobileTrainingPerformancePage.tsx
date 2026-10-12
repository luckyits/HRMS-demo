import React, { useState } from 'react'
import {
  GraduationCap,
  Target,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Star,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  BookOpen
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import {
  useOptionalModules,
  type TrainingCourseItem,
  type OkrGoalItem,
  type AppraisalReviewCycle,
} from '@/context/OptionalModulesContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'

export const MobileTrainingPerformancePage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const {
    courses,
    certifications,
    enrollInCourse,
    okrGoals,
    appraisalReviews,
    updateAppraisalReview,
  } = useOptionalModules()
  const { showToast } = useToast()

  const hasTraining = hasFeature('TRAINING')
  const hasPerformance = hasFeature('PERFORMANCE')

  // Tab: 'training' | 'performance'
  const [activeTab, setActiveTab] = useState<'training' | 'performance'>(
    hasTraining ? 'training' : 'performance'
  )

  // Appraisal Self-Review Modal State
  const [selectedReviewForEdit, setSelectedReviewForEdit] = useState<AppraisalReviewCycle | null>(null)
  const [selfRating, setSelfRating] = useState(4)
  const [selfComments, setSelfComments] = useState(
    'Delivered critical modules on schedule, maintained zero downtime.'
  )

  if (!hasTraining && !hasPerformance) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Growth & Learning" subtitle="L&D & Appraisals" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <GraduationCap className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Training and performance appraisal modules are disabled for your profile.</p>
        </div>
      </div>
    )
  }

  // Active appraisal record
  const currentAppraisal =
    appraisalReviews.find((r) => r.employeeId === currentEmployee.id) || appraisalReviews[0]

  const handleSaveSelfReview = () => {
    if (!currentAppraisal) return
    updateAppraisalReview(currentAppraisal.id, {
      selfRating,
      selfComments,
      status: 'Submitted for Manager Rating',
    })
    showToast('Self-appraisal review submitted to reporting manager!', 'success')
    setSelectedReviewForEdit(null)
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Learning & Performance"
        subtitle={activeTab === 'training' ? 'Safety & LMS Courses' : 'OKRs & Annual Review'}
      />

      {/* Segmented Selector (if both are accessible) */}
      {hasTraining && hasPerformance && (
        <div className="px-4 pt-2">
          <div className="p-1 rounded-2xl bg-muted/60 border border-border flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('training')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'training'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Training ({courses.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('performance')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'performance'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Performance</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'training' && hasTraining ? (
        /* Training & Certifications View */
        <div className="p-4 space-y-4 animate-in fade-in duration-200">
          {/* Certificate Expiry Warning Banner */}
          {certifications.some((c) => c.status === 'Expiring in <30d') && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">Certification Renewal Due</span>
                <span className="text-[11px] opacity-90">
                  Fire safety certificate expires within 30 days. Complete renewal course.
                </span>
              </div>
            </div>
          )}

          {/* Courses List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Assigned Courses & Compliance LMS
            </h4>

            <div className="space-y-2.5">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {course.isMandatory && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase">
                            Mandatory Safety
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {course.category}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-foreground mt-1">
                        {course.courseTitle}
                      </h5>
                    </div>

                    <span className="text-[10px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.durationHours}h
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground">
                      Format: {course.format}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        enrollInCourse(course.id)
                        showToast(`Course launched in LMS viewer!`, 'success')
                      }}
                      className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs active:scale-95 transition"
                    >
                      Start Module
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Performance & Goals View */
        <div className="p-4 space-y-4 animate-in fade-in duration-200">
          {/* Annual Appraisal Card */}
          {currentAppraisal && (
            <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Appraisal Cycle
                  </span>
                  <h4 className="text-sm font-black text-foreground">
                    {currentAppraisal.cycleName}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Status: {currentAppraisal.status}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Self Rating</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs justify-end">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{currentAppraisal.selfRating} / 5</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setSelfRating(currentAppraisal.selfRating || 4)
                    setSelfComments(currentAppraisal.selfComments || '')
                    setSelectedReviewForEdit(currentAppraisal)
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs active:scale-95 transition"
                >
                  Edit Self-Evaluation Review
                </button>
              </div>
            </div>
          )}

          {/* OKR Goals List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Active Goals & OKRs ({okrGoals.length})
            </h4>

            <div className="space-y-2.5">
              {okrGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {goal.category} • Weightage: {goal.weightagePct}%
                      </span>
                      <h5 className="text-xs font-bold text-foreground mt-0.5">
                        {goal.title}
                      </h5>
                    </div>

                    <span className="text-xs font-black text-primary">
                      {goal.currentProgressPct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${goal.currentProgressPct}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-muted-foreground block">
                    Target Metric: {goal.targetMetric}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Self-Review Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedReviewForEdit)}
        onClose={() => setSelectedReviewForEdit(null)}
        title="Self-Evaluation Appraisal"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground block mb-2">
              Self-Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelfRating(star)}
                  className="p-2 transition active:scale-90"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= selfRating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-foreground ml-2">
                {selfRating} / 5
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Self-Reflection & Achievements
            </label>
            <textarea
              rows={3}
              value={selfComments}
              onChange={(e) => setSelfComments(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveSelfReview}
            className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-[0.99] transition"
          >
            Submit Self Review
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
