import React, { useState } from 'react'
import {
  FileEdit,
  Clock,
  Calendar,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Send,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ApprovalTimeline, ApprovalStep } from '@/components/common/ApprovalTimeline'
import { useAttendance } from '@/context/AttendanceContext'
import { useToast } from '@/context/ToastContext'

export const MobileRegularizationPage: React.FC = () => {
  const navigate = useNavigate()
  const { submitRegularization } = useAttendance()
  const { showToast } = useToast()

  const [date, setDate] = useState('2026-10-09')
  const [issueType, setIssueType] = useState<'Missed Punch In' | 'Missed Punch Out' | 'Both Punches Missed' | 'Biometric Device Glitch' | 'Wrong Punch Recorded'>('Missed Punch In')
  const [requestedInTime, setRequestedInTime] = useState('09:15')
  const [requestedOutTime, setRequestedOutTime] = useState('18:30')
  const [reason, setReason] = useState('')
  const [hasPhotoAttached, setHasPhotoAttached] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) {
      showToast('Please provide a reason for regularization', 'warning')
      return
    }

    submitRegularization({
      date,
      issueType,
      requestedInTime: `${requestedInTime} AM`,
      requestedOutTime: `${requestedOutTime} PM`,
      reason,
      attachmentName: hasPhotoAttached ? 'camera_entry_proof.jpg' : undefined,
    })

    showToast('Attendance regularization request submitted!', 'success')
    setIsSubmitted(true)
  }

  // Realistic multi-tier approval timeline
  const approvalSteps: ApprovalStep[] = [
    {
      id: 'step-1',
      title: 'Employee Submission',
      approverName: 'Aarav Sharma (You)',
      approverRole: 'Applicant',
      status: 'approved',
      timestamp: 'Today, 10:15 AM',
      comments: reason || 'Submitted regularisation request for missed biometric punch.',
    },
    {
      id: 'step-2',
      title: 'Reporting Manager Review',
      approverName: 'Vikram Malhotra',
      approverRole: 'Direct Supervisor / HOD',
      status: 'pending',
      comments: 'Pending manager verification against gate logs.',
    },
    {
      id: 'step-3',
      title: 'Plant HR / Attendance Desk',
      approverName: 'Sarah Jenkins',
      approverRole: 'HR Administrator',
      status: 'waiting',
      comments: 'Muster roll payroll sync sign-off.',
    },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader
        title="Attendance Regularization"
        subtitle="Correct missed or flawed biometric punches"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Info notice */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Regularization requests must be submitted within 3 days of the missed punch for muster roll payroll approval.
              </span>
            </div>

            {/* Date selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Issue Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Reason / Issue Type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as any)}
                className="w-full px-3.5 py-3 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="Missed Punch In">Missed Punch In (Morning)</option>
                <option value="Missed Punch Out">Missed Punch Out (Evening)</option>
                <option value="Both Punches Missed">Both Punches Missed (Full Day)</option>
                <option value="Biometric Device Glitch">Biometric Device Glitch / Sensor Error</option>
                <option value="Wrong Punch Recorded">Wrong Punch Time Recorded</option>
              </select>
            </div>

            {/* In / Out time inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Requested In Time
                </label>
                <input
                  type="time"
                  required
                  value={requestedInTime}
                  onChange={(e) => setRequestedInTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Requested Out Time
                </label>
                <input
                  type="time"
                  required
                  value={requestedOutTime}
                  onChange={(e) => setRequestedOutTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Justification Text */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Detailed Justification
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Turnstile gate queue was stuck during shift start..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Photo / Document Proof Attachment Simulator */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Attach Supporting Photo Proof (Optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  setHasPhotoAttached(!hasPhotoAttached)
                  showToast(hasPhotoAttached ? 'Photo removed' : 'Photo evidence captured from camera', 'info')
                }}
                className={`w-full py-3 px-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold transition ${
                  hasPhotoAttached
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>
                  {hasPhotoAttached ? '✓ entry_proof_photo.jpg attached' : 'Tap to snap photo or upload proof'}
                </span>
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full min-h-[48px] py-3.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Regularization Request</span>
              </button>
            </div>
          </form>
        ) : (
          /* Post-Submission Confirmation with ApprovalTimeline */
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-foreground">
                Request Forwarded for Approval
              </h3>
              <p className="text-xs text-muted-foreground">
                Reference ID: REG-2026-991 • {date} ({issueType})
              </p>
            </div>

            {/* Approval Workflow Timeline */}
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Approval Workflow Journey
              </h4>
              <ApprovalTimeline steps={approvalSteps} />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/employee/attendance')}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md transition"
              >
                Back to Attendance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
