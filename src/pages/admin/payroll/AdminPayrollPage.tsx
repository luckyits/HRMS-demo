import React, { useState, useMemo } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  usePayroll,
  SalaryComponent,
  SalaryStructure,
  EmployeeSalaryRecord,
  PayrollInputItem,
  PayrollRun,
  StatutorySlabItem,
  IncentiveSlab,
  EmployeeIncentiveRecord,
  PayrollEmployeePayslip
} from '@/context/PayrollContext'
import { SensitiveField } from '@/components/common/SensitiveField'
import {
  Banknote,
  Calculator,
  Play,
  CheckCircle2,
  Lock,
  Download,
  AlertTriangle,
  TrendingUp,
  FileText,
  ShieldCheck,
  Percent,
  PlusCircle,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Info,
  RefreshCw,
  Search,
  Filter,
  FileSpreadsheet,
  CheckSquare,
  DollarSign,
  ChevronRight,
  Printer,
  XCircle,
  Send
} from 'lucide-react'

export const AdminPayrollPage: React.FC = () => {
  const {
    components,
    addComponent,
    updateComponent,
    evaluateFormula,
    structures,
    addStructure,
    employeeSalaries,
    reviseEmployeeSalary,
    payrollInputs,
    updatePayrollInput,
    payrollRuns,
    activeRun,
    setActiveRunId,
    startPayrollCalculation,
    approvePayrollRun,
    lockAndPublishPayrollRun,
    statutorySlabs,
    updateStatutorySlab,
    incentiveSlabs,
    employeeIncentives,
    calculateIncentive,
    generateBankFileContent,
  } = usePayroll()

  const currentRun = activeRun || payrollRuns[0] || {
    id: 'PR-2026-10',
    cycleMonth: 'October 2026',
    periodCode: '2026-10',
    status: 'Review & Variance' as const,
    totalEmployees: 3,
    totalGrossPayroll: 184500,
    totalDeductions: 18246,
    totalNetPayout: 166254,
    momVariancePct: 5.7,
    exceptionsCount: 1,
    payslips: [],
  }

  // Tab State
  const [activeTab, setActiveTab] = useState<
    'wizard' | 'components' | 'structures' | 'statutory' | 'incentives' | 'bank'
  >('wizard')

  // Run Payroll Wizard Step State
  const [wizardStep, setWizardStep] = useState<number>(3) // 1: Period, 2: Calculate, 3: Review, 4: Approve, 5: Lock
  const [selectedCycleMonth, setSelectedCycleMonth] = useState('October 2026')
  const [selectedPeriodCode, setSelectedPeriodCode] = useState('2026-10')
  const [isCalculating, setIsCalculating] = useState(false)

  // Formula Sandbox State
  const [sandboxExpr, setSandboxExpr] = useState('0.50 * BASIC')
  const [sandboxBasic, setSandboxBasic] = useState(30000)
  const [sandboxGross, setSandboxGross] = useState(60000)
  const [sandboxOtHours, setSandboxOtHours] = useState(10)
  const sandboxResult = useMemo(() => {
    return evaluateFormula(sandboxExpr, {
      BASIC: sandboxBasic,
      GROSS: sandboxGross,
      ot_hours: sandboxOtHours,
    })
  }, [sandboxExpr, sandboxBasic, sandboxGross, sandboxOtHours, evaluateFormula])

  // Revision Modal State
  const [selectedEmpForRevision, setSelectedEmpForRevision] = useState<EmployeeSalaryRecord | null>(null)
  const [revisedGross, setRevisedGross] = useState<number>(75000)
  const [revisedEffectiveDate, setRevisedEffectiveDate] = useState('2026-08-01') // retrospective 2 mos
  const [revisionReason, setRevisionReason] = useState('Annual Merit Performance Hike')

  // Add Component Modal State
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false)
  const [newCompName, setNewCompName] = useState('')
  const [newCompCode, setNewCompCode] = useState('')
  const [newCompType, setNewCompType] = useState<SalaryComponent['type']>('Earning')
  const [newCompCalc, setNewCompCalc] = useState<SalaryComponent['calculationType']>('Formula')
  const [newCompExpr, setNewCompExpr] = useState('0.10 * BASIC')
  const [newCompTaxable, setNewCompTaxable] = useState(true)

  // Payslip Detail Modal
  const [previewPayslip, setPreviewPayslip] = useState<PayrollEmployeePayslip | null>(null)

  // Trigger calculation wizard
  const handleStartCalculation = () => {
    setIsCalculating(true)
    setTimeout(() => {
      startPayrollCalculation(selectedCycleMonth, selectedPeriodCode)
      setIsCalculating(false)
      setWizardStep(3)
    }, 800)
  }

  // Handle Salary Revision Submit
  const handleSalaryRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmpForRevision) return

    reviseEmployeeSalary({
      employeeId: selectedEmpForRevision.employeeId,
      newMonthlyGross: revisedGross,
      effectiveFrom: revisedEffectiveDate,
      reason: revisionReason,
    })

    setSelectedEmpForRevision(null)
  }

  // Handle Add Component Submit
  const handleAddComponentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCompName.trim() || !newCompCode.trim()) return

    addComponent({
      name: newCompName,
      code: newCompCode.toUpperCase(),
      type: newCompType,
      calculationType: newCompCalc,
      formulaExpression: newCompExpr,
      isTaxable: newCompTaxable,
      isPfApplicable: false,
      isEsiApplicable: false,
      isActive: true,
      description: `${newCompName} custom component`,
    })

    setIsAddComponentOpen(false)
    setNewCompName('')
    setNewCompCode('')
  }

  // Handle Download Bank File
  const handleDownloadBankFile = () => {
    const content = generateBankFileContent(currentRun.id)
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `NEFT_PAYROLL_BATCH_${currentRun.periodCode}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <FeatureGate feature="PAYROLL">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Banknote className="w-3 h-3" />
                PAYROLL & STATUTORY ENGINE
              </span>
              <span className="text-xs text-slate-500">India Compliance (PF, ESI, PT, TDS)</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Payroll Processing Command Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Run multi-stage payroll cycles, configure custom component formulas, manage salary structures, compute retrospective arrears, and generate NEFT bank disbursement batches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadBankFile}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Bank File
            </button>
            <button
              onClick={() => {
                setActiveTab('wizard')
                setWizardStep(1)
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5" />
              Run Payroll Cycle
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Current Payroll Gross</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              <SensitiveField value={`₹${currentRun.totalGrossPayroll.toLocaleString('en-IN')}`} />
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">+{currentRun.momVariancePct}% MoM</span> vs previous cycle
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Total Statutory Deductions</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600">
              <SensitiveField value={`₹${currentRun.totalDeductions.toLocaleString('en-IN')}`} />
            </div>
            <p className="text-xs text-slate-500 mt-1">EPF, ESI, PT & Income Tax TDS</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Net Take-Home Payout</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              <SensitiveField value={`₹${currentRun.totalNetPayout.toLocaleString('en-IN')}`} />
            </div>
            <p className="text-xs text-slate-500 mt-1">Across {currentRun.totalEmployees} employees & retainers</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Cycle Status</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{currentRun.status}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Cycle: <strong>{currentRun.cycleMonth}</strong></p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('wizard')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'wizard'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Play className="w-4 h-4" />
            Run Payroll Wizard (5-Stage)
          </button>

          <button
            onClick={() => setActiveTab('components')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'components'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Salary Components & Formula Editor
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600">
              {components.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('structures')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'structures'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            Salary Structures & Arrears
          </button>

          <button
            onClick={() => setActiveTab('statutory')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'statutory'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Statutory Compliance Slabs
          </button>

          <button
            onClick={() => setActiveTab('incentives')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'incentives'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Incentive Engine
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'bank'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Download className="w-4 h-4" />
            Bank File & NEFT Payouts
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: RUN PAYROLL 5-STEP WIZARD */}
        {/* ========================================================================= */}
        {activeTab === 'wizard' && (
          <div className="space-y-6">
            {/* Step Progress Stepper */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div
                  onClick={() => setWizardStep(1)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    wizardStep === 1
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase opacity-70">Step 1</div>
                  <div className="font-semibold mt-0.5">Select Period</div>
                </div>

                <div
                  onClick={() => setWizardStep(2)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    wizardStep === 2
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase opacity-70">Step 2</div>
                  <div className="font-semibold mt-0.5">Inputs & Compute</div>
                </div>

                <div
                  onClick={() => setWizardStep(3)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    wizardStep === 3
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase opacity-70">Step 3</div>
                  <div className="font-semibold mt-0.5">Variance & Review</div>
                </div>

                <div
                  onClick={() => setWizardStep(4)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    wizardStep === 4
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase opacity-70">Step 4</div>
                  <div className="font-semibold mt-0.5">Approval & Publish</div>
                </div>

                <div
                  onClick={() => setWizardStep(5)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    wizardStep === 5
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <div className="font-mono text-[10px] uppercase opacity-70">Step 5</div>
                  <div className="font-semibold mt-0.5">Lock & Bank Batch</div>
                </div>
              </div>
            </div>

            {/* STEP 1: SELECT PERIOD */}
            {wizardStep === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 max-w-xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Step 1: Select Payroll Month & Entity
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Payroll Cycle Month *
                    </label>
                    <select
                      value={selectedCycleMonth}
                      onChange={(e) => {
                        setSelectedCycleMonth(e.target.value)
                        setSelectedPeriodCode(e.target.value === 'October 2026' ? '2026-10' : '2026-11')
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    >
                      <option value="October 2026">October 2026 (Active Cycle)</option>
                      <option value="November 2026">November 2026 (Upcoming Cycle)</option>
                      <option value="September 2026">September 2026 (Locked)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Operating Entity / Branch *
                    </label>
                    <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold">
                      <option value="ALL">All Entities (Corporate + Plant + Retainers)</option>
                      <option value="HQ">Bangalore Tech Park HQ</option>
                      <option value="PUNE">Pune Industrial Manufacturing Plant</option>
                    </select>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      <span>Continue to Inputs & Compute</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: INPUTS & RECONCILIATION */}
            {wizardStep === 2 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Step 2: Payroll Inputs Reconciliation ({selectedCycleMonth})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Auto-synced LOP days from Attendance Register, Overtime hours, Incentives, and Loan recoveries
                    </p>
                  </div>
                  <button
                    onClick={handleStartCalculation}
                    disabled={isCalculating}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                    <span>{isCalculating ? 'Computing Payroll...' : 'Execute Calculation Engine'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Payment Mode</th>
                        <th className="py-3 px-4">LOP Days</th>
                        <th className="py-3 px-4">Payable Days</th>
                        <th className="py-3 px-4">OT Hours / Pay</th>
                        <th className="py-3 px-4">Incentives</th>
                        <th className="py-3 px-4">Reimbursements</th>
                        <th className="py-3 px-4">Loan Recovery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {payrollInputs.map((inp) => (
                        <tr key={inp.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {inp.employeeName}
                            <span className="block text-[10px] text-slate-400 font-mono">{inp.employeeId}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{inp.paymentMode}</td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min={0}
                              max={31}
                              value={inp.lopDays}
                              onChange={(e) =>
                                updatePayrollInput(inp.employeeId, { lopDays: Number(e.target.value) })
                              }
                              className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center font-bold"
                            />
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {inp.totalWorkingDays - inp.lopDays}/{inp.totalWorkingDays}
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-600">
                            {inp.overtimeHours} hrs (₹{inp.overtimeAmount})
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-600">
                            ₹{inp.incentiveCommission.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                            ₹{inp.claimsReimbursements.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-mono text-rose-600">
                            ₹{(inp.loanEmiRecovery || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 3: VARIANCE REVIEW & EXCEPTION ANALYSIS */}
            {wizardStep === 3 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                      Step 3: Variance & Exceptions Review
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      Payroll Register Summary — {currentRun.cycleMonth}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Total Gross: <strong>₹{currentRun.totalGrossPayroll.toLocaleString('en-IN')}</strong> • Net Payout: <strong>₹{currentRun.totalNetPayout.toLocaleString('en-IN')}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setWizardStep(4)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                    >
                      <span>Proceed to Approval</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exception Alert Banner */}
                {currentRun.exceptionsCount > 0 && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>
                        <strong>{currentRun.exceptionsCount} Employee(s)</strong> have pro-rata Loss of Pay (LOP) attendance deductions applied.
                      </span>
                    </div>
                    <span className="font-semibold underline cursor-pointer">View Details</span>
                  </div>
                )}

                {/* Payslips Grid Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Payment Mode</th>
                        <th className="py-3 px-4">Paid Days</th>
                        <th className="py-3 px-4">Gross Earnings</th>
                        <th className="py-3 px-4">Total Deductions</th>
                        <th className="py-3 px-4">Net Salary</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentRun.payslips.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{p.employeeName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{p.employeeId} • {p.designation}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{p.paymentMode}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold">{p.paidDays}/{p.totalWorkingDays}</span>
                            {p.lopDays > 0 && (
                              <span className="text-rose-600 text-[10px] block">(-{p.lopDays} LOP)</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            <SensitiveField value={`₹${p.grossEarnings.toLocaleString('en-IN')}`} />
                          </td>
                          <td className="py-3 px-4 font-mono text-rose-600 font-semibold">
                            <SensitiveField value={`₹${p.totalDeductions.toLocaleString('en-IN')}`} />
                          </td>
                          <td className="py-3 px-4 font-mono text-emerald-600 font-bold text-sm">
                            <SensitiveField value={`₹${p.netSalary.toLocaleString('en-IN')}`} />
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.status === 'Published'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.status === 'Approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setPreviewPayslip(p)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold"
                            >
                              View Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 4: APPROVAL & PUBLISH */}
            {wizardStep === 4 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4 max-w-2xl">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Step 4: Management & Finance Signoff
                </h3>
                <p className="text-xs text-slate-500">
                  Authorizing this payroll run will approve statutory remittances and permit payslip generation for employee self-service.
                </p>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Net Disbursement</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{currentRun.totalNetPayout.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Statutory Tax & PF Remittance</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{currentRun.totalDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    onClick={() => approvePayrollRun(currentRun.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Payroll Cycle
                  </button>
                  <button
                    onClick={() => setWizardStep(5)}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <span>Proceed to Lock & Bank Payout</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: LOCK & BANK BATCH GENERATION */}
            {wizardStep === 5 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Step 5: Lock Payroll Cycle & Generate Bank NEFT File
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Once locked, no further adjustments can be made to this cycle. Any subsequent attendance or salary revisions will automatically carry forward to next month's arrears ledger.
                  </p>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs text-emerald-900 dark:text-emerald-200">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Disbursement Readiness Verified</span>
                  </div>
                  <p>
                    All {currentRun.totalEmployees} employee bank account numbers and IFSC codes have been validated. Batch upload format complies with standard HDFC/ICICI Corporate Banking NEFT formats.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {currentRun.status !== 'Locked & Published' ? (
                    <button
                      onClick={() => lockAndPublishPayrollRun(currentRun.id)}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      Lock Cycle & Publish Payslips
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Cycle Locked on {currentRun.lockedAt}
                    </span>
                  )}

                  <button
                    onClick={handleDownloadBankFile}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    Download Bulk NEFT .CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SALARY COMPONENTS & FORMULA EDITOR */}
        {/* ========================================================================= */}
        {activeTab === 'components' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Components Table */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Salary Components Master
                  </h3>
                  <p className="text-xs text-slate-500">
                    Earnings, statutory contributions, and formula-driven deductions
                  </p>
                </div>
                <button
                  onClick={() => setIsAddComponentOpen(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Add Component
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-2.5 px-3">Code</th>
                      <th className="py-2.5 px-3">Component Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Formula / Value</th>
                      <th className="py-2.5 px-3">Taxable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {components.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {c.code}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{c.name}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              c.type === 'Earning'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {c.formulaExpression || c.calculationType}
                        </td>
                        <td className="py-2.5 px-3">
                          {c.isTaxable ? (
                            <span className="text-emerald-600 font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-400">Exempt</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Interactive Formula Editor Sandbox */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Developer Sandbox
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Formula Evaluator & Tester
                </h3>
                <p className="text-xs text-slate-500">
                  Write and simulate dynamic compensation math (e.g. HRA, OT, bonus multipliers)
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Formula Expression *
                  </label>
                  <input
                    type="text"
                    value={sandboxExpr}
                    onChange={(e) => setSandboxExpr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    Available Variables: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">BASIC</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">GROSS</code>, <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ot_hours</code>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Test Basic (₹)
                    </label>
                    <input
                      type="number"
                      value={sandboxBasic}
                      onChange={(e) => setSandboxBasic(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Test Gross (₹)
                    </label>
                    <input
                      type="number"
                      value={sandboxGross}
                      onChange={(e) => setSandboxGross(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      OT Hours
                    </label>
                    <input
                      type="number"
                      value={sandboxOtHours}
                      onChange={(e) => setSandboxOtHours(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Evaluated Output */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-semibold block">
                      Evaluated Output
                    </span>
                    <span className="text-xl font-bold text-indigo-950 dark:text-white font-mono">
                      ₹{sandboxResult.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SALARY STRUCTURES & REVISIONS WITH ARREARS */}
        {/* ========================================================================= */}
        {activeTab === 'structures' && (
          <div className="space-y-6">
            {/* Grade-wise Salary Structures Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {structures.map((s) => (
                <div
                  key={s.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {s.grade}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ₹{s.baseMonthlyGross.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</h4>
                  <p className="text-xs text-slate-500">{s.description}</p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 space-y-1">
                    <div>Payment Mode: <strong className="text-slate-700 dark:text-slate-300">{s.paymentMode}</strong></div>
                    <div>Components: {s.items.length} Elements Configured</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Employee Salary Revision Workbench */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Employee Salary Master & Retroactive Arrears
                  </h3>
                  <p className="text-xs text-slate-500">
                    Apply effective-dated salary hikes; retroactive increments automatically calculate past month arrears
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Payment Structure</th>
                      <th className="py-3 px-4">Monthly Gross</th>
                      <th className="py-3 px-4">Annual CTC</th>
                      <th className="py-3 px-4">Effective Date</th>
                      <th className="py-3 px-4">Arrears Due</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employeeSalaries.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{emp.employeeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{emp.employeeId} • {emp.designation}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{emp.structureName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <SensitiveField value={`₹${emp.monthlyGross.toLocaleString('en-IN')}`} />
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                          <SensitiveField value={`₹${emp.annualCtc.toLocaleString('en-IN')}`} />
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{emp.effectiveFrom}</td>
                        <td className="py-3 px-4">
                          {emp.arrearsEligible ? (
                            <span className="font-bold text-emerald-600">
                              +₹{emp.calculatedArrearsAmount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-slate-400">₹0</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedEmpForRevision(emp)
                              setRevisedGross(emp.monthlyGross + 10000)
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg"
                          >
                            Revise Salary
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

        {/* ========================================================================= */}
        {/* TAB 4: STATUTORY COMPLIANCE SLABS */}
        {/* ========================================================================= */}
        {activeTab === 'statutory' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Statutory Compliance Slabs & Statutory Rates
              </h3>
              <p className="text-xs text-slate-500">
                Government statutory definitions for Provident Fund, ESI, Professional Tax, TDS, Gratuity, and Bonus
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-4">Statutory Head</th>
                    <th className="py-3 px-4">Employee Contribution</th>
                    <th className="py-3 px-4">Employer Contribution</th>
                    <th className="py-3 px-4">Wage Ceiling</th>
                    <th className="py-3 px-4">Effective From</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {statutorySlabs.map((slab) => (
                    <tr key={slab.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{slab.statutoryName}</div>
                        <div className="text-[10px] text-slate-400">{slab.description}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-rose-600">{slab.employeeRate}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {slab.employerRate}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{slab.wageCeiling}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{slab.effectiveDate}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {slab.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INCENTIVE & COMMISSION ENGINE */}
        {/* ========================================================================= */}
        {activeTab === 'incentives' && (
          <div className="space-y-6">
            {/* Slab Multipliers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {incentiveSlabs.map((slab) => (
                <div
                  key={slab.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {slab.commissionPct}% Commission
                    </span>
                    <span className="text-xs text-slate-400">
                      Quota: {slab.targetAchievementMinPct}% - {slab.targetAchievementMaxPct}%
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{slab.schemeName}</h4>
                  <p className="text-xs text-slate-500">{slab.description}</p>
                </div>
              ))}
            </div>

            {/* Target vs Achievement Ledger */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Sales Target vs Actual Achievement Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculated commissions are automatically routed into the employee's payroll run
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Sales Target</th>
                      <th className="py-3 px-4">Achieved Volume</th>
                      <th className="py-3 px-4">Achievement %</th>
                      <th className="py-3 px-4">Computed Incentive</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {employeeIncentives.map((inc) => (
                      <tr key={inc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {inc.employeeName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{inc.period}</td>
                        <td className="py-3 px-4 font-mono">₹{inc.salesTarget.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          ₹{inc.actualSalesAchieved.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">{inc.achievementPct}%</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                          ₹{inc.calculatedCommission.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            {inc.status}
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
        {/* TAB 6: BANK DISBURSEMENT & NEFT PAYOUTS */}
        {/* ========================================================================= */}
        {activeTab === 'bank' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bank Batch Disbursement Workbench
                </h3>
                <p className="text-xs text-slate-500">
                  Generate standardized bulk upload files for corporate banking portals (HDFC, ICICI, SBI)
                </p>
              </div>
              <button
                onClick={handleDownloadBankFile}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Download NEFT File (.csv)
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Simulated NEFT Raw Batch File Preview:
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto">
                {generateBankFileContent(currentRun.id)}
              </pre>
            </div>
          </div>
        )}

        {/* MODAL: SALARY REVISION WITH ARREARS */}
        {selectedEmpForRevision && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Revise Salary — {selectedEmpForRevision.employeeName}
                </h3>
                <button onClick={() => setSelectedEmpForRevision(null)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSalaryRevisionSubmit} className="space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Current Monthly Gross
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`₹${selectedEmpForRevision.monthlyGross.toLocaleString('en-IN')}`}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Revised Monthly Gross (₹) *
                  </label>
                  <input
                    type="number"
                    step={1000}
                    value={revisedGross}
                    onChange={(e) => setRevisedGross(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Effective From Date (Supports Retrospective Dating) *
                  </label>
                  <input
                    type="date"
                    value={revisedEffectiveDate}
                    onChange={(e) => setRevisedEffectiveDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <span className="text-[10px] text-emerald-600 mt-1 block">
                    Selecting a past date automatically computes arrears into the upcoming payroll cycle.
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Reason / Justification *
                  </label>
                  <input
                    type="text"
                    value={revisionReason}
                    onChange={(e) => setRevisionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedEmpForRevision(null)}
                    className="px-3 py-2 text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                  >
                    Save & Compute Arrears
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: PAYSLIP PREVIEW */}
        {previewPayslip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 text-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Salary Statement — {previewPayslip.employeeName}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Payslip #: {previewPayslip.payslipNumber} • Month: {previewPayslip.month}
                  </p>
                </div>
                <button onClick={() => setPreviewPayslip(null)} className="text-slate-400 font-bold">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                  <span className="font-bold text-emerald-600 block uppercase">Earnings</span>
                  <div className="flex justify-between"><span>Basic</span><span>₹{previewPayslip.basic.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>HRA</span><span>₹{previewPayslip.hra.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>Special Allw</span><span>₹{previewPayslip.specialAllowance.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>Overtime Pay</span><span>₹{previewPayslip.overtimePay.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>Incentives</span><span>₹{previewPayslip.incentives.toLocaleString('en-IN')}</span></div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Earnings</span><span>₹{previewPayslip.grossEarnings.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
                  <span className="font-bold text-rose-600 block uppercase">Deductions</span>
                  <div className="flex justify-between"><span>Provident Fund (EPF)</span><span>₹{previewPayslip.providentFund.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>ESI Contribution</span><span>₹{previewPayslip.employeeStateInsurance.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>Professional Tax</span><span>₹{previewPayslip.professionalTax.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>TDS Income Tax</span><span>₹{previewPayslip.taxDeductedAtSource.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>Loan EMI Recovery</span><span>₹{previewPayslip.loanEmiRecovery.toLocaleString('en-IN')}</span></div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Deductions</span><span>₹{previewPayslip.totalDeductions.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-between">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">Net Take Home Pay</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  ₹{previewPayslip.netSalary.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPreviewPayslip(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
