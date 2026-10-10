import { FEATURE_MAP, FEATURE_MASTER } from '@/access/features'
import type { ActionPermission, DataScope } from '@/access/types'
import { ExportNotice } from '@/components/common/ExportNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useRoles } from '@/context/RoleContext'
import type { RoleFeatureRule } from '@/roles/types'
import { RolesNav } from '@/pages/roles/RolesNav'
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronDown,
  Info,
  KeyRound,
  RotateCcw,
  Save,
  Search,
  Shield,
  ShieldAlert,
  Square,
  UserCheck,
} from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const ACTIONS: { key: ActionPermission; label: string }[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete-cancel', label: 'Delete / Cancel' },
  { key: 'approve', label: 'Approve' },
  { key: 'export', label: 'Export' },
  { key: 'configure', label: 'Configure' },
  { key: 'view-sensitive', label: 'View Sensitive' },
  { key: 'act-on-behalf', label: 'Act On Behalf' },
]

const SCOPES: DataScope[] = [
  'Self',
  'Direct reports',
  'Team',
  'Department',
  'Branch',
  'Entity',
  'All',
]

export const RolePermissionEditorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { roles, updateRolePermissions } = useRoles()

  const activeRoleId = searchParams.get('roleId') || roles[0]?.id || 'ROLE-HR-ADMIN'
  const activeRole = useMemo(
    () => roles.find((r) => r.id === activeRoleId) || roles[0],
    [roles, activeRoleId]
  )

  // Local editing state for feature rules
  const [rules, setRules] = useState<Record<string, RoleFeatureRule>>({})
  const [search, setSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Sync when activeRole changes
  useEffect(() => {
    if (activeRole) {
      setRules({ ...activeRole.featureRules })
      setHasUnsavedChanges(false)
    }
  }, [activeRole])

  const modules = ['all', ...Array.from(new Set(FEATURE_MASTER.map((f) => f.module)))]

  const filteredFeatures = useMemo(() => {
    return FEATURE_MASTER.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.code.toLowerCase().includes(search.toLowerCase())
      const matchModule = selectedModule === 'all' || f.module === selectedModule
      return matchSearch && matchModule
    })
  }, [search, selectedModule])

  // Toggle Action Permission for a Feature
  const handleTogglePermission = (featureCode: string, action: ActionPermission) => {
    setRules((prev) => {
      const existing = prev[featureCode] || { permissions: [], scope: 'Self' }
      const hasAction = existing.permissions.includes(action)
      const updatedPermissions = hasAction
        ? existing.permissions.filter((a) => a !== action)
        : [...existing.permissions, action]

      return {
        ...prev,
        [featureCode]: {
          ...existing,
          permissions: updatedPermissions,
        },
      }
    })
    setHasUnsavedChanges(true)
  }

  // Change Data Scope for a Feature
  const handleScopeChange = (featureCode: string, scope: DataScope) => {
    setRules((prev) => {
      const existing = prev[featureCode] || { permissions: ['view'], scope: 'Self' }
      return {
        ...prev,
        [featureCode]: {
          ...existing,
          scope,
        },
      }
    })
    setHasUnsavedChanges(true)
  }

  // Change Custom Scope Rule expression
  const handleCustomScopeRuleChange = (featureCode: string, customScopeRule: string) => {
    setRules((prev) => {
      const existing = prev[featureCode] || { permissions: ['view'], scope: 'Department' }
      return {
        ...prev,
        [featureCode]: {
          ...existing,
          customScopeRule,
        },
      }
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    if (!activeRole) return
    updateRolePermissions(
      activeRole.id,
      rules,
      `Updated permission and scope rules for role: ${activeRole.name}`
    )
    setHasUnsavedChanges(false)
    alert(`Permissions successfully updated for ${activeRole.name}.`)
  }

  // High-Risk Elevation Detection (Export or View-Sensitive with All Scope)
  const highRiskWarnings = useMemo(() => {
    const list: { featureCode: string; reason: string }[] = []
    Object.entries(rules).forEach(([fCode, rule]) => {
      if (rule.scope === 'All') {
        const hasExport = rule.permissions.includes('export')
        const hasSensitive = rule.permissions.includes('view-sensitive')
        if (hasExport || hasSensitive) {
          list.push({
            featureCode: fCode,
            reason: `Scope is set to "All" (Company-Wide) with ${hasExport ? 'Export' : ''} ${
              hasExport && hasSensitive ? 'and ' : ''
            }${hasSensitive ? 'View-Sensitive Data' : ''}.`,
          })
        }
      }
    })
    return list
  }, [rules])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Permission & Action Matrix"
        subtitle={`Configure the fine-grained action capabilities and data visibility scope for "${activeRole?.name}"`}
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Roles & Permissions', href: '/hr/roles/list' },
          { label: 'Permission Matrix Editor' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition ${
                hasUnsavedChanges
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        }
      />

      <RolesNav />

      {/* Role Picker Banner */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Selected Target Role
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={activeRole?.id}
                onChange={(e) => setSearchParams({ roleId: e.target.value })}
                className="font-bold text-sm bg-background border border-input rounded-lg px-3 py-1.5 text-foreground focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code}) {r.isSystem ? '• System' : '• Custom'}
                  </option>
                ))}
              </select>
              {hasUnsavedChanges && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 animate-pulse">
                  Unsaved Changes
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground max-w-md">
          {activeRole?.description}
        </div>
      </div>

      {/* High-Risk Compliance Warning Banner */}
      {highRiskWarnings.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex items-start gap-3.5 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200">
              Elevated Security Risk: Company-Wide (All) Scope with Sensitive Grants
            </h4>
            <p className="mt-1 text-amber-800 dark:text-amber-300 leading-relaxed">
              The following features grant unrestricted export or confidential view-sensitive capabilities across the entire organization:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {highRiskWarnings.map((w) => (
                <span
                  key={w.featureCode}
                  className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono text-[11px] font-semibold border border-amber-300 dark:border-amber-700"
                >
                  {w.featureCode}: {w.reason}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs text-xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search feature actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-1.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
        >
          {modules.map((m) => (
            <option key={m} value={m}>
              {m === 'all' ? 'All Modules' : m}
            </option>
          ))}
        </select>
      </div>

      {/* MATRIX EDITOR TABLE */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/80 backdrop-blur-md sticky top-0 z-20 text-[11px] uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-muted z-30 min-w-[220px] shadow-xs">
                  Feature / Module
                </th>
                <th className="px-3 py-3 text-center min-w-[150px]">
                  Data Scope
                </th>
                {ACTIONS.map((act) => (
                  <th key={act.key} className="px-2 py-3 text-center min-w-[85px] select-none">
                    {act.label}
                  </th>
                ))}
                <th className="px-3 py-3 min-w-[200px]">
                  Custom Scope Rule Expression
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredFeatures.map((f) => {
                const rule = rules[f.code] || { permissions: [], scope: 'Self' }
                const isAllScope = rule.scope === 'All'

                return (
                  <tr key={f.code} className="hover:bg-muted/30 transition-colors">
                    {/* Feature Sticky Header Cell */}
                    <td className="px-4 py-2.5 sticky left-0 bg-card z-10 border-r border-border font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {f.code}
                        </span>
                        {f.is_core && (
                          <span className="text-[9px] px-1 rounded bg-muted text-muted-foreground">
                            Core
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                        {f.name}
                      </div>
                    </td>

                    {/* Data Scope Dropdown Cell */}
                    <td className="px-2 py-2 text-center align-middle">
                      <select
                        value={rule.scope}
                        onChange={(e) =>
                          handleScopeChange(f.code, e.target.value as DataScope)
                        }
                        className={`w-full px-2 py-1.5 rounded-lg border text-xs font-medium focus:outline-none transition ${
                          isAllScope
                            ? 'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800'
                            : 'bg-background border-input text-foreground'
                        }`}
                      >
                        {SCOPES.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Action Checkbox Columns */}
                    {ACTIONS.map((act) => {
                      const isGranted = rule.permissions.includes(act.key)
                      const isHighRiskCell =
                        isAllScope &&
                        isGranted &&
                        (act.key === 'export' || act.key === 'view-sensitive')

                      return (
                        <td key={act.key} className="px-2 py-2 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(f.code, act.key)}
                            className={`p-1.5 rounded-md border transition-all ${
                              isHighRiskCell
                                ? 'bg-amber-100 text-amber-800 border-amber-400 dark:bg-amber-950 dark:text-amber-200'
                                : isGranted
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-muted/30 text-muted-foreground border-border hover:bg-muted'
                            }`}
                            title={`${act.label} permission on ${f.code}: ${
                              isGranted ? 'Granted' : 'Denied'
                            }`}
                          >
                            {isGranted ? (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            ) : (
                              <span className="w-3.5 h-3.5 block" />
                            )}
                          </button>
                        </td>
                      )
                    })}

                    {/* Custom Scope Rule Input */}
                    <td className="px-2 py-2 align-middle">
                      <input
                        type="text"
                        placeholder="e.g. Branch = Pune AND Dept = Stores"
                        value={rule.customScopeRule || ''}
                        onChange={(e) =>
                          handleCustomScopeRuleChange(f.code, e.target.value)
                        }
                        className="w-full px-2 py-1 text-[11px] font-mono bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
