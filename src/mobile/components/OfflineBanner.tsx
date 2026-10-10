import React from 'react'
import { WifiOff, RefreshCw } from 'lucide-react'
import { useDemo } from '@/context/DemoContext'

export const OfflineBanner: React.FC = () => {
  const { settings } = useDemo()

  if (!settings.offlineMode) return null

  return (
    <div className="bg-amber-500 text-amber-950 px-3.5 py-2 text-xs font-semibold flex items-center justify-between gap-2 shadow-xs border-b border-amber-600/30 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
        <span className="truncate">
          Offline Mode Active: Punches & requests will sync when connected.
        </span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-600/20 px-1.5 py-0.5 rounded shrink-0">
        Saved Locally
      </span>
    </div>
  )
}
