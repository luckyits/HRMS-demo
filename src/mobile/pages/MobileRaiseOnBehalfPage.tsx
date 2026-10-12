import React, { useState } from 'react'
import {
  Send,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { useWorkflow } from '@/context/WorkflowContext'
import { useToast } from '@/context/ToastContext'

export const MobileRaiseOnBehalfPage: React.FC = () => {
  const { employees } = useEmployees()
  const { createWorkflowRequest, regularizeOnBehalf } = useWorkflow()
  const { showToast } = useToast()

  const teamMembers = employees.filter(
    (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
  )

  const [employeeId, setEmployeeId] = useState(teamMembers[0]?.id || 'EMP-003')
  const [requestType, setRequestType] = useState<'Leave' | 'Regularization'>('Leave')
  const [date, setDate] = useState('2026-10-15')
  const [leaveType, setLeaveType] = useState('Sick Leave (SL)')
  const [reason, setReason] = useState('Reported severe fever via emergency WhatsApp message.')

  const selectedMember = teamMembers.find((m) => m.id === employeeId) || teamMembers[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (requestType === 'Leave') {
      createWorkflowRequest({
        requestType: 'Leave',
        requesterId: selectedMember.id,
        requesterName: selectedMember.name,
        requesterAvatar: selectedMember.avatar,
        requesterDesignation: selectedMember.designation,
        requesterDepartment: selectedMember.department,
        requesterBranch: selectedMember.branch,
        date,
        title: `${leaveType} (Raised by Manager)`,
        description: reason,
        amountOrDays: '1 Day',
        status: 'approved', // Pre-approved since manager raised it
      })
      showToast(`Leave application submitted on behalf of ${selectedMember.name}!`, 'success')
    } else {
      regularizeOnBehalf(
        selectedMember.id,
        date,
        '09:30 AM',
        '06:30 PM',
        `Manager on-behalf regularisation: ${reason}`
      )
      showToast(`Punch regularization logged for ${selectedMember.name}!`, 'success')
    }

    setReason('')
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Raise on Behalf"
        subtitle="Submit requests for offline team members"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3.5">
          {/* Employee Pick */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Team Member
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3.5 py-3 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none"
            >
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.designation})
                </option>
              ))}
            </select>
          </div>

          {/* Request Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Application Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRequestType('Leave')}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  requestType === 'Leave'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border'
                }`}
              >
                Apply Leave
              </button>
              <button
                type="button"
                onClick={() => setRequestType('Regularization')}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  requestType === 'Regularization'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border'
                }`}
              >
                Regularize Punch
              </button>
            </div>
          </div>

          {/* Leave Category if Leave */}
          {requestType === 'Leave' && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Leave Wallet
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl font-semibold text-foreground"
              >
                <option value="Sick Leave (SL)">Sick Leave (SL)</option>
                <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                <option value="Earned Leave (EL)">Earned Leave (EL)</option>
              </select>
            </div>
          )}

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-card border border-border rounded-xl font-semibold text-foreground"
            />
          </div>

          {/* Justification */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Manager Justification
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Employee met with bike breakdown on morning commute..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Send className="w-4 h-4" />
            <span>Submit Application on Behalf</span>
          </button>
        </form>
      </div>
    </div>
  )
}
