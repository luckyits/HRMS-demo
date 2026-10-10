import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { useDemo } from '@/context/DemoContext'
import type { Scope } from '@/types'
import { AlertCircle, FileText, Layers, RefreshCw, Sparkles } from 'lucide-react'
import React, { useState } from 'react'

interface PlaceholderPageProps {
  title: string
  subtitle: string
  moduleName: string
  scope?: Scope
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  subtitle,
  moduleName,
  scope = 'All',
}) => {
  const { settings } = useDemo()
  const [simulatedState, setSimulatedState] = useState<'normal' | 'loading' | 'empty' | 'error'>('normal')

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        scope={scope}
        breadcrumbs={[
          { label: 'HRMS', href: '/' },
          { label: settings.role },
          { label: title },
        ]}
        action={
          <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border text-xs">
            <span className="text-muted-foreground px-2 font-medium">State Demo:</span>
            <button
              type="button"
              onClick={() => setSimulatedState('normal')}
              className={`px-2 py-1 rounded font-medium transition ${
                simulatedState === 'normal'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ready
            </button>
            <button
              type="button"
              onClick={() => setSimulatedState('loading')}
              className={`px-2 py-1 rounded font-medium transition ${
                simulatedState === 'loading'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Loading
            </button>
            <button
              type="button"
              onClick={() => setSimulatedState('empty')}
              className={`px-2 py-1 rounded font-medium transition ${
                simulatedState === 'empty'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Empty
            </button>
            <button
              type="button"
              onClick={() => setSimulatedState('error')}
              className={`px-2 py-1 rounded font-medium transition ${
                simulatedState === 'error'
                  ? 'bg-rose-600 text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Error
            </button>
          </div>
        }
      />

      {/* State: Loading */}
      {simulatedState === 'loading' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Metric 1" value="..." loading />
            <StatCard title="Metric 2" value="..." loading />
            <StatCard title="Metric 3" value="..." loading />
            <StatCard title="Metric 4" value="..." loading />
          </div>
          <div className="p-8 bg-card rounded-xl border border-border animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-32 bg-muted/50 rounded" />
          </div>
        </div>
      )}

      {/* State: Empty */}
      {simulatedState === 'empty' && (
        <EmptyState
          title={`No ${title} Records`}
          description={`Currently no records exist for ${settings.companyType} in this scope. Create records or adjust filters to view data.`}
          actionLabel={`Configure ${title}`}
          onAction={() => alert(`Trigger action for ${title}`)}
        />
      )}

      {/* State: Error */}
      {simulatedState === 'error' && (
        <div className="p-6 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 flex items-start gap-4 text-sm">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-rose-900 dark:text-rose-200">
              Failed to load {title}
            </h4>
            <p className="mt-1 text-rose-700 dark:text-rose-300 text-xs">
              Simulated error state: An unexpected timeout occurred while fetching records for {settings.currentUser.department}.
            </p>
            <button
              type="button"
              onClick={() => setSimulatedState('normal')}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Request</span>
            </button>
          </div>
        </div>
      )}

      {/* State: Normal/Ready Placeholder */}
      {simulatedState === 'normal' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Headcount"
              value="248"
              subtext="99.2% attendance baseline"
              trend={{ value: '+4.2% vs last month', positive: true }}
              icon={Sparkles}
            />
            <StatCard
              title="Pending Review"
              value="12"
              subtext="Approvals needing attention"
              trend={{ value: 'Within 24h SLA', positive: true }}
              icon={Layers}
            />
            <StatCard
              title="Company Template"
              value={settings.companyType}
              subtext="Universal ERP Profile"
              icon={FileText}
            />
            <StatCard
              title="Role Scope"
              value={settings.role}
              subtext={settings.employeeType}
              icon={RefreshCw}
            />
          </div>

          {/* Module Canvas Card */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  {moduleName} Shell Ready
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Universal layout configured for {settings.companyType} industry profile.
                </p>
              </div>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                Scope: {scope}
              </span>
            </div>

            <div className="p-4 bg-muted/40 rounded-lg text-xs space-y-2 text-muted-foreground leading-relaxed">
              <p className="font-medium text-foreground">
                ✨ Universal Features Ready For Next Prompt Implementation:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Compatible with: IT, Manufacturing, Retail, Hospital, School, Field Sales, Construction, Logistics, Small Shop.</li>
                <li>Responsive data filtering, TanStack table integration, and export compliance audit ready.</li>
                <li>Supports light/dark theme, multi-language (EN / हिन्दी / ગુજરાતી), and instant persona switching.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
