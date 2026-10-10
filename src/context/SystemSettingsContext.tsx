import React, { createContext, useContext, useState, useMemo } from 'react'
import { AuditLogService, type AuditLogEntry } from '@/services/auditLogService'

// 1. PRIVACY & CONSENT
export interface EmployeeConsentRecord {
  employeeId: string
  employeeName: string
  department: string
  branch: string
  faceBiometricConsent: boolean
  faceConsentTimestamp?: string
  gpsTrackingConsent: boolean
  gpsConsentTimestamp?: string
  kycStorageConsent: boolean
  consentStatus: 'Full Consent' | 'Partial' | 'Consent Withdrawn'
}

export interface ConsentWithdrawalRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  consentType: 'Facial Biometric Template' | 'GPS Location Tracking' | 'Aadhaar / National ID Storage'
  requestedAt: string
  reason: string
  status: 'Pending HR Review' | 'Approved & Data Purged' | 'Rejected'
  reviewNote?: string
}

// 2. DATA RETENTION
export interface DataRetentionPolicyItem {
  id: string
  categoryName: string
  dataDescription: string
  retentionPeriodDays: number
  retentionDisplay: string
  statutoryBasis: string
  autoPurgeEnabled: boolean
  recordsSubjectToPurge: number
  lastPurgeDate: string
}

// 3. INTEGRATIONS & WEBHOOKS
export interface IntegrationConnectorItem {
  id: string
  name: string
  category: 'Accounting & ERP' | 'Enterprise Suite' | 'Biometric Hardware Gateway' | 'Collaboration'
  description: string
  status: 'Connected' | 'Configured' | 'Available'
  syncFrequency: string
  lastSyncTimestamp?: string
  authType: 'OAuth 2.0' | 'API Key' | 'Direct TCP Socket' | 'Webhook'
  activeSyncItemsCount: number
}

export interface WebhookEndpointItem {
  id: string
  name: string
  targetUrl: string
  subscribedEvents: string[]
  secretKey: string
  isActive: boolean
  lastDeliveryStatus: '200 OK' | '500 Error' | 'Pending'
  lastDeliveryTimestamp?: string
}

// 4. BILLING & PLAN CEILINGS
export interface BillingPlanDetails {
  planTier: 'Enterprise Pro Suite'
  licenseModel: 'Per Active Employee / Month'
  totalLicensesPurchased: number
  activeEnrolledEmployees: number
  annualRenewalDate: string
  billingCycle: 'Annual Contract (Net 30)'
  accountManager: string
  supportSla: '24/7 Dedicated Enterprise Support (< 1 Hour Response)'
  purchasedModules: {
    featureCode: string
    moduleName: string
    isPurchased: boolean
    seatCeiling: number
    activeUsedSeats: number
  }[]
}

interface SystemSettingsContextType {
  // Audit Log
  auditLogs: AuditLogEntry[]
  refreshAuditLogs: () => void
  selectedAuditLog: AuditLogEntry | null
  setSelectedAuditLog: (log: AuditLogEntry | null) => void

  // Privacy & Consent
  consentRecords: EmployeeConsentRecord[]
  withdrawalRequests: ConsentWithdrawalRequest[]
  approveWithdrawalRequest: (id: string, reviewNote: string) => void
  rejectWithdrawalRequest: (id: string, reviewNote: string) => void

  // Data Retention
  retentionPolicies: DataRetentionPolicyItem[]
  updateRetentionPolicy: (id: string, newDays: number, autoPurge: boolean) => void
  triggerManualDataPurge: (id: string) => void

  // Integrations & Webhooks
  integrations: IntegrationConnectorItem[]
  webhooks: WebhookEndpointItem[]
  toggleIntegration: (id: string) => void
  createWebhook: (wh: Omit<WebhookEndpointItem, 'id' | 'lastDeliveryStatus'>) => void
  testWebhookPing: (id: string) => void

  // Billing
  billingPlan: BillingPlanDetails
}

const SystemSettingsContext = createContext<SystemSettingsContextType | undefined>(undefined)

const INITIAL_CONSENT_RECORDS: EmployeeConsentRecord[] = [
  {
    employeeId: 'EMP-104',
    employeeName: 'Priya Sharma',
    department: 'Field Sales',
    branch: 'Bengaluru HQ',
    faceBiometricConsent: true,
    faceConsentTimestamp: '2026-08-01 10:00 AM',
    gpsTrackingConsent: true,
    gpsConsentTimestamp: '2026-08-01 10:00 AM',
    kycStorageConsent: true,
    consentStatus: 'Full Consent',
  },
  {
    employeeId: 'EMP-112',
    employeeName: 'Deepak Patel',
    department: 'Manufacturing',
    branch: 'Pune Plant',
    faceBiometricConsent: true,
    faceConsentTimestamp: '2026-08-05 09:15 AM',
    gpsTrackingConsent: false,
    kycStorageConsent: true,
    consentStatus: 'Partial',
  },
  {
    employeeId: 'EMP-115',
    employeeName: 'Rohan Mehta',
    department: 'Engineering',
    branch: 'Mumbai Tech Park',
    faceBiometricConsent: true,
    faceConsentTimestamp: '2026-08-02 11:30 AM',
    gpsTrackingConsent: true,
    gpsConsentTimestamp: '2026-08-02 11:30 AM',
    kycStorageConsent: true,
    consentStatus: 'Full Consent',
  },
  {
    employeeId: 'EMP-120',
    employeeName: 'Ananya Deshpande',
    department: 'Operations',
    branch: 'Bengaluru HQ',
    faceBiometricConsent: false,
    gpsTrackingConsent: false,
    kycStorageConsent: true,
    consentStatus: 'Consent Withdrawn',
  },
]

const INITIAL_WITHDRAWAL_REQUESTS: ConsentWithdrawalRequest[] = [
  {
    id: 'CWR-01',
    employeeId: 'EMP-120',
    employeeName: 'Ananya Deshpande',
    department: 'Operations',
    consentType: 'Facial Biometric Template',
    requestedAt: '2026-10-04 14:20 PM',
    reason: 'Preference for physical RFID badge punch instead of facial biometric verification.',
    status: 'Pending HR Review',
  },
  {
    id: 'CWR-02',
    employeeId: 'EMP-112',
    employeeName: 'Deepak Patel',
    department: 'Manufacturing',
    consentType: 'GPS Location Tracking',
    requestedAt: '2026-09-28 11:00 AM',
    reason: 'Stationary plant factory shift role; requested disabling background GPS polling.',
    status: 'Approved & Data Purged',
    reviewNote: 'Role verified as stationary factory floor. GPS logging disabled & historical breadcrumbs purged.',
  },
]

const INITIAL_RETENTION_POLICIES: DataRetentionPolicyItem[] = [
  {
    id: 'RET-01',
    categoryName: 'Facial Biometric Selfies & Capture Frames',
    dataDescription: 'AI face verification raw selfie images captured during clock-in.',
    retentionPeriodDays: 90,
    retentionDisplay: '90 Days',
    statutoryBasis: 'Indian Digital Personal Data Protection (DPDP) Act 2023 Guidelines',
    autoPurgeEnabled: true,
    recordsSubjectToPurge: 1840,
    lastPurgeDate: 'Oct 01, 2026',
  },
  {
    id: 'RET-02',
    categoryName: 'GPS Location Breadcrumbs & Check-in Coordinates',
    dataDescription: 'Field sales visit route coordinates and geo-fence audit timestamps.',
    retentionPeriodDays: 180,
    retentionDisplay: '180 Days (6 Months)',
    statutoryBasis: 'Corporate Travel & Expense Audit Standard',
    autoPurgeEnabled: true,
    recordsSubjectToPurge: 3420,
    lastPurgeDate: 'Oct 01, 2026',
  },
  {
    id: 'RET-03',
    categoryName: 'Statutory Payroll, Tax & EPF/ESI Registers',
    dataDescription: 'Form 16, PF ECR challans, ESIC contributions, and payroll wage sheets.',
    retentionPeriodDays: 2920,
    retentionDisplay: '8 Years (2,920 Days)',
    statutoryBasis: 'Income Tax Act 1961 (Sec 44AA) & EPFO Mandatory 8-Year Audit Norms',
    autoPurgeEnabled: false,
    recordsSubjectToPurge: 0,
    lastPurgeDate: 'Never Purged (Statutory Hold)',
  },
  {
    id: 'RET-04',
    categoryName: 'Employee Exit, Full & Final and Clearance Records',
    dataDescription: 'Resignation acceptance letters, NOC clearances, and relieving certificates.',
    retentionPeriodDays: 2555,
    retentionDisplay: '7 Years',
    statutoryBasis: 'Industrial Disputes Act & Enterprise Governance Standard',
    autoPurgeEnabled: false,
    recordsSubjectToPurge: 0,
    lastPurgeDate: 'Never Purged (Statutory Hold)',
  },
]

const INITIAL_INTEGRATIONS: IntegrationConnectorItem[] = [
  {
    id: 'INT-TALLY',
    name: 'Tally Prime ERP Connector',
    category: 'Accounting & ERP',
    description: 'Direct XML ledger export for monthly salary journals, employee advances, and vendor reimbursements.',
    status: 'Connected',
    syncFrequency: 'On Payroll Finalization',
    lastSyncTimestamp: '2026-10-09 16:30 PM',
    authType: 'API Key',
    activeSyncItemsCount: 340,
  },
  {
    id: 'INT-SAP',
    name: 'SAP S/4HANA Finance Gateway',
    category: 'Enterprise Suite',
    description: 'Bi-directional integration for general ledger posting, cost center mapping, and headcount budgeting.',
    status: 'Connected',
    syncFrequency: 'Daily Nightly Sync',
    lastSyncTimestamp: 'Today, 02:00 AM',
    authType: 'OAuth 2.0',
    activeSyncItemsCount: 1420,
  },
  {
    id: 'INT-ESSL',
    name: 'eSSL & Matrix Biometric Gateways',
    category: 'Biometric Hardware Gateway',
    description: 'Hardware push-data listener capturing biometric fingerprint and face recognition punches from plant turnstiles.',
    status: 'Connected',
    syncFrequency: 'Real-time WebSocket Push',
    lastSyncTimestamp: 'Live (5s ago)',
    authType: 'Direct TCP Socket',
    activeSyncItemsCount: 8,
  },
  {
    id: 'INT-SLACK',
    name: 'Slack & Microsoft Teams Bot',
    category: 'Collaboration',
    description: 'Automated notification feeds for daily leave approvals, birthday wishes, and urgent HR broadcast announcements.',
    status: 'Available',
    syncFrequency: 'Event-driven',
    authType: 'OAuth 2.0',
    activeSyncItemsCount: 0,
  },
]

const INITIAL_WEBHOOKS: WebhookEndpointItem[] = [
  {
    id: 'WH-01',
    name: 'Corporate Slack #hr-approvals-feed',
    targetUrl: 'https://hooks.slack.com/services/T00/B00/X98218721',
    subscribedEvents: ['leave.created', 'expense.submitted', 'resignation.filed'],
    secretKey: 'whsec_981248a8b8c8d8e8f8g8',
    isActive: true,
    lastDeliveryStatus: '200 OK',
    lastDeliveryTimestamp: 'Today, 10:14 AM',
  },
  {
    id: 'WH-02',
    name: 'Internal Data Warehouse ETL Webhook',
    targetUrl: 'https://analytics-ingest.acme.corp/v1/hrms-events',
    subscribedEvents: ['attendance.punch', 'payroll.locked', 'policy.acknowledged'],
    secretKey: 'whsec_771239b9c9d9e9f9g9h9',
    isActive: true,
    lastDeliveryStatus: '200 OK',
    lastDeliveryTimestamp: 'Today, 08:30 AM',
  },
]

const INITIAL_BILLING_PLAN: BillingPlanDetails = {
  planTier: 'Enterprise Pro Suite',
  licenseModel: 'Per Active Employee / Month',
  totalLicensesPurchased: 500,
  activeEnrolledEmployees: 340,
  annualRenewalDate: 'April 01, 2027',
  billingCycle: 'Annual Contract (Net 30)',
  accountManager: 'Aditya Birla (Enterprise Customer Success Lead)',
  supportSla: '24/7 Dedicated Enterprise Support (< 1 Hour Response)',
  purchasedModules: [
    { featureCode: 'PUNCH', moduleName: 'Attendance & Biometrics Suite', isPurchased: true, seatCeiling: 500, activeUsedSeats: 340 },
    { featureCode: 'LEAVE', moduleName: 'Leave & Holiday Management', isPurchased: true, seatCeiling: 500, activeUsedSeats: 340 },
    { featureCode: 'PAYROLL', moduleName: 'Payroll & Statutory Tax Engine', isPurchased: true, seatCeiling: 500, activeUsedSeats: 340 },
    { featureCode: 'VISIT', moduleName: 'Field Sales Visits & Beats Tracking', isPurchased: true, seatCeiling: 200, activeUsedSeats: 85 },
    { featureCode: 'OVERTIME', moduleName: 'Overtime & Attendance Bonus Engine', isPurchased: true, seatCeiling: 300, activeUsedSeats: 160 },
    { featureCode: 'EXPENSE', moduleName: 'Expense Claims & Reimbursements', isPurchased: true, seatCeiling: 500, activeUsedSeats: 220 },
    { featureCode: 'FINANCE', moduleName: 'Salary Advances & Employee Loans', isPurchased: true, seatCeiling: 500, activeUsedSeats: 90 },
    { featureCode: 'RESIGNATION', moduleName: 'Lifecycle & Exit Settlement Center', isPurchased: true, seatCeiling: 500, activeUsedSeats: 340 },
    { featureCode: 'ASSET', moduleName: 'Enterprise Hardware Asset Management', isPurchased: true, seatCeiling: 500, activeUsedSeats: 280 },
    { featureCode: 'ATT_POLICY', moduleName: 'Compliance, Labour Laws & POSH Vault', isPurchased: true, seatCeiling: 500, activeUsedSeats: 340 },
    { featureCode: 'TEAM_REPORTS', moduleName: 'Advanced Custom Report Builder & Analytics', isPurchased: true, seatCeiling: 500, activeUsedSeats: 340 },
  ],
}

export const SystemSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(AuditLogService.getLogs())
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLogEntry | null>(null)

  const [consentRecords, setConsentRecords] = useState<EmployeeConsentRecord[]>(INITIAL_CONSENT_RECORDS)
  const [withdrawalRequests, setWithdrawalRequests] = useState<ConsentWithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS)
  const [retentionPolicies, setRetentionPolicies] = useState<DataRetentionPolicyItem[]>(INITIAL_RETENTION_POLICIES)
  const [integrations, setIntegrations] = useState<IntegrationConnectorItem[]>(INITIAL_INTEGRATIONS)
  const [webhooks, setWebhooks] = useState<WebhookEndpointItem[]>(INITIAL_WEBHOOKS)
  const [billingPlan] = useState<BillingPlanDetails>(INITIAL_BILLING_PLAN)

  const refreshAuditLogs = () => {
    setAuditLogs(AuditLogService.getLogs())
  }

  const approveWithdrawalRequest = (id: string, reviewNote: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        return {
          ...r,
          status: 'Approved & Data Purged',
          reviewNote,
        }
      })
    )

    // Also update consent record
    const req = withdrawalRequests.find((r) => r.id === id)
    if (req) {
      setConsentRecords((prev) =>
        prev.map((c) => {
          if (c.employeeId !== req.employeeId) return c
          return {
            ...c,
            faceBiometricConsent: req.consentType === 'Facial Biometric Template' ? false : c.faceBiometricConsent,
            gpsTrackingConsent: req.consentType === 'GPS Location Tracking' ? false : c.gpsTrackingConsent,
            consentStatus: 'Consent Withdrawn',
          }
        })
      )
    }

    AuditLogService.addLog({
      action: 'Consent Withdrawal Approved & Purged',
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      module: 'Security',
      targetType: 'Employee',
      targetId: req?.employeeId || id,
      targetName: `${req?.employeeName} (${req?.consentType})`,
      featureCode: 'ATT_POLICY',
      beforeValue: 'Consent Active',
      afterValue: 'Consent Withdrawn & Biometric Data Purged',
      beforeJson: { requestId: id, status: 'Pending HR Review' },
      afterJson: { requestId: id, status: 'Approved & Data Purged', note: reviewNote },
      reason: 'Employee formal GDPR/DPDP consent withdrawal compliance',
    })
    refreshAuditLogs()
  }

  const rejectWithdrawalRequest = (id: string, reviewNote: string) => {
    setWithdrawalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected', reviewNote } : r))
    )
  }

  const updateRetentionPolicy = (id: string, newDays: number, autoPurge: boolean) => {
    setRetentionPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          retentionPeriodDays: newDays,
          retentionDisplay: `${newDays} Days`,
          autoPurgeEnabled: autoPurge,
        }
      })
    )
  }

  const triggerManualDataPurge = (id: string) => {
    const policy = retentionPolicies.find((p) => p.id === id)
    setRetentionPolicies((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        return {
          ...p,
          recordsSubjectToPurge: 0,
          lastPurgeDate: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (Manual Executed)`,
        }
      })
    )

    AuditLogService.addLog({
      action: 'Data Retention Purge Triggered',
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      module: 'Security',
      targetType: 'Policy',
      targetId: id,
      targetName: policy?.categoryName || 'Data Category',
      featureCode: 'ATT_POLICY',
      beforeValue: `${policy?.recordsSubjectToPurge} records exceeding retention`,
      afterValue: '0 records (Purged permanently)',
      beforeJson: { category: policy?.categoryName, purgeThresholdDays: policy?.retentionPeriodDays },
      afterJson: { purgedRecords: policy?.recordsSubjectToPurge, timestamp: new Date().toISOString() },
      reason: 'Statutory DPDP data retention schedule automated purge execution',
    })
    refreshAuditLogs()
  }

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i
        const newStatus: IntegrationConnectorItem['status'] =
          i.status === 'Connected' ? 'Configured' : 'Connected'
        return { ...i, status: newStatus }
      })
    )
  }

  const createWebhook = (wh: Omit<WebhookEndpointItem, 'id' | 'lastDeliveryStatus'>) => {
    const newWh: WebhookEndpointItem = {
      ...wh,
      id: `WH-${String(webhooks.length + 1).padStart(2, '0')}`,
      lastDeliveryStatus: '200 OK',
      lastDeliveryTimestamp: 'Just now',
    }
    setWebhooks((prev) => [newWh, ...prev])
  }

  const testWebhookPing = (id: string) => {
    setWebhooks((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w
        return { ...w, lastDeliveryStatus: '200 OK', lastDeliveryTimestamp: new Date().toLocaleTimeString() }
      })
    )
  }

  return (
    <SystemSettingsContext.Provider
      value={{
        auditLogs,
        refreshAuditLogs,
        selectedAuditLog,
        setSelectedAuditLog,
        consentRecords,
        withdrawalRequests,
        approveWithdrawalRequest,
        rejectWithdrawalRequest,
        retentionPolicies,
        updateRetentionPolicy,
        triggerManualDataPurge,
        integrations,
        webhooks,
        toggleIntegration,
        createWebhook,
        testWebhookPing,
        billingPlan,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  )
}

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext)
  if (!context) {
    throw new Error('useSystemSettings must be used within a SystemSettingsProvider')
  }
  return context
}
