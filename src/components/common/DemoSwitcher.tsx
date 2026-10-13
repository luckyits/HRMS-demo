import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useIsMobile } from '@/hooks/useIsMobile'
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
  Minimize2,
  Maximize2,
  ChevronLeft,
  Minus,
} from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export type SwitcherMode = 'compact' | 'docked' | 'expanded'

const ROLES: Role[] = ['HR Admin', 'Branch HR', 'Manager', 'Employee']

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
  const { isMobile, isWindowMobile } = useIsMobile()
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

  // Minimized/Compact mode state - defaults to 'compact' on mobile to avoid overlapping bottom bar
  const [mode, setMode] = useState<SwitcherMode>(() => {
    const saved = localStorage.getItem('hrms_switcher_mode') as SwitcherMode | null
    if (saved && ['compact', 'docked', 'expanded'].includes(saved)) {
      return saved
    }
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'compact' : 'expanded'
  })

  // Synchronize default when viewport resizes to mobile
  useEffect(() => {
    if (isWindowMobile && mode === 'expanded') {
      setMode('compact')
    }
  }, [isWindowMobile])

  // Escape key closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const updateMode = (newMode: SwitcherMode) => {
    setMode(newMode)
    localStorage.setItem('hrms_switcher_mode', newMode)
  }

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

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'HR Admin':
        return 'HR'
      case 'Branch HR':
        return 'B-HR'
      case 'Manager':
        return 'MGR'
      case 'Employee':
        return 'EMP'
      default:
        return 'DEMO'
    }
  }

  return (
    <>
      {/* Mobile Backdrop when Switcher Hub is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 sm:hidden animate-in fade-in duration-150"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Trigger Container
          On mobile (< 768px or isMobile): sits at bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))]
          which is ~76px, safely 12px+ ABOVE the 64px bottom navigation bar (never overlaps it).
          On desktop: sits at bottom-6 right-6.
      */}
      <div
        className={`fixed z-50 select-none transition-all duration-200 ${
          mode === 'docked'
            ? 'right-0 bottom-24 sm:bottom-10'
            : 'bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 right-3 sm:right-6'
        }`}
      >
        {/* MODE 1: DOCKED TO EDGE (Ultra-minimized tab) */}
        {mode === 'docked' && (
          <div className="flex items-center group">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              title="Open Demo Persona Switcher"
              aria-label="Open Demo Persona Switcher"
              className="flex items-center gap-1.5 py-2 pl-2.5 pr-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-l-2xl shadow-xl border-y border-l border-indigo-400/40 backdrop-blur-xs transition-all active:scale-95 group-hover:pr-3"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-tight bg-white/20 px-1 py-0.5 rounded-sm">
                {getRoleBadge(settings.role)}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </button>

            {/* Quick expand button on hover */}
            <button
              type="button"
              onClick={() => updateMode('compact')}
              title="Restore to Floating Button"
              aria-label="Restore Switcher Button"
              className="hidden group-hover:flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-slate-200 hover:text-white shadow-xs text-xs -ml-1 transition border border-slate-700"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* MODE 2: COMPACT FAB (Default on mobile - small, neat, zero menu overlap) */}
        {mode === 'compact' && (
          <div className="flex items-center gap-1.5 group">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              title="Open Demo Switcher"
              aria-label="Open Demo Persona Switcher"
              className="flex items-center gap-1.5 h-10 px-2.5 sm:px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border border-indigo-400/40 text-xs font-semibold active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span className="text-[10px] font-bold tracking-wider bg-white/20 px-1.5 py-0.5 rounded-md">
                {getRoleBadge(settings.role)}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </button>

            {/* Quick dock-to-edge button */}
            <button
              type="button"
              onClick={() => updateMode('docked')}
              title="Dock to Screen Edge"
              aria-label="Dock Switcher to Screen Edge"
              className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 shadow-xs transition active:scale-90"
            >
              <Minus className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* MODE 3: EXPANDED (Full pill text on desktop) */}
        {mode === 'expanded' && (
          <div className="flex items-center gap-1.5 group">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Open Demo Persona Switcher"
              className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 border border-indigo-400/40 text-xs font-semibold active:scale-95"
            >
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>Demo Switcher</span>
              <span className="text-[10px] font-bold tracking-wider bg-white/20 px-1.5 py-0.5 rounded-md">
                {getRoleBadge(settings.role)}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </button>

            {/* Quick minimize button */}
            <button
              type="button"
              onClick={() => updateMode('compact')}
              title="Minimize to Compact Button"
              aria-label="Minimize Switcher Button"
              className="w-7 h-7 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 shadow-xs transition active:scale-90"
            >
              <Minimize2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Floating Panel
            On mobile (< 768px): Centered mobile modal with max-w-md, rounded-3xl, fits perfectly within screen.
            On desktop: Right-aligned flyout menu.
        */}
        {isOpen && (
          <div className="fixed inset-x-2 bottom-2 sm:absolute sm:inset-auto sm:bottom-14 sm:right-0 w-auto sm:w-96 max-w-md mx-auto bg-card border border-border rounded-3xl shadow-2xl p-4 sm:p-5 text-sm z-50 animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">Access Engine Persona Hub</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted tap-target-48 flex items-center justify-center"
                  aria-label="Close Switcher Panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-3.5 space-y-3.5">
              {/* Switcher UI Appearance Mode Selector */}
              <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-primary" />
                    Switcher Button UI:
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateMode('compact')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition text-center ${
                      mode === 'compact'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Compact (FAB)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMode('docked')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition text-center ${
                      mode === 'docked'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Docked (Edge)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateMode('expanded')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition text-center ${
                      mode === 'expanded'
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'bg-card border border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Expanded (Full)
                  </button>
                </div>
              </div>

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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r)
                        clearCache()
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition text-center ${
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
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  2) Employee Type Profile
                </label>
                <select
                  value={settings.employeeType}
                  onChange={(e) => handleProfileChange(e.target.value as EmployeeType)}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary"
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
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  3) Company Industry Template
                </label>
                <select
                  value={settings.companyType}
                  onChange={(e) => handleCompanyChange(e.target.value as CompanyType)}
                  className="w-full px-3 py-2 text-xs bg-background border border-input rounded-xl text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  {COMPANY_TYPES.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct} Industry Template
                    </option>
                  ))}
                </select>
              </div>

              {/* Active User Summary */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex items-start gap-3">
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
                    <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-sm">
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
              <div className="pt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    window.dispatchEvent(new CustomEvent('start-demo-tour', { detail: { stepIndex: 0 } }))
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 rounded-xl transition border border-amber-200 dark:border-amber-900"
                >
                  <span>Guided Tour</span>
                </button>

                <Link
                  to="/dev/mobile-qa"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 rounded-xl transition border border-indigo-200 dark:border-indigo-900"
                >
                  <span>Mobile QA</span>
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/dev/access"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition"
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
                  className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl transition border border-rose-200 dark:border-rose-900"
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
    </>
  )
}
