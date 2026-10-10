import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Layers,
  ShieldCheck,
  History,
  CalendarDays,
  CalendarRange,
  Banknote,
  GitFork,
  BellRing,
} from 'lucide-react'
import { useAdminLeaves } from '@/context/AdminLeavesContext'

export const LeaveSubNav: React.FC = () => {
  const { compOffRequests, encashmentRequests } = useAdminLeaves()

  const pendingCompOff = compOffRequests.filter((c) => c.status === 'Pending').length
  const pendingEncashment = encashmentRequests.filter((e) => e.status === 'Pending').length
  const totalPendingRewards = pendingCompOff + pendingEncashment

  const navItems = [
    { to: '/hr/leaves/types', label: 'Leave Types', icon: Layers },
    { to: '/hr/leaves/policies', label: 'Leave Policies', icon: ShieldCheck },
    { to: '/hr/leaves/adjustments', label: 'Ledger & Adjustments', icon: History },
    { to: '/hr/leaves/holidays', label: 'Holiday Profiles', icon: CalendarDays },
    { to: '/hr/leaves/calendar', label: 'Leave Calendar & Heatmap', icon: CalendarRange },
    {
      to: '/hr/leaves/comp-off-encashment',
      label: 'Comp-Off & Encashment',
      icon: Banknote,
      badge: totalPendingRewards > 0 ? totalPendingRewards : undefined,
    },
    { to: '/hr/workflows/designer', label: 'Workflow Designer', icon: GitFork, badge: 'Active Engine' },
    { to: '/hr/workflows/notifications', label: 'Notification Templates', icon: BellRing },
  ]

  return (
    <div className="border-b border-border bg-card/60 backdrop-blur-sm -mx-6 -mt-6 mb-6 px-6 pt-2 overflow-x-auto scrollbar-none">
      <div className="flex items-center gap-1 min-w-max pb-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    typeof item.badge === 'number'
                      ? 'bg-amber-500 text-white'
                      : 'bg-primary/20 text-primary'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}
