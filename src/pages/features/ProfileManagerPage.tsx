import { FEATURE_MASTER } from '@/access/features'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useFeatureControl } from '@/context/FeatureControlContext'
import { FeatureControlNav } from '@/pages/features/FeatureControlNav'
import {
  Copy,
  Layers,
  Lock,
  Plus,
  RefreshCw,
  Search,
  Unlock,
  Users,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

export const ProfileManagerPage: React.FC = () => {
  const {
    profiles,
    updateProfileFeature,
    createCustomProfile,
    cloneProfile,
    employees,
  } = useFeatureControl()

  const [search, setSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState('all')

  // Modals
  const [cloneModal, setCloneModal] = useState<{
    isOpen: boolean
    sourceKey: string
    newKey: string
    newName: string
  }>({
    isOpen: false,
    sourceKey: 'Office Staff',
    newKey: '',
    newName: '',
  })

  const [customModal, setCustomModal] = useState<{
    isOpen: boolean
    profileKey: string
    name: string
  }>({
    isOpen: false,
    profileKey: '',
    name: '',
  })

  // Save/Impact Confirmation Dialog
  const [impactModal, setImpactModal] = useState<{
    isOpen: boolean
    profileKey: string
    featureCode: string
    newState: 'ON' | 'OPTIONAL' | 'OFF'
    affectedCount: number
  }>({
    isOpen: false,
    profileKey: '',
    featureCode: '',
    newState: 'ON',
    affectedCount: 0,
  })

  const profileKeys = Object.keys(profiles)

  const modules = ['all', ...Array.from(new Set(FEATURE_MASTER.map((f) => f.module)))]

  const filteredFeatures = FEATURE_MASTER.filter((f) => {
    const matchSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase())
    const matchModule = selectedModule === 'all' || f.module === selectedModule
    return matchSearch && matchModule
  })

  // Cycle state: ON -> OPTIONAL -> OFF -> ON
  const cycleState = (current: 'ON' | 'OPTIONAL' | 'OFF'): 'ON' | 'OPTIONAL' | 'OFF' => {
    if (current === 'ON') return 'OPTIONAL'
    if (current === 'OPTIONAL') return 'OFF'
    return 'ON'
  }

  const handleCellClick = (profileKey: string, featureCode: string) => {
    const currentState = profiles[profileKey]?.features[featureCode] || 'OFF'
    const nextState = cycleState(currentState)

    // Count affected employees with this profile
    const affected = employees.filter((e) => e.profileType === profileKey).length

    setImpactModal({
      isOpen: true,
      profileKey,
      featureCode,
      newState: nextState,
      affectedCount: affected,
    })
  }

  const handleConfirmImpact = () => {
    updateProfileFeature(
      impactModal.profileKey,
      impactModal.featureCode,
      impactModal.newState,
      false,
      `Updated ${impactModal.profileKey} matrix rule for ${impactModal.featureCode} to ${impactModal.newState}`
    )
    setImpactModal((prev) => ({ ...prev, isOpen: false }))
  }

  const handleCloneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cloneModal.newKey || !cloneModal.newName) return
    cloneProfile(
      cloneModal.sourceKey,
      cloneModal.newKey,
      cloneModal.newName,
      `Cloned new profile ${cloneModal.newName} from ${cloneModal.sourceKey}`
    )
    setCloneModal({ isOpen: false, sourceKey: 'Office Staff', newKey: '', newName: '' })
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customModal.profileKey || !customModal.name) return

    // Base features with OFF defaults except core
    const features: Record<string, 'ON' | 'OPTIONAL' | 'OFF'> = {}
    FEATURE_MASTER.forEach((f) => {
      features[f.code] = f.is_core ? 'ON' : 'OFF'
    })

    createCustomProfile(
      {
        profileKey: customModal.profileKey,
        name: customModal.name,
        features,
      },
      `Created custom profile ${customModal.name}`
    )
    setCustomModal({ isOpen: false, profileKey: '', name: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workforce Profile Manager"
        subtitle="Manage the feature entitlement matrix across all 7 organizational personas and custom profiles"
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Feature Control', href: '/hr/features/catalogue' },
          { label: 'Profile Manager' },
        ]}
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCloneModal((prev) => ({ ...prev, isOpen: true }))}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-border bg-card hover:bg-muted text-foreground transition shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Clone Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setCustomModal((prev) => ({ ...prev, isOpen: true }))}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Profile</span>
            </button>
          </div>
        }
      />

      <FeatureControlNav />

      {/* Filter and Legend Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search features..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="px-3 py-1.5 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none"
          >
            {modules.map((m) => (
              <option key={m} value={m}>
                {m === 'all' ? 'All Modules' : m}
              </option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span>Click any cell to cycle:</span>
          <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            ON (Enabled)
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-700 dark:text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            OPTIONAL (Off by default)
          </span>
          <span className="flex items-center gap-1 font-medium text-rose-700 dark:text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            OFF (Disabled)
          </span>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto max-h-[650px] relative">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/80 backdrop-blur-md sticky top-0 z-20 text-[11px] uppercase font-semibold text-muted-foreground border-b border-border">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-muted z-30 min-w-[240px] shadow-xs">
                  Feature Code / Name
                </th>
                {profileKeys.map((pk) => {
                  const empCount = employees.filter((e) => e.profileType === pk).length
                  return (
                    <th key={pk} className="px-3 py-3 text-center min-w-[140px]">
                      <div className="font-bold text-foreground">{pk}</div>
                      <div className="text-[10px] text-muted-foreground font-normal lowercase">
                        {empCount} employees
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredFeatures.map((f) => (
                <tr key={f.code} className="hover:bg-muted/30 transition-colors">
                  {/* Sticky Feature Name Header Cell */}
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
                    <div className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                      {f.name}
                    </div>
                  </td>

                  {/* Profile Cells */}
                  {profileKeys.map((pk) => {
                    const prof = profiles[pk]
                    const state = prof?.features[f.code] || 'OFF'

                    let badgeStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                    if (state === 'ON') {
                      badgeStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    } else if (state === 'OPTIONAL') {
                      badgeStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }

                    return (
                      <td key={pk} className="px-2 py-2 text-center align-middle">
                        <button
                          type="button"
                          onClick={() => handleCellClick(pk, f.code)}
                          className={`w-full py-1.5 px-2 rounded-lg border text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-2xs flex items-center justify-center gap-1 ${badgeStyle}`}
                          title={`Click to cycle (Currently: ${state})`}
                        >
                          <span>{state}</span>
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Confirmation Dialog */}
      <ConfirmDialog
        isOpen={impactModal.isOpen}
        title={`Apply Profile Change to ${impactModal.profileKey}?`}
        description={`You are changing "${impactModal.featureCode}" to ${impactModal.newState} for profile "${impactModal.profileKey}".\n\nThere are currently ${impactModal.affectedCount} employees assigned to this profile in the workforce roster. Apply this update now?`}
        confirmText="Apply to All Members"
        cancelText="Cancel"
        onConfirm={handleConfirmImpact}
        onCancel={() => setImpactModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Clone Profile Modal */}
      {cloneModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setCloneModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Copy className="w-4 h-4 text-primary" />
              <span>Clone Workforce Profile</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Create a duplicate profile with an existing feature matrix as baseline.
            </p>

            <form onSubmit={handleCloneSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Source Baseline Profile
                </label>
                <select
                  value={cloneModal.sourceKey}
                  onChange={(e) =>
                    setCloneModal((prev) => ({ ...prev, sourceKey: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                >
                  {profileKeys.map((pk) => (
                    <option key={pk} value={pk}>
                      {pk}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  New Profile Code / Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail Supervisor"
                  value={cloneModal.newKey}
                  onChange={(e) =>
                    setCloneModal((prev) => ({ ...prev, newKey: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retail Branch Supervisor Profile"
                  value={cloneModal.newName}
                  onChange={(e) =>
                    setCloneModal((prev) => ({ ...prev, newName: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCloneModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
                >
                  Confirm & Clone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Custom Profile Modal */}
      {customModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 relative">
            <button
              type="button"
              onClick={() => setCustomModal((prev) => ({ ...prev, isOpen: false }))}
              className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              <span>Create Custom Profile</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add a brand new profile archetype to the organization.
            </p>

            <form onSubmit={handleCustomSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Profile Identifier Key
                </label>
                <input
                  type="text"
                  placeholder="e.g. Part-Time Specialist"
                  value={customModal.profileKey}
                  onChange={(e) =>
                    setCustomModal((prev) => ({ ...prev, profileKey: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">
                  Profile Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Part-Time Technical Consultant"
                  value={customModal.name}
                  onChange={(e) =>
                    setCustomModal((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
