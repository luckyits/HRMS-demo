import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useSystemSettings,
  type DataRetentionPolicyItem,
  type ConsentWithdrawalRequest,
} from '@/context/SystemSettingsContext'
import { type AuditLogEntry } from '@/services/auditLogService'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code,
  CreditCard,
  Database,
  ExternalLink,
  Eye,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  FileText,
  Filter,
  Flame,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Link as LinkIcon,
  Lock,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  User,
  UserCheck,
  Users,
  Zap,
} from 'lucide-react'

export const AdminSystemPage: React.FC = () => {
  const {
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
  } = useSystemSettings()

  // Tab State
  const [activeTab, setActiveTab] = useState<'audit' | 'privacy' | 'retention' | 'integrations' | 'billing'>('audit')

  // Audit Filter State
  const [auditSearch, setAuditSearch] = useState('')
  const [auditModuleFilter, setAuditModuleFilter] = useState('All')
  const [auditActorFilter, setAuditActorFilter] = useState('All')

  // Withdrawal Review Modal State
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<ConsentWithdrawalRequest | null>(null)
  const [reviewNoteInput, setReviewNoteInput] = useState('')

  // New Webhook Modal State
  const [isNewWebhookOpen, setIsNewWebhookOpen] = useState(false)
  const [whName, setWhName] = useState('')
  const [whUrl, setWhUrl] = useState('')
  const [whEvents, setWhEvents] = useState('leave.created, payroll.locked')

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.targetName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.reason.toLowerCase().includes(auditSearch.toLowerCase())
    const matchesModule = auditModuleFilter === 'All' || log.module === auditModuleFilter
    const matchesActor = auditActorFilter === 'All' || log.actorName === auditActorFilter
    return matchesSearch && matchesModule && matchesActor
  })

  // Unique Actors
  const uniqueActors = ['All', ...Array.from(new Set(auditLogs.map((l) => l.actorName)))]
  const uniqueModules = ['All', 'Payroll', 'Attendance', 'Security', 'Leaves', 'Finance', 'Lifecycle', 'Compliance', 'Export', 'Permissions']

  // Privacy metrics
  const totalEmployeesWithConsent = consentRecords.length
  const faceConsentCount = consentRecords.filter((c) => c.faceBiometricConsent).length
  const faceConsentPct = Math.round((faceConsentCount / totalEmployeesWithConsent) * 100)
  const gpsConsentCount = consentRecords.filter((c) => c.gpsTrackingConsent).length
  const gpsConsentPct = Math.round((gpsConsentCount / totalEmployeesWithConsent) * 100)
  const pendingWithdrawalsCount = withdrawalRequests.filter((w) => w.status === 'Pending HR Review').length

  // Handle Create Webhook
  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!whName || !whUrl) return
    createWebhook({
      name: whName,
      targetUrl: whUrl,
      subscribedEvents: whEvents.split(',').map((s) => s.trim()),
      secretKey: `whsec_${Math.random().toString(36).slice(2, 12)}`,
      isActive: true,
    })
    setIsNewWebhookOpen(false)
    setWhName('')
    setWhUrl('')
  }

  return (
    <FeatureGate feature="SETTINGS">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                <Settings className="w-3 h-3" />
                SYSTEM GOVERNANCE & SECURITY DESK
              </span>
              <span className="text-xs text-slate-500">Audit Trails, DPDP Privacy, Retention & Integrations</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              System Administration & Compliance Controls
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Inspect immutable audit records with JSON diff analysis, monitor employee biometric and GPS privacy consents, configure data retention life cycles, manage ERP connectors, and oversee enterprise license ceilings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshAuditLogs}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Logs
            </button>
            <Link
              to="/hr/features/catalogue"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Feature Catalogue
            </Link>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Audit Trail Entries</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{auditLogs.length} Events</div>
            <p className="text-xs text-slate-500 mt-1">Approvals, exports, permissions & salary reveals</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Biometric Consent Rate</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{faceConsentPct}% Face • {gpsConsentPct}% GPS</div>
            <p className="text-xs text-slate-500 mt-1">
              {pendingWithdrawalsCount} withdrawal requests pending review
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Active ERP Connectors</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {integrations.filter((i) => i.status === 'Connected').length} Connected
            </div>
            <p className="text-xs text-slate-500 mt-1">Tally Prime, SAP S/4HANA & eSSL Biometrics</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">License Utilization</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {billingPlan.activeEnrolledEmployees} / {billingPlan.totalLicensesPurchased} Seats
            </div>
            <p className="text-xs text-slate-500 mt-1">{billingPlan.planTier} • Renewal Apr 2027</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Log & JSON Diff ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Privacy & Consent Dashboard</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('retention')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'retention'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Data Retention Schedules</span>
          </button>

          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'integrations'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Integrations & Webhooks</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'billing'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Plan & Feature Ceilings</span>
          </button>
        </div>

        {/* TAB 1: AUDIT LOG & JSON DIFF */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter audit logs by action, target entity, actor, or reason..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="bg-transparent text-xs w-full outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold">Module:</span>
                  <select
                    value={auditModuleFilter}
                    onChange={(e) => setAuditModuleFilter(e.target.value)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    {uniqueModules.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold">Actor:</span>
                  <select
                    value={auditActorFilter}
                    onChange={(e) => setAuditActorFilter(e.target.value)}
                    className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    {uniqueActors.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4">Event & Timestamp</th>
                      <th className="py-3 px-4">Module</th>
                      <th className="py-3 px-4">Actor</th>
                      <th className="py-3 px-4">Target Entity</th>
                      <th className="py-3 px-4">Before State</th>
                      <th className="py-3 px-4">After State</th>
                      <th className="py-3 px-4">Justification Reason</th>
                      <th className="py-3 px-4 text-right">Inspection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{log.action}</div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <span>{log.timestamp}</span>
                            <span>• IP: {log.ipAddress || '106.51.78.22'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400">
                            {log.module || 'System'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{log.actorName}</div>
                          <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{log.targetName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{log.targetId}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                          {log.beforeValue || '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600 font-mono text-[11px] max-w-xs truncate">
                          {log.afterValue || '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {log.reason}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold flex items-center gap-1 ml-auto"
                          >
                            <Code className="w-3.5 h-3.5" />
                            <span>Diff</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRIVACY & CONSENT DASHBOARD */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Employee Biometric & GPS Consent Registry
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Compliant with India's Digital Personal Data Protection (DPDP) Act 2023. Explicit opt-in consent records for AI facial recognition and GPS coordinates.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department & Branch</th>
                      <th className="py-3 px-4">Face Recognition Consent</th>
                      <th className="py-3 px-4">GPS Location Tracking Consent</th>
                      <th className="py-3 px-4">Aadhaar/KYC Storage</th>
                      <th className="py-3 px-4">Overall Consent State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {consentRecords.map((c) => (
                      <tr key={c.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{c.employeeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{c.employeeId}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          {c.department} • {c.branch}
                        </td>
                        <td className="py-3 px-4">
                          {c.faceBiometricConsent ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Granted ({c.faceConsentTimestamp})
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold">Withdrawn / Opted Out</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {c.gpsTrackingConsent ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Granted ({c.gpsConsentTimestamp})
                            </span>
                          ) : (
                            <span className="text-amber-600 font-semibold">Not Consented (Stationary)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 font-semibold">Masked Storage Consent</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              c.consentStatus === 'Full Consent'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : c.consentStatus === 'Partial'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            {c.consentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consent Withdrawal Queue */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  Consent Revocation & Right-to-be-Forgotten Requests Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Employees can request withdrawal of biometric templates or GPS location histories. Approving triggers instant cryptographic data purge.
                </p>
              </div>

              <div className="space-y-3">
                {withdrawalRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{req.employeeName}</span>
                        <span className="text-slate-400 font-mono">({req.employeeId})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400">
                          {req.consentType}
                        </span>
                        <span className="text-slate-400">• Requested {req.requestedAt}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        <strong>Stated Reason:</strong> {req.reason}
                      </p>
                      {req.reviewNote && (
                        <p className="text-emerald-600 font-medium">
                          <strong>Resolution Note:</strong> {req.reviewNote}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === 'Pending HR Review' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(req)
                              setReviewNoteInput('Opt-out verified. Biometric template marked for permanent erasure.')
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Purge</span>
                          </button>
                          <button
                            onClick={() => rejectWithdrawalRequest(req.id, 'Mandatory for current field client verification role.')}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            req.status === 'Approved & Data Purged'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA RETENTION SETTINGS */}
        {activeTab === 'retention' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-indigo-600" />
                  Enterprise Data Lifecycle & Retention Master
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure automated purge thresholds across sensitive biometric selfies (90 days), GPS logs (180 days), and statutory tax registers (8 years).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {retentionPolicies.map((pol) => (
                <div
                  key={pol.id}
                  className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{pol.categoryName}</h4>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                        {pol.retentionDisplay}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400">{pol.dataDescription}</p>

                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                      <strong>Legal & Statutory Basis:</strong> {pol.statutoryBasis}
                    </div>

                    <div className="text-[11px] text-slate-400 flex justify-between pt-1">
                      <span>Last Purge: <strong>{pol.lastPurgeDate}</strong></span>
                      <span>Records Exceeding: <strong>{pol.recordsSubjectToPurge} records</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                      <input
                        type="checkbox"
                        checked={pol.autoPurgeEnabled}
                        onChange={(e) => updateRetentionPolicy(pol.id, pol.retentionPeriodDays, e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Auto-Purge Daily</span>
                    </label>

                    {pol.recordsSubjectToPurge > 0 && (
                      <button
                        onClick={() => triggerManualDataPurge(pol.id)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-xl font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Purge {pol.recordsSubjectToPurge} Items</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: INTEGRATIONS & WEBHOOKS HUB */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Connectors Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-600" />
                  Enterprise ERP, Accounting & Hardware Connectors
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-built integrations for general ledger sync (Tally, SAP S/4HANA) and biometric punch gateways (eSSL, Matrix).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h4>
                          <span className="text-[11px] text-slate-400">{item.category} • {item.authType}</span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === 'Connected'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-400">{item.description}</p>

                      <div className="text-[11px] text-slate-500 flex justify-between pt-1">
                        <span>Sync Cadence: <strong>{item.syncFrequency}</strong></span>
                        <span>Last Sync: <strong>{item.lastSyncTimestamp}</strong></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-indigo-600 font-semibold font-mono">
                        {item.activeSyncItemsCount} Synced Records
                      </span>
                      <button
                        onClick={() => toggleIntegration(item.id)}
                        className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
                          item.status === 'Connected'
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {item.status === 'Connected' ? 'Disconnect' : 'Connect Gateway'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outbound Webhooks */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    Outbound Event Webhooks & Real-time Dispatch
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Push live JSON event payloads for punch captures, leave approvals, and payroll run completions.
                  </p>
                </div>

                <button
                  onClick={() => setIsNewWebhookOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Webhook Endpoint
                </button>
              </div>

              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{wh.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {wh.lastDeliveryStatus}
                        </span>
                        <span className="text-slate-400 text-[11px]">• Last Triggered {wh.lastDeliveryTimestamp}</span>
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 truncate max-w-lg">{wh.targetUrl}</div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {wh.subscribedEvents.map((evt) => (
                          <span key={evt} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono">
                            {evt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => testWebhookPing(wh.id)}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 rounded-xl font-semibold flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Send Test Ping</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BILLING & PLAN CEILINGS */}
        {activeTab === 'billing' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                  {billingPlan.planTier}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Enterprise Subscription & Module Seat Quotas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Billing Cycle: <strong>{billingPlan.billingCycle}</strong> • Next Renewal: <strong>{billingPlan.annualRenewalDate}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/hr/features/catalogue"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Feature Catalogue</span>
                </Link>
              </div>
            </div>

            {/* Overall Seat Capacity Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Active License Seat Consumption</span>
                <span className="text-indigo-600 font-bold font-mono">
                  {billingPlan.activeEnrolledEmployees} / {billingPlan.totalLicensesPurchased} Seats Used (
                  {Math.round((billingPlan.activeEnrolledEmployees / billingPlan.totalLicensesPurchased) * 100)}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{
                    width: `${(billingPlan.activeEnrolledEmployees / billingPlan.totalLicensesPurchased) * 100}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-slate-400">
                160 available licenses remaining before tier expansion required.
              </div>
            </div>

            {/* Module Ceilings Table */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                Purchased Module Ceilings & Entitlements
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4">Feature Code</th>
                      <th className="py-3 px-4">Module Name</th>
                      <th className="py-3 px-4">License Status</th>
                      <th className="py-3 px-4">Active Used Seats</th>
                      <th className="py-3 px-4">Seat Ceiling</th>
                      <th className="py-3 px-4 text-right">Access Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {billingPlan.purchasedModules.map((m) => (
                      <tr key={m.featureCode} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600">{m.featureCode}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{m.moduleName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            PURCHASED
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">{m.activeUsedSeats}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{m.seatCeiling} Max</td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to="/hr/features/catalogue"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Manage</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: JSON DIFF INSPECTION */}
        {selectedAuditLog && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-mono text-[10px] text-indigo-600 font-bold">{selectedAuditLog.id}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedAuditLog.action}</h3>
                  <span className="text-slate-400">
                    By {selectedAuditLog.actorName} ({selectedAuditLog.actorRole}) • {selectedAuditLog.timestamp}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <div>Target Entity: <strong>{selectedAuditLog.targetName}</strong> ({selectedAuditLog.targetId})</div>
                <div>Stated Reason: <strong>{selectedAuditLog.reason}</strong></div>
              </div>

              {/* Side-by-Side JSON Diff */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="font-bold text-rose-600 uppercase text-[10px] tracking-wider block">
                    Before State (JSON Snapshot)
                  </span>
                  <pre className="p-3 bg-slate-900 text-rose-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56">
                    {JSON.stringify(selectedAuditLog.beforeJson || { value: selectedAuditLog.beforeValue }, null, 2)}
                  </pre>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-600 uppercase text-[10px] tracking-wider block">
                    After State (JSON Snapshot)
                  </span>
                  <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56">
                    {JSON.stringify(selectedAuditLog.afterJson || { value: selectedAuditLog.afterValue }, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedAuditLog(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: APPROVE WITHDRAWAL */}
        {selectedWithdrawal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Approve Consent Withdrawal & Execute Data Purge
              </h3>

              <div className="space-y-3">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-900 dark:text-amber-300">
                  <strong>Warning:</strong> Approving this request will immediately purge the biometric facial template or GPS history for <strong>{selectedWithdrawal.employeeName}</strong>.
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Resolution / Audit Note</label>
                  <textarea
                    rows={2}
                    value={reviewNoteInput}
                    onChange={(e) => setReviewNoteInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setSelectedWithdrawal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      approveWithdrawalRequest(selectedWithdrawal.id, reviewNoteInput)
                      setSelectedWithdrawal(null)
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                  >
                    Confirm & Purge Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE WEBHOOK */}
        {isNewWebhookOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register Outbound Webhook</h3>

              <form onSubmit={handleCreateWebhook} className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Endpoint Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ERP Ingestion Gateway"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Target HTTPS Endpoint URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://api.yourcompany.com/webhooks/hrms"
                    value={whUrl}
                    onChange={(e) => setWhUrl(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Subscribed Events (Comma separated)</label>
                  <input
                    type="text"
                    value={whEvents}
                    onChange={(e) => setWhEvents(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewWebhookOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Create Webhook
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}

export default AdminSystemPage
