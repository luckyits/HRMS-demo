import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  Clock,
  UserX,
  Calendar,
  Navigation,
  ClipboardCheck,
  CalendarDays,
  Send,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  ChevronRight,
  UserCheck,
  Layers
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ActionTile } from '@/mobile/components/ActionTile'
import { useAccess } from '@/access/useAccess'
import { useEmployees } from '@/context/EmployeeContext'
import { useWorkflow } from '@/context/WorkflowContext'
import { useDemo } from '@/context/DemoContext'

export const MobileManagerHomePage: React.FC = () => {
  const navigate = useNavigate()
  const { hasFeature, currentEmployee } = useAccess()
  const { employees } = useEmployees()
  const { requests, delegationRule } = useWorkflow()
  const { settings } = useDemo()

  // Filter scoped team members (Reporting to Vikram Malhotra or Engineering)
  const teamMembers = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  // Team presence counts
  const teamSummary = useMemo(() => {
    const statuses: ('In' | 'Absent' | 'Late' | 'On Leave' | 'On Visit')[] = [
      'In', 'In', 'Late', 'In', 'On Leave', 'On Visit', 'Absent', 'In'
    ]
    const list = teamMembers.map((emp, i) => ({
      ...emp,
      status: statuses[i % statuses.length],
    }))

    return {
      in: list.filter((m) => m.status === 'In').length,
      late: list.filter((m) => m.status === 'Late').length,
      absent: list.filter((m) => m.status === 'Absent').length,
      onLeave: list.filter((m) => m.status === 'On Leave').length,
      onVisit: list.filter((m) => m.status === 'On Visit').length,
      total: list.length,
    }
  }, [teamMembers])

  // Pending requests breakdown
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.status === 'pending')
  }, [requests])

  const pendingByType = useMemo(() => {
    const counts: Record<string, number> = {}
    pendingRequests.forEach((r) => {
      counts[r.requestType] = (counts[r.requestType] || 0) + 1
    })
    return counts
  }, [pendingRequests])

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Manager Dashboard"
        subtitle={`Team Lead: ${currentEmployee.name} • ${currentEmployee.branch}`}
        showBack={false}
      />

      <div className="p-4 space-y-5">
        {/* Active Delegation Banner */}
        {delegationRule?.isActive && (
          <div
            onClick={() => navigate('/manager/delegation')}
            className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between cursor-pointer active:scale-[0.99] transition text-xs"
          >
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Delegated to <strong>{delegationRule.delegateName}</strong> ({delegationRule.startDate} to {delegationRule.endDate})
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
          </div>
        )}

        {/* 1. Today's Team Presence Summary (Tappable StatCards) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today's Team Presence ({teamSummary.total} Members)
            </span>
            <button
              type="button"
              onClick={() => navigate('/manager/attendance')}
              className="text-[11px] text-primary font-bold hover:underline"
            >
              Live Register →
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1.5 text-center">
            {/* In */}
            <div
              onClick={() => navigate('/manager/members?filter=In')}
              className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 cursor-pointer active:scale-95 transition flex flex-col items-center justify-center"
            >
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {teamSummary.in}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                In
              </span>
            </div>

            {/* Late */}
            <div
              onClick={() => navigate('/manager/members?filter=Late')}
              className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 cursor-pointer active:scale-95 transition flex flex-col items-center justify-center"
            >
              <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
                {teamSummary.late}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                Late
              </span>
            </div>

            {/* Absent */}
            <div
              onClick={() => navigate('/manager/members?filter=Absent')}
              className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 cursor-pointer active:scale-95 transition flex flex-col items-center justify-center"
            >
              <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                {teamSummary.absent}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                Absent
              </span>
            </div>

            {/* On Leave */}
            <div
              onClick={() => navigate('/manager/members?filter=On Leave')}
              className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 cursor-pointer active:scale-95 transition flex flex-col items-center justify-center"
            >
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono">
                {teamSummary.onLeave}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                Leave
              </span>
            </div>

            {/* On Visit */}
            <div
              onClick={() => navigate('/manager/members?filter=On Visit')}
              className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 cursor-pointer active:scale-95 transition flex flex-col items-center justify-center"
            >
              <span className="text-lg font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {teamSummary.onVisit}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground mt-0.5">
                Visit
              </span>
            </div>
          </div>
        </div>

        {/* 2. Needs Your Action Card */}
        <div
          onClick={() => navigate('/manager/approvals')}
          className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white shadow-md cursor-pointer active:scale-[0.99] transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
              Needs Your Action
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500 text-white">
              {pendingRequests.length} Pending
            </span>
          </div>

          <div>
            <h3 className="text-xl font-black">
              {pendingRequests.length} Team Approvals Awaiting Review
            </h3>
            <p className="text-xs text-indigo-200/80 mt-1">
              Tap to open fast swipe approvals inbox
            </p>
          </div>

          {/* Pending by type breakdown pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(pendingByType).map(([type, count]) => (
              <span
                key={type}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-white/10 text-white"
              >
                {type}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* 3. Quick Action Tiles */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Manager Workflows
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {hasFeature('MSS_APPROVALS') && (
              <ActionTile
                icon={ClipboardCheck}
                label="Approvals Inbox"
                subtitle={`${pendingRequests.length} requests pending review & sign-off`}
                badge={`${pendingRequests.length} New`}
                badgeVariant="warning"
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                onClick={() => navigate('/manager/approvals')}
              />
            )}

            <ActionTile
              icon={Users}
              label="Team Directory & 360"
              subtitle="Attendance records, leave balances & contact cards"
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-50 dark:bg-blue-950/40"
              onClick={() => navigate('/manager/members')}
            />

            {hasFeature('SHIFT_ROSTER') && (
              <ActionTile
                icon={CalendarDays}
                label="Roster & Shift Assignment"
                subtitle="Assign weekly shifts with rest-hour compliance"
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                onClick={() => navigate('/manager/roster')}
              />
            )}

            {hasFeature('CALENDAR') && (
              <ActionTile
                icon={Calendar}
                label="Team Leave Calendar"
                subtitle="Upcoming leaves, festival holidays & birthdays"
                iconColor="text-purple-600 dark:text-purple-400"
                iconBg="bg-purple-50 dark:bg-purple-950/40"
                onClick={() => navigate('/manager/calendar')}
              />
            )}

            {hasFeature('VISIT') && (
              <ActionTile
                icon={Navigation}
                label="Field Visit Monitoring"
                subtitle="Live GPS beat plan & missed client visit alerts"
                badge="Field GPS"
                iconColor="text-rose-600 dark:text-rose-400"
                iconBg="bg-rose-50 dark:bg-rose-950/40"
                onClick={() => navigate('/manager/visits')}
              />
            )}

            {hasFeature('MSS_APPROVALS') && (
              <ActionTile
                icon={Send}
                label="Raise Request on Behalf"
                subtitle="Apply leave or regularize for offline team members"
                iconColor="text-amber-600 dark:text-amber-400"
                iconBg="bg-amber-50 dark:bg-amber-950/40"
                onClick={() => navigate('/manager/on-behalf')}
              />
            )}

            <ActionTile
              icon={ShieldCheck}
              label="Approval Delegation Settings"
              subtitle={
                delegationRule?.isActive
                  ? `Active: Delegated to ${delegationRule.delegateName}`
                  : 'Assign temporary backup approver while out of office'
              }
              iconColor="text-teal-600 dark:text-teal-400"
              iconBg="bg-teal-50 dark:bg-teal-950/40"
              onClick={() => navigate('/manager/delegation')}
            />

            <ActionTile
              icon={AlertTriangle}
              label="Probation & Exit Alerts"
              subtitle="Review probation confirmations & handover checklist"
              iconColor="text-orange-600 dark:text-orange-400"
              iconBg="bg-orange-50 dark:bg-orange-950/40"
              onClick={() => navigate('/manager/alerts')}
            />

            {hasFeature('TEAM_REPORTS') && (
              <ActionTile
                icon={FileSpreadsheet}
                label="Team Analytics & Muster Register"
                subtitle="Headcount muster, OT summaries & CSV exports"
                iconColor="text-sky-600 dark:text-sky-400"
                iconBg="bg-sky-50 dark:bg-sky-950/40"
                onClick={() => navigate('/manager/reports')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
