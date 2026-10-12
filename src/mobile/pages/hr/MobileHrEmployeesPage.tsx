import React, { useState, useMemo } from 'react'
import {
  Search,
  Users,
  Building,
  UserCheck,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight,
  Clock,
  Sparkles,
  Sliders,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useEmployees, type ExtendedEmployee } from '@/context/EmployeeContext'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { AuditLogService } from '@/services/auditLogService'
import { Can } from '@/components/common/Can'

export const MobileHrEmployeesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'All'

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus)
  const [selectedEmployee, setSelectedEmployee] = useState<ExtendedEmployee | null>(null)
  const [isSalaryRevealed, setIsSalaryRevealed] = useState(false)

  const { employees, confirmProbation } = useEmployees()
  const { can } = useAccess()
  const { settings } = useDemo()
  const { showToast } = useToast()

  const isBranchHr = settings.role === 'Branch HR'
  const activeBranch = settings.currentUser.branch || 'Mumbai Branch'

  // Can view sensitive compensation check
  const canViewSensitive =
    settings.role === 'HR Admin' || can('view-sensitive', 'PAYROLL')

  // Scoped employees
  const scopedEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (isBranchHr) {
        return e.branch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [employees, isBranchHr, activeBranch])

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return scopedEmployees.filter((emp) => {
      const matchSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false

      if (selectedStatus === 'All') return true
      return emp.status?.toLowerCase() === selectedStatus.toLowerCase()
    })
  }, [scopedEmployees, searchQuery, selectedStatus])

  // Open 360 BottomSheet
  const handleOpenEmployee = (emp: ExtendedEmployee) => {
    setSelectedEmployee(emp)
    setIsSalaryRevealed(false)
  }

  // Reveal Salary
  const handleRevealSalary = () => {
    if (!canViewSensitive) {
      showToast({
        type: 'error',
        title: 'Access Restricted',
        message: 'You lack view-sensitive permission to inspect compensation figures.',
      })
      return
    }

    setIsSalaryRevealed(true)

    if (selectedEmployee) {
      AuditLogService.addLog({
        actorName: settings.currentUser.name,
        actorRole: settings.role,
        action: 'Sensitive Salary Figure Revealed',
        module: 'Security',
        targetType: 'Employee',
        targetId: selectedEmployee.id,
        targetName: selectedEmployee.name,
        featureCode: 'PAYROLL',
        beforeValue: 'Masked (••••••)',
        afterValue: `Revealed (${selectedEmployee.basicSalary || '₹95,000'} Base)`,
        reason: 'HR Mobile 360 Employee compensation lookup',
      })

      showToast({
        type: 'info',
        title: 'Sensitive Access Logged',
        message: 'Salary lookup recorded in enterprise audit trail.',
      })
    }
  }

  // Confirm Probation
  const handleConfirmProbation = (empId: string) => {
    confirmProbation(empId, 'HR mobile confirmation signoff')
    showToast({
      type: 'success',
      title: 'Probation Confirmed',
      message: 'Employee has transitioned to Permanent Active status.',
    })
    if (selectedEmployee && selectedEmployee.id === empId) {
      setSelectedEmployee({ ...selectedEmployee, status: 'Active' })
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="Employee 360 Lookup"
        subtitle={isBranchHr ? `${activeBranch} Staff` : `${scopedEmployees.length} Total Workforce`}
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, employee code (EMP-001), team..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
          />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {['All', 'Active', 'Probation', 'On Notice'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition ${
                selectedStatus === st
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Employee Cards List */}
        <div className="space-y-2.5 flex-1">
          {filteredEmployees.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground">
                No employees matching current search or status filter.
              </p>
            </div>
          ) : (
            filteredEmployees.map((emp) => {
              const isProbation = emp.status === 'Probation'
              const isNotice = emp.status === 'On Notice'

              return (
                <div
                  key={emp.id}
                  onClick={() => handleOpenEmployee(emp)}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition hover:border-primary/40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={emp.avatar}
                      alt={emp.name}
                      className="w-11 h-11 rounded-full object-cover border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {emp.name}
                        </h4>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {emp.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {emp.designation} • {emp.department}
                      </p>
                      <p className="text-[10px] text-primary font-medium truncate mt-0.5">
                        {emp.branch}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isProbation
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : isNotice
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {emp.status || 'Active'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* COMPACT EMPLOYEE 360 BOTTOM SHEET */}
      <BottomSheet
        isOpen={Boolean(selectedEmployee)}
        onClose={() => setSelectedEmployee(null)}
        title="Employee 360 Profile"
      >
        {selectedEmployee && (
          <div className="space-y-4 pb-4">
            {/* Header Identity Card */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-primary/10 via-card to-card border border-primary/20 flex items-center gap-3">
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-foreground truncate">
                    {selectedEmployee.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/20 text-primary">
                    {selectedEmployee.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedEmployee.designation} • {selectedEmployee.id}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-foreground mt-1 font-medium">
                  <span>{selectedEmployee.department}</span>
                  <span>•</span>
                  <span>{selectedEmployee.branch}</span>
                </div>
              </div>
            </div>

            {/* Manager and Contact Row */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-card border border-border space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Reporting Manager
                </span>
                <p className="font-bold text-foreground truncate">
                  {selectedEmployee.reportingManagerName || 'Vikram Malhotra'}
                </p>
                <p className="text-[10px] text-muted-foreground">Head of Engineering</p>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                  Profile Category
                </span>
                <p className="font-bold text-foreground truncate">
                  {selectedEmployee.profileType || 'Office Staff'}
                </p>
                <p className="text-[10px] text-muted-foreground">Joined 15 Jan 2024</p>
              </div>
            </div>

            {/* Attendance & Leave Quick Snapshot */}
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Month-to-Date Performance
              </span>

              {/* Attendance Bar */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Attendance (Oct 2026):</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  21 Present • 1 Late • 0 Absent
                </span>
              </div>

              {/* Leave Balances */}
              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-border/60">
                <span className="text-muted-foreground">Leave Balances:</span>
                <span className="font-bold text-foreground">
                  Casual: 4/12 • Sick: 7/10 • Earned: 12/15
                </span>
              </div>
            </div>

            {/* SENSITIVE COMPENSATION SECTION */}
            <div className="p-3.5 rounded-2xl bg-card border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Compensation & CTC
                </span>

                {canViewSensitive && (
                  <button
                    type="button"
                    onClick={() => {
                      if (isSalaryRevealed) {
                        setIsSalaryRevealed(false)
                      } else {
                        handleRevealSalary()
                      }
                    }}
                    className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                  >
                    {isSalaryRevealed ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Reveal Figure</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {!canViewSensitive ? (
                /* Salary Hidden: No Permission */
                <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center gap-2.5 text-xs text-muted-foreground">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span>Salary hidden (Sensitive data policy restricts your role).</span>
                </div>
              ) : isSalaryRevealed ? (
                /* Salary Revealed with Audit Flag */
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">Monthly Base CTC:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {selectedEmployee.basicSalary || '₹1,25,000'} / month
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Annual Gross CTC:</span>
                    <span className="font-bold text-foreground">₹15,00,000 / annum</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-300 pt-1 border-t border-emerald-500/20">
                    🔒 Access logged in Audit Trail as required by DPDP / InfoSec.
                  </p>
                </div>
              ) : (
                /* Masked by Default */
                <div className="p-3 rounded-xl bg-card border border-dashed border-border flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Protected CTC:</span>
                  <span className="font-mono font-bold text-muted-foreground tracking-widest">
                    •••••••• / mo
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  navigate(`/hr/features?empId=${selectedEmployee.id}`)
                  setSelectedEmployee(null)
                }}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Sliders className="w-4 h-4" />
                <span>Feature Access Quick View & Overrides</span>
              </button>

              {selectedEmployee.status === 'Probation' && (
                <button
                  type="button"
                  onClick={() => handleConfirmProbation(selectedEmployee.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Probation Status (Mark Permanent)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
