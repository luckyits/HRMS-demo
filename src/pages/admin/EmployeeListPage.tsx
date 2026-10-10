import { Can } from '@/components/common/Can'
import { ExportNotice } from '@/components/common/ExportNotice'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useEmployees, type ExtendedEmployee } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  Building,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate()
  const { employees, masterData, addEmployee } = useEmployees()

  // Filters state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<string>('All')
  const [selectedDept, setSelectedDept] = useState<string>('All')
  const [selectedProfile, setSelectedProfile] = useState<string>('All')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')

  // Column Chooser state
  const [showColumnChooser, setShowColumnChooser] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    employee: true,
    department: true,
    branch: true,
    profile: true,
    manager: true,
    ctc: true,
    joiningDate: true,
    status: true,
  })

  // Excel Import Simulation state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [importPreviewData, setImportPreviewData] = useState<
    {
      name: string
      email: string
      department: string
      branch: string
      designation: string
      profile: string
      status: 'Valid' | 'Warning' | 'Error'
      note: string
    }[]
  >([])

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesBranch = selectedBranch === 'All' || emp.branch === selectedBranch
      const matchesDept = selectedDept === 'All' || emp.department === selectedDept
      const matchesProfile = selectedProfile === 'All' || emp.profileType === selectedProfile
      const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus

      return matchesSearch && matchesBranch && matchesDept && matchesProfile && matchesStatus
    })
  }, [employees, searchTerm, selectedBranch, selectedDept, selectedProfile, selectedStatus])

  // Stats
  const activeCount = employees.filter((e) => e.status === 'Active').length
  const probationCount = employees.filter((e) => e.status === 'Probation').length
  const noticeCount = employees.filter((e) => e.status === 'On Notice').length

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
      setIsParsing(true)
      setTimeout(() => {
        setIsParsing(false)
        setImportPreviewData([
          {
            name: 'Pooja Hegde',
            email: 'pooja.h@apex.internal',
            department: 'Engineering',
            branch: 'Bengaluru HQ',
            designation: 'Backend Developer',
            profile: 'Office Staff',
            status: 'Valid',
            note: 'All fields valid',
          },
          {
            name: 'Rohan Deshmukh',
            email: 'rohan.d@apex.internal',
            department: 'Plant Operations',
            branch: 'Pune Plant 1',
            designation: 'Tooling Specialist',
            profile: 'Factory Worker',
            status: 'Valid',
            note: 'All fields valid',
          },
          {
            name: 'Amitabh Sen',
            email: 'invalid-email-format',
            department: 'Marketing',
            branch: 'Hyderabad Hub',
            designation: 'SEO Specialist',
            profile: 'Remote',
            status: 'Error',
            note: 'Malformed email address',
          },
          {
            name: 'Farhan Akhtar',
            email: 'farhan.a@apex.internal',
            department: 'Field Sales',
            branch: 'Ahmedabad Hub',
            designation: 'Territory Sales Lead',
            profile: 'Field Sales',
            status: 'Warning',
            note: 'Duplicate mobile number warning',
          },
        ])
      }, 700)
    }
  }

  const handleCommitImport = () => {
    const validRows = importPreviewData.filter((r) => r.status !== 'Error')
    validRows.forEach((row) => {
      addEmployee({
        name: row.name,
        email: row.email,
        department: row.department,
        branch: row.branch,
        designation: row.designation,
        profileType: row.profile as any,
        status: 'Probation',
        ctc: '₹ 9,00,000',
      })
    })
    setShowImportModal(false)
    setImportFile(null)
    setImportPreviewData([])
    alert(`Successfully imported ${validRows.length} valid employees!`)
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Navigation */}
      <PageHeader
        title="Employees Directory"
        subtitle="Manage master employment profiles, department assignments, and workforce life cycles."
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted transition shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Import Excel</span>
            </button>
            <Link
              to="/hr/employees/bulk"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted transition shadow-2xs"
            >
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <span>Bulk Actions</span>
            </Link>
            <Link
              to="/hr/employees/probation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted transition shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Probation Tracker ({probationCount})</span>
            </Link>
            <Can action="create" feature="PROFILE">
              <Link
                to="/hr/employees/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Employee</span>
              </Link>
            </Can>
          </div>
        }
      />

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Headcount</p>
            <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{employees.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Active Permanent</p>
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 mt-0.5">
              {activeCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Under Probation</p>
            <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 mt-0.5">
              {probationCount}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Serving Notice</p>
            <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400 mt-0.5">{noticeCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3.5 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, ID, email or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Toolbar Controls */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto">
            {/* Column Chooser Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowColumnChooser(!showColumnChooser)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-background border border-border text-foreground hover:bg-muted transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Columns</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
              </button>

              {showColumnChooser && (
                <div className="absolute right-0 top-full mt-1.5 w-48 p-2.5 bg-card border border-border rounded-xl shadow-lg z-30 space-y-2 text-xs">
                  <p className="font-semibold text-muted-foreground px-1 pb-1 border-b border-border">Visible Columns</p>
                  {Object.entries(visibleColumns).map(([key, isVis]) => (
                    <label key={key} className="flex items-center gap-2 px-1 py-0.5 hover:bg-muted/50 rounded cursor-pointer capitalize">
                      <input
                        type="checkbox"
                        checked={isVis}
                        onChange={() =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [key]: !prev[key as keyof typeof visibleColumns],
                          }))
                        }
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <ExportNotice compact />

            <button
              onClick={() => alert(`Exported ${filteredEmployees.length} employee records to Excel (Mock).`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-card border border-border hover:bg-muted text-foreground transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-border/60">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Branches</option>
              {masterData.branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Departments</option>
              {masterData.departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Profile Type</label>
            <select
              value={selectedProfile}
              onChange={(e) => setSelectedProfile(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Profiles</option>
              <option value="Office Staff">Office Staff</option>
              <option value="Field Sales">Field Sales</option>
              <option value="Factory Worker">Factory Worker</option>
              <option value="Remote">Remote</option>
              <option value="Intern">Intern</option>
              <option value="Contractor">Contractor</option>
              <option value="Manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs py-1.5 px-2.5 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="On Notice">On Notice</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                {visibleColumns.id && <th className="px-4 py-3 select-none">Emp ID</th>}
                {visibleColumns.employee && <th className="px-4 py-3 select-none">Employee</th>}
                {visibleColumns.department && <th className="px-4 py-3 select-none">Department</th>}
                {visibleColumns.branch && <th className="px-4 py-3 select-none">Branch</th>}
                {visibleColumns.profile && <th className="px-4 py-3 select-none">Profile</th>}
                {visibleColumns.manager && <th className="px-4 py-3 select-none">Reporting To</th>}
                {visibleColumns.ctc && <th className="px-4 py-3 select-none">CTC</th>}
                {visibleColumns.joiningDate && <th className="px-4 py-3 select-none">Join Date</th>}
                {visibleColumns.status && <th className="px-4 py-3 select-none">Status</th>}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground text-sm">
                    No matching employees found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/40 transition">
                    {visibleColumns.id && (
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-medium">{emp.id}</td>
                    )}
                    {visibleColumns.employee && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                          />
                          <div>
                            <Link
                              to={`/hr/employees/${emp.id}`}
                              className="font-medium text-foreground hover:text-primary transition block leading-snug"
                            >
                              {emp.name}
                            </Link>
                            <span className="text-xs text-muted-foreground">{emp.designation}</span>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.department && (
                      <td className="px-4 py-3 text-xs text-muted-foreground">{emp.department}</td>
                    )}
                    {visibleColumns.branch && (
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Building className="w-3 h-3 text-muted-foreground/70" />
                          {emp.branch}
                        </span>
                      </td>
                    )}
                    {visibleColumns.profile && (
                      <td className="px-4 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary text-secondary-foreground border border-border">
                          {emp.profileType}
                        </span>
                      </td>
                    )}
                    {visibleColumns.manager && (
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {emp.reportingManagerName || '—'}
                      </td>
                    )}
                    {visibleColumns.ctc && (
                      <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{emp.ctc}</td>
                    )}
                    {visibleColumns.joiningDate && (
                      <td className="px-4 py-3 text-xs text-muted-foreground">{emp.joiningDate}</td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-3">
                        <StatusBadge status={emp.status} />
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/hr/employees/${emp.id}`}
                          title="Open 360 Dossier"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/hr/features/explainer?empId=${emp.id}`}
                          title="View Access Explainer"
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-500 hover:bg-muted transition"
                        >
                          <SlidersHorizontal className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredEmployees.length} of {employees.length} records</span>
          <span>Desktop HRMS Registry</span>
        </div>
      </div>

      {/* Simulated Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Import Workforce from Excel / CSV</h3>
                  <p className="text-xs text-muted-foreground">
                    Upload your employee roster. Rows will be validated before commit.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportFile(null)
                  setImportPreviewData([])
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!importFile ? (
              <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition text-center space-y-3">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Click or drag Excel sheet (.xlsx, .csv) here</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Template supports up to 5,000 employees</p>
                </div>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={handleSimulateFileSelect}
                />
              </label>
            ) : isParsing ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <RefreshCw className="w-6 h-6 text-primary animate-spin" />
                <p className="text-sm text-foreground font-medium">Parsing and validating roster records...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
                  <span>File: <strong className="text-foreground">{importFile.name}</strong></span>
                  <span>Validation: <span className="text-emerald-500 font-medium">3 Valid</span> / <span className="text-rose-500 font-medium">1 Error</span></span>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-lg border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted text-muted-foreground font-medium border-b border-border sticky top-0">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Email</th>
                        <th className="p-2">Department</th>
                        <th className="p-2">Profile</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {importPreviewData.map((row, i) => (
                        <tr key={i} className={row.status === 'Error' ? 'bg-rose-500/5' : ''}>
                          <td className="p-2 font-medium">{row.name}</td>
                          <td className="p-2 font-mono text-[11px]">{row.email}</td>
                          <td className="p-2">{row.department}</td>
                          <td className="p-2">{row.profile}</td>
                          <td className="p-2">
                            {row.status === 'Valid' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                              </span>
                            ) : row.status === 'Warning' ? (
                              <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                                <AlertCircle className="w-3.5 h-3.5" /> Warning
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
                                <X className="w-3.5 h-3.5" /> Error
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-muted-foreground">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setImportFile(null)
                      setImportPreviewData([])
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-card border border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCommitImport}
                    className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                  >
                    Commit Valid Rows (3)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
