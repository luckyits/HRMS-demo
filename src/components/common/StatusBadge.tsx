import { cn } from '@/lib/utils'
import type { StatusVariant } from '@/types'
import { CheckCircle2, Clock, HelpCircle, XCircle } from 'lucide-react'
import React from 'react'

interface StatusBadgeProps {
  status: StatusVariant | string
  label?: string
  className?: string
  showIcon?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  showIcon = true,
}) => {
  const norm = status.toLowerCase()

  const config: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; defaultLabel: string }> = {
    active: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
      defaultLabel: 'Active',
    },
    approved: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
      defaultLabel: 'Approved',
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
      defaultLabel: 'Pending Approval',
    },
    processing: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      icon: <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-spin" />,
      defaultLabel: 'Processing',
    },
    rejected: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800',
      icon: <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
      defaultLabel: 'Rejected',
    },
    inactive: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <Clock className="w-3 h-3 text-slate-500" />,
      defaultLabel: 'Inactive',
    },
    'on-leave': {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: <Clock className="w-3 h-3 text-purple-600 dark:text-purple-400" />,
      defaultLabel: 'On Leave',
    },
    draft: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      text: 'text-zinc-700 dark:text-zinc-300',
      border: 'border-zinc-300 dark:border-zinc-700',
      icon: <HelpCircle className="w-3 h-3 text-zinc-500" />,
      defaultLabel: 'Draft',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <Clock className="w-3 h-3 text-amber-500" />,
      defaultLabel: 'Warning',
    },
  }

  const current = config[norm] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    icon: <HelpCircle className="w-3 h-3 text-slate-500" />,
    defaultLabel: status,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-colors',
        current.bg,
        current.text,
        current.border,
        className
      )}
    >
      {showIcon && current.icon}
      <span>{label || current.defaultLabel}</span>
    </span>
  )
}
