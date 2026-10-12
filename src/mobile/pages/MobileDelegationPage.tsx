import React, { useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Calendar,
  CheckCircle2,
  Trash2,
  Send,
  AlertCircle
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { useWorkflow } from '@/context/WorkflowContext'
import { useToast } from '@/context/ToastContext'

export const MobileDelegationPage: React.FC = () => {
  const { delegationRule, setDelegation, revokeDelegation, currentManagerName } = useWorkflow()
  const { showToast } = useToast()

  const [delegateId, setDelegateId] = useState('EMP-005')
  const [delegateName, setDelegateName] = useState('Suresh Nair')
  const [startDate, setStartDate] = useState('2026-10-18')
  const [endDate, setEndDate] = useState('2026-10-25')
  const [reason, setReason] = useState('Annual family leave out of station; delegating engineering sign-offs.')

  const handleSaveDelegation = (e: React.FormEvent) => {
    e.preventDefault()
    setDelegation({
      managerId: 'EMP-002',
      managerName: currentManagerName,
      delegateId,
      delegateName,
      startDate,
      endDate,
      reason,
    })
    showToast(`Approval authority delegated to ${delegateName}!`, 'success')
  }

  const handleRevoke = () => {
    revokeDelegation()
    showToast('Delegation revoked. All approvals restored to your desk.', 'info')
  }

  const peerDelegates = [
    { id: 'EMP-005', name: 'Suresh Nair', role: 'Staff Engineering Lead' },
    { id: 'EMP-008', name: 'Ananya Sharma', role: 'Engineering Manager (Platform)' },
    { id: 'EMP-012', name: 'Rahul Deshmukh', role: 'Associate VP Engineering' },
  ]

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Delegation Settings"
        subtitle="Temporary approver assignment"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Active Delegation Status Card */}
        {delegationRule?.isActive ? (
          <div className="p-4 rounded-3xl bg-teal-500/10 border border-teal-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                <span>Delegation Active</span>
              </span>
              <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">
                Active Rule
              </span>
            </div>

            <div className="text-xs space-y-1 text-foreground">
              <div>
                <span className="text-muted-foreground">Appointed Delegate:</span>{' '}
                <strong>{delegationRule.delegateName}</strong>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>{' '}
                <span>{delegationRule.startDate} to {delegationRule.endDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Reason:</span>{' '}
                <span className="italic">"{delegationRule.reason}"</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRevoke}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Revoke Delegation Immediately</span>
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs text-muted-foreground flex items-start gap-2">
            <UserCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <span>
              Assign an acting manager to review leaves and expenses while you are away, preventing approval bottlenecks.
            </span>
          </div>
        )}

        {/* Set Delegation Form */}
        <form onSubmit={handleSaveDelegation} className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {delegationRule?.isActive ? 'Update Delegation Rule' : 'Assign Acting Delegate'}
          </h4>

          {/* Delegate Choice */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Choose Acting Approver
            </label>
            <select
              value={delegateId}
              onChange={(e) => {
                const found = peerDelegates.find((p) => p.id === e.target.value)
                if (found) {
                  setDelegateId(found.id)
                  setDelegateName(found.name)
                }
              }}
              className="w-full px-3.5 py-3 text-sm bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none"
            >
              {peerDelegates.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-card border border-border rounded-xl font-semibold text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-card border border-border rounded-xl font-semibold text-foreground"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Reason / Delegation Notice
            </label>
            <textarea
              rows={3}
              required
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
            <span>Enable Approval Delegation</span>
          </button>
        </form>
      </div>
    </div>
  )
}
