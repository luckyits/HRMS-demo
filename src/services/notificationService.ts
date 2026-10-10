import { INITIAL_NOTIFICATIONS, type MockNotification } from '@/mock/notifications'

const NOTIFS_KEY = 'hrms_demo_notifications'

export const NotificationService = {
  getAll: (): MockNotification[] => {
    try {
      const stored = localStorage.getItem(NOTIFS_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_NOTIFICATIONS
  },

  markAllAsRead: (): MockNotification[] => {
    const list = NotificationService.getAll().map(n => ({ ...n, read: true }))
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list))
    return list
  },

  markAsRead: (id: string): MockNotification[] => {
    const list = NotificationService.getAll().map(n => (n.id === id ? { ...n, read: true } : n))
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list))
    return list
  },
}
