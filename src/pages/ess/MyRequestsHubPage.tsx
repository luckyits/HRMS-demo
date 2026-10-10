import { FeatureGate } from '@/components/common/FeatureGate'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAccess } from '@/access/useAccess'
import { useEss } from '@/context/EssContext'
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Filter,
  HelpCircle,
  PlusCircle,
  Receipt,
  Search,
  ShieldAlert,
  UserCheck,
  Navigation,
  Banknote,
  UserMinus,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

interface AggregatedRequest {
  id: string
  module: string
  type: string
  date: string
  details: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  actionUrl: string
}

export const MyRequestsHubPage: React.FC = () => {
  const { hasFeature } = useAccess()
  const { leaveRequests, tickets, pendingProfileEdit } = useEss()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedModule, setSelectedModule] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Request types the employee is entitled to raise
  const allowedRequestTypes = useMemo(() => {
    const list: Array<{
      code: string
      title: string
      desc: string
      icon: React.ElementType
      url: string
      color: string
      badge?: string
    }> = []

    if (hasFeature('LEAVE')) {
      list.push({
        code: 'LEAVE',
        title: 'Apply for Leave',
        desc: 'Casual, Earned, Sick, or Half-day leaves with document upload',
        icon: CalendarCheck,
        url: '/employee/leaves',
        color: 'from-blue-500 to-indigo-600',
      })
    }

    if (hasFeature('REGULARIZATION')) {
      list.push({
        code: 'REGULARIZATION',
        title: 'Attendance Regularization',
        desc: 'Request manager approval for missing punches or out-of-fence presence',
        icon: Clock,
        url: '/employee/attendance',
        color: 'from-amber-500 to-orange-600',
      })
    }

    if (hasFeature('HELPDESK')) {
      list.push({
        code: 'HELPDESK',
        title: 'Helpdesk / Grievance Ticket',
        desc: 'Submit operational inquiries or confidential anonymous workplace grievances',
        icon: HelpCircle,
        url: '/employee/helpdesk',
        color: 'from-emerald-500 to-teal-600',
      })
    }

    if (hasFeature('PROFILE')) {
      list.push({
        code: 'PROFILE',
        title: 'Profile Data Update',
        desc: 'Request modifications to bank account, phone, or address credentials',
        icon: UserCheck,
        url: '/employee/profile',
        color: 'from-purple-500 to-violet-600',
      })
    }

    if (hasFeature('EXPENSE')) {
      list.push({
        code: 'EXPENSE',
        title: 'Reimbursement Claim',
        desc: 'Submit travel, food, or client expense vouchers with tax invoices',
        icon: Receipt,
        url: '/employee/claims',
        color: 'from-rose-500 to-pink-600',
        badge: 'Optional',
      })
    }

    if (hasFeature('COMPOFF')) {
      list.push({
        code: 'COMPOFF',
        title: 'Compensatory Off Credit',
        desc: 'Claim credit for weekend or public holiday deployment shifts',
        icon: FileText,
        url: '/employee/overtime',
        color: 'from-sky-500 to-cyan-600',
      })
    }

    if (hasFeature('OVERTIME')) {
      list.push({
        code: 'OVERTIME',
        title: 'Overtime & Attendance Bonus',
        desc: 'Request authorization for extended shift hours and track regularity bonus',
        icon: Clock,
        url: '/employee/overtime',
        color: 'from-amber-500 to-indigo-600',
      })
    }

    if (hasFeature('VISIT')) {
      list.push({
        code: 'VISIT',
        title: 'Client Visits & Beat Route',
        desc: 'Log GPS client check-in/out, record store orders, and claim travel allowance',
        icon: Navigation,
        url: '/employee/visits',
        color: 'from-sky-500 to-blue-600',
      })
    }

    if (hasFeature('FINANCE')) {
      list.push({
        code: 'FINANCE',
        title: 'Salary Advance / Loan',
        desc: 'Request zero-interest salary advance or company loan with interactive EMI calculator',
        icon: Banknote,
        url: '/employee/loans',
        color: 'from-emerald-500 to-teal-700',
      })
    }

    if (hasFeature('RESIGNATION')) {
      list.push({
        code: 'RESIGNATION',
        title: 'Apply Resignation / Exit',
        desc: 'Submit formal resignation notice, track approvals, and manage exit clearance checklist',
        icon: UserMinus,
        url: '/employee/resignation',
        color: 'from-purple-500 to-indigo-700',
      })
    }

    return list
  }, [hasFeature])

  // Aggregate all user's requests across modules
  const allRequests: AggregatedRequest[] = useMemo(() => {
    const list: AggregatedRequest[] = []

    // 1. Leave requests
    leaveRequests.forEach((req) => {
      list.push({
        id: req.id,
        module: 'Leave',
        type: req.leaveType,
        date: req.submittedAt,
        details: `${req.startDate} to ${req.endDate} (${req.daysCount} day${req.daysCount > 1 ? 's' : ''}) • ${req.reason}`,
        status: req.status,
        actionUrl: '/employee/leaves',
      })
    })

    // 2. Helpdesk tickets
    tickets.forEach((tkt) => {
      let mappedStatus: 'approved' | 'pending' | 'rejected' | 'cancelled' = 'pending'
      if (tkt.status === 'Resolved' || tkt.status === 'Closed') mappedStatus = 'approved'
      else if (tkt.status === 'In Progress' || tkt.status === 'Open') mappedStatus = 'pending'

      list.push({
        id: tkt.id,
        module: 'Helpdesk',
        type: tkt.category,
        date: tkt.createdAt,
        details: `${tkt.subject}${tkt.isAnonymous ? ' (Anonymous)' : ''}`,
        status: mappedStatus,
        actionUrl: '/employee/helpdesk',
      })
    })

    // 3. Profile edit request if active
    if (pendingProfileEdit) {
      list.push({
        id: 'REQ-PROF-01',
        module: 'Profile Edit',
        type: 'Information Update',
        date: 'Today',
        details: `Updated ${Object.keys(pendingProfileEdit).join(', ')} awaiting HR review`,
        status: 'pending',
        actionUrl: '/employee/profile',
      })
    }

    // 4. Sample Attendance Regularization
    list.push({
      id: 'REG-2026-10',
      module: 'Attendance',
      type: 'Missing Punch Regularization',
      date: 'Oct 04, 2026',
      details: 'Regularize Oct 04 evening punch out (On client site meeting with vendor)',
      status: 'approved',
      actionUrl: '/employee/attendance',
    })

    return list
  }, [leaveRequests, tickets, pendingProfileEdit])

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return allRequests.filter((req) => {
      const matchesSearch =
        req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesModule = selectedModule === 'All' || req.module === selectedModule
      const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus
      return matchesSearch && matchesModule && matchesStatus
    })
  }, [allRequests, searchQuery, selectedModule, selectedStatus])

  const pendingCount = allRequests.filter((r) => r.status === 'pending').length
  const approvedCount = allRequests.filter((r) => r.status === 'approved').length

  return (
    <FeatureGate feature="LEAVE">
      <div className="space-y-6">
        <PageHeader
          title="My Requests Hub"
          subtitle="Unified self-service station to raise workflows and monitor your application statuses"
          action={
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="w-3.5 h-3.5" />
                {pendingCount} Pending Approvals
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {approvedCount} Approved
              </span>
            </div>
          }
        />

        {/* Section 1: Entitled Request Types Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Raise New Request
              <span className="text-xs font-normal text-slate-500">
                (Showing {allowedRequestTypes.length} entitlement types based on your company role)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allowedRequestTypes.map((type) => {
              const Icon = type.icon
              return (
                <Link
                  key={type.code}
                  to={type.url}
                  className="group relative flex flex-col justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${type.color} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {type.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {type.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {type.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <span>Open Request Form</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Section 2: Aggregated Requests Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                All Submitted Requests & Statuses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track status across Leave, Attendance Regularization, Helpdesk, and Profile updates
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="All">All Modules</option>
                  <option value="Leave">Leave</option>
                  <option value="Attendance">Attendance</option>
                  <option value="Helpdesk">Helpdesk</option>
                  <option value="Profile Edit">Profile Edit</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                >
                  <option value="All">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Summary / Reason</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                      No matching requests found
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white font-mono">
                        {req.id}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {req.module}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                        {req.type}
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-600 dark:text-slate-400" title={req.details}>
                        {req.details}
                      </td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {req.date}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={req.actionUrl}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit / Policy Notice */}
        <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Workflow Governance Notice:</span> All submitted requests are timestamped and routed according to your operational reporting hierarchy (Reporting Manager → Functional HR Lead). Notifications are sent via email and in-app alerts.
          </div>
        </div>
      </div>
    </FeatureGate>
  )
}
export default MyRequestsHubPage
