import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { cn } from '@/lib/utils'
import {
  Banknote,
  Briefcase,
  Building,
  CalendarCheck,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Home,
  KeyRound,
  Laptop,
  Layers,
  LineChart,
  LucideIcon,
  MapPin,
  Navigation,
  PieChart,
  Receipt,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  User,
  Users,
  History as HistoryIcon,
  BookOpen,
  FileCheck,
  FileSignature,
  AlertTriangle,
  ScanFace,
  Inbox,
  Megaphone,
  Gift,
  GitFork,
  BellRing,
  ClockAlert,
  Coins,
  UserMinus,
  GraduationCap,
  HeartHandshake,
  Activity,
} from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
  badge?: string
  featureCode?: string // Feature access gate
}

interface NavSection {
  title?: string
  items: NavItem[]
}

export const Sidebar: React.FC = () => {
  const { t } = useTranslation()
  const { settings } = useDemo()
  const { hasFeature, currentEmployee } = useAccess()
  const [collapsed, setCollapsed] = useState(false)

  // Configure items based on View as role & effective access
  const getNavSections = (): NavSection[] => {
    if (settings.role === 'HR Admin') {
      return [
        {
          items: [
            { to: '/hr/dashboard', labelKey: 'nav.dashboard', icon: Home },
            { to: '/hr/organization/chart', labelKey: 'nav.organization', icon: Building, featureCode: 'ORG_CHART' },
            { to: '/hr/organization/setup', labelKey: 'Org Master Setup', icon: Layers },
            { to: '/hr/organization/wizard', labelKey: 'Industry Wizard', icon: Sparkles },
            { to: '/hr/organization/documents-queue', labelKey: 'Verify Docs', icon: FileCheck },
            { to: '/hr/employees', labelKey: 'nav.employees', icon: Users, badge: 'All' },
          ],
        },
        {
          title: 'Workforce Operations',
          items: [
            { to: '/hr/attendance/live', labelKey: 'nav.attendance', icon: Clock, badge: 'Live', featureCode: 'PUNCH' },
            { to: '/hr/attendance/register', labelKey: 'Register Grid', icon: CalendarCheck },
            { to: '/hr/attendance/roster', labelKey: 'nav.shifts', icon: CalendarDays, featureCode: 'SHIFT_ROSTER' },
            { to: '/hr/attendance/suspicious-punches', labelKey: 'Suspicious Punches', icon: AlertTriangle, badge: 'Risk', featureCode: 'PUNCH' },
            { to: '/hr/attendance/geofence', labelKey: 'Geo-fence Map', icon: MapPin },
            { to: '/hr/attendance/face-enrollment', labelKey: 'Face Biometrics', icon: ScanFace },
            { to: '/hr/leaves/types', labelKey: 'nav.leaves', icon: CalendarCheck, badge: '5', featureCode: 'LEAVE' },
            { to: '/hr/leaves/holidays', labelKey: 'Holiday Calendar', icon: CalendarDays },
            { to: '/hr/leaves/comp-off-encashment', labelKey: 'Comp-Off & Encash', icon: Banknote },
            { to: '/hr/attendance/overtime-bonus', labelKey: 'OT & Attendance Bonus', icon: ClockAlert, featureCode: 'OVERTIME' },
            { to: '/hr/visits', labelKey: 'Client Visits & Beats', icon: Navigation, featureCode: 'VISIT' },
          ],
        },
        {
          title: 'Governance & Access Control',
          items: [
            { to: '/hr/workflows/designer', labelKey: 'Workflow Designer', icon: GitFork, badge: 'Engine' },
            { to: '/hr/workflows/notifications', labelKey: 'Notification Templates', icon: BellRing },
            { to: '/hr/features/catalogue', labelKey: 'Feature Control Hub', icon: SlidersHorizontal, badge: 'Admin' },
            { to: '/hr/features/profiles', labelKey: 'Profile Matrix', icon: Users },
            { to: '/hr/features/matrix', labelKey: 'Assignment Matrix', icon: FileSpreadsheet },
            { to: '/hr/roles/list', labelKey: 'Roles Directory', icon: ShieldCheck, badge: 'RBAC' },
            { to: '/hr/roles/assignments', labelKey: 'User-Role Mapping', icon: KeyRound },
            { to: '/hr/features/history', labelKey: 'Audit History', icon: HistoryIcon },
          ],
        },
        {
          title: 'Compensation & Governance',
          items: [
            { to: '/hr/lifecycle', labelKey: 'Lifecycle & Exit Center', icon: Layers, featureCode: 'RESIGNATION' },
            { to: '/hr/finance', labelKey: 'Expense & Loans Master', icon: Receipt, featureCode: 'EXPENSE' },
            { to: '/hr/payroll', labelKey: 'nav.payroll', icon: Banknote, featureCode: 'PAYROLL' },
            { to: '/hr/compliance', labelKey: 'Compliance & Governance', icon: ShieldCheck, featureCode: 'ATT_POLICY' },
            { to: '/hr/recruitment', labelKey: 'nav.recruitment', icon: Briefcase, featureCode: 'RECRUITMENT' },
            { to: '/hr/performance', labelKey: 'nav.performance', icon: TrendingUp, featureCode: 'PERFORMANCE' },
            { to: '/hr/training', labelKey: 'Training & LMS', icon: GraduationCap, featureCode: 'TRAINING' },
            { to: '/hr/engagement', labelKey: 'Pulse & Surveys', icon: HeartHandshake, featureCode: 'ENGAGEMENT' },
            { to: '/hr/assets', labelKey: 'nav.assets', icon: Laptop, featureCode: 'ASSET' },
            { to: '/hr/reports', labelKey: 'nav.reports', icon: LineChart },
            { to: '/hr/settings', labelKey: 'nav.settings', icon: Settings },
            { to: '/dev/qa', labelKey: 'QA Health Matrix', icon: Activity, badge: 'Dev' },
          ],
        },
      ]
    }

    if (settings.role === 'Manager') {
      return [
        {
          title: 'Team Management & Approvals',
          items: [
            { to: '/manager/dashboard', labelKey: 'nav.teamOverview', icon: PieChart },
            { to: '/manager/approvals', labelKey: 'Approval Inbox', icon: ClipboardCheck, badge: 'MSS', featureCode: 'MSS_APPROVALS' },
            { to: '/manager/overtime-approvals', labelKey: 'Supervisor OT Queue', icon: ClockAlert, badge: 'Plant', featureCode: 'OVERTIME' },
            { to: '/manager/resignations', labelKey: 'Resignation Desk', icon: UserMinus, featureCode: 'RESIGNATION' },
            { to: '/manager/visits', labelKey: 'Field Visit Radar', icon: Navigation, featureCode: 'VISIT' },
            { to: '/manager/timesheets', labelKey: 'Timesheet Queue', icon: FileSpreadsheet, featureCode: 'TIMESHEET' },
            { to: '/manager/performance', labelKey: 'Team Appraisals', icon: TrendingUp, featureCode: 'PERFORMANCE' },
            { to: '/manager/attendance', labelKey: 'Team Attendance', icon: Clock, featureCode: 'PUNCH' },
            { to: '/manager/calendar', labelKey: 'Team Calendar', icon: CalendarDays, featureCode: 'CALENDAR' },
            { to: '/manager/roster', labelKey: 'Shift Roster', icon: CalendarDays, featureCode: 'SHIFT_ROSTER' },
            { to: '/manager/leaves', labelKey: 'Leave Quotas', icon: CalendarCheck, featureCode: 'LEAVE' },
            { to: '/manager/members', labelKey: 'Team Members', icon: Users },
            { to: '/manager/alerts', labelKey: 'Probation & Exits', icon: ShieldCheck },
            { to: '/manager/delegation', labelKey: 'Delegation Rules', icon: KeyRound },
            { to: '/manager/on-behalf', labelKey: 'Raise on Behalf', icon: User },
            { to: '/manager/reports', labelKey: 'Team Reports', icon: LineChart, featureCode: 'TEAM_REPORTS' },
            { to: '/dev/qa', labelKey: 'QA Health Matrix', icon: Activity, badge: 'Dev' },
          ],
        },
        {
          title: 'My Self-Service (ESS)',
          items: [
            { to: '/employee/dashboard', labelKey: 'nav.myDashboard', icon: Home },
            { to: '/employee/attendance', labelKey: 'nav.myAttendance', icon: Clock, featureCode: 'PUNCH' },
            { to: '/employee/leaves', labelKey: 'nav.myLeaves', icon: CalendarCheck, featureCode: 'LEAVE' },
            { to: '/employee/payslips', labelKey: 'nav.myPayslips', icon: Banknote, featureCode: 'PAYSLIP' },
            { to: '/employee/claims', labelKey: 'nav.myClaims', icon: Receipt, featureCode: 'EXPENSE' },
            { to: '/employee/loans', labelKey: 'Advances & Loans', icon: Banknote, featureCode: 'FINANCE' },
            { to: '/employee/resignation', labelKey: 'Resignation & Exit', icon: UserMinus, featureCode: 'RESIGNATION' },
            { to: '/employee/profile', labelKey: 'nav.myProfile', icon: User, featureCode: 'PROFILE' },
          ],
        },
      ]
    }

    // Default: Employee (Self Service) built entirely from effective access
    return [
      {
        title: 'Workforce Attendance',
        items: [
          { to: '/employee/dashboard', labelKey: 'nav.myDashboard', icon: Home },
          { to: '/employee/attendance', labelKey: 'nav.myAttendance', icon: Clock, featureCode: 'PUNCH' },
          { to: '/employee/visits', labelKey: 'Client Visits & Beats', icon: Navigation, featureCode: 'VISIT' },
          { to: '/employee/overtime', labelKey: 'Overtime & Bonus', icon: ClockAlert, featureCode: 'OVERTIME' },
          { to: '/employee/timesheets', labelKey: 'My Timesheets', icon: FileSpreadsheet, featureCode: 'TIMESHEET' },
          { to: '/employee/training', labelKey: 'My Courses & LMS', icon: GraduationCap, featureCode: 'TRAINING' },
          { to: '/employee/shifts', labelKey: 'nav.shiftRoster', icon: CalendarDays, featureCode: 'SHIFT_ROSTER' },
          { to: '/employee/calendar', labelKey: 'nav.calendarHolidays', icon: CalendarDays, featureCode: 'CALENDAR' },
          { to: '/employee/celebrations', labelKey: 'nav.celebrations', icon: Gift, featureCode: 'BIRTHDAY_ANNIV' },
        ],
      },
      {
        title: 'Requests & Leave',
        items: [
          { to: '/employee/requests', labelKey: 'nav.myRequestsHub', icon: Inbox, featureCode: 'LEAVE' },
          { to: '/employee/leaves', labelKey: 'nav.myLeaves', icon: CalendarCheck, featureCode: 'LEAVE' },
          { to: '/employee/helpdesk', labelKey: 'nav.helpdesk', icon: HelpCircle, featureCode: 'HELPDESK' },
          { to: '/employee/claims', labelKey: 'nav.myClaims', icon: Receipt, featureCode: 'EXPENSE' },
          { to: '/employee/loans', labelKey: 'Advances & Loans', icon: Banknote, featureCode: 'FINANCE' },
          { to: '/employee/resignation', labelKey: 'Resignation & Exit', icon: UserMinus, featureCode: 'RESIGNATION' },
          { to: '/employee/engagement', labelKey: 'Surveys & Polls', icon: HeartHandshake, featureCode: 'ENGAGEMENT' },
        ],
      },
      {
        title: 'Profile & Documents',
        items: [
          { to: '/employee/profile', labelKey: 'nav.myProfile', icon: User, featureCode: 'PROFILE' },
          { to: '/employee/documents', labelKey: 'nav.documents', icon: FileCheck, featureCode: 'DOC_VAULT' },
          { to: '/employee/policies', labelKey: 'nav.policies', icon: BookOpen, featureCode: 'POLICY' },
          { to: '/employee/agreement', labelKey: 'nav.agreement', icon: FileSignature, featureCode: 'AGREEMENT' },
          { to: '/employee/payslips', labelKey: 'nav.myPayslips', icon: Banknote, featureCode: 'PAYSLIP' },
          { to: '/employee/notifications', labelKey: 'nav.notificationsCenter', icon: Megaphone, featureCode: 'ANNOUNCEMENT' },
          { to: '/employee/settings', labelKey: 'nav.essSettings', icon: Settings },
          { to: '/dev/qa', labelKey: 'QA Health Matrix', icon: Activity, badge: 'Dev' },
        ],
      },
    ]
  }

  // Filter sections and items based on effective access
  const rawSections = getNavSections()
  const visibleSections = rawSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.featureCode) return true
        return hasFeature(item.featureCode)
      }),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <aside
      className={cn(
        'relative bg-card border-r border-border h-screen flex flex-col transition-all duration-300 z-40 select-none shrink-0',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand & ERP Module Identity */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="font-bold text-sm tracking-tight text-foreground block truncate">
                {t('appName')}
              </span>
              <span className="text-[10px] uppercase font-semibold text-primary block truncate">
                {settings.companyType} • {settings.role}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20">
            <Layers className="w-5 h-5" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition hidden md:flex items-center justify-center',
            collapsed && 'mx-auto mt-1'
          )}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Profile & Employee pill when expanded */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-2 rounded-lg bg-muted/50 border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-medium text-foreground truncate">{currentEmployee.name}</span>
          </div>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
            {settings.employeeType}
          </span>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {visibleSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && !collapsed && (
              <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.title}
              </p>
            )}

            {section.items.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative',
                      isActive
                        ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )
                  }
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                  {!collapsed && <span className="truncate flex-1">{t(item.labelKey, item.labelKey)}</span>}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-foreground/20 text-inherit font-bold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        ))}

        {/* Quick link to /dev/access for diagnostic inspection */}
        <div className="pt-4 border-t border-border/60">
          <NavLink
            to="/dev/access"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border border-dashed border-indigo-300 dark:border-indigo-800',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
              )
            }
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Access Diagnostics</span>}
          </NavLink>
        </div>
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground">Universal ERP Platform</p>
          <p className="text-[10px] text-muted-foreground/80">v1.0.0 • Feature Engine Active</p>
        </div>
      )}
    </aside>
  )
}
