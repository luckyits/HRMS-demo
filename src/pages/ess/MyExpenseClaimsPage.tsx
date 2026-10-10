import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FeatureGate } from '@/components/common/FeatureGate'
import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { useAccess } from '@/access/useAccess'
import {
  useExpenseFinance,
  type ExpenseClaim,
  type ExpenseClaimLine,
} from '@/context/ExpenseFinanceContext'
import {
  Receipt,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  ShieldCheck,
  Building,
  Calendar,
  Globe,
  Camera,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export const MyExpenseClaimsPage: React.FC = () => {
  const { currentEmployee } = useAccess()
  const { categories, policy, claims, createClaim } = useExpenseFinance()

  const [isNewClaimModalOpen, setIsNewClaimModalOpen] = useState(false)
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All')
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // New Claim Form State
  const [claimTitle, setClaimTitle] = useState('')
  const [claimDate, setClaimDate] = useState(new Date().toISOString().split('T')[0])
  const [lines, setLines] = useState<
    Array<{
      id: string
      category: string
      date: string
      description: string
      currency: string
      originalAmount: number
      exchangeRate: number
      amountINR: number
      receiptFileName?: string
      receiptUrl?: string
    }>
  >([
    {
      id: 'L-1',
      category: 'Meals & Per-Diem',
      date: new Date().toISOString().split('T')[0],
      description: 'Client project lunch and incidentals',
      currency: 'INR',
      originalAmount: 1200,
      exchangeRate: 1.0,
      amountINR: 1200,
      receiptFileName: 'Cafe_Lunch_Bill.jpg',
      receiptUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    },
  ])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Filter claims for current employee (or show all for demo persona Aarav Patel)
  const myClaims = claims.filter(
    (c) => c.employeeId === currentEmployee.id || c.employeeName.includes('Aarav')
  )

  const filteredClaims = myClaims.filter((c) => {
    if (selectedStatusFilter === 'All') return true
    return c.status === selectedStatusFilter
  })

  // Calculations
  const totalClaimedYTD = myClaims.reduce((sum, c) => sum + c.totalAmountINR, 0)
  const totalPending = myClaims
    .filter((c) => c.status === 'Pending Approval')
    .reduce((sum, c) => sum + c.totalAmountINR, 0)
  const totalPaid = myClaims
    .filter((c) => c.status === 'Paid')
    .reduce((sum, c) => sum + c.totalAmountINR, 0)

  // Add line item
  const handleAddLine = () => {
    const nextId = `L-${lines.length + 1}`
    setLines([
      ...lines,
      {
        id: nextId,
        category: 'Travel & Conveyance',
        date: claimDate,
        description: '',
        currency: 'INR',
        originalAmount: 0,
        exchangeRate: 1.0,
        amountINR: 0,
      },
    ])
  }

  const handleRemoveLine = (idx: number) => {
    if (lines.length <= 1) return
    setLines(lines.filter((_, i) => i !== idx))
  }

  const handleUpdateLine = (idx: number, field: string, val: any) => {
    const updated = [...lines]
    const item = { ...updated[idx], [field]: val }

    // If currency changed, update exchange rate
    if (field === 'currency') {
      const curObj = policy.foreignCurrencies.find((f) => f.code === val)
      item.exchangeRate = curObj ? curObj.rateToINR : 1.0
      item.amountINR = Math.round(item.originalAmount * item.exchangeRate)
    }

    if (field === 'originalAmount' || field === 'exchangeRate') {
      item.amountINR = Math.round((field === 'originalAmount' ? val : item.originalAmount) * (field === 'exchangeRate' ? val : item.exchangeRate))
    }

    updated[idx] = item
    setLines(updated)
  }

  // Evaluate line validations
  const evaluateLineValidations = (line: typeof lines[0]) => {
    const cat = categories.find((c) => c.name === line.category) || categories[0]
    const limitForGrade = cat.limitL4L5 || 5000
    const isOverLimit = line.amountINR > limitForGrade
    const hasMissingReceipt = line.amountINR > policy.receiptMandatoryAbove && !line.receiptFileName
    const isDuplicate = lines.filter((l) => l.receiptFileName && l.receiptFileName === line.receiptFileName).length > 1

    return {
      isOverLimit,
      limitForGrade,
      hasMissingReceipt,
      isDuplicate,
    }
  }

  const totalFormINR = lines.reduce((sum, l) => sum + l.amountINR, 0)
  const formHasViolations = lines.some((l) => {
    const v = evaluateLineValidations(l)
    return v.isOverLimit || v.hasMissingReceipt || v.isDuplicate
  })

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault()
    if (!claimTitle.trim()) {
      showToast('Please provide a claim title or business purpose.')
      return
    }

    const processedLines: ExpenseClaimLine[] = lines.map((l) => {
      const v = evaluateLineValidations(l)
      let violationNote: string | undefined
      if (v.isOverLimit) {
        violationNote = `Exceeds category limit of ₹${v.limitForGrade.toLocaleString()} by ₹${(l.amountINR - v.limitForGrade).toLocaleString()}`
      } else if (v.hasMissingReceipt) {
        violationNote = `Missing mandatory receipt for amount > ₹${policy.receiptMandatoryAbove}`
      } else if (v.isDuplicate) {
        violationNote = `Duplicate receipt detected: ${l.receiptFileName}`
      }

      return {
        id: l.id,
        category: l.category,
        date: l.date,
        description: l.description || l.category,
        currency: l.currency,
        originalAmount: l.originalAmount,
        exchangeRate: l.exchangeRate,
        amountINR: l.amountINR,
        receiptFileName: l.receiptFileName,
        receiptUrl: l.receiptUrl,
        isOverLimit: v.isOverLimit,
        limitForGrade: v.limitForGrade,
        isDuplicateReceipt: v.isDuplicate,
        hasMissingReceiptViolation: v.hasMissingReceipt,
        violationNote,
      }
    })

    const newClaim = createClaim({
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      employeeAvatar: currentEmployee.avatar,
      employeeGrade: currentEmployee.grade || 'L4 - Senior',
      department: currentEmployee.department,
      title: claimTitle,
      date: claimDate,
      lines: processedLines,
      totalAmountINR: totalFormINR,
      hasPolicyViolation: formHasViolations,
      violationSummary: formHasViolations
        ? 'One or more line items flagged with over-limit or missing receipt rules'
        : undefined,
    })

    setIsNewClaimModalOpen(false)
    setClaimTitle('')
    setLines([
      {
        id: 'L-1',
        category: 'Meals & Per-Diem',
        date: new Date().toISOString().split('T')[0],
        description: '',
        currency: 'INR',
        originalAmount: 0,
        exchangeRate: 1.0,
        amountINR: 0,
      },
    ])

    showToast(`Claim #${newClaim.claimNumber} submitted! Routed for approval.`)
  }

  return (
    <FeatureGate
      feature="EXPENSE"
      fallback={
        <div className="p-12 text-center bg-card rounded-2xl border border-dashed border-border shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Expense Claims Module Gated</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Your profile does not currently have the <strong>EXPENSE</strong> feature enabled.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="Expense Reimbursements & Claims"
          subtitle="Submit tour vouchers, client entertainment claims, and foreign currency travel expenses with multi-tier approvals"
          action={
            <button
              onClick={() => setIsNewClaimModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Submit New Claim</span>
            </button>
          }
        />

        {toastMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 3 KPI STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Claimed YTD</span>
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-foreground">₹{totalClaimedYTD.toLocaleString()}</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                {myClaims.length} expense voucher claims submitted
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Approvals</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-amber-600">₹{totalPending.toLocaleString()}</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Awaiting Manager / Dept Head / Finance audit
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">Paid & Settled</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-emerald-600">₹{totalPaid.toLocaleString()}</span>
              <span className="text-[11px] text-muted-foreground block mt-0.5">
                Credited via payroll & direct bank batches
              </span>
            </div>
          </div>
        </div>

        {/* CLAIMS LEDGER */}
        <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                My Expense Claims History
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Click any voucher to expand itemized line breakdown and inspect the ApprovalTimeline.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['All', 'Pending Approval', 'Approved', 'Paid', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                    selectedStatusFilter === st
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredClaims.map((claim) => (
              <div key={claim.id} className="p-5 space-y-4 hover:bg-muted/10 transition">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{claim.title}</h4>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {claim.claimNumber}
                        </span>
                        {claim.hasPolicyViolation && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Policy Alert
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted: {claim.submittedAt} • {claim.lines.length} Line items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-black text-foreground block">
                        ₹{claim.totalAmountINR.toLocaleString()}
                      </span>
                      {claim.paymentRef && (
                        <span className="text-[10px] text-emerald-600 font-mono block">
                          Ref: {claim.paymentRef}
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        claim.status === 'Paid'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : claim.status === 'Approved'
                          ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                          : claim.status === 'Rejected'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                      }`}
                    >
                      {claim.status}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedClaimId(expandedClaimId === claim.id ? null : claim.id)
                      }
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      {expandedClaimId === claim.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Line Items & ApprovalTimeline */}
                {expandedClaimId === claim.id && (
                  <div className="pt-4 border-t border-border space-y-5 animate-in fade-in">
                    {/* Lines Table */}
                    <div>
                      <span className="text-xs font-bold text-foreground block mb-2">Itemized Expense Lines</span>
                      <div className="border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground">
                            <tr>
                              <th className="px-3 py-2">Category</th>
                              <th className="px-3 py-2">Date & Description</th>
                              <th className="px-3 py-2">Original Amount</th>
                              <th className="px-3 py-2">Amount (INR)</th>
                              <th className="px-3 py-2">Receipt & Violations</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {claim.lines.map((line) => (
                              <tr key={line.id}>
                                <td className="px-3 py-2.5 font-bold text-foreground">{line.category}</td>
                                <td className="px-3 py-2.5">
                                  <span className="text-foreground block">{line.description}</span>
                                  <span className="text-[10px] text-muted-foreground">{line.date}</span>
                                </td>
                                <td className="px-3 py-2.5 font-mono">
                                  {line.currency} {line.originalAmount.toLocaleString()}
                                  {line.exchangeRate !== 1.0 && (
                                    <span className="text-[10px] text-muted-foreground block">
                                      (@ ₹{line.exchangeRate})
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2.5 font-bold text-foreground">
                                  ₹{line.amountINR.toLocaleString()}
                                </td>
                                <td className="px-3 py-2.5">
                                  {line.receiptFileName ? (
                                    <span className="text-[11px] text-primary underline block">
                                      📎 {line.receiptFileName}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">No Receipt</span>
                                  )}
                                  {line.violationNote && (
                                    <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                                      ⚠️ {line.violationNote}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ApprovalTimeline Embedded */}
                    <div>
                      <span className="text-xs font-bold text-foreground block mb-2">
                        Approval Workflow Progression (
                        {claim.totalAmountINR > 5000
                          ? 'High Value: Manager → Dept Head → Finance'
                          : 'Manager → Finance'}
                        )
                      </span>
                      <div className="p-4 bg-muted/20 border border-border rounded-xl">
                        <ApprovalTimeline steps={claim.steps} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW CLAIM MODAL WITH FX CONVERTER & POLICY VALIDATION */}
      {isNewClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">Create New Expense Claim</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewClaimModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Claim Title / Business Event</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q4 Client Summit in Mumbai"
                    value={claimTitle}
                    onChange={(e) => setClaimTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={claimDate}
                    onChange={(e) => setClaimDate(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-xl"
                  />
                </div>
              </div>

              {/* Multi-Line Items Section */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    Itemized Lines ({lines.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="flex items-center gap-1 text-primary font-bold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Line</span>
                  </button>
                </div>

                {lines.map((line, idx) => {
                  const valResult = evaluateLineValidations(line)

                  return (
                    <div
                      key={line.id}
                      className="p-4 rounded-xl bg-muted/30 border border-border space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-[11px]">Line #{idx + 1}</span>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveLine(idx)}
                            className="text-rose-600 hover:text-rose-700 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Category</label>
                          <select
                            value={line.category}
                            onChange={(e) => handleUpdateLine(idx, 'category', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name} (Cap ₹{c.limitL4L5})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">Description</label>
                          <input
                            type="text"
                            placeholder="e.g. Flight ticket or Taxi ride"
                            value={line.description}
                            onChange={(e) => handleUpdateLine(idx, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-background border border-input rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">
                            Currency & Exchange Rate
                          </label>
                          <div className="grid grid-cols-2 gap-1">
                            <select
                              value={line.currency}
                              onChange={(e) => handleUpdateLine(idx, 'currency', e.target.value)}
                              className="px-2 py-1.5 bg-background border border-input rounded-lg font-bold"
                            >
                              {policy.foreignCurrencies.map((fc) => (
                                <option key={fc.code} value={fc.code}>
                                  {fc.code} ({fc.symbol})
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              step="0.1"
                              value={line.exchangeRate}
                              onChange={(e) =>
                                handleUpdateLine(idx, 'exchangeRate', parseFloat(e.target.value))
                              }
                              className="px-2 py-1.5 bg-background border border-input rounded-lg text-center"
                              title="Exchange Rate to INR"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">
                            Amount in {line.currency} $\rightarrow$ Converted (₹ INR)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              required
                              value={line.originalAmount}
                              onChange={(e) =>
                                handleUpdateLine(idx, 'originalAmount', parseFloat(e.target.value) || 0)
                              }
                              className="w-1/2 px-2.5 py-1.5 bg-background border border-input rounded-lg font-bold"
                            />
                            <span className="font-bold text-foreground text-sm">
                              = ₹{line.amountINR.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-muted-foreground block mb-0.5">
                            Receipt File Attachment
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g. Tax_Invoice_9821.pdf"
                              value={line.receiptFileName || ''}
                              onChange={(e) => handleUpdateLine(idx, 'receiptFileName', e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-background border border-input rounded-lg text-xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateLine(
                                  idx,
                                  'receiptFileName',
                                  `Receipt_${Math.floor(Math.random() * 9000 + 1000)}.pdf`
                                )
                              }
                              className="px-2.5 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-[10px] font-bold"
                            >
                              Mock Upload
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Line Validations & Warnings */}
                      {valResult.isOverLimit && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            <strong>Over-limit Warning:</strong> Amount ₹{line.amountINR.toLocaleString()} exceeds Grade L4 cap of ₹{valResult.limitForGrade.toLocaleString()}. Requires Dept Head approval.
                          </span>
                        </div>
                      )}

                      {valResult.hasMissingReceipt && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            <strong>Policy Violation:</strong> Mandatory receipt attachment required for line amounts exceeding ₹{policy.receiptMandatoryAbove}.
                          </span>
                        </div>
                      )}

                      {valResult.isDuplicate && (
                        <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            <strong>Duplicate Receipt Warning:</strong> File name "{line.receiptFileName}" has been attached multiple times in this claim.
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Total & Workflow Route Summary */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground">Total Claim Amount:</span>
                  <span className="font-black text-lg text-primary">₹{totalFormINR.toLocaleString()}</span>
                </div>

                <div className="text-[11px] text-muted-foreground pt-1 border-t border-border flex items-center justify-between">
                  <span>Routing Rule:</span>
                  <span className="font-bold text-foreground">
                    {totalFormINR > 5000
                      ? 'Amount > ₹5,000 $\rightarrow$ Manager → Dept Head → Finance'
                      : 'Amount $\le$ ₹5,000 $\rightarrow$ Manager → Finance'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewClaimModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm"
                >
                  Submit Reimbursement Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </FeatureGate>
  )
}
