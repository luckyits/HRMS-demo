import React from 'react'
import {
  Clock,
  CalendarDays,
  CalendarCheck,
  TrendingUp,
  FileSpreadsheet,
  Navigation,
  Banknote,
  Receipt,
  CreditCard,
  FileText,
  BookOpen,
  FileSignature,
  LifeBuoy,
  UserMinus,
  GraduationCap,
  HeartHandshake,
  ClipboardCheck,
  Users,
  Settings,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  Gift,
  Target,
  Laptop,
  Megaphone,
  History,
  Sliders,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ActionTile } from '@/mobile/components/ActionTile'

export const MobileMorePage: React.FC = () => {
  const navigate = useNavigate()
  const { hasFeature, currentEmployee } = useAccess()
  const { settings } = useDemo()

  const isManager = settings.role === 'Manager'
  const isAdmin = settings.role === 'HR Admin'
  const isBranchHr = settings.role === 'Branch HR'
  const isHr = isAdmin || isBranchHr

  const hasAttendanceItems =
    hasFeature('PUNCH') ||
    hasFeature('SHIFT_ROSTER') ||
    hasFeature('OVERTIME') ||
    hasFeature('TIMESHEET') ||
    hasFeature('VISIT')

  const hasLeaveItems =
    hasFeature('LEAVE') ||
    hasFeature('CALENDAR') ||
    hasFeature('BIRTHDAY_ANNIV')

  const hasFinanceItems =
    hasFeature('PAYSLIP') ||
    hasFeature('EXPENSE') ||
    hasFeature('FINANCE') ||
    hasFeature('INCENTIVE')

  const hasLearningItems =
    hasFeature('TRAINING') ||
    hasFeature('PERFORMANCE') ||
    hasFeature('ASSET') ||
    hasFeature('ENGAGEMENT') ||
    hasFeature('HELPDESK') ||
    hasFeature('POLICY') ||
    hasFeature('RESIGNATION')

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader
        title="All Features & Hub"
        subtitle="Catalog of permitted modules"
        showBack={false}
      />

      <div className="p-4 space-y-6">
        {/* User Profile Mini Card */}
        <div
          onClick={() => navigate('/employee/profile')}
          className="p-4 rounded-3xl bg-card border border-border shadow-xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">
                {currentEmployee.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {currentEmployee.designation} • {currentEmployee.id}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {settings.role}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {settings.companyType}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>

        {/* 0. HR Operations & People Operations Control (If HR Admin or Branch HR) */}
        {isHr && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              HR People Operations & Control
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <ActionTile
                icon={ClipboardCheck}
                label="HR Approvals Inbox"
                subtitle="Leaves > 5d, loans, resignations & expenses"
                badge="HR Scope"
                badgeVariant="primary"
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                onClick={() => navigate('/hr/approvals')}
              />
              <ActionTile
                icon={Clock}
                label="Live Attendance & Flagged Punches"
                subtitle="Branch muster & suspicious punch review"
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                onClick={() => navigate('/hr/attendance')}
              />
              <ActionTile
                icon={Users}
                label="Employee 360 Lookup"
                subtitle="Search profiles, attendance, masked salary"
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-950/40"
                onClick={() => navigate('/hr/employees')}
              />
              <ActionTile
                icon={Sliders}
                label="Feature Access Quick View"
                subtitle="Why-trace timeline & temporary grant for N days"
                badge="Access Engine"
                badgeVariant="primary"
                iconColor="text-purple-600 dark:text-purple-400"
                iconBg="bg-purple-50 dark:bg-purple-950/40"
                onClick={() => navigate('/hr/features')}
              />
              <ActionTile
                icon={Megaphone}
                label="Announcements & Broadcasts"
                subtitle="Compose and publish to branch or profile"
                iconColor="text-pink-600 dark:text-pink-400"
                iconBg="bg-pink-50 dark:bg-pink-950/40"
                onClick={() => navigate('/hr/announcements')}
              />
              <ActionTile
                icon={UserMinus}
                label="Regularization & Resignation Queues"
                subtitle="Punch corrections & employee separation desk"
                iconColor="text-amber-600 dark:text-amber-400"
                iconBg="bg-amber-50 dark:bg-amber-950/40"
                onClick={() => navigate('/hr/queues')}
              />
              <ActionTile
                icon={History}
                label="HR Audit Trail Feed"
                subtitle="Chronological log of permissions & changes"
                iconColor="text-teal-600 dark:text-teal-400"
                iconBg="bg-teal-50 dark:bg-teal-950/40"
                onClick={() => navigate('/hr/audit')}
              />
            </div>
          </div>
        )}

        {/* 1. Manager Supervision Hub (If Manager) */}
        {isManager && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Manager Supervision Desk
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hasFeature('MSS_APPROVALS') && (
                <ActionTile
                  icon={ClipboardCheck}
                  label="Approval Inbox"
                  subtitle="Leaves, regularizations & team claims"
                  badge="MSS"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/manager/approvals')}
                />
              )}
              {hasFeature('OVERTIME') && (
                <ActionTile
                  icon={TrendingUp}
                  label="Supervisor OT Queue"
                  subtitle="Approve overtime hours for factory workers"
                  iconColor="text-amber-600 dark:text-amber-400"
                  iconBg="bg-amber-50 dark:bg-amber-950/40"
                  onClick={() => navigate('/manager/overtime-approvals')}
                />
              )}
              {hasFeature('VISIT') && (
                <ActionTile
                  icon={Navigation}
                  label="Field Visit Radar"
                  subtitle="Live GPS beats & team visits"
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBg="bg-blue-50 dark:bg-blue-950/40"
                  onClick={() => navigate('/manager/visits')}
                />
              )}
              {hasFeature('TIMESHEET') && (
                <ActionTile
                  icon={FileSpreadsheet}
                  label="Timesheet Approvals"
                  subtitle="Weekly client hours sign-off"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  onClick={() => navigate('/manager/timesheets')}
                />
              )}
              {hasFeature('MSS_APPROVALS') && (
                <ActionTile
                  icon={Users}
                  label="Direct Team Members"
                  subtitle="Roster list and contact details"
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBg="bg-purple-50 dark:bg-purple-950/40"
                  onClick={() => navigate('/manager/members')}
                />
              )}
            </div>
          </div>
        )}

        {/* 2. Attendance, Shifts & Field */}
        {hasAttendanceItems && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Attendance & Shifts
            </h4>
            <div className="grid grid-cols-1 gap-2">
            {hasFeature('PUNCH') && (
              <ActionTile
                icon={Clock}
                label="Daily Attendance & Clock"
                subtitle="Punch in/out, selfie verification"
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                onClick={() => navigate('/employee/attendance')}
              />
            )}
            {hasFeature('SHIFT_ROSTER') && (
              <ActionTile
                icon={CalendarDays}
                label="Shift Roster & Rotation"
                subtitle="Weekly shift timings and swaps"
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-950/40"
                onClick={() => navigate('/employee/shifts')}
              />
            )}
            {hasFeature('OVERTIME') && (
              <ActionTile
                icon={TrendingUp}
                label="Overtime & Bonus Tracker"
                subtitle="OT hours, comp-off & attendance incentives"
                iconColor="text-amber-600 dark:text-amber-400"
                iconBg="bg-amber-50 dark:bg-amber-950/40"
                onClick={() => navigate('/employee/overtime')}
              />
            )}
            {hasFeature('TIMESHEET') && (
              <ActionTile
                icon={FileSpreadsheet}
                label="Weekly Project Timesheets"
                subtitle="Log billable client hours and tasks"
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                onClick={() => navigate('/employee/timesheets')}
              />
            )}
            {hasFeature('VISIT') && (
              <ActionTile
                icon={Navigation}
                label="Client Visits & Geo-Checkin"
                subtitle="Today's beat plan & GPS check-in"
                iconColor="text-rose-600 dark:text-rose-400"
                iconBg="bg-rose-50 dark:bg-rose-950/40"
                onClick={() => navigate('/employee/visits')}
              />
            )}
          </div>
        </div>
        )}

        {/* 3. Leave & Holidays */}
        {hasLeaveItems && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Leaves & Holidays
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hasFeature('LEAVE') && (
                <ActionTile
                  icon={CalendarCheck}
                  label="Leave Application & Wallets"
                  subtitle="Casual, sick, earned leaves and quotas"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/employee/leaves')}
                />
              )}
              {hasFeature('CALENDAR') && (
                <ActionTile
                  icon={CalendarDays}
                  label="Holiday Calendar"
                  subtitle="National, state and optional holidays"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  onClick={() => navigate('/employee/calendar')}
                />
              )}
              {hasFeature('BIRTHDAY_ANNIV') && (
                <ActionTile
                  icon={Gift}
                  label="Birthdays & Work Celebrations"
                  subtitle="Team anniversaries and greetings"
                  iconColor="text-pink-600 dark:text-pink-400"
                  iconBg="bg-pink-50 dark:bg-pink-950/40"
                  onClick={() => navigate('/employee/celebrations')}
                />
              )}
            </div>
          </div>
        )}

        {/* 4. Claims & Finance */}
        {hasFinanceItems && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Payroll & Finance
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hasFeature('PAYSLIP') && (
                <ActionTile
                  icon={Banknote}
                  label="Payslips & Tax Form 16"
                  subtitle="Monthly salary vouchers & deductions"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  onClick={() => navigate('/employee/payslips')}
                />
              )}
              {hasFeature('EXPENSE') && (
                <ActionTile
                  icon={Receipt}
                  label="Expense Reimbursements"
                  subtitle="Travel, food and lodging vouchers"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/employee/claims')}
                />
              )}
              {hasFeature('FINANCE') && (
                <ActionTile
                  icon={CreditCard}
                  label="Salary Advances & Loans"
                  subtitle="EMI calculator and recovery status"
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBg="bg-purple-50 dark:bg-purple-950/40"
                  onClick={() => navigate('/employee/loans')}
                />
              )}
              {hasFeature('INCENTIVE') && (
                <ActionTile
                  icon={TrendingUp}
                  label="Sales Incentives & Target Commission"
                  subtitle="Achievement ring, tier slabs & earned payout"
                  iconColor="text-amber-600 dark:text-amber-400"
                  iconBg="bg-amber-50 dark:bg-amber-950/40"
                  onClick={() => navigate('/employee/incentive')}
                />
              )}
            </div>
          </div>
        )}

        {/* 5. Learning & Engagement */}
        {hasLearningItems && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Learning & Culture
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {hasFeature('TRAINING') && (
                <ActionTile
                  icon={GraduationCap}
                  label="LMS Courses & Safety Training"
                  subtitle="Mandatory certifications and renewal"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/employee/training')}
                />
              )}
              {hasFeature('PERFORMANCE') && (
                <ActionTile
                  icon={Target}
                  label="Performance Goals & Appraisals"
                  subtitle="Annual review self-evaluation & OKRs"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/employee/performance')}
                />
              )}
              {hasFeature('ASSET') && (
                <ActionTile
                  icon={Laptop}
                  label="Company Assets & Devices"
                  subtitle="Assigned hardware, custody & handover"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  onClick={() => navigate('/employee/assets')}
                />
              )}
              {hasFeature('ENGAGEMENT') && (
                <ActionTile
                  icon={HeartHandshake}
                  label="Company Pulse & Live Polls"
                  subtitle="Anonymous pulse survey and voting"
                  iconColor="text-rose-600 dark:text-rose-400"
                  iconBg="bg-rose-50 dark:bg-rose-950/40"
                  onClick={() => navigate('/employee/engagement')}
                />
              )}
              {hasFeature('HELPDESK') && (
                <ActionTile
                  icon={LifeBuoy}
                  label="Internal HR Helpdesk"
                  subtitle="Raise query tickets and track resolution"
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBg="bg-blue-50 dark:bg-blue-950/40"
                  onClick={() => navigate('/employee/helpdesk')}
                />
              )}
              {hasFeature('POLICY') && (
                <ActionTile
                  icon={BookOpen}
                  label="Company Policies & Handbooks"
                  subtitle="Leave, conduct and travel guidelines"
                  iconColor="text-amber-600 dark:text-amber-400"
                  iconBg="bg-amber-50 dark:bg-amber-950/40"
                  onClick={() => navigate('/employee/policies')}
                />
              )}
              {hasFeature('RESIGNATION') && (
                <ActionTile
                  icon={UserMinus}
                  label="Separation & Resignation Desk"
                  subtitle="Notice period & handover checklist"
                  iconColor="text-zinc-600 dark:text-zinc-400"
                  iconBg="bg-zinc-100 dark:bg-zinc-900"
                  onClick={() => navigate('/employee/resignation')}
                />
              )}
            </div>
          </div>
        )}

        {/* 6. System & Diagnostics */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Settings & QA Tools
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <ActionTile
              icon={Activity}
              label="QA Route Health Matrix"
              subtitle="/dev/qa - 7 profiles x 9 companies test"
              badge="Dev QA"
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
              onClick={() => navigate('/dev/qa')}
            />
            <ActionTile
              icon={ShieldCheck}
              label="Access Engine Diagnostics"
              subtitle="/dev/access - inspect permission gates"
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
              onClick={() => navigate('/dev/access')}
            />
            <ActionTile
              icon={Settings}
              label="Preferences & Language"
              subtitle="Dark mode, notifications, language"
              iconColor="text-muted-foreground"
              iconBg="bg-muted"
              onClick={() => navigate('/employee/settings')}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
