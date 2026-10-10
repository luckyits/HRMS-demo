import { ScopeBadge } from '@/components/common/ScopeBadge'
import { cn } from '@/lib/utils'
import type { Scope } from '@/types'
import { ChevronRight } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  scope?: Scope
  action?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  scope,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6', className)}>
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-muted-foreground mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.label}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-foreground transition-colors font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground/90 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {scope && <ScopeBadge scope={scope} />}
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">{subtitle}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  )
}
