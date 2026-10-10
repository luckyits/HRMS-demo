import { DataTable } from '@/components/common/DataTable'
import { ExportNotice } from '@/components/common/ExportNotice'
import { FilterBar } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { ScopeBadge } from '@/components/common/ScopeBadge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { AuditLogService, type AuditLogEntry } from '@/services/auditLogService'
import { FeatureControlNav } from '@/pages/features/FeatureControlNav'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Clock,
  Download,
  FileText,
  History,
  RotateCcw,
  Shield,
  User,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

export const AccessChangeHistoryPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(() => AuditLogService.getLogs())
  const [search, setSearch] = useState('')
  const [targetTypeFilter, setTargetTypeFilter] = useState('all')

  const columns: ColumnDef<AuditLogEntry>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {row.original.timestamp}
        </div>
      ),
    },
    {
      accessorKey: 'actorName',
      header: 'Modified By (Actor)',
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-foreground block">
            {row.original.actorName}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {row.original.actorRole}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'targetType',
      header: 'Scope / Target',
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-medium text-foreground block">
            {row.original.targetName}
          </span>
          <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded">
            {row.original.targetType}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'featureCode',
      header: 'Feature Code',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-foreground">
          {row.original.featureCode}
        </span>
      ),
    },
    {
      accessorKey: 'beforeValue',
      header: 'Before vs After',
      cell: ({ row }) => (
        <div className="text-xs space-y-1">
          <div className="text-muted-foreground text-[11px] line-through">
            {row.original.beforeValue}
          </div>
          <div className="font-medium text-emerald-600 dark:text-emerald-400">
            → {row.original.afterValue}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason / Stated Justification',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground italic line-clamp-2 max-w-xs">
          “{row.original.reason}”
        </span>
      ),
    },
  ]

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.actorName.toLowerCase().includes(search.toLowerCase()) ||
        log.targetName.toLowerCase().includes(search.toLowerCase()) ||
        log.featureCode.toLowerCase().includes(search.toLowerCase()) ||
        log.reason.toLowerCase().includes(search.toLowerCase())
      const matchTarget =
        targetTypeFilter === 'all' || log.targetType === targetTypeFilter
      return matchSearch && matchTarget
    })
  }, [logs, search, targetTypeFilter])

  const handleExportCSV = () => {
    alert(
      'Exporting Access Change History Audit Log to CSV.\nThis export is logged in the company compliance record.'
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Change History & Compliance Audit Log"
        subtitle="Chronological audit records of all company feature toggles, profile adjustments, and employee overrides"
        scope="All"
        breadcrumbs={[
          { label: 'HR Admin', href: '/hr/dashboard' },
          { label: 'Feature Control', href: '/hr/features/catalogue' },
          { label: 'Audit History' },
        ]}
      />

      <FeatureControlNav />

      {/* Filter and Export Disclaimer */}
      <FilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter audit records by actor, target, feature code, or reason..."
        statusFilter={targetTypeFilter}
        onStatusChange={setTargetTypeFilter}
        statusOptions={[
          { label: 'Company Level', value: 'Company' },
          { label: 'Profile Level', value: 'Profile' },
          { label: 'Individual Employee', value: 'Employee' },
          { label: 'Bulk Employee Update', value: 'Bulk Employee' },
        ]}
        onReset={() => {
          setSearch('')
          setTargetTypeFilter('all')
        }}
      />

      {/* Audit Log Data Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        onExport={handleExportCSV}
      />
    </div>
  )
}
