export interface MockNotification {
  id: string
  title: string
  message: string
  timestamp: string
  read: boolean
  type: 'approval' | 'attendance' | 'payroll' | 'alert'
}

export const INITIAL_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif-1',
    title: 'New Leave Request',
    message: 'Aarav Patel requested 3 days of Earned Leave for review.',
    timestamp: '10 mins ago',
    read: false,
    type: 'approval',
  },
  {
    id: 'notif-2',
    title: 'Shift Rotation Reminder',
    message: 'Weekly manufacturing plant roster finalized for Shift B.',
    timestamp: '1 hour ago',
    read: false,
    type: 'attendance',
  },
  {
    id: 'notif-3',
    title: 'Statutory Filing Deadline',
    message: 'Monthly PF & ESI return generation due in 2 days.',
    timestamp: 'Yesterday',
    read: true,
    type: 'payroll',
  },
]
