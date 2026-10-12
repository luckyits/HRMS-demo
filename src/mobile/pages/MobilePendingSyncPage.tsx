import React from 'react'
import {
  WifiOff,
  RefreshCw,
  Clock,
  Navigation,
  Receipt,
  Calendar,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOfflineQueue } from '@/context/OfflineQueueContext'
import { useDemo } from '@/context/DemoContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'

export const MobilePendingSyncPage: React.FC = () => {
  const navigate = useNavigate()
  const { items, pendingCount, isSyncing, syncProgress, syncNow, clearQueue } = useOfflineQueue()
  const { settings, setOfflineMode } = useDemo()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'punch':
        return <Clock className="w-5 h-5 text-indigo-500" />
      case 'visit':
        return <Navigation className="w-5 h-5 text-rose-500" />
      case 'expense':
        return <Receipt className="w-5 h-5 text-emerald-500" />
      case 'leave':
        return <Calendar className="w-5 h-5 text-amber-500" />
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />
    }
  }

  return (
    <div className="flex flex-col min-h-full pb-20">
      <MobileHeader
        title="Pending Sync Queue"
        subtitle={`${pendingCount} items waiting for connection`}
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {/* Offline Status & Sync Action Card */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-card to-muted/40 border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <WifiOff className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {settings.offlineMode ? 'Device is Offline' : 'Online & Connected'}
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  {settings.offlineMode
                    ? 'Records stored securely in local browser storage'
                    : 'Ready to dispatch local transactions to server'}
                </p>
              </div>
            </div>

            {settings.offlineMode && (
              <button
                type="button"
                onClick={() => setOfflineMode(false)}
                className="px-2.5 py-1 rounded-xl bg-primary/10 text-primary text-[11px] font-bold"
              >
                Go Online
              </button>
            )}
          </div>

          {/* Sync Progress Bar */}
          {isSyncing && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Syncing queue with cloud...</span>
                </span>
                <span>{syncProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Sync Button */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              disabled={isSyncing || pendingCount === 0}
              onClick={syncNow}
              className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Now ({pendingCount} pending)</span>
            </button>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearQueue}
                className="px-3.5 py-3 rounded-2xl bg-muted text-muted-foreground hover:text-rose-500 font-bold text-xs transition active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Queue Items List */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Queued Offline Records ({items.length})
            </h4>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Idempotency Protected
            </span>
          </div>

          {items.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs font-medium">
              Offline queue is empty. All punches and requests are synced.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                      {getTypeIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-foreground truncate">
                          {item.title}
                        </h5>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {item.subtitle}
                      </p>
                      <span className="text-[9px] text-muted-foreground/80 font-mono block">
                        Key: {item.idempotencyKey}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      item.status === 'synced'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : item.status === 'syncing'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {item.status === 'synced'
                      ? 'Synced'
                      : item.status === 'syncing'
                      ? 'Syncing'
                      : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
