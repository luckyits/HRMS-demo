import React from 'react'
import { Download, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { useToast } from '@/context/ToastContext'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'

export const MobilePayslipsPage: React.FC = () => {
  const { showToast } = useToast()

  const handleDownload = () => {
    showToast('Downloading encrypted payslip PDF (Sept 2026)...', 'success')
  }

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader title="Salary & Payslip" subtitle="September 2026 Voucher" showBack={false} />

      <div className="p-4 space-y-4">
        {/* Big Net Salary Hero Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md text-center space-y-2">
          <span className="text-xs uppercase tracking-wider text-emerald-100 font-bold block">
            Net Take-Home Salary
          </span>
          <div className="text-4xl font-black tracking-tight">₹64,250</div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Credited to HDFC •••• 4012</span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="p-5 rounded-3xl bg-card border border-border shadow-xs space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Earnings Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Basic Salary</span>
                <span className="font-bold text-foreground">₹35,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">House Rent Allowance (HRA)</span>
                <span className="font-bold text-foreground">₹17,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Special Allowance</span>
                <span className="font-bold text-foreground">₹14,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Overtime / Attendance Bonus</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹3,500</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm">
                <span>Gross Earnings</span>
                <span className="text-primary">₹70,200</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Statutory Deductions
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Provident Fund (EPF 12%)</span>
                <span className="font-semibold text-rose-500">-₹4,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Professional Tax (PT)</span>
                <span className="font-semibold text-rose-500">-₹200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Income Tax TDS</span>
                <span className="font-semibold text-rose-500">-₹1,550</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between font-bold text-sm">
                <span>Total Deductions</span>
                <span className="text-rose-600 dark:text-rose-400">-₹5,950</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Note */}
        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-[11px] text-muted-foreground flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Statutory EPF & PT contributions deposited with EPFO portal. Form 16 available.</span>
        </div>
      </div>

      <StickyActionBar
        primaryLabel="Download PDF Voucher"
        onPrimaryClick={handleDownload}
        primaryIcon={<Download className="w-5 h-5" />}
        aboveTabBar={true}
      />
    </div>
  )
}
