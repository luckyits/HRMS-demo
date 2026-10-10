import { cn } from '@/lib/utils'
import { Filter, RotateCcw, Search } from 'lucide-react'
import React from 'react'

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  searchQuery?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  statusFilter?: string
  onStatusChange?: (val: string) => void
  statusOptions?: FilterOption[]
  departmentFilter?: string
  onDepartmentChange?: (val: string) => void
  departmentOptions?: FilterOption[]
  onReset?: () => void
  children?: React.ReactNode
  className?: string
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  statusFilter,
  onStatusChange,
  statusOptions,
  departmentFilter,
  onDepartmentChange,
  departmentOptions,
  onReset,
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 p-3.5 bg-card rounded-xl border border-border shadow-2xs',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        )}

        {statusOptions && onStatusChange && (
          <div className="relative min-w-[130px]">
            <select
              value={statusFilter ?? 'all'}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {departmentOptions && onDepartmentChange && (
          <div className="relative min-w-[140px]">
            <select
              value={departmentFilter ?? 'all'}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {children}
      </div>

      <div className="flex items-center gap-2">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}
