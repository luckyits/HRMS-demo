import React from 'react'
import {
  FileSpreadsheet,
  Download,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { useAccess } from '@/access/useAccess'
import { useToast } from '@/context/ToastContext'

export const MobileTeamReportsPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { showToast } = useToast()

  const handleExport = (format: 'csv' | 'pdf') => {
    showToast(`Exporting Team Muster Roll & Hours report (${format.toUpperCase()})...`, 'success')
  }

  if (!hasFeature('TEAM_REPORTS')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Team reports and analytics module is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Team Analytics & Muster"
        subtitle="Department KPI summaries & export"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Attendance Rate
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              94.8%
            </div>
            <span className="text-[10px] text-muted-foreground">↑ 1.2% vs last month</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Overtime Accrued
            </span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              38.5 hrs
            </div>
            <span className="text-[10px] text-muted-foreground">Within plant ceiling</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Average Hours / Day
            </span>
            <div className="text-2xl font-black text-foreground font-mono">
              8h 52m
            </div>
            <span className="text-[10px] text-muted-foreground">Planned: 9h 00m</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Team Headcount
            </span>
            <div className="text-2xl font-black text-primary font-mono">
              8 Active
            </div>
            <span className="text-[10px] text-muted-foreground">0 Attrition YTD</span>
          </div>
        </div>

        {/* Muster Roll Overview */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              October 2026 Muster Roll
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Form B Compliant
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="font-semibold text-foreground">Aarav Patel</span>
              <span className="text-muted-foreground font-mono">21 P • 1 L • 0 A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="font-semibold text-foreground">Devika Nair</span>
              <span className="text-muted-foreground font-mono">22 P • 0 L • 0 A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="font-semibold text-foreground">Gopal Shinde</span>
              <span className="text-muted-foreground font-mono">22 P • 18.5h OT</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-semibold text-foreground">Kavita Rao</span>
              <span className="text-muted-foreground font-mono">20 P • 2 L • 0 A</span>
            </div>
          </div>
        </div>

        {/* Export Actions (Gated by Permission) */}
        <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Export Regulatory Reports
          </span>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="py-3 px-3 rounded-2xl bg-card border border-border text-foreground font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition hover:bg-muted"
            >
              <Download className="w-4 h-4 text-primary" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className="py-3 px-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
