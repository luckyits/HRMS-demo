import { FEATURE_MASTER } from '@/access/features'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { ExportNotice } from '@/components/common/ExportNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { ScopeBadge } from '@/components/common/ScopeBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useDemo } from '@/context/DemoContext'
import { useFeatureControl } from '@/context/FeatureControlContext'
import { MOCK_COMPANIES } from '@/mock/companies'
import { FeatureControlNav } from '@/pages/features/FeatureControlNav'
import {
  AlertTriangle,
  Building2,
  Check,
  CheckCircle2,
  Info,
  Layers,
  Lock,
  Search,
  Unlock,
  XCircle,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const FeatureCataloguePage: React.FC = () => {
  const { settings } = useDemo()
  const { companyToggles, updateCompanyToggle } = useFeatureControl()

  const [search, setSearch] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('all')

  // Find active company
  const activeCompany = useMemo(() => {
    return (
      MOCK_COMPANIES.find((c) => c.industry === settings.companyType) ||
      MOCK_COMPANIES[0]
    )
  }, [settings.companyType])

  const toggles = companyToggles[activeCompany.id] || {}

  // Dependency Confirmation Dialog state
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean
    featureCode: string
    featureName: string
    dependentFeatures: string[]
    pendingAction: 'turnOff'
  }>({
    isOpen: false,
    featureCode: '',
    featureName: '',
    dependentFeatures: [],
    pendingAction: 'turnOff',
  })

  // Group features by module
  const modules = useMemo(() => {
    const list = Array.from(new Set(FEATURE_MASTER.map((f) => f.module)))
    return ['all', ...list]
  }, [])

  const filteredFeatures = useMemo(() => {
    return FEATURE_MASTER.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.code.toLowerCase().includes(search.toLowerCase()) ||
        f.module.toLowerCase().includes(search.toLowerCase())
      const matchModule = selectedModule === 'all' || f.module === selectedModule
      return matchSearch && matchModule
    })
  }, [search, selectedModule])

  // Group filtered features by module
  const groupedFeatures = useMemo(() => {
    const groups: Record<string, typeof FEATURE_MASTER> = {}
    filteredFeatures.forEach((f) => {
      if (!groups[f.module]) groups[f.module] = []
      groups[f.module].push(f)
    })
    return groups
  }, [filteredFeatures])

  // Handle Toggle Switch with Dependency Checks
  const handleToggle = (featureCode: string) => {
    const current = toggles[featureCode]
    const isCurrentlyOn = current ? current.state === 'Allow' : true

    if (isCurrentlyOn) {
      // Check if other features depend on this one
      const dependents = FEATURE_MASTER.filter((f) =>
        f.depends_on?.includes(featureCode)
      ).map((f) => `${f.name} (${f.code})`)

      if (dependents.length > 0) {
        const featureDef = FEATURE_MASTER.find((f) => f.code === featureCode)
        setWarningModal({
          isOpen: true,
          featureCode,
          featureName: featureDef?.name || featureCode,
          dependentFeatures: dependents,
          pendingAction: 'turnOff',
        })
        return
      }

      // Safe to turn off
      updateCompanyToggle(
        activeCompany.id,
        featureCode,
        { state: 'Deny' },
        `Disabled company-wide ceiling toggle for ${featureCode}`
      )
    } else {
      // Turn back ON
      updateCompanyToggle(
        activeCompany.id,
        featureCode,
        { state: 'Allow' },
        `Enabled company-wide ceiling toggle for ${featureCode}`
      )
    }
  }

  // Handle Lock Toggle
  const handleLockToggle = (featureCode: string) => {
    const current = toggles[featureCode]
    const isLocked = Boolean(current?.locked)
    const currentState = current?.state || 'Allow'

    updateCompanyToggle(
      activeCompany.id,
      featureCode,
      { locked: !isLocked, state: currentState },
      `${!isLocked ? 'Locked' : 'Unlocked'} company policy rule for ${featureCode}`
    )
  }

  const confirmDisableWithDependencies = () => {
    updateCompanyToggle(
      activeCompany.id,
      warningModal.featureCode,
      { state: 'Deny' },
      `Disabled company toggle despite dependencies: ${warningModal.dependentFeatures.join(', ')}`
    )
    setWarningModal((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enterprise Feature Catalogue"
        subtitle={`Module-level master controls and company ceiling toggles for ${activeCompany.name} (${activeCompany.industry})`}
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Feature Control', href: '/hr/features/catalogue' },
          { label: 'Catalogue' },
        ]}
      />

      <FeatureControlNav />

      {/* Company Ceiling Info Banner */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                Active Organization: {activeCompany.name}
              </h4>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                {activeCompany.code}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rule 1 Ceiling: Features turned OFF here are denied organization-wide regardless of profile settings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExportNotice compact />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-2xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search features by name, code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {/* Module Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
          {modules.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedModule(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedModule === m
                  ? 'bg-primary text-primary-foreground font-semibold shadow-2xs'
                  : 'bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {m === 'all' ? 'All Modules' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Groups Display */}
      <div className="space-y-6">
        {Object.entries(groupedFeatures).map(([moduleName, features]) => (
          <div
            key={moduleName}
            className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Module: {moduleName}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {features.length} Features
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {features.map((f) => {
                const grant = toggles[f.code]
                const isEnabled = grant ? grant.state === 'Allow' : true
                const isLocked = Boolean(grant?.locked)

                return (
                  <div
                    key={f.code}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isEnabled
                        ? 'bg-card border-border/80 shadow-2xs'
                        : 'bg-muted/30 border-rose-200 dark:border-rose-950/60 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold text-foreground">
                              {f.code}
                            </span>
                            {f.is_core && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-primary/10 text-primary font-semibold">
                                Core
                              </span>
                            )}
                            {f.depends_on && f.depends_on.length > 0 && (
                              <span
                                title={`Depends on: ${f.depends_on.join(', ')}`}
                                className="px-1.5 py-0.2 rounded text-[9px] bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900"
                              >
                                Depends on: {f.depends_on[0]}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-foreground mt-1">
                            {f.name}
                          </h4>
                        </div>

                        {/* Lock Button */}
                        <button
                          type="button"
                          onClick={() => handleLockToggle(f.code)}
                          title={isLocked ? 'Locked (Higher level cannot be overridden)' : 'Unlocked (Configurable by profiles)'}
                          className={`p-1.5 rounded-lg border transition ${
                            isLocked
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-muted/40 text-muted-foreground border-border hover:text-foreground'
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            <Unlock className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {f.description}
                      </p>
                    </div>

                    {/* Bottom Status & Switch */}
                    <div className="mt-3.5 pt-2.5 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs">
                        {isEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Company Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            <XCircle className="w-3 h-3" />
                            Company Disabled
                          </span>
                        )}
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggle(f.code)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                          isEnabled ? 'bg-primary justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                        }`}
                        title={isEnabled ? 'Click to disable company-wide' : 'Click to enable company-wide'}
                      >
                        <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dependency Warning Dialog */}
      <ConfirmDialog
        isOpen={warningModal.isOpen}
        title={`Warning: Dependency Conflict for ${warningModal.featureName}`}
        description={`Turning OFF "${warningModal.featureName}" (${warningModal.featureCode}) will impact the following dependent modules:\n\n• ${warningModal.dependentFeatures.join('\n• ')}\n\nUnder Rule 1 (Company Ceiling), these dependent features will automatically be denied or experience errors. Are you sure you want to disable it?`}
        confirmText="Proceed & Disable"
        cancelText="Keep Enabled"
        isDestructive
        onConfirm={confirmDisableWithDependencies}
        onCancel={() => setWarningModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
