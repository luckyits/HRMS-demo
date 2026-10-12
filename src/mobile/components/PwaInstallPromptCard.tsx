import React, { useState } from 'react'
import { Smartphone, Download, X, Check } from 'lucide-react'
import { useToast } from '@/context/ToastContext'

export const PwaInstallPromptCard: React.FC = () => {
  const { showToast } = useToast()
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('hrms_pwa_dismissed') === 'true'
  })
  const [isInstalled, setIsInstalled] = useState(false)

  if (isDismissed) return null

  const handleInstall = () => {
    setIsInstalled(true)
    showToast('HRMS app added to Home Screen! You can now launch standalone.', 'success')
    setTimeout(() => {
      setIsDismissed(true)
      sessionStorage.setItem('hrms_pwa_dismissed', 'true')
    }, 1800)
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('hrms_pwa_dismissed', 'true')
  }

  return (
    <div className="p-4 rounded-3xl bg-linear-to-r from-indigo-900/40 via-purple-900/30 to-card border border-indigo-500/30 shadow-md relative overflow-hidden animate-in fade-in duration-300">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3.5 pr-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
          HR
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-bold text-foreground">
            Install HRMS Mobile App
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Add to your home screen for instant offline punch-in, push notifications & standalone display mode.
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-indigo-500/20 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          Not now
        </button>

        <button
          type="button"
          onClick={handleInstall}
          disabled={isInstalled}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1.5"
        >
          {isInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Installed!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5" />
              <span>Add to Home Screen</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
