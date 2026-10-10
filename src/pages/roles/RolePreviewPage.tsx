import { FEATURE_MAP, FEATURE_MASTER } from '@/access/features'
import { PageHeader } from '@/components/common/PageHeader'
import { ScopeBadge } from '@/components/common/ScopeBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useDemo } from '@/context/DemoContext'
import { useRoles } from '@/context/RoleContext'
import { RolesNav } from '@/pages/roles/RolesNav'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  KeyRound,
  Layers,
  Play,
  Shield,
  Sliders,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const RolePreviewPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { roles } = useRoles()
  const { settings, setRole } = useDemo()

  const defaultRoleId = searchParams.get('roleId') || 'ROLE-MANAGER'
  const [selectedRoleId, setSelectedRoleId] = useState<string>(defaultRoleId)

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || roles[0],
    [roles, selectedRoleId]
  )

  // Derive visible menu items for this role
  const simulatedMenus = useMemo(() => {
    if (!selectedRole) return []

    const items: { label: string; module: string; scope: string; actions: string[] }[] = []

    FEATURE_MASTER.forEach((f) => {
      const rule = selectedRole.featureRules[f.code]
      if (rule && rule.permissions.includes('view')) {
        items.push({
          label: f.name,
          module: f.module,
          scope: rule.scope,
          actions: rule.permissions,
        })
      }
    })

    return items
  }, [selectedRole])

  // Simulate persona toggle
  const handleSimulateRole = () => {
    if (selectedRole.name.includes('Admin')) {
      setRole('HR Admin')
    } else if (selectedRole.name.includes('Manager') || selectedRole.name.includes('Supervisor')) {
      setRole('Manager')
    } else {
      setRole('Employee')
    }
    navigate('/hr/dashboard')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title='Role Simulation: "View As This Role"'
        subtitle="Test and preview the exact menu navigation items, authorized action permissions, and data visibility boundary for any role"
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Roles & Permissions', href: '/hr/roles/list' },
          { label: 'Role Preview' },
        ]}
        action={
          <button
            type="button"
            onClick={handleSimulateRole}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Live App As {selectedRole?.name}</span>
          </button>
        }
      />

      <RolesNav />

      {/* Role Picker Banner */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Select Role to Preview
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="font-bold text-sm bg-background border border-input rounded-lg px-3 py-1.5 text-foreground focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-muted/40 p-2.5 rounded-lg border border-border">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
              Accessible Features
            </span>
            <span className="font-bold text-primary">
              {simulatedMenus.length} / 35
            </span>
          </div>
          <div className="w-px h-6 bg-border" />
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
              Role Classification
            </span>
            <span className="font-semibold text-foreground">
              {selectedRole?.isSystem ? 'Built-in System' : 'Custom'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulation Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Simulated Sidebar View */}
        <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Simulated Navigation Sidebar</span>
            </h3>
            <span className="text-xs text-muted-foreground font-mono">
              Role: {selectedRole?.code}
            </span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {simulatedMenus.length === 0 ? (
              <p className="text-xs text-muted-foreground p-4 text-center">
                This role currently has 0 viewable features assigned.
              </p>
            ) : (
              simulatedMenus.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border/80 bg-background/60 hover:bg-muted/40 transition flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-semibold text-foreground block">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Module: {item.module}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary mb-1">
                      Scope: {item.scope}
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      {item.actions.length} actions allowed
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Authorized Action Capabilities Matrix */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-primary" />
              <span>Authorized Action Capabilities</span>
            </h3>
            <span className="text-xs text-muted-foreground">
              Direct permission breakdown
            </span>
          </div>

          <div className="overflow-x-auto max-h-[550px] relative border border-border rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/80 sticky top-0 text-[10px] uppercase font-semibold text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-3 py-2.5">Feature Name</th>
                  <th className="px-2 py-2.5 text-center">Data Scope</th>
                  <th className="px-2 py-2.5 text-center">Approve</th>
                  <th className="px-2 py-2.5 text-center">Export</th>
                  <th className="px-2 py-2.5 text-center">Sensitive</th>
                  <th className="px-2 py-2.5 text-center">All Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {simulatedMenus.map((item, idx) => {
                  const canApprove = item.actions.includes('approve')
                  const canExport = item.actions.includes('export')
                  const canSensitive = item.actions.includes('view-sensitive')

                  return (
                    <tr key={idx} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {item.label}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {item.scope}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        {canApprove ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground opacity-40">-</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {canExport ? (
                          <span className="text-emerald-600 font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground opacity-40">-</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {canSensitive ? (
                          <span className="text-amber-600 font-bold">✓</span>
                        ) : (
                          <span className="text-muted-foreground opacity-40">-</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                          {item.actions.join(', ')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
