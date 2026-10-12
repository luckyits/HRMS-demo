import React, { useState, useMemo } from 'react'
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  UserX,
  Calendar,
  Navigation,
  Phone,
  Mail,
  ChevronRight,
  FileEdit,
  Send,
  CalendarDays,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ChipFilterRow } from '@/mobile/components/ChipFilterRow'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { SegmentedControl } from '@/mobile/components/SegmentedControl'
import { useEmployees, type ExtendedEmployee } from '@/context/EmployeeContext'
import { useWorkflow } from '@/context/WorkflowContext'
import { useToast } from '@/context/ToastContext'

interface ScopedMember extends ExtendedEmployee {
  attendanceStatus: 'In' | 'Absent' | 'Late' | 'On Leave' | 'On Visit'
  punchInTime?: string
  punchOutTime?: string
  shiftTiming: string
}

export const MobileTeamPage: React.FC = () => {
  const { employees } = useEmployees()
  const { regularizeOnBehalf } = useWorkflow()
  const { showToast } = useToast()

  const [mainView, setMainView] = useState<'members' | 'attendance'>('members')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  // Selected member for detail bottom sheet
  const [selectedMember, setSelectedMember] = useState<ScopedMember | null>(null)

  // Regularize on behalf state
  const [isRegOnBehalfOpen, setIsRegOnBehalfOpen] = useState(false)
  const [regDate, setRegDate] = useState('2026-10-09')
  const [regInTime, setRegInTime] = useState('09:30')
  const [regOutTime, setRegOutTime] = useState('18:30')
  const [regReason, setRegReason] = useState('')

  // Scoped team members under Vikram Malhotra (Engineering)
  const teamMembers: ScopedMember[] = useMemo(() => {
    const scoped = employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )

    const statuses: ('In' | 'Absent' | 'Late' | 'On Leave' | 'On Visit')[] = [
      'In', 'In', 'Late', 'In', 'On Leave', 'On Visit', 'Absent', 'In'
    ]

    return scoped.map((emp, i) => {
      const st = statuses[i % statuses.length]
      return {
        ...emp,
        attendanceStatus: st,
        punchInTime: st === 'In' ? '09:12 AM' : st === 'Late' ? '10:04 AM' : undefined,
        punchOutTime: st === 'In' ? '—' : undefined,
        shiftTiming: 'General: 09:30 AM – 06:30 PM',
      }
    })
  }, [employees])

  // Filtered members
  const filtered = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchFilter = filter === 'All' || m.attendanceStatus === filter
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.designation.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [teamMembers, filter, search])

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return

    regularizeOnBehalf(
      selectedMember.id,
      regDate,
      `${regInTime} AM`,
      `${regOutTime} PM`,
      regReason || 'Manager regularised punch on behalf of employee.'
    )

    showToast(`Punch regularization logged on behalf of ${selectedMember.name}!`, 'success')
    setIsRegOnBehalfOpen(false)
    setRegReason('')
  }

  const getStatusBadge = (status: ScopedMember['attendanceStatus']) => {
    switch (status) {
      case 'In':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'Late':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'Absent':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
      case 'On Leave':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'
      case 'On Visit':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="My Team"
        subtitle={`${teamMembers.length} Direct Reports • Engineering`}
        showBack={false}
      />

      <div className="p-4 space-y-4">
        {/* Sub-view switcher */}
        <SegmentedControl
          options={[
            { id: 'members', label: 'Team Members' },
            { id: 'attendance', label: 'Day Attendance' },
          ]}
          selectedId={mainView}
          onSelect={(id) => setMainView(id as any)}
        />

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search member by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          />
        </div>

        {/* Filter Chips */}
        <ChipFilterRow
          chips={[
            { id: 'All', label: 'All' },
            { id: 'In', label: 'In' },
            { id: 'Late', label: 'Late' },
            { id: 'Absent', label: 'Absent' },
            { id: 'On Leave', label: 'On Leave' },
            { id: 'On Visit', label: 'On Visit' },
          ]}
          selectedId={filter}
          onSelect={setFilter}
        />

        {/* Members Cards List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center bg-card border border-border rounded-3xl space-y-1">
              <Users className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs font-semibold text-muted-foreground">No matching team members</p>
            </div>
          ) : (
            filtered.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="p-4 rounded-3xl bg-card border border-border shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">
                        {member.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.designation}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {member.branch} • {member.id}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${getStatusBadge(
                      member.attendanceStatus
                    )}`}
                  >
                    {member.attendanceStatus}
                  </span>
                </div>

                {/* Quick Info Strip */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50 text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {member.punchInTime ? `Punch In: ${member.punchInTime}` : member.shiftTiming}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-primary">
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Member Details BottomSheet (No Salary Data) */}
      <BottomSheet
        isOpen={Boolean(selectedMember) && !isRegOnBehalfOpen}
        onClose={() => setSelectedMember(null)}
        title={selectedMember?.name}
        subtitle={selectedMember ? `${selectedMember.designation} • ${selectedMember.id}` : undefined}
      >
        {selectedMember && (
          <div className="space-y-4">
            {/* Header Persona */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-foreground">{selectedMember.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedMember.department}</p>
                  <p className="text-[11px] text-primary">{selectedMember.email}</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(
                  selectedMember.attendanceStatus
                )}`}
              >
                {selectedMember.attendanceStatus}
              </span>
            </div>

            {/* Today's Attendance Context */}
            <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2 text-xs">
              <h5 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                Today's Attendance Status
              </h5>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shift:</span>
                <span className="font-semibold text-foreground">{selectedMember.shiftTiming}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Punch In:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedMember.punchInTime || 'Not checked in yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location Mode:</span>
                <span className="font-semibold text-foreground">{selectedMember.profileType || 'Office'}</span>
              </div>
            </div>

            {/* Leave Balance Wallets (No Salary Data) */}
            <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2.5">
              <h5 className="font-bold uppercase tracking-wider text-muted-foreground text-[10px]">
                Leave Balance Wallets
              </h5>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-[10px] text-muted-foreground block font-bold">EL</span>
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">10 Days</span>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] text-muted-foreground block font-bold">CL</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">4.5 Days</span>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <span className="text-[10px] text-muted-foreground block font-bold">SL</span>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400">6 Days</span>
                </div>
              </div>
            </div>

            {/* Actions: Regularize on behalf */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsRegOnBehalfOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition shadow-sm"
              >
                <FileEdit className="w-4 h-4" />
                <span>Regularize on Behalf</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="py-3 px-4 rounded-xl bg-muted text-foreground font-bold text-xs active:scale-95 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Regularize on Behalf Form Sheet */}
      <BottomSheet
        isOpen={isRegOnBehalfOpen}
        onClose={() => setIsRegOnBehalfOpen(false)}
        title={selectedMember ? `Regularize Punch: ${selectedMember.name}` : 'Regularize on Behalf'}
        subtitle="Manager administrative punch correction"
      >
        <form onSubmit={handleRegularizeSubmit} className="space-y-4">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-primary-900 dark:text-primary-100">
            Administrative entry for <strong>{selectedMember?.name}</strong>. Attendance records and muster roll will be updated directly.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Missed Punch Date
            </label>
            <input
              type="date"
              required
              value={regDate}
              onChange={(e) => setRegDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-card border border-border rounded-xl font-semibold text-foreground focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                In Time
              </label>
              <input
                type="time"
                required
                value={regInTime}
                onChange={(e) => setRegInTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-card border border-border rounded-xl font-semibold text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Out Time
              </label>
              <input
                type="time"
                required
                value={regOutTime}
                onChange={(e) => setRegOutTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-card border border-border rounded-xl font-semibold text-foreground"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Manager Justification
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Employee attended off-site client architectural meeting..."
              value={regReason}
              onChange={(e) => setRegReason(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-card border border-border rounded-xl text-foreground focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit & Approve Punch</span>
            </button>
            <button
              type="button"
              onClick={() => setIsRegOnBehalfOpen(false)}
              className="py-3 px-4 rounded-xl bg-muted text-foreground font-bold text-xs active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
