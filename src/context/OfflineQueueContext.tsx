import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { AuditLogService } from '@/services/auditLogService'

export interface OfflineQueueItem {
  id: string
  idempotencyKey: string
  type: 'punch' | 'visit' | 'expense' | 'leave'
  title: string
  subtitle: string
  timestamp: string
  payload: any
  status: 'pending' | 'syncing' | 'synced'
  retryCount?: number
}

interface OfflineQueueContextType {
  items: OfflineQueueItem[]
  pendingCount: number
  isSyncing: boolean
  syncProgress: number
  enqueueItem: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status'>) => boolean
  removeItem: (id: string) => void
  clearQueue: () => void
  syncNow: () => Promise<void>
}

const OfflineQueueContext = createContext<OfflineQueueContextType | undefined>(undefined)

const STORAGE_KEY = 'hrms_offline_queue_v1'

const INITIAL_QUEUE: OfflineQueueItem[] = [
  {
    id: 'OFF-001',
    idempotencyKey: 'idemp-punch-101',
    type: 'punch',
    title: 'Offline Punch-In (General Shift)',
    subtitle: 'Ahmedabad Branch • Lat 23.0338, Lng 72.5614',
    timestamp: 'Today, 09:14 AM',
    payload: {
      punchType: 'in',
      isOffline: true,
      time: '09:14 AM',
      coordinates: '23.0338, 72.5614',
    },
    status: 'pending',
  },
  {
    id: 'OFF-002',
    idempotencyKey: 'idemp-visit-102',
    type: 'visit',
    title: 'Apollo Pharmacy Visit Check-In',
    subtitle: 'Storefront selfie captured • 45m within geofence',
    timestamp: 'Today, 10:30 AM',
    payload: {
      clientId: 'CLI-001',
      clientName: 'Apollo Pharmacy Superstore',
      distanceMeters: 45,
    },
    status: 'pending',
  },
]

export const OfflineQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useDemo()
  const { showToast } = useToast()

  const [items, setItems] = useState<OfflineQueueItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_QUEUE
  })

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)

  // Persist queue to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  // Automatically trigger sync when offline mode is toggled OFF
  useEffect(() => {
    if (!settings.offlineMode && items.some((i) => i.status === 'pending')) {
      syncNow()
    }
  }, [settings.offlineMode])

  const enqueueItem = (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status'>): boolean => {
    // Check idempotency key to prevent duplicates
    const exists = items.some((i) => i.idempotencyKey === item.idempotencyKey)
    if (exists) {
      showToast('Action already recorded in offline queue (duplicate prevented)', 'info')
      return false
    }

    const newItem: OfflineQueueItem = {
      ...item,
      id: `OFF-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    }

    setItems((prev) => [newItem, ...prev])
    showToast(`Saved to offline queue (${newItem.title})`, 'warning')
    return true
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearQueue = () => {
    setItems([])
  }

  const syncNow = async () => {
    const pendingItems = items.filter((i) => i.status === 'pending')
    if (pendingItems.length === 0) {
      showToast('All items are already synchronized', 'info')
      return
    }

    setIsSyncing(true)
    setSyncProgress(15)

    // Simulate progress increments
    setTimeout(() => setSyncProgress(45), 400)
    setTimeout(() => setSyncProgress(80), 900)

    setTimeout(() => {
      // Mark queued items as synced
      setItems((prev) =>
        prev.map((i) => (i.status === 'pending' ? { ...i, status: 'synced' as const } : i))
      )
      setIsSyncing(false)
      setSyncProgress(100)

      AuditLogService.addLog({
        actorName: 'Aarav Patel',
        actorRole: 'Employee',
        action: 'Offline Queue Synchronized',
        targetType: 'Punch',
        targetId: 'OFFLINE_SYNC',
        targetName: `${pendingItems.length} items synced to cloud`,
        featureCode: 'PUNCH',
        beforeValue: `${pendingItems.length} pending items`,
        afterValue: '0 pending items',
        reason: 'Network connectivity restored',
      })

      showToast(`Successfully synced ${pendingItems.length} items to cloud!`, 'success')
    }, 1400)
  }

  const pendingCount = items.filter((i) => i.status === 'pending').length

  return (
    <OfflineQueueContext.Provider
      value={{
        items,
        pendingCount,
        isSyncing,
        syncProgress,
        enqueueItem,
        removeItem,
        clearQueue,
        syncNow,
      }}
    >
      {children}
    </OfflineQueueContext.Provider>
  )
}

export const useOfflineQueue = () => {
  const context = useContext(OfflineQueueContext)
  if (!context) {
    throw new Error('useOfflineQueue must be used within an OfflineQueueProvider')
  }
  return context
}
