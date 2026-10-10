import React, { useState, useMemo } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useLifecycle,
  OnboardingTask,
  EmployeeOnboarding,
  AgreementTemplate,
  EmployeeAgreementRecord,
  LetterTemplate,
  GeneratedLetter,
  ResignationRequest,
  ExitClearanceItem,
  FullAndFinalSettlement,
  RehireRecord,
} from '@/context/LifecycleContext'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import {
  Users,
  FileSignature,
  FileText,
  UserMinus,
  Calculator,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Printer,
  Download,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Building,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Award,
  ChevronRight,
  Info,
  DollarSign,
  Laptop,
  CheckSquare,
  XCircle,
  FolderPlus,
  Briefcase,
  ExternalLink,
} from 'lucide-react'

export const AdminLifecyclePage: React.FC = () => {
  const {
    onboardingTemplates,
    employeeOnboardings,
    updateOnboardingTaskStatus,
    agreementTemplates,
    employeeAgreements,
    sendAgreementToEmployee,
    letterTemplates,
    generatedLetters,
    generateEmployeeLetter,
    resignations,
    hrApproveResignation,
    exitClearances,
    updateExitClearance,
    fnfSettlements,
    calculateFnF,
    approveFnFSettlement,
    rehireRecords,
    processRehire,
  } = useLifecycle()

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'onboarding' | 'agreements' | 'letters' | 'resignations' | 'fnf' | 'rehire'
  >('onboarding')

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOnboardingEmp, setSelectedOnboardingEmp] = useState<EmployeeOnboarding | null>(null)
  const [selectedResignation, setSelectedResignation] = useState<ResignationRequest | null>(null)
  const [selectedFnF, setSelectedFnF] = useState<FullAndFinalSettlement | null>(null)

  // Letter Generator Form State
  const [selectedLetterType, setSelectedLetterType] = useState<LetterTemplate['type']>('Offer Letter')
  const [letterEmpName, setLetterEmpName] = useState('Ankit Sharma')
  const [letterDesignation, setLetterDesignation] = useState('Senior Fullstack Engineer')
  const [letterDept, setLetterDept] = useState('Engineering')
  const [letterDoj, setLetterDoj] = useState('2026-11-01')
  const [letterCtc, setLetterCtc] = useState('18,50,000')
  const [letterLocation, setLetterLocation] = useState('Bangalore Tech Park')
  const [letterManager, setLetterManager] = useState('Rajiv Mehta')
  const [letterLwd, setLetterLwd] = useState('2026-10-31')
  const [previewLetterModal, setPreviewLetterModal] = useState<GeneratedLetter | null>(null)

  // Rehire Form Modal
  const [rehireModalRecord, setRehireModalRecord] = useState<RehireRecord | null>(null)
  const [newRehireEmpId, setNewRehireEmpId] = useState('')
  const [rehireNotes, setRehireNotes] = useState('')

  // Send Agreement Modal
  const [isSendAgreementOpen, setIsSendAgreementOpen] = useState(false)
  const [selectedAgtTemplateId, setSelectedAgtTemplateId] = useState(agreementTemplates[0]?.id || '')
  const [sendAgtEmpId, setSendAgtEmpId] = useState('EMP-108')
  const [sendAgtEmpName, setSendAgtEmpName] = useState('Kunal Verma')
  const [sendAgtDept, setSendAgtDept] = useState('Engineering')

  // Overall KPI Metrics
  const metrics = useMemo(() => {
    const activeOnboardings = employeeOnboardings.filter((o) => o.status === 'In Progress').length
    const pendingAgreements = employeeAgreements.filter((a) => a.status === 'Pending Signature').length
    const activeResignations = resignations.filter(
      (r) => r.status === 'Pending Manager Review' || r.status === 'Pending HR Review' || r.status === 'Serving Notice' || r.status === 'Exit Clearance'
    ).length
    const pendingFnF = fnfSettlements.filter((f) => f.paymentStatus !== 'Disbursed').length

    return {
      activeOnboardings,
      pendingAgreements,
      activeResignations,
      pendingFnF,
    }
  }, [employeeOnboardings, employeeAgreements, resignations, fnfSettlements])

  // Active Letter Template
  const currentLetterTemplate = useMemo(() => {
    return letterTemplates.find((t) => t.type === selectedLetterType) || letterTemplates[0]
  }, [letterTemplates, selectedLetterType])

  // Computed live letter preview text
  const liveLetterPreview = useMemo(() => {
    let text = currentLetterTemplate.bodyTemplate
    text = text.replaceAll('{{employee_name}}', letterEmpName)
    text = text.replaceAll('{{employee_id}}', 'EMP-TEMP')
    text = text.replaceAll('{{designation}}', letterDesignation)
    text = text.replaceAll('{{department}}', letterDept)
    text = text.replaceAll('{{doj}}', letterDoj)
    text = text.replaceAll('{{ctc}}', letterCtc)
    text = text.replaceAll('{{location}}', letterLocation)
    text = text.replaceAll('{{manager_name}}', letterManager)
    text = text.replaceAll('{{last_working_day}}', letterLwd)
    text = text.replaceAll('{{grade}}', 'L3')
    text = text.replaceAll('{{probation_months}}', '3')
    text = text.replaceAll('{{previous_ctc}}', '14,00,000')
    text = text.replaceAll('{{new_ctc}}', letterCtc)
    text = text.replaceAll('{{hike_pct}}', '15')
    text = text.replaceAll('{{effective_date}}', letterDoj)
    text = text.replaceAll('{{performance_rating}}', 'Exceeds Expectations (4.5/5)')
    return text
  }, [
    currentLetterTemplate,
    letterEmpName,
    letterDesignation,
    letterDept,
    letterDoj,
    letterCtc,
    letterLocation,
    letterManager,
    letterLwd,
  ])

  // Handle letter generation
  const handleGenerateLetter = () => {
    const customVars: Record<string, string> = {
      '{{employee_name}}': letterEmpName,
      '{{employee_id}}': 'EMP-2026',
      '{{designation}}': letterDesignation,
      '{{department}}': letterDept,
      '{{doj}}': letterDoj,
      '{{ctc}}': letterCtc,
      '{{location}}': letterLocation,
      '{{manager_name}}': letterManager,
      '{{last_working_day}}': letterLwd,
      '{{grade}}': 'L3',
      '{{probation_months}}': '3',
      '{{previous_ctc}}': '14,00,000',
      '{{new_ctc}}': letterCtc,
      '{{hike_pct}}': '15',
      '{{effective_date}}': letterDoj,
      '{{performance_rating}}': 'Exceeds Expectations (4.5/5)',
    }

    const gen = generateEmployeeLetter(selectedLetterType, 'EMP-NEW', customVars)
    setPreviewLetterModal(gen)
  }

  // Handle Send Agreement submit
  const handleSendAgreementSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendAgreementToEmployee(selectedAgtTemplateId, sendAgtEmpId, sendAgtEmpName, sendAgtDept)
    setIsSendAgreementOpen(false)
  }

  // Handle Rehire Submission
  const handleProcessRehireSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rehireModalRecord || !newRehireEmpId) return
    processRehire(rehireModalRecord.formerEmployeeId, newRehireEmpId, rehireNotes)
    setRehireModalRecord(null)
    setNewRehireEmpId('')
    setRehireNotes('')
  }

  return (
    <FeatureGate feature="RESIGNATION">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                EMPLOYEE LIFECYCLE GOVERNANCE
              </span>
              <span className="text-xs text-slate-500">Day 1 to Full & Final</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Employee Lifecycle & Exit Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage onboarding workflows, agreement e-signatures, smart letter templates, resignation queues, exit clearances, FnF settlements, and rehire linking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSendAgreementOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Agreement
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Active Onboardings</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <FolderPlus className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.activeOnboardings}</div>
            <p className="text-xs text-slate-500 mt-1">New joiners completing checklist</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Pending E-Signatures</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <FileSignature className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600">{metrics.pendingAgreements}</div>
            <p className="text-xs text-slate-500 mt-1">NDAs & contracts awaiting signoff</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Resignations / Notice</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <UserMinus className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.activeResignations}</div>
            <p className="text-xs text-slate-500 mt-1">Under notice & clearance review</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">FnF Settlements</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{metrics.pendingFnF} Active</div>
            <p className="text-xs text-slate-500 mt-1">Calculated final settlement slips</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'onboarding'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            Onboarding Workflows
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600">
              {employeeOnboardings.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agreements')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'agreements'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileSignature className="w-4 h-4" />
            Agreements & E-Sign Tracker
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600">
              {employeeAgreements.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('letters')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'letters'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            Smart Letter Generator
          </button>

          <button
            onClick={() => setActiveTab('resignations')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'resignations'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserMinus className="w-4 h-4" />
            Resignation & Exit Queue
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              {resignations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('fnf')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fnf'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Exit Clearance & FnF Workbench
          </button>

          <button
            onClick={() => setActiveTab('rehire')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'rehire'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Rehire Alumni Flow
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ONBOARDING WORKFLOWS */}
        {/* ========================================================================= */}
        {activeTab === 'onboarding' && (
          <div className="space-y-6">
            {/* Checklist Templates Overview */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Configured Onboarding Checklist Templates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Role-specific automated checklists assigned on employee creation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {onboardingTemplates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{tmpl.name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                        {tmpl.targetProfile}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{tmpl.description}</p>
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <span>{tmpl.tasks.length} Automated Tasks</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">Default Matrix</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-Employee Onboarding Tracker */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Active New Joiner Onboarding Tracker
                  </h2>
                  <p className="text-xs text-slate-500">
                    Step-by-step document submission, IT hardware provisioning, bank setup, and orientation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {employeeOnboardings.map((eob) => {
                  const total = eob.tasks.length
                  const completed = eob.tasks.filter((t) => t.status === 'Completed' || t.status === 'Verified').length
                  const pct = Math.round((completed / total) * 100)

                  return (
                    <div
                      key={eob.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400/50 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={eob.employeeAvatar}
                            alt={eob.employeeName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {eob.employeeName}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">({eob.employeeId})</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  eob.status === 'Completed'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                                }`}
                              >
                                {eob.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {eob.designation} • {eob.department} • Joined {eob.doj}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {completed}/{total} Tasks Done
                            </span>
                            <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedOnboardingEmp(eob)}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg"
                          >
                            Review Checklist
                          </button>
                        </div>
                      </div>

                      {/* Tasks List Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {eob.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                              task.status === 'Completed' || task.status === 'Verified'
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                                : task.status === 'In Progress'
                                ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                                {task.title}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {task.category} • Assignee: {task.assignedTo}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                updateOnboardingTaskStatus(
                                  eob.employeeId,
                                  task.id,
                                  task.status === 'Completed' ? 'Pending' : 'Completed',
                                  'HR Operations'
                                )
                              }
                              className={`p-1 rounded flex-shrink-0 ${
                                task.status === 'Completed' || task.status === 'Verified'
                                  ? 'text-emerald-600 hover:text-emerald-800'
                                  : 'text-slate-400 hover:text-indigo-600'
                              }`}
                              title="Toggle completion status"
                            >
                              {task.status === 'Completed' || task.status === 'Verified' ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <CheckSquare className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AGREEMENTS & E-SIGN TRACKER */}
        {/* ========================================================================= */}
        {activeTab === 'agreements' && (
          <div className="space-y-6">
            {/* Agreement Templates Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {agreementTemplates.map((agt) => (
                <div
                  key={agt.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {agt.type}
                    </span>
                    <span className="text-xs text-slate-400">{agt.version}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{agt.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{agt.content}</p>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Target: {agt.mandatoryFor}</span>
                    <button
                      onClick={() => {
                        setSelectedAgtTemplateId(agt.id)
                        setIsSendAgreementOpen(true)
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Send to Emp
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* E-Signature Audit Tracker Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Employee Digital E-Signature Audit Log
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tamper-evident legal tracking with signing timestamps, client IP addresses, and digital signature records
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4">Agreement Document</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Sent Date</th>
                      <th className="py-3 px-4">Signed Date & IP</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employeeAgreements.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {row.agreementName}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={row.employeeAvatar}
                              alt={row.employeeName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-slate-800 dark:text-slate-200">{row.employeeName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{row.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.department}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{row.sentDate}</td>
                        <td className="py-3 px-4">
                          {row.signedDate ? (
                            <div>
                              <div className="font-semibold text-emerald-600">{row.signedDate}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{row.ipAddress}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Awaiting employee action</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 w-max ${
                              row.status === 'Signed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                            }`}
                          >
                            {row.status === 'Signed' ? (
                              <ShieldCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SMART LETTER GENERATOR */}
        {/* ========================================================================= */}
        {activeTab === 'letters' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Letter Configuration Form */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Template Engine
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Smart Letter Generator
                </h2>
                <p className="text-xs text-slate-500">
                  Select letter type and populate merge fields to generate formatted employment letters
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Letter Type *
                  </label>
                  <select
                    value={selectedLetterType}
                    onChange={(e) => setSelectedLetterType(e.target.value as LetterTemplate['type'])}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {letterTemplates.map((t) => (
                      <option key={t.id} value={t.type}>
                        {t.type} — {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      value={letterEmpName}
                      onChange={(e) => setLetterEmpName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      value={letterDesignation}
                      onChange={(e) => setLetterDesignation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      value={letterDept}
                      onChange={(e) => setLetterDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Annual CTC (INR) *
                    </label>
                    <input
                      type="text"
                      value={letterCtc}
                      onChange={(e) => setLetterCtc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Date of Joining / Effective *
                    </label>
                    <input
                      type="date"
                      value={letterDoj}
                      onChange={(e) => setLetterDoj(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Last Working Day (if exit)
                    </label>
                    <input
                      type="date"
                      value={letterLwd}
                      onChange={(e) => setLetterLwd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateLetter}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate & Issue Letter
                </button>
              </div>

              {/* Archive of Generated Letters */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Recently Issued Letters ({generatedLetters.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {generatedLetters.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => setPreviewLetterModal(l)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 border border-transparent transition-all"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{l.templateType}</div>
                        <div className="text-[11px] text-slate-400">
                          {l.employeeName} • {l.letterNumber}
                        </div>
                      </div>
                      <Eye className="w-4 h-4 text-slate-400 hover:text-indigo-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live Formatted Letter Preview */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 space-y-6">
              {/* Company Letterhead Mock */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    BS
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      BusinessSuit Enterprise Solutions Pvt. Ltd.
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      CIN: U72200KA2024PTC184200 • Tech Park Campus, Bangalore - 560103
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              {/* Letter Title Banner */}
              <div className="text-center py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  {currentLetterTemplate.title}
                </h4>
              </div>

              {/* Live Rendered Content */}
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-xs font-serif leading-relaxed text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
                {liveLetterPreview}
              </div>

              {/* Signatory Footer */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <div className="font-mono text-[11px] text-slate-400 mb-1">Digitally Signed by HR Operations</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">Authorized Human Resources Signatory</div>
                </div>
                <button
                  onClick={handleGenerateLetter}
                  className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold rounded-xl flex items-center gap-2 hover:bg-indigo-100"
                >
                  <Printer className="w-4 h-4" />
                  Print / Export PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: RESIGNATION & EXIT QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 'resignations' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Employee Resignation Pipeline
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track notice period duration, retention discussions, manager endorsements, and exit clearances
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {resignations.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400/50 transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-start gap-4">
                        <img
                          src={res.employeeAvatar}
                          alt={res.employeeName}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-500">{res.requestId}</span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                              {res.employeeName}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                res.status === 'Exit Clearance'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400'
                                  : res.status === 'Serving Notice'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400'
                                  : res.status === 'Pending Manager Review'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {res.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {res.designation} • {res.department} (Grade {res.employeeGrade}) • Notice Period: <strong>{res.noticePeriodDays} Days</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 lg:text-right">
                        <div>
                          <div className="text-xs text-slate-400">Calculated LWD</div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">
                            {res.calculatedLwd}
                          </div>
                        </div>
                        <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                          <div className="text-xs text-slate-400">Requested Early LWD</div>
                          <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                            {res.requestedLwd}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedResignation(res)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                        >
                          Review & Action
                        </button>
                      </div>
                    </div>

                    {/* Reason and Manager Note summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                          Stated Reason: {res.reasonCategory}
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">{res.reasonDetails}</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                          Manager Retention Note:
                        </span>
                        <p className="text-slate-600 dark:text-slate-400">
                          {res.managerRetentionNote || 'Pending manager 1-on-1 retention discussion.'}
                        </p>
                      </div>
                    </div>

                    {/* Embedded Approval Timeline */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                      <ApprovalTimeline steps={res.steps} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: EXIT CLEARANCE & FNF WORKBENCH */}
        {/* ========================================================================= */}
        {activeTab === 'fnf' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                    Full & Final Settlement Engine
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    Exit Clearance Matrix & Financial Settlement
                  </h2>
                  <p className="text-xs text-slate-500">
                    Reconcile department asset returns, loan recoveries, leave encashment, gratuity, and notice pay
                  </p>
                </div>
              </div>

              {/* Active Settlements Cards */}
              <div className="grid grid-cols-1 gap-6">
                {fnfSettlements.map((fnf) => {
                  const clearances = exitClearances[fnf.resignationId] || []

                  return (
                    <div
                      key={fnf.id}
                      className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 bg-slate-50/40 dark:bg-slate-800/30"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-slate-900 dark:text-white">
                              {fnf.employeeName}
                            </span>
                            <span className="text-xs font-mono text-slate-400">({fnf.employeeId})</span>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                              {fnf.paymentStatus}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {fnf.designation} • {fnf.department} • Last Working Day: <strong>{fnf.lastWorkingDay}</strong>
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block">Net Payable to Employee</span>
                          <span className="text-2xl font-bold text-emerald-600">
                            ₹{fnf.netPayableOrRecoverable.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Clearance Checklist Matrix */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Cross-Department Exit Clearance Status
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {clearances.map((c) => (
                            <div
                              key={c.id}
                              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white">{c.department}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    c.status === 'Cleared'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {c.status}
                                </span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-400 text-[11px]">{c.itemTitle}</p>
                              {c.deductionAmount > 0 && (
                                <div className="text-rose-600 font-bold">
                                  Deduction: ₹{c.deductionAmount.toLocaleString('en-IN')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* FnF Financial Breakdown Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        {/* Earnings & Credits */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                          <span className="font-bold text-emerald-600 block mb-2 uppercase tracking-wider text-[11px]">
                            Earnings & Payables (+)
                          </span>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Unpaid Salary ({fnf.unpaidSalaryDays} days)</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              ₹{fnf.unpaidSalaryAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Leave Encashment ({fnf.earnedLeaveBalance} EL days)</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              ₹{fnf.leaveEncashmentAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Gratuity (5+ yrs eligibility)</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              ₹{fnf.gratuityAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Variable Bonus / Incentive</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              ₹{fnf.variablePayOrBonus.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>Total Gross Earnings</span>
                            <span>₹{fnf.totalEarnings.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Recoveries & Deductions */}
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                          <span className="font-bold text-rose-600 block mb-2 uppercase tracking-wider text-[11px]">
                            Recoveries & Deductions (-)
                          </span>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Notice Shortfall ({fnf.noticeShortfallDays} days)</span>
                            <span className="font-semibold text-rose-600">
                              ₹{fnf.noticeRecoveryAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Loan / Salary Advance Balance</span>
                            <span className="font-semibold text-rose-600">
                              ₹{fnf.pendingLoanEmiRecovery.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Asset Damage / Unreturned Deductions</span>
                            <span className="font-semibold text-rose-600">
                              ₹{fnf.assetDamageOrLossDeduction.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Income Tax (TDS) on FnF</span>
                            <span className="font-semibold text-rose-600">
                              ₹{fnf.taxTdsDeduction.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                            <span>Total Deductions</span>
                            <span>₹{fnf.totalDeductions.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        {fnf.paymentStatus === 'Draft' && (
                          <button
                            onClick={() => approveFnFSettlement(fnf.id)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
                          >
                            Approve FnF for Payroll Disbursement
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedFnF(fnf)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print FnF Statement
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REHIRE ALUMNI FLOW */}
        {/* ========================================================================= */}
        {activeTab === 'rehire' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Alumni Rehire Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Re-link former employees, verify previous employment history & conduct, and carry over statutory UAN / PF details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rehireRecords.map((alumni) => (
                  <div
                    key={alumni.id}
                    className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {alumni.employeeName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          alumni.rehireEligibility === 'Eligible (Clean Record)'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {alumni.rehireEligibility}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div>
                        Prior Role: <strong>{alumni.previousDesignation}</strong> ({alumni.previousDepartment})
                      </div>
                      <div>
                        Tenure: <strong>{alumni.previousTenure}</strong> • Exit Reason: {alumni.exitReason}
                      </div>
                      <div className="font-mono">
                        Previous Emp ID: {alumni.formerEmployeeId} • UAN: {alumni.uanNumber}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-1">{alumni.notes}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      {alumni.linkedNewEmployeeId ? (
                        <span className="text-xs font-semibold text-emerald-600">
                          Rehired as {alumni.linkedNewEmployeeId} on {alumni.rehireDate}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setRehireModalRecord(alumni)
                            setNewRehireEmpId(`EMP-${Math.floor(120 + Math.random() * 50)}`)
                          }}
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Initiate Rehire
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: RESIGNATION REVIEW & HR APPROVAL */}
        {/* ========================================================================= */}
        {selectedResignation && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedResignation.employeeAvatar}
                    alt={selectedResignation.employeeName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Resignation Review — {selectedResignation.employeeName}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Request ID: {selectedResignation.requestId} • Applied on {selectedResignation.applyDate}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResignation(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 block">Stated Reason Category</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedResignation.reasonCategory}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Notice Period Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedResignation.noticePeriodDays} Days
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Calculated Standard LWD</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedResignation.calculatedLwd}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Requested Release Date</span>
                  <span className="font-bold text-purple-600">
                    {selectedResignation.requestedLwd}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Employee Reason & Handover Plan
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                  <p className="text-slate-700 dark:text-slate-300">{selectedResignation.reasonDetails}</p>
                  <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                    Handover: {selectedResignation.handoverPlan}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Approval Timeline
                </span>
                <ApprovalTimeline steps={selectedResignation.steps} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedResignation(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Close
                </button>
                {selectedResignation.status !== 'Exit Clearance' && selectedResignation.status !== 'Settled & Relieved' && (
                  <button
                    onClick={() => {
                      hrApproveResignation(selectedResignation.id, selectedResignation.requestedLwd)
                      calculateFnF(selectedResignation.id)
                      setSelectedResignation(null)
                    }}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                  >
                    Confirm LWD & Initiate Exit Clearances
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: DISPATCH AGREEMENT */}
        {/* ========================================================================= */}
        {isSendAgreementOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dispatch Agreement for E-Signature
                </h3>
                <button onClick={() => setIsSendAgreementOpen(false)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendAgreementSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Agreement Template *
                  </label>
                  <select
                    value={selectedAgtTemplateId}
                    onChange={(e) => setSelectedAgtTemplateId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {agreementTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    value={sendAgtEmpId}
                    onChange={(e) => setSendAgtEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Employee Name *
                  </label>
                  <input
                    type="text"
                    value={sendAgtEmpName}
                    onChange={(e) => setSendAgtEmpName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSendAgreementOpen(false)}
                    className="px-3 py-2 text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Send E-Sign Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: PROCESS REHIRE WIZARD */}
        {/* ========================================================================= */}
        {rehireModalRecord && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Rehire Linking Wizard
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rehire {rehireModalRecord.employeeName} (Former: {rehireModalRecord.formerEmployeeId})
                  </p>
                </div>
                <button onClick={() => setRehireModalRecord(null)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleProcessRehireSubmit} className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1 text-slate-600 dark:text-slate-400">
                  <div>Previous Designation: <strong>{rehireModalRecord.previousDesignation}</strong></div>
                  <div>Prior UAN: <strong>{rehireModalRecord.uanNumber}</strong> (will be retained)</div>
                  <div>Past Tenure: <strong>{rehireModalRecord.previousTenure}</strong></div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Assign New Employee ID *
                  </label>
                  <input
                    type="text"
                    value={newRehireEmpId}
                    onChange={(e) => setNewRehireEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Rehire Endorsement & Seniority Credit Notes
                  </label>
                  <textarea
                    rows={2}
                    value={rehireNotes}
                    onChange={(e) => setRehireNotes(e.target.value)}
                    placeholder="E.g., Prior tenure credited for gratuity calculations, clean exit verified."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRehireModalRecord(null)}
                    className="px-3 py-2 text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Confirm Rehire Link
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
