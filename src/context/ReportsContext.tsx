import React, { createContext, useContext, useState, useMemo } from 'react'
import { AuditLogService } from '@/services/auditLogService'

export interface ReportDefinition {
  id: string
  code: string
  name: string
  category: 'Attendance & Shifts' | 'Leaves & Time-Off' | 'Compensation & Payroll' | 'Reimbursements & Finance' | 'Field Operations' | 'Workforce & Demographics'
  description: string
  frequency: 'Real-time' | 'Daily' | 'Monthly' | 'Quarterly' | 'On-Demand'
  availableColumns: string[]
  icon: string
  isStatutory: boolean
  lastGenerated: string
}

export interface ScheduledReportItem {
  id: string
  reportId: string
  reportName: string
  frequency: 'Daily' | 'Weekly' | 'Monthly'
  cronSummary: string
  recipients: string[]
  format: 'Excel (.xlsx)' | 'CSV (.csv)' | 'PDF (.pdf)'
  lastRunStatus: 'Success' | 'Failed' | 'Running'
  nextRunDate: string
  isActive: boolean
}

export interface ExportHistoryLog {
  id: string
  reportName: string
  exportFormat: 'Excel (.xlsx)' | 'CSV (.csv)' | 'PDF (.pdf)'
  rowCount: number
  fileSize: string
  exportedBy: string
  actorRole: string
  timestamp: string
  complianceNoticeAcknowledged: boolean
  downloadUrl: string
}

export interface CustomReportConfig {
  reportTitle: string
  baseReportId: string
  selectedColumns: string[]
  filterBranch: string
  filterDepartment: string
  filterDateRange: string
  filterStatus: string
  groupByField: string
  chartType: 'bar' | 'line' | 'pie' | 'table'
}

interface ReportsContextType {
  reports: ReportDefinition[]
  scheduledReports: ScheduledReportItem[]
  exportLogs: ExportHistoryLog[]
  selectedReportId: string
  setSelectedReportId: (id: string) => void
  activeReport: ReportDefinition | null
  // Report Builder
  builderConfig: CustomReportConfig
  setBuilderConfig: React.Dispatch<React.SetStateAction<CustomReportConfig>>
  // Actions
  triggerReportExport: (reportName: string, format: 'Excel (.xlsx)' | 'CSV (.csv)' | 'PDF (.pdf)', rowCount?: number) => void
  addScheduledReport: (scheduled: Omit<ScheduledReportItem, 'id' | 'lastRunStatus'>) => void
  toggleScheduledReport: (id: string) => void
  deleteScheduledReport: (id: string) => void
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined)

const INITIAL_REPORTS: ReportDefinition[] = [
  {
    id: 'REP-01',
    code: 'ATT-REG-01',
    name: 'Monthly Attendance Register',
    category: 'Attendance & Shifts',
    description: 'Day-wise presence grid (P/A/HD/L/WO/H) across all branches with punch-in/out timestamps and work duration.',
    frequency: 'Daily',
    availableColumns: ['Employee ID', 'Employee Name', 'Branch', 'Department', 'Present Days', 'Absent Days', 'LOP Days', 'Half Days', 'Weekly Offs', 'Total Hours'],
    icon: 'Calendar',
    isStatutory: true,
    lastGenerated: 'Today, 06:00 AM',
  },
  {
    id: 'REP-02',
    code: 'MUSTER-ROLL-02',
    name: 'Statutory Muster Roll (Form 25 / Rule 103)',
    category: 'Attendance & Shifts',
    description: 'Indian Factories Act and Shops & Establishments Act compliant Form 25 muster roll with overtime register and adult worker markings.',
    frequency: 'Monthly',
    availableColumns: ['Serial No', 'Employee Name', 'Father/Spouse Name', 'Designation', 'Sex', 'Nature of Work', 'Shift Group', '1-31 Day Punches', 'Total Days', 'OT Hours'],
    icon: 'FileText',
    isStatutory: true,
    lastGenerated: 'Oct 01, 2026',
  },
  {
    id: 'REP-03',
    code: 'LATE-EARLY-03',
    name: 'Late In & Early Out Exception Log',
    category: 'Attendance & Shifts',
    description: 'Chronological summary of grace exceedances, repeated late marks, and policy half-day deduction triggers.',
    frequency: 'Daily',
    availableColumns: ['Date', 'Employee ID', 'Employee Name', 'Shift Start', 'Actual Punch In', 'Late Minutes', 'Grace Consumed', 'Half-Day Triggered', 'Manager Regularized'],
    icon: 'Clock',
    isStatutory: false,
    lastGenerated: 'Today, 08:30 AM',
  },
  {
    id: 'REP-04',
    code: 'LEAVE-BAL-04',
    name: 'Leave Balance & Lapsation Ledger',
    category: 'Leaves & Time-Off',
    description: 'Employee-wise leave quota ledger for Casual Leave (CL), Sick Leave (SL), Earned Leave (EL), and Comp-Off with carry-forward forecasts.',
    frequency: 'Monthly',
    availableColumns: ['Employee ID', 'Employee Name', 'Leave Type', 'Opening Balance', 'Accrued', 'Availed', 'Encashed', 'Closing Balance', 'Lapsing by Dec 31'],
    icon: 'CalendarCheck',
    isStatutory: false,
    lastGenerated: 'Oct 08, 2026',
  },
  {
    id: 'REP-05',
    code: 'OT-COMP-05',
    name: 'Overtime & Night Shift Allowance Summary',
    category: 'Compensation & Payroll',
    description: 'Plant and logistics overtime hours with 1.5x / 2.0x statutory rate multipliers and payout vs comp-off credit audit.',
    frequency: 'Monthly',
    availableColumns: ['Employee ID', 'Employee Name', 'Grade', 'Shift Type', 'Approved OT Hours', 'Rate Multiplier', 'Calculated OT Pay (₹)', 'Comp-off Granted', 'Supervisor Signoff'],
    icon: 'ClockAlert',
    isStatutory: true,
    lastGenerated: 'Oct 09, 2026',
  },
  {
    id: 'REP-06',
    code: 'EXP-CLAIM-06',
    name: 'Expense Reimbursements & Travel Claims',
    category: 'Reimbursements & Finance',
    description: 'Category-wise travel, food, per-diem, and client mileage expense claims with receipt attachment audit status.',
    frequency: 'Real-time',
    availableColumns: ['Claim ID', 'Employee Name', 'Category', 'Claim Date', 'Amount Claimed (₹)', 'Approved Amount (₹)', 'Receipt Verified', 'Settlement Batch', 'Status'],
    icon: 'Receipt',
    isStatutory: false,
    lastGenerated: 'Today, 10:15 AM',
  },
  {
    id: 'REP-07',
    code: 'VISIT-BEAT-07',
    name: 'Field Sales Visits & Geo-Distance Summary',
    category: 'Field Operations',
    description: 'Client visit verification with geo-fence inside/outside check-in coordinates, distance traveled (km), and order outcomes.',
    frequency: 'Daily',
    availableColumns: ['Date', 'Sales Officer', 'Client Name', 'Planned vs Unplanned', 'Check-in Time', 'Inside Fence (Y/N)', 'Distance (km)', 'Meeting Outcome', 'Follow-up Date'],
    icon: 'Navigation',
    isStatutory: false,
    lastGenerated: 'Yesterday, 07:00 PM',
  },
  {
    id: 'REP-08',
    code: 'PAY-REG-08',
    name: 'Master Payroll Register & Payout Summary',
    category: 'Compensation & Payroll',
    description: 'Comprehensive salary disbursement register with Basic, HRA, Special Allowance, PF, ESI, PT, TDS deductions, and Net Take-Home.',
    frequency: 'Monthly',
    availableColumns: ['Emp ID', 'Name', 'Gross CTC', 'Basic', 'HRA', 'Special Allowance', 'Gross Pay', 'EPF (12%)', 'ESIC (0.75%)', 'PT', 'TDS', 'Total Deductions', 'Net Pay', 'Bank A/c'],
    icon: 'Banknote',
    isStatutory: true,
    lastGenerated: 'Oct 09, 2026',
  },
  {
    id: 'REP-09',
    code: 'STAT-EPF-ESI-09',
    name: 'Statutory PF, ESI & Professional Tax Summary',
    category: 'Compensation & Payroll',
    description: 'EPFO ECR electronic challan return preview, ESIC monthly return data, and state-wise Professional Tax Form 5A filings.',
    frequency: 'Monthly',
    availableColumns: ['UAN Number', 'Member Name', 'Gross Wages', 'EPF Wages', 'EE Share (12%)', 'ER Share (3.67%)', 'EPS (8.33%)', 'IP Number', 'ESIC Gross', 'ESI EE', 'ESI ER', 'PT State', 'PT Amount'],
    icon: 'ShieldCheck',
    isStatutory: true,
    lastGenerated: 'Oct 09, 2026',
  },
  {
    id: 'REP-10',
    code: 'HEADCOUNT-10',
    name: 'Workforce Headcount & Diversity Matrix',
    category: 'Workforce & Demographics',
    description: 'Active employee distributions broken down by branch, business entity, department, grade level, and gender ratio.',
    frequency: 'Monthly',
    availableColumns: ['Entity', 'Branch', 'Department', 'Designation Grade', 'Total Headcount', 'Male Count', 'Female Count', 'Gender Ratio', 'Avg Tenure (Years)', 'Avg Age'],
    icon: 'Users',
    isStatutory: false,
    lastGenerated: 'Oct 05, 2026',
  },
  {
    id: 'REP-11',
    code: 'ATTRITION-11',
    name: 'Attrition & Turnover Analytics',
    category: 'Workforce & Demographics',
    description: 'Monthly and annual turnover rates, voluntary vs involuntary exits, tenure at departure, and exit interview primary reasons.',
    frequency: 'Quarterly',
    availableColumns: ['Period', 'Starting Headcount', 'New Joiners', 'Resignations', 'Terminations', 'Ending Headcount', 'Annualized Attrition %', 'Top Exit Reason', 'Regrettable Exits'],
    icon: 'TrendingUp',
    isStatutory: false,
    lastGenerated: 'Oct 01, 2026',
  },
]

const INITIAL_SCHEDULED: ScheduledReportItem[] = [
  {
    id: 'SCH-01',
    reportId: 'REP-01',
    reportName: 'Daily Morning Attendance Register',
    frequency: 'Daily',
    cronSummary: 'Every working day at 09:30 AM',
    recipients: ['hr-operations@acme.corp', 'plant-managers@acme.corp'],
    format: 'Excel (.xlsx)',
    lastRunStatus: 'Success',
    nextRunDate: 'Tomorrow, 09:30 AM',
    isActive: true,
  },
  {
    id: 'SCH-02',
    reportId: 'REP-08',
    reportName: 'Monthly Payroll Register for Finance',
    frequency: 'Monthly',
    cronSummary: 'Last day of every month at 06:00 PM',
    recipients: ['cfo-office@acme.corp', 'payroll-audit@acme.corp'],
    format: 'Excel (.xlsx)',
    lastRunStatus: 'Success',
    nextRunDate: 'Oct 31, 2026 06:00 PM',
    isActive: true,
  },
  {
    id: 'SCH-03',
    reportId: 'REP-09',
    reportName: 'EPFO & ESIC Challan Pre-Filing Audit',
    frequency: 'Monthly',
    cronSummary: '10th of every month at 10:00 AM',
    recipients: ['compliance-lead@acme.corp', 'legal-advisor@ca-firm.com'],
    format: 'CSV (.csv)',
    lastRunStatus: 'Success',
    nextRunDate: 'Nov 10, 2026 10:00 AM',
    isActive: true,
  },
]

const INITIAL_EXPORT_LOGS: ExportHistoryLog[] = [
  {
    id: 'EXP-1092',
    reportName: 'Monthly Master Payroll Register (September 2026)',
    exportFormat: 'Excel (.xlsx)',
    rowCount: 340,
    fileSize: '1.8 MB',
    exportedBy: 'Sarah Jenkins',
    actorRole: 'HR Admin',
    timestamp: '2026-10-09 16:25:10',
    complianceNoticeAcknowledged: true,
    downloadUrl: '#',
  },
  {
    id: 'EXP-1091',
    reportName: 'PF & ESI Statutory Challan Summary (Q2 FY 2026-27)',
    exportFormat: 'Excel (.xlsx)',
    rowCount: 340,
    fileSize: '1.4 MB',
    exportedBy: 'Sarah Jenkins',
    actorRole: 'HR Admin',
    timestamp: '2026-10-09 11:15:30',
    complianceNoticeAcknowledged: true,
    downloadUrl: '#',
  },
  {
    id: 'EXP-1090',
    reportName: 'Field Sales Visits & Beat Summary Report',
    exportFormat: 'CSV (.csv)',
    rowCount: 128,
    fileSize: '420 KB',
    exportedBy: 'Vikram Malhotra',
    actorRole: 'VP of HR',
    timestamp: '2026-10-08 18:00:22',
    complianceNoticeAcknowledged: true,
    downloadUrl: '#',
  },
]

export const ReportsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reports] = useState<ReportDefinition[]>(INITIAL_REPORTS)
  const [selectedReportId, setSelectedReportId] = useState<string>(INITIAL_REPORTS[0].id)
  const [scheduledReports, setScheduledReports] = useState<ScheduledReportItem[]>(INITIAL_SCHEDULED)
  const [exportLogs, setExportLogs] = useState<ExportHistoryLog[]>(INITIAL_EXPORT_LOGS)

  // Report Builder State
  const [builderConfig, setBuilderConfig] = useState<CustomReportConfig>({
    reportTitle: 'Custom Workforce & Compensation Cross-Analysis',
    baseReportId: 'REP-08',
    selectedColumns: ['Employee ID', 'Employee Name', 'Department', 'Branch', 'Gross Pay', 'Total Deductions', 'Net Pay'],
    filterBranch: 'All',
    filterDepartment: 'All',
    filterDateRange: 'Current Month (October 2026)',
    filterStatus: 'Active',
    groupByField: 'Department',
    chartType: 'bar',
  })

  const activeReport = useMemo(() => {
    return reports.find((r) => r.id === selectedReportId) || reports[0]
  }, [reports, selectedReportId])

  // Trigger export simulation
  const triggerReportExport = (
    reportName: string,
    format: 'Excel (.xlsx)' | 'CSV (.csv)' | 'PDF (.pdf)',
    rowCount: number = 340
  ) => {
    const newLog: ExportHistoryLog = {
      id: `EXP-${Date.now().toString().slice(-4)}`,
      reportName,
      exportFormat: format,
      rowCount,
      fileSize: format === 'PDF (.pdf)' ? '2.4 MB' : format === 'Excel (.xlsx)' ? '1.6 MB' : '520 KB',
      exportedBy: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      timestamp: new Date().toLocaleString(),
      complianceNoticeAcknowledged: true,
      downloadUrl: '#',
    }

    setExportLogs((prev) => [newLog, ...prev])

    // Log to audit log service with diff
    AuditLogService.addLog({
      action: 'Report Data Exported',
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      module: 'Export',
      targetType: 'Policy',
      targetId: newLog.id,
      targetName: `${reportName} (${format})`,
      featureCode: 'TEAM_REPORTS',
      beforeValue: 'Database Records',
      afterValue: `Exported ${rowCount} rows (${newLog.fileSize})`,
      beforeJson: { report: reportName, format, exportedBy: 'Sarah Jenkins' },
      afterJson: { logId: newLog.id, rowCount, timestamp: newLog.timestamp },
      reason: 'Exported under authorized data governance policy with ExportNotice compliance',
    })

    // Simulate file download
    const blob = new Blob([`SIMULATED REPORT DATA FOR: ${reportName}\nEXPORTED AT: ${new Date().toISOString()}\nROWS: ${rowCount}\nFORMAT: ${format}`], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${format.includes('csv') ? 'csv' : format.includes('pdf') ? 'pdf' : 'xlsx'}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const addScheduledReport = (scheduled: Omit<ScheduledReportItem, 'id' | 'lastRunStatus'>) => {
    const newSch: ScheduledReportItem = {
      ...scheduled,
      id: `SCH-${String(scheduledReports.length + 1).padStart(2, '0')}`,
      lastRunStatus: 'Success',
    }
    setScheduledReports((prev) => [newSch, ...prev])
  }

  const toggleScheduledReport = (id: string) => {
    setScheduledReports((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    )
  }

  const deleteScheduledReport = (id: string) => {
    setScheduledReports((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <ReportsContext.Provider
      value={{
        reports,
        scheduledReports,
        exportLogs,
        selectedReportId,
        setSelectedReportId,
        activeReport,
        builderConfig,
        setBuilderConfig,
        triggerReportExport,
        addScheduledReport,
        toggleScheduledReport,
        deleteScheduledReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  )
}

export const useReports = () => {
  const context = useContext(ReportsContext)
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider')
  }
  return context
}
