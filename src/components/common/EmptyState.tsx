import { cn } from '@/lib/utils'
import { FolderOpen } from 'lucide-react'
import React from 'react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed border-border bg-card/50',
        className
      )}
    >
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 shadow-2xs">
        {icon || <FolderOpen className="w-7 h-7 stroke-[1.75]" />}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
