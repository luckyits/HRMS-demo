import React, { useEffect, useRef, useState, useCallback } from 'react'
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
  const [dragOffset, setDragOffset] = useState(0)
  const touchStartY = useRef<number | null>(null)
  const isPushedHistoryRef = useRef(false)

  // Android / Hardware Back button closes the sheet first
  useEffect(() => {
    if (!isOpen) return

    // Push dummy state to capture back button
    window.history.pushState({ bottomSheetOpen: true }, '')
    isPushedHistoryRef.current = true

    const handlePopState = (e: PopStateEvent) => {
      // Hardware back was tapped
      isPushedHistoryRef.current = false
      onClose()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('popstate', handlePopState)
    window.addEventListener('keydown', handleKeyDown)

    // Lock body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('popstate', handlePopState)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      // If closed programmatically, revert history state
      if (isPushedHistoryRef.current) {
        isPushedHistoryRef.current = false
        window.history.back()
      }
    }
  }, [isOpen, onClose])

  // Swipe down on drag handle or header to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStartY.current
    if (diff > 0) {
      setDragOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    if (dragOffset > 75) {
      onClose()
    }
    setDragOffset(0)
    touchStartY.current = null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Sheet Content with Swipe Down Drag Support */}
      <div
        className={`relative w-full max-w-md bg-card text-foreground rounded-t-3xl border-t border-border shadow-2xl flex flex-col z-10 transition-transform duration-150 ${maxHeight} pb-safe`}
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle header (Touch area with min 48px target) */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full pt-3 pb-2 flex justify-center shrink-0 cursor-grab active:cursor-grabbing min-h-[28px]"
        >
          <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 transition" />
        </div>

        {/* Header */}
        {(title || showClose) && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="flex items-center justify-between px-5 py-2.5 border-b border-border/60 shrink-0"
          >
            <div className="min-w-0 pr-2">
              {title && (
                <h3 className="text-base font-bold text-foreground leading-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight truncate">
                  {subtitle}
                </p>
              )}
            </div>

            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Bottom Sheet"
                className="min-w-[48px] min-h-[48px] -mr-2 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition"
              >
                <X className="w-5 h-5" />
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
