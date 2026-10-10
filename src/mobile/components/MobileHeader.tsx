import React from 'react'
import { ArrowLeft, Bell, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'

interface MobileHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: React.ReactNode
  showNotificationBell?: boolean
  unreadCount?: number
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  showNotificationBell = true,
  unreadCount = 3,
}) => {
  const navigate = useNavigate()
  const { settings } = useDemo()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="flex items-center justify-between h-14 px-4 gap-2">
        {/* Left: Back button or brand badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
              HR
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base font-bold text-foreground truncate leading-tight tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate leading-none mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {settings.offlineMode && (
            <div
              title="Working Offline"
              className="p-2 rounded-full bg-amber-500/10 text-amber-500 text-xs flex items-center justify-center"
            >
              <WifiOff className="w-4 h-4" />
            </div>
          )}

          {rightAction}

          {showNotificationBell && (
            <button
              type="button"
              onClick={() => navigate('/employee/notifications')}
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-card animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
