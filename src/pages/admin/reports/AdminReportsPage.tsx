import React, { useState } from 'react'
import { FeatureGate } from '@/components/common/FeatureGate'
import { ExportNotice } from '@/components/common/ExportNotice'
import {
  useReports,
  type ReportDefinition,
  type ScheduledReportItem,
} from '@/context/ReportsContext'
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClockAlert,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Layers,
  LineChart,
  Mail,
  PieChart,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Table,
  Trash2,
  TrendingUp,
  Users,
  Navigation,
  Banknote,
} from 'lucide-react'

export const AdminReportsPage: React.FC = () => {
  const {
    reports,
    scheduledReports,
    exportLogs,
    selectedReportId,
    setSelectedReportId,
    activeReport,
    builderConfig,
    setBuilderConfig,
    triggerReportExport,
    addScheduledReport,
    toggleScheduledReport,
    deleteScheduledReport,
  } = useReports()

  // Tab State
  const [activeTab, setActiveTab] = useState<'library' | 'builder' | 'scheduled' | 'exports'>('library')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Preview Modal State
  const [previewReport, setPreviewReport] = useState<ReportDefinition | null>(null)

  // New Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [schReportId, setSchReportId] = useState('REP-01')
  const [schFreq, setSchFreq] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly')
  const [schRecipients, setSchRecipients] = useState('hr-leadership@acme.corp, payroll-audit@acme.corp')
  const [schFormat, setSchFormat] = useState<'Excel (.xlsx)' | 'CSV (.csv)' | 'PDF (.pdf)'>('Excel (.xlsx)')

  // Filtered Reports
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Categories list
  const categories = ['All', 'Attendance & Shifts', 'Leaves & Time-Off', 'Compensation & Payroll', 'Reimbursements & Finance', 'Field Operations', 'Workforce & Demographics']

  // Handle Add Schedule Submit
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    const targetReport = reports.find((r) => r.id === schReportId)
    if (!targetReport) return

    addScheduledReport({
      reportId: schReportId,
      reportName: targetReport.name,
      frequency: schFreq,
      cronSummary:
        schFreq === 'Daily'
          ? 'Every working day at 09:00 AM'
          : schFreq === 'Weekly'
          ? 'Every Monday at 08:00 AM'
          : 'First day of every month at 06:00 AM',
      recipients: schRecipients.split(',').map((s) => s.trim()),
      format: schFormat,
      nextRunDate: schFreq === 'Daily' ? 'Tomorrow, 09:00 AM' : schFreq === 'Weekly' ? 'Next Monday, 08:00 AM' : 'Nov 01, 2026 06:00 AM',
      isActive: true,
    })
    setIsScheduleModalOpen(false)
  }

  // Toggle Column in Builder
  const toggleBuilderColumn = (col: string) => {
    setBuilderConfig((prev) => {
      const exists = prev.selectedColumns.includes(col)
      return {
        ...prev,
        selectedColumns: exists
          ? prev.selectedColumns.filter((c) => c !== col)
          : [...prev.selectedColumns, col],
      }
    })
  }

  return (
    <FeatureGate feature="TEAM_REPORTS">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3" />
                ENTERPRISE REPORTING & ANALYTICS
              </span>
              <span className="text-xs text-slate-500">Muster Rolls, Statutory PF/ESI & Custom Builder</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              HR Reports & Intelligence Command Center
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Access standardized compliance and operational registers, build custom multi-dimensional data views with chart visualizers, and automate recurring email report schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule Automated Dispatch
            </button>
            <button
              onClick={() => {
                setActiveTab('builder')
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Build Custom Report
            </button>
          </div>
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Standard Reports</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{reports.length} Reports</div>
            <p className="text-xs text-slate-500 mt-1">Muster Roll, Payroll, EPF/ESI, Attrition</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Statutory Compliance Registers</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              {reports.filter((r) => r.isStatutory).length} Active Forms
            </div>
            <p className="text-xs text-slate-500 mt-1">Form 25, Form 5A, ECR PF electronic challans</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Active Automated Schedules</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {scheduledReports.filter((s) => s.isActive).length} Cron Jobs
            </div>
            <p className="text-xs text-slate-500 mt-1">Daily, Weekly & Monthly distribution pipelines</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Export Governance Audit</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600">{exportLogs.length} Logged Downloads</div>
            <p className="text-xs text-slate-500 mt-1">With ExportNotice & IP audit capture</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'library'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Standard Report Library ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'builder'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Visual Report Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('scheduled')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scheduled'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Scheduled Reports ({scheduledReports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('exports')}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'exports'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export History & Telemetry</span>
          </button>
        </div>

        {/* TAB 1: REPORT LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by report name, statutory code (Form 25), or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs w-full outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {report.category}
                      </span>
                      {report.isStatutory && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          STATUTORY
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">{report.name}</h4>
                      <span className="text-[11px] font-mono text-indigo-600 font-semibold">{report.code}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {report.description}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                      <span>Frequency: <strong>{report.frequency}</strong></span>
                      <span>Updated: <strong>{report.lastGenerated}</strong></span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setPreviewReport(report)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => triggerReportExport(report.name, 'Excel (.xlsx)')}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1"
                        title="Download as Excel"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>.XLSX</span>
                      </button>
                      <button
                        onClick={() => triggerReportExport(report.name, 'CSV (.csv)')}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-semibold flex items-center gap-1"
                        title="Download as CSV"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>.CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VISUAL REPORT BUILDER */}
        {activeTab === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Builder Controls */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5 text-xs">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Custom Query & Visualization Builder
                </h3>
                <p className="text-slate-500 mt-0.5">
                  Select dimensions, metrics, filters, and visualization type to generate tailored management analytics.
                </p>
              </div>

              {/* Title Input */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Report Title</label>
                <input
                  type="text"
                  value={builderConfig.reportTitle}
                  onChange={(e) => setBuilderConfig((prev) => ({ ...prev, reportTitle: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Base Report Template */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Base Data Model</label>
                <select
                  value={builderConfig.baseReportId}
                  onChange={(e) => setBuilderConfig((prev) => ({ ...prev, baseReportId: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Column Chooser */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Columns to Include ({builderConfig.selectedColumns.length})
                </label>
                <div className="grid grid-cols-2 gap-1.5 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 max-h-40 overflow-y-auto">
                  {[
                    'Employee ID',
                    'Employee Name',
                    'Department',
                    'Branch',
                    'Designation',
                    'Gross Pay',
                    'Total Deductions',
                    'Net Pay',
                    'Present Days',
                    'LOP Days',
                    'OT Pay',
                  ].map((col) => (
                    <label key={col} className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 text-[11px]">
                      <input
                        type="checkbox"
                        checked={builderConfig.selectedColumns.includes(col)}
                        onChange={() => toggleBuilderColumn(col)}
                        className="rounded text-indigo-600"
                      />
                      <span className="truncate">{col}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Multi-Filters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Filter Branch</label>
                  <select
                    value={builderConfig.filterBranch}
                    onChange={(e) => setBuilderConfig((prev) => ({ ...prev, filterBranch: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="All">All Branches</option>
                    <option value="Bengaluru HQ">Bengaluru HQ</option>
                    <option value="Mumbai Tech Park">Mumbai Tech Park</option>
                    <option value="Pune Plant">Pune Plant</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Filter Department</label>
                  <select
                    value={builderConfig.filterDepartment}
                    onChange={(e) => setBuilderConfig((prev) => ({ ...prev, filterDepartment: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="All">All Departments</option>
                    <option value="Field Sales">Field Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>
              </div>

              {/* Group By & Chart Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Group By Dimension</label>
                  <select
                    value={builderConfig.groupByField}
                    onChange={(e) => setBuilderConfig((prev) => ({ ...prev, groupByField: e.target.value }))}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="Department">Department</option>
                    <option value="Branch">Branch Location</option>
                    <option value="Designation">Designation Level</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Chart Type</label>
                  <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      onClick={() => setBuilderConfig((prev) => ({ ...prev, chartType: 'bar' }))}
                      className={`p-1.5 rounded-lg flex items-center justify-center ${
                        builderConfig.chartType === 'bar' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600' : 'text-slate-400'
                      }`}
                      title="Bar Chart"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBuilderConfig((prev) => ({ ...prev, chartType: 'line' }))}
                      className={`p-1.5 rounded-lg flex items-center justify-center ${
                        builderConfig.chartType === 'line' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600' : 'text-slate-400'
                      }`}
                      title="Line Chart"
                    >
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBuilderConfig((prev) => ({ ...prev, chartType: 'pie' }))}
                      className={`p-1.5 rounded-lg flex items-center justify-center ${
                        builderConfig.chartType === 'pie' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600' : 'text-slate-400'
                      }`}
                      title="Donut / Pie Chart"
                    >
                      <PieChart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setBuilderConfig((prev) => ({ ...prev, chartType: 'table' }))}
                      className={`p-1.5 rounded-lg flex items-center justify-center ${
                        builderConfig.chartType === 'table' ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600' : 'text-slate-400'
                      }`}
                      title="Data Table"
                    >
                      <Table className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => triggerReportExport(builderConfig.reportTitle, 'Excel (.xlsx)', 142)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Custom .xlsx</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Analytics Preview */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Live Simulation Preview
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {builderConfig.reportTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Aggregated by <strong>{builderConfig.groupByField}</strong> • Filter: {builderConfig.filterBranch}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Showing 4 Cohort Groups</span>
                  </div>
                </div>

                {/* Simulated Chart Visualization */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Group Aggregation Metrics</span>
                    <span className="text-indigo-600 font-semibold">Total Sample: 340 Employees</span>
                  </div>

                  {/* Visual Bar Breakdown */}
                  <div className="space-y-3">
                    {[
                      { name: 'Field Sales', count: 120, pct: 35, color: 'bg-indigo-500', avgCost: '₹62,400' },
                      { name: 'Engineering', count: 95, pct: 28, color: 'bg-blue-500', avgCost: '₹88,200' },
                      { name: 'Manufacturing & Plants', count: 85, pct: 25, color: 'bg-emerald-500', avgCost: '₹34,500' },
                      { name: 'People & Operations', count: 40, pct: 12, color: 'bg-purple-500', avgCost: '₹54,000' },
                    ].map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                          <span className="text-slate-500">{item.count} Staff ({item.pct}%) • Avg: {item.avgCost}</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columns Selected Pill List */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block mb-1.5 uppercase">
                    Active Projected Attributes ({builderConfig.selectedColumns.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {builderConfig.selectedColumns.map((col) => (
                      <span
                        key={col}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SCHEDULED REPORTS */}
        {activeTab === 'scheduled' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Automated Recurring Email Dispatch Schedules
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure cron schedules to automatically compile and email report workbooks to leadership, plant managers, and statutory auditors.
                </p>
              </div>

              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Automated Schedule
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-4">Schedule Name & Report</th>
                    <th className="py-3 px-4">Recurrence Frequency</th>
                    <th className="py-3 px-4">Distribution Recipients</th>
                    <th className="py-3 px-4">Format</th>
                    <th className="py-3 px-4">Next Run</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scheduledReports.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{sch.reportName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{sch.id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{sch.frequency}</span>
                        <span className="block text-[10px] text-slate-400">{sch.cronSummary}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          {sch.recipients.map((r, i) => (
                            <span key={i} className="text-slate-600 dark:text-slate-400 text-[11px] font-mono">
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-600">{sch.format}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-medium">{sch.nextRunDate}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleScheduledReport(sch.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            sch.isActive
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {sch.isActive ? 'ACTIVE' : 'PAUSED'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteScheduledReport(sch.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete Schedule"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: EXPORT HISTORY & COMPLIANCE TELEMETRY */}
        {activeTab === 'exports' && (
          <div className="space-y-4">
            {/* Export Notice Banner */}
            <ExportNotice />

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-600" />
                    Data Export Audit & Download Ledger
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Immutable log capturing who extracted organizational data, timestamp, row counts, and client IP addresses.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold bg-slate-50 dark:bg-slate-800/50">
                      <th className="py-3 px-4">Export Batch ID</th>
                      <th className="py-3 px-4">Report Description</th>
                      <th className="py-3 px-4">Export Format</th>
                      <th className="py-3 px-4">Row Count</th>
                      <th className="py-3 px-4">File Size</th>
                      <th className="py-3 px-4">Exported By</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {exportLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{log.id}</td>
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{log.reportName}</td>
                        <td className="py-3 px-4 font-semibold text-indigo-600">{log.exportFormat}</td>
                        <td className="py-3 px-4 font-bold">{log.rowCount.toLocaleString('en-IN')} rows</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{log.fileSize}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{log.exportedBy}</div>
                          <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => triggerReportExport(log.reportName, log.exportFormat, log.rowCount)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 ml-auto"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Re-download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PREVIEW STANDARD REPORT */}
        {previewReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 font-mono">{previewReport.code}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{previewReport.name}</h3>
                  <span className="text-xs text-slate-500">{previewReport.category}</span>
                </div>
                <button
                  onClick={() => setPreviewReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg text-xs"
                >
                  ✕
                </button>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1 uppercase text-[10px]">Description</span>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {previewReport.description}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1.5 uppercase text-[10px]">
                  Included Columns & Metrics ({previewReport.availableColumns.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewReport.availableColumns.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    triggerReportExport(previewReport.name, 'Excel (.xlsx)')
                    setPreviewReport(null)
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel (.xlsx)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CREATE SCHEDULE */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Automated Recurring Schedule</h3>

              <form onSubmit={handleCreateSchedule} className="space-y-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Target Report</label>
                  <select
                    value={schReportId}
                    onChange={(e) => setSchReportId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {reports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Frequency</label>
                    <select
                      value={schFreq}
                      onChange={(e) => setSchFreq(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Daily">Daily (Working Days)</option>
                      <option value="Weekly">Weekly (Every Monday)</option>
                      <option value="Monthly">Monthly (1st of Month)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Export Format</label>
                    <select
                      value={schFormat}
                      onChange={(e) => setSchFormat(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <option value="Excel (.xlsx)">Excel (.xlsx)</option>
                      <option value="CSV (.csv)">CSV (.csv)</option>
                      <option value="PDF (.pdf)">PDF (.pdf)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Recipient Email List (Comma separated)</label>
                  <textarea
                    rows={2}
                    value={schRecipients}
                    onChange={(e) => setSchRecipients(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold"
                  >
                    Save Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </FeatureGate>
  )
}

export default AdminReportsPage
