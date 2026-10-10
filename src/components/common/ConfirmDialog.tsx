import { cn } from '@/lib/utils'
import { AlertTriangle, Info, X } from 'lucide-react'
import React from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 relative"
        role="dialog"
      >
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              'p-2.5 rounded-full shrink-0',
              isDestructive
                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                : 'bg-primary/10 text-primary'
            )}
          >
            {isDestructive ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted text-foreground transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg text-white transition flex items-center gap-2',
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-primary hover:bg-primary/90'
            )}
          >
            {isLoading && <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
