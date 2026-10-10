import React, { useState } from 'react'
import {
  Clock,
  CalendarCheck,
  Banknote,
  Navigation,
  Receipt,
  Users,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Building,
  Sparkles,
  Inbox
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'
import { useAccess } from '@/access/useAccess'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { StatusCard } from '@/mobile/components/StatusCard'
import { ActionTile } from '@/mobile/components/ActionTile'
import { TrackingIndicator } from '@/mobile/components/TrackingIndicator'
import { PullToRefresh } from '@/mobile/components/PullToRefresh'
import { useToast } from '@/context/ToastContext'
import { formatCurrency } from '@/lib/currency'

export const MobileHomePage: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()
  const { hasFeature, currentEmployee } = useAccess()
  const { showToast } = useToast()

  const [hasPunchedIn, setHasPunchedIn] = useState(false)
  const isManager = settings.role === 'Manager'

  const handleQuickPunch = () => {
    setHasPunchedIn(!hasPunchedIn)
    if (!hasPunchedIn) {
      showToast('Punch IN recorded at 09:30 AM (GPS Geofence Verified)', 'success')
    } else {
      showToast('Punch OUT recorded successfully. Have a great evening!', 'info')
    }
  }

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    showToast('Dashboard synced with server', 'info')
  }

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader
        title={settings.role === 'HR Admin' ? 'Admin Portal' : isManager ? 'Manager Hub' : 'My Workplace'}
        subtitle={`${settings.companyType} • ${settings.employeeType}`}
        showNotificationBell={true}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-4">
          {/* Welcome User Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-primary text-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={currentEmployee.avatar}
                  alt={currentEmployee.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30 shrink-0 shadow-sm"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                      Welcome Back
                    </span>
                  </div>
                  <h2 className="text-lg font-black truncate leading-tight">
                    {currentEmployee.name}
                  </h2>
                  <p className="text-xs text-indigo-100 truncate mt-0.5">
                    {currentEmployee.designation} • {currentEmployee.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Shift & Geofence Badge */}
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-indigo-100">
                <Clock className="w-3.5 h-3.5" />
                <span>General Shift: 09:00 - 18:00</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                {currentEmployee.branch}
              </span>
            </div>
          </div>

          {/* Location & GPS Tracking Pill */}
          <div className="flex items-center justify-between">
            <TrackingIndicator status="geofenced" label="HQ Campus (Geofence Verified)" />
            <span className="text-[11px] font-semibold text-muted-foreground">
              Oct 10, 2026
            </span>
          </div>

          {/* Quick Punch Clock Card (For Employee or Manager) */}
          {hasFeature('PUNCH') && (
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Daily Attendance
                  </span>
                  <div className="text-xl font-black text-foreground mt-0.5">
                    {hasPunchedIn ? 'Punch Marked: 09:30 AM' : 'Not Punched In Yet'}
                  </div>
                </div>

                <div
                  className={`w-3 h-3 rounded-full ${
                    hasPunchedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={handleQuickPunch}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition select-none ${
                  hasPunchedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                <Clock className="w-5 h-5 stroke-[2.5px]" />
                <span>{hasPunchedIn ? 'Mark Punch OUT' : 'One-Tap Punch IN'}</span>
              </button>
            </div>
          )}

          {/* Manager Specific: Pending Approvals Alert Card */}
          {isManager && hasFeature('MSS_APPROVALS') && (
            <div
              onClick={() => navigate('/manager/approvals')}
              className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card border border-amber-500/20 shadow-xs cursor-pointer active:scale-[0.99] transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Team Approvals Pending</h4>
                  <p className="text-xs text-muted-foreground">Leaves, OT & Expenses awaiting sign-off</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          )}

          {/* Key Glance Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {hasFeature('LEAVE') && (
              <StatusCard
                title="Leave Balance"
                value="14 Days"
                subtitle="Casual & Sick"
                icon={CalendarCheck}
                variant="info"
                onClick={() => navigate('/employee/leaves')}
              />
            )}

            {hasFeature('PAYSLIP') ? (
              <StatusCard
                title="Last Pay Slip"
                value="₹64,200"
                subtitle="Sept Net Salary"
                icon={Banknote}
                variant="success"
                onClick={() => navigate('/employee/payslips')}
              />
            ) : hasFeature('OVERTIME') ? (
              <StatusCard
                title="OT Earned"
                value="18.5 hrs"
                subtitle="₹3,700 accrued"
                icon={TrendingUp}
                variant="success"
                onClick={() => navigate('/employee/overtime')}
              />
            ) : (
              <StatusCard
                title="Active Shift"
                value="General"
                subtitle="09:00 - 18:00"
                icon={Clock}
                variant="default"
                onClick={() => navigate('/employee/shifts')}
              />
            )}
          </div>

          {/* Quick Action Tiles */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Quick Shortcuts
            </h3>

            <div className="grid grid-cols-1 gap-2">
              {hasFeature('LEAVE') && (
                <ActionTile
                  icon={Inbox}
                  label="Submit Request"
                  subtitle="Leaves, duty regularize or shift swap"
                  iconColor="text-indigo-600 dark:text-indigo-400"
                  iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                  onClick={() => navigate('/employee/requests')}
                />
              )}

              {hasFeature('VISIT') && (
                <ActionTile
                  icon={Navigation}
                  label="Client Visits & Beats"
                  subtitle="Today's beat plan & GPS check-in"
                  badge="Beat Plan"
                  badgeVariant="primary"
                  iconColor="text-blue-600 dark:text-blue-400"
                  iconBg="bg-blue-50 dark:bg-blue-950/40"
                  onClick={() => navigate('/employee/visits')}
                />
              )}

              {hasFeature('EXPENSE') && (
                <ActionTile
                  icon={Receipt}
                  label="Expense Claim"
                  subtitle="Submit bill voucher with camera receipt"
                  iconColor="text-emerald-600 dark:text-emerald-400"
                  iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                  onClick={() => navigate('/employee/claims')}
                />
              )}

              {isManager && (
                <ActionTile
                  icon={Users}
                  label="Team Live Attendance"
                  subtitle="View who is on-duty, late, or on-leave"
                  badge="Team Radar"
                  badgeVariant="warning"
                  iconColor="text-purple-600 dark:text-purple-400"
                  iconBg="bg-purple-50 dark:bg-purple-950/40"
                  onClick={() => navigate('/manager/attendance')}
                />
              )}
            </div>
          </div>
        </div>
      </PullToRefresh>
    </div>
  )
}
