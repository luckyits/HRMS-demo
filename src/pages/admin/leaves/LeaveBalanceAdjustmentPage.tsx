import React, { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { LeaveSubNav } from '@/components/leaves/LeaveSubNav'
import { useAdminLeaves } from '@/context/AdminLeavesContext'
import { MOCK_EMPLOYEES } from '@/mock/employees'
import {
  History,
  Plus,
  Minus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  X,
  User,
} from 'lucide-react'

export const LeaveBalanceAdjustmentPage: React.FC = () => {
  const { ledger, leaveTypes, adjustBalance } = useAdminLeaves()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All')
  const [selectedTxnFilter, setSelectedTxnFilter] = useState('All')

  // Adjustment Modal State
  const [showModal, setShowModal] = useState(false)
  const [selectedEmpId, setSelectedEmpId] = useState(MOCK_EMPLOYEES[0]?.id || '')
  const [selectedLeaveTypeCode, setSelectedLeaveTypeCode] = useState('EL')
  const [adjustmentAction, setAdjustmentAction] = useState<'credit' | 'debit'>('credit')
  const [adjustmentDays, setAdjustmentDays] = useState(1.0)
  const [reason, setReason] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const filteredLedger = ledger.filter((entry) => {
    const matchesSearch =
      entry.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      selectedTypeFilter === 'All' || entry.leaveTypeCode === selectedTypeFilter
    const matchesTxn =
      selectedTxnFilter === 'All' || entry.transactionType.includes(selectedTxnFilter)
    return matchesSearch && matchesType && matchesTxn
  })

  const selectedEmployee = MOCK_EMPLOYEES.find((e) => e.id === selectedEmpId) || MOCK_EMPLOYEES[0]

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    const delta = adjustmentAction === 'credit' ? adjustmentDays : -adjustmentDays

    adjustBalance(
      selectedEmployee.id,
      selectedEmployee.name,
      selectedEmployee.avatar,
      selectedEmployee.department,
      selectedLeaveTypeCode,
      delta,
      reason.trim()
    )

    setShowModal(false)
    setReason('')
    setToastMessage(
      `Adjusted ${delta > 0 ? '+' : ''}${delta} ${selectedLeaveTypeCode} for ${selectedEmployee.name}.`
    )
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6">
      <LeaveSubNav />

      <PageHeader
        title="Leave Ledger & Balance Adjustments"
        subtitle="Chronological transaction ledger with credit/debit history and audit-compliant quota overrides"
        action={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
          >
            <History className="w-4 h-4" />
            <span>Adjust Employee Balance</span>
          </button>
        }
      />

      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search employee, ID, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-muted/40 border border-border rounded-lg"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg px-3 py-1.5"
          >
            <option value="All">All Leave Types</option>
            {leaveTypes.map((t) => (
              <option key={t.id} value={t.code}>
                {t.name} ({t.code})
              </option>
            ))}
          </select>

          <select
            value={selectedTxnFilter}
            onChange={(e) => setSelectedTxnFilter(e.target.value)}
            className="text-xs bg-muted/40 border border-border rounded-lg px-3 py-1.5"
          >
            <option value="All">All Transaction Types</option>
            <option value="Credit">Credits & Accruals</option>
            <option value="Debit">Debits (Availed)</option>
            <option value="Adjustment">Admin Adjustments</option>
            <option value="Encashment">Encashment</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Leave Type</th>
                <th className="p-3.5">Transaction Type</th>
                <th className="p-3.5 text-center">Delta (Days)</th>
                <th className="p-3.5 text-center">Closing Balance</th>
                <th className="p-3.5">Reason & Authorization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLedger.map((row) => {
                const isCredit = row.daysDelta > 0

                return (
                  <tr key={row.id} className="hover:bg-muted/15 transition-colors">
                    <td className="p-3.5 text-muted-foreground font-mono whitespace-nowrap">
                      {row.timestamp}
                    </td>

                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={row.avatar}
                        alt={row.employeeName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-foreground">{row.employeeName}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {row.employeeId} &bull; {row.department}
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold px-2 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">
                        {row.leaveTypeCode}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-foreground">
                      {row.transactionType}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          isCredit
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {isCredit ? `+${row.daysDelta}` : row.daysDelta}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-extrabold text-foreground text-sm">
                      {row.closingBalance.toFixed(1)}
                    </td>

                    <td className="p-3.5 max-w-xs">
                      <div className="text-foreground text-xs">{row.reason}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        By: <span className="font-semibold">{row.adjustedBy}</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Balance Adjustment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">Manual Leave Adjustment</h4>
                <p className="text-xs text-muted-foreground">
                  Direct credit or deduction with statutory audit tracking
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Select Employee
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                >
                  {MOCK_EMPLOYEES.slice(0, 15).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.id}) &bull; {e.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Leave Type
                  </label>
                  <select
                    value={selectedLeaveTypeCode}
                    onChange={(e) => setSelectedLeaveTypeCode(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl"
                  >
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.code}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Action Type
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-muted/40 p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setAdjustmentAction('credit')}
                      className={`text-xs py-1 rounded-lg font-semibold transition-all ${
                        adjustmentAction === 'credit'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      + Credit
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentAction('debit')}
                      className={`text-xs py-1 rounded-lg font-semibold transition-all ${
                        adjustmentAction === 'debit'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      - Debit
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Number of Days to Adjust
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="30"
                  value={adjustmentDays}
                  onChange={(e) => setAdjustmentDays(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-muted/40 border border-border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Compliance Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Compensatory credit granted for weekend server release, approved by VP Engineering."
                  className="w-full text-xs p-2.5 bg-muted/40 border border-border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs border border-border rounded-xl hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-sm"
                >
                  Post Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
