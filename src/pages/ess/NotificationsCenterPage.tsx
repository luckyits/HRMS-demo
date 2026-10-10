import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Megaphone,
  Radio,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

interface AnnouncementItem {
  id: string
  title: string
  category: 'Company Wide' | 'HR Update' | 'Celebration' | 'Emergency Advisory'
  date: string
  author: string
  authorRole: string
  pinned: boolean
  content: string
}

interface NotificationAlert {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'approval' | 'attendance' | 'payroll' | 'general'
  isRead: boolean
  actionUrl?: string
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ANN-01',
    title: 'Annual Company Townhall & Strategic Roadmap FY 2027',
    category: 'Company Wide',
    date: 'Oct 08, 2026',
    author: 'Sunil Kulkarni',
    authorRole: 'Chief Executive Officer',
    pinned: true,
    content: 'We invite all team members across all branches, manufacturing sites, and remote centers to participate in our quarterly global townhall. The leadership team will unveil our expansion roadmap, key project milestones, and announce annual excellence awards.',
  },
  {
    id: 'ANN-02',
    title: 'Diwali Festive Holiday Calendar & Gift Hamper Distribution',
    category: 'Celebration',
    date: 'Oct 06, 2026',
    author: 'HR Operations Desk',
    authorRole: 'People & Culture',
    pinned: false,
    content: 'In celebration of Diwali and the festival of lights, our offices and factory hubs will observe designated festival breaks. Pre-ordered festive gift packages will be distributed at your local facility reception starting Oct 28.',
  },
  {
    id: 'ANN-03',
    title: 'Quarterly Infrastructure & Biometric Server Maintenance Window',
    category: 'Emergency Advisory',
    date: 'Oct 04, 2026',
    author: 'IT Infrastructure Council',
    authorRole: 'Systems & Security',
    pinned: false,
    content: 'Planned server optimization will occur on Saturday from 11:00 PM to 03:00 AM IST. Biometric punch devices will operate in offline caching mode during this interval.',
  },
]

const INITIAL_USER_NOTIFICATIONS: NotificationAlert[] = [
  {
    id: 'NOT-1',
    title: 'Leave Request LV-900 Approved',
    description: 'Vikram Malhotra approved your Casual Leave for Sep 24.',
    timestamp: '2 hours ago',
    type: 'approval',
    isRead: false,
  },
  {
    id: 'NOT-2',
    title: 'September 2026 Payslip Ready',
    description: 'Your salary statement for September has been finalized and credited.',
    timestamp: '1 day ago',
    type: 'payroll',
    isRead: false,
    actionUrl: '/employee/payslips',
  },
  {
    id: 'NOT-3',
    title: 'Punch In Verification Confirmed',
    description: 'Face biometric verification confirmed for morning shift at 09:12 AM.',
    timestamp: 'Yesterday',
    type: 'attendance',
    isRead: true,
  },
  {
    id: 'NOT-4',
    title: 'Document Verified: PAN Card',
    description: 'Your uploaded PAN Card credential was verified by HR compliance.',
    timestamp: '3 days ago',
    type: 'general',
    isRead: true,
  },
]

export const NotificationsCenterPage: React.FC = () => {
  const [announcements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS)
  const [notifications, setNotifications] = useState<NotificationAlert[]>(INITIAL_USER_NOTIFICATIONS)
  const [filterType, setFilterType] = useState<string>('All')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    )
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'All') return true
    if (filterType === 'Unread') return !n.isRead
    return n.type === filterType.toLowerCase()
  })

  return (
    <FeatureGate feature="ANNOUNCEMENT">
      <div className="space-y-6">
        <PageHeader
          title="Announcements & Notification Center"
          subtitle="Enterprise communications, executive broadcasts, and personal workflow updates"
          action={
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Mark all as read
                </button>
              )}
            </div>
          }
        />

        {/* Section 1: Executive & Company Announcements Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Company Broadcasts & Bulletins
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  ann.pinned
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800 hover:shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === 'Emergency Advisory'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : ann.category === 'Celebration'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                    }`}>
                      {ann.category}
                    </span>
                    {ann.pinned && (
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Radio className="w-3 h-3 animate-pulse" /> Pinned
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {ann.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {ann.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{ann.author}</span>
                  <span>{ann.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Personal Notifications Stream */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Personal Notifications Activity Stream
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {/* Filter tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Unread', 'Approval', 'Attendance', 'Payroll'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === type
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs">
                No notifications matching current criteria.
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                    !notif.isRead
                      ? 'bg-indigo-50/30 dark:bg-indigo-950/20'
                      : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                      !notif.isRead ? 'bg-indigo-600' : 'bg-transparent'
                    }`} />

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {notif.description}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notif.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleRead(notif.id)}
                      className="text-[11px] text-slate-500 hover:text-indigo-600 font-medium"
                    >
                      {notif.isRead ? 'Mark unread' : 'Mark read'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcement Detail Modal */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                  {selectedAnnouncement.category}
                </span>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedAnnouncement.title}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Published by {selectedAnnouncement.author} ({selectedAnnouncement.authorRole}) • {selectedAnnouncement.date}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal whitespace-pre-line">
                {selectedAnnouncement.content}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Close Bulletin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
export default NotificationsCenterPage
