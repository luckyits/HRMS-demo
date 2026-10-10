import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { SensitiveField } from '@/components/common/SensitiveField'
import { INITIAL_PAYSLIPS, type PayslipRecord } from '@/mock/essData'
import { usePayroll } from '@/context/PayrollContext'
import {
  AlertCircle,
  Banknote,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Layers,
  Percent,
  Printer,
  Shield,
  TrendingUp,
  CreditCard,
  Building,
} from 'lucide-react'
import React, { useState, useMemo } from 'react'

export const PayslipsPage: React.FC = () => {
  const { payrollRuns } = usePayroll()
  const [activeTab, setActiveTab] = useState<'payslip' | 'ctc' | 'tax' | 'form16'>('payslip')
  const [selectedPayslipId, setSelectedPayslipId] = useState<string>(INITIAL_PAYSLIPS[0]?.id || '')

  // Dynamic payslips from PayrollRuns
  const livePayslips = useMemo(() => {
    const list = [...INITIAL_PAYSLIPS]
    payrollRuns.forEach((run) => {
      const ps = run.payslips.find((p) => p.employeeId === 'EMP-104')
      if (ps && !list.some((l) => l.monthYear === ps.month)) {
        list.unshift({
          id: ps.id,
          monthYear: ps.month,
          period: `01 ${ps.month.split(' ')[0]} - 30 ${ps.month.split(' ')[0]}`,
          payDate: `30 ${ps.month.split(' ')[0]} ${ps.month.split(' ')[1]}`,
          grossSalary: ps.grossEarnings,
          totalDeductions: ps.totalDeductions,
          netPay: ps.netSalary,
          earnings: [
            { name: 'Basic Salary', amount: ps.basic },
            { name: 'House Rent Allowance (HRA)', amount: ps.hra },
            { name: 'Special Allowance', amount: ps.specialAllowance },
            { name: 'Incentives & Bonus', amount: ps.incentives },
            { name: 'Reimbursements', amount: ps.reimbursements },
          ],
          deductions: [
            { name: 'Provident Fund (EPF)', amount: ps.providentFund },
            { name: 'Professional Tax (PT)', amount: ps.professionalTax },
            { name: 'Income Tax TDS', amount: ps.taxDeductedAtSource },
            { name: 'Loan Recovery', amount: ps.loanEmiRecovery },
          ],
          employerContributions: [
            { name: 'Employer PF Contribution (12%)', amount: Math.round(Math.min(ps.basic, 15000) * 0.12) },
            { name: 'Gratuity Provisioning', amount: Math.round((ps.basic * 15) / 26 / 12) },
          ],
        })
      }
    })
    return list
  }, [payrollRuns])

  // Tax declaration state
  const [taxRegime, setTaxRegime] = useState<'new' | 'old'>('new')
  const [sec80c, setSec80c] = useState('150000')
  const [sec80d, setSec80d] = useState('25000')
  const [rentPaid, setRentPaid] = useState('240000')
  const [nps80ccd, setNps80ccd] = useState('50000')
  const [taxSavedNotice, setTaxSavedNotice] = useState(false)

  const selectedSlip = livePayslips.find((s) => s.id === selectedPayslipId) || livePayslips[0]

  const handleSaveTaxDeclaration = (e: React.FormEvent) => {
    e.preventDefault()
    setTaxSavedNotice(true)
    setTimeout(() => setTaxSavedNotice(false), 4000)
  }

  return (
    <FeatureGate feature="PAYSLIP">
      <div className="space-y-6">
        <PageHeader
          title="Payroll & Compensation Hub"
          subtitle="Monthly salary statements, annual cost-to-company breakdown, IT declaration, and Form 16"
          action={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Direct Bank Deposit: HDFC Bank
              </span>
            </div>
          }
        />

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('payslip')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'payslip'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4" />
            Monthly Payslip
          </button>
          <button
            onClick={() => setActiveTab('ctc')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'ctc'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            CTC Breakdown
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'tax'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            Tax Declaration (12BB)
          </button>
          <button
            onClick={() => setActiveTab('form16')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
              activeTab === 'form16'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Form 16 Certificates
          </button>
        </div>

        {/* Tab 1: Monthly Payslip */}
        {activeTab === 'payslip' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Month Selector */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Statement Month
              </h3>
              <div className="space-y-2">
                {livePayslips.map((slip) => (
                  <button
                    key={slip.id}
                    onClick={() => setSelectedPayslipId(slip.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedPayslipId === slip.id
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {slip.monthYear}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                      <span>Net: ₹{slip.netPay.toLocaleString('en-IN')}</span>
                      <span>Paid: {slip.payDate}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Summary card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Bank Disbursal Info
                </div>
                <div className="text-slate-500">
                  Account: <SensitiveField value="HDFC0001824 - XXXX4819" />
                </div>
                <div className="text-slate-500">
                  Status: <span className="text-emerald-600 font-semibold">Credited Successfully</span>
                </div>
              </div>
            </div>

            {/* Right Detailed Payslip Viewer */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
                {/* Payslip Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                      Universal Enterprise Solutions Private Limited
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                      Salary Slip for {selectedSlip.monthYear}
                    </h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Pay Period: {selectedSlip.period} • Disbursed: {selectedSlip.payDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Simulating PDF download of Payslip ${selectedSlip.monthYear}`)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                      title="Print"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Employee Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                  <div>
                    <span className="text-slate-400">Employee Name:</span>
                    <div className="font-bold text-slate-900 dark:text-white">Priya Sharma</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Employee Code:</span>
                    <div className="font-bold text-slate-900 dark:text-white">EMP-0418</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Department / Role:</span>
                    <div className="font-bold text-slate-900 dark:text-white">Sales / Manager</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Working Days / LOP:</span>
                    <div className="font-bold text-slate-900 dark:text-white">30 / 0 Days</div>
                  </div>
                  <div>
                    <span className="text-slate-400">PAN Number:</span>
                    <div><SensitiveField value="ABCPS8912K" /></div>
                  </div>
                  <div>
                    <span className="text-slate-400">UAN Number:</span>
                    <div><SensitiveField value="101928374650" /></div>
                  </div>
                  <div>
                    <span className="text-slate-400">PF Number:</span>
                    <div><SensitiveField value="KN/BNG/0048192/000" /></div>
                  </div>
                  <div>
                    <span className="text-slate-400">Bank Account:</span>
                    <div><SensitiveField value="HDFC - 0029" /></div>
                  </div>
                </div>

                {/* Earnings & Deductions Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Earnings */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex justify-between">
                      <span>Earnings</span>
                      <span>Amount (₹)</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {selectedSlip.earnings.map((e, i) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between text-slate-700 dark:text-slate-300">
                          <span>{e.name}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            ₹{e.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 font-bold flex justify-between text-slate-900 dark:text-white">
                        <span>Gross Earnings</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ₹{selectedSlip.grossSalary.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex justify-between">
                      <span>Deductions</span>
                      <span>Amount (₹)</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {selectedSlip.deductions.map((d, i) => (
                        <div key={i} className="px-4 py-2.5 flex justify-between text-slate-700 dark:text-slate-300">
                          <span>{d.name}</span>
                          <span className="font-semibold text-rose-600 dark:text-rose-400">
                            ₹{d.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 font-bold flex justify-between text-slate-900 dark:text-white">
                        <span>Total Deductions</span>
                        <span className="text-rose-600 dark:text-rose-400">
                          ₹{selectedSlip.totalDeductions.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employer Contributions */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex justify-between">
                    <span>Employer Statutory Contributions (Not deducted from take-home)</span>
                    <span>Amount (₹)</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {selectedSlip.employerContributions.map((ec, i) => (
                      <div key={i} className="px-4 py-2.5 flex justify-between text-slate-600 dark:text-slate-400">
                        <span>{ec.name}</span>
                        <span>₹{ec.amount.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Net Pay Banner */}
                <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-indigo-700 dark:text-indigo-300 tracking-wider">
                      Net Salary Disbursed (Take Home)
                    </span>
                    <div className="text-2xl font-black text-indigo-950 dark:text-indigo-100 mt-0.5">
                      ₹{selectedSlip.netPay.toLocaleString('en-IN')}
                    </div>
                    <div className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                      In Words: <em>One Lakh Twenty-Four Thousand Five Hundred Rupees Only</em>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-500">
                    <div>Electronic system generated statement.</div>
                    <div>No physical signature required.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CTC Breakdown */}
        {activeTab === 'ctc' && (
          <div className="space-y-6">
            <div className="p-6 bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">
                  Annual Cost to Company (CTC)
                </span>
                <div className="text-3xl font-black tracking-tight mt-1">
                  ₹18,50,000 <span className="text-sm font-normal text-indigo-200">/ annum</span>
                </div>
                <div className="text-xs text-indigo-300 mt-1">
                  Monthly Total Gross Value: ₹1,54,166
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs space-y-1">
                <div><strong>Grade:</strong> M4 (Senior Management)</div>
                <div><strong>Revision Cycle:</strong> Annual (Next: April 2027)</div>
                <div><strong>Variable Component:</strong> Up to 15% Performance Incentive</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                Detailed Compensation Structure
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Salary Component</th>
                    <th className="px-4 py-3">Monthly (₹)</th>
                    <th className="px-4 py-3">Annual (₹)</th>
                    <th className="px-4 py-3">Taxability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-semibold">Basic Salary (50% of Gross)</td>
                    <td className="px-4 py-3 font-mono">₹77,083</td>
                    <td className="px-4 py-3 font-mono">₹9,25,000</td>
                    <td className="px-4 py-3 text-slate-500">Fully Taxable</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">House Rent Allowance (HRA)</td>
                    <td className="px-4 py-3 font-mono">₹38,541</td>
                    <td className="px-4 py-3 font-mono">₹4,62,500</td>
                    <td className="px-4 py-3 text-emerald-600">Exemption u/s 10(13A)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Special Allowance</td>
                    <td className="px-4 py-3 font-mono">₹30,000</td>
                    <td className="px-4 py-3 font-mono">₹3,60,000</td>
                    <td className="px-4 py-3 text-slate-500">Fully Taxable</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Employer PF Contribution (12% of Basic)</td>
                    <td className="px-4 py-3 font-mono">₹9,250</td>
                    <td className="px-4 py-3 font-mono">₹1,11,000</td>
                    <td className="px-4 py-3 text-emerald-600">Tax Exempt up to ₹7.5L</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Gratuity Contribution (4.81%)</td>
                    <td className="px-4 py-3 font-mono">₹3,707</td>
                    <td className="px-4 py-3 font-mono">₹44,484</td>
                    <td className="px-4 py-3 text-emerald-600">Exempt on Vesting</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tax Declaration (12BB) */}
        {activeTab === 'tax' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Investment Declaration & Tax Regime Selection (FY 2026-27)
              </h3>
              <p className="text-xs text-slate-500">
                Submit planned investments to lower monthly TDS deduction under the IT Act
              </p>
            </div>

            {taxSavedNotice && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Tax declaration successfully saved and submitted to Payroll Admin for TDS recalibration!
              </div>
            )}

            <form onSubmit={handleSaveTaxDeclaration} className="space-y-6">
              {/* Regime toggle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Tax Regime Selection
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                    taxRegime === 'new'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="regime"
                      checked={taxRegime === 'new'}
                      onChange={() => setTaxRegime('new')}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold">New Tax Regime (Section 115BAC) - Default</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Lower tax slab rates, Standard deduction ₹75,000, no chapter VI-A deductions.
                      </div>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${
                    taxRegime === 'old'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="regime"
                      checked={taxRegime === 'old'}
                      onChange={() => setTaxRegime('old')}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-xs font-bold">Old Tax Regime (With Chapter VI-A Exemptions)</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Claim HRA exemption, Section 80C (up to ₹1.5L), 80D medical and NPS.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Declaration Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Section 80C Deductions (ELSS, PPF, Life Insurance)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      value={sec80c}
                      onChange={(e) => setSec80c(e.target.value)}
                      disabled={taxRegime === 'new'}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Maximum allowable limit: ₹1,50,000</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Section 80D Health Insurance (Self & Parents)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      value={sec80d}
                      onChange={(e) => setSec80d(e.target.value)}
                      disabled={taxRegime === 'new'}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Mediclaim premium receipts</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Annual Rent Paid for HRA Exemption (10(13A))
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      value={rentPaid}
                      onChange={(e) => setRentPaid(e.target.value)}
                      disabled={taxRegime === 'new'}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Rent agreement and landlord receipts mandatory</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Section 80CCD(1B) National Pension Scheme (NPS)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">₹</span>
                    <input
                      type="number"
                      value={nps80ccd}
                      onChange={(e) => setNps80ccd(e.target.value)}
                      disabled={taxRegime === 'new'}
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">Additional voluntary deduction up to ₹50,000</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Save Tax Declaration
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Form 16 Certificates */}
        {activeTab === 'form16' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Annual Tax Withholding Certificates (Form 16)
            </h3>
            <p className="text-xs text-slate-500">
              Generated in accordance with Section 203 of the Income-tax Act, 1961 for filing ITR
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assessment Year 2026-27 (Financial Year 2025-26)
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Signed & Digitally Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Includes TRACES Part A (TDS challan deposits) and Part B (Annexure of salary breakup)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Simulating download of Form 16 Part A')}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Part A
                  </button>
                  <button
                    onClick={() => alert('Simulating download of Form 16 Part B')}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Part B
                  </button>
                </div>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assessment Year 2025-26 (Financial Year 2024-25)
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      Archived
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Previous year statutory filing record
                  </div>
                </div>

                <button
                  onClick={() => alert('Simulating download of archived Form 16')}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Complete Form 16
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
export default PayslipsPage
