import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  maxHeight?: string // e.g. "max-h-[85vh]"
  showClose?: boolean
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[85vh]',
  showClose = true,
}) => {
  // Prevent body scrolling when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        className={`relative w-full max-w-md bg-card rounded-t-3xl border-t border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-300 ${maxHeight} pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-full pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition cursor-grab active:cursor-grabbing" />
        </div>

        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 shrink-0">
            <div>
              {title && (
                <h3 className="text-base font-bold text-foreground leading-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Sheet Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {children}
        </div>
      </div>
    </div>
  )
}
