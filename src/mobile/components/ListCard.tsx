import React from 'react'
import { ChevronRight } from 'lucide-react'

export interface ListCardField {
  label: string
  value: string | number
  highlight?: boolean
}

interface ListCardProps {
  title: string
  subtitle?: string
  status?: string
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  badge?: string
  fields?: ListCardField[]
  icon?: React.ReactNode
  onClick?: () => void
  actionLabel?: string
  actionButton?: React.ReactNode
}

export const ListCard: React.FC<ListCardProps> = ({
  title,
  subtitle,
  status,
  statusVariant = 'neutral',
  badge,
  fields = [],
  icon,
  onClick,
  actionLabel,
  actionButton,
}) => {
  const getStatusBadge = () => {
    switch (statusVariant) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'danger':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      case 'info':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-2xl bg-card border border-border shadow-2xs transition-all ${
        onClick ? 'cursor-pointer active:scale-[0.99] hover:border-primary/40' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <div className="shrink-0">{icon}</div>}
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-foreground truncate">{title}</h4>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {badge}
            </span>
          )}
          {status && (
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge()}`}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      {/* Key Fields Grid */}
      {fields.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
          {fields.map((f, i) => (
            <div key={i} className="min-w-0">
              <span className="text-[11px] text-muted-foreground block truncate">
                {f.label}
              </span>
              <span
                className={`font-semibold block truncate mt-0.5 ${
                  f.highlight ? 'text-primary' : 'text-foreground'
                }`}
              >
                {f.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer action / chevron */}
      {(actionLabel || actionButton || onClick) && (
        <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {actionLabel || (onClick ? 'Tap to view details' : '')}
          </span>
          {actionButton || (
            onClick && <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
          )}
        </div>
      )}
    </div>
  )
}
