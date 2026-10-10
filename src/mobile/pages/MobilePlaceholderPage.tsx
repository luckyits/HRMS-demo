import React from 'react'
import { Sparkles, ArrowLeft, Layers, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'

interface MobilePlaceholderPageProps {
  title: string
  subtitle?: string
  moduleName?: string
  children?: React.ReactNode
}

export const MobilePlaceholderPage: React.FC<MobilePlaceholderPageProps> = ({
  title,
  subtitle,
  moduleName = 'Workforce Module',
  children,
}) => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-full">
      <MobileHeader
        title={title}
        subtitle={moduleName}
        showBack={true}
      />

      <div className="p-4 space-y-4">
        {children ? (
          <div className="rounded-2xl overflow-hidden border border-border bg-card p-2">
            {children}
          </div>
        ) : (
          <div className="p-6 rounded-3xl bg-card border border-border text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-7 h-7 stroke-[2.2px]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                {subtitle || 'This module is enabled for your role. The mobile view is streamlined for quick touch actions.'}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Feature Granted • {moduleName}</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-2.5 px-4 rounded-xl border border-border font-semibold text-xs text-foreground hover:bg-muted active:scale-[0.98] transition"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
