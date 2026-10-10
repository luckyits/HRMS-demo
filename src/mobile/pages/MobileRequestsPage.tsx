import React, { useState } from 'react'
import { Plus, Calendar, Clock, Receipt, CheckCircle, AlertCircle, Send } from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { SegmentedControl } from '@/mobile/components/SegmentedControl'
import { ListCard } from '@/mobile/components/ListCard'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { StickyActionBar } from '@/mobile/components/StickyActionBar'
import { useToast } from '@/context/ToastContext'

export const MobileRequestsPage: React.FC = () => {
  const { showToast } = useToast()
  const [selectedTab, setSelectedTab] = useState<'leaves' | 'reg' | 'claims'>('leaves')
  const [sheetOpen, setSheetOpen] = useState(false)

  // Leave Form State
  const [leaveType, setLeaveType] = useState('Casual Leave')
  const [leaveDays, setLeaveDays] = useState('2')
  const [leaveReason, setLeaveReason] = useState('')

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault()
    showToast(`Leave application for ${leaveDays} days (${leaveType}) submitted to manager for approval!`, 'success')
    setSheetOpen(false)
    setLeaveReason('')
  }

  const tabs = [
    { id: 'leaves', label: 'Leaves', count: 2 },
    { id: 'reg', label: 'Regularize', count: 1 },
    { id: 'claims', label: 'Claims', count: 3 },
  ]

  const mockLeaves = [
    { id: '1', title: 'Casual Leave (2 Days)', subtitle: 'Oct 14 – Oct 15, 2026', status: 'Pending Manager', statusVariant: 'warning' as const, reason: 'Family engagement in Pune' },
    { id: '2', title: 'Sick Leave (1 Day)', subtitle: 'Oct 06, 2026', status: 'Approved', statusVariant: 'success' as const, reason: 'Viral fever rest' },
  ]

  const mockRegularizations = [
    { id: 'r1', title: 'Missed Punch In', subtitle: 'Oct 07, 2026 • 09:15 AM', status: 'Approved', statusVariant: 'success' as const, reason: 'Biometric gate queue delay' },
  ]

  const mockClaims = [
    { id: 'c1', title: 'Client Travel Reimbursement', subtitle: 'Oct 08, 2026 • ₹1,450', status: 'Pending Finance', statusVariant: 'warning' as const, reason: 'Auto taxi to Hinjewadi client' },
    { id: 'c2', title: 'Team Project Dinner', subtitle: 'Sep 29, 2026 • ₹3,200', status: 'Approved', statusVariant: 'success' as const, reason: 'Sprint release celebration' },
  ]

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader
        title="Requests Hub"
        subtitle="Track & submit workforce applications"
        showBack={false}
      />

      <div className="p-4 space-y-4">
        <SegmentedControl
          options={tabs}
          selectedId={selectedTab}
          onSelect={(id) => setSelectedTab(id as any)}
        />

        {/* Requests List */}
        <div className="space-y-2.5">
          {selectedTab === 'leaves' &&
            mockLeaves.map((item) => (
              <ListCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                status={item.status}
                statusVariant={item.statusVariant}
                fields={[
                  { label: 'Reason', value: item.reason },
                  { label: 'Approval Path', value: 'Supervisor -> HR' },
                ]}
              />
            ))}

          {selectedTab === 'reg' &&
            mockRegularizations.map((item) => (
              <ListCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                status={item.status}
                statusVariant={item.statusVariant}
                fields={[
                  { label: 'Justification', value: item.reason },
                  { label: 'Punch Fixed', value: '09:15 AM' },
                ]}
              />
            ))}

          {selectedTab === 'claims' &&
            mockClaims.map((item) => (
              <ListCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                status={item.status}
                statusVariant={item.statusVariant}
                fields={[
                  { label: 'Voucher Note', value: item.reason },
                  { label: 'Receipt Status', value: 'Receipt Uploaded' },
                ]}
              />
            ))}
        </div>
      </div>

      {/* Sticky Bottom Action for Applying */}
      <StickyActionBar
        primaryLabel={`Apply ${selectedTab === 'leaves' ? 'Leave' : selectedTab === 'reg' ? 'Regularization' : 'Claim'}`}
        onPrimaryClick={() => setSheetOpen(true)}
        primaryIcon={<Plus className="w-5 h-5" />}
        aboveTabBar={true}
      />

      {/* BottomSheet for Leave Application */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Apply Leave"
        subtitle="Select leave category and dates"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="Casual Leave">Casual Leave (Balance: 7)</option>
              <option value="Sick Leave">Sick Leave (Balance: 5)</option>
              <option value="Earned Leave">Earned Leave (Balance: 12)</option>
              <option value="Compensatory Off">Comp-off (Balance: 2)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Number of Days
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              max="15"
              required
              value={leaveDays}
              onChange={(e) => setLeaveDays(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Attending wedding ceremony at hometown..."
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <Send className="w-4 h-4" />
              <span>Submit to Manager</span>
            </button>
          </div>
        </form>
      </BottomSheet>
    </div>
  )
}
