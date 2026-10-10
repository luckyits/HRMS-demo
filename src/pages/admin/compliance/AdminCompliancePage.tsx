import React, { useState } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useComplianceEngagement,
  type PolicyDocumentMaster,
  type GrievancePoshCase,
  type ComplianceAlertItem,
  type CelebrationSettings,
} from '@/context/ComplianceEngagementContext'
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Building,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Info,
  Lock,
  Mail,
  Megaphone,
  PartyPopper,
  Plus,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Unlock,
  User,
  Users,
  Briefcase,
  HelpCircle,
  Scale,
} from 'lucide-react'

export const AdminCompliancePage: React.FC = () => {
  const {
    policies,
    selectedPolicy,
    setSelectedPolicyId,
    sendAcknowledgementReminder,
    sendBulkReminders,
    addNewPolicyVersion,
    createPolicy,
    ptSlabs,
    minimumWages,
    shopsActRules,
    updatePtSlab,
    complianceAlerts,
    resolveAlert,
    markAlertUnderReview,
    announcements,
    createAnnouncement,
    togglePinAnnouncement,
    deleteAnnouncement,
    celebrationSettings,
    updateCelebrationSettings,
    helpdeskCategories,
    updateHelpdeskCategory,
    createHelpdeskCategory,
    isIccCommitteeUnlocked,
    setIccCommitteeUnlocked,
    poshCases,
    addPoshCaseNote,
    updatePoshCaseStatus,
    vaultDocuments,
    renewVaultDocument,
    addVaultDocument,
    sendDocumentRenewalReminder,
  } = useComplianceEngagement()

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'policies' | 'statutory' | 'alerts' | 'announcements' | 'celebrations' | 'helpdesk' | 'posh' | 'vault'
  >('policies')

  // Modals State
  const [isNewPolicyModalOpen, setIsNewPolicyModalOpen] = useState(false)
  const [newPolicyTitle, setNewPolicyTitle] = useState('')
  const [newPolicyCategory, setNewPolicyCategory] = useState<PolicyDocumentMaster['category']>('Corporate Governance')
  const [newPolicyCode, setNewPolicyCode] = useState('')
  const [newPolicySummary, setNewPolicySummary] = useState('')
  const [newPolicyContent, setNewPolicyContent] = useState('')

  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false)
  const [newVerNumber, setNewVerNumber] = useState('')
  const [newVerNote, setNewVerNote] = useState('')
  const [newVerContent, setNewVerContent] = useState('')

  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false)
  const [annTitle, setAnnTitle] = useState('')
  const [annCategory, setAnnCategory] = useState<'Company News' | 'Policy Update' | 'Celebration' | 'Urgent Broadcast'>('Company News')
  const [annPriority, setAnnPriority] = useState<'Normal' | 'High' | 'Urgent'>('Normal')
  const [annContent, setAnnContent] = useState('')
  const [annBranch, setAnnBranch] = useState('All')
  const [annDept, setAnnDept] = useState('All')

  const [isResolveAlertOpen, setIsResolveAlertOpen] = useState(false)
  const [resolvingAlert, setResolvingAlert] = useState<ComplianceAlertItem | null>(null)
  const [actionPlanInput, setActionPlanInput] = useState('')

  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<GrievancePoshCase | null>(null)
  const [newCaseNoteInput, setNewCaseNoteInput] = useState('')

  const [isRenewDocOpen, setIsRenewDocOpen] = useState(false)
  const [renewingDocId, setRenewingDocId] = useState<string | null>(null)
  const [newDocExpiryDate, setNewDocExpiryDate] = useState('')
  const [newDocNumber, setNewDocNumber] = useState('')

  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [newCatDesc, setNewCatDesc] = useState('')
  const [newCatTeam, setNewCatTeam] = useState('Operations')
  const [newCatRespSla, setNewCatRespSla] = useState(4)
  const [newCatResolSla, setNewCatResolSla] = useState(24)

  // Policy Create handler
  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPolicyTitle || !newPolicySummary) return
    createPolicy({
      code: newPolicyCode || `POL-${Date.now().toString().slice(-4)}`,
      title: newPolicyTitle,
      category: newPolicyCategory,
      currentVersion: 'v1.0',
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      effectiveDate: new Date().toISOString().split('T')[0],
      summary: newPolicySummary,
      fullContent: newPolicyContent || newPolicySummary,
      targetAudience: { branch: 'All', department: 'All', profile: 'All' },
      isMandatoryAcknowledgement: true,
      acknowledgementDeadlineDays: 14,
    })
    setIsNewPolicyModalOpen(false)
    setNewPolicyTitle('')
    setNewPolicySummary('')
    setNewPolicyContent('')
    setNewPolicyCode('')
  }

  // New Version handler
  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPolicy || !newVerNumber || !newVerNote) return
    addNewPolicyVersion(selectedPolicy.id, newVerNumber, newVerNote, newVerContent || selectedPolicy.fullContent)
    setIsNewVersionModalOpen(false)
    setNewVerNumber('')
    setNewVerNote('')
    setNewVerContent('')
  }

  // Create Announcement handler
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle || !annContent) return
    createAnnouncement({
      title: annTitle,
      category: annCategory,
      priority: annPriority,
      content: annContent,
      targetBranch: annBranch,
      targetDepartment: annDept,
      targetProfile: 'All',
      isPinned: annPriority === 'Urgent',
      authorName: 'Corporate HR & Compliance',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    })
    setIsNewAnnouncementOpen(false)
    setAnnTitle('')
    setAnnContent('')
  }

  // Submit Case Note
  const handleAddCaseNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCaseForDetail || !newCaseNoteInput.trim()) return
    addPoshCaseNote(selectedCaseForDetail.id, newCaseNoteInput)
    setNewCaseNoteInput('')
  }

  // Calculate Metrics
  const totalPolicies = policies.length
  const totalAcknowledgements = policies.reduce((acc, p) => acc + p.acknowledgements.length, 0)
  const acknowledgedCount = policies.reduce(
    (acc, p) => acc + p.acknowledgements.filter((a) => a.status === 'Acknowledged').length,
    0
  )
  const ackRate = totalAcknowledgements > 0 ? Math.round((acknowledgedCount / totalAcknowledgements) * 100) : 0
  const openAlertsCount = complianceAlerts.filter((a) => a.status !== 'Resolved').length
  const expiringDocsCount = vaultDocuments.filter((d) => d.status !== 'Valid').length

  return (
    <FeatureGate feature="ATT_POLICY">
      <div className="space-y-6">
        {/* TOP STATUTORY GUIDANCE DISCLAIMER BANNER */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
          <Scale className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Statutory & Regulatory Advisory Note:</span>{' '}
            Rules, Professional Tax slabs, Minimum Wages, and POSH guidelines presented in this portal are configured for organizational guidance. Please confirm with your legal counsel or Chartered Accountant (CA) advisor for jurisdiction-specific compliance filings.
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                ENTERPRISE COMPLIANCE & ENGAGEMENT
              </span>
              <span className="text-xs text-slate-500">Labour Laws, POSH ICC, Policy Tracker & Vault</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Compliance, Governance & Engagement Desk
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage organization policies with digital acknowledgement audit trails, state-wise statutory rule tables, targeted announcements, confidential POSH (ICC) committee desk, and document expiry alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewAnnouncementOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Megaphone className="w-3.5 h-3.5" />
              Broadcast Announcement
            </button>
            <button
              onClick={() => setIsNewPolicyModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Policy
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Policy Ack. Rate</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{ackRate}% Compliant</div>
            <p className="text-xs text-slate-500 mt-1">
              Across {totalPolicies} published policies & {totalAcknowledgements} assigned staff
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Compliance Alerts</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600">{openAlertsCount} Actionable</div>
            <p className="text-xs text-slate-500 mt-1">PF wage ceiling & PT quarterly deadline</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Confidential POSH & Grievance</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">{poshCases.length} Registered</div>
            <p className="text-xs text-slate-500 mt-1">
              {isIccCommitteeUnlocked ? 'ICC Mode: Unlocked' : 'ICC Mode: Restricted Access'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Document Expiry Radar</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600">{expiringDocsCount} Expiring / Expired</div>
            <p className="text-xs text-slate-500 mt-1">Boiler NOC, Commercial DL, Work Visas</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('policies')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'policies'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Policy Library & Acknowledgements</span>
          </button>

          <button
            onClick={() => setActiveTab('statutory')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'statutory'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Labour Laws & Statutory Tables</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Compliance Alerts Feed</span>
            {openAlertsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                {openAlertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Targeted Announcements</span>
          </button>

          <button
            onClick={() => setActiveTab('celebrations')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'celebrations'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <PartyPopper className="w-4 h-4" />
            <span>Birthdays & Anniversaries</span>
          </button>

          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'helpdesk'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Helpdesk Categories & SLA</span>
          </button>

          <button
            onClick={() => setActiveTab('posh')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'posh'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Confidential POSH & Grievance</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'vault'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Vault & Expiry</span>
          </button>
        </div>

        {/* TAB 1: POLICY LIBRARY & ACKNOWLEDGEMENT TRACKER */}
        {activeTab === 'policies' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Policies List */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Organization Policies ({policies.length})
                </span>
                <button
                  onClick={() => setIsNewPolicyModalOpen(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Policy</span>
                </button>
              </div>

              {policies.map((p) => {
                const ackCount = p.acknowledgements.filter((a) => a.status === 'Acknowledged').length
                const total = p.acknowledgements.length
                const pct = total > 0 ? Math.round((ackCount / total) * 100) : 0
                const isSelected = selectedPolicy?.id === p.id

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPolicyId(p.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {p.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{p.title}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Version: <span className="font-semibold text-indigo-600">{p.currentVersion}</span> • Updated {p.lastUpdated}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{p.code}</span>
                    </div>

                    {/* Ack Progress bar */}
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Read & Acknowledged</span>
                        <span className="font-bold text-slate-900 dark:text-white">{ackCount}/{total} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Column: Selected Policy Details, Version History & Acknowledgement Tracker */}
            <div className="lg:col-span-8 space-y-6">
              {selectedPolicy ? (
                <>
                  {/* Selected Policy Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                            {selectedPolicy.category}
                          </span>
                          <span className="text-xs text-slate-500">Code: {selectedPolicy.code}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                          {selectedPolicy.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Effective Date: <strong>{selectedPolicy.effectiveDate}</strong> • Mandatory Acknowledgement: <strong>{selectedPolicy.isMandatoryAcknowledgement ? 'Yes' : 'Optional'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setNewVerNumber(`v${(parseFloat(selectedPolicy.currentVersion.replace('v', '')) + 0.1).toFixed(1)}`)
                            setNewVerContent(selectedPolicy.fullContent)
                            setIsNewVersionModalOpen(true)
                          }}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Publish New Version
                        </button>
                        <button
                          onClick={() => sendBulkReminders(selectedPolicy.id)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Remind All Pending
                        </button>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                        Executive Summary
                      </h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        {selectedPolicy.summary}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                        Full Policy Content (Active Version {selectedPolicy.currentVersion})
                      </h5>
                      <div className="text-xs text-slate-700 dark:text-slate-300 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 font-sans leading-relaxed">
                        {selectedPolicy.fullContent}
                      </div>
                    </div>
                  </div>

                  {/* Version Changelog History */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <History className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Version History & Revision Changelog
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {selectedPolicy.versions.map((ver, idx) => (
                        <div
                          key={ver.version}
                          className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start justify-between text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-indigo-600">{ver.version}</span>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                                  CURRENT ACTIVE
                                </span>
                              )}
                              <span className="text-slate-400">• Released on {ver.releaseDate}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400">{ver.changeSummary}</p>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{ver.changedBy}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acknowledgement Tracker Table */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Employee Acknowledgement Audit Ledger
                        </h4>
                      </div>
                      <span className="text-xs text-slate-500">
                        {selectedPolicy.acknowledgements.filter((a) => a.status === 'Acknowledged').length} of{' '}
                        {selectedPolicy.acknowledgements.length} Acknowledged
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                            <th className="py-2.5 px-3">Employee</th>
                            <th className="py-2.5 px-3">Department & Branch</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Digital Signature / IP</th>
                            <th className="py-2.5 px-3">Acknowledged At</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {selectedPolicy.acknowledgements.map((ack) => (
                            <tr key={ack.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-3 px-3">
                                <div className="font-bold text-slate-900 dark:text-white">{ack.employeeName}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{ack.employeeId}</div>
                              </td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                {ack.department} • {ack.branch}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    ack.status === 'Acknowledged'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                      : ack.status === 'Pending'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                                  }`}
                                >
                                  {ack.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                                {ack.ipAddress || '—'}
                              </td>
                              <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                                {ack.acknowledgedAt || 'Pending'}
                                {ack.reminderSentAt && (
                                  <span className="block text-[10px] text-slate-400">
                                    Last reminded: {ack.reminderSentAt}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                {ack.status !== 'Acknowledged' && (
                                  <button
                                    onClick={() => sendAcknowledgementReminder(selectedPolicy.id, ack.employeeId)}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 rounded text-xs font-semibold flex items-center gap-1 ml-auto"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Remind</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  Select a policy from the left panel to inspect version history and acknowledgement audits.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LABOUR LAWS & STATUTORY TABLES */}
        {activeTab === 'statutory' && (
          <div className="space-y-6">
            {/* Professional Tax Slabs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    State-Wise Professional Tax (PT) Slabs
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Statutory monthly deductions based on gross salary earnings by state jurisdiction. Effective dated.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Auto-Synchronized with Payroll Engine
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ptSlabs.map((state) => (
                  <div
                    key={state.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{state.stateName}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">
                        {state.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">{state.actReference}</p>
                    <div className="text-[11px] text-slate-500">Effective: {state.effectiveFrom}</div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700">
                      {state.slabs.map((slab, i) => (
                        <div key={i} className="flex justify-between text-slate-700 dark:text-slate-300">
                          <span>
                            ₹{slab.minGross.toLocaleString('en-IN')} –{' '}
                            {slab.maxGross > 50000000 ? 'Above' : `₹${slab.maxGross.toLocaleString('en-IN')}`}
                          </span>
                          <span className="font-bold font-mono">
                            ₹{slab.ptPerMonth}/mo {slab.specialMonthNote && `(${slab.specialMonthNote})`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Minimum Wages Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  State Minimum Wages Matrix (Basic + VDA)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory floor wage thresholds categorized by skill level and geographic zones.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-2.5 px-3">State & Zone</th>
                      <th className="py-2.5 px-3">Skill Classification</th>
                      <th className="py-2.5 px-3">Basic Daily Rate</th>
                      <th className="py-2.5 px-3">VDA Rate</th>
                      <th className="py-2.5 px-3">Total Daily Wage</th>
                      <th className="py-2.5 px-3">Monthly Minimum Wage (26 Days)</th>
                      <th className="py-2.5 px-3">Effective Date</th>
                      <th className="py-2.5 px-3">Gazette Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {minimumWages.map((mw) => (
                      <tr key={mw.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {mw.stateName}
                          <span className="block text-[10px] text-slate-400 font-normal">{mw.zone}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                            {mw.skillLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono">₹{mw.basicDailyRate.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono text-emerald-600">+₹{mw.vdaDailyRate.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          ₹{mw.totalDailyRate.toFixed(2)}/day
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600 text-sm">
                          ₹{mw.monthlyRate.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{mw.effectiveFrom}</td>
                        <td className="py-3 px-3 font-mono text-[10px] text-slate-400">{mw.notificationRef}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Shops & Establishments Act Rules */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-600" />
                  Shops & Commercial Establishments Act Working Hours & Shift Rules
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily & weekly spreadover limits, rest intervals, and mandatory women night-shift transport compliance rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shopsActRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{rule.stateName} Rules</h4>
                      <span className="text-[10px] text-slate-400">Effective {rule.effectiveFrom}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                      <div>Max Daily: <strong>{rule.maxDailyHours} hrs</strong></div>
                      <div>Max Weekly: <strong>{rule.maxWeeklyHours} hrs</strong></div>
                      <div>Max Spreadover: <strong>{rule.maxSpreadoverHours} hrs</strong></div>
                      <div>Rest Interval: <strong>After {rule.intervalOfRestHours} hrs</strong></div>
                      <div className="col-span-2">OT Rate: <strong>{rule.overtimeRateMultiplier}x Basic Hourly</strong></div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-300">Women Night Shift Protocol:</div>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                        {rule.womenNightShiftCutoff}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>GPS Security Drop-off Enforced</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMPLIANCE ALERTS FEED */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Regulatory & Statutory Intelligence Alerts Feed
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time statutory updates from MoL&E, EPFO, ESIC, State Labour Depts, and PoSH Act notifications.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {complianceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    alert.status === 'Resolved'
                      ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-80'
                      : alert.severity === 'Critical' || alert.severity === 'High'
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            alert.severity === 'High' || alert.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                              : alert.severity === 'Action Required'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400'
                          }`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs font-bold text-indigo-600">{alert.category}</span>
                        <span className="text-xs text-slate-400">• Source: {alert.sourceAuthority}</span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{alert.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                        <span>Effective / Target: <strong>{alert.effectiveDate}</strong></span>
                        {alert.deadlineDate && (
                          <span className="text-rose-600 font-semibold">Filing Deadline: {alert.deadlineDate}</span>
                        )}
                        <span>Impact: <strong>{alert.impactedEmployeeCount} Employees</strong></span>
                      </div>

                      {alert.actionPlan && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 mt-2">
                          <strong>Action Plan Executed:</strong> {alert.actionPlan}
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          alert.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : alert.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {alert.status}
                      </span>

                      {alert.status !== 'Resolved' && (
                        <>
                          <button
                            onClick={() => {
                              setResolvingAlert(alert)
                              setActionPlanInput(alert.actionPlan || '')
                              setIsResolveAlertOpen(true)
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolve Alert</span>
                          </button>
                          {alert.status === 'Open' && (
                            <button
                              onClick={() => markAlertUnderReview(alert.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                            >
                              Mark Under Review
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TARGETED ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-600" />
                  Targeted Broadcast Announcements
                </h3>
                <p className="text-xs text-slate-500">
                  Send company-wide news, festive holiday updates, or targeted policy memos filtered by branch, department, and profile.
                </p>
              </div>

              <button
                onClick={() => setIsNewAnnouncementOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Broadcast
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className={`p-5 rounded-2xl border relative flex flex-col justify-between ${
                    ann.isPinned
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-300 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ann.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-800'
                              : ann.priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ann.category}
                        </span>
                        {ann.isPinned && (
                          <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                            📌 PINNED TO TOP
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePinAnnouncement(ann.id)}
                          className="p-1 text-slate-400 hover:text-indigo-600 text-xs"
                          title="Toggle Pin"
                        >
                          📌
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{ann.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 space-y-1">
                      <div>Target Audience: <strong>Branch ({ann.targetBranch}) • Dept ({ann.targetDepartment})</strong></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <img src={ann.authorAvatar} alt="" className="w-5 h-5 rounded-full" />
                      <span>{ann.authorName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{ann.publishedAt}</span>
                      <span className="font-semibold text-emerald-600 font-mono">
                        {ann.readCount}/{ann.totalAudienceCount} Read
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BIRTHDAY & ANNIVERSARY CELEBRATION SETTINGS */}
        {activeTab === 'celebrations' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 max-w-4xl">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-pink-600" />
                Workforce Celebrations & Recognition Settings
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize automated employee birthday and work anniversary greetings, feed visibility privacy, and advance manager reminders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Birthday Template */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Birthday Greeting Template
                </label>
                <textarea
                  value={celebrationSettings.birthdayWishTemplate}
                  onChange={(e) => updateCelebrationSettings({ birthdayWishTemplate: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <div className="text-[11px] text-slate-400">
                  Available Merge Tags: <span className="font-mono text-pink-600">{'{employee_name}'}</span>,{' '}
                  <span className="font-mono text-pink-600">{'{designation}'}</span>
                </div>
              </div>

              {/* Anniversary Template */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Work Anniversary Greeting Template
                </label>
                <textarea
                  value={celebrationSettings.anniversaryWishTemplate}
                  onChange={(e) => updateCelebrationSettings({ anniversaryWishTemplate: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <div className="text-[11px] text-slate-400">
                  Available Merge Tags: <span className="font-mono text-pink-600">{'{years}'}</span>,{' '}
                  <span className="font-mono text-pink-600">{'{employee_name}'}</span>,{' '}
                  <span className="font-mono text-pink-600">{'{designation}'}</span>
                </div>
              </div>
            </div>

            {/* Visibility & Toggles */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Celebration Feed Visibility Scope (Who can see?)
                </label>
                <select
                  value={celebrationSettings.visibilityScope}
                  onChange={(e) =>
                    updateCelebrationSettings({
                      visibilityScope: e.target.value as CelebrationSettings['visibilityScope'],
                    })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="Company-wide">Company-wide (All employees across all entities)</option>
                  <option value="Same Branch Only">Same Branch Only (Only colleagues in the same physical office)</option>
                  <option value="Same Department Only">Same Department Only</option>
                  <option value="Direct Team Only">Direct Team Only (Manager & direct reportees)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Automation & Manager Pre-Alerts
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={celebrationSettings.autoWishEnabled}
                      onChange={(e) => updateCelebrationSettings({ autoWishEnabled: e.target.checked })}
                      className="rounded text-pink-600"
                    />
                    <span>Post automated morning greetings to Employee Dashboard</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={celebrationSettings.sendMorningNotification}
                      onChange={(e) => updateCelebrationSettings({ sendMorningNotification: e.target.checked })}
                      className="rounded text-pink-600"
                    />
                    <span>Send push notification / email to reporting managers 3 days in advance</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: HELPDESK CATEGORIES & SLA */}
        {activeTab === 'helpdesk' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Service Desk & Helpdesk SLA Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure helpdesk categories, default assignment routing teams, and First Response & Resolution SLA hour targets.
                </p>
              </div>

              <button
                onClick={() => setIsNewCategoryOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-4">Category Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Default Assignment Team</th>
                    <th className="py-3 px-4">Response SLA</th>
                    <th className="py-3 px-4">Resolution SLA</th>
                    <th className="py-3 px-4">Active Open Tickets</th>
                    <th className="py-3 px-4">CSAT Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {helpdeskCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {cat.name}
                        <span className="block text-[10px] text-slate-400 font-mono">{cat.id}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs">{cat.description}</td>
                      <td className="py-3 px-4 font-semibold text-indigo-600">{cat.defaultAssigneeTeam}</td>
                      <td className="py-3 px-4 font-bold">{cat.responseSlaHours} Hours</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{cat.resolutionSlaHours} Hours</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {cat.activeTicketsCount}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                          {cat.satisfactionScorePct}% CSAT
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: CONFIDENTIAL POSH & GRIEVANCE (ICC COMMITTEE) */}
        {activeTab === 'posh' && (
          <div className="space-y-6">
            {/* Committee Lock Screen Gate */}
            {!isIccCommitteeUnlocked ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-sm space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Confidential Internal Complaints Committee (ICC) Vault
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  In compliance with the Sexual Harassment of Women at Workplace (PoSH Act 2013) & Enterprise Whistleblower protections, case notes and hearing depositions are restricted exclusively to authorized ICC Committee members.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setIccCommitteeUnlocked(true)}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 mx-auto"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Authorize & Unlock ICC Committee Mode</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-900 dark:text-purple-200">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>ICC Committee Authorized Session Active (Strict Confidentiality Enforced)</span>
                  </div>
                  <button
                    onClick={() => setIccCommitteeUnlocked(false)}
                    className="px-3 py-1 bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Lock Session</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Registered Cases List */}
                  <div className="lg:col-span-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                      Active POSH & Grievance Cases ({poshCases.length})
                    </h4>

                    {poshCases.map((c) => {
                      const isSelected = selectedCaseForDetail?.id === c.id
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCaseForDetail(c)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                            isSelected
                              ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-500 shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400">
                              {c.category}
                            </span>
                            <span className="font-mono text-xs text-slate-400">{c.caseNumber}</span>
                          </div>

                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {c.isAnonymous ? '🛡️ Anonymous Whistleblower' : c.complainantName}
                          </div>

                          <div className="text-xs text-slate-500">
                            Respondent: <strong className="text-slate-800 dark:text-slate-200">{c.respondentName}</strong> ({c.respondentDesignation})
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                            <span className="text-slate-400">Filed {c.filedDate}</span>
                            <span className="font-semibold text-purple-600">{c.status}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Right Column: Case Dossier & Hearing Depositions */}
                  <div className="lg:col-span-7">
                    {selectedCaseForDetail ? (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="font-mono text-xs text-purple-600 font-bold">
                              {selectedCaseForDetail.caseNumber}
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {selectedCaseForDetail.category}
                            </h3>
                            <span className="text-xs text-slate-500">
                              Incident Date: {selectedCaseForDetail.incidentDate} • Filed: {selectedCaseForDetail.filedDate}
                            </span>
                          </div>

                          <select
                            value={selectedCaseForDetail.status}
                            onChange={(e) =>
                              updatePoshCaseStatus(
                                selectedCaseForDetail.id,
                                e.target.value as GrievancePoshCase['status']
                              )
                            }
                            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                          >
                            <option value="Under Preliminary Review">Under Preliminary Review</option>
                            <option value="ICC Inquiry Constituted">ICC Inquiry Constituted</option>
                            <option value="Hearings in Progress">Hearings in Progress</option>
                            <option value="Decision Pending">Decision Pending</option>
                            <option value="Case Closed & Action Taken">Case Closed & Action Taken</option>
                          </select>
                        </div>

                        {/* Complainant & Respondent */}
                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <span className="text-slate-400 block mb-0.5">Complainant / Aggrieved Person</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedCaseForDetail.isAnonymous
                                ? '🛡️ Anonymous Whistleblower Protected'
                                : `${selectedCaseForDetail.complainantName} (${selectedCaseForDetail.complainantDepartment})`}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block mb-0.5">Respondent</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedCaseForDetail.respondentName} — {selectedCaseForDetail.respondentDesignation}
                            </span>
                          </div>
                        </div>

                        {/* Summary */}
                        <div>
                          <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">
                            Allegation Statement & Particulars
                          </h5>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                            {selectedCaseForDetail.summary}
                          </p>
                        </div>

                        {/* ICC Committee Members */}
                        <div>
                          <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                            Assigned ICC Committee Bench
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {selectedCaseForDetail.committeeMembers.map((m, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-100 dark:border-purple-800"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Confidential Hearing Notes */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                            Confidential ICC Hearing Notes & Evidence Log
                          </h5>

                          <div className="space-y-2">
                            {selectedCaseForDetail.confidentialNotes.map((n) => (
                              <div
                                key={n.id}
                                className="p-3 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-xl text-xs space-y-1"
                              >
                                <div className="flex justify-between text-[11px] text-slate-400">
                                  <span className="font-semibold text-purple-700 dark:text-purple-300">{n.author}</span>
                                  <span>{n.timestamp}</span>
                                </div>
                                <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                              </div>
                            ))}
                          </div>

                          {/* Add Note Form */}
                          <form onSubmit={handleAddCaseNote} className="flex gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="Record confidential committee hearing minute / deposition..."
                              value={newCaseNoteInput}
                              onChange={(e) => setNewCaseNoteInput(e.target.value)}
                              className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs"
                            >
                              Add Minute
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        Select a case file from the left to inspect depositions, evidence, and ICC hearings.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 8: DOCUMENT VAULT & EXPIRY RADAR */}
        {activeTab === 'vault' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Statutory & Compliance Document Vault
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Central repository tracking expiry of Work Visas, Commercial Driving Licenses, Medical Fitness Certificates, and Factory Boiler NOCs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                  {expiringDocsCount} Expiries Requiring Renewal
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-4">Document Name & Number</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4">Holder / Facility</th>
                    <th className="py-3 px-4">Issuing Authority</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status & Countdown</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {vaultDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {doc.documentName}
                        <span className="block text-[10px] text-slate-400 font-mono">{doc.documentNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-medium">
                        {doc.holderName}
                        <span className="block text-[10px] text-slate-400 font-mono">{doc.holderId}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{doc.issuingAuthority}</td>
                      <td className="py-3 px-4 text-slate-500">{doc.issueDate}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{doc.expiryDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            doc.status === 'Valid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : doc.status === 'Expiring Soon'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {doc.status === 'Expired'
                            ? 'EXPIRED'
                            : doc.status === 'Expiring Soon'
                            ? `EXPIRING (${doc.daysUntilExpiry}d)`
                            : 'VALID'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => sendDocumentRenewalReminder(doc.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold"
                            title="Send Renewal Reminder"
                          >
                            Remind
                          </button>
                          <button
                            onClick={() => {
                              setRenewingDocId(doc.id)
                              setNewDocNumber(doc.documentNumber)
                              setNewDocExpiryDate('2028-10-31')
                              setIsRenewDocOpen(true)
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
                          >
                            Renew
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: CREATE NEW POLICY */}
        {isNewPolicyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create New Organization Policy</h3>

              <form onSubmit={handleCreatePolicy} className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Policy Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remote Work & Anti-Moonlighting Standard"
                    value={newPolicyTitle}
                    onChange={(e) => setNewPolicyTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Category</label>
                    <select
                      value={newPolicyCategory}
                      onChange={(e) => setNewPolicyCategory(e.target.value as PolicyDocumentMaster['category'])}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Corporate Governance">Corporate Governance</option>
                      <option value="Workplace Safety">Workplace Safety</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Compensation & Leave">Compensation & Leave</option>
                      <option value="Ethics & POSH">Ethics & POSH</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Policy Code</label>
                    <input
                      type="text"
                      placeholder="e.g. POL-2026-08"
                      value={newPolicyCode}
                      onChange={(e) => setNewPolicyCode(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Summary Statement</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Brief 1-2 sentence executive summary..."
                    value={newPolicySummary}
                    onChange={(e) => setNewPolicySummary(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Full Policy Clauses & Content</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Full legal and governance text of this policy..."
                    value={newPolicyContent}
                    onChange={(e) => setNewPolicyContent(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-sans"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsNewPolicyModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Create & Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PUBLISH NEW VERSION */}
        {isNewVersionModalOpen && selectedPolicy && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Publish Version Update — {selectedPolicy.title}
              </h3>

              <form onSubmit={handleAddVersion} className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">New Version Identifier</label>
                  <input
                    type="text"
                    required
                    value={newVerNumber}
                    onChange={(e) => setNewVerNumber(e.target.value)}
                    placeholder="e.g. v3.3"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Revision Summary / Changelog Note</label>
                  <textarea
                    required
                    rows={2}
                    value={newVerNote}
                    onChange={(e) => setNewVerNote(e.target.value)}
                    placeholder="Explain key statutory or operational amendments in this release..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Updated Full Policy Text</label>
                  <textarea
                    rows={4}
                    value={newVerContent}
                    onChange={(e) => setNewVerContent(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-900 dark:text-amber-300 text-[11px]">
                  <strong>Notice:</strong> Publishing a new version will reset employee acknowledgement tracking to 'Pending' to mandate fresh re-read and acceptance.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewVersionModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Publish Version
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: BROADCAST ANNOUNCEMENT */}
        {isNewAnnouncementOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Broadcast Targeted Announcement</h3>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Announcement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Townhall & Strategy Address"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Category</label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Company News">Company News</option>
                      <option value="Policy Update">Policy Update</option>
                      <option value="Celebration">Celebration</option>
                      <option value="Urgent Broadcast">Urgent Broadcast</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Priority</label>
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent (Pin to Top)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Target Branch</label>
                    <select
                      value={annBranch}
                      onChange={(e) => setAnnBranch(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="All">All Branches</option>
                      <option value="Bengaluru HQ">Bengaluru HQ</option>
                      <option value="Mumbai Tech Park">Mumbai Tech Park</option>
                      <option value="Pune Plant">Pune Plant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Target Department</label>
                    <select
                      value={annDept}
                      onChange={(e) => setAnnDept(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="All">All Departments</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Field Sales">Field Sales</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Announcement Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Broadcast message body..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAnnouncementOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Send Broadcast
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: RESOLVE COMPLIANCE ALERT */}
        {isResolveAlertOpen && resolvingAlert && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Resolve Compliance Alert — {resolvingAlert.title}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Record Corrective Action Plan</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe how this statutory filing or policy requirement was fulfilled..."
                    value={actionPlanInput}
                    onChange={(e) => setActionPlanInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResolveAlertOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      resolveAlert(resolvingAlert.id, actionPlanInput || 'Statutory review and filing confirmed.')
                      setIsResolveAlertOpen(false)
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RENEW VAULT DOCUMENT */}
        {isRenewDocOpen && renewingDocId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Record Document Renewal</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Updated Certificate / License Number</label>
                  <input
                    type="text"
                    value={newDocNumber}
                    onChange={(e) => setNewDocNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">New Expiry Date</label>
                  <input
                    type="date"
                    value={newDocExpiryDate}
                    onChange={(e) => setNewDocExpiryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRenewDocOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      renewVaultDocument(renewingDocId, newDocExpiryDate, newDocNumber)
                      setIsRenewDocOpen(false)
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Save Renewal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD HELPDESK CATEGORY */}
        {isNewCategoryOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Helpdesk Category & SLA</h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!newCatName) return
                  createHelpdeskCategory({
                    name: newCatName,
                    description: newCatDesc,
                    defaultAssigneeTeam: newCatTeam,
                    responseSlaHours: Number(newCatRespSla),
                    resolutionSlaHours: Number(newCatResolSla),
                    priorityLevel: 'Medium',
                  })
                  setIsNewCategoryOpen(false)
                  setNewCatName('')
                  setNewCatDesc('')
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Travel, Forex & Visa Desk"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Description</label>
                  <input
                    type="text"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    placeholder="Tickets concerning corporate hotel bookings and visas..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Default Routing Team</label>
                  <input
                    type="text"
                    value={newCatTeam}
                    onChange={(e) => setNewCatTeam(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Response SLA (Hours)</label>
                    <input
                      type="number"
                      value={newCatRespSla}
                      onChange={(e) => setNewCatRespSla(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Resolution SLA (Hours)</label>
                    <input
                      type="number"
                      value={newCatResolSla}
                      onChange={(e) => setNewCatResolSla(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewCategoryOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold"
                  >
                    Add Category
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

export default AdminCompliancePage
