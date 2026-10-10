import React, { useState } from 'react'
import { CheckCircle2, XCircle, Filter, Check, X } from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ChipFilterRow } from '@/mobile/components/ChipFilterRow'
import { SwipeableCard } from '@/mobile/components/SwipeableCard'
import { useToast } from '@/context/ToastContext'

interface ApprovalRequest {
  id: string
  title: string
  subtitle: string
  category: 'leave' | 'expense' | 'overtime'
  details: { label: string; value: string }[]
  statusBadge: string
}

export const MobileApprovalsPage: React.FC = () => {
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')

  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: 'app-1',
      title: 'Priya Sharma • Casual Leave',
      subtitle: '2 Days (Oct 14 - Oct 15, 2026)',
      category: 'leave',
      details: [
        { label: 'Department', value: 'Quality Assurance' },
        { label: 'Reason', value: 'Family wedding event' },
      ],
      statusBadge: 'Needs Sign-off',
    },
    {
      id: 'app-2',
      title: 'Deepak Patel • Overtime (Plant)',
      subtitle: '3.5 Hours on Oct 08, 2026',
      category: 'overtime',
      details: [
        { label: 'Shift Duty', value: 'Line 2 Boiler Extra Shift' },
        { label: 'Rate / Payout', value: '2.0x (Double Rate)' },
      ],
      statusBadge: 'Supervisor OT',
    },
    {
      id: 'app-3',
      title: 'Rohan Mehta • Client Travel',
      subtitle: 'Expense Claim • ₹2,450',
      category: 'expense',
      details: [
        { label: 'Client', value: 'HDFC Bank Nariman Point' },
        { label: 'Receipt', value: 'Uber invoice attached' },
      ],
      statusBadge: 'Voucher',
    },
    {
      id: 'app-4',
      title: 'Kavita Iyer • Sick Leave',
      subtitle: '1 Day on Oct 12, 2026',
      category: 'leave',
      details: [
        { label: 'Department', value: 'Operations' },
        { label: 'Reason', value: 'Doctor appointment' },
      ],
      statusBadge: 'Medical',
    },
  ])

  const handleApprove = (id: string) => {
    const item = requests.find((r) => r.id === id)
    setRequests((prev) => prev.filter((r) => r.id !== id))
    showToast(`Approved request for ${item?.title || 'Employee'} successfully!`, 'success')
  }

  const handleReject = (id: string) => {
    const item = requests.find((r) => r.id === id)
    setRequests((prev) => prev.filter((r) => r.id !== id))
    showToast(`Request for ${item?.title || 'Employee'} rejected with remarks.`, 'info')
  }

  const chips = [
    { id: 'all', label: 'All Requests', count: requests.length },
    { id: 'leave', label: 'Leaves', count: requests.filter((r) => r.category === 'leave').length },
    { id: 'overtime', label: 'Overtime', count: requests.filter((r) => r.category === 'overtime').length },
    { id: 'expense', label: 'Expenses', count: requests.filter((r) => r.category === 'expense').length },
  ]

  const filteredRequests = filter === 'all' ? requests : requests.filter((r) => r.category === filter)

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader
        title="Pending Approvals"
        subtitle={`${requests.length} team items awaiting sign-off`}
        showBack={false}
      />

      <div className="p-4 space-y-4">
        {/* Filter chips row */}
        <ChipFilterRow chips={chips} selectedId={filter} onSelect={setFilter} />

        {/* Swipe instructions banner */}
        <div className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center justify-between">
          <span>Swipe right to approve • Swipe left to reject</span>
          <span className="text-[10px] font-bold uppercase bg-indigo-500/20 px-1.5 py-0.5 rounded">
            Fast Action
          </span>
        </div>

        {/* Swipeable cards list */}
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-3xl space-y-2 mt-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-sm text-foreground">Inbox Zero!</h4>
            <p className="text-xs text-muted-foreground">All team requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((req) => (
              <SwipeableCard
                key={req.id}
                id={req.id}
                title={req.title}
                subtitle={req.subtitle}
                category={req.category}
                details={req.details}
                statusBadge={req.statusBadge}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
