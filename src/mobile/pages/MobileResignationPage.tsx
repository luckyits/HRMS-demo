import React, { useState } from 'react'
import {
  UserMinus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  FileText,
  Send,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import {
  useLifecycle,
  type ResignationRequest,
  type ExitClearanceItem,
} from '@/context/LifecycleContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'

export const MobileResignationPage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { resignations, submitResignation, withdrawResignation, exitClearances } = useLifecycle()
  const { showToast } = useToast()

  // Standard notice period in days
  const standardNoticeDays = 60
  const todayDate = new Date()
  const autoCalculatedDate = new Date(todayDate)
  autoCalculatedDate.setDate(todayDate.getDate() + standardNoticeDays)
  const defaultLwd = autoCalculatedDate.toISOString().split('T')[0]

  // Form State
  const [requestedLwd, setRequestedLwd] = useState(defaultLwd)
  const [reasonCategory, setReasonCategory] = useState<ResignationRequest['reasonCategory']>(
    'Career Growth / Higher Studies'
  )
  const [reasonDetails, setReasonDetails] = useState('Accepted an offer for further career growth.')
  const [handoverPlan, setHandoverPlan] = useState('Will document architecture and train peer engineer.')
  const [showApplyForm, setShowApplyForm] = useState(false)

  if (!hasFeature('RESIGNATION')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Resignation Desk" subtitle="Separation & Exit" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <UserMinus className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Resignation and separation desk is not accessible for your profile.</p>
        </div>
      </div>
    )
  }

  // Active resignation for employee
  const activeResignation = resignations.find(
    (r) => r.employeeId === currentEmployee.id || r.id === 'RES-001'
  )

  const activeClearanceList: ExitClearanceItem[] =
    (activeResignation && exitClearances[activeResignation.id]) || [
      {
        id: 'EX-1',
        department: 'IT & Hardware',
        itemTitle: 'Return Assigned MacBook & Charger',
        status: 'Pending',
        deductionAmount: 0,
      },
      {
        id: 'EX-2',
        department: 'Finance & Loans',
        itemTitle: 'Recovery of Active Advance & Travel Claims',
        status: 'Pending',
        deductionAmount: 0,
      },
      {
        id: 'EX-3',
        department: 'Admin & Facilities',
        itemTitle: 'Biometric Access Keycard & Pedestal Keys',
        status: 'Cleared',
        deductionAmount: 0,
      },
      {
        id: 'EX-4',
        department: 'Department Handover',
        itemTitle: 'Knowledge Transfer & Project Documentation Sign-off',
        status: 'Cleared',
        deductionAmount: 0,
      },
      {
        id: 'EX-5',
        department: 'HR Exit Interview',
        itemTitle: 'Formal Exit Feedback Survey & No-Dues Form',
        status: 'Pending',
        deductionAmount: 0,
      },
    ]

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault()
    submitResignation({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      employeeGrade: currentEmployee.grade || 'L4',
      department: currentEmployee.department,
      designation: currentEmployee.designation,
      doj: currentEmployee.joiningDate || '2022-01-15',
      noticePeriodDays: standardNoticeDays,
      requestedLwd,
      reasonCategory,
      reasonDetails,
      handoverPlan,
    })

    showToast('Resignation submitted for Manager and HR review', 'info')
    setShowApplyForm(false)
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Separation & Exit"
        subtitle={activeResignation ? 'Active Resignation Status' : 'Notice Period & Exit Desk'}
      />

      <div className="p-4 space-y-4">
        {activeResignation ? (
          /* Active Resignation Timeline & Checklist */
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Status Header Banner */}
            <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Resignation Status
                  </span>
                  <h4 className="text-base font-black text-foreground">
                    {activeResignation.status}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Ref: {activeResignation.requestId} • Applied {activeResignation.applyDate}
                  </span>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  {activeResignation.noticePeriodDays} Days Notice
                </span>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] block">
                    Auto-Calculated LWD
                  </span>
                  <span className="font-bold text-foreground">
                    {activeResignation.calculatedLwd}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-[10px] block">
                    Requested LWD
                  </span>
                  <span className="font-bold text-primary">
                    {activeResignation.requestedLwd}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval & Exit Timeline */}
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Approval Sign-off & Notice Progression
              </h4>
              <ApprovalTimeline steps={activeResignation.steps} />
            </div>

            {/* Exit Tasks & Clearance Checklist */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Exit Tasks & Department Clearances
                </h4>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  No-Dues Checklist
                </span>
              </div>

              <div className="space-y-2">
                {activeClearanceList.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {task.department}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-foreground mt-1">
                        {task.itemTitle}
                      </h5>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        task.status === 'Cleared'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Withdraw Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  withdrawResignation(activeResignation.id)
                  showToast('Resignation withdrawal request initiated', 'info')
                }}
                className="w-full py-3 rounded-2xl border border-border bg-muted/40 text-muted-foreground font-bold text-xs hover:text-foreground active:scale-95 transition"
              >
                Withdraw Resignation Request
              </button>
            </div>
          </div>
        ) : !showApplyForm ? (
          /* Empty / Not Resigned State with Policy Info */
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <UserMinus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Separation Policy Terms
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Applicable to {currentEmployee.grade || 'L4'} workforce
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Mandatory Notice Period:</span>
                  <span className="font-bold text-foreground">{standardNoticeDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Earliest Relieving Date:</span>
                  <span className="font-bold text-foreground">{defaultLwd}</span>
                </div>
                <div className="flex justify-between">
                  <span>Full & Final Settlement (FnF):</span>
                  <span className="font-bold text-foreground">30-45 Days Post-Exit</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowApplyForm(true)}
              className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md active:scale-[0.99] transition flex items-center justify-center gap-2"
            >
              <UserMinus className="w-4 h-4" />
              <span>Initiate Formal Resignation</span>
            </button>
          </div>
        ) : (
          /* Resignation Application Form */
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Resignation Application
              </h4>
              <button
                type="button"
                onClick={() => setShowApplyForm(false)}
                className="text-xs text-muted-foreground font-bold hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Primary Reason Category
                </label>
                <select
                  value={reasonCategory}
                  onChange={(e) =>
                    setReasonCategory(e.target.value as ResignationRequest['reasonCategory'])
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-bold focus:outline-none"
                >
                  <option value="Career Growth / Higher Studies">
                    Career Growth / Higher Studies
                  </option>
                  <option value="Personal / Relocation">Personal / Relocation</option>
                  <option value="Compensation & Role">Compensation & Role</option>
                  <option value="Health / Family">Health / Family</option>
                  <option value="Other">Other Reasons</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Requested Last Working Day (LWD)
                </label>
                <input
                  type="date"
                  value={requestedLwd}
                  onChange={(e) => setRequestedLwd(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-card text-foreground text-xs font-bold focus:outline-none"
                />
                <span className="text-[10px] text-muted-foreground block mt-1">
                  Policy standard is {defaultLwd} ({standardNoticeDays} days).
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Detailed Reason / Comments
                </label>
                <textarea
                  rows={2}
                  value={reasonDetails}
                  onChange={(e) => setReasonDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  Handover & Transition Plan
                </label>
                <textarea
                  rows={2}
                  value={handoverPlan}
                  onChange={(e) => setHandoverPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md active:scale-[0.99] transition"
              >
                Submit Resignation
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
