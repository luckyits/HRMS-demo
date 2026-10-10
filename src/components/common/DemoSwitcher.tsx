import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { MOCK_EMPLOYEES } from '@/mock/employees'
import type { CompanyType, EmployeeType, Role } from '@/types'
import {
  Building2,
  Check,
  Code2,
  Layers,
  RefreshCw,
  SlidersHorizontal,
  UserCheck,
  Users,
  X,
  Smartphone,
  WifiOff,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const ROLES: Role[] = ['HR Admin', 'Manager', 'Employee']

const EMPLOYEE_TYPES: EmployeeType[] = [
  'Office Staff',
  'Field Sales',
  'Factory Worker',
  'Remote',
  'Intern',
  'Contractor',
  'Manager',
]

const COMPANY_TYPES: CompanyType[] = [
  'IT',
  'Manufacturing',
  'Retail',
  'Hospital',
  'School',
  'Field Sales',
  'Construction',
  'Logistics',
  'Small Shop',
]

export const DemoSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const {
    settings,
    setRole,
    setEmployeeType,
    setCompanyType,
    setPhonePreview,
    setOfflineMode,
    resetDemoData,
  } = useDemo()
  const { currentEmployee, clearCache } = useAccess()

  const handleProfileChange = (newProfile: EmployeeType) => {
    setEmployeeType(newProfile)
    // Synchronize role if selecting Manager
    if (newProfile === 'Manager' && settings.role === 'Employee') {
      setRole('Manager')
    }
    clearCache()
  }

  const handleCompanyChange = (newComp: CompanyType) => {
    setCompanyType(newComp)
    clearCache()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* Trigger floating button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border border-indigo-400/40 text-sm font-medium"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Demo Switcher</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-96 bg-card border border-border rounded-3xl shadow-2xl p-5 text-sm z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Access Engine Persona Hub</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {/* Mobile Preview & Offline Toggles */}
            <div className="p-3 rounded-2xl bg-muted/40 border border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Phone Preview
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      390×844 frame on desktop
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPhonePreview(!settings.phonePreview)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settings.phonePreview ? 'bg-indigo-600 justify-end' : 'bg-muted-foreground/30 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </button>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      Offline Mode Simulation
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Sync punches & claims locally
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOfflineMode(!settings.offlineMode)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                    settings.offlineMode ? 'bg-amber-500 justify-end' : 'bg-muted-foreground/30 justify-start'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
                </button>
              </div>
            </div>

            {/* 1. View As Role */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <UserCheck className="w-3.5 h-3.5 text-primary" />
                1) View As (Role)
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/60">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r)
                      clearCache()
                    }}
                    className={`px-2 py-1.5 rounded-md text-xs font-medium transition text-center ${
                      settings.role === r
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Employee Profile */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                2) Employee Type Profile
              </label>
              <select
                value={settings.employeeType}
                onChange={(e) => handleProfileChange(e.target.value as EmployeeType)}
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                {EMPLOYEE_TYPES.map((et) => (
                  <option key={et} value={et}>
                    {et}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Company Type Template */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Building2 className="w-3.5 h-3.5 text-primary" />
                3) Company Industry Template
              </label>
              <select
                value={settings.companyType}
                onChange={(e) => handleCompanyChange(e.target.value as CompanyType)}
                className="w-full px-3 py-2 text-xs bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                {COMPANY_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct} Industry Template
                  </option>
                ))}
              </select>
            </div>

            {/* Active User Summary matched from Mock Employees */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-3">
              <img
                src={currentEmployee.avatar}
                alt={currentEmployee.name}
                className="w-9 h-9 rounded-full object-cover border border-border shrink-0 mt-0.5"
              />
              <div className="min-w-0 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate text-foreground">
                    {currentEmployee.name}
                  </p>
                  <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                    {currentEmployee.id}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {currentEmployee.designation}
                </p>
                <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                  {currentEmployee.department} • {currentEmployee.branch}
                </p>
              </div>
            </div>

            {/* Quick Links & Reset Actions */}
            <div className="pt-2 flex items-center gap-2">
              <Link
                to="/dev/access"
                onClick={() => setIsOpen(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg transition"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Access Engine</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  resetDemoData()
                  clearCache()
                }}
                className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition border border-rose-200 dark:border-rose-900"
                title="Reset demo data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
