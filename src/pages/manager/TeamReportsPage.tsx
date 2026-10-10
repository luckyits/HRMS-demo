import { Can } from '@/components/common/Can'
import { ExportNotice } from '@/components/common/ExportNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileSpreadsheet,
  LineChart,
  PieChart,
  Receipt,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const TeamReportsPage: React.FC = () => {
  const { employees } = useEmployees()

  const [activeReport, setActiveReport] = useState<'attendance' | 'overtime' | 'expense'>('attendance')

  const team = useMemo(() => {
    return employees.filter(
      (e) => e.department === 'Engineering' || e.reportingManagerName === 'Vikram Malhotra'
    )
  }, [employees])

  const reportData = useMemo(() => {
    return team.map((emp, i) => ({
      id: emp.id,
      name: emp.name,
      designation: emp.designation,
      presentRate: `${92 + (i % 7)}%`,
      otHours: `${(i % 5) * 2.5} hrs`,
      otAmount: `₹ ${((i % 5) * 1250).toLocaleString('en-IN')}`,
      expensesClaimed: `₹ ${((i % 4 + 1) * 3500).toLocaleString('en-IN')}`,
      expensesApproved: `₹ ${((i % 4 + 1) * 3200).toLocaleString('en-IN')}`,
    }))
  }, [team])

  const handleExport = () => {
    alert(`Exported Team ${activeReport.toUpperCase()} Report to CSV (Logged in Audit Log)`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Team Operational Reports & Analytics"
        subtitle="Departmental insights on attendance compliance, overtime payouts, and approved travel reimbursement totals."
        action={
          <Can action="export" feature="TEAM_REPORTS">
            <div className="flex items-center gap-2.5">
              <ExportNotice compact />
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-muted text-foreground transition shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export {activeReport.toUpperCase()}</span>
              </button>
            </div>
          </Can>
        }
      />

      {/* Report Switcher Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveReport('attendance')}
          className={cn(
            'px-4 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-2',
            activeReport === 'attendance'
              ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
              : 'bg-card border-border text-foreground hover:bg-muted'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Attendance Compliance</span>
        </button>

        <button
          onClick={() => setActiveReport('overtime')}
          className={cn(
            'px-4 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-2',
            activeReport === 'overtime'
              ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
              : 'bg-card border-border text-foreground hover:bg-muted'
          )}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Overtime Ledger</span>
        </button>

        <button
          onClick={() => setActiveReport('expense')}
          className={cn(
            'px-4 py-2 text-xs font-semibold rounded-xl border transition flex items-center gap-2',
            activeReport === 'expense'
              ? 'bg-primary text-primary-foreground border-primary shadow-2xs'
              : 'bg-card border-border text-foreground hover:bg-muted'
          )}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Travel & Expense Vouchers</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="p-3">Team Member</th>
              <th className="p-3">Designation</th>
              {activeReport === 'attendance' && (
                <>
                  <th className="p-3">Attendance Rate</th>
                  <th className="p-3">Late In Frequency</th>
                  <th className="p-3 text-right">Compliance Rating</th>
                </>
              )}
              {activeReport === 'overtime' && (
                <>
                  <th className="p-3">Overtime Hours</th>
                  <th className="p-3">Calculated Rate</th>
                  <th className="p-3 text-right">OT Payout Total</th>
                </>
              )}
              {activeReport === 'expense' && (
                <>
                  <th className="p-3">Total Vouchers Claimed</th>
                  <th className="p-3">Disbursed Amount</th>
                  <th className="p-3 text-right">Approval Rate</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reportData.map((row) => (
              <tr key={row.id} className="hover:bg-muted/30 transition">
                <td className="p-3 font-semibold text-foreground">{row.name}</td>
                <td className="p-3 text-muted-foreground">{row.designation}</td>
                {activeReport === 'attendance' && (
                  <>
                    <td className="p-3 font-bold text-emerald-600">{row.presentRate}</td>
                    <td className="p-3 text-muted-foreground">1 Day</td>
                    <td className="p-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                        Compliant
                      </span>
                    </td>
                  </>
                )}
                {activeReport === 'overtime' && (
                  <>
                    <td className="p-3 font-semibold text-foreground">{row.otHours}</td>
                    <td className="p-3 text-muted-foreground">1.5x Standard Hourly</td>
                    <td className="p-3 text-right font-mono font-bold text-primary">{row.otAmount}</td>
                  </>
                )}
                {activeReport === 'expense' && (
                  <>
                    <td className="p-3 font-mono text-muted-foreground">{row.expensesClaimed}</td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{row.expensesApproved}</td>
                    <td className="p-3 text-right font-bold text-foreground">94%</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
