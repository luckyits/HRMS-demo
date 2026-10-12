import React, { useState } from 'react'
import {
  CreditCard,
  Plus,
  Calculator,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Info
} from 'lucide-react'
import { useAccess } from '@/access/useAccess'
import {
  useExpenseFinance,
  type LoanApplication,
  type LoanRepaymentInstallment,
} from '@/context/ExpenseFinanceContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'

export const MobileLoansPage: React.FC = () => {
  const { hasFeature, currentEmployee } = useAccess()
  const {
    loanTypes,
    loans,
    applyForLoan,
    calculateEmi,
    generateSchedule,
  } = useExpenseFinance()
  const { showToast } = useToast()

  // Tab: 'overview' | 'apply'
  const [activeTab, setActiveTab] = useState<'overview' | 'apply'>('overview')
  const [selectedLoanForSchedule, setSelectedLoanForSchedule] = useState<LoanApplication | null>(null)

  // Apply Form State
  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState(loanTypes[0]?.id || '')
  const [principal, setPrincipal] = useState(40000)
  const [tenureMonths, setTenureMonths] = useState(6)
  const [reason, setReason] = useState('Home relocation & family emergency expenses')

  if (!hasFeature('FINANCE')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Loans & Advances" subtitle="Employee Finance" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <CreditCard className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Company loans and salary advances are disabled for your profile.</p>
        </div>
      </div>
    )
  }

  const selectedType = loanTypes.find((lt) => lt.id === selectedLoanTypeId) || loanTypes[0]
  const interestRate = selectedType ? selectedType.interestRate : 0

  // Calculate EMI
  const emiCalculation = calculateEmi(principal, interestRate, tenureMonths)
  const previewSchedule = generateSchedule(principal, interestRate, tenureMonths)

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyForLoan({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      employeeGrade: currentEmployee.grade || 'L4',
      department: currentEmployee.department,
      loanTypeId: selectedType.id,
      loanTypeName: selectedType.name,
      principalAmount: principal,
      interestRate,
      tenureMonths,
      monthlyEmi: emiCalculation.emi,
      totalRepayment: emiCalculation.totalPayment,
      serviceMonths: 18,
      isEligible: true,
      reason,
    })

    showToast(`Loan application for ₹${principal.toLocaleString('en-IN')} submitted!`, 'success')
    setActiveTab('overview')
  }

  // Active loans for current employee
  const myLoans = loans.filter((l) => l.employeeId === currentEmployee.id || loans.length > 0)

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Loans & Advances"
        subtitle={activeTab === 'overview' ? 'Balances & EMI' : 'Apply Advance'}
        rightAction={
          activeTab === 'overview' ? (
            <button
              type="button"
              onClick={() => setActiveTab('apply')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Apply</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-3 py-1.5 rounded-xl bg-muted text-foreground text-xs font-bold active:scale-95 transition"
            >
              Cancel
            </button>
          )
        }
      />

      {activeTab === 'overview' ? (
        <div className="p-4 space-y-4 animate-in fade-in duration-200">
          {/* Active Balance Banner */}
          <div className="p-4 rounded-3xl bg-linear-to-br from-indigo-500/10 via-card to-card border border-indigo-500/20 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Active Advance Recovery Balance
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-foreground">
                ₹
                {myLoans
                  .filter((l) => l.status === 'Active / Disbursing')
                  .reduce((sum, l) => sum + l.totalRepayment, 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Auto-deducted from monthly payroll bank credits. Zero penalty on early repayment.
            </p>
          </div>

          {/* Loans List */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
              Applications & Active Loans ({myLoans.length})
            </h4>

            {myLoans.map((loan) => (
              <div
                key={loan.id}
                onClick={() => setSelectedLoanForSchedule(loan)}
                className="p-4 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 active:scale-[0.99] transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-sm font-bold text-foreground">
                      {loan.loanTypeName}
                    </h5>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {loan.applicationNumber} • {loan.tenureMonths} months tenure
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      loan.status === 'Active / Disbursing'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : loan.status === 'Pending Approval'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {loan.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border/50">
                  <div>
                    <span className="text-muted-foreground text-[10px] block">
                      Monthly EMI
                    </span>
                    <span className="font-black text-foreground text-sm">
                      ₹{loan.monthlyEmi.toLocaleString('en-IN')}/mo
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-muted-foreground text-[10px] block">
                      Principal
                    </span>
                    <span className="font-bold text-foreground text-xs">
                      ₹{loan.principalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-primary font-bold flex items-center justify-end gap-1">
                  <span>View Repayment Schedule</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Apply for Loan Form */
        <div className="p-4 space-y-4 animate-in fade-in duration-200">
          <form onSubmit={handleApplySubmit} className="space-y-4">
            {/* Loan Type Selection */}
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Select Scheme
              </label>
              <div className="grid grid-cols-1 gap-2">
                {loanTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedLoanTypeId(type.id)}
                    className={`p-3 rounded-2xl border text-left transition ${
                      selectedLoanTypeId === type.id
                        ? 'bg-primary/10 border-primary text-foreground'
                        : 'bg-card border-border text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{type.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted">
                        {type.interestRate === 0 ? '0% Interest' : `${type.interestRate}% p.a.`}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Max: ₹{type.maxAmount.toLocaleString('en-IN')} • Tenure: up to {type.maxTenureMonths} mo
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Principal Slider */}
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Loan / Advance Amount
                </label>
                <span className="text-lg font-black text-primary">
                  ₹{principal.toLocaleString('en-IN')}
                </span>
              </div>

              <input
                type="range"
                min={5000}
                max={selectedType ? selectedType.maxAmount : 80000}
                step={2500}
                value={principal}
                onChange={(e) => setPrincipal(parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>₹5,000</span>
                <span>₹{(selectedType ? selectedType.maxAmount : 80000).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Repayment Tenure
                </label>
                <span className="text-base font-black text-foreground">
                  {tenureMonths} Months
                </span>
              </div>

              <input
                type="range"
                min={3}
                max={selectedType ? selectedType.maxTenureMonths : 12}
                step={1}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(parseInt(e.target.value))}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>3 Months</span>
                <span>{selectedType ? selectedType.maxTenureMonths : 12} Months</span>
              </div>
            </div>

            {/* Calculated EMI Result Box */}
            <div className="p-4 rounded-3xl bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-card border border-emerald-500/30 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Estimated Monthly EMI
                </span>
                <span className="text-2xl font-black text-foreground">
                  ₹{emiCalculation.emi.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  Total Repayment: ₹{emiCalculation.totalPayment.toLocaleString('en-IN')}
                </span>
              </div>
              <Calculator className="w-8 h-8 text-emerald-600 dark:text-emerald-400 opacity-60" />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1">
                Reason for Application
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-[0.99] transition"
            >
              Submit Loan Application
            </button>
          </form>
        </div>
      )}

      {/* Repayment Schedule Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedLoanForSchedule)}
        onClose={() => setSelectedLoanForSchedule(null)}
        title="Repayment Recovery Schedule"
      >
        {selectedLoanForSchedule && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-foreground">
                  {selectedLoanForSchedule.loanTypeName}
                </h5>
                <span className="text-[10px] text-muted-foreground">
                  Principal: ₹{selectedLoanForSchedule.principalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-sm font-black text-foreground">
                ₹{selectedLoanForSchedule.monthlyEmi.toLocaleString('en-IN')}/mo
              </span>
            </div>

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
              {selectedLoanForSchedule.recoverySchedule.map((inst) => (
                <div
                  key={inst.installmentNo}
                  className="p-2.5 rounded-xl bg-card border border-border text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-foreground block">
                      Installment #{inst.installmentNo}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Due: {inst.dueDate}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-foreground block">
                      ₹{inst.emiAmount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        inst.status === 'Recovered'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
