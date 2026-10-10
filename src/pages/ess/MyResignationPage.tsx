import React, { useState, useMemo } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import { useLifecycle, ResignationRequest } from '@/context/LifecycleContext'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import {
  UserMinus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  RotateCcw,
  CheckSquare,
  Send,
  Upload,
  ShieldAlert,
  Info,
  Laptop,
  Briefcase
} from 'lucide-react'

export const MyResignationPage: React.FC = () => {
  const { resignations, submitResignation, withdrawResignation } = useLifecycle()

  // Current logged in employee mock context (Priya Sharma - Grade L2 / 18m service)
  const currentEmployee = {
    id: 'EMP-104',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    grade: 'L2',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    doj: '2025-04-01',
    noticePeriodDays: 60,
  }

  // Active resignation for this employee
  const myResignation = useMemo(() => {
    return resignations.find(
      (r) =>
        r.employeeId === currentEmployee.id &&
        r.status !== 'Withdrawn' &&
        r.status !== 'Rejected'
    )
  }, [resignations, currentEmployee.id])

  // New Resignation Form State
  const [reasonCat, setReasonCat] = useState<ResignationRequest['reasonCategory']>(
    'Career Growth / Higher Studies'
  )
  const [reasonDetails, setReasonDetails] = useState('')
  const [handoverPlan, setHandoverPlan] = useState('')
  const [requestedLwd, setRequestedLwd] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Exit Tasks Interactive State
  const [completedExitTasks, setCompletedExitTasks] = useState<Record<string, boolean>>({
    task1: true,
    task2: false,
    task3: false,
    task4: true,
  })

  // Calculate default LWD
  const defaultLwdDate = useMemo(() => {
    const today = new Date()
    const target = new Date(today.getTime() + currentEmployee.noticePeriodDays * 24 * 60 * 60 * 1000)
    return target.toISOString().split('T')[0]
  }, [currentEmployee.noticePeriodDays])

  // Handle Resignation Submit
  const handleSubmitResignation = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reasonDetails.trim()) {
      setFormError('Please enter detailed reasons for your resignation.')
      return
    }
    if (!handoverPlan.trim()) {
      setFormError('Please outline your proposed knowledge transfer & handover plan.')
      return
    }

    submitResignation({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      employeeGrade: currentEmployee.grade,
      department: currentEmployee.department,
      designation: currentEmployee.designation,
      doj: currentEmployee.doj,
      noticePeriodDays: currentEmployee.noticePeriodDays,
      requestedLwd: requestedLwd || defaultLwdDate,
      reasonCategory: reasonCat,
      reasonDetails,
      handoverPlan,
    })

    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 5000)
  }

  // Handle Resignation Withdrawal
  const handleWithdraw = () => {
    if (!myResignation) return
    if (window.confirm('Are you sure you want to withdraw your resignation request?')) {
      withdrawResignation(myResignation.id)
    }
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
                SEPARATION & EXIT PORTAL
              </span>
              <span className="text-xs text-slate-500">
                Notice Period: <strong>{currentEmployee.noticePeriodDays} Days</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Resignation & Exit Formalities
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Submit formal resignation notice, track multi-level approvals, monitor exit clearances, and coordinate handover tasks.
            </p>
          </div>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  Resignation Notice Submitted
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Your formal notice has been dispatched to your reporting manager for 1-on-1 retention discussion.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-xs text-emerald-700 font-medium px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* If Active Resignation Exists */}
        {myResignation ? (
          <div className="space-y-6">
            {/* Active Resignation Summary Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                    <UserMinus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        {myResignation.requestId}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Active Resignation Request
                      </h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          myResignation.status === 'Exit Clearance'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                            : myResignation.status === 'Serving Notice'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {myResignation.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied on {myResignation.applyDate} • Notice Period: {myResignation.noticePeriodDays} Days
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {myResignation.status !== 'Exit Clearance' && myResignation.status !== 'Settled & Relieved' && (
                    <button
                      onClick={handleWithdraw}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Withdraw Resignation
                    </button>
                  )}
                </div>
              </div>

              {/* Date Milestones Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">Notice Period Duration</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {myResignation.noticePeriodDays} Days
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">As per employment agreement</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Calculated Contractual LWD</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {myResignation.calculatedLwd}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Full notice serving date</span>
                </div>

                <div>
                  <span className="text-slate-400 block">Requested Release Date</span>
                  <span className="text-base font-bold text-purple-600">
                    {myResignation.requestedLwd}
                  </span>
                  <span className="text-[11px] text-purple-400 block mt-0.5">Subject to manager endorsement</span>
                </div>
              </div>

              {/* Stated Reason & Handover Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Stated Reason: {myResignation.reasonCategory}
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {myResignation.reasonDetails}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Knowledge Transfer & Handover Plan
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {myResignation.handoverPlan}
                  </p>
                </div>
              </div>

              {/* Approval Workflow Progress */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Workflow Approval Timeline
                </span>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <ApprovalTimeline steps={myResignation.steps} />
                </div>
              </div>
            </div>

            {/* Employee Exit Checklist Tasks */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Separation Handover & Exit Tasks Checklist
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete all tasks prior to your confirmed Last Working Day to expedite Full & Final settlement
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    completedExitTasks.task1
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedExitTasks.task1}
                    onChange={(e) =>
                      setCompletedExitTasks((prev) => ({ ...prev, task1: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      1. Upload Project Handover Documentation
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Upload system architecture diagrams, credentials access lists, and sprint handover documents.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    completedExitTasks.task2
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedExitTasks.task2}
                    onChange={(e) =>
                      setCompletedExitTasks((prev) => ({ ...prev, task2: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      2. IT Hardware & Laptop Return Inspection
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Return MacBook Pro (AST-LPT-041), 4K monitor, power adaptors, and RFID access card.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    completedExitTasks.task3
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedExitTasks.task3}
                    onChange={(e) =>
                      setCompletedExitTasks((prev) => ({ ...prev, task3: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      3. Complete Confidential HR Exit Interview Survey
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Provide feedback on work culture, management support, and career progression factors.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    completedExitTasks.task4
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={completedExitTasks.task4}
                    onChange={(e) =>
                      setCompletedExitTasks((prev) => ({ ...prev, task4: e.target.checked }))
                    }
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      4. Settle Outstanding Expense Vouchers
                    </div>
                    <p className="text-slate-500 mt-0.5">
                      Submit all travel allowance & client bills for reimbursement prior to FnF freeze.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Application Form When No Resignation Is Active */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Apply for Resignation
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit formal resignation notice to initiate the separation & transition process
                </p>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitResignation} className="space-y-5 text-xs">
                {/* Notice Period Contract Highlight */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1 text-indigo-900 dark:text-indigo-200">
                  <div className="flex items-center gap-2 font-bold">
                    <Info className="w-4 h-4" />
                    <span>Contractual Notice Period Requirement</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Based on your designation (<strong>{currentEmployee.designation}</strong>) and grade (<strong>{currentEmployee.grade}</strong>), your mandatory notice period is <strong>{currentEmployee.noticePeriodDays} days</strong>. 
                    If you submit today, your calculated Last Working Day will be <strong>{defaultLwdDate}</strong>.
                  </p>
                </div>

                {/* Reason Category */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Primary Reason for Resignation *
                  </label>
                  <select
                    value={reasonCat}
                    onChange={(e) =>
                      setReasonCat(e.target.value as ResignationRequest['reasonCategory'])
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs"
                  >
                    <option value="Career Growth / Higher Studies">Career Growth / Higher Studies</option>
                    <option value="Personal / Relocation">Personal / Family Relocation</option>
                    <option value="Compensation & Role">Compensation & Role Expectations</option>
                    <option value="Health / Family">Health & Family Considerations</option>
                    <option value="Other">Other Reasons</option>
                  </select>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Calculated Standard LWD ({currentEmployee.noticePeriodDays} Days)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={defaultLwdDate}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Requested Early Release Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={requestedLwd || defaultLwdDate}
                      onChange={(e) => setRequestedLwd(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Shortfall days may incur notice buyout recovery subject to manager approval.
                    </span>
                  </div>
                </div>

                {/* Reason Details */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Detailed Reason & Transition Context *
                  </label>
                  <textarea
                    rows={3}
                    value={reasonDetails}
                    onChange={(e) => setReasonDetails(e.target.value)}
                    placeholder="Provide context regarding your decision and any relevant feedback..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                {/* Handover Plan */}
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Proposed Knowledge Transfer & Handover Plan *
                  </label>
                  <textarea
                    rows={3}
                    value={handoverPlan}
                    onChange={(e) => setHandoverPlan(e.target.value)}
                    placeholder="Specify key project deliverables, active tickets, and designated peer handover recipients..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                {/* Multi-tier Approval Chain Alert */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>Approval Chain: <strong>Reporting Manager → HR Head → Exit Operations</strong></span>
                  </div>
                  <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                    Formal Governance
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Resignation Notice
                  </button>
                </div>
              </form>
            </div>

            {/* Right Guide Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-purple-600 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Separation Policy Guidelines</span>
                </div>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400 list-disc pl-4 leading-relaxed">
                  <li>Your reporting manager will schedule a 1-on-1 retention discussion within 48 hours.</li>
                  <li>Notice buyout requests are discretionary and require business unit approval.</li>
                  <li>All company assets (laptops, display monitors, ID cards) must be returned in good condition.</li>
                  <li>Full and Final (FnF) financial settlement is disbursed within 30 days of Last Working Day.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
