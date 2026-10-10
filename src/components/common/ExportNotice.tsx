import { cn } from '@/lib/utils'
import { Info, ShieldAlert } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface ExportNoticeProps {
  className?: string
  compact?: boolean
}

export const ExportNotice: React.FC<ExportNoticeProps> = ({ className, compact = false }) => {
  const { t } = useTranslation()

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900/60',
          className
        )}
      >
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span>{t('exportNotice')}</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 p-3 rounded-lg text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
        className
      )}
    >
      <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <p className="font-medium">Data Export Compliance Warning</p>
        <p className="opacity-90">{t('exportNotice')}</p>
      </div>
    </div>
  )
}
