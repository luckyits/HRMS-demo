import React, { useEffect } from 'react'
import { ArrowLeft, X } from 'lucide-react'

interface FullScreenSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  stickyBottomAction?: React.ReactNode
}

export const FullScreenSheet: React.FC<FullScreenSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  stickyBottomAction,
}) => {
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
    <div className="fixed inset-0 z-50 flex justify-center bg-background pointer-events-auto animate-in slide-in-from-bottom duration-300">
      <div className="w-full max-w-md h-full flex flex-col bg-background">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between h-14 px-4 bg-card/95 backdrop-blur-md border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-none">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {children}
        </div>

        {/* Optional Sticky Bottom Action */}
        {stickyBottomAction && (
          <div className="sticky bottom-0 z-10 bg-card/95 backdrop-blur-md border-t border-border p-4 pb-safe shrink-0 shadow-lg">
            {stickyBottomAction}
          </div>
        )}
      </div>
    </div>
  )
}
