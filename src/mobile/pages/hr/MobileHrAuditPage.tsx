import React, { useState, useMemo } from 'react'
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  ArrowRight,
  RefreshCw,
  User,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { AuditLogService, type AuditLogEntry } from '@/services/auditLogService'
import { useDemo } from '@/context/DemoContext'

export const MobileHrAuditPage: React.FC = () => {
  const navigate = useNavigate()
  const { settings } = useDemo()

  const [logs, setLogs] = useState<AuditLogEntry[]>(() => AuditLogService.getLogs())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('All')

  const refreshLogs = () => {
    setLogs(AuditLogService.getLogs())
  }

  const filters = ['All', 'Approvals', 'Attendance', 'Permissions', 'Security', 'Announcements']

  const filteredLogs = useMemo(() => {
    return logs.filter((item) => {
      const matchSearch =
        item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reason?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false

      if (selectedFilter === 'All') return true
      if (selectedFilter === 'Approvals') {
        return item.action.toLowerCase().includes('approved') || item.action.toLowerCase().includes('rejected')
      }
      if (selectedFilter === 'Attendance') {
        return item.module === 'Attendance' || item.action.toLowerCase().includes('punch') || item.action.toLowerCase().includes('regularization')
      }
      if (selectedFilter === 'Permissions') {
        return item.module === 'Permissions' || item.action.toLowerCase().includes('grant') || item.action.toLowerCase().includes('access')
      }
      if (selectedFilter === 'Security') {
        return item.module === 'Security' || item.action.toLowerCase().includes('salary') || item.action.toLowerCase().includes('revealed')
      }
      if (selectedFilter === 'Announcements') {
        return item.action.toLowerCase().includes('announcement')
      }
      return true
    })
  }, [logs, searchQuery, selectedFilter])

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="Audit Trail Feed"
        subtitle="Chronological Enterprise Event Stream"
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Search and Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit actions, actors, targets..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
            />
          </div>

          <button
            type="button"
            onClick={refreshLogs}
            className="p-2.5 rounded-xl bg-card border border-border text-foreground hover:bg-muted active:scale-95 transition"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFilter(f)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition ${
                selectedFilter === f
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Audit Feed Items */}
        <div className="space-y-3 flex-1">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground">
                No audit entries found matching the filter.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSecurity = log.module === 'Security' || log.action.toLowerCase().includes('salary')
              const isApproval = log.action.toLowerCase().includes('approved')
              const isRejection = log.action.toLowerCase().includes('rejected')

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs space-y-2 hover:border-primary/30 transition"
                >
                  {/* Top Bar: Action & Channel */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSecurity
                              ? 'bg-amber-500'
                              : isApproval
                              ? 'bg-emerald-500'
                              : isRejection
                              ? 'bg-rose-500'
                              : 'bg-primary'
                          }`}
                        />
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {log.action}
                        </h4>
                      </div>

                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Target: <strong className="text-foreground">{log.targetName}</strong>
                      </p>
                    </div>

                    <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-muted text-muted-foreground shrink-0">
                      Mobile App
                    </span>
                  </div>

                  {/* Value Diff (Before -> After) */}
                  {(log.beforeValue || log.afterValue) && (
                    <div className="p-2 rounded-xl bg-muted/30 border border-border flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground truncate max-w-[45%]">
                        {log.beforeValue || '—'}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mx-1" />
                      <span className="font-bold text-primary truncate max-w-[45%] text-right">
                        {log.afterValue || '—'}
                      </span>
                    </div>
                  )}

                  {/* Reason Text */}
                  {log.reason && (
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                      "{log.reason}"
                    </p>
                  )}

                  {/* Footer Meta */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="font-medium text-foreground">
                      By {log.actorName} ({log.actorRole})
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
