import { cn } from '@/lib/utils'
import type { Scope } from '@/types'
import { Building, Globe, MapPin, User, Users } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ScopeBadgeProps {
  scope: Scope
  className?: string
  showLabel?: boolean
}

export const ScopeBadge: React.FC<ScopeBadgeProps> = ({
  scope,
  className,
  showLabel = true,
}) => {
  const { t } = useTranslation()

  const config: Record<Scope, { bg: string; text: string; icon: React.ReactNode; labelKey: string }> = {
    Self: {
      bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-700 dark:text-indigo-300',
      icon: <User className="w-3 h-3" />,
      labelKey: 'scope.Self',
    },
    Team: {
      bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
      text: 'text-sky-700 dark:text-sky-300',
      icon: <Users className="w-3 h-3" />,
      labelKey: 'scope.Team',
    },
    Dept: {
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      icon: <Building className="w-3 h-3" />,
      labelKey: 'scope.Dept',
    },
    Branch: {
      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      icon: <MapPin className="w-3 h-3" />,
      labelKey: 'scope.Branch',
    },
    All: {
      bg: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
      text: 'text-violet-700 dark:text-violet-300',
      icon: <Globe className="w-3 h-3" />,
      labelKey: 'scope.All',
    },
  }

  const item = config[scope]

  return (
    <span
      title={`Scope: ${t(item.labelKey)}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border shadow-2xs transition-colors',
        item.bg,
        className
      )}
    >
      {item.icon}
      {showLabel && <span>{t(item.labelKey)}</span>}
    </span>
  )
}
