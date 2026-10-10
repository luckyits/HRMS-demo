import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves } from '@/context/AdminLeavesContext'
import type { LeavePolicyBundle } from '@/mock/adminLeaves'
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  Trash2,
  Building,
  Calendar,
  Layers,
  Users,
  Check,
  X,
  Sparkles,
} from 'lucide-react'

export const LeavePoliciesPage: React.FC = () => {
  const { leavePolicies, leaveTypes, addLeavePolicy, deleteLeavePolicy } = useAdminLeaves()

  const [showModal, setShowModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [appliesToType, setAppliesToType] =
    useState<LeavePolicyBundle['appliesToType']>('Branch')
  const [appliesToTarget, setAppliesToTarget] = useState('Bengaluru HQ')
  const [effectiveFrom, setEffectiveFrom] = useState('2026-11-01')

  // Quotas for each leave type
  const [quotas, setQuotas] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    leaveTypes.forEach((t) => {
      init[t.code] = t.code === 'EL' ? 18 : t.code === 'CL' ? 12 : t.code === 'SL' ? 10 : 0
    })
    return init
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const quotaList = leaveTypes.map((t) => ({
      leaveTypeId: t.id,
      leaveTypeCode: t.code,
      annualQuota: quotas[t.code] || 0,
    }))

    const newPolicy: Omit<LeavePolicyBundle, 'id' | 'assignedEmployeeCount'> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      quotas: quotaList,
      appliesToType,
      appliesToTarget,
      effectiveFrom,
      status: 'Active',
    }

    addLeavePolicy(newPolicy)
    setShowModal(false)
    setToastMessage(`Leave policy bundle ${newPolicy.name} created and assigned!`)
    setTimeout(() => setToastMessage(null), 3500)

    // Reset
    setName('')
    setCode('')
    setDescription('')
  }

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Leave Policy Bundles & Quotas"
        subtitle="Group leave type allowances into comprehensive policy bundles and scope them across organizational tiers"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Leave Policy Bundle</span>
          </button>
        }
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Policies Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leavePolicies.map((policy) => {
          return (
            <div
              key={policy.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                      {policy.code}
                    </span>
                    <h4 className="font-bold text-base text-foreground mt-0.5">{policy.name}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    {policy.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {policy.description}
                </p>

                {/* Scope pill */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-xl">
                  <Building className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    Applies to: <strong>{policy.appliesToType}</strong> &bull; {policy.appliesToTarget}
                  </span>
                </div>

                {/* Quotas Breakdown Matrix */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                    Annual Entitlements (Days)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {policy.quotas.map((q) => {
                      if (q.annualQuota === 0) return null
                      return (
                        <div
                          key={q.leaveTypeCode}
                          className="p-2 rounded-xl bg-card border border-border flex flex-col items-center"
                        >
                          <span className="font-bold text-sm text-foreground">
                            {q.annualQuota}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {q.leaveTypeCode}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground">
                  Effective: {policy.effectiveFrom}
                </span>

                <button
                  onClick={() => deleteLeavePolicy(policy.id)}
                  className="text-muted-foreground hover:text-rose-600 p-1 rounded transition-colors"
                  title="Archive Policy Bundle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Create Leave Policy Bundle
                </h3>
                <p className="text-xs text-muted-foreground">
                  Combine leave allowances into a single policy and scope to targeted business units
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Policy Bundle Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive Leadership Quota 2026"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Policy Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LP-EXEC-2026"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Target demographic, justification, and carry-over details..."
                  className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-xl"
                />
              </div>

              {/* Annual Quotas */}
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                <span className="text-xs font-bold text-foreground block">
                  Assign Annual Quotas (Days per Year):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {leaveTypes.map((type) => {
                    return (
                      <div key={type.id} className="bg-card p-2.5 rounded-xl border border-border">
                        <label className="text-[11px] font-semibold text-foreground block mb-1">
                          {type.name} ({type.code})
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={quotas[type.code] || 0}
                          onChange={(e) =>
                            setQuotas({ ...quotas, [type.code]: Number(e.target.value) })
                          }
                          className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg font-bold text-primary"
                        />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Scope & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Assign Policy Scope
                  </label>
                  <select
                    value={appliesToType}
                    onChange={(e) => setAppliesToType(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-2 bg-muted/40 border border-border rounded-xl"
                  >
                    <option value="Company">Whole Company</option>
                    <option value="Branch">Specific Branch</option>
                    <option value="Department">Specific Department</option>
                    <option value="Profile">Employee Profile</option>
                    <option value="Employee">Individual Employee</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Target Name
                  </label>
                  <input
                    type="text"
                    value={appliesToTarget}
                    onChange={(e) => setAppliesToTarget(e.target.value)}
                    placeholder="e.g. Bengaluru HQ"
                    className="w-full text-xs px-2.5 py-2 bg-muted/40 border border-border rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Effective From Date
                  </label>
                  <input
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 bg-muted/40 border border-border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs border border-border rounded-xl hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-md"
                >
                  Save & Deploy Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
