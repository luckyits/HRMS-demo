import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees } from '@/context/EmployeeContext'
import { useWorkflow } from '@/context/WorkflowContext'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Search,
  UserCheck,
  UserX,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

interface TeamPresenceRecord {
  id: string
  name: string
  avatar: string
  designation: string
  branch: string
  status: 'In' | 'Absent' | 'Late' | 'On Leave' | 'On Visit'
  punchTime?: string
  workMode: 'Office' | 'Remote' | 'Client Site'
  leaveType?: string
  visitLocation?: string
}

export const TeamDashboardPage: React.FC = () => {
  const { employees } = useEmployees()
  const { requests } = useWorkflow()

  const [activeFilter, setActiveFilter] = useState<'All' | 'In' | 'Absent' | 'Late' | 'On Leave' | 'On Visit'>('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Team members under current manager (Vikram Malhotra / Engineering)
  const teamRecords: TeamPresenceRecord[] = useMemo(() => {
    // Filter down to team members (Engineering department or reporting to Vikram)
    const team = employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )

    const statuses: ('In' | 'Absent' | 'Late' | 'On Leave' | 'On Visit')[] = [
      'In',
      'In',
      'Late',
      'In',
      'On Leave',
      'On Visit',
      'Absent',
      'In',
    ]

    return team.map((emp, idx) => {
      const st = statuses[idx % statuses.length]
      return {
        id: emp.id,
        name: emp.name,
        avatar: emp.avatar,
        designation: emp.designation,
        branch: emp.branch,
        status: st,
        punchTime: st === 'In' ? '09:12 AM' : st === 'Late' ? '10:04 AM' : undefined,
        workMode: st === 'On Visit' ? 'Client Site' : emp.profileType === 'Remote' ? 'Remote' : 'Office',
        leaveType: st === 'On Leave' ? 'Earned Leave' : undefined,
        visitLocation: st === 'On Visit' ? 'Infosys Campus, Electronic City' : undefined,
      }
    })
  }, [employees])

  const counts = useMemo(() => {
    return {
      total: teamRecords.length,
      in: teamRecords.filter((t) => t.status === 'In').length,
      late: teamRecords.filter((t) => t.status === 'Late').length,
      absent: teamRecords.filter((t) => t.status === 'Absent').length,
      leave: teamRecords.filter((t) => t.status === 'On Leave').length,
      visit: teamRecords.filter((t) => t.status === 'On Visit').length,
    }
  }, [teamRecords])

  const pendingApprovalsCount = requests.filter((r) => r.status === 'pending').length

  const filteredTeam = useMemo(() => {
    return teamRecords.filter((t) => {
      const matchFilter = activeFilter === 'All' || t.status === activeFilter
      const matchSearch =
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.designation.toLowerCase().includes(searchTerm.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [teamRecords, activeFilter, searchTerm])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Manager Team Overview Dashboard"
        subtitle="Real-time operational presence, attendance roll-call, and client visits across your direct reporting squad."
        action={
          <div className="flex items-center gap-2">
            <Link
              to="/manager/approvals"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending Approvals ({pendingApprovalsCount})</span>
            </Link>
          </div>
        }
      />

      {/* Real-time Presence Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setActiveFilter('All')}
          className={cn(
            'p-3.5 rounded-xl border text-left transition',
            activeFilter === 'All' ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Team Size</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xl font-bold text-foreground">{counts.total}</p>
        </button>

        <button
          onClick={() => setActiveFilter('In')}
          className={cn(
            'p-3.5 rounded-xl border text-left transition',
            activeFilter === 'In' ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Checked In</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{counts.in}</p>
        </button>

        <button
          onClick={() => setActiveFilter('Late')}
          className={cn(
            'p-3.5 rounded-xl border text-left transition',
            activeFilter === 'Late' ? 'border-amber-500 bg-amber-500/10' : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Late Marks</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{counts.late}</p>
        </button>

        <button
          onClick={() => setActiveFilter('On Leave')}
          className={cn(
            'p-3.5 rounded-xl border text-left transition',
            activeFilter === 'On Leave' ? 'border-blue-500 bg-blue-500/10' : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">On Leave</span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{counts.leave}</p>
        </button>

        <button
          onClick={() => setActiveFilter('On Visit')}
          className={cn(
            'p-3.5 rounded-xl border text-left transition',
            activeFilter === 'On Visit' ? 'border-indigo-500 bg-indigo-500/10' : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Client Visits</span>
            <Navigation className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{counts.visit}</p>
        </button>

        <button
          onClick={() => setActiveFilter('Absent')}
          className={cn(
            'p-3.5 rounded-xl border text-left transition',
            activeFilter === 'Absent' ? 'border-rose-500 bg-rose-500/10' : 'border-border bg-card hover:bg-muted/40'
          )}
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-[11px] font-medium">Absent</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{counts.absent}</p>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search team member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing <strong className="text-foreground">{filteredTeam.length}</strong> members
        </div>
      </div>

      {/* Team Presence Roster Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3">Team Member</th>
              <th className="p-3">Operational Status</th>
              <th className="p-3">Punch / Log Time</th>
              <th className="p-3">Work Mode</th>
              <th className="p-3">Branch Location</th>
              <th className="p-3 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTeam.map((emp) => (
              <tr key={emp.id} className="hover:bg-muted/30 transition">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-foreground">{emp.name}</p>
                      <span className="text-[10px] text-muted-foreground">{emp.id} · {emp.designation}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1',
                      emp.status === 'In'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : emp.status === 'Late'
                        ? 'bg-amber-500/10 text-amber-600'
                        : emp.status === 'On Leave'
                        ? 'bg-blue-500/10 text-blue-600'
                        : emp.status === 'On Visit'
                        ? 'bg-indigo-500/10 text-indigo-600'
                        : 'bg-rose-500/10 text-rose-600'
                    )}
                  >
                    {emp.status === 'In' && <CheckCircle2 className="w-3 h-3" />}
                    {emp.status === 'Late' && <Clock className="w-3 h-3" />}
                    {emp.status === 'On Visit' && <Navigation className="w-3 h-3" />}
                    {emp.status}
                  </span>
                  {emp.leaveType && (
                    <span className="block text-[10px] text-muted-foreground mt-0.5">({emp.leaveType})</span>
                  )}
                  {emp.visitLocation && (
                    <span className="block text-[10px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                      📍 {emp.visitLocation}
                    </span>
                  )}
                </td>
                <td className="p-3 font-mono text-muted-foreground">{emp.punchTime || '—'}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-muted text-muted-foreground font-medium">
                    {emp.workMode}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{emp.branch}</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {emp.status === 'Absent' && (
                      <Link
                        to="/manager/on-behalf"
                        className="px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-semibold"
                      >
                        Regularize
                      </Link>
                    )}
                    <Link
                      to={`/hr/employees/${emp.id}`}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                      title="View Profile"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
