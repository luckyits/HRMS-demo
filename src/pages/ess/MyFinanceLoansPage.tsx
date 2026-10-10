import React, { useState, useMemo } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import { useExpenseFinance, LoanApplication, LoanType } from '@/context/ExpenseFinanceContext'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import {
  Banknote,
  Calculator,
  PlusCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  Info,
  ShieldCheck,
  Percent,
  Layers,
  ArrowUpRight,
  HelpCircle,
  FileText,
  DollarSign
} from 'lucide-react'

export const MyFinanceLoansPage: React.FC = () => {
  const { loanTypes, loans, applyForLoan, calculateEmi, generateSchedule } = useExpenseFinance()

  // Current employee mock context (Priya Sharma - Grade L2 / 18 months service)
  const currentEmployee = {
    id: 'EMP-104',
    name: 'Priya Sharma',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    grade: 'L2',
    department: 'Engineering',
    serviceMonths: 18,
    monthlySalary: 65000,
  }

  // Filter loans for this employee
  const myLoans = useMemo(() => {
    return loans.filter((l) => l.employeeId === currentEmployee.id)
  }, [loans, currentEmployee.id])

  // Active or approved loan
  const activeLoan = useMemo(() => {
    return myLoans.find((l) => l.status === 'Active / Disbursing')
  }, [myLoans])

  // Aggregate stats
  const stats = useMemo(() => {
    let totalOutstanding = 0
    let upcomingEmi = 0
    let totalBorrowed = 0
    let activeCount = 0

    myLoans.forEach((loan) => {
      if (loan.status === 'Active / Disbursing') {
        activeCount++
        totalBorrowed += loan.principalAmount
        const pendingInstallments = loan.recoverySchedule.filter((s) => s.status !== 'Recovered')
        totalOutstanding += pendingInstallments.reduce((acc, curr) => acc + curr.emiAmount, 0)
        
        // Find next due EMI
        const nextInstallment = loan.recoverySchedule.find((s) => s.status === 'Pending')
        if (nextInstallment) {
          upcomingEmi += nextInstallment.emiAmount
        }
      }
    })

    return {
      totalOutstanding,
      upcomingEmi,
      totalBorrowed,
      activeCount,
    }
  }, [myLoans])

  // UI state
  const [activeTab, setActiveTab] = useState<'my_loans' | 'calculator' | 'schedule'>('my_loans')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [selectedLoanDetail, setSelectedLoanDetail] = useState<LoanApplication | null>(null)

  // Loan Application Form State
  const [selectedTypeId, setSelectedTypeId] = useState<string>(loanTypes[0]?.id || '')
  const [requestedAmount, setRequestedAmount] = useState<number>(30000)
  const [requestedTenure, setRequestedTenure] = useState<number>(6)
  const [loanReason, setLoanReason] = useState<string>('')
  const [formError, setFormError] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  // Calculator Form State (Standalone Tab)
  const [calcPrincipal, setCalcPrincipal] = useState<number>(50000)
  const [calcRate, setCalcRate] = useState<number>(2.5)
  const [calcTenure, setCalcTenure] = useState<number>(12)

  // Active Loan Scheme for modal
  const activeScheme = useMemo(() => {
    return loanTypes.find((lt) => lt.id === selectedTypeId) || loanTypes[0]
  }, [loanTypes, selectedTypeId])

  // Service months eligibility check
  const isEligible = useMemo(() => {
    if (!activeScheme) return true
    return currentEmployee.serviceMonths >= activeScheme.minServiceMonths
  }, [activeScheme, currentEmployee.serviceMonths])

  // Modal EMI preview
  const modalEmiCalc = useMemo(() => {
    if (!activeScheme) return { emi: 0, totalPayment: 0, totalInterest: 0 }
    return calculateEmi(requestedAmount, activeScheme.interestRate, requestedTenure)
  }, [requestedAmount, activeScheme, requestedTenure, calculateEmi])

  // Standalone Calculator output
  const standaloneEmiCalc = useMemo(() => {
    return calculateEmi(calcPrincipal, calcRate, calcTenure)
  }, [calcPrincipal, calcRate, calcTenure, calculateEmi])

  const standaloneSchedule = useMemo(() => {
    return generateSchedule(calcPrincipal, calcRate, calcTenure)
  }, [calcPrincipal, calcRate, calcTenure, generateSchedule])

  // Handle open apply modal
  const handleOpenApply = (typeId?: string) => {
    const targetType = typeId ? loanTypes.find((t) => t.id === typeId) : loanTypes[0]
    if (targetType) {
      setSelectedTypeId(targetType.id)
      setRequestedAmount(Math.min(30000, targetType.maxAmount))
      setRequestedTenure(Math.min(6, targetType.maxTenureMonths))
    }
    setLoanReason('')
    setFormError(null)
    setIsApplyModalOpen(true)
  }

  // Handle submit loan application
  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeScheme) return

    if (!loanReason.trim()) {
      setFormError('Please enter a valid reason / justification for the advance or loan.')
      return
    }

    if (requestedAmount > activeScheme.maxAmount) {
      setFormError(`Requested amount exceeds maximum limit of ₹${activeScheme.maxAmount.toLocaleString('en-IN')}`)
      return
    }

    if (requestedAmount <= 0) {
      setFormError('Requested amount must be greater than 0.')
      return
    }

    if (requestedTenure > activeScheme.maxTenureMonths || requestedTenure < 1) {
      setFormError(`Tenure must be between 1 and ${activeScheme.maxTenureMonths} months.`)
      return
    }

    applyForLoan({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      employeeGrade: currentEmployee.grade,
      department: currentEmployee.department,
      loanTypeId: activeScheme.id,
      loanTypeName: activeScheme.name,
      principalAmount: requestedAmount,
      interestRate: activeScheme.interestRate,
      tenureMonths: requestedTenure,
      monthlyEmi: modalEmiCalc.emi,
      totalRepayment: modalEmiCalc.totalPayment,
      serviceMonths: currentEmployee.serviceMonths,
      isEligible: isEligible,
      reason: loanReason,
    })

    setIsApplyModalOpen(false)
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 5000)
  }

  return (
    <FeatureGate feature="FINANCE">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Banknote className="w-3 h-3" />
                FINANCE ESS PORTAL
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Service Tenure: <strong>{currentEmployee.serviceMonths} Months</strong>
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Salary Advances & Loans
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Apply for zero-interest salary advances, emergency loans, calculate EMI deductions, and monitor recovery schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenApply()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Apply for Loan / Advance
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {showSuccessToast && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  Loan Application Submitted Successfully!
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Routed via standard 3-tier workflow: <strong>Manager → HR → Finance Head</strong>. Track status in real-time below.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-medium px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Outstanding Balance
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{stats.totalOutstanding.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium">{stats.activeCount} Active</span> scheme(s) undergoing recovery
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Next Monthly Deduction
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{stats.upcomingEmi.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scheduled for next monthly payroll cycle
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Availed To Date
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              ₹{stats.totalBorrowed.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cumulative company advances availed
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Loan Eligibility
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>Eligible</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Max limit: <strong>₹1,50,000</strong> ({currentEmployee.serviceMonths}m tenure)
            </div>
          </div>
        </div>

        {/* Available Loan Schemes Showcase Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Company Welfare Benefit
              </span>
              <h2 className="text-xl font-bold mt-2">Available Financial Assistance Schemes</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Eligible employees can avail interest-free salary advances and subsidized company loans. 
                Deductions are smoothly automated through your monthly payroll run.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {loanTypes.map((type) => {
                const eligible = currentEmployee.serviceMonths >= type.minServiceMonths
                return (
                  <div
                    key={type.id}
                    className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl border border-white/10 hover:border-emerald-400/50 transition-all cursor-pointer group"
                    onClick={() => handleOpenApply(type.id)}
                  >
                    <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                      <span>{type.interestRate === 0 ? '0% Interest' : `${type.interestRate}% Interest`}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <div className="text-sm font-bold text-white truncate">{type.name}</div>
                    <div className="text-xs text-slate-300 mt-1">
                      Up to ₹{(type.maxAmount / 1000).toFixed(0)}k • {type.maxTenureMonths}m tenure
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                      <span className={eligible ? 'text-emerald-400' : 'text-amber-400'}>
                        {eligible ? 'Eligible' : `Min ${type.minServiceMonths}m req.`}
                      </span>
                      <span className="text-emerald-300 font-medium group-hover:underline">Apply</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('my_loans')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'my_loans'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Banknote className="w-4 h-4" />
            My Loans & Advances
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {myLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Active Recovery Schedule (EMI Ledger)
            {activeLoan && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Interactive EMI Calculator & Simulator
          </button>
        </div>

        {/* TAB 1: MY LOANS & APPLICATIONS */}
        {activeTab === 'my_loans' && (
          <div className="space-y-4">
            {myLoans.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-4">
                  <Banknote className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  No Loan or Advance Applications Found
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6">
                  You haven't requested any salary advance or company loan yet. You can apply anytime subject to policy limits.
                </p>
                <button
                  onClick={() => handleOpenApply()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Apply for Salary Advance
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myLoans.map((loan) => {
                  const recoveredCount = loan.recoverySchedule.filter((s) => s.status === 'Recovered').length
                  const progressPct = loan.tenureMonths > 0 ? (recoveredCount / loan.tenureMonths) * 100 : 0
                  const remainingBalance = loan.recoverySchedule
                    .filter((s) => s.status !== 'Recovered')
                    .reduce((acc, curr) => acc + curr.emiAmount, 0)

                  return (
                    <div
                      key={loan.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                            <Banknote className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                                {loan.applicationNumber}
                              </span>
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {loan.loanTypeName}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                  loan.status === 'Active / Disbursing'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : loan.status === 'Pending Approval'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                    : loan.status === 'Completed'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                {loan.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Applied on {loan.submittedAt} • Purpose: <span className="text-slate-700 dark:text-slate-300 font-medium">"{loan.reason}"</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 lg:text-right">
                          <div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">Principal Availed</div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                              ₹{loan.principalAmount.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div className="border-l border-slate-200 dark:border-slate-800 pl-4">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Monthly EMI</div>
                            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              ₹{loan.monthlyEmi.toLocaleString('en-IN')}
                              <span className="text-xs font-normal text-slate-400">/mo</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedLoanDetail(loan)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Repayment Progress for active/completed loans */}
                      {loan.status === 'Active / Disbursing' && (
                        <div className="mt-4 pt-2">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                              Repayment Progress ({recoveredCount} of {loan.tenureMonths} EMIs Cleared)
                            </span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                              ₹{(loan.totalRepayment - remainingBalance).toLocaleString('en-IN')} / ₹{loan.totalRepayment.toLocaleString('en-IN')} ({progressPct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Approval Timeline Preview */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Approval Route (Manager → HR → Finance Head)
                        </div>
                        <ApprovalTimeline steps={loan.steps} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE RECOVERY SCHEDULE (EMI TABLE) */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            {!activeLoan ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Active Recovery Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  You do not have any currently active loan undergoing monthly payroll deductions.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Active Amortization Schedule
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeLoan.loanTypeName} — {activeLoan.applicationNumber}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Principal: <strong>₹{activeLoan.principalAmount.toLocaleString('en-IN')}</strong> • Interest Rate: <strong>{activeLoan.interestRate}%</strong> • Tenure: <strong>{activeLoan.tenureMonths} Months</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-right">
                      <div className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">Monthly EMI</div>
                      <div className="text-base font-bold text-emerald-900 dark:text-emerald-200">₹{activeLoan.monthlyEmi.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                        <th className="py-3 px-4"># Inst.</th>
                        <th className="py-3 px-4">Due Date</th>
                        <th className="py-3 px-4">EMI Amount</th>
                        <th className="py-3 px-4">Principal Part</th>
                        <th className="py-3 px-4">Interest Part</th>
                        <th className="py-3 px-4">Balance Remaining</th>
                        <th className="py-3 px-4">Deduction Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {activeLoan.recoverySchedule.map((row) => (
                        <tr
                          key={row.installmentNo}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                            row.status === 'Pending' ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                            #{row.installmentNo}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                            {row.dueDate}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            ₹{row.emiAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            ₹{row.principalComponent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                            ₹{row.interestComponent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                            ₹{row.balanceAfter.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1 w-max ${
                                row.status === 'Recovered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                                  : row.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {row.status === 'Recovered' && <CheckCircle2 className="w-3 h-3" />}
                              {row.status === 'Pending' && <Clock className="w-3 h-3" />}
                              {row.status === 'Recovered' ? 'Deducted (Payroll)' : row.status === 'Pending' ? 'Next Due' : 'Upcoming'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STANDALONE EMI CALCULATOR & SIMULATOR */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Interactive Simulator
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  Loan EMI Calculator
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Adjust principal amount, annual interest rate, and repayment tenure to simulate your monthly payroll deduction.
                </p>
              </div>

              {/* Principal Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Loan Amount (Principal)
                  </label>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    ₹{calcPrincipal.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={200000}
                  step={5000}
                  value={calcPrincipal}
                  onChange={(e) => setCalcPrincipal(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>₹5,000</span>
                  <span>₹1,00,000</span>
                  <span>₹2,00,000</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Annual Interest Rate (%)
                  </label>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    {calcRate}% p.a.
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={calcRate}
                  onChange={(e) => setCalcRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>0% (Advance)</span>
                  <span>2.5% (Company Subsidized)</span>
                  <span>12%</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Repayment Tenure (Months)
                  </label>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                    {calcTenure} Months
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={36}
                  step={1}
                  value={calcTenure}
                  onChange={(e) => setCalcTenure(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>1 Month</span>
                  <span>12 Months (1 yr)</span>
                  <span>36 Months (3 yrs)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                  Quick Presets by Company Scheme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {loanTypes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setCalcPrincipal(Math.min(30000, t.maxAmount))
                        setCalcRate(t.interestRate)
                        setCalcTenure(Math.min(6, t.maxTenureMonths))
                      }}
                      className="p-2 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs bg-slate-50 dark:bg-slate-800 transition-all"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{t.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.interestRate}% • Max {t.maxTenureMonths}m</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenApply()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Apply With This Configuration
              </button>
            </div>

            {/* Calculator Results & Amortization Table */}
            <div className="lg:col-span-7 space-y-6">
              {/* Summary Highlights */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-6 shadow-md">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-xs text-emerald-200 font-medium">Monthly Payroll EMI</span>
                    <div className="text-2xl font-extrabold mt-1">
                      ₹{standaloneEmiCalc.emi.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-emerald-100">Deducted each salary cycle</span>
                  </div>

                  <div>
                    <span className="text-xs text-emerald-200 font-medium">Total Interest Payable</span>
                    <div className="text-2xl font-extrabold mt-1">
                      ₹{standaloneEmiCalc.totalInterest.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-emerald-100">
                      {calcRate === 0 ? 'Zero interest advantage' : `At ${calcRate}% flat`}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-emerald-200 font-medium">Total Amount Repaid</span>
                    <div className="text-2xl font-extrabold mt-1">
                      ₹{standaloneEmiCalc.totalPayment.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-emerald-100">Across {calcTenure} installments</span>
                  </div>
                </div>
              </div>

              {/* Projected Amortization Schedule Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Projected Month-by-Month Amortization
                  </h3>
                  <span className="text-xs text-slate-400">
                    First deduction in next active payroll run
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">EMI Amount</th>
                        <th className="py-2.5 px-3">Principal</th>
                        <th className="py-2.5 px-3">Interest</th>
                        <th className="py-2.5 px-3">Closing Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {standaloneSchedule.map((row) => (
                        <tr key={row.installmentNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono font-bold text-slate-500">#{row.installmentNo}</td>
                          <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.dueDate}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            ₹{row.emiAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            ₹{row.principalComponent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            ₹{row.interestComponent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-700 dark:text-slate-300">
                            ₹{row.balanceAfter.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: APPLY FOR LOAN / ADVANCE */}
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    New Salary Advance / Loan Application
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Submit a loan request for management & finance review
                  </p>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Service Eligibility Warning Badge if not eligible */}
              {!isEligible && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Eligibility Policy Notice</span>
                  </div>
                  <p>
                    This scheme requires a minimum of <strong>{activeScheme?.minServiceMonths} months</strong> of continuous service. 
                    Your recorded tenure is <strong>{currentEmployee.serviceMonths} months</strong>. 
                    Submitting this application will require an extraordinary exception approval from HR & Finance.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitLoan} className="space-y-5">
                {/* Select Scheme */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Loan / Advance Scheme *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {loanTypes.map((type) => {
                      const selected = type.id === selectedTypeId
                      return (
                        <div
                          key={type.id}
                          onClick={() => {
                            setSelectedTypeId(type.id)
                            setRequestedAmount(Math.min(requestedAmount, type.maxAmount))
                            setRequestedTenure(Math.min(requestedTenure, type.maxTenureMonths))
                          }}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selected
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-600'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{type.name}</span>
                            <span className="text-[11px] font-semibold text-emerald-600">
                              {type.interestRate === 0 ? '0% Int.' : `${type.interestRate}% Int.`}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {type.description}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                            <span>Max: ₹{type.maxAmount.toLocaleString('en-IN')}</span>
                            <span>Tenure: Up to {type.maxTenureMonths}m</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Amount Slider & Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Requested Principal Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min={1000}
                      max={activeScheme?.maxAmount || 100000}
                      step={1000}
                      value={requestedAmount}
                      onChange={(e) => setRequestedAmount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="text-[11px] text-slate-400 mt-1">
                      Max allowable: ₹{activeScheme?.maxAmount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Repayment Tenure (Months) *
                    </label>
                    <select
                      value={requestedTenure}
                      onChange={(e) => setRequestedTenure(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                    >
                      {Array.from({ length: activeScheme?.maxTenureMonths || 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m} Month{m > 1 ? 's' : ''} (EMI: ₹{calculateEmi(requestedAmount, activeScheme?.interestRate || 0, m).emi.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Max allowed for this scheme: {activeScheme?.maxTenureMonths} months
                    </div>
                  </div>
                </div>

                {/* Live Repayment Calculation Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Repayment Simulation Summary</span>
                    <span className="text-emerald-600 font-bold">
                      {activeScheme?.interestRate === 0 ? 'Zero-Interest Advance' : `${activeScheme?.interestRate}% Annual Interest`}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="text-[10px] uppercase text-slate-400">Monthly EMI</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        ₹{modalEmiCalc.emi.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400">Total Interest</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        ₹{modalEmiCalc.totalInterest.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase text-slate-400">Total Repayable</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        ₹{modalEmiCalc.totalPayment.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason & Justification */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason & Purpose for Loan / Advance *
                  </label>
                  <textarea
                    rows={3}
                    value={loanReason}
                    onChange={(e) => setLoanReason(e.target.value)}
                    placeholder="Provide specific details (e.g. medical emergency, home renovation, festival expenses)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Workflow Routing Indicator */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-900 dark:text-blue-300 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Approval Chain: <strong>Manager → HR → Finance Head</strong></span>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-md">
                    3-Tier Governance
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Loan Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: LOAN DETAIL & APPROVAL TIMELINE VIEWER */}
        {selectedLoanDetail && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedLoanDetail.loanTypeName} — {selectedLoanDetail.applicationNumber}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Submitted on {selectedLoanDetail.submittedAt}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLoanDetail(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Loan Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block">Principal Amount</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    ₹{selectedLoanDetail.principalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Monthly EMI</span>
                  <span className="text-base font-bold text-emerald-600">
                    ₹{selectedLoanDetail.monthlyEmi.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Interest Rate</span>
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedLoanDetail.interestRate}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status</span>
                  <span className="font-semibold text-emerald-600">
                    {selectedLoanDetail.status}
                  </span>
                </div>
              </div>

              {/* Reason Note */}
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Stated Purpose / Reason</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300">
                  {selectedLoanDetail.reason}
                </div>
              </div>

              {/* Multi-step Approval Route */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Workflow Approval Timeline
                </span>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <ApprovalTimeline steps={selectedLoanDetail.steps} />
                </div>
              </div>

              {/* Recovery Schedule Table */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Repayment Recovery Schedule
                </span>
                <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3">EMI Amount</th>
                        <th className="py-2.5 px-3">Principal</th>
                        <th className="py-2.5 px-3">Interest</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedLoanDetail.recoverySchedule.map((row) => (
                        <tr key={row.installmentNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2 px-3 font-mono text-slate-500">#{row.installmentNo}</td>
                          <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{row.dueDate}</td>
                          <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                            ₹{row.emiAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            ₹{row.principalComponent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                            ₹{row.interestComponent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                row.status === 'Recovered'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
                                  : row.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedLoanDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
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
