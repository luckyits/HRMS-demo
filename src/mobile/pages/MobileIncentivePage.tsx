import React from 'react'
import {
  TrendingUp,
  Award,
  DollarSign,
  Target,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Zap
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import { usePayroll } from '@/context/PayrollContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'

export const MobileIncentivePage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const { incentiveSlabs, employeeIncentives } = usePayroll()

  if (!hasFeature('INCENTIVE')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Sales Incentives" subtitle="Field Commissions" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <TrendingUp className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Sales commission & incentive engine is disabled for your workforce profile.</p>
        </div>
      </div>
    )
  }

  // Get current record or sample record
  const currentRecord =
    employeeIncentives.find((i) => i.employeeId === currentEmployee.id) ||
    employeeIncentives[0] || {
      id: 'INC-DEMO',
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      department: 'Field Sales',
      period: 'October 2026',
      salesTarget: 500000,
      actualSalesAchieved: 430000,
      achievementPct: 86,
      calculatedCommission: 21500,
      status: 'Approved for Payroll' as const,
    }

  const achievementPct = Math.min(
    150,
    Math.round((currentRecord.actualSalesAchieved / currentRecord.salesTarget) * 100)
  )

  // Circular ring calculations
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(100, achievementPct) / 100) * circumference

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Sales Incentives"
        subtitle={`${currentRecord.period} Performance`}
      />

      <div className="p-4 space-y-4">
        {/* Ring & Achievement Overview Card */}
        <div className="p-5 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs flex flex-col items-center text-center">
          {/* SVG Progress Ring */}
          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-muted"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-primary transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-foreground">
                {achievementPct}%
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Target Met
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 pt-3 mt-2 border-t border-border">
            <div className="text-left">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Target Set
              </span>
              <span className="text-sm font-black text-foreground">
                ₹{currentRecord.salesTarget.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Sales Closed
              </span>
              <span className="text-sm font-black text-foreground text-emerald-600 dark:text-emerald-400">
                ₹{currentRecord.actualSalesAchieved.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Earned Incentive Callout */}
        <div className="p-4 rounded-3xl bg-linear-to-r from-emerald-500/15 via-emerald-500/5 to-card border border-emerald-500/30 flex items-center justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Earned Commission</span>
            </div>
            <div className="text-2xl font-black text-foreground mt-0.5">
              ₹{currentRecord.calculatedCommission.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Payout: {currentRecord.status}
            </span>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Slab Progress Ladder */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Incentive Slabs & Commission Tiers
            </h4>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Performance Matrix
            </span>
          </div>

          <div className="space-y-2">
            {incentiveSlabs.map((slab) => {
              const isAchieved = achievementPct >= slab.targetAchievementMinPct
              const isCurrent =
                achievementPct >= slab.targetAchievementMinPct &&
                achievementPct <= slab.targetAchievementMaxPct

              return (
                <div
                  key={slab.id}
                  className={`p-3.5 rounded-2xl border transition shadow-xs ${
                    isCurrent
                      ? 'bg-primary/10 border-primary ring-1 ring-primary/30'
                      : isAchieved
                      ? 'bg-card border-border opacity-90'
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isAchieved
                            ? 'bg-emerald-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isAchieved ? <CheckCircle2 className="w-3.5 h-3.5" /> : '•'}
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-foreground">
                          {slab.schemeName}
                        </h5>
                        <span className="text-[10px] text-muted-foreground">
                          {slab.targetAchievementMinPct}% - {slab.targetAchievementMaxPct}% Target
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-foreground">
                        {slab.commissionPct}% Commission
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground block mt-0.5">
                          Active Tier
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
