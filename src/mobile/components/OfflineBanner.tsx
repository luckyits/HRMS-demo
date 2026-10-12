import React from 'react'
import { WifiOff, RefreshCw, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'
import { useOfflineQueue } from '@/context/OfflineQueueContext'

export const OfflineBanner: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()
  const { pendingCount, isSyncing } = useOfflineQueue()

  if (!settings.offlineMode && pendingCount === 0) return null

  return (
    <div
      onClick={() => navigate('/mobile/sync')}
      className="bg-amber-500 hover:bg-amber-600 text-amber-950 px-3.5 py-2 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs border-b border-amber-600/30 cursor-pointer active:scale-[0.99] transition"
    >
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span className="truncate">
          {settings.offlineMode
            ? `Offline Mode: ${pendingCount} pending sync`
            : `Syncing ${pendingCount} offline records...`}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-900/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          {isSyncing && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
          <span>Pending sync ({pendingCount})</span>
        </span>
        <ChevronRight className="w-3.5 h-3.5 opacity-75" />
      </div>
    </div>
  )
}
