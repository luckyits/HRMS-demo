import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees } from '@/context/EmployeeContext'
import { useWorkflow } from '@/context/WorkflowContext'
import { cn } from '@/lib/utils'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Filter,
  Search,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const TeamAttendancePage: React.FC = () => {
  const { employees } = useEmployees()
  const { regularizeOnBehalf } = useWorkflow()

  const [viewMode, setViewMode] = useState<'day' | 'month'>('day')
  const [selectedDate, setSelectedDate] = useState('2026-10-09')
  const [searchTerm, setSearchTerm] = useState('')

  // Regularize on behalf modal
  const [showRegularizeModal, setShowRegularizeModal] = useState(false)
  const [targetEmpId, setTargetEmpId] = useState(employees[2]?.id || 'EMP-003')
  const [regDate, setRegDate] = useState('2026-10-08')
  const [checkIn, setCheckIn] = useState('09:30')
  const [checkOut, setCheckOut] = useState('18:30')
  const [reason, setReason] = useState('Biometric scanner malfunction at main reception.')

  const teamMembers = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  const attendanceRows = useMemo(() => {
    const statuses = ['Present', 'Present', 'Late', 'Present', 'On Leave', 'Absent', 'Present']
    return teamMembers.map((emp, idx) => {
      const st = statuses[idx % statuses.length]
      return {
        ...emp,
        attendanceStatus: st,
        inTime: st === 'Present' ? '09:15 AM' : st === 'Late' ? '10:05 AM' : st === 'On Leave' ? '—' : '—',
        outTime: st === 'Present' || st === 'Late' ? '06:45 PM' : '—',
        workHours: st === 'Present' ? '8h 45m' : st === 'Late' ? '8h 10m' : '0h',
        monthlyPresentDays: 20 - (idx % 3),
      }
    })
  }, [teamMembers])

  const handleCommitRegularize = (e: React.FormEvent) => {
    e.preventDefault()
    regularizeOnBehalf(targetEmpId, regDate, checkIn, checkOut, reason)
    setShowRegularizeModal(false)
    alert(`Successfully regularized attendance on behalf of employee!`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Team Attendance & Roll-Call"
        subtitle="Monitor daily check-ins, monthly attendance trends, and regularize missed punches on behalf of team members."
        action={
          <button
            onClick={() => setShowRegularizeModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Regularize on Behalf</span>
          </button>
        }
      />

      {/* View Switcher & Date Picker */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition',
              viewMode === 'day' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-muted'
            )}
          >
            Daily Roll-Call View
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              'px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition',
              viewMode === 'month' ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-foreground hover:bg-muted'
            )}
          >
            Monthly Grid Summary
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs py-1.5 px-3 bg-background border border-input rounded-lg"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3">Team Member</th>
              <th className="p-3">Attendance Status</th>
              <th className="p-3">In Punch</th>
              <th className="p-3">Out Punch</th>
              <th className="p-3">Total Work Duration</th>
              <th className="p-3">Monthly Present</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {attendanceRows.map((emp) => (
              <tr key={emp.id} className="hover:bg-muted/30 transition">
                <td className="p-3">
                  <div className="flex items-center gap-2.5">
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
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      emp.attendanceStatus === 'Present'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : emp.attendanceStatus === 'Late'
                        ? 'bg-amber-500/10 text-amber-600'
                        : emp.attendanceStatus === 'On Leave'
                        ? 'bg-blue-500/10 text-blue-600'
                        : 'bg-rose-500/10 text-rose-600'
                    )}
                  >
                    {emp.attendanceStatus}
                  </span>
                </td>
                <td className="p-3 font-mono text-muted-foreground">{emp.inTime}</td>
                <td className="p-3 font-mono text-muted-foreground">{emp.outTime}</td>
                <td className="p-3 font-medium text-foreground">{emp.workHours}</td>
                <td className="p-3 font-semibold text-foreground">{emp.monthlyPresentDays} / 22 Days</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => {
                      setTargetEmpId(emp.id)
                      setShowRegularizeModal(true)
                    }}
                    className="px-2.5 py-1 text-[11px] rounded-md bg-card border border-border hover:bg-muted text-foreground transition"
                  >
                    Regularize
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Regularize on behalf modal */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <form
            onSubmit={handleCommitRegularize}
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-primary" /> Regularize Attendance on Behalf
              </h3>
              <button
                type="button"
                onClick={() => setShowRegularizeModal(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Team Member *</label>
              <select
                value={targetEmpId}
                onChange={(e) => setTargetEmpId(e.target.value)}
                className="w-full text-xs p-2 bg-background border border-input rounded-lg"
              >
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.designation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date of Missing Punch *</label>
              <input
                type="date"
                value={regDate}
                onChange={(e) => setRegDate(e.target.value)}
                className="w-full text-xs p-2 bg-background border border-input rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">In Time</label>
                <input
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs p-2 bg-background border border-input rounded-lg"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Out Time</label>
                <input
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs p-2 bg-background border border-input rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Manager Justification *</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 bg-background border border-input rounded-lg"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowRegularizeModal(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Submit & Auto-Authorize
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
