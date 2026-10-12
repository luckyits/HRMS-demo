import React from 'react'
import {
  Home,
  Clock,
  ClipboardCheck,
  Users,
  Inbox,
  Banknote,
  Calendar,
  Grid,
  MoreHorizontal,
  LucideIcon
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useWorkflow } from '@/context/WorkflowContext'

export interface TabItem {
  id: string
  label: string
  to: string
  icon: LucideIcon
  badge?: number | string
  featureCode?: string
}

export const BottomTabBar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { hasFeature } = useAccess()
  const { settings } = useDemo()
  const { requests } = useWorkflow()

  const isManager = settings.role === 'Manager'
  const pendingApprovalsCount = requests.filter((r) => r.status === 'pending').length

  // Build the 5 tabs dynamically based on effective access & role
  const getTabs = (): TabItem[] => {
    if (isManager) {
      const tabs: TabItem[] = [
        {
          id: 'home',
          label: 'Home',
          to: '/manager/dashboard',
          icon: Home,
        },
      ]

      if (hasFeature('MSS_APPROVALS')) {
        tabs.push({
          id: 'approvals',
          label: 'Approvals',
          to: '/manager/approvals',
          icon: ClipboardCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          featureCode: 'MSS_APPROVALS',
        })
      }

      tabs.push({
        id: 'team',
        label: 'Team',
        to: '/manager/attendance',
        icon: Users,
      })

      tabs.push({
        id: 'requests',
        label: 'My Req',
        to: '/employee/requests',
        icon: Inbox,
      })

      tabs.push({
        id: 'more',
        label: 'More',
        to: '/mobile/more',
        icon: MoreHorizontal,
      })

      return tabs.slice(0, 5)
    }

    // Default: Employee Shell
    const tabs: TabItem[] = [
      {
        id: 'home',
        label: 'Home',
        to: '/employee/dashboard',
        icon: Home,
      },
    ]

    // Tab 2: Attendance
    if (hasFeature('PUNCH')) {
      tabs.push({
        id: 'attendance',
        label: 'Clock',
        to: '/employee/attendance',
        icon: Clock,
        featureCode: 'PUNCH',
      })
    }

    // Tab 3: Requests
    tabs.push({
      id: 'requests',
      label: 'Requests',
      to: '/employee/requests',
      icon: Inbox,
      featureCode: 'LEAVE',
    })

    // Tab 4: Payslips (or Calendar fallback if Payslip is off)
    if (hasFeature('PAYSLIP')) {
      tabs.push({
        id: 'payslips',
        label: 'Payslip',
        to: '/employee/payslips',
        icon: Banknote,
        featureCode: 'PAYSLIP',
      })
    } else if (hasFeature('CALENDAR')) {
      tabs.push({
        id: 'calendar',
        label: 'Calendar',
        to: '/employee/calendar',
        icon: Calendar,
        featureCode: 'CALENDAR',
      })
    } else {
      tabs.push({
        id: 'profile',
        label: 'Profile',
        to: '/employee/profile',
        icon: Users,
        featureCode: 'PROFILE',
      })
    }

    // Tab 5: More (always present)
    tabs.push({
      id: 'more',
      label: 'More',
      to: '/mobile/more',
      icon: Grid,
    })

    return tabs.slice(0, 5)
  }

  const tabs = getTabs()

  const isTabActive = (tab: TabItem) => {
    if (tab.to === '/mobile/more') {
      return location.pathname === '/mobile/more'
    }
    return location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border select-none">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1 pb-safe">
        {tabs.map((tab) => {
          const active = isTabActive(tab)
          const Icon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(tab.to)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] py-1 transition-all active:scale-90 ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 transition-all ${
                  active ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>

              {/* Active pill dot */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
