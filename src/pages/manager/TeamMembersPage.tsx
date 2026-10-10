import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  Building,
  Calendar,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export const TeamMembersPage: React.FC = () => {
  const { employees } = useEmployees()
  const [searchTerm, setSearchTerm] = useState('')

  const team = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  const filteredTeam = useMemo(() => {
    return team.filter((e) => {
      return (
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.designation.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [team, searchTerm])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Direct Reports & Team Directory"
        subtitle="Manage contact records, emergency numbers, and operational placements (Compensation figures restricted for managers)."
      />

      {/* Security Notice */}
      <div className="p-3 bg-muted/40 border border-border rounded-xl flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>Restricted Data View: Individual salary and statutory bank data hidden under Manager scope.</span>
        </div>
        <span className="font-semibold">{team.length} Members Reporting</span>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-2xs">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reportee by name, ID or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-lg"
          />
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeam.map((emp) => (
          <div
            key={emp.id}
            className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-12 h-12 rounded-xl object-cover border border-border shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{emp.name}</h4>
                    <p className="text-xs text-muted-foreground">{emp.designation}</p>
                    <span className="text-[10px] font-semibold text-primary font-mono">{emp.id} · {emp.grade}</span>
                  </div>
                </div>
                <StatusBadge status={emp.status} />
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-4 border-t border-border/50 mt-4">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-mono text-[11px] truncate">{emp.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{emp.phone || '+91 98450 11223'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5" />
                  <span>{emp.branch}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined: {emp.joiningDate}</span>
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-secondary-foreground border border-border">
                {emp.profileType}
              </span>
              <Link
                to={`/hr/employees/${emp.id}`}
                className="inline-flex items-center gap-1 text-primary hover:underline font-semibold text-[11px]"
              >
                <span>Full Profile</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
