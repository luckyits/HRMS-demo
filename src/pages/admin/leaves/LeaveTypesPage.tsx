import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves } from '@/context/AdminLeavesContext'
import type { LeaveTypeDefinition } from '@/mock/adminLeaves'
import {
  Layers,
  Plus,
  CheckCircle2,
  Trash2,
  FileText,
  Calendar,
  Banknote,
  Users,
  ShieldAlert,
  Info,
  Check,
  X,
} from 'lucide-react'

export const LeaveTypesPage: React.FC = () => {
  const { leaveTypes, addLeaveType, deleteLeaveType, updateLeaveType } = useAdminLeaves()

  const [showModal, setShowModal] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [isPaid, setIsPaid] = useState(true)
  const [accrualRule, setAccrualRule] = useState<LeaveTypeDefinition['accrualRule']>('Monthly')
  const [accrualRateDays, setAccrualRateDays] = useState(1.5)
  const [maxCarryForwardDays, setMaxCarryForwardDays] = useState(15)
  const [carryForwardExpiryMonths, setCarryForwardExpiryMonths] = useState(12)
  const [isEncashable, setIsEncashable] = useState(false)
  const [maxBalanceCap, setMaxBalanceCap] = useState(30)
  const [genderApplicability, setGenderApplicability] =
    useState<LeaveTypeDefinition['genderApplicability']>('All')
  const [documentRequiredAfterDays, setDocumentRequiredAfterDays] = useState(0)
  const [leaveColor, setLeaveColor] = useState('#3B82F6')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !code.trim()) return

    const newType: Omit<LeaveTypeDefinition, 'id'> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description.trim(),
      isPaid,
      accrualRule,
      accrualRateDays,
      maxCarryForwardDays,
      carryForwardExpiryMonths,
      isEncashable,
      encashmentMaxDaysPerYear: isEncashable ? 10 : undefined,
      maxBalanceCap,
      genderApplicability,
      documentRequiredAfterDays,
      color: leaveColor,
      isActive: true,
    }

    addLeaveType(newType)
    setShowModal(false)
    setToastMessage(`Leave type ${newType.name} (${newType.code}) created successfully!`)
    setTimeout(() => setToastMessage(null), 3500)

    // Reset
    setName('')
    setCode('')
    setDescription('')
  }

  const colorPresets = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#64748B']

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Leave Types Master Configuration"
        subtitle="Define paid/unpaid quotas, carry-forward rollover rules, encashment parameters, and statutory document mandates"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Leave Type</span>
          </button>
        }
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid of Leave Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaveTypes.map((type) => {
          return (
            <div
              key={type.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: type.color }} />

              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] text-muted-foreground uppercase font-bold">
                      {type.code}
                    </span>
                    <h4 className="font-bold text-base text-foreground mt-0.5">{type.name}</h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        type.isPaid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {type.isPaid ? 'Paid' : 'Unpaid (LWP)'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {type.description}
                </p>

                {/* Specs List */}
                <div className="mt-4 p-3 bg-muted/20 border border-border/50 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Accrual Frequency:</span>
                    <span className="font-semibold text-foreground">
                      {type.accrualRule} ({type.accrualRateDays} days/unit)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Carry Forward Limit:</span>
                    <span className="font-semibold text-foreground">
                      {type.maxCarryForwardDays > 0 ? `${type.maxCarryForwardDays} days (expires ${type.carryForwardExpiryMonths}m)` : 'Lapses annually'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Encashable:</span>
                    <span className="font-semibold text-foreground">
                      {type.isEncashable ? `Yes (Max ${type.encashmentMaxDaysPerYear} days/yr)` : 'No'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Balance Cap:</span>
                    <span className="font-extrabold text-primary">{type.maxBalanceCap} Days</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gender Applicability:</span>
                    <span className="font-semibold text-foreground">{type.genderApplicability}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Document Mandate:</span>
                    <span className="font-semibold text-foreground">
                      {type.documentRequiredAfterDays > 0 ? `Required if > ${type.documentRequiredAfterDays} days` : 'Not required'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-[11px] text-muted-foreground font-mono">
                  ID: {type.id}
                </span>

                <button
                  onClick={() => deleteLeaveType(type.id)}
                  className="text-muted-foreground hover:text-rose-600 p-1 rounded transition-colors"
                  title="Archive Leave Type"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Leave Type Modal */}
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
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Create Leave Type</h3>
                <p className="text-xs text-muted-foreground">
                  Configure accrual rates, encashment, rollover, and statutory evidence criteria
                </p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Leave Type Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bereavement Leave"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Code / Abbreviation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BL"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl font-mono uppercase"
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
                  placeholder="Operational guidelines and entitlement purpose..."
                  className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-xl"
                />
              </div>

              {/* Paid & Accrual */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/20 border border-border rounded-xl">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Compensation Type
                  </label>
                  <select
                    value={isPaid ? 'paid' : 'unpaid'}
                    onChange={(e) => setIsPaid(e.target.value === 'paid')}
                    className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  >
                    <option value="paid">Paid Leave</option>
                    <option value="unpaid">Unpaid (Loss of Pay)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Accrual Rule
                  </label>
                  <select
                    value={accrualRule}
                    onChange={(e) => setAccrualRule(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  >
                    <option value="Monthly">Monthly Accrual</option>
                    <option value="Quarterly">Quarterly Accrual</option>
                    <option value="Annual Upfront">Annual Upfront</option>
                    <option value="Pro-rata on Joining">Pro-rata on Joining</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Accrual Rate (Days)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={accrualRateDays}
                    onChange={(e) => setAccrualRateDays(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  />
                </div>
              </div>

              {/* Carry forward & Encashment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/20 border border-border rounded-xl">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Max Carry Forward (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxCarryForwardDays}
                    onChange={(e) => setMaxCarryForwardDays(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Carry-over Expiry (Months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={carryForwardExpiryMonths}
                    onChange={(e) => setCarryForwardExpiryMonths(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Encashable?
                  </label>
                  <select
                    value={isEncashable ? 'yes' : 'no'}
                    onChange={(e) => setIsEncashable(e.target.value === 'yes')}
                    className="w-full text-xs px-2.5 py-1.5 bg-card border border-border rounded-lg"
                  >
                    <option value="no">Not Encashable</option>
                    <option value="yes">Encashable for Cash</option>
                  </select>
                </div>
              </div>

              {/* Caps, Gender, Docs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Maximum Balance Ceiling
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxBalanceCap}
                    onChange={(e) => setMaxBalanceCap(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Gender Applicability
                  </label>
                  <select
                    value={genderApplicability}
                    onChange={(e) => setGenderApplicability(e.target.value as any)}
                    className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg"
                  >
                    <option value="All">All Genders</option>
                    <option value="Female Only">Female Only</option>
                    <option value="Male Only">Male Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Doc Required If &gt; Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={documentRequiredAfterDays}
                    onChange={(e) => setDocumentRequiredAfterDays(Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-muted/40 border border-border rounded-lg"
                  />
                  <span className="text-[10px] text-muted-foreground">0 = never required</span>
                </div>
              </div>

              {/* Color Preset */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Display Badge Color
                </label>
                <div className="flex items-center gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setLeaveColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        leaveColor === c ? 'scale-125 ring-2 ring-primary ring-offset-2' : ''
                      }`}
                    />
                  ))}
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
                  Save Leave Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
