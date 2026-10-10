import React, { useState, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: React.ReactNode
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
}) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only enable pull if scroll is at top
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null || isRefreshing) return
    const currentY = e.touches[0].clientY
    const diff = currentY - touchStartY.current

    if (diff > 0 && containerRef.current && containerRef.current.scrollTop <= 0) {
      // Apply rubber-band resistance
      setPullDistance(Math.min(diff * 0.4, 70))
    }
  }

  const handleTouchEnd = async () => {
    if (pullDistance > 50 && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(50)
      try {
        await Promise.resolve(onRefresh())
      } finally {
        setTimeout(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        }, 500)
      }
    } else {
      setPullDistance(0)
    }
    touchStartY.current = null
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-full overflow-y-auto"
    >
      {/* Pull Indicator */}
      <div
        style={{ height: `${pullDistance}px`, opacity: pullDistance / 50 }}
        className="flex items-center justify-center overflow-hidden transition-all duration-150 pointer-events-none"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <RefreshCw
            className={`w-4 h-4 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 4}deg)` }}
          />
          <span>{isRefreshing ? 'Refreshing data...' : 'Pull down to refresh'}</span>
        </div>
      </div>

      {children}
    </div>
  )
}
