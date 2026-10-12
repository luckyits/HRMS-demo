import React from 'react'
import { Clock, ShieldAlert, LogIn, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'

export const MobileSessionExpiredPage: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()

  return (
    <div className="flex flex-col items-center justify-between min-h-full p-6 bg-background text-foreground select-none">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-xs">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-lg border border-amber-500/20">
          <Clock className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-foreground">
            Session Expired
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your login session has timed out due to 15 minutes of inactivity. Please re-authenticate to protect workforce privacy.
          </p>
        </div>

        {/* User Mini Profile */}
        <div className="w-full p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
          <img
            src={settings.currentUser.avatar}
            alt={settings.currentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
          />
          <div className="text-left min-w-0">
            <span className="text-xs font-bold text-foreground block truncate">
              {settings.currentUser.name}
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              {settings.currentUser.title}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-2 pb-6 max-w-xs">
        <button
          type="button"
          onClick={() => navigate('/mobile/lock')}
          className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md active:scale-95 transition flex items-center justify-center gap-2"
        >
          <span>Unlock with Security PIN</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full py-3 rounded-2xl border border-border bg-card text-muted-foreground hover:text-foreground font-bold text-xs active:scale-95 transition"
        >
          Log Out & Switch User
        </button>
      </div>
    </div>
  )
}
