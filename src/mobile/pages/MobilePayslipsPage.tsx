import React, { useState } from 'react'
import {
  Download,
  Share2,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  Building,
  Eye,
  Send,
  Upload,
  Calendar
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { SegmentedControl } from '@/mobile/components/SegmentedControl'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { INITIAL_PAYSLIPS, type PayslipRecord } from '@/mock/essData'
import { useToast } from '@/context/ToastContext'
import { useAccess } from '@/access/useAccess'

export const MobilePayslipsPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'payslips' | 'ctc' | 'tax' | 'form16'>('payslips')
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord>(INITIAL_PAYSLIPS[0])
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Collapsible sections state
  const [isEarningsOpen, setIsEarningsOpen] = useState(true)
  const [isDeductionsOpen, setIsDeductionsOpen] = useState(true)
  const [isEmployerOpen, setIsEmployerOpen] = useState(false)

  // Tax declaration state
  const [sec80c, setSec80c] = useState('150000')
  const [sec80d, setSec80d] = useState('25000')
  const [annualRent, setAnnualRent] = useState('180000')

  const handleDownloadPdf = (period: string) => {
    showToast(`Downloading encrypted PDF payslip for ${period}...`, 'success')
  }

  const handleShare = (period: string) => {
    if (navigator.share) {
      navigator.share({
        title: `Payslip - ${period}`,
        text: `Salary voucher for ${period} (Apex Technologies)`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      showToast('Encrypted payslip secure link copied to clipboard!', 'info')
    }
  }

  const handleTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    showToast('IT Declaration Form 12BB submitted for FY 2026-27 TDS calculation!', 'success')
  }

  if (!hasFeature('PAYSLIP')) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Payslips and salary module is disabled for your workforce profile.
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Payroll & Payslips"
        subtitle="Salary vouchers, CTC & Form 16"
        showBack={false}
      />

      <div className="p-4 space-y-4">
        {/* Navigation Tabs */}
        <SegmentedControl
          options={[
            { id: 'payslips', label: 'Payslips' },
            { id: 'ctc', label: 'CTC View' },
            { id: 'tax', label: 'Tax (12BB)' },
            { id: 'form16', label: 'Form 16' },
          ]}
          selectedId={activeTab}
          onSelect={(id) => setActiveTab(id as any)}
        />

        {activeTab === 'payslips' && (
          <div className="space-y-4">
            {/* Latest Payslip Quick Highlight Card */}
            <div
              onClick={() => {
                setSelectedPayslip(INITIAL_PAYSLIPS[0])
                setIsDetailOpen(true)
              }}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md cursor-pointer active:scale-[0.99] transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  Latest: {INITIAL_PAYSLIPS[0].monthYear}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Paid
                </span>
              </div>

              <div>
                <span className="text-xs text-emerald-100 font-medium">Net Take-Home Salary</span>
                <div className="text-3xl font-black font-mono tracking-tight">
                  ₹{INITIAL_PAYSLIPS[0].netPay.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-100/90 pt-1 border-t border-white/20">
                <span>Disbursed on: {INITIAL_PAYSLIPS[0].payDate}</span>
                <span className="font-semibold text-white underline">View Details →</span>
              </div>
            </div>

            {/* Past Months List */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Published Salary Slips
              </h3>

              {INITIAL_PAYSLIPS.map((slip) => (
                <div
                  key={slip.id}
                  onClick={() => {
                    setSelectedPayslip(slip)
                    setIsDetailOpen(true)
                  }}
                  className="p-4 rounded-3xl bg-card border border-border shadow-2xs cursor-pointer active:scale-[0.99] transition hover:border-primary/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {slip.monthYear}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Gross: ₹{slip.grossSalary.toLocaleString('en-IN')} • Ded: ₹{slip.totalDeductions.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-foreground font-mono block">
                      ₹{slip.netPay.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Disbursed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CTC View */}
        {activeTab === 'ctc' && (
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-card border border-border text-center shadow-xs space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Annual Cost to Company (CTC)
              </span>
              <div className="text-3xl font-black text-primary font-mono">
                ₹8,50,000
              </div>
              <p className="text-xs text-muted-foreground">
                Level L4 • Senior Software Engineer • Band Tech-2
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-card border border-border shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Salary Component Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Basic Salary (50%)</span>
                  <span className="font-semibold text-foreground">₹4,25,000 / yr</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">House Rent Allowance (HRA 40%)</span>
                  <span className="font-semibold text-foreground">₹1,70,000 / yr</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Special Allowance</span>
                  <span className="font-semibold text-foreground">₹1,53,600 / yr</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Employer EPF (12% of Basic)</span>
                  <span className="font-semibold text-foreground">₹51,000 / yr</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Statutory Gratuity (4.81%)</span>
                  <span className="font-semibold text-foreground">₹20,400 / yr</span>
                </div>
                <div className="flex justify-between py-1 border-t border-border/40">
                  <span className="text-muted-foreground">Group Mediclaim Insurance</span>
                  <span className="font-semibold text-foreground">₹30,000 / yr</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Tax Declaration (12BB) */}
        {activeTab === 'tax' && (
          <form onSubmit={handleTaxSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200">
              Form 12BB IT Declaration for Financial Year 2026-27 (Assessment Year 2027-28). Declared investments reduce monthly TDS deductions.
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Section 80C (PPF, ELSS, EPF, Life Insurance - Max ₹1,50,000)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    value={sec80c}
                    onChange={(e) => setSec80c(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-xs bg-card border border-border rounded-xl font-mono font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Section 80D (Health Insurance Premium - Max ₹25,000)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    value={sec80d}
                    onChange={(e) => setSec80d(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-xs bg-card border border-border rounded-xl font-mono font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Section 10(13A) House Rent Allowance (Annual Rent Paid)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground font-bold">₹</span>
                  <input
                    type="number"
                    value={annualRent}
                    onChange={(e) => setAnnualRent(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 text-xs bg-card border border-border rounded-xl font-mono font-bold text-foreground focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit Form 12BB Declaration</span>
            </button>
          </form>
        )}

        {/* 4. Form 16 */}
        {activeTab === 'form16' && (
          <div className="space-y-3">
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Form 16 (Part A & Part B)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Assessment Year 2026-27 • TRACES Certified
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  Signed
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employer TAN:</span>
                  <span className="font-mono font-bold text-foreground">BLRA19284F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total TDS Deposited:</span>
                  <span className="font-mono font-bold text-emerald-600">₹24,600</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => showToast('Downloading Form 16 PDF with digital signature...', 'success')}
                className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download Form 16 PDF</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payslip Detail BottomSheet with Collapsible Sections */}
      <BottomSheet
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`Payslip: ${selectedPayslip.monthYear}`}
        subtitle={`Disbursed: ${selectedPayslip.payDate} • Ref #${selectedPayslip.id}`}
      >
        <div className="space-y-4">
          {/* Hero Take Home */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
              Net Amount Paid
            </span>
            <div className="text-2xl font-black font-mono">
              ₹{selectedPayslip.netPay.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-100">
              Credited to HDFC Bank •••• 7293
            </span>
          </div>

          {/* 1. Collapsible Earnings */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setIsEarningsOpen(!isEarningsOpen)}
              className="w-full p-3 bg-muted/40 flex items-center justify-between text-xs font-bold text-foreground"
            >
              <span>Earnings (Gross: ₹{selectedPayslip.grossSalary.toLocaleString('en-IN')})</span>
              {isEarningsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isEarningsOpen && (
              <div className="p-3 space-y-2 text-xs">
                {selectedPayslip.earnings.map((e, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">{e.name}</span>
                    <span className="font-semibold text-foreground font-mono">
                      ₹{e.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Collapsible Deductions */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setIsDeductionsOpen(!isDeductionsOpen)}
              className="w-full p-3 bg-muted/40 flex items-center justify-between text-xs font-bold text-foreground"
            >
              <span>Deductions (Total: ₹{selectedPayslip.totalDeductions.toLocaleString('en-IN')})</span>
              {isDeductionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isDeductionsOpen && (
              <div className="p-3 space-y-2 text-xs">
                {selectedPayslip.deductions.map((d, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold text-rose-500 font-mono">
                      -₹{d.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Collapsible Employer Contributions */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setIsEmployerOpen(!isEmployerOpen)}
              className="w-full p-3 bg-muted/40 flex items-center justify-between text-xs font-bold text-foreground"
            >
              <span>Employer Contributions</span>
              {isEmployerOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isEmployerOpen && (
              <div className="p-3 space-y-2 text-xs">
                {selectedPayslip.employerContributions.map((ec, i) => (
                  <div key={i} className="flex justify-between py-0.5">
                    <span className="text-muted-foreground">{ec.name}</span>
                    <span className="font-semibold text-primary font-mono">
                      ₹{ec.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => handleDownloadPdf(selectedPayslip.monthYear)}
              className="flex-1 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleShare(selectedPayslip.monthYear)}
              className="py-3 px-4 rounded-xl bg-card border border-border text-foreground font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition hover:bg-muted"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
