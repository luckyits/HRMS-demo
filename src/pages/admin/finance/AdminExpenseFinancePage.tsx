import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FeatureGate } from '@/components/common/FeatureGate'
import {
  useExpenseFinance,
  type ExpenseCategory,
  type LoanType,
} from '@/context/ExpenseFinanceContext'
import {
  Receipt,
  CreditCard,
  Banknote,
  DollarSign,
  Layers,
  Search,
  Plus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  FileText,
  Sliders,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Save,
  Globe,
  Coins,
  Calendar,
  Building,
  ArrowRight,
  Info,
} from 'lucide-react'

export const AdminExpenseFinancePage: React.FC = () => {
  const {
    categories,
    updateCategory,
    addCategory,
    policy,
    updatePolicy,
    loanTypes,
    updateLoanType,
    addLoanType,
    claims,
    approveClaim,
    rejectClaim,
    settleClaimsBatch,
    loans,
    approveLoan,
    rejectLoan,
  } = useExpenseFinance()

  const [activeTab, setActiveTab] = useState<
    'categories' | 'policy' | 'loans_master' | 'requests' | 'recovery' | 'payouts'
  >('categories')
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Policy form state
  const [policyForm, setPolicyForm] = useState({ ...policy })
  const [hasPolicyChanges, setHasPolicyChanges] = useState(false)

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: 'Receipt',
    limitL1L3: 2000,
    limitL4L5: 5000,
    limitExecutive: 12000,
    isReceiptMandatory: true,
    description: '',
  })

  // Loan Type Modal
  const [isLoanTypeModalOpen, setIsLoanTypeModalOpen] = useState(false)
  const [loanTypeForm, setLoanTypeForm] = useState({
    name: '',
    interestRate: 0.0,
    maxAmount: 50000,
    maxTenureMonths: 6,
    minServiceMonths: 6,
    description: '',
    active: true,
  })

  // Requests queue filters
  const [requestSearch, setRequestSearch] = useState('')
  const [requestTypeFilter, setRequestTypeFilter] = useState<'All' | 'Expense' | 'Loan'>('All')
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('All')

  // Payout batch selection
  const [selectedPayoutClaimIds, setSelectedPayoutClaimIds] = useState<string[]>([])
  const [payoutMode, setPayoutMode] = useState<'Monthly Payroll Run' | 'Direct Bank Transfer'>(
    'Monthly Payroll Run'
  )

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleSavePolicy = () => {
    updatePolicy(policyForm)
    setHasPolicyChanges(false)
    showToast('Expense threshold rules, per-diem allowances, and FX rates updated successfully.')
  }

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryForm.name.trim()) return
    addCategory(categoryForm)
    setIsCategoryModalOpen(false)
    setCategoryForm({
      name: '',
      icon: 'Receipt',
      limitL1L3: 2000,
      limitL4L5: 5000,
      limitExecutive: 12000,
      isReceiptMandatory: true,
      description: '',
    })
    showToast(`Created new expense category: ${categoryForm.name}`)
  }

  const handleCreateLoanType = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loanTypeForm.name.trim()) return
    addLoanType(loanTypeForm)
    setIsLoanTypeModalOpen(false)
    setLoanTypeForm({
      name: '',
      interestRate: 0.0,
      maxAmount: 50000,
      maxTenureMonths: 6,
      minServiceMonths: 6,
      description: '',
      active: true,
    })
    showToast(`Created new loan scheme: ${loanTypeForm.name}`)
  }

  const handleExecutePayoutBatch = () => {
    if (selectedPayoutClaimIds.length === 0) {
      showToast('Please select at least one approved expense claim for payout settlement.')
      return
    }
    settleClaimsBatch(selectedPayoutClaimIds, payoutMode)
    const count = selectedPayoutClaimIds.length
    setSelectedPayoutClaimIds([])
    showToast(`Settled ${count} expense claims via ${payoutMode}. Batch reference registered.`)
  }

  // Filtered requests
  const pendingClaims = claims.filter((c) => c.status === 'Pending Approval')
  const pendingLoans = loans.filter((l) => l.status === 'Pending Approval')
  const approvedClaimsForPayout = claims.filter((c) => c.status === 'Approved')

  const filteredClaims = claims.filter((c) => {
    const matchSearch =
      c.claimNumber.toLowerCase().includes(requestSearch.toLowerCase()) ||
      c.employeeName.toLowerCase().includes(requestSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(requestSearch.toLowerCase())
    const matchStatus = requestStatusFilter === 'All' || c.status === requestStatusFilter
    return matchSearch && matchStatus
  })

  return (
    <FeatureGate
      feature="EXPENSE"
      fallback={
        <div className="p-8 text-center bg-card rounded-2xl border border-border shadow-xs">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold">Feature Gated: Expense & Finance</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            This module requires the <strong>EXPENSE</strong> and <strong>FINANCE</strong> features enabled.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Expense Reimbursement & Financial Advances Master"
          subtitle="Configure grade-based expense limits, per-diem policies, salary advances, EMI recovery ledgers, and payout batches"
          action={
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                FeatureGate Active: EXPENSE • FINANCE
              </span>
            </div>
          }
        />

        {toastMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Categories & Grade Limits</span>
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'policy'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Expense Policy & FX Rates</span>
          </button>

          <button
            onClick={() => setActiveTab('loans_master')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'loans_master'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Loan & Advance Schemes</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Requests Queue</span>
            {pendingClaims.length + pendingLoans.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
                {pendingClaims.length + pendingLoans.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('recovery')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'recovery'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Recovery Schedule (EMI)</span>
          </button>

          <button
            onClick={() => setActiveTab('payouts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payouts'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Banknote className="w-4 h-4" />
            <span>Reimbursement Payouts</span>
            {approvedClaimsForPayout.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-extrabold">
                {approvedClaimsForPayout.length} Ready
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: CATEGORIES & GRADE LIMITS MATRIX */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div>
                <h4 className="font-bold text-sm text-foreground">Expense Categories & Entitlement Ceilings</h4>
                <p className="text-xs text-muted-foreground">Daily and transaction limit rules enforced per employee band</p>
              </div>

              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Category Name</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Limit: Grade L1 - L3</th>
                      <th className="px-4 py-3">Limit: Grade L4 - L5</th>
                      <th className="px-4 py-3">Limit: Executive L6+</th>
                      <th className="px-4 py-3">Receipt Rule</th>
                      <th className="px-4 py-3 text-right">Quick Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground block">{cat.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{cat.id}</span>
                        </td>

                        <td className="px-4 py-3.5 max-w-[240px]">
                          <span className="text-muted-foreground text-[11px] block truncate" title={cat.description}>
                            {cat.description}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded text-[11px]">
                            ₹{cat.limitL1L3.toLocaleString()} / day
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-indigo-600 bg-indigo-500/10 px-2 py-0.5 rounded text-[11px]">
                            ₹{cat.limitL4L5.toLocaleString()} / day
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                            ₹{cat.limitExecutive.toLocaleString()} / day
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cat.isReceiptMandatory
                                ? 'bg-amber-500/10 text-amber-600'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {cat.isReceiptMandatory ? 'Mandatory Receipt' : 'Self-Declaration OK'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const newLimit = prompt(
                                `Update Grade L4-L5 limit for ${cat.name} (in ₹):`,
                                cat.limitL4L5.toString()
                              )
                              if (newLimit && !isNaN(Number(newLimit))) {
                                updateCategory(cat.id, { limitL4L5: Number(newLimit) })
                                showToast(`Updated limit for ${cat.name} to ₹${Number(newLimit).toLocaleString()}`)
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-muted rounded-lg transition"
                          >
                            Edit Limits
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

        {/* TAB 2: EXPENSE POLICY & FX CONVERSION */}
        {activeTab === 'policy' && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-primary" />
                    General Expense Policies & Distance Rates
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Thresholds for mandatory receipts, travel mileage, and per-diem allowances
                  </p>
                </div>
                <button
                  onClick={handleSavePolicy}
                  disabled={!hasPolicyChanges}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    hasPolicyChanges
                      ? 'bg-primary text-primary-foreground shadow-md hover:opacity-90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>Save Policy Updates</span>
                </button>
              </div>

              {/* Thresholds Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <label className="text-xs font-bold text-foreground">Mandatory Receipt Threshold</label>
                  <p className="text-[11px] text-muted-foreground">Any line item above this amount must have a receipt PDF/JPG attached</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-foreground">₹</span>
                    <input
                      type="number"
                      value={policyForm.receiptMandatoryAbove}
                      onChange={(e) => {
                        setPolicyForm({ ...policyForm, receiptMandatoryAbove: parseInt(e.target.value) })
                        setHasPolicyChanges(true)
                      }}
                      className="w-28 px-3 py-1.5 bg-background border border-input rounded-lg font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <label className="text-xs font-bold text-foreground">2-Wheeler Mileage Rate</label>
                  <p className="text-[11px] text-muted-foreground">Distance rate for motorbikes & scooters in field visits</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-foreground">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={policyForm.distanceRateTwoWheeler}
                      onChange={(e) => {
                        setPolicyForm({ ...policyForm, distanceRateTwoWheeler: parseFloat(e.target.value) })
                        setHasPolicyChanges(true)
                      }}
                      className="w-24 px-3 py-1.5 bg-background border border-input rounded-lg font-bold text-xs"
                    />
                    <span className="text-xs text-muted-foreground">/ kilometer</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                  <label className="text-xs font-bold text-foreground">4-Wheeler (Car) Mileage Rate</label>
                  <p className="text-[11px] text-muted-foreground">Distance rate for personal car travel</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="font-bold text-foreground">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={policyForm.distanceRateFourWheeler}
                      onChange={(e) => {
                        setPolicyForm({ ...policyForm, distanceRateFourWheeler: parseFloat(e.target.value) })
                        setHasPolicyChanges(true)
                      }}
                      className="w-24 px-3 py-1.5 bg-background border border-input rounded-lg font-bold text-xs"
                    />
                    <span className="text-xs text-muted-foreground">/ kilometer</span>
                  </div>
                </div>
              </div>

              {/* Per Diem Rules */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Per-Diem Allowance Slabs
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-foreground block">Tier-2 / Standard City Per-Diem</span>
                      <span className="text-[11px] text-muted-foreground">Daily food and incidentals allowance</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                      <span>₹</span>
                      <input
                        type="number"
                        value={policyForm.perDiemStandardCity}
                        onChange={(e) => {
                          setPolicyForm({ ...policyForm, perDiemStandardCity: parseInt(e.target.value) })
                          setHasPolicyChanges(true)
                        }}
                        className="w-24 px-2 py-1 text-xs bg-background border border-input rounded text-center font-bold"
                      />
                      <span className="text-xs text-muted-foreground font-normal">/ day</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-foreground block">Metro Tier-1 City (Mumbai, Delhi, BLR)</span>
                      <span className="text-[11px] text-muted-foreground">Metro tour daily meal & transit slab</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                      <span>₹</span>
                      <input
                        type="number"
                        value={policyForm.perDiemMetroCity}
                        onChange={(e) => {
                          setPolicyForm({ ...policyForm, perDiemMetroCity: parseInt(e.target.value) })
                          setHasPolicyChanges(true)
                        }}
                        className="w-24 px-2 py-1 text-xs bg-background border border-input rounded text-center font-bold"
                      />
                      <span className="text-xs text-muted-foreground font-normal">/ day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Foreign Currency Rates */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Foreign Currency Exchange Rates (Auto-Converted on Employee Portal)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  {policyForm.foreignCurrencies.map((fc, idx) => (
                    <div key={fc.code} className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-1">
                      <span className="font-bold text-sm text-foreground block">{fc.code}</span>
                      <span className="text-[10px] text-muted-foreground block truncate">{fc.name}</span>
                      <div className="pt-1 flex items-center justify-center gap-1">
                        <span className="text-xs font-bold text-primary">₹</span>
                        <input
                          type="number"
                          step="0.1"
                          value={fc.rateToINR}
                          onChange={(e) => {
                            const updated = [...policyForm.foreignCurrencies]
                            updated[idx].rateToINR = parseFloat(e.target.value)
                            setPolicyForm({ ...policyForm, foreignCurrencies: updated })
                            setHasPolicyChanges(true)
                          }}
                          className="w-16 px-1.5 py-0.5 text-xs bg-background border border-input rounded text-center font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOAN & ADVANCE MASTER */}
        {activeTab === 'loans_master' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div>
                <h4 className="font-bold text-sm text-foreground">Loan & Salary Advance Schemes Master</h4>
                <p className="text-xs text-muted-foreground">Define eligibility tenures, interest calculations, and maximum principal limits</p>
              </div>

              <button
                onClick={() => setIsLoanTypeModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Loan Scheme</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loanTypes.map((lt) => (
                <div key={lt.id} className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{lt.name}</h4>
                      <span className="text-[10px] font-mono text-muted-foreground">{lt.id}</span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        lt.interestRate === 0
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {lt.interestRate === 0 ? '0% Interest Free' : `${lt.interestRate}% p.a. Simple Interest`}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground">{lt.description}</p>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Max Cap:</span>
                      <span className="font-bold text-foreground">₹{lt.maxAmount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Max Tenure:</span>
                      <span className="font-bold text-foreground">{lt.maxTenureMonths} Months</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Min Service:</span>
                      <span className="font-bold text-foreground">{lt.minServiceMonths} Months</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: REQUESTS QUEUE */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 bg-card p-4 rounded-2xl border border-border">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by claim number, employee, or title..."
                    value={requestSearch}
                    onChange={(e) => setRequestSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(['All', 'Pending Approval', 'Approved', 'Paid', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRequestStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                      requestStatusFilter === st
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {st === 'Pending Approval' ? `Pending (${pendingClaims.length})` : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Claim & Employee</th>
                      <th className="px-4 py-3">Voucher Details</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Claim Amount</th>
                      <th className="px-4 py-3">Policy Verification</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={claim.employeeAvatar}
                              alt={claim.employeeName}
                              className="w-8 h-8 rounded-full object-cover border border-border"
                            />
                            <div>
                              <span className="font-bold text-foreground block">{claim.employeeName}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {claim.claimNumber} • {claim.employeeGrade}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 max-w-[220px]">
                          <span className="font-medium text-foreground block truncate">{claim.title}</span>
                          <span className="text-[11px] text-muted-foreground">{claim.lines.length} Line items</span>
                        </td>

                        <td className="px-4 py-3.5 text-muted-foreground">{claim.date}</td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground text-sm">
                            ₹{claim.totalAmountINR.toLocaleString()}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          {claim.hasPolicyViolation ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Policy Warning Flagged
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Within Limits
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              claim.status === 'Paid'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : claim.status === 'Approved'
                                ? 'bg-sky-500/10 text-sky-600'
                                : claim.status === 'Rejected'
                                ? 'bg-rose-500/10 text-rose-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {claim.status === 'Pending Approval' && (
                              <>
                                <button
                                  onClick={() => {
                                    approveClaim(claim.id, 'Finance Controller')
                                    showToast(`Approved ${claim.claimNumber} for ${claim.employeeName}.`)
                                  }}
                                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/20"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    rejectClaim(claim.id, 'Finance Controller')
                                    showToast(`Rejected ${claim.claimNumber}.`)
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}

                            {claim.status === 'Approved' && (
                              <span className="text-[11px] text-sky-600 font-bold">Ready for Payout</span>
                            )}
                            {claim.status === 'Paid' && (
                              <span className="text-[11px] text-muted-foreground">{claim.paymentMode}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: RECOVERY SCHEDULE (EMI TABLE) */}
        {activeTab === 'recovery' && (
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-2xl border border-border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Active Loan Repayment & Recovery Ledger</h4>
                <p className="text-xs text-muted-foreground">Monthly payroll EMI deduction matrix across workforce advances</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {loans.length} Active Loans
              </span>
            </div>

            <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">Application & Employee</th>
                      <th className="px-4 py-3">Loan Scheme</th>
                      <th className="px-4 py-3">Principal Amount</th>
                      <th className="px-4 py-3">Monthly Deduction</th>
                      <th className="px-4 py-3">Tenure</th>
                      <th className="px-4 py-3">Repayment Schedule Breakdown</th>
                      <th className="px-4 py-3 text-right">Loan Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-muted/30 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={loan.employeeAvatar}
                              alt={loan.employeeName}
                              className="w-8 h-8 rounded-full object-cover border border-border"
                            />
                            <div>
                              <span className="font-bold text-foreground block">{loan.employeeName}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {loan.applicationNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-medium text-foreground block">{loan.loanTypeName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            Rate: {loan.interestRate === 0 ? '0% Interest' : `${loan.interestRate}%`}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-foreground text-sm">
                            ₹{loan.principalAmount.toLocaleString()}
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="font-bold text-indigo-600 text-sm">
                            ₹{loan.monthlyEmi.toLocaleString()} / mo
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-foreground font-medium">
                          {loan.tenureMonths} Months
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {loan.recoverySchedule.map((inst) => (
                              <span
                                key={inst.installmentNo}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  inst.status === 'Recovered'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : inst.status === 'Pending'
                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                                title={`${inst.dueDate}: ₹${inst.emiAmount} (${inst.status})`}
                              >
                                #{inst.installmentNo}: {inst.dueDate.split(' ')[0]} ({inst.status})
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              loan.status === 'Active / Disbursing'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : loan.status === 'Completed'
                                ? 'bg-purple-500/10 text-purple-600'
                                : loan.status === 'Rejected'
                                ? 'bg-rose-500/10 text-rose-600'
                                : 'bg-amber-500/10 text-amber-600'
                            }`}
                          >
                            {loan.status}
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

        {/* TAB 6: REIMBURSEMENT PAYOUTS WORKBENCH */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    Reimbursement Payout Disbursal Workbench
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select approved claims and process batch settlement via monthly salary register or direct bank NEFT batch.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={payoutMode}
                    onChange={(e) => setPayoutMode(e.target.value as any)}
                    className="px-3 py-2 text-xs bg-background border border-input rounded-xl font-bold"
                  >
                    <option value="Monthly Payroll Run">Process in Monthly Payroll (Oct 2026)</option>
                    <option value="Direct Bank Transfer">Direct Bank NEFT / RTGS Transfer</option>
                  </select>

                  <button
                    onClick={handleExecutePayoutBatch}
                    disabled={selectedPayoutClaimIds.length === 0}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition ${
                      selectedPayoutClaimIds.length > 0
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>Execute Disbursal Batch ({selectedPayoutClaimIds.length})</span>
                  </button>
                </div>
              </div>

              {/* Ready Claims Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Showing {approvedClaimsForPayout.length} claim(s) ready for disbursement
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedPayoutClaimIds.length === approvedClaimsForPayout.length) {
                        setSelectedPayoutClaimIds([])
                      } else {
                        setSelectedPayoutClaimIds(approvedClaimsForPayout.map((c) => c.id))
                      }
                    }}
                    className="font-bold text-primary hover:underline"
                  >
                    {selectedPayoutClaimIds.length === approvedClaimsForPayout.length
                      ? 'Deselect All'
                      : 'Select All Approved Claims'}
                  </button>
                </div>

                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/50 border-b border-border text-[11px] uppercase font-bold text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 w-10">Select</th>
                        <th className="px-4 py-3">Claim Ref & Employee</th>
                        <th className="px-4 py-3">Title & Purpose</th>
                        <th className="px-4 py-3">Approval Date</th>
                        <th className="px-4 py-3 text-right">Payable Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {approvedClaimsForPayout.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No approved expense claims currently awaiting payout batch generation.
                          </td>
                        </tr>
                      ) : (
                        approvedClaimsForPayout.map((c) => (
                          <tr key={c.id} className="hover:bg-muted/30 transition">
                            <td className="px-4 py-3.5">
                              <input
                                type="checkbox"
                                checked={selectedPayoutClaimIds.includes(c.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPayoutClaimIds([...selectedPayoutClaimIds, c.id])
                                  } else {
                                    setSelectedPayoutClaimIds(
                                      selectedPayoutClaimIds.filter((id) => id !== c.id)
                                    )
                                  }
                                }}
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                            </td>

                            <td className="px-4 py-3.5">
                              <span className="font-bold text-foreground block">{c.employeeName}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{c.claimNumber}</span>
                            </td>

                            <td className="px-4 py-3.5 font-medium text-foreground">{c.title}</td>
                            <td className="px-4 py-3.5 text-muted-foreground">{c.submittedAt}</td>

                            <td className="px-4 py-3.5 text-right">
                              <span className="font-bold text-emerald-600 text-sm">
                                ₹{c.totalAmountINR.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">New Expense Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Relocation & Shifting"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Limit L1-L3</label>
                  <input
                    type="number"
                    value={categoryForm.limitL1L3}
                    onChange={(e) => setCategoryForm({ ...categoryForm, limitL1L3: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-background border border-input rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Limit L4-L5</label>
                  <input
                    type="number"
                    value={categoryForm.limitL4L5}
                    onChange={(e) => setCategoryForm({ ...categoryForm, limitL4L5: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-background border border-input rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Limit L6+</label>
                  <input
                    type="number"
                    value={categoryForm.limitExecutive}
                    onChange={(e) => setCategoryForm({ ...categoryForm, limitExecutive: parseInt(e.target.value) })}
                    className="w-full px-2 py-1.5 bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl resize-none"
                  placeholder="Policy notes and inclusions..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="catReceiptToggle"
                  checked={categoryForm.isReceiptMandatory}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isReceiptMandatory: e.target.checked })}
                  className="w-4 h-4 rounded text-primary"
                />
                <label htmlFor="catReceiptToggle" className="font-semibold text-foreground cursor-pointer">
                  Mandatory Receipt Attachment
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LOAN SCHEME MODAL */}
      {isLoanTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">Create Loan / Advance Scheme</h3>
              <button onClick={() => setIsLoanTypeModalOpen(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLoanType} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Scheme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Higher Education Advance"
                  value={loanTypeForm.name}
                  onChange={(e) => setLoanTypeForm({ ...loanTypeForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Interest Rate (% p.a.)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={loanTypeForm.interestRate}
                    onChange={(e) => setLoanTypeForm({ ...loanTypeForm, interestRate: parseFloat(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Max Principal (₹)</label>
                  <input
                    type="number"
                    value={loanTypeForm.maxAmount}
                    onChange={(e) => setLoanTypeForm({ ...loanTypeForm, maxAmount: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Max Tenure (Months)</label>
                  <input
                    type="number"
                    value={loanTypeForm.maxTenureMonths}
                    onChange={(e) => setLoanTypeForm({ ...loanTypeForm, maxTenureMonths: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Min Service (Months)</label>
                  <input
                    type="number"
                    value={loanTypeForm.minServiceMonths}
                    onChange={(e) => setLoanTypeForm({ ...loanTypeForm, minServiceMonths: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Description</label>
                <textarea
                  rows={2}
                  value={loanTypeForm.description}
                  onChange={(e) => setLoanTypeForm({ ...loanTypeForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl resize-none"
                  placeholder="Policy terms and conditions..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsLoanTypeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FeatureGate>
  )
}
