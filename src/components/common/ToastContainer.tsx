import React from 'react'
import { useToast, type ToastType } from '@/context/ToastContext'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
      default:
        return <Info className="w-4 h-4 text-indigo-500 shrink-0" />
    }
  }

  const getStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-100'
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-100'
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/80 dark:border-amber-800 dark:text-amber-100'
      default:
        return 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-100'
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-2.5 text-xs transition-all animate-in slide-in-from-bottom-3 duration-200 ${getStyle(
            t.type
          )}`}
        >
          {getIcon(t.type)}
          <div className="flex-1 font-medium leading-relaxed">{t.message}</div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 hover:opacity-75 rounded transition-opacity"
          >
            <X className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      ))}
    </div>
  )
}
