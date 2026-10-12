import React, { useMemo } from 'react'
import {
  Users,
  Clock,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Megaphone,
  History,
  Sparkles,
  Search,
  Sliders,
  ChevronRight,
  Building,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'
import { useAccess } from '@/access/useAccess'
import { useEmployees } from '@/context/EmployeeContext'
import { useAdminAttendance } from '@/context/AdminAttendanceContext'
import { useWorkflow } from '@/context/WorkflowContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ActionTile } from '@/mobile/components/ActionTile'
import { PullToRefresh } from '@/mobile/components/PullToRefresh'

export const MobileHrHomePage: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()
  const { currentEmployee, hasFeature } = useAccess()
  const { employees, documentsQueue } = useEmployees()
  const { livePunches, suspiciousPunches } = useAdminAttendance()
  const { requests } = useWorkflow()

  const isBranchHr = settings.role === 'Branch HR'
  const activeBranch = settings.currentUser.branch || 'Mumbai Branch'

  // Data scope filtering
  const scopedEmployees = useMemo(() => {
    if (isBranchHr) {
      return employees.filter(
        (e) => e.branch?.toLowerCase() === activeBranch.toLowerCase()
      )
    }
    return employees
  }, [employees, isBranchHr, activeBranch])

  const scopedPunches = useMemo(() => {
    if (isBranchHr) {
      return livePunches.filter(
        (p) => p.branch?.toLowerCase() === activeBranch.toLowerCase()
      )
    }
    return livePunches
  }, [livePunches, isBranchHr, activeBranch])

  const scopedSuspicious = useMemo(() => {
    return suspiciousPunches.filter((s) => {
      if (s.status !== 'Pending Review') return false
      if (isBranchHr) {
        const emp = employees.find((e) => e.id === s.employeeId)
        return emp?.branch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [suspiciousPunches, isBranchHr, activeBranch, employees])

  const scopedPendingRequests = useMemo(() => {
    return requests.filter((r) => {
      if (r.status !== 'pending') return false
      if (isBranchHr) {
        return r.requesterBranch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [requests, isBranchHr, activeBranch])

  // Stat metrics
  const totalHeadcount = scopedEmployees.length || 24
  const presentCount = scopedPunches.filter(
    (p) => p.status === 'Late' || p.status === 'Present'
  ).length
  const lateCount = scopedPunches.filter((p) => p.status === 'Late').length
  const attendanceRate = totalHeadcount > 0 ? Math.round((presentCount / totalHeadcount) * 100) : 92

  // Alerts
  const probationCount = scopedEmployees.filter((e) => e.status === 'Probation').length
  const pendingDocsCount = documentsQueue.filter((d) => d.status === 'Pending').length

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600))
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title={isBranchHr ? 'Branch HR Portal' : 'HR People Operations'}
        subtitle={isBranchHr ? activeBranch : 'Enterprise Headquarters'}
        showNotificationBell={true}
      />

      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-4">
          {/* HR Persona Greeting Banner */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-primary/10 via-card to-card border border-primary/20 shadow-xs flex items-center justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isBranchHr ? 'Branch HR Console' : 'Central HR Command'}</span>
              </div>
              <h2 className="text-lg font-black text-foreground tracking-tight mt-0.5 truncate">
                {settings.currentUser.name}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                <span className="font-medium text-foreground">{settings.currentUser.title}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {isBranchHr ? activeBranch : 'All Locations'}
                </span>
              </div>
            </div>

            <img
              src={settings.currentUser.avatar}
              alt={settings.currentUser.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/30 shadow-xs shrink-0"
            />
          </div>

          {/* Today's Live Metric Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Headcount */}
            <div
              onClick={() => navigate('/hr/employees')}
              className="p-3 rounded-2xl bg-card border border-border shadow-2xs cursor-pointer active:scale-95 transition"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Staff</span>
              </div>
              <p className="text-xl font-black text-foreground tracking-tight">
                {totalHeadcount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {isBranchHr ? 'Branch pool' : 'Total active'}
              </p>
            </div>

            {/* Present Today */}
            <div
              onClick={() => navigate('/hr/attendance')}
              className="p-3 rounded-2xl bg-card border border-border shadow-2xs cursor-pointer active:scale-95 transition"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  {attendanceRate}%
                </span>
              </div>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {presentCount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {lateCount > 0 ? `${lateCount} Late` : 'On time'}
              </p>
            </div>

            {/* Pending Approvals */}
            <div
              onClick={() => navigate('/hr/approvals')}
              className="p-3 rounded-2xl bg-card border border-border shadow-2xs cursor-pointer active:scale-95 transition"
            >
              <div className="flex items-center justify-between text-muted-foreground mb-1">
                <ClipboardCheck className="w-4 h-4 text-amber-500" />
                {scopedPendingRequests.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {scopedPendingRequests.length}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                Needs review
              </p>
            </div>
          </div>

          {/* Operational Alerts Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Actionable Alerts & Exceptions
              </h3>
              <span className="text-[11px] font-bold text-primary">
                {scopedSuspicious.length + (probationCount > 0 ? 1 : 0) + (pendingDocsCount > 0 ? 1 : 0)} items
              </span>
            </div>

            <div className="space-y-2">
              {/* Suspicious Punches Alert */}
              <div
                onClick={() => navigate('/hr/attendance?tab=suspicious')}
                className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.99] transition ${
                  scopedSuspicious.length > 0
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                    : 'bg-card border-border text-foreground'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">
                      {scopedSuspicious.length > 0
                        ? `${scopedSuspicious.length} Suspicious Punches Detected`
                        : 'No Suspicious Punch Flags'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {scopedSuspicious.length > 0
                        ? 'Geofence mismatch, offline punches or rapid duplicates'
                        : 'Biometric & geofence integrity is clean'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>

              {/* Expiring / Pending KYC Documents */}
              <div
                onClick={() => navigate('/hr/employees')}
                className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex items-center justify-between cursor-pointer active:scale-[0.99] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">
                      {pendingDocsCount > 0
                        ? `${pendingDocsCount} Employee Documents Awaiting KYC Verification`
                        : '2 Identity Documents Expiring within 30 Days'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Passport / PAN card renewal & compliance audits
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>

              {/* Probation Milestones Alert */}
              <div
                onClick={() => navigate('/hr/employees?status=Probation')}
                className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-950 dark:text-blue-200 flex items-center justify-between cursor-pointer active:scale-[0.99] transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">
                      {probationCount} Team Members Completing Probation
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Performance milestones due for permanent signoff
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            </div>
          </div>

          {/* Quick Action Tiles */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              HR Administration Hub
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <ActionTile
                icon={ClipboardCheck}
                label="HR Approvals Inbox"
                subtitle="Leave > 5d, loans, resignations & expenses"
                badge={scopedPendingRequests.length > 0 ? `${scopedPendingRequests.length} Pending` : undefined}
                badgeVariant="primary"
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                onClick={() => navigate('/hr/approvals')}
              />

              <ActionTile
                icon={Clock}
                label="Live Attendance & Flagged Punches"
                subtitle="Branch headcount & suspicious punch review"
                badge={scopedSuspicious.length > 0 ? `${scopedSuspicious.length} Flags` : undefined}
                badgeVariant="warning"
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-950/40"
                onClick={() => navigate('/hr/attendance')}
              />

              <ActionTile
                icon={Users}
                label="Employee 360 Lookup"
                subtitle="Search profiles, attendance, leaves & masked CTC"
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-950/40"
                onClick={() => navigate('/hr/employees')}
              />

              <ActionTile
                icon={Sliders}
                label="Feature Access Quick View"
                subtitle="Vertical why-trace & temporary grant for N days"
                badge="Access Engine"
                badgeVariant="primary"
                iconColor="text-purple-600 dark:text-purple-400"
                iconBg="bg-purple-50 dark:bg-purple-950/40"
                onClick={() => navigate('/hr/features')}
              />

              <ActionTile
                icon={Megaphone}
                label="Announcements & Broadcasts"
                subtitle="Compose & publish to branch or profile"
                iconColor="text-pink-600 dark:text-pink-400"
                iconBg="bg-pink-50 dark:bg-pink-950/40"
                onClick={() => navigate('/hr/announcements')}
              />

              <ActionTile
                icon={AlertTriangle}
                label="Regularization & Resignation Queues"
                subtitle="Punch corrections & employee separation desk"
                iconColor="text-amber-600 dark:text-amber-400"
                iconBg="bg-amber-50 dark:bg-amber-950/40"
                onClick={() => navigate('/hr/queues')}
              />

              <ActionTile
                icon={History}
                label="HR Audit Trail Feed"
                subtitle="Real-time chronological log of permissions & actions"
                iconColor="text-teal-600 dark:text-teal-400"
                iconBg="bg-teal-50 dark:bg-teal-950/40"
                onClick={() => navigate('/hr/audit')}
              />
            </div>
          </div>
        </div>
      </PullToRefresh>
    </div>
  )
}
