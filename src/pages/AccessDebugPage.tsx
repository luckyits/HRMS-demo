import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
  Lock,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import React, { useState } from 'react'

export const AccessDebugPage: React.FC = () => {
  const { settings } = useDemo()
  const { currentEmployee, effectiveAccess, allFeatures } = useAccess()
  const [search, setSearch] = useState('')
  const [selectedFeature, setSelectedFeature] = useState<string>('VISIT')

  const filteredFeatures = allFeatures.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.code.toLowerCase().includes(search.toLowerCase()) ||
      f.module.toLowerCase().includes(search.toLowerCase())
  )

  const activeRes = effectiveAccess[selectedFeature]
  const activeFeatureDef = allFeatures.find((f) => f.code === selectedFeature)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feature Access Engine Diagnostic Console"
        subtitle={`Live multi-level resolver trace & effective entitlements for ${currentEmployee.name} (${currentEmployee.profileType})`}
        scope="All"
        breadcrumbs={[
          { label: 'System Engine', href: '/hr/dashboard' },
          { label: 'Diagnostic Console' },
          { label: currentEmployee.id },
        ]}
      />

      {/* Persona Diagnostic Summary Banner */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-12 h-12 rounded-xl object-cover border border-border"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {currentEmployee.name}
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {currentEmployee.id}
                </span>
                <StatusBadge status="active" label={currentEmployee.profileType} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentEmployee.designation} • {currentEmployee.department} • {currentEmployee.branch}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/80">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Company Template
              </span>
              <span className="font-semibold text-foreground">{settings.companyType}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                View As Role
              </span>
              <span className="font-semibold text-foreground">{settings.role}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold">
                Allowed Features
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {Object.values(effectiveAccess).filter((a) => a.allowed).length} / 35
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Feature Directory & Detailed Resolver Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): List of 35 Features */}
        <div className="lg:col-span-5 space-y-3 bg-card border border-border rounded-xl p-4 shadow-2xs flex flex-col h-[700px]">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h4 className="text-sm font-semibold text-foreground">
              Feature Master (35 Codes)
            </h4>
            <span className="text-xs text-muted-foreground">
              {filteredFeatures.length} Listed
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by code or module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredFeatures.map((f) => {
              const res = effectiveAccess[f.code]
              const isSelected = selectedFeature === f.code
              return (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => setSelectedFeature(f.code)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 text-xs ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-semibold shadow-2xs'
                      : 'border-border/60 hover:bg-muted/60 text-foreground'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold">
                        {f.code}
                      </span>
                      {f.is_core && (
                        <span className="text-[9px] px-1 rounded bg-muted text-muted-foreground">
                          Core
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {f.name}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {res?.allowed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                        <XCircle className="w-3 h-3" />
                        Denied
                      </span>
                    )}
                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Column (7 Cols): Detailed Multi-Level Diagnostic Trace */}
        <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-6">
          {activeFeatureDef && activeRes ? (
            <>
              {/* Feature Header */}
              <div className="pb-4 border-b border-border flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-foreground">
                      {activeFeatureDef.code}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {activeFeatureDef.module}
                    </span>
                    {activeRes.allowed ? (
                      <StatusBadge status="active" label="ENTITLED (ALLOWED)" />
                    ) : (
                      <StatusBadge status="rejected" label="NOT ENTITLED (DENIED)" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mt-1">
                    {activeFeatureDef.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeFeatureDef.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">
                    Decided By Level
                  </span>
                  <span className="text-xs font-mono font-bold text-primary px-2 py-1 rounded bg-primary/10">
                    {activeRes.decidedByLevel}
                  </span>
                </div>
              </div>

              {/* Resolved Scope & Permissions */}
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3.5 rounded-lg border border-border/80">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Effective Data Scope
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {activeRes.scope}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                    Permitted Actions
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {activeRes.permissions.length > 0 ? (
                      activeRes.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-1.5 py-0.5 text-[10px] rounded bg-background border border-border font-mono text-foreground"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None (Denied)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Resolver Trace Step-by-Step */}
              <div className="space-y-3">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>Evaluation Hierarchy & Trace Audit</span>
                </h5>

                <div className="space-y-2.5">
                  {activeRes.trace.map((item, idx) => {
                    const isDecisive = item.status === 'decisive'
                    const isSkipped = item.status === 'skipped'
                    const isIgnored = item.status === 'ignored'

                    let badgeColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    if (isDecisive) {
                      badgeColor = activeRes.allowed
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ring-2 ring-rose-500/30'
                    } else if (isIgnored) {
                      badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border text-xs transition-colors ${
                          isDecisive
                            ? 'bg-card border-primary/40 shadow-2xs'
                            : 'bg-background/50 border-border/60 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {idx + 1}. Level: {item.level}
                            </span>
                            {item.locked && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800">
                                <Lock className="w-2.5 h-2.5" />
                                Locked
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeColor}`}
                            >
                              {item.status} ({item.state})
                            </span>
                          </div>
                        </div>

                        <p className="mt-1 text-muted-foreground text-[11px] leading-relaxed">
                          {item.reason}
                        </p>

                        {(item.validFrom || item.validTo) && (
                          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                            <Clock className="w-3 h-3" />
                            <span>
                              Validity: {item.validFrom || 'Any'} → {item.validTo || 'Any'}
                              {item.isExpired && ' (EXPIRED)'}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Engine Rules Reference Accordion */}
              <div className="p-3 bg-muted/30 border border-border/80 rounded-lg text-xs space-y-1 text-muted-foreground">
                <span className="font-semibold text-foreground block">
                  Enforced Resolver Rules:
                </span>
                <p>1. If plan or company is OFF, the result is DENIED (ceiling).</p>
                <p>2. If any higher level is Locked, that value wins immediately.</p>
                <p>3. Otherwise most specific wins: Employee &gt; Profile &gt; Dept &gt; Branch &gt; Company.</p>
                <p>4. Same-level conflict: Deny wins.</p>
                <p>5. Expired grants (past valid_to) are ignored.</p>
                <p>6. Default is DENIED.</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
              Select a feature code from the left to view its trace evaluation.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
