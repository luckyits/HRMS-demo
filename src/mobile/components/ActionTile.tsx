import React from 'react'
import { LucideIcon, ChevronRight } from 'lucide-react'

interface ActionTileProps {
  icon: LucideIcon
  label: string
  subtitle?: string
  badge?: string | number
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger'
  iconColor?: string // Tailwind text color class, e.g. "text-indigo-600"
  iconBg?: string // Tailwind bg color class, e.g. "bg-indigo-50 dark:bg-indigo-950/40"
  onClick?: () => void
  disabled?: boolean
  showChevron?: boolean
}

export const ActionTile: React.FC<ActionTileProps> = ({
  icon: Icon,
  label,
  subtitle,
  badge,
  badgeVariant = 'primary',
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  onClick,
  disabled = false,
  showChevron = true,
}) => {
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'warning':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'danger':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      default:
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group w-full min-h-[56px] p-3 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 text-left transition-all active:scale-[0.98] hover:border-primary/40 hover:shadow-xs select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-active:scale-95 ${iconBg} ${iconColor}`}
        >
          <Icon className="w-5 h-5 stroke-[2.2px]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate block">
              {label}
            </span>
            {badge !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-none ${getBadgeStyle()}`}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {showChevron && (
        <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0 group-hover:text-foreground transition-transform group-active:translate-x-0.5" />
      )}
    </button>
  )
}
