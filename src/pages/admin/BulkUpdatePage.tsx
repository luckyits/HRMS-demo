import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import type { EmployeeType } from '@/types'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building,
  CheckCircle2,
  Filter,
  Search,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const BulkUpdatePage: React.FC = () => {
  const navigate = useNavigate()
  const { employees, masterData, bulkUpdateEmployees } = useEmployees()

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')

  // Update fields state
  const [updateManager, setUpdateManager] = useState(false)
  const [selectedManager, setSelectedManager] = useState(employees[1]?.name || 'Vikram Malhotra')

  const [updateBranch, setUpdateBranch] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(masterData.branches[1]?.name || 'Pune Dev Center')

  const [updateProfile, setUpdateProfile] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<EmployeeType>('Office Staff')

  const [reason, setReason] = useState('Organization restructuring Q4')
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchDept = deptFilter === 'All' || emp.department === deptFilter
      return matchSearch && matchDept
    })
  }, [employees, searchTerm, deptFilter])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((e) => e.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const selectedEmployees = useMemo(() => {
    return employees.filter((e) => selectedIds.includes(e.id))
  }, [employees, selectedIds])

  const handleApplyBulk = () => {
    const updates: any = {}
    if (updateManager) updates.reportingManagerName = selectedManager
    if (updateBranch) updates.branch = selectedBranch
    if (updateProfile) updates.profileType = selectedProfile

    bulkUpdateEmployees(selectedIds, updates, reason)
    setShowPreviewModal(false)
    setSelectedIds([])
    alert(`Successfully bulk updated ${selectedIds.length} employees!`)
    navigate('/hr/employees')
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
        title="Workforce Bulk Update Tool"
        subtitle="Mass reassign reporting managers, office branches, and access profile types across selected teams."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Selection Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter roster for bulk select..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="text-xs py-1.5 px-3 bg-background border border-input rounded-lg"
              >
                <option value="All">All Departments</option>
                {masterData.departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
              <span>
                Selected: <strong className="text-primary">{selectedIds.length}</strong> of {filteredEmployees.length}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-muted-foreground hover:text-foreground underline text-[11px]"
              >
                Clear Selection
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 sticky top-0 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-input text-primary"
                    />
                  </th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Profile</th>
                  <th className="p-3">Current Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedIds.includes(emp.id)
                  return (
                    <tr
                      key={emp.id}
                      onClick={() => handleToggleSelect(emp.id)}
                      className={cn(
                        'hover:bg-muted/40 cursor-pointer transition',
                        isSelected && 'bg-primary/5'
                      )}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(emp.id)}
                          className="rounded border-input text-primary"
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-foreground">{emp.name}</p>
                        <span className="text-[10px] text-muted-foreground">{emp.id} · {emp.designation}</span>
                      </td>
                      <td className="p-3 text-muted-foreground">{emp.branch}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-secondary-foreground border border-border">
                          {emp.profileType}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{emp.reportingManagerName || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Update Configuration Panel */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Users className="w-4 h-4 text-primary" /> Apply Mass Reassignment
            </h3>

            {/* Manager Toggle */}
            <div className="space-y-2 p-3 rounded-xl border border-border bg-background">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={updateManager}
                  onChange={(e) => setUpdateManager(e.target.checked)}
                  className="rounded border-input text-primary"
                />
                <span>Reassign Reporting Manager</span>
              </label>
              {updateManager && (
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full text-xs p-2 bg-card border border-input rounded-lg"
                >
                  {employees
                    .filter((e) => e.profileType === 'Manager' || e.designation.includes('Lead') || e.designation.includes('Manager'))
                    .map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.designation})
                      </option>
                    ))}
                </select>
              )}
            </div>

            {/* Branch Toggle */}
            <div className="space-y-2 p-3 rounded-xl border border-border bg-background">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={updateBranch}
                  onChange={(e) => setUpdateBranch(e.target.checked)}
                  className="rounded border-input text-primary"
                />
                <span>Relocate Physical Branch</span>
              </label>
              {updateBranch && (
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full text-xs p-2 bg-card border border-input rounded-lg"
                >
                  {masterData.branches.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Profile Archetype Toggle */}
            <div className="space-y-2 p-3 rounded-xl border border-border bg-background">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-foreground">
                <input
                  type="checkbox"
                  checked={updateProfile}
                  onChange={(e) => setUpdateProfile(e.target.checked)}
                  className="rounded border-input text-primary"
                />
                <span>Change Profile Archetype</span>
              </label>
              {updateProfile && (
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value as any)}
                  className="w-full text-xs p-2 bg-card border border-input rounded-lg"
                >
                  <option value="Office Staff">Office Staff</option>
                  <option value="Field Sales">Field Sales</option>
                  <option value="Factory Worker">Factory Worker</option>
                  <option value="Remote">Remote</option>
                  <option value="Intern">Intern</option>
                  <option value="Contractor">Contractor</option>
                  <option value="Manager">Manager</option>
                </select>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Audit Reason *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full text-xs p-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="button"
              disabled={selectedIds.length === 0 || (!updateManager && !updateBranch && !updateProfile)}
              onClick={() => setShowPreviewModal(true)}
              className={cn(
                'w-full py-2.5 text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2',
                selectedIds.length === 0 || (!updateManager && !updateBranch && !updateProfile)
                  ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <span>Preview Diff & Apply ({selectedIds.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Confirmation Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="font-bold text-foreground">Confirm Bulk Changes ({selectedIds.length} Employees)</h3>
            <p className="text-xs text-muted-foreground">
              Review the planned changes below. These will take effect immediately and create job history timeline records.
            </p>

            <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1.5 text-xs">
              {updateManager && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Manager:</span>
                  <strong className="text-primary">{selectedManager}</strong>
                </div>
              )}
              {updateBranch && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Branch:</span>
                  <strong className="text-primary">{selectedBranch}</strong>
                </div>
              )}
              {updateProfile && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Profile Archetype:</span>
                  <strong className="text-primary">{selectedProfile}</strong>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t border-border">
                <span className="text-muted-foreground">Reason:</span>
                <span className="text-foreground">{reason}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleApplyBulk}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Apply Reassignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
