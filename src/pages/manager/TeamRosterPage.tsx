import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Save,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

const SHIFT_TYPES = [
  { code: 'GEN', name: 'General Shift', time: '09:30 - 18:30', color: 'bg-primary/10 text-primary border-primary/20' },
  { code: 'M1', name: 'Morning Shift', time: '06:00 - 14:30', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  { code: 'E1', name: 'Evening Shift', time: '14:00 - 22:30', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { code: 'N1', name: 'Night Shift', time: '22:00 - 06:30', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  { code: 'WO', name: 'Weekly Off', time: 'Off Duty', color: 'bg-muted text-muted-foreground border-border' },
]

const DAYS = ['Mon Oct 12', 'Tue Oct 13', 'Wed Oct 14', 'Thu Oct 15', 'Fri Oct 16', 'Sat Oct 17', 'Sun Oct 18']

export const TeamRosterPage: React.FC = () => {
  const { employees } = useEmployees()

  const team = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  // Map employeeId -> dayIndex -> shiftCode
  const [rosterGrid, setRosterGrid] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {}
    team.forEach((emp, i) => {
      initial[emp.id] = ['GEN', 'GEN', 'GEN', 'GEN', 'GEN', 'WO', 'WO']
    })
    return initial
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleCycleShift = (empId: string, dayIdx: number) => {
    setRosterGrid((prev) => {
      const currentShifts = prev[empId] || ['GEN', 'GEN', 'GEN', 'GEN', 'GEN', 'WO', 'WO']
      const currentCode = currentShifts[dayIdx]
      const currentCodeIdx = SHIFT_TYPES.findIndex((s) => s.code === currentCode)
      const nextCode = SHIFT_TYPES[(currentCodeIdx + 1) % SHIFT_TYPES.length].code

      const updated = [...currentShifts]
      updated[dayIdx] = nextCode

      return {
        ...prev,
        [empId]: updated,
      }
    })
    setHasChanges(true)
  }

  const handleSaveRoster = () => {
    setHasChanges(false)
    alert('Weekly shift roster saved successfully!')
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Team Shift Roster & Rotations"
        subtitle="Assign weekly shifts, balance department coverage, and adjust rotational timings across supervisors and engineers."
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert('Exported Weekly Shift Schedule to Excel')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-muted text-foreground transition"
            >
              Export Roster
            </button>
            <button
              onClick={handleSaveRoster}
              disabled={!hasChanges}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition shadow-xs',
                hasChanges
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              )}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        }
      />

      {/* Shift Legend */}
      <div className="p-3.5 rounded-xl border border-border bg-card flex flex-wrap items-center gap-3 text-xs">
        <span className="font-semibold text-muted-foreground">Legend:</span>
        {SHIFT_TYPES.map((st) => (
          <div key={st.code} className="flex items-center gap-1.5">
            <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-bold border', st.color)}>
              {st.code}
            </span>
            <span className="text-muted-foreground">{st.name} ({st.time})</span>
          </div>
        ))}
      </div>

      {/* Roster Grid Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3 w-56">Team Member</th>
              {DAYS.map((day, i) => (
                <th key={i} className="p-3 text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {team.map((emp) => {
              const shifts = rosterGrid[emp.id] || ['GEN', 'GEN', 'GEN', 'GEN', 'GEN', 'WO', 'WO']
              return (
                <tr key={emp.id} className="hover:bg-muted/20">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{emp.name}</p>
                        <span className="text-[10px] text-muted-foreground truncate block">{emp.designation}</span>
                      </div>
                    </div>
                  </td>
                  {shifts.map((code, dayIdx) => {
                    const shiftDef = SHIFT_TYPES.find((s) => s.code === code) || SHIFT_TYPES[0]
                    return (
                      <td key={dayIdx} className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleCycleShift(emp.id, dayIdx)}
                          className={cn(
                            'w-full py-1.5 rounded-lg border text-xs font-bold transition hover:scale-105',
                            shiftDef.color
                          )}
                          title={`${shiftDef.name} (${shiftDef.time}) - Click to cycle shift`}
                        >
                          {code}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
