import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees, type ExtendedEmployee } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Search,
  UserCheck,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export const ProbationTrackerPage: React.FC = () => {
  const { employees, confirmProbation, extendProbation } = useEmployees()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmp, setSelectedEmp] = useState<ExtendedEmployee | null>(null)

  // Modals state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmRemarks, setConfirmRemarks] = useState('Satisfactory performance evaluation during 3-month probation period.')

  const [showExtendModal, setShowExtendModal] = useState(false)
  const [extensionDays, setExtensionDays] = useState(30)
  const [extendReason, setExtendReason] = useState('Requires further technical review on milestone deliverables.')

  const probationEmployees = useMemo(() => {
    return employees
      .filter((e) => e.status === 'Probation')
      .map((emp) => {
        const today = new Date().getTime()
        const endDate = emp.probationEndDate ? new Date(emp.probationEndDate).getTime() : today + 30 * 86400000
        const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))

        return {
          ...emp,
          daysLeft: diffDays,
          isOverdue: diffDays <= 0,
          isUrgent: diffDays > 0 && diffDays <= 15,
        }
      })
      .filter((e) => {
        return (
          e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.department.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
  }, [employees, searchTerm])

  const handleConfirmAction = () => {
    if (selectedEmp) {
      confirmProbation(selectedEmp.id, confirmRemarks)
      setShowConfirmModal(false)
      setSelectedEmp(null)
      alert(`Employment confirmed for ${selectedEmp.name}!`)
    }
  }

  const handleExtendAction = () => {
    if (selectedEmp) {
      extendProbation(selectedEmp.id, extensionDays, extendReason)
      setShowExtendModal(false)
      setSelectedEmp(null)
      alert(`Probation extended by ${extensionDays} days for ${selectedEmp.name}!`)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/hr/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee Directory</span>
        </Link>
      </div>

      <PageHeader
        title="Probation Lifecycle Tracker"
        subtitle="Manage confirmation milestones, conduct formal review evaluations, or extend probation duration."
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground font-medium">Total on Probation</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{probationEmployees.length}</p>
          <span className="text-[11px] text-muted-foreground">Active review cycles</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground font-medium">Expiring Soon (≤ 15 Days)</p>
          <p className="text-2xl font-bold text-amber-500 mt-0.5">
            {probationEmployees.filter((e) => e.isUrgent).length}
          </p>
          <span className="text-[11px] text-muted-foreground">Requires immediate decision</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground font-medium">Overdue Reviews</p>
          <p className="text-2xl font-bold text-rose-500 mt-0.5">
            {probationEmployees.filter((e) => e.isOverdue).length}
          </p>
          <span className="text-[11px] text-muted-foreground">Passed deadline</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search probationers by name, ID or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg"
          />
        </div>
      </div>

      {/* Probation Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Department & Branch</th>
              <th className="p-3">Joining Date</th>
              <th className="p-3">Probation End Date</th>
              <th className="p-3">Days Left</th>
              <th className="p-3 text-right">Review Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {probationEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No employees currently on probation match the search query.
                </td>
              </tr>
            ) : (
              probationEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-muted/30 transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                      />
                      <div>
                        <Link
                          to={`/hr/employees/${emp.id}`}
                          className="font-semibold text-foreground hover:text-primary transition"
                        >
                          {emp.name}
                        </Link>
                        <span className="block text-[10px] text-muted-foreground">{emp.id} · {emp.designation}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {emp.department} · {emp.branch}
                  </td>
                  <td className="p-3 text-muted-foreground">{emp.joiningDate}</td>
                  <td className="p-3 font-medium text-foreground">{emp.probationEndDate || '2026-11-15'}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1',
                        emp.isOverdue
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : emp.isUrgent
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : 'bg-primary/10 text-primary border border-primary/20'
                      )}
                    >
                      <Clock className="w-3 h-3" />
                      {emp.isOverdue ? 'Overdue' : `${emp.daysLeft} Days Left`}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedEmp(emp)
                          setShowConfirmModal(true)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition text-[11px] font-semibold shadow-2xs"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirm</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedEmp(emp)
                          setShowExtendModal(true)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-card border border-border hover:bg-muted text-foreground transition text-[11px] font-semibold"
                      >
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Extend</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" /> Confirm Employment: {selectedEmp.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Confirming employment will transition this profile status from <strong>Probation</strong> to <strong>Active Permanent</strong>.
            </p>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">HR Review Remarks</label>
              <textarea
                value={confirmRemarks}
                onChange={(e) => setConfirmRemarks(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Confirm Employment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Extend Probation: {selectedEmp.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              Extend the trial period and set an updated deadline. A timeline notification will be logged.
            </p>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Extension Period</label>
              <select
                value={extensionDays}
                onChange={(e) => setExtensionDays(parseInt(e.target.value))}
                className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              >
                <option value={30}>30 Days (1 Month)</option>
                <option value={60}>60 Days (2 Months)</option>
                <option value={90}>90 Days (3 Months)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Reason for Extension *</label>
              <textarea
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 bg-background border border-input rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendAction}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-500"
              >
                Confirm Extension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
