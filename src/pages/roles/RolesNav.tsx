import { cn } from '@/lib/utils'
import {
  CheckSquare,
  Eye,
  KeyRound,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface RolesNavProps {
  className?: string
}

export const RolesNav: React.FC<RolesNavProps> = ({ className }) => {
  const location = useLocation()

  const tabs = [
    {
      to: '/hr/roles/list',
      label: 'Role Directory',
      icon: Shield,
      description: 'System & Custom Roles',
    },
    {
      to: '/hr/roles/editor',
      label: 'Permission Matrix Editor',
      icon: KeyRound,
      description: 'Features x Actions & Data Scope',
    },
    {
      to: '/hr/roles/assignments',
      label: 'User-Role Assignments',
      icon: UserCheck,
      description: 'Personnel role mapping & scope overrides',
    },
    {
      to: '/hr/roles/preview',
      label: 'Role Simulation & Preview',
      icon: Eye,
      description: '"View as this role" live tester',
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
