import React, { useState, useRef } from 'react'
import { Check, X, CheckCircle, XCircle } from 'lucide-react'

interface SwipeableCardProps {
  id: string
  title: string
  subtitle: string
  category?: string
  details?: { label: string; value: string }[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  statusBadge?: string
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  id,
  title,
  subtitle,
  details = [],
  onApprove,
  onReject,
  statusBadge,
}) => {
  const [dragOffset, setDragOffset] = useState(0)
  const [isSwiped, setIsSwiped] = useState<'approved' | 'rejected' | null>(null)
  const touchStartX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const currentX = e.touches[0].clientX
    const diff = currentX - touchStartX.current
    // limit drag to [-120, 120]
    setDragOffset(Math.max(-120, Math.min(120, diff)))
  }

  const handleTouchEnd = () => {
    if (dragOffset > 70) {
      // Swiped Right -> Approve
      setIsSwiped('approved')
      setTimeout(() => onApprove(id), 300)
    } else if (dragOffset < -70) {
      // Swiped Left -> Reject
      setIsSwiped('rejected')
      setTimeout(() => onReject(id), 300)
    }
    setDragOffset(0)
    touchStartX.current = null
  }

  if (isSwiped === 'approved') {
    return (
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 text-sm font-bold animate-out fade-out duration-300">
        <CheckCircle className="w-5 h-5" />
        Approved
      </div>
    )
  }

  if (isSwiped === 'rejected') {
    return (
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center gap-2 text-sm font-bold animate-out fade-out duration-300">
        <XCircle className="w-5 h-5" />
        Rejected
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl select-none">
      {/* Background action reveal layers */}
      <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none rounded-2xl bg-muted/40 border border-border">
        <div
          className={`flex items-center gap-2 font-bold text-xs text-emerald-600 dark:text-emerald-400 transition-opacity ${
            dragOffset > 20 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Check className="w-5 h-5" />
          <span>Approve</span>
        </div>

        <div
          className={`flex items-center gap-2 font-bold text-xs text-rose-600 dark:text-rose-400 transition-opacity ${
            dragOffset < -20 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>Reject</span>
          <X className="w-5 h-5" />
        </div>
      </div>

      {/* Front Draggable Card */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${dragOffset}px)` }}
        className="relative bg-card border border-border rounded-2xl p-4 shadow-2xs transition-transform duration-75"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          {statusBadge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
              {statusBadge}
            </span>
          )}
        </div>

        {details.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/60 text-xs">
            {details.map((d, i) => (
              <div key={i}>
                <span className="text-[11px] text-muted-foreground block truncate">
                  {d.label}
                </span>
                <span className="font-semibold text-foreground block truncate">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tap fallback buttons for accessibility & desktop mouse */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <span className="text-[11px] text-muted-foreground italic">
            Swipe right to approve, left to reject
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onReject(id)}
              className="w-9 h-9 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onApprove(id)}
              className="w-9 h-9 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-100 active:scale-95 transition"
              title="Approve"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
