import { DataTable } from '@/components/common/DataTable'
import { FilterBar } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useFeatureControl } from '@/context/FeatureControlContext'
import { useRoles } from '@/context/RoleContext'
import type { UserRoleAssignment } from '@/roles/types'
import { RolesNav } from '@/pages/roles/RolesNav'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Calendar,
  Check,
  CheckSquare,
  Clock,
  KeyRound,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const UserRoleAssignmentPage: React.FC = () => {
  const { employees } = useFeatureControl()
  const { roles, assignments, assignRoleToUser, removeRoleAssignment } = useRoles()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')

  // Assign Modal
  const [modal, setModal] = useState<{
    isOpen: boolean
    employeeId: string
    roleId: string
    isPrimary: boolean
    validFrom: string
    validTo: string
    customScopeOverride: string
    reason: string
  }>({
    isOpen: false,
    employeeId: employees[0]?.id || '',
    roleId: roles[0]?.id || '',
    isPrimary: true,
    validFrom: '',
    validTo: '',
    customScopeOverride: '',
    reason: '',
  })

  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))]

  const columns: ColumnDef<UserRoleAssignment>[] = [
    {
      accessorKey: 'employeeName',
      header: 'Personnel Name & ID',
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-foreground block">
            {row.original.employeeName}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {row.original.employeeId} • {row.original.employeeEmail}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department / Branch',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.department} • {row.original.branch}
        </span>
      ),
    },
    {
      accessorKey: 'roleName',
      header: 'Assigned Role',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-xs text-foreground">
            {row.original.roleName}
          </span>
          {row.original.isPrimary && (
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-primary/10 text-primary font-bold">
              Primary
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'customScopeOverride',
      header: 'Custom Scope / Rules',
      cell: ({ row }) => (
        <span className="font-mono text-[11px] text-muted-foreground">
          {row.original.customScopeOverride || 'Standard Role Scope'}
        </span>
      ),
    },
    {
      accessorKey: 'validTo',
      header: 'Validity Period',
      cell: ({ row }) => (
        <div className="text-xs font-mono text-muted-foreground">
          {row.original.validTo ? (
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Until {row.original.validTo}
            </span>
          ) : (
            <span>Permanent</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() =>
            removeRoleAssignment(
              row.original.id,
              `Revoked ${row.original.roleName} role from ${row.original.employeeName}`
            )
          }
          className="p-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          title="Revoke role assignment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchSearch =
        a.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        a.employeeId.toLowerCase().includes(search.toLowerCase()) ||
        a.roleName.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || a.roleId === roleFilter
      const matchDept = deptFilter === 'all' || a.department === deptFilter
      return matchSearch && matchRole && matchDept
    })
  }, [assignments, search, roleFilter, deptFilter])

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetEmp = employees.find((emp) => emp.id === modal.employeeId)
    const targetRole = roles.find((r) => r.id === modal.roleId)
    if (!targetEmp || !targetRole) return

    assignRoleToUser(
      {
        employeeId: targetEmp.id,
        employeeName: targetEmp.name,
        employeeEmail: targetEmp.email,
        department: targetEmp.department,
        branch: targetEmp.branch,
        roleId: targetRole.id,
        roleName: targetRole.name,
        isPrimary: modal.isPrimary,
        validFrom: modal.validFrom || undefined,
        validTo: modal.validTo || undefined,
        customScopeOverride: modal.customScopeOverride || undefined,
      },
      modal.reason || `Assigned ${targetRole.name} to ${targetEmp.name}`
    )

    setModal((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User-Role Assignments"
        subtitle="Map security roles to workforce personnel with optional validity expirations and custom scope overrides"
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Roles & Permissions', href: '/hr/roles/list' },
          { label: 'User Assignments' },
        ]}
        action={
          <button
            type="button"
            onClick={() => setModal((prev) => ({ ...prev, isOpen: true }))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Role to Personnel</span>
          </button>
        }
      />

      <RolesNav />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter assignments by employee name, ID, or role..."
        departmentFilter={deptFilter}
        onDepartmentChange={setDeptFilter}
        departmentOptions={departments
          .filter((d) => d !== 'all')
          .map((d) => ({ label: d, value: d }))}
        onReset={() => {
          setSearch('')
          setRoleFilter('all')
          setDeptFilter('all')
        }}
      >
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none"
        >
          <option value="all">All Roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </FilterBar>

      {/* Assignments Table */}
      <DataTable columns={columns} data={filteredAssignments} />

      {/* Assign Role Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>Assign Security Role to Personnel</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select an employee and map an active administrative or functional role.
            </p>

            <form onSubmit={handleAssignSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Target Employee
                </label>
                <select
                  value={modal.employeeId}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, employeeId: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) — {emp.designation} [{emp.department}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Assign Role
                </label>
                <select
                  value={modal.roleId}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, roleId: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPrimaryCheckbox"
                  checked={modal.isPrimary}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, isPrimary: e.target.checked }))
                  }
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <label htmlFor="isPrimaryCheckbox" className="font-medium text-foreground">
                  Designate as Primary Operating Role
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Valid From:
                  </label>
                  <input
                    type="date"
                    value={modal.validFrom}
                    onChange={(e) =>
                      setModal((prev) => ({ ...prev, validFrom: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground block mb-1">
                    Valid To (Optional Expiry):
                  </label>
                  <input
                    type="date"
                    value={modal.validTo}
                    onChange={(e) =>
                      setModal((prev) => ({ ...prev, validTo: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Custom Data Scope Expression (Optional Override)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Branch = Pune Plant 1 AND Department in (Stores, Safety)"
                  value={modal.customScopeOverride}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, customScopeOverride: e.target.value }))
                  }
                  className="w-full px-3 py-2 font-mono text-[11px] bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Reason / Compliance Justification
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Appointed as interim site safety coordinator for Q4..."
                  value={modal.reason}
                  onChange={(e) =>
                    setModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full p-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
                >
                  Assign Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
