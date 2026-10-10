import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  CalendarCheck,
  Download,
  Filter,
  Palmtree,
  Search,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const TeamLeaveBalancesPage: React.FC = () => {
  const { employees } = useEmployees()

  const [searchTerm, setSearchTerm] = useState('')

  const teamMembers = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  const leaveData = useMemo(() => {
    return teamMembers.map((emp, i) => {
      const earned = 18 - (i % 6)
      const casual = 12 - (i % 4)
      const sick = 8 - (i % 3)
      const compOff = i % 3 === 0 ? 2 : 0

      return {
        ...emp,
        earned,
        casual,
        sick,
        compOff,
        total: earned + casual + sick + compOff,
      }
    })
  }, [teamMembers])

  const filtered = useMemo(() => {
    return leaveData.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [leaveData, searchTerm])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Team Leave Balances & Quota Overview"
        subtitle="Monitor remaining vacation quotas, casual allowances, and comp-off credits across reporting members."
      />

      {/* Search Input */}
      <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search member by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3">Team Member</th>
              <th className="p-3">Earned Leave (EL)</th>
              <th className="p-3">Casual Leave (CL)</th>
              <th className="p-3">Sick Leave (SL)</th>
              <th className="p-3">Comp-Off (CO)</th>
              <th className="p-3">Total Balance</th>
              <th className="p-3 text-right">Quota Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-muted/30 transition">
                <td className="p-3">
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
                </td>
                <td className="p-3 font-semibold text-foreground">{emp.earned} Days</td>
                <td className="p-3 font-semibold text-foreground">{emp.casual} Days</td>
                <td className="p-3 font-semibold text-foreground">{emp.sick} Days</td>
                <td className="p-3 font-semibold text-foreground">{emp.compOff} Days</td>
                <td className="p-3">
                  <strong className="text-primary font-mono text-sm">{emp.total} Days</strong>
                </td>
                <td className="p-3 text-right">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      emp.total > 20
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : emp.total > 10
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-rose-500/10 text-rose-600'
                    )}
                  >
                    {emp.total > 20 ? 'Healthy Balance' : emp.total > 10 ? 'Moderate' : 'Low Quota'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
