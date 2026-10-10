import { cn } from '@/lib/utils'
import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react'
import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtext?: string
  trend?: {
    value: string
    positive?: boolean
  }
  icon?: LucideIcon
  iconColor?: string
  loading?: boolean
  className?: string
  onClick?: () => void
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  iconColor = 'text-primary bg-primary/10',
  loading = false,
  className,
  onClick,
}) => {
  if (loading) {
    return (
      <div
        className={cn(
          'p-5 bg-card rounded-xl border border-border shadow-2xs animate-pulse',
          className
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="w-9 h-9 rounded-lg bg-muted" />
        </div>
        <div className="h-7 bg-muted rounded w-32 mb-2" />
        <div className="h-3 bg-muted rounded w-20" />
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 bg-card rounded-xl border border-border shadow-2xs hover:shadow-xs transition-all relative overflow-hidden',
        onClick && 'cursor-pointer hover:border-primary/50',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg shrink-0', iconColor)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold tracking-tight text-foreground">{value}</h4>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-semibold',
              trend.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {trend.positive ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-xs text-muted-foreground truncate">{subtext}</p>
      )}
    </div>
  )
}
