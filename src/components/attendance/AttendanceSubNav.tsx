import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Activity,
  CalendarDays,
  ShieldCheck,
  Clock,
  CalendarRange,
  MapPin,
  ScanFace,
  ClipboardList,
  AlertTriangle,
  Cpu,
  ClockAlert,
} from 'lucide-react'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'

export const AttendanceSubNav: React.FC = () => {
  const { suspiciousPunches, regularizations } = useAdminAttendance()

  const pendingSuspiciousCount = suspiciousPunches.filter((p) => p.status === 'Pending Review').length
  const pendingRegularizationsCount = regularizations.filter((r) => r.status === 'Pending').length

  const navItems = [
    { to: '/hr/attendance/live', label: 'Live Dashboard', icon: Activity },
    { to: '/hr/attendance/register', label: 'Register Grid', icon: CalendarDays },
    { to: '/hr/attendance/policies', label: 'Policy Builder', icon: ShieldCheck },
    { to: '/hr/attendance/shifts', label: 'Shift Builder', icon: Clock },
    { to: '/hr/attendance/roster', label: 'Roster Planner', icon: CalendarRange },
    { to: '/hr/attendance/geofence', label: 'Geo-fence Editor', icon: MapPin },
    { to: '/hr/attendance/face-enrollment', label: 'Face Biometrics', icon: ScanFace },
    {
      to: '/hr/attendance/regularizations',
      label: 'Regularizations',
      icon: ClipboardList,
      badge: pendingRegularizationsCount > 0 ? pendingRegularizationsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      to: '/hr/attendance/suspicious-punches',
      label: 'Suspicious Punches',
      icon: AlertTriangle,
      badge: pendingSuspiciousCount > 0 ? pendingSuspiciousCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { to: '/hr/attendance/devices', label: 'Device & Kiosks', icon: Cpu },
    { to: '/hr/attendance/overtime-bonus', label: 'Overtime & Bonus', icon: ClockAlert },
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
                    item.badgeColor || 'bg-primary/20 text-primary'
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
