import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { useWorkflow } from '@/context/WorkflowContext'
import { cn } from '@/lib/utils'
import {
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import React, { useState } from 'react'

export const DelegationSettingsPage: React.FC = () => {
  const { employees } = useEmployees()
  const { delegationRule, setDelegation, revokeDelegation, currentManagerId, currentManagerName } = useWorkflow()

  const [delegateId, setDelegateId] = useState('EMP-001')
  const [startDate, setStartDate] = useState('2026-10-15')
  const [endDate, setEndDate] = useState('2026-10-25')
  const [reason, setReason] = useState('Annual family leave abroad with limited network access.')

  const potentialDelegates = employees.filter(
    (e) => e.id !== currentManagerId && (e.profileType === 'Manager' || e.designation.includes('Lead'))
  )

  const handleSaveDelegation = (e: React.FormEvent) => {
    e.preventDefault()
    const target = employees.find((e) => e.id === delegateId)
    setDelegation({
      managerId: currentManagerId,
      managerName: currentManagerName,
      delegateId,
      delegateName: target?.name || 'Sarah Jenkins',
      startDate,
      endDate,
      reason,
    })
    alert(`Approval delegation assigned to ${target?.name || 'Sarah Jenkins'}!`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Approval Authority Delegation"
        subtitle="Temporarily transfer signing authority to a peer manager while on planned leave or travel."
      />

      {/* Active Delegation Alert Card */}
      {delegationRule?.isActive ? (
        <div className="p-5 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <UserCheck className="w-5 h-5" />
              <span>Active Delegation Rule Configured</span>
            </div>
            <button
              onClick={() => {
                revokeDelegation()
                alert('Delegation revoked. You are now the primary approver.')
              }}
              className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-500 transition shadow-2xs"
            >
              Revoke Delegation
            </button>
          </div>

          <div className="text-xs text-foreground/90 space-y-1 pt-2 border-t border-indigo-500/20">
            <p>
              Delegated To: <strong className="text-foreground">{delegationRule.delegateName}</strong>
            </p>
            <p>
              Duration: <span className="font-mono">{delegationRule.startDate} to {delegationRule.endDate}</span>
            </p>
            <p className="text-muted-foreground italic">"{delegationRule.reason}"</p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-border bg-card flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>No active delegation rule. All incoming requests require your direct digital authorization.</span>
        </div>
      )}

      {/* Form Card */}
      <form
        onSubmit={handleSaveDelegation}
        className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4"
      >
        <h3 className="font-bold text-sm text-foreground border-b border-border pb-3">
          Configure New Approval Delegation
        </h3>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Delegate Approver *</label>
          <select
            value={delegateId}
            onChange={(e) => setDelegateId(e.target.value)}
            className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
          >
            {potentialDelegates.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.designation}) - {d.department}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            The delegate will receive signing authority for Leaves, Overtime, and Team Expenses.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date *</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date *</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Delegation Purpose & Audit Note *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
            required
          />
        </div>

        <div className="pt-3 border-t border-border flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
          >
            Enable Delegation Rule
          </button>
        </div>
      </form>
    </div>
  )
}
