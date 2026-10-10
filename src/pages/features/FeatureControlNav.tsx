import { cn } from '@/lib/utils'
import {
  FileSpreadsheet,
  Grid,
  HelpCircle,
  History,
  Layers,
  Sliders,
  Users,
} from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface FeatureControlNavProps {
  className?: string
}

export const FeatureControlNav: React.FC<FeatureControlNavProps> = ({ className }) => {
  const location = useLocation()

  const tabs = [
    {
      to: '/hr/features/catalogue',
      label: 'Feature Catalogue',
      icon: Layers,
      description: 'Module grouping & company toggles',
    },
    {
      to: '/hr/features/profiles',
      label: 'Profile Manager',
      icon: Users,
      description: '7-Profile matrix & clone',
    },
    {
      to: '/hr/features/matrix',
      label: 'Assignment Matrix',
      icon: Grid,
      description: 'Personnel overrides & drawer',
    },
    {
      to: '/hr/features/explainer',
      label: '"Why Does X Have This?"',
      icon: HelpCircle,
      description: 'Vertical audit ladder trace',
    },
    {
      to: '/hr/features/history',
      label: 'Change History',
      icon: History,
      description: 'Shared audit change log',
    },
  ]

  return (
    <div className={cn('bg-card border border-border rounded-xl p-1.5 shadow-2xs mb-6', className)}>
      <div className="flex flex-wrap items-center gap-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = location.pathname === tab.to
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
