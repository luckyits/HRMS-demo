import { FEATURE_MAP, FEATURE_MASTER } from '@/access/features'
import { resolveAccess } from '@/access/resolver'
import { ExportNotice } from '@/components/common/ExportNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { ScopeBadge } from '@/components/common/ScopeBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useDemo } from '@/context/DemoContext'
import { useFeatureControl } from '@/context/FeatureControlContext'
import { FeatureControlNav } from '@/pages/features/FeatureControlNav'
import {
  AlertTriangle,
  ArrowRight,
  Building,
  CheckCircle2,
  Clock,
  HelpCircle,
  Layers,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  XCircle,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const AccessExplainerPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { settings } = useDemo()
  const { employees, companyToggles, profiles } = useFeatureControl()

  const defaultEmpId = searchParams.get('empId') || 'EMP-003' // Aarav Patel
  const defaultFeature = searchParams.get('feature') || 'VISIT'

  const [selectedEmpId, setSelectedEmpId] = useState<string>(defaultEmpId)
  const [selectedFeatureCode, setSelectedFeatureCode] = useState<string>(defaultFeature)

  // Find target employee
  const selectedEmp = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || employees[0]
  }, [employees, selectedEmpId])

  // Resolve access with full trace
  const resolution = useMemo(() => {
    if (!selectedEmp) return null
    return resolveAccess(selectedEmp, selectedFeatureCode, settings.companyType)
  }, [selectedEmp, selectedFeatureCode, settings.companyType, companyToggles, profiles, employees])

  const featureDef = FEATURE_MAP.get(selectedFeatureCode)

  return (
    <div className="space-y-6">
      <PageHeader
        title='"Why Does X Have This?" Access Explainer'
        subtitle="Visual vertical audit trace explaining exact hierarchy decisions, locked ceilings, and overrides"
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Feature Control', href: '/hr/features/catalogue' },
          { label: 'Access Explainer' },
        ]}
      />

      <FeatureControlNav />

      {/* Target Selector Bar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pick Employee */}
        <div>
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Select Personnel (Employee)</span>
          </label>
          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} ({e.id}) — {e.designation} [{e.profileType}]
              </option>
            ))}
          </select>
        </div>

        {/* Pick Feature */}
        <div>
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span>Select Feature to Audit</span>
          </label>
          <select
            value={selectedFeatureCode}
            onChange={(e) => setSelectedFeatureCode(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {FEATURE_MASTER.map((f) => (
              <option key={f.code} value={f.code}>
                {f.name} ({f.code}) — Module: {f.module}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEmp && resolution && featureDef && (
        <div className="space-y-6">
          {/* Decisive Highlight Banner */}
          <div
            className={`p-5 rounded-2xl border shadow-xs transition-all ${
              resolution.allowed
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-xl mt-0.5 ${
                    resolution.allowed
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  }`}
                >
                  {resolution.allowed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-bold text-foreground">
                      Final Entitlement Decision:
                    </span>
                    <span
                      className={`text-sm font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        resolution.allowed
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200'
                      }`}
                    >
                      {resolution.allowed ? 'ALLOWED (ENTITLED)' : 'DENIED (RESTRICTED)'}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-foreground/90">
                    {resolution.allowed ? 'Access Granted' : 'Access Prohibited'}: Decisive level is{' '}
                    <span className="font-bold underline decoration-primary decoration-2 underline-offset-4">
                      {resolution.decidedByLevel}
                    </span>
                    .
                  </p>

                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Employee: {selectedEmp.name} ({selectedEmp.id}) • Feature: {featureDef.name} ({featureDef.code})
                  </p>
                </div>
              </div>

              {/* Resolved Scope Pill */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-border/60">
                <span className="text-[11px] text-muted-foreground uppercase font-semibold">
                  Effective Data Scope
                </span>
                <ScopeBadge scope={resolution.scope === 'All' ? 'All' : resolution.scope === 'Team' ? 'Team' : 'Self'} />
              </div>
            </div>
          </div>

          {/* Vertical Trace Ladder: 1 Row Per Level */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>6-Level Hierarchy Resolution Ladder</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                Evaluated top-to-bottom according to Universal HRMS rules
              </span>
            </div>

            <div className="relative pl-6 space-y-4">
              {/* Vertical connector line */}
              <div className="absolute top-3 bottom-3 left-3 w-0.5 bg-border" />

              {resolution.trace.map((step, idx) => {
                const isDecisive = step.status === 'decisive'
                const isIgnored = step.status === 'ignored'
                const isOverridden = step.status === 'overridden'

                let nodeBg = 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                if (isDecisive) {
                  nodeBg = resolution.allowed
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                    : 'bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-950/60'
                } else if (isIgnored) {
                  nodeBg = 'bg-amber-500 text-white'
                }

                return (
                  <div key={idx} className="relative flex items-start group">
                    {/* Ladder Step Node */}
                    <div
                      className={`absolute -left-6 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shadow-xs z-10 transition-transform ${nodeBg}`}
                    >
                      {idx + 1}
                    </div>

                    {/* Step Card Body */}
                    <div
                      className={`flex-1 rounded-xl border p-4 text-xs transition-all ${
                        isDecisive
                          ? 'bg-card border-primary ring-2 ring-primary/20 shadow-xs'
                          : 'bg-muted/20 border-border/70 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            Level {idx + 1}: {step.level}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              (step.state as string) === 'Allow' || (step.state as string) === 'ON'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : (step.state as string) === 'Deny' || (step.state as string) === 'OFF'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            State: {step.state}
                          </span>

                          {step.locked && (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800 font-medium">
                              <Lock className="w-2.5 h-2.5" />
                              Locked
                            </span>
                          )}
                        </div>

                        {/* Status Pill */}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              isDecisive
                                ? 'bg-primary text-primary-foreground font-bold'
                                : isOverridden
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-muted/60 text-muted-foreground'
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                      </div>

                      {/* Explanation Reason */}
                      <p className="mt-1.5 text-foreground/80 leading-relaxed font-sans">
                        {step.reason}
                      </p>

                      {/* Validity Date Details if present */}
                      {(step.validFrom || step.validTo) && (
                        <div className="mt-2 pt-2 border-t border-border/60 flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>
                            Window: {step.validFrom || 'Beginning'} → {step.validTo || 'Permanent'}
                          </span>
                          {step.isExpired && (
                            <span className="text-rose-600 dark:text-rose-400 font-bold">
                              [EXPIRED]
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
