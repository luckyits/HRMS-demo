import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves } from '@/context/AdminLeavesContext'
import {
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  X,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export const CompOffEncashmentPage: React.FC = () => {
  const {
    compOffRequests,
    approveCompOff,
    rejectCompOff,
    encashmentRequests,
    approveEncashment,
    processEncashmentToPayroll,
  } = useAdminLeaves()

  const [activeTab, setActiveTab] = useState<'compoff' | 'encashment'>('compoff')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const pendingCompOffCount = compOffRequests.filter((c) => c.status === 'Pending').length
  const pendingEncashmentCount = encashmentRequests.filter((e) => e.status === 'Pending').length

  const handleApproveCompOff = (id: string, name: string) => {
    approveCompOff(id)
    setToastMessage(`Comp-off credit approved for ${name}. Added 1.0 day to balance.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleRejectCompOff = (id: string, name: string) => {
    rejectCompOff(id)
    setToastMessage(`Comp-off request rejected for ${name}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleApproveEncashment = (id: string, name: string) => {
    approveEncashment(id)
    setToastMessage(`Leave encashment approved for ${name}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleProcessPayroll = (id: string, name: string, netAmount: number) => {
    processEncashmentToPayroll(id)
    setToastMessage(`Pushed ₹${netAmount.toLocaleString()} to payroll disbursement batch for ${name}.`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Comp-Off & Leave Encashment Workbench"
        subtitle="Manage compensatory holiday grants for overtime duty and evaluate financial leave encashment claims"
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('compoff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'compoff'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Compensatory Off Grants</span>
          {pendingCompOffCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
              {pendingCompOffCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('encashment')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'encashment'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Leave Encashment Payouts</span>
          {pendingEncashmentCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
              {pendingEncashmentCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Comp-off Queue */}
      {activeTab === 'compoff' && (
        <div className="space-y-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Compensatory Leave Grant Governance
                </h4>
                <p className="text-xs text-muted-foreground">
                  Employees working on weekly-offs or public holidays receive 1.0 Comp-Off day valid for 60 calendar days
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {compOffRequests.map((req) => {
              const isPending = req.status === 'Pending'

              return (
                <div
                  key={req.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={req.avatar}
                        alt={req.employeeName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{req.employeeName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {req.employeeId} &bull; {req.department} &bull; {req.branch}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : req.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 p-3 bg-muted/20 border border-border rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Duty Date Worked
                      </span>
                      <span className="font-bold text-foreground text-sm">{req.workedDate}</span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Duration: {req.workedHours} Hours
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Credited Allowance
                      </span>
                      <span className="font-bold text-primary text-sm">
                        +{req.creditedDays} Comp-Off Day
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        Earned: {req.earnedDate}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Validity Expiry
                      </span>
                      <span className="font-bold text-amber-600 text-sm">{req.expiryDate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    <strong>Duty Description:</strong> &ldquo;{req.dutyDescription}&rdquo;
                  </p>

                  {isPending && (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
                      <button
                        onClick={() => handleRejectCompOff(req.id, req.employeeName)}
                        className="px-3.5 py-1.5 border border-rose-300 dark:border-rose-900 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveCompOff(req.id, req.employeeName)}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                      >
                        Approve & Credit Balance
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Encashment Queue */}
      {activeTab === 'encashment' && (
        <div className="space-y-4">
          <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Earned Leave Financial Encashment Workbench
                </h4>
                <p className="text-xs text-muted-foreground">
                  Statutory leave encashment formulas: Payout = (Daily Base Rate &times; Days) less statutory TDS withholding
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {encashmentRequests.map((enc) => {
              const isPending = enc.status === 'Pending'
              const isApproved = enc.status === 'Approved'

              return (
                <div
                  key={enc.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <img
                        src={enc.avatar}
                        alt={enc.employeeName}
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{enc.employeeName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {enc.employeeId} &bull; {enc.department} &bull; {enc.branch}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        enc.status === 'Processed to Payroll'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : enc.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {enc.status}
                    </span>
                  </div>

                  {/* Financial Payout Calculation Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4 p-3 bg-muted/20 border border-border rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Current EL Balance
                      </span>
                      <span className="font-extrabold text-foreground text-sm">
                        {enc.availableBalance} Days
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Requested Encashment
                      </span>
                      <span className="font-extrabold text-primary text-sm">
                        {enc.requestedDays} Days
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Gross Valuation
                      </span>
                      <span className="font-bold text-foreground text-sm">
                        ₹{enc.grossPayout.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Estimated Tax (TDS)
                      </span>
                      <span className="font-bold text-rose-600 text-sm">
                        -₹{enc.taxDeduction.toLocaleString()}
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                        Net Payout
                      </span>
                      <span className="font-black text-emerald-700 dark:text-emerald-300 text-base">
                        ₹{enc.netPayout.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {enc.remarks && (
                    <p className="text-xs text-muted-foreground">
                      <strong>Remarks:</strong> {enc.remarks}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
                    {isPending && (
                      <button
                        onClick={() => handleApproveEncashment(enc.id, enc.employeeName)}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                      >
                        Approve Encashment
                      </button>
                    )}
                    {isApproved && (
                      <button
                        onClick={() =>
                          handleProcessPayroll(enc.id, enc.employeeName, enc.netPayout)
                        }
                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 shadow-sm flex items-center gap-1.5"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Push to Payroll Batch</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
