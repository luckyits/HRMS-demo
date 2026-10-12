import React from 'react'
import { Monitor, Smartphone, ArrowRight, ShieldCheck, ExternalLink, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDemo } from '@/context/DemoContext'
import { MobileHeader } from '@/mobile/components/MobileHeader'

interface MobileDesktopOnlyPageProps {
  title?: string
  description?: string
  suggestedMobileRoute?: string
  suggestedMobileLabel?: string
}

export const MobileDesktopOnlyPage: React.FC<MobileDesktopOnlyPageProps> = ({
  title = 'Administrative Workstation Tool',
  description = 'This comprehensive administrative configuration module contains multi-column matrix tables, visual policy rule builders, and dense datasets optimized for wide desktop screens.',
  suggestedMobileRoute = '/hr/dashboard',
  suggestedMobileLabel = 'Open Mobile HR Dashboard',
}) => {
  const navigate = useNavigate()
  const { settings, setPhonePreview } = useDemo()

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="Desktop Workspace"
        subtitle="Workstation Optimized"
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      <div className="p-5 flex-1 flex flex-col items-center justify-center text-center space-y-6 max-w-sm mx-auto">
        {/* Visual Graphic */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <Monitor className="w-10 h-10 stroke-[1.8]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Smartphone className="w-4 h-4" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Best used on a larger screen
          </span>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5 pt-2">
          {/* Primary: Go to mobile counterpart */}
          <button
            type="button"
            onClick={() => navigate(suggestedMobileRoute)}
            className="w-full py-3.5 px-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>{suggestedMobileLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Switch to Desktop View (if phone preview is enabled in demo) */}
          {settings.phonePreview && (
            <button
              type="button"
              onClick={() => setPhonePreview(false)}
              className="w-full py-3 px-4 rounded-2xl bg-card border border-border text-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-muted active:scale-95 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Switch to Full Desktop View</span>
            </button>
          )}

          {/* Return back */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick mobile links */}
        <div className="w-full pt-4 border-t border-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 text-left">
            Lightweight Mobile HR Shortcuts
          </p>
          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              onClick={() => navigate('/hr/attendance')}
              className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-xs font-semibold text-foreground transition truncate"
            >
              📍 Live Attendance
            </button>
            <button
              onClick={() => navigate('/hr/approvals')}
              className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-xs font-semibold text-foreground transition truncate"
            >
              📋 Swipe Approvals
            </button>
            <button
              onClick={() => navigate('/hr/employees')}
              className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-xs font-semibold text-foreground transition truncate"
            >
              👥 Employee 360
            </button>
            <button
              onClick={() => navigate('/hr/features')}
              className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/40 text-xs font-semibold text-foreground transition truncate"
            >
              ⚡ Feature Access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
