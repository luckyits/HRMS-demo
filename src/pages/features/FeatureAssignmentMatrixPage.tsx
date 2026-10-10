import { FEATURE_MAP, FEATURE_MASTER } from '@/access/features'
import { resolveAccess } from '@/access/resolver'
import type { AssignmentLevel, AssignmentState, FeatureGrant } from '@/access/types'
import { ExportNotice } from '@/components/common/ExportNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useDemo } from '@/context/DemoContext'
import { useFeatureControl } from '@/context/FeatureControlContext'
import type { MockEmployee } from '@/mock/employees'
import { FeatureControlNav } from '@/pages/features/FeatureControlNav'
import {
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  HelpCircle,
  Lock,
  RotateCcw,
  Search,
  Sliders,
  Square,
  Unlock,
  User,
  X,
  XCircle,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const FeatureAssignmentMatrixPage: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()
  const {
    employees,
    updateEmployeeOverride,
    bulkUpdateEmployeeOverride,
    companyToggles,
    profiles,
  } = useFeatureControl()

  // Filters
  const [search, setSearch] = useState('')
  const [branchFilter, setBranchFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')
  const [featureSearch, setFeatureSearch] = useState('')

  // Multi-select for bulk assign
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([])

  // Side Drawer state for editing single cell
  const [drawer, setDrawer] = useState<{
    isOpen: boolean
    employee: MockEmployee | null
    featureCode: string
    state: AssignmentState
    locked: boolean
    validFrom: string
    validTo: string
    reason: string
  }>({
    isOpen: false,
    employee: null,
    featureCode: '',
    state: 'Inherit',
    locked: false,
    validFrom: '',
    validTo: '',
    reason: '',
  })

  // Bulk Drawer state
  const [bulkDrawer, setBulkDrawer] = useState<{
    isOpen: boolean
    featureCode: string
    state: AssignmentState
    locked: boolean
    validFrom: string
    validTo: string
    reason: string
  }>({
    isOpen: false,
    featureCode: 'VISIT',
    state: 'Allow',
    locked: false,
    validFrom: '',
    validTo: '',
    reason: '',
  })

  // Filter options derived from employees list
  const branches = ['all', ...Array.from(new Set(employees.map((e) => e.branch)))]
  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))]
  const profileTypes = ['all', ...Array.from(new Set(employees.map((e) => e.profileType)))]

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const matchSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.id.toLowerCase().includes(search.toLowerCase()) ||
        e.designation.toLowerCase().includes(search.toLowerCase())
      const matchBranch = branchFilter === 'all' || e.branch === branchFilter
      const matchDept = deptFilter === 'all' || e.department === deptFilter
      const matchProfile = profileFilter === 'all' || e.profileType === profileFilter
      return matchSearch && matchBranch && matchDept && matchProfile
    })
  }, [employees, search, branchFilter, deptFilter, profileFilter])

  // Filtered Features
  const filteredFeatures = useMemo(() => {
    return FEATURE_MASTER.filter(
      (f) =>
        f.code.toLowerCase().includes(featureSearch.toLowerCase()) ||
        f.name.toLowerCase().includes(featureSearch.toLowerCase())
    )
  }, [featureSearch])

  // Cell Click: open drawer for individual override
  const handleCellClick = (employee: MockEmployee, featureCode: string) => {
    const existing = employee.featureOverrides?.[featureCode]
    setDrawer({
      isOpen: true,
      employee,
      featureCode,
      state: existing?.state || 'Inherit',
      locked: Boolean(existing?.locked),
      validFrom: existing?.validFrom || '',
      validTo: existing?.validTo || '',
      reason: '',
    })
  }

  const handleSaveDrawer = () => {
    if (!drawer.employee) return

    let grant: FeatureGrant | null = null
    if (drawer.state !== 'Inherit') {
      grant = {
        state: drawer.state,
        locked: drawer.locked,
        validFrom: drawer.validFrom || undefined,
        validTo: drawer.validTo || undefined,
      }
    }

    updateEmployeeOverride(
      drawer.employee.id,
      drawer.featureCode,
      grant,
      drawer.reason || `Updated override for ${drawer.featureCode} to ${drawer.state}`
    )

    setDrawer((prev) => ({ ...prev, isOpen: false }))
  }

  // Bulk Select Toggle
  const handleToggleSelectAll = () => {
    if (selectedEmpIds.length === filteredEmployees.length) {
      setSelectedEmpIds([])
    } else {
      setSelectedEmpIds(filteredEmployees.map((e) => e.id))
    }
  }

  const handleToggleSelectEmp = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSaveBulk = () => {
    if (selectedEmpIds.length === 0) return

    let grant: FeatureGrant | null = null
    if (bulkDrawer.state !== 'Inherit') {
      grant = {
        state: bulkDrawer.state,
        locked: bulkDrawer.locked,
        validFrom: bulkDrawer.validFrom || undefined,
        validTo: bulkDrawer.validTo || undefined,
      }
    }

    bulkUpdateEmployeeOverride(
      selectedEmpIds,
      bulkDrawer.featureCode,
      grant,
      bulkDrawer.reason || `Bulk assign ${bulkDrawer.featureCode} to ${selectedEmpIds.length} employees`
    )

    setBulkDrawer((prev) => ({ ...prev, isOpen: false }))
    setSelectedEmpIds([])
  }

  // Source Level Icon Helper
  const getSourceIcon = (level: AssignmentLevel | 'Default') => {
    switch (level) {
      case 'Company':
        return <span title="Decided by Company Ceiling">🏢</span>
      case 'Branch':
        return <span title="Decided by Branch Policy">📍</span>
      case 'Department':
        return <span title="Decided by Department Policy">🏬</span>
      case 'Profile':
        return <span title="Decided by Profile Template">👤</span>
      case 'Employee':
        return <span title="Decided by Individual Override">🔑</span>
      default:
        return <span title="Default">⚙️</span>
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Assignment Matrix"
        subtitle="Individual employee access overrides, source-level audit pills, and temporary grant expiry tracking"
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Feature Control', href: '/hr/features/catalogue' },
          { label: 'Assignment Matrix' },
        ]}
        action={
          selectedEmpIds.length > 0 && (
            <button
              type="button"
              onClick={() => setBulkDrawer((prev) => ({ ...prev, isOpen: true }))}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Assign to Selected ({selectedEmpIds.length})</span>
            </button>
          )
        }
      />

      <FeatureControlNav />

      {/* Filter Bar */}
      <div className="bg-card border border-border p-3.5 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {/* Employee search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Branch filter */}
          <div>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
            >
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b === 'all' ? 'All Branches' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Department filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'all' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Profile filter */}
          <div>
            <select
              value={profileFilter}
              onChange={(e) => setProfileFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
            >
              {profileTypes.map((p) => (
                <option key={p} value={p}>
                  {p === 'all' ? 'All Profiles' : p}
                </option>
              ))}
            </select>
          </div>

          {/* Feature column filter */}
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter feature columns..."
              value={featureSearch}
              onChange={(e) => setFeatureSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/80 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground">Source Levels:</span>
            <span>🏢 Company</span>
            <span>👤 Profile</span>
            <span>🔑 Individual Override</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Allowed
            </span>
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Denied
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <Clock className="w-3 h-3" />
              Temporary Grant
            </span>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/80 backdrop-blur-md sticky top-0 z-20 text-[11px] uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                {/* Select All Checkbox */}
                <th className="px-3 py-3 sticky left-0 bg-muted z-30 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    {selectedEmpIds.length === filteredEmployees.length &&
                    filteredEmployees.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>

                {/* Personnel Sticky Header */}
                <th className="px-4 py-3 sticky left-10 bg-muted z-30 min-w-[220px] shadow-xs">
                  Personnel / Designation
                </th>

                {/* Feature Column Headers */}
                {filteredFeatures.map((f) => (
                  <th
                    key={f.code}
                    className="px-2 py-3 text-center min-w-[130px] select-none"
                    title={f.name}
                  >
                    <div className="font-mono text-[11px] font-bold text-foreground">
                      {f.code}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-normal truncate max-w-[120px]">
                      {f.module}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredEmployees.map((emp) => {
                const isSelected = selectedEmpIds.includes(emp.id)

                return (
                  <tr
                    key={emp.id}
                    className={`hover:bg-muted/30 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    {/* Checkbox Cell */}
                    <td className="px-3 py-2 sticky left-0 bg-card z-10 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectEmp(emp.id)}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Personnel Sticky Cell */}
                    <td className="px-4 py-2 sticky left-10 bg-card z-10 border-r border-border font-medium">
                      <div className="flex items-center gap-2">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-6 h-6 rounded-full object-cover border border-border"
                        />
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate">
                            {emp.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground block truncate">
                            {emp.designation} • {emp.profileType}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Feature Cells */}
                    {filteredFeatures.map((f) => {
                      const resolution = resolveAccess(emp, f.code, settings.companyType)
                      const isAllowed = resolution.allowed
                      const decisiveLevel = resolution.decidedByLevel

                      // Check if temporary individual override exists
                      const override = emp.featureOverrides?.[f.code]
                      const isTemporary = Boolean(override?.validTo)

                      // Calculate remaining days for temporary badge
                      let daysLeft: number | null = null
                      if (override?.validTo) {
                        const target = new Date(override.validTo).getTime()
                        const now = new Date().getTime()
                        daysLeft = Math.ceil((target - now) / 86400000)
                      }

                      return (
                        <td key={f.code} className="px-2 py-1.5 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleCellClick(emp, f.code)}
                            className={`w-full py-1 px-1.5 rounded-md border text-[11px] font-medium transition-all hover:scale-105 active:scale-95 flex items-center justify-between gap-1 shadow-2xs ${
                              isAllowed
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            }`}
                            title={`Click to edit override for ${f.code}\nDecided by: ${decisiveLevel}`}
                          >
                            <span className="text-xs">
                              {getSourceIcon(decisiveLevel)}
                            </span>
                            <span className="truncate">
                              {isAllowed ? 'Allow' : 'Deny'}
                            </span>

                            {isTemporary && daysLeft !== null && daysLeft > 0 ? (
                              <span
                                className="px-1 py-0.2 rounded text-[9px] bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200 font-bold"
                                title={`Temporary grant: expires in ${daysLeft} days`}
                              >
                                {daysLeft}d
                              </span>
                            ) : override?.locked ? (
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                            ) : null}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SINGLE CELL OVERRIDE SIDE DRAWER */}
      {drawer.isOpen && drawer.employee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Edit Personnel Override
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Feature: <span className="font-mono font-bold text-primary">{drawer.featureCode}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawer((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Employee Header */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center gap-3">
                <img
                  src={drawer.employee.avatar}
                  alt={drawer.employee.name}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <div className="text-xs">
                  <p className="font-semibold text-foreground">{drawer.employee.name}</p>
                  <p className="text-muted-foreground">
                    {drawer.employee.designation} • {drawer.employee.profileType}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    ID: {drawer.employee.id} • {drawer.employee.branch}
                  </p>
                </div>
              </div>

              {/* State Selection */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Assignment State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Inherit', 'Allow', 'Deny'] as AssignmentState[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setDrawer((prev) => ({ ...prev, state: st }))}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                        drawer.state === st
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-card text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {drawer.state === 'Inherit' && 'Defers to profile & department rules.'}
                  {drawer.state === 'Allow' && 'Forces feature to ON for this employee.'}
                  {drawer.state === 'Deny' && 'Forces feature to OFF for this employee.'}
                </p>
              </div>

              {/* Lock Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Lock Grant
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Prevents profile changes from overriding this setting
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawer((prev) => ({ ...prev, locked: !prev.locked }))}
                  className={`p-2 rounded-lg border transition ${
                    drawer.locked
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-card text-muted-foreground border-border'
                  }`}
                >
                  {drawer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>

              {/* Validity Dates (Temporary Grant) */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground block">
                  Validity Window (Temporary Access)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">
                      Valid From:
                    </span>
                    <input
                      type="date"
                      value={drawer.validFrom}
                      onChange={(e) =>
                        setDrawer((prev) => ({ ...prev, validFrom: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">
                      Valid To (Expiry):
                    </span>
                    <input
                      type="date"
                      value={drawer.validTo}
                      onChange={(e) =>
                        setDrawer((prev) => ({ ...prev, validTo: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Audit Reason */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Change Reason (Audit Trail Required)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Temporary field sprint coordination for client project..."
                  value={drawer.reason}
                  onChange={(e) =>
                    setDrawer((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full p-2.5 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              {/* Direct Link to "Why does X have this?" */}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/hr/features/explainer?empId=${drawer.employee?.id}&feature=${drawer.featureCode}`
                  )
                }
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Explain Why {drawer.employee.name} Has This</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDrawer((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDrawer}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-xs font-semibold text-primary-foreground shadow-sm"
              >
                Save Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ASSIGNMENT SIDE DRAWER */}
      {bulkDrawer.isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Bulk Feature Assignment
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Applying override to {selectedEmpIds.length} selected employees
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBulkDrawer((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Feature Select */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Target Feature
                </label>
                <select
                  value={bulkDrawer.featureCode}
                  onChange={(e) =>
                    setBulkDrawer((prev) => ({ ...prev, featureCode: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none"
                >
                  {FEATURE_MASTER.map((f) => (
                    <option key={f.code} value={f.code}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* State Selection */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Assignment State
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Inherit', 'Allow', 'Deny'] as AssignmentState[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setBulkDrawer((prev) => ({ ...prev, state: st }))}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                        bulkDrawer.state === st
                          ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                          : 'bg-card text-foreground border-border hover:bg-muted'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validity Window */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground block">
                  Validity Window (Optional Expiry)
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">
                      Valid From:
                    </span>
                    <input
                      type="date"
                      value={bulkDrawer.validFrom}
                      onChange={(e) =>
                        setBulkDrawer((prev) => ({ ...prev, validFrom: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block mb-1">
                      Valid To:
                    </span>
                    <input
                      type="date"
                      value={bulkDrawer.validTo}
                      onChange={(e) =>
                        setBulkDrawer((prev) => ({ ...prev, validTo: e.target.value }))
                      }
                      className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Audit Reason */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Change Reason
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Special operational allowance for quarterly audit squad..."
                  value={bulkDrawer.reason}
                  onChange={(e) =>
                    setBulkDrawer((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className="w-full p-2.5 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBulkDrawer((prev) => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveBulk}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-xs font-semibold text-primary-foreground shadow-sm"
              >
                Apply to {selectedEmpIds.length} Members
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
