import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  FastForward,
  ShieldAlert,
  Shuffle,
  User,
  UserCheck,
  X,
} from 'lucide-react'
import React from 'react'

export interface ApprovalStep {
  id: string
  title: string
  approverName: string
  approverRole: string
  status: 'approved' | 'pending' | 'rejected' | 'waiting' | 'skipped'
  timestamp?: string
  comments?: string
  isParallel?: boolean
  isDelegated?: boolean
  delegatedTo?: string
  isEscalated?: boolean
  escalationHours?: number
  selfApprovalBlocked?: boolean
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[]
  className?: string
  isParallel?: boolean
}

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({
  steps,
  className,
  isParallel = false,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {isParallel && (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md w-fit">
          <Shuffle className="w-3 h-3" />
          <span>Parallel Approvers (All must approve concurrently)</span>
        </div>
      )}

      <div className="relative pl-6 space-y-5">
        {/* Vertical connector line */}
        <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-border" />

        {steps.map((step, idx) => {
          let Icon = Clock
          let iconBg = 'bg-muted text-muted-foreground border-border'
          let statusBadge = null

          if (step.status === 'approved') {
            Icon = Check
            iconBg = 'bg-emerald-500 text-white border-emerald-500'
            statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Approved
              </span>
            )
          } else if (step.status === 'rejected') {
            Icon = X
            iconBg = 'bg-rose-500 text-white border-rose-500'
            statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                Rejected
              </span>
            )
          } else if (step.status === 'pending') {
            Icon = Clock
            iconBg = 'bg-amber-500 text-white border-amber-500 ring-4 ring-amber-100 dark:ring-amber-950/50'
            statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Pending Action
              </span>
            )
          } else if (step.status === 'skipped') {
            Icon = FastForward
            iconBg = 'bg-slate-400 text-white border-slate-400'
            statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20">
                Skipped
              </span>
            )
          } else {
            Icon = Clock
            iconBg = 'bg-muted text-muted-foreground border-border'
            statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Waiting
              </span>
            )
          }

          return (
            <div key={step.id || idx} className="relative flex items-start group">
              {/* Step Node */}
              <div
                className={cn(
                  'absolute -left-6 flex items-center justify-center w-5 h-5 rounded-full border text-xs shadow-2xs z-10 transition-transform group-hover:scale-110',
                  iconBg
                )}
              >
                <Icon className="w-3 h-3 stroke-[2.5]" />
              </div>

              {/* Step Body */}
              <div className="flex-1 bg-card rounded-xl border border-border p-3.5 shadow-2xs text-xs space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{step.title}</span>
                    {statusBadge}
                  </div>
                  {step.timestamp && (
                    <span className="text-[11px] font-mono text-muted-foreground">{step.timestamp}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    <strong className="text-foreground">{step.approverName}</strong> ({step.approverRole})
                  </span>
                </div>

                {/* Self-approval blocked note */}
                {step.selfApprovalBlocked && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Skipped to next level (self-approval blocked)</span>
                  </div>
                )}

                {/* Delegate indicator */}
                {step.isDelegated && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md border border-indigo-500/20">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Acted via delegate: {step.delegatedTo || 'Delegate Approver'}</span>
                  </div>
                )}

                {/* Escalation indicator */}
                {step.isEscalated && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Auto-escalated to supervisor (exceeded {step.escalationHours || 24}h SLA)</span>
                  </div>
                )}

                {step.comments && (
                  <div className="text-[11px] italic bg-muted/60 p-2 rounded-lg text-foreground/90 border border-border/50">
                    “{step.comments}”
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
