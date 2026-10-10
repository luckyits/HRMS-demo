import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { AttendanceSubNav } from '@/components/attendance/AttendanceSubNav'
import {
  useAdminAttendance,
} from '@/context/AdminAttendanceContext'
import {
  ATTENDANCE_STATUS_MAP,
  type AttendanceStatusCode,
  type EmployeeMonthRow,
} from '@/mock/adminAttendance'
import {
  Lock,
  Unlock,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Info,
  Edit2,
  Save,
  X,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react'
import { ExportNotice } from '@/components/common/ExportNotice'

export const AttendanceRegisterPage: React.FC = () => {
  const {
    monthRegister,
    isMonthLocked,
    toggleMonthLock,
    updateRegisterCell,
  } = useAdminAttendance()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('All')
  const [selectedDept, setSelectedDept] = useState('All')

  // Edit Modal State
  const [editingCell, setEditingCell] = useState<{
    employee: EmployeeMonthRow
    day: number
    currentCode: AttendanceStatusCode
  } | null>(null)
  const [newCode, setNewCode] = useState<AttendanceStatusCode>('P')
  const [overrideReason, setOverrideReason] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Export state
  const [showExportModal, setShowExportModal] = useState(false)

  // Filters
  const filteredRows = monthRegister.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesBranch = selectedBranch === 'All' || row.branch === selectedBranch
    const matchesDept = selectedDept === 'All' || row.department === selectedDept
    return matchesSearch && matchesBranch && matchesDept
  })

  // Aggregate stats across month
  let totalP = 0
  let totalA = 0
  let totalHD = 0
  let totalL = 0
  let totalSlots = 0

  filteredRows.forEach((row) => {
    Object.values(row.days).forEach((code) => {
      totalSlots++
      if (code === 'P') totalP++
      if (code === 'A') totalA++
      if (code === 'HD') totalHD++
      if (code === 'L') totalL++
    })
  })

  const attendancePercent = totalSlots > 0 ? Math.round(((totalP + totalHD * 0.5) / (totalSlots - totalL)) * 100) : 0

  const handleOpenEdit = (employee: EmployeeMonthRow, day: number) => {
    if (isMonthLocked) return
    const currentCode = employee.days[day]
    setEditingCell({ employee, day, currentCode })
    setNewCode(currentCode)
    setOverrideReason('')
    setErrorMessage('')
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!overrideReason.trim()) {
      setErrorMessage('A mandatory reason is required for compliance audit logs.')
      return
    }
    if (!editingCell) return

    updateRegisterCell(editingCell.employee.employeeId, editingCell.day, newCode, overrideReason.trim())
    setEditingCell(null)
  }

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <AttendanceSubNav />

      <PageHeader
        title="Attendance Master Register"
        subtitle="Monthly matrix (Employees × 31 Days) with punch status codes, audit-tracked overrides, and payroll month lock"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Register</span>
            </button>

            <button
              onClick={toggleMonthLock}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                isMonthLocked
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isMonthLocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Unlock for Edits</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Lock Month for Payroll</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Month Lock Banner */}
      {isMonthLocked && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Attendance Register is Locked</h4>
              <p className="text-xs text-muted-foreground">
                October 2026 has been finalized for payroll processing. Manual cell overrides are disabled until an authorized administrator unlocks this period.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-md">
            Payroll Freeze Active
          </span>
        </div>
      )}

      {/* Quick Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border p-3 rounded-xl">
          <span className="text-[11px] text-muted-foreground font-medium uppercase">Active Staff</span>
          <div className="text-xl font-bold text-foreground mt-0.5">{filteredRows.length}</div>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl">
          <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Present Days</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{totalP}</div>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl">
          <span className="text-[11px] text-muted-foreground font-medium uppercase">Total Absent Days</span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{totalA}</div>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl">
          <span className="text-[11px] text-muted-foreground font-medium uppercase">Half Days</span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{totalHD}</div>
        </div>
        <div className="bg-card border border-border p-3 rounded-xl col-span-2 sm:col-span-1">
          <span className="text-[11px] text-muted-foreground font-medium uppercase">Overall Attendance</span>
          <div className="text-xl font-bold text-primary mt-0.5">{attendancePercent}%</div>
        </div>
      </div>

      {/* Filters & Legend */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employee or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="text-xs bg-muted/50 border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Branches</option>
            <option value="Bengaluru HQ">Bengaluru HQ</option>
            <option value="Mumbai Hub">Mumbai Hub</option>
            <option value="Pune Plant">Pune Plant</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs bg-muted/50 border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="People Operations">People Operations</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium mr-1 text-[11px]">Legend:</span>
          {Object.entries(ATTENDANCE_STATUS_MAP).map(([code, info]) => (
            <span
              key={code}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-bold ${info.bgColor} ${info.color} ${info.borderColor}`}
            >
              <span>{info.code}</span>
              <span className="font-normal opacity-80 text-[10px]">({info.label})</span>
            </span>
          ))}
        </div>
      </div>

      {/* 31-Day Month Matrix Grid Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[620px] scrollbar-thin">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 z-20 bg-muted/90 backdrop-blur-md border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="sticky left-0 z-30 bg-muted/95 p-3 min-w-[220px] border-r border-border shadow-sm">
                  Employee Details
                </th>
                {daysInMonth.map((day) => {
                  const dayOfWeek = (day + 3) % 7 // 0=Sun, 6=Sat
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                  return (
                    <th
                      key={day}
                      className={`p-1.5 text-center min-w-[34px] border-r border-border/50 ${
                        isWeekend ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-500' : ''
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayOfWeek]}
                      </div>
                      <div className="text-xs font-bold text-foreground">{day}</div>
                    </th>
                  )
                })}
                <th className="p-2 text-center min-w-[45px] bg-emerald-500/10 text-emerald-700 font-bold">P</th>
                <th className="p-2 text-center min-w-[45px] bg-rose-500/10 text-rose-700 font-bold">A</th>
                <th className="p-2 text-center min-w-[45px] bg-amber-500/10 text-amber-700 font-bold">HD</th>
                <th className="p-2 text-center min-w-[45px] bg-blue-500/10 text-blue-700 font-bold">L</th>
                <th className="p-2 text-center min-w-[55px] bg-primary/10 text-primary font-bold">Paid</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredRows.map((emp) => {
                // Calculate counts for this employee
                let pCount = 0
                let aCount = 0
                let hdCount = 0
                let lCount = 0
                let woCount = 0
                let hCount = 0

                Object.values(emp.days).forEach((c) => {
                  if (c === 'P') pCount++
                  if (c === 'A') aCount++
                  if (c === 'HD') hdCount++
                  if (c === 'L') lCount++
                  if (c === 'WO') woCount++
                  if (c === 'H') hCount++
                })

                const paidDays = pCount + hdCount * 0.5 + lCount + woCount + hCount

                return (
                  <tr key={emp.employeeId} className="hover:bg-muted/20 transition-colors">
                    {/* Fixed Employee Column */}
                    <td className="sticky left-0 z-10 bg-card p-3 border-r border-border flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{emp.name}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span className="font-mono">{emp.employeeId}</span> &bull; <span>{emp.branch}</span>
                        </div>
                      </div>
                    </td>

                    {/* 31 Days Cells */}
                    {daysInMonth.map((day) => {
                      const code = emp.days[day] || 'P'
                      const info = ATTENDANCE_STATUS_MAP[code]
                      const hasOverride = emp.overrideReasons && emp.overrideReasons[day]

                      return (
                        <td
                          key={day}
                          onClick={() => handleOpenEdit(emp, day)}
                          title={
                            hasOverride
                              ? `Override: ${hasOverride.reason} by ${hasOverride.updatedBy}`
                              : `Day ${day}: ${info.label}. Click to edit.`
                          }
                          className={`p-1 text-center border-r border-border/40 relative cursor-pointer select-none transition-transform hover:scale-110 hover:z-10 ${
                            isMonthLocked ? 'cursor-not-allowed opacity-90' : ''
                          }`}
                        >
                          <div
                            className={`w-7 h-7 mx-auto rounded flex items-center justify-center font-bold text-[11px] border ${info.bgColor} ${info.color} ${info.borderColor} shadow-xs relative`}
                          >
                            {code}
                            {hasOverride && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-1 ring-white" />
                            )}
                          </div>
                        </td>
                      )
                    })}

                    {/* Aggregate Summary Columns */}
                    <td className="p-2 text-center font-bold text-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20">
                      {pCount}
                    </td>
                    <td className="p-2 text-center font-bold text-rose-600 bg-rose-50/30 dark:bg-rose-950/20">
                      {aCount}
                    </td>
                    <td className="p-2 text-center font-bold text-amber-600 bg-amber-50/30 dark:bg-amber-950/20">
                      {hdCount}
                    </td>
                    <td className="p-2 text-center font-bold text-blue-600 bg-blue-50/30 dark:bg-blue-950/20">
                      {lCount}
                    </td>
                    <td className="p-2 text-center font-extrabold text-primary bg-primary/5">
                      {paidDays.toFixed(1)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cell Edit Override Modal */}
      {editingCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditingCell(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Edit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Manual Attendance Override</h3>
                <p className="text-xs text-muted-foreground">
                  {editingCell.employee.name} &bull; Day {editingCell.day} Oct 2026
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Select Attendance Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['P', 'A', 'HD', 'L', 'WO', 'H'] as AttendanceStatusCode[]).map((code) => {
                    const info = ATTENDANCE_STATUS_MAP[code]
                    const isSelected = newCode === code
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setNewCode(code)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'ring-2 ring-primary border-primary bg-primary/10 font-bold'
                            : 'border-border hover:bg-muted/50'
                        }`}
                      >
                        <span className={`text-sm font-extrabold ${info.color}`}>{code}</span>
                        <span className="text-[10px] text-muted-foreground">{info.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Reason for Override <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => {
                    setOverrideReason(e.target.value)
                    setErrorMessage('')
                  }}
                  placeholder="e.g. Employee had on-duty client presentation approved via email; missed card swipe."
                  className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {errorMessage && (
                  <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> {errorMessage}
                  </p>
                )}
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground space-y-1">
                <div className="flex items-center gap-1 text-foreground font-semibold">
                  <Info className="w-3.5 h-3.5 text-primary" /> Audit Trail Compliance
                </div>
                <p>
                  This manual modification will be signed by <strong>HR Admin</strong> and recorded in the immutable audit log for labor statutory verification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="px-4 py-2 text-xs font-medium border border-border rounded-xl hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Notice Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Export Attendance Register</span>
            </h4>
            <p className="text-xs text-muted-foreground mb-4">
              Generating Excel spreadsheet for October 2026 (31 Days) covering {filteredRows.length} active employee attendance records.
            </p>
            <ExportNotice className="mb-4" />
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs border border-border rounded-xl hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 shadow-sm"
              >
                Download XLSX
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
