import { PageHeader } from '@/components/common/PageHeader'
import { useEmployees, type ExtendedEmployee } from '@/context/EmployeeContext'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Building,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Filter,
  Minus,
  Plus,
  Search,
  User,
  Users,
  X,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

interface TreeNode {
  employee: ExtendedEmployee
  children: TreeNode[]
}

export const OrgChartPage: React.FC = () => {
  const { employees, masterData } = useEmployees()

  const [selectedBranch, setSelectedBranch] = useState('All')
  const [selectedDept, setSelectedDept] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmp, setSelectedEmp] = useState<ExtendedEmployee | null>(null)
  const [collapsedIds, setCollapsedIds] = useState<string[]>([])

  // Build tree hierarchy starting from top managers
  const treeData = useMemo(() => {
    const branchFiltered = employees.filter((e) => {
      const matchBranch = selectedBranch === 'All' || e.branch === selectedBranch
      const matchDept = selectedDept === 'All' || e.department === selectedDept
      return matchBranch && matchDept
    })

    // Group by manager
    const managerMap = new Map<string, ExtendedEmployee[]>()
    branchFiltered.forEach((emp) => {
      const mgrId = emp.reportingManagerId || 'ROOT'
      if (!managerMap.has(mgrId)) {
        managerMap.set(mgrId, [])
      }
      managerMap.get(mgrId)!.push(emp)
    })

    // Recursive tree builder
    const buildNode = (emp: ExtendedEmployee): TreeNode => {
      const directReports = managerMap.get(emp.id) || []
      return {
        employee: emp,
        children: directReports.map(buildNode),
      }
    }

    // Roots are top level executives or employees whose manager is not in the list
    const roots = branchFiltered.filter(
      (e) =>
        !e.reportingManagerId ||
        !branchFiltered.some((other) => other.id === e.reportingManagerId) ||
        e.designation.includes('Chief') ||
        e.designation.includes('Director')
    )

    // Deduplicate roots
    const uniqueRoots = Array.from(new Set(roots))
    return uniqueRoots.map(buildNode)
  }, [employees, selectedBranch, selectedDept])

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCollapsedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const renderNode = (node: TreeNode, depth = 0) => {
    const emp = node.employee
    const isCollapsed = collapsedIds.includes(emp.id)
    const hasChildren = node.children.length > 0
    const isSelected = selectedEmp?.id === emp.id

    return (
      <div key={emp.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => setSelectedEmp(emp)}
          className={cn(
            'relative p-3 rounded-xl border transition cursor-pointer bg-card shadow-2xs hover:shadow-md w-56 text-left group',
            isSelected
              ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
        >
          <div className="flex items-center gap-2.5">
            <img
              src={emp.avatar}
              alt={emp.name}
              className="w-9 h-9 rounded-full object-cover border border-border shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{emp.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{emp.designation}</p>
              <span className="text-[9px] font-semibold text-primary">{emp.grade}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50 mt-2">
            <span className="truncate">{emp.department}</span>
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => toggleCollapse(emp.id, e)}
                className="px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-semibold flex items-center gap-0.5"
                title={isCollapsed ? 'Expand reports' : 'Collapse reports'}
              >
                <span>{node.children.length}</span>
                {isCollapsed ? <Plus className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Children Sub-Tree */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col items-center">
            {/* Vertical connector */}
            <div className="w-px h-5 bg-border" />

            {/* Horizontal branch bar */}
            <div className="relative flex justify-center pt-2 gap-4">
              {node.children.length > 1 && (
                <div
                  className="absolute top-0 h-px bg-border"
                  style={{
                    left: '25%',
                    right: '25%',
                  }}
                />
              )}
              {node.children.map((child) => (
                <div key={child.employee.id} className="flex flex-col items-center">
                  <div className="w-px h-2 bg-border" />
                  {renderNode(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <Link
          to="/hr/employees"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Employee Directory</span>
        </Link>
      </div>

      <PageHeader
        title="Interactive Organization Chart"
        subtitle="Visual tree of corporate hierarchy, reporting channels, and span of control across all active branches."
      />

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-xs py-1.5 px-3 bg-background border border-input rounded-lg"
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
            <label className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs py-1.5 px-3 bg-background border border-input rounded-lg"
            >
              <option value="All">All Departments</option>
              {masterData.departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <button
            onClick={() => setCollapsedIds([])}
            className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-semibold"
          >
            Expand All
          </button>
          <button
            onClick={() => setCollapsedIds(employees.map((e) => e.id))}
            className="px-3 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground font-semibold"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative border border-border rounded-2xl bg-muted/20 p-8 min-h-[500px] overflow-x-auto flex justify-center shadow-inner">
        <div className="flex flex-wrap justify-center gap-12">
          {treeData.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No organization nodes found for the selected branch/department filter.
            </div>
          ) : (
            treeData.map((root) => renderNode(root))
          )}
        </div>

        {/* Selected Node Drawer / Card Overlay */}
        {selectedEmp && (
          <div className="fixed bottom-6 right-6 z-40 w-80 p-5 rounded-2xl bg-card border border-border shadow-2xl animate-in slide-in-from-bottom-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmp.avatar}
                  alt={selectedEmp.name}
                  className="w-12 h-12 rounded-xl object-cover border border-border"
                />
                <div>
                  <h4 className="font-bold text-foreground text-sm">{selectedEmp.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedEmp.designation}</p>
                  <span className="text-[10px] font-semibold text-primary">{selectedEmp.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-muted-foreground border-y border-border py-2">
              <p>Department: <strong className="text-foreground">{selectedEmp.department}</strong></p>
              <p>Branch: <strong className="text-foreground">{selectedEmp.branch}</strong></p>
              <p>Reports To: <strong className="text-foreground">{selectedEmp.reportingManagerName || 'None'}</strong></p>
              <p>Profile Type: <strong className="text-primary">{selectedEmp.profileType}</strong></p>
            </div>

            <Link
              to={`/hr/employees/${selectedEmp.id}`}
              className="w-full py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-1.5 hover:bg-primary/90 transition shadow-xs"
            >
              <span>Open Employee 360 Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
