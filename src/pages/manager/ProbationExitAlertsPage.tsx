import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hourglass,
  LogOut,
  UserCheck,
  Users,
} from 'lucide-react'
import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

export const ProbationExitAlertsPage: React.FC = () => {
  const { employees, confirmProbation } = useEmployees()

  const team = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  const probationMembers = useMemo(() => {
    return team.filter((e) => e.status === 'Probation')
  }, [team])

  const noticeMembers = useMemo(() => {
    return team.filter((e) => e.status === 'On Notice' || e.id === 'EMP-012')
  }, [team])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Probation Milestones & Exit Notice Alerts"
        subtitle="Stay ahead of trial period end dates, conduct confirmation reviews, and monitor active resignation notice periods."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Probation Tracker Column */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Hourglass className="w-4 h-4 text-amber-500" />
              <span>Team Probation Reviews Due ({probationMembers.length})</span>
            </h3>
            <span className="text-[10px] text-muted-foreground">Action required before deadline</span>
          </div>

          <div className="space-y-3">
            {probationMembers.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No active probation cycles.</p>
            ) : (
              probationMembers.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-xl border border-border bg-background space-y-2 shadow-2xs text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{emp.name}</p>
                        <span className="text-[10px] text-muted-foreground">{emp.id} · {emp.designation}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600">
                      Ends: {emp.probationEndDate || '2026-11-15'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-[11px] text-muted-foreground">Joining: {emp.joiningDate}</span>
                    <button
                      onClick={() => {
                        confirmProbation(emp.id, 'Recommended by engineering manager.')
                        alert(`Confirmed employment for ${emp.name}!`)
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      Confirm Employment
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Exit & Resignation Notices Column */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Active Resignation Notice Periods ({noticeMembers.length})</span>
            </h3>
            <span className="text-[10px] text-muted-foreground">KT & Clearance in progress</span>
          </div>

          <div className="space-y-3">
            {noticeMembers.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No team members currently serving notice.</p>
            ) : (
              noticeMembers.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-xl border border-border bg-background space-y-2 shadow-2xs text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-foreground">{emp.name}</p>
                        <span className="text-[10px] text-muted-foreground">{emp.id} · {emp.designation}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600">
                      Release: 2026-12-08
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    Notice: <strong>60 Days</strong> · Handover to: Aarav Patel
                  </p>

                  <div className="pt-2 border-t border-border/50 flex justify-end">
                    <Link
                      to="/manager/approvals"
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      View Resignation Workflow &rarr;
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
