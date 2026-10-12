import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export interface PushNotificationData {
  id: string
  title: string
  body: string
  route: string
  timeAgo: string
}

export const PushToastBanner: React.FC = () => {
  const navigate = useNavigate()
  const [notification, setNotification] = useState<PushNotificationData | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simulate an incoming push notification after 4 seconds of app load
    const timer = setTimeout(() => {
      setNotification({
        id: 'push-101',
        title: 'Leave Request Approved',
        body: 'Vikram Malhotra approved your Casual Leave for Oct 14',
        route: '/employee/leaves',
        timeAgo: 'Just now',
      })
      setIsVisible(true)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  if (!notification || !isVisible) return null

  const handleTap = () => {
    setIsVisible(false)
    navigate(notification.route)
  }

  return (
    <div className="fixed top-2 left-3 right-3 z-50 animate-in slide-in-from-top-4 duration-300">
      <div
        onClick={handleTap}
        className="p-3.5 rounded-2xl bg-card/95 backdrop-blur-md border border-border shadow-2xl flex items-center justify-between gap-3 cursor-pointer hover:border-primary/50 active:scale-[0.99] transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground truncate">
                {notification.title}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
                {notification.timeAgo}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {notification.body}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsVisible(false)
            }}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
