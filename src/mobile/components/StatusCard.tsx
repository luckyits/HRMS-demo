import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatusCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  badge?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend?: {
    label: string
    isPositive?: boolean
  }
  onClick?: () => void
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  variant = 'default',
  trend,
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
          border: 'border-emerald-500/20',
          text: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        }
      case 'warning':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/30',
          border: 'border-amber-500/20',
          text: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        }
      case 'danger':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-950/30',
          border: 'border-rose-500/20',
          text: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
        }
      case 'info':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-950/30',
          border: 'border-blue-500/20',
          text: 'text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        }
      default:
        return {
          bg: 'bg-card',
          border: 'border-border',
          text: 'text-primary',
          badge: 'bg-muted text-muted-foreground',
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl border ${styles.border} ${styles.bg} shadow-xs transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${styles.text} bg-card/60 shadow-2xs`}>
          <Icon className="w-4 h-4 stroke-[2.2px]" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black text-foreground tracking-tight">
          {value}
        </span>
        {badge && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold shrink-0 ${
                trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
