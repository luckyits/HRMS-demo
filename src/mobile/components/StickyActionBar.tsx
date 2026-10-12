import React from 'react'

interface StickyActionBarProps {
  primaryLabel?: string
  onPrimaryClick?: () => void
  primaryIcon?: React.ReactNode
  primaryDisabled?: boolean
  primaryVariant?: 'primary' | 'success' | 'danger'
  secondaryLabel?: string
  onSecondaryClick?: () => void
  secondaryDisabled?: boolean
  aboveTabBar?: boolean
  children?: React.ReactNode
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({
  primaryLabel,
  onPrimaryClick,
  primaryIcon,
  primaryDisabled = false,
  primaryVariant = 'primary',
  secondaryLabel,
  onSecondaryClick,
  secondaryDisabled = false,
  aboveTabBar = false,
  children,
}) => {
  const getPrimaryStyle = () => {
    switch (primaryVariant) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
    }
  }

  return (
    <div
      className={`fixed left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border p-3 shadow-lg select-none ${
        aboveTabBar ? 'bottom-16' : 'bottom-0 pb-safe'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center gap-2.5">
        {children ? (
          children
        ) : (
          <>
            {secondaryLabel && onSecondaryClick && (
              <button
                type="button"
                onClick={onSecondaryClick}
                disabled={secondaryDisabled}
                className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted active:scale-[0.98] transition disabled:opacity-50"
              >
                {secondaryLabel}
              </button>
            )}

            {primaryLabel && onPrimaryClick && (
              <button
                type="button"
                onClick={onPrimaryClick}
                disabled={primaryDisabled}
                className={`flex-1 min-h-[48px] px-4 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-50 ${getPrimaryStyle()}`}
              >
                {primaryIcon}
                <span>{primaryLabel}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
