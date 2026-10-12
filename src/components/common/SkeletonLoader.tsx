import React from 'react'

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 6,
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 animate-pulse space-y-3">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 py-2 border-b border-slate-100 dark:border-slate-800/60">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md flex-1"
              style={{ width: `${100 / columns}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <div className="flex justify-between items-center">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-32" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-40" />
        </div>
      ))}
    </div>
  )
}

export const FormSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48" />
      <div className="space-y-3">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
      </div>
      <div className="flex justify-end gap-2 pt-3">
        <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl w-20" />
        <div className="h-9 bg-indigo-200 dark:bg-indigo-950 rounded-xl w-28" />
      </div>
    </div>
  )
}

export const MobileListSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-card p-4 rounded-2xl border border-border flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-muted shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 bg-muted rounded-md w-3/4" />
              <div className="h-3 bg-muted/60 rounded-md w-1/2" />
            </div>
          </div>
          <div className="w-16 h-7 rounded-lg bg-muted shrink-0" />
        </div>
      ))}
    </div>
  )
}

export const MobileDetailSkeleton: React.FC = () => {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-6 bg-muted rounded-md w-1/3" />
      <div className="h-32 bg-muted/60 rounded-2xl w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md w-full" />
        <div className="h-4 bg-muted rounded-md w-5/6" />
        <div className="h-4 bg-muted rounded-md w-2/3" />
      </div>
    </div>
  )
}
