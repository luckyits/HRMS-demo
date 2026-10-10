import { ApprovalTimeline } from '@/components/common/ApprovalTimeline'
import { Can } from '@/components/common/Can'
import { DataTable } from '@/components/common/DataTable'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FilterBar } from '@/components/common/FilterBar'
import { PageHeader } from '@/components/common/PageHeader'
import { SensitiveField } from '@/components/common/SensitiveField'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Banknote,
  Calendar,
  CheckCircle2,
  Clock,
  Fingerprint,
  MapPin,
  Navigation,
  Receipt,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'

interface QuickEmployeeRecord {
  id: string
  name: string
  department: string
  role: string
  status: string
  attendance: string
  ctc: string
}

const DEMO_TABLE_DATA: QuickEmployeeRecord[] = [
  {
    id: 'EMP-003',
    name: 'Aarav Patel',
    department: 'Engineering',
    role: 'Senior Frontend Engineer',
    status: 'active',
    attendance: '98.5%',
    ctc: '₹ 18,50,000',
  },
  {
    id: 'EMP-004',
    name: 'Devika Nair',
    department: 'Engineering',
    role: 'Full Stack Developer',
    status: 'active',
    attendance: '96.2%',
    ctc: '₹ 14,00,000',
  },
  {
    id: 'EMP-018',
    name: 'Hardik Trivedi',
    department: 'Field Sales',
    role: 'Area Sales Executive',
    status: 'active',
    attendance: '94.2%',
    ctc: '₹ 8,50,000',
  },
  {
    id: 'EMP-010',
    name: 'Gopal Shinde',
    department: 'Plant Operations',
    role: 'CNC Milling Master Technician',
    status: 'on-leave',
    attendance: '91.0%',
    ctc: '₹ 6,80,000',
  },
]

export const DashboardOverview: React.FC = () => {
  const { settings } = useDemo()
  const { currentEmployee, hasFeature } = useAccess()
  const [filterSearch, setFilterSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Punch in/out simulated state
  const [isPunchedIn, setIsPunchedIn] = useState(false)
  const [lastPunchTime, setLastPunchTime] = useState<string | null>(null)

  const handlePunchToggle = () => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setIsPunchedIn(!isPunchedIn)
    setLastPunchTime(time)
  }

  const columns: ColumnDef<QuickEmployeeRecord>[] = [
    {
      accessorKey: 'id',
      header: 'Emp ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Employee Name',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-foreground block">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.role}</span>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'ctc',
      header: 'CTC (Confidential)',
      cell: ({ row }) => (
        <Can action="view-sensitive" feature="PAYROLL" fallback={<span className="text-muted-foreground text-xs">••••••••</span>}>
          <SensitiveField value={row.original.ctc} maskedDisplay="₹ •••••••" />
        </Can>
      ),
    },
    {
      accessorKey: 'attendance',
      header: 'Attendance',
      cell: ({ row }) => (
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          {row.original.attendance}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Can action="approve" feature="LEAVE">
            <button
              type="button"
              onClick={() => alert(`Approved leave for ${row.original.name}`)}
              className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold"
            >
              Approve
            </button>
          </Can>
          <Can action="edit" feature="PROFILE">
            <button
              type="button"
              onClick={() => alert(`Editing profile of ${row.original.name}`)}
              className="px-2 py-1 rounded bg-card hover:bg-muted text-foreground border border-border text-[10px] font-medium"
            >
              Edit
            </button>
          </Can>
        </div>
      ),
    },
  ]

  // Enforce Data Scope Filtering:
  // When 'View as Manager' is chosen, show only direct reports and team data
  // When 'View as Employee' is chosen, show only self / same department
  const scopedData = useMemo(() => {
    if (settings.role === 'Manager') {
      // Show reportees of Vikram Malhotra (EMP-002) / Rajesh Verma (EMP-009) or team members
      return DEMO_TABLE_DATA.filter(
        (item) => item.department === 'Engineering' || item.name === 'Aarav Patel' || item.name === 'Devika Nair'
      )
    }
    if (settings.role === 'Employee') {
      return DEMO_TABLE_DATA.filter((item) => item.name === currentEmployee.name || item.department === currentEmployee.department)
    }
    // HR Admin: company wide scope
    return DEMO_TABLE_DATA
  }, [settings.role, currentEmployee])

  const filteredData = scopedData.filter((item: QuickEmployeeRecord) => {
    const matchesSearch =
      item.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.department.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(filterSearch.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          settings.role === 'HR Admin'
            ? 'Universal HR Management Portal'
            : settings.role === 'Manager'
            ? 'Team Operations & Approvals'
            : `Welcome back, ${currentEmployee.name}`
        }
        subtitle={`${settings.companyType} Template • Profile: ${settings.employeeType} (${currentEmployee.designation})`}
        scope={settings.role === 'HR Admin' ? 'All' : settings.role === 'Manager' ? 'Team' : 'Self'}
        breadcrumbs={[{ label: 'ERP' }, { label: 'Universal HRMS' }, { label: settings.role }]}
      />

      {/* PUNCH CARD (Rendered if employee has PUNCH feature) */}
      <FeatureGate feature="PUNCH">
        <div className="bg-linear-to-r from-indigo-500/10 via-purple-500/10 to-primary/10 border border-primary/20 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Biometric & Web Attendance
                  </h3>
                  <StatusBadge
                    status={isPunchedIn ? 'active' : 'inactive'}
                    label={isPunchedIn ? 'Punched In' : 'Not Punched In'}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {lastPunchTime
                    ? `Last record: ${lastPunchTime} today`
                    : 'Shift 09:30 AM - 06:30 PM • Grace period 15 mins'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FeatureGate feature="GEOFENCE">
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Geofence Validated</span>
                </span>
              </FeatureGate>

              <button
                type="button"
                onClick={handlePunchToggle}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide uppercase shadow-sm transition-all flex items-center gap-2 ${
                  isPunchedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{isPunchedIn ? 'Punch Out' : 'Punch In'}</span>
              </button>
            </div>
          </div>
        </div>
      </FeatureGate>

      {/* DYNAMIC ACCESS-GENERATED STAT TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance tile */}
        <FeatureGate feature="PUNCH">
          <StatCard
            title="Attendance Score"
            value="98.5%"
            subtext="22 Days present this month"
            trend={{ value: '+1.2% vs avg', positive: true }}
            icon={Clock}
            iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
          />
        </FeatureGate>

        {/* Leaves tile */}
        <FeatureGate feature="LEAVE">
          <StatCard
            title="Leave Balance"
            value="14.5 Days"
            subtext="Casual: 4.5 • Earned: 10"
            trend={{ value: 'Annual quota', positive: true }}
            icon={Calendar}
            iconColor="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50"
          />
        </FeatureGate>

        {/* Client Visits tile (Only for Field Sales or employees with Visit grant) */}
        <FeatureGate feature="VISIT">
          <StatCard
            title="Field Client Visits"
            value="18 Beats"
            subtext="GPS Geo-Tracked today"
            trend={{ value: 'Target: 20 beats', positive: true }}
            icon={Navigation}
            iconColor="text-sky-600 bg-sky-50 dark:bg-sky-950/50"
          />
        </FeatureGate>

        {/* Expenses tile */}
        <FeatureGate feature="EXPENSE">
          <StatCard
            title="Expense Claims"
            value="₹ 4,320"
            subtext="2 Vouchers pending settlement"
            trend={{ value: 'Claim status', positive: true }}
            icon={Receipt}
            iconColor="text-amber-600 bg-amber-50 dark:bg-amber-950/50"
          />
        </FeatureGate>

        {/* Overtime tile (Only for Factory Worker or manufacturing roles) */}
        <FeatureGate feature="OVERTIME">
          <StatCard
            title="Overtime Accumulated"
            value="8.5 Hours"
            subtext="Double wage rate applied"
            trend={{ value: '+3.5h this week', positive: true }}
            icon={Clock}
            iconColor="text-purple-600 bg-purple-50 dark:bg-purple-950/50"
          />
        </FeatureGate>

        {/* Sales Incentives tile (Field Sales) */}
        <FeatureGate feature="INCENTIVE">
          <StatCard
            title="Target Incentives"
            value="₹ 12,500"
            subtext="Q3 Sales commission locked"
            trend={{ value: '112% of quota', positive: true }}
            icon={TrendingUp}
            iconColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
          />
        </FeatureGate>

        {/* Payslip & Finance tile */}
        <FeatureGate feature="PAYSLIP">
          <StatCard
            title="Latest Payslip"
            value="Sept 2026"
            subtext="Ready for download"
            icon={Banknote}
            iconColor="text-violet-600 bg-violet-50 dark:bg-violet-950/50"
          />
        </FeatureGate>

        {/* MSS Approvals tile (Manager or HR Admin) */}
        <FeatureGate feature="MSS_APPROVALS">
          <StatCard
            title="Pending Approvals"
            value="3 Requests"
            subtext="Team leaves & expense claims"
            trend={{ value: 'Review needed', positive: false }}
            icon={CheckCircle2}
            iconColor="text-rose-600 bg-rose-50 dark:bg-rose-950/50"
          />
        </FeatureGate>
      </div>

      {/* Grid: Workforce Directory Table & Approval Timeline Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Data Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              <span>
                {settings.role === 'Employee' ? 'Department Colleagues' : 'Workforce Roster Overview'}
              </span>
            </h3>
            <span className="text-xs text-muted-foreground">Effective Access Controlled</span>
          </div>

          <FilterBar
            searchQuery={filterSearch}
            onSearchChange={setFilterSearch}
            searchPlaceholder="Search by name, department, or ID..."
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { label: 'Active', value: 'active' },
              { label: 'On Leave', value: 'on-leave' },
            ]}
            onReset={() => {
              setFilterSearch('')
              setStatusFilter('all')
            }}
          />

          <DataTable columns={columns} data={filteredData} />
        </div>

        {/* Right 1 Col: Audit & Approval Workflow Demonstration */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Universal Approval Trail</span>
          </h3>

          <div className="bg-card border border-border rounded-xl p-4 shadow-2xs space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Live multi-tier audit trail for employee requests under current profile policies:
            </p>
            <ApprovalTimeline
              steps={[
                {
                  id: 'step-1',
                  title: 'Request Initiated',
                  approverName: currentEmployee.name,
                  approverRole: `${currentEmployee.profileType} (${currentEmployee.designation})`,
                  status: 'approved',
                  timestamp: 'Oct 08, 09:30 AM',
                  comments: 'Application submitted through ESS portal.',
                },
                {
                  id: 'step-2',
                  title: 'Supervisor Review',
                  approverName: currentEmployee.reportingManagerName || 'Vikram Malhotra',
                  approverRole: 'Direct Reporting Manager',
                  status: 'approved',
                  timestamp: 'Oct 08, 11:15 AM',
                  comments: 'Coverage confirmed. Approved.',
                },
                {
                  id: 'step-3',
                  title: 'HR Compliance Signoff',
                  approverName: 'Sarah Jenkins',
                  approverRole: 'Chief People Officer',
                  status: 'pending',
                  timestamp: 'Under Verification',
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
