import React, { useState } from 'react'
import {
  Receipt,
  Plus,
  Camera,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Trash2,
  Calendar,
  DollarSign,
  FileText,
  X,
  CreditCard,
  Building,
  Check
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useOfflineQueue } from '@/context/OfflineQueueContext'
import {
  useExpenseFinance,
  type ExpenseClaim,
  type ExpenseClaimLine,
} from '@/context/ExpenseFinanceContext'
import { useToast } from '@/context/ToastContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'

interface DraftLine {
  id: string
  category: string
  date: string
  description: string
  currency: string
  originalAmount: number
  exchangeRate: number
  receiptCaptured: boolean
}

export const MobileExpensePage: React.FC = () => {
  const navigate = useNavigate()
  const { hasFeature, currentEmployee } = useAccess()
  const { settings } = useDemo()
  const { enqueueItem } = useOfflineQueue()
  const { categories, policy, claims, createClaim } = useExpenseFinance()
  const { showToast } = useToast()

  // Tab: 'list' | 'new'
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedClaimForDetail, setSelectedClaimForDetail] = useState<ExpenseClaim | null>(null)

  // New Claim Form State
  const [claimTitle, setClaimTitle] = useState('Client Meeting & Site Travel')
  const [lines, setLines] = useState<DraftLine[]>([
    {
      id: 'LINE-1',
      category: 'Travel & Conveyance',
      date: new Date().toISOString().split('T')[0],
      description: 'Cab fare from airport to client HQ',
      currency: 'INR',
      originalAmount: 850,
      exchangeRate: 1,
      receiptCaptured: true,
    },
  ])

  // Current active line being edited / added
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || 'Travel & Conveyance')
  const [lineAmount, setLineAmount] = useState('1200')
  const [lineCurrency, setLineCurrency] = useState('INR')
  const [lineDate, setLineDate] = useState(new Date().toISOString().split('T')[0])
  const [lineDescription, setLineDescription] = useState('')
  const [lineReceiptCaptured, setLineReceiptCaptured] = useState(true)

  if (!hasFeature('EXPENSE')) {
    return (
      <div className="flex flex-col min-h-full">
        <MobileHeader title="Expense Claims" subtitle="Claims & Reimbursements" />
        <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Receipt className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-sm font-medium">Expense reimbursement is disabled for your workforce profile.</p>
        </div>
      </div>
    )
  }

  // Currency exchange helper
  const getExchangeRate = (currCode: string) => {
    if (currCode === 'INR') return 1
    const found = policy.foreignCurrencies.find((c) => c.code === currCode)
    return found ? found.rateToINR : 1
  }

  // Calculate total amount in INR across draft lines
  const totalClaimINR = lines.reduce(
    (sum, line) => sum + line.originalAmount * line.exchangeRate,
    0
  )

  // Check policy limit violation
  const currentCategoryObj = categories.find((c) => c.name === activeCategory)
  const categoryDailyLimit = currentCategoryObj ? currentCategoryObj.limitL4L5 : 5000
  const activeAmountNumber = parseFloat(lineAmount) || 0
  const activeAmountInINR = activeAmountNumber * getExchangeRate(lineCurrency)
  const isOverLimit = activeAmountInINR > categoryDailyLimit
  const isDuplicateReceipt = lines.some(
    (l) => l.category === activeCategory && l.originalAmount === activeAmountNumber
  )

  const handleAddLine = () => {
    if (!activeAmountNumber || activeAmountNumber <= 0) {
      showToast('Please enter a valid expense amount', 'error')
      return
    }

    const newLine: DraftLine = {
      id: `LINE-${Date.now()}`,
      category: activeCategory,
      date: lineDate,
      description: lineDescription || `${activeCategory} expenses`,
      currency: lineCurrency,
      originalAmount: activeAmountNumber,
      exchangeRate: getExchangeRate(lineCurrency),
      receiptCaptured: lineReceiptCaptured,
    }

    setLines([...lines, newLine])
    setLineAmount('')
    setLineDescription('')
    setLineReceiptCaptured(false)
    showToast('Expense item added to claim!', 'success')
  }

  const handleRemoveLine = (id: string) => {
    if (lines.length === 1) {
      showToast('Claim must have at least one expense line', 'error')
      return
    }
    setLines(lines.filter((l) => l.id !== id))
  }

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault()
    if (lines.length === 0) {
      showToast('Please add at least one expense line', 'error')
      return
    }

    const claimLines: ExpenseClaimLine[] = lines.map((l) => ({
      id: l.id,
      category: l.category,
      date: l.date,
      description: l.description,
      currency: l.currency,
      originalAmount: l.originalAmount,
      exchangeRate: l.exchangeRate,
      amountINR: l.originalAmount * l.exchangeRate,
      receiptFileName: l.receiptCaptured ? 'voucher_receipt.jpg' : undefined,
      receiptUrl: l.receiptCaptured
        ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80'
        : undefined,
      isOverLimit: l.originalAmount * l.exchangeRate > categoryDailyLimit,
      limitForGrade: categoryDailyLimit,
      isDuplicateReceipt: false,
      hasMissingReceiptViolation: !l.receiptCaptured,
    }))

    createClaim({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      employeeGrade: currentEmployee.grade || 'L4',
      department: currentEmployee.department,
      title: claimTitle,
      date: new Date().toISOString().split('T')[0],
      lines: claimLines,
      totalAmountINR: totalClaimINR,
      hasPolicyViolation: lines.some(
        (l) => l.originalAmount * l.exchangeRate > categoryDailyLimit
      ),
      violationSummary: lines.some(
        (l) => l.originalAmount * l.exchangeRate > categoryDailyLimit
      )
        ? 'One or more items exceed per-diem category allowance'
        : undefined,
    })

    if (settings.offlineMode) {
      enqueueItem({
        idempotencyKey: `expense-${currentEmployee.id}-${claimTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(0, 8)}`,
        type: 'expense',
        title: `Offline Claim: ${claimTitle}`,
        subtitle: `₹${totalClaimINR.toLocaleString('en-IN')} • ${lines.length} receipt items`,
        payload: {
          title: claimTitle,
          totalAmount: totalClaimINR,
        },
      })
    }

    showToast(`Claim "${claimTitle}" submitted for approval!`, 'success')
    setActiveTab('list')
    setLines([])
  }

  // Filter claims
  const filteredClaims = claims.filter((c) => {
    if (filterStatus === 'all') return true
    return c.status.toLowerCase().includes(filterStatus.toLowerCase())
  })

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Expense Claims"
        subtitle={activeTab === 'list' ? 'My Reimbursements' : 'New Claim Form'}
        rightAction={
          activeTab === 'list' ? (
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Claim</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-3 py-1.5 rounded-xl bg-muted text-foreground text-xs font-bold active:scale-95 transition"
            >
              Cancel
            </button>
          )
        }
      />

      {activeTab === 'new' ? (
        /* Full-Screen New Claim Form */
        <div className="p-4 space-y-5 animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-bold text-foreground block mb-1">
              Claim Title / Purpose
            </label>
            <input
              type="text"
              value={claimTitle}
              onChange={(e) => setClaimTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-border bg-card text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-xs"
              placeholder="e.g. Client Demo & Hotel Stay"
            />
          </div>

          {/* Add Line Item Box */}
          <div className="p-4 rounded-3xl bg-card border border-border space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Add Expense Line
              </h4>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Daily Limit: ₹{categoryDailyLimit.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Category Chips Scroll */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                Expense Category
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      activeCategory === cat.name
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency & Amount Input */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Currency
                </label>
                <select
                  value={lineCurrency}
                  onChange={(e) => setLineCurrency(e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-border bg-muted/40 text-foreground text-xs font-bold focus:outline-none"
                >
                  <option value="INR">INR (₹)</option>
                  {policy.foreignCurrencies.map((fc) => (
                    <option key={fc.code} value={fc.code}>
                      {fc.code} (1={fc.rateToINR}₹)
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={lineAmount}
                  onChange={(e) => setLineAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-foreground text-base font-black focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-inner"
                />
              </div>
            </div>

            {/* Live conversion if foreign */}
            {lineCurrency !== 'INR' && (
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-between font-semibold">
                <span>Foreign Conversion:</span>
                <span className="font-bold">
                  {lineCurrency} {activeAmountNumber || 0} ≈ ₹
                  {activeAmountInINR.toFixed(2)} INR
                </span>
              </div>
            )}

            {/* Policy Violations / Warnings */}
            {isOverLimit && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Over-Limit:</strong> Exceeds policy ceiling of ₹
                  {categoryDailyLimit.toLocaleString('en-IN')}. Requires L2 manager sign-off.
                </span>
              </div>
            )}

            {isDuplicateReceipt && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>Duplicate Warning:</strong> Similar claim item exists for this date.
                </span>
              </div>
            )}

            {/* Date & Note */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={lineDate}
                  onChange={(e) => setLineDate(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Dinner with client..."
                  value={lineDescription}
                  onChange={(e) => setLineDescription(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Camera Receipt Capture Simulator */}
            <div>
              <label className="text-[11px] font-bold text-muted-foreground block mb-1.5">
                Receipt / Tax Invoice
              </label>
              {lineReceiptCaptured ? (
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Receipt Attached (receipt_904.jpg)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLineReceiptCaptured(false)}
                    className="text-[10px] font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setLineReceiptCaptured(true)}
                  className="w-full py-3.5 border-2 border-dashed border-border rounded-2xl flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition text-xs font-bold active:scale-95"
                >
                  <Camera className="w-4 h-4 text-primary" />
                  <span>Attach Receipt Photo</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs active:scale-95 transition flex items-center justify-center gap-1.5 border border-border"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add This Line</span>
            </button>
          </div>

          {/* Current Lines in Claim */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              Claim Lines ({lines.length})
            </h4>

            {lines.map((l, index) => (
              <div
                key={l.id}
                className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground truncate">
                      {l.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {l.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {l.description}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {l.currency} {l.originalAmount.toFixed(2)}{' '}
                    {l.currency !== 'INR' && `(₹${(l.originalAmount * l.exchangeRate).toFixed(2)})`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveLine(l.id)}
                  className="p-2 text-muted-foreground hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Total Bar & Submit */}
          <div className="p-4 rounded-3xl bg-linear-to-r from-primary/10 via-primary/5 to-card border border-primary/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Total Reimbursement
              </span>
              <span className="text-xl font-black text-foreground">
                ₹{totalClaimINR.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmitClaim}
              className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-95 transition"
            >
              Submit Claim
            </button>
          </div>
        </div>
      ) : (
        /* My Claims List View */
        <div className="p-4 space-y-4 animate-in fade-in duration-200">
          {/* Status Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'Pending Approval', 'Approved', 'Paid', 'Draft'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize shrink-0 transition ${
                  filterStatus === st
                    ? 'bg-foreground text-background shadow-xs'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {st === 'all' ? 'All Claims' : st}
              </button>
            ))}
          </div>

          {/* Claims List Cards */}
          <div className="space-y-2.5">
            {filteredClaims.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs font-medium">
                No expense claims matching this filter.
              </div>
            ) : (
              filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimForDetail(claim)}
                  className="p-4 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/40 active:scale-[0.99] transition cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {claim.title}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {claim.claimNumber} • {claim.date} • {claim.lines.length} items
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        claim.status === 'Approved' || claim.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : claim.status === 'Pending Approval'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <span className="font-black text-foreground text-sm">
                      ₹{claim.totalAmountINR.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                      <span>Timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Claim Detail & Approval Timeline Bottom Sheet */}
      <BottomSheet
        isOpen={Boolean(selectedClaimForDetail)}
        onClose={() => setSelectedClaimForDetail(null)}
        title="Claim Details & Approval Timeline"
      >
        {selectedClaimForDetail && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    {selectedClaimForDetail.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    {selectedClaimForDetail.claimNumber} • Submitted on{' '}
                    {selectedClaimForDetail.submittedAt}
                  </p>
                </div>
                <span className="text-base font-black text-foreground">
                  ₹{selectedClaimForDetail.totalAmountINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Line Items List */}
            <div>
              <h5 className="text-xs font-bold text-foreground mb-2">
                Itemized Expenses
              </h5>
              <div className="space-y-1.5">
                {selectedClaimForDetail.lines.map((ln) => (
                  <div
                    key={ln.id}
                    className="p-2.5 rounded-xl bg-card border border-border text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-foreground block">
                        {ln.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {ln.description}
                      </span>
                    </div>
                    <span className="font-bold text-foreground">
                      ₹{ln.amountINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval Timeline */}
            <div>
              <h5 className="text-xs font-bold text-foreground mb-2">
                Approval Sign-Off Flow
              </h5>
              <div className="p-3 rounded-2xl bg-card border border-border">
                <ApprovalTimeline steps={selectedClaimForDetail.steps} />
              </div>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
