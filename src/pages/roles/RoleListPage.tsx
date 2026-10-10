import { ExportNotice } from '@/components/common/ExportNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useRoles } from '@/context/RoleContext'
import { RolesNav } from '@/pages/roles/RolesNav'
import {
  Building2,
  Check,
  ChevronRight,
  Eye,
  KeyRound,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const RoleListPage: React.FC = () => {
  const navigate = useNavigate()
  const { roles, createRole } = useRoles()
  const [search, setSearch] = useState('')

  // Create custom role modal
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    name: '',
    code: '',
    description: '',
  })

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!createModal.name || !createModal.code) return

    const created = createRole(
      {
        name: createModal.name,
        code: createModal.code.toUpperCase().replace(/\s+/g, '_'),
        description: createModal.description || 'Custom company operational role',
        featureRules: {},
      },
      `Created custom company role: ${createModal.name}`
    )

    setCreateModal({ isOpen: false, name: '', code: '', description: '' })
    navigate(`/hr/roles/editor?roleId=${created.id}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Access Governance"
        subtitle="Manage system roles, security classifications, and member counts across the organization"
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Roles & Permissions', href: '/hr/roles/list' },
          { label: 'Directory' },
        ]}
        action={
          <button
            type="button"
            onClick={() => setCreateModal((prev) => ({ ...prev, isOpen: true }))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        }
      />

      <RolesNav />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Total Configured Roles
            </span>
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">{roles.length}</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            9 Built-in System Roles • {roles.filter((r) => !r.isSystem).length} Custom
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Active Member Grants
            </span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">
            {roles.reduce((acc, r) => acc + r.memberCount, 0)}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Distributed across 3 branches & 4 departments
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Security Posture
            </span>
            <ShieldCheck className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-2">Compliant</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Least-privilege data scopes enforced
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter roles by name, classification, or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-card border border-border rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* ROLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => {
          const ruleCount = Object.keys(role.featureRules).length

          return (
            <div
              key={role.id}
              className="bg-card border border-border rounded-xl p-5 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {role.name}
                      </h3>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {role.code}
                      </span>
                    </div>
                  </div>

                  {role.isSystem ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary">
                      System Role
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Custom
                    </span>
                  )}
                </div>

                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  {role.description}
                </p>

                {/* Badges */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Assigned Members:
                  </span>
                  <span className="font-semibold text-foreground">
                    {role.memberCount} Personnel
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Configured Rules:
                  </span>
                  <span className="font-mono font-medium text-primary">
                    {ruleCount > 0 ? `${ruleCount} Features` : 'Inherited'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <Link
                  to={`/hr/roles/preview?roleId=${role.id}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition"
                >
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Preview</span>
                </Link>

                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/hr/roles/assignments?roleId=${role.id}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground transition"
                  >
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Members</span>
                  </Link>
                  <Link
                    to={`/hr/roles/editor?roleId=${role.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold shadow-2xs transition"
                  >
                    <span>Edit Permissions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Custom Role Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setCreateModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Create Custom Enterprise Role</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add a specialized organizational security role with custom action permissions and data scopes.
            </p>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plant Safety Officer"
                  value={createModal.name}
                  onChange={(e) =>
                    setCreateModal((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Role Identifier Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. PLANT_SAFETY_OFFICER"
                  value={createModal.code}
                  onChange={(e) =>
                    setCreateModal((prev) => ({ ...prev, code: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground uppercase focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Role Description & Scope Purpose
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Responsible for statutory safety audits and plant incident logging..."
                  value={createModal.description}
                  onChange={(e) =>
                    setCreateModal((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full p-2.5 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3.5 py-1.5 rounded-lg border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
                >
                  Create & Configure Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
