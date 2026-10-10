export interface AuditLogEntry {
  id: string
  timestamp: string
  actorName: string
  actorRole: string
  action: string
  module?: 'Payroll' | 'Attendance' | 'Security' | 'Leaves' | 'Finance' | 'Lifecycle' | 'Compliance' | 'Export' | 'Permissions' | 'Reports' | 'System'
  targetType: 'Company' | 'Profile' | 'Employee' | 'Bulk Employee' | 'Attendance' | 'Policy' | 'Shift' | 'Punch'
  targetId: string    
  targetName: string
  featureCode: string
  beforeValue?: string
  afterValue?: string
  beforeJson?: Record<string, any>
  afterJson?: Record<string, any>
  reason: string
  notes?: string
  ipAddress?: string
}

const AUDIT_STORAGE_KEY = 'hrms_feature_audit_log'

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-108',
    timestamp: '2026-10-10 09:42:15',
    actorName: 'Sarah Jenkins',
    actorRole: 'HR Admin',
    action: 'Sensitive Salary Figure Revealed',
    module: 'Security',
    targetType: 'Employee',
    targetId: 'EMP-104',
    targetName: 'Priya Sharma (Salary Slip Access)',
    featureCode: 'PAYSLIP',
    beforeValue: 'Masked (••••••)',
    afterValue: 'Revealed (₹1,54,166 Gross)',
    beforeJson: { isMasked: true, accessedBy: 'Sarah Jenkins' },
    afterJson: { isMasked: false, grossSalary: 154166, netPay: 124500, unmaskedAt: '2026-10-10 09:42:15' },
    reason: 'Executive compensation benchmarking verification',
    ipAddress: '106.51.78.22',
  },
  {
    id: 'AUD-107',
    timestamp: '2026-10-09 16:20:00',
    actorName: 'Vikram Malhotra',
    actorRole: 'VP of HR',
    action: 'Payroll Cycle Approved & Locked',
    module: 'Payroll',
    targetType: 'Policy',
    targetId: 'PR-2026-09',
    targetName: 'September 2026 Payroll Run',
    featureCode: 'PAYROLL',
    beforeValue: 'Review & Variance',
    afterValue: 'Locked & Published',
    beforeJson: { cycle: '2026-09', status: 'Review & Variance', gross: 174500 },
    afterJson: { cycle: '2026-09', status: 'Locked & Published', totalNetPayout: 156754, lockedBy: 'Vikram Malhotra' },
    reason: 'Monthly payroll signoff and corporate NEFT batch disbursement authorized',
    ipAddress: '49.36.12.110',
  },
  {
    id: 'AUD-106',
    timestamp: '2026-10-09 11:15:30',
    actorName: 'Sarah Jenkins',
    actorRole: 'HR Admin',
    action: 'Compliance Report Exported',
    module: 'Export',
    targetType: 'Policy',
    targetId: 'REP-EXP-09',
    targetName: 'PF & ESI Statutory Challan Summary.xlsx',
    featureCode: 'ATT_POLICY',
    beforeValue: 'Database Records (340 Employees)',
    afterValue: 'Excel File Exported (340 Rows)',
    beforeJson: { exportType: 'Statutory Summary', records: 340 },
    afterJson: { exportFormat: 'Excel (.xlsx)', fileSize: '1.4 MB', downloaded: true },
    reason: 'Quarterly ESIC and EPFO inspection documentation preparation',
    ipAddress: '106.51.78.22',
  },
  {
    id: 'AUD-105',
    timestamp: '2026-10-08 14:30:12',
    actorName: 'Sarah Jenkins',
    actorRole: 'HR Admin',
    action: 'Employee Override Granted',
    module: 'Permissions',
    targetType: 'Employee',
    targetId: 'EMP-003',
    targetName: 'Aarav Patel',
    featureCode: 'VISIT',
    beforeValue: 'Inherit (Deny via Office Staff Profile)',
    afterValue: 'Allow (Valid for 14 days)',
    beforeJson: { effectiveAccess: 'DENY', profile: 'Office Staff' },
    afterJson: { effectiveAccess: 'ALLOW', overrideType: 'Temporary', expiresAt: '2026-10-22' },
    reason: 'Temporary onsite client sprint coordination in Pune',
    ipAddress: '106.51.78.22',
  },
  {
    id: 'AUD-104',
    timestamp: '2026-10-07 10:15:00',
    actorName: 'Sarah Jenkins',
    actorRole: 'HR Admin',
    action: 'Employee Override Denied (Locked)',
    module: 'Permissions',
    targetType: 'Employee',
    targetId: 'EMP-004',
    targetName: 'Devika Nair',
    featureCode: 'FINANCE',
    beforeValue: 'Allow (via Profile)',
    afterValue: 'Deny (Locked)',
    beforeJson: { effectiveAccess: 'ALLOW', profile: 'Regional Sales Manager' },
    afterJson: { effectiveAccess: 'DENY', lockReason: 'BGV Pending' },
    reason: 'Policy compliance hold during background verification period',
    ipAddress: '106.51.78.22',
  },
  {
    id: 'AUD-103',
    timestamp: '2026-10-05 09:00:22',
    actorName: 'Sarah Jenkins',
    actorRole: 'HR Admin',
    action: 'Company Policy Locked',
    module: 'Permissions',
    targetType: 'Company',
    targetId: 'COMP-002',
    targetName: 'Bharat Heavy Forge & Tooling Ltd',
    featureCode: 'OVERTIME',
    beforeValue: 'Allow (Unlocked)',
    afterValue: 'Allow (Locked)',
    beforeJson: { feature: 'OVERTIME', status: 'Configurable' },
    afterJson: { feature: 'OVERTIME', status: 'Locked Mandatorily' },
    reason: 'Statutory compliance: mandatory overtime logging for plant workers',
    ipAddress: '106.51.78.22',
  },
  {
    id: 'AUD-102',
    timestamp: '2026-10-04 15:45:10',
    actorName: 'Vikram Malhotra',
    actorRole: 'VP of HR',
    action: 'Leave Request Approved',
    module: 'Leaves',
    targetType: 'Employee',
    targetId: 'LV-900',
    targetName: 'Priya Sharma (Casual Leave)',
    featureCode: 'LEAVE',
    beforeValue: 'Pending Approval',
    afterValue: 'Approved',
    beforeJson: { requestId: 'LV-900', days: 1, type: 'Casual Leave (CL)', status: 'Pending' },
    afterJson: { requestId: 'LV-900', days: 1, type: 'Casual Leave (CL)', status: 'Approved', approvedBy: 'Vikram Malhotra' },
    reason: 'Approved for municipal appointment',
    ipAddress: '49.36.12.110',
  },
]

export const AuditLogService = {
  getLogs: (): AuditLogEntry[] => {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_AUDIT_LOGS
  },

  addLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry => {
    const list = AuditLogService.getLogs()
    const now = new Date()
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp,
      ipAddress: entry.ipAddress || '106.51.78.22',
    }
    const updated = [newEntry, ...list]
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated))
    return newEntry
  },

  clearLogs: () => {
    localStorage.removeItem(AUDIT_STORAGE_KEY)
  },
}
