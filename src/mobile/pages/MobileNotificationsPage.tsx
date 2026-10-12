import React, { useState } from 'react'
import {
  Bell,
  CheckCheck,
  Megaphone,
  Calendar,
  Banknote,
  Clock,
  ShieldAlert,
  Info,
  CheckCircle2
} from 'lucide-react'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { ChipFilterRow } from '@/mobile/components/ChipFilterRow'
import { useToast } from '@/context/ToastContext'
import { useAccess } from '@/access/useAccess'
import { useNavigate } from 'react-router-dom'

interface NotificationItem {
  id: string
  dayGroup: 'Today' | 'Yesterday' | 'Earlier this week'
  title: string
  message: string
  time: string
  isUnread: boolean
  isAnnouncement: boolean
  type: 'leave' | 'payroll' | 'shift' | 'policy' | 'broadcast'
}

export const MobileNotificationsPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { showToast } = useToast()

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'announcements'>('all')

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      dayGroup: 'Today',
      title: 'Company Townhall & Diwali Bonus Announcement',
      message: 'All-hands hybrid townhall scheduled for Friday 4 PM. Festive ex-gratia bonus details will be shared by Leadership.',
      time: '10:30 AM',
      isUnread: true,
      isAnnouncement: true,
      type: 'broadcast',
    },
    {
      id: 'n2',
      dayGroup: 'Today',
      title: 'Leave Application Approved',
      message: 'Your Casual Leave for 14 Oct 2026 has been approved by Vikram Malhotra.',
      time: '09:15 AM',
      isUnread: true,
      isAnnouncement: false,
      type: 'leave',
    },
    {
      id: 'n3',
      dayGroup: 'Yesterday',
      title: 'Salary Voucher Published',
      message: 'September 2026 payslip is ready. Net salary credited to your HDFC bank account.',
      time: '06:00 PM',
      isUnread: false,
      isAnnouncement: false,
      type: 'payroll',
    },
    {
      id: 'n4',
      dayGroup: 'Yesterday',
      title: 'New Night Shift Assigned',
      message: 'You have been scheduled for Night Shift C (10 PM - 6 AM) on 5th October.',
      time: '02:30 PM',
      isUnread: false,
      isAnnouncement: false,
      type: 'shift',
    },
    {
      id: 'n5',
      dayGroup: 'Earlier this week',
      title: 'POSH & Workplace Conduct Policy Revised',
      message: 'Annual policy update v2.4 published. Mandatory employee acknowledgement required.',
      time: '07 Oct',
      isUnread: false,
      isAnnouncement: true,
      type: 'policy',
    },
    {
      id: 'n6',
      dayGroup: 'Earlier this week',
      title: 'Outdoor Geo-Tracking Audit Notice',
      message: 'DPDP consent dashboard updated. Verify your GPS and camera biometric settings.',
      time: '06 Oct',
      isUnread: false,
      isAnnouncement: false,
      type: 'broadcast',
    },
  ])

  const navigate = useNavigate()

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })))
    showToast('All notifications marked as read', 'info')
  }

  const handleTapItem = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
    )

    if (item.type === 'leave') {
      navigate('/employee/leaves')
    } else if (item.type === 'payroll') {
      navigate('/employee/payslips')
    } else if (item.type === 'policy') {
      navigate('/employee/policies')
    } else if (item.type === 'shift') {
      navigate('/employee/attendance')
    }
  }

  const filteredItems = notifications.filter((n) => {
    if (activeFilter === 'unread') return n.isUnread
    if (activeFilter === 'announcements') return n.isAnnouncement
    return true
  })

  // Group notifications by day
  const dayGroups: ('Today' | 'Yesterday' | 'Earlier this week')[] = [
    'Today',
    'Yesterday',
    'Earlier this week',
  ]

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'broadcast':
        return <Megaphone className="w-4 h-4 text-primary" />
      case 'payroll':
        return <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      case 'leave':
        return <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      case 'shift':
        return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      case 'policy':
        return <ShieldAlert className="w-4 h-4 text-rose-500" />
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Notification Center"
        subtitle="Announcements & activity alerts"
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <ChipFilterRow
            chips={[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'announcements', label: 'Broadcasts' },
            ]}
            selectedId={activeFilter}
            onSelect={(id) => setActiveFilter(id as any)}
          />

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="p-1.5 text-xs text-primary font-semibold flex items-center gap-1 active:scale-95 transition shrink-0 ml-2"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mark read</span>
          </button>
        </div>

        {/* Grouped Notifications List */}
        <div className="space-y-5">
          {dayGroups.map((group) => {
            const groupItems = filteredItems.filter((i) => i.dayGroup === group)
            if (groupItems.length === 0) return null

            return (
              <div key={group} className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                  {group}
                </h4>

                <div className="space-y-2">
                  {groupItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleTapItem(item)}
                      className={`p-4 rounded-3xl bg-card border transition-all cursor-pointer shadow-2xs space-y-2 ${
                        item.isUnread
                          ? 'border-primary/40 ring-1 ring-primary/20 bg-primary/5'
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                            {getIcon(item.type)}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-foreground truncate">
                              {item.title}
                            </h5>
                            <span className="text-[10px] text-muted-foreground">
                              {item.time}
                            </span>
                          </div>
                        </div>

                        {item.isUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1 shadow-xs" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed pl-10">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
