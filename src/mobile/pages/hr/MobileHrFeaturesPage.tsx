import React, { useState, useMemo } from 'react'
import {
  Sliders,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Calendar,
  AlertCircle,
  FileCheck,
  ArrowRight,
  Building,
  User,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MobileHeader } from '@/mobile/components/MobileHeader'
import { BottomSheet } from '@/mobile/components/BottomSheet'
import { useEmployees } from '@/context/EmployeeContext'
import { useFeatureControl } from '@/context/FeatureControlContext'
import { useDemo } from '@/context/DemoContext'
import { useToast } from '@/context/ToastContext'
import { AuditLogService } from '@/services/auditLogService'
import { resolveAccess } from '@/access/resolver'
import { FEATURE_MASTER } from '@/access/features'
import type { AccessResolutionResult } from '@/access/types'

export const MobileHrFeaturesPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlEmpId = searchParams.get('empId')

  const { employees } = useEmployees()
  const { updateEmployeeOverride } = useFeatureControl()
  const { settings } = useDemo()
  const { showToast } = useToast()

  const isBranchHr = settings.role === 'Branch HR'
  const activeBranch = settings.currentUser.branch || 'Mumbai Branch'

  // Filter scoped employees
  const scopedEmployees = useMemo(() => {
    return employees.filter((e) => {
      if (isBranchHr) {
        return e.branch?.toLowerCase() === activeBranch.toLowerCase()
      }
      return true
    })
  }, [employees, isBranchHr, activeBranch])

  // Active employee state
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    if (urlEmpId && scopedEmployees.some((e) => e.id === urlEmpId)) {
      return urlEmpId
    }
    return scopedEmployees[0]?.id || 'EMP-001'
  })

  const [featureSearch, setFeatureSearch] = useState('')
  const [selectedFeatureCode, setSelectedFeatureCode] = useState<string | null>(null)
  const [isGrantSheetOpen, setIsGrantSheetOpen] = useState(false)
  const [grantDays, setGrantDays] = useState<number>(7)
  const [grantReason, setGrantReason] = useState('Client site temporary deployment')

  const selectedEmployee = useMemo(() => {
    return scopedEmployees.find((e) => e.id === selectedEmpId) || scopedEmployees[0]
  }, [scopedEmployees, selectedEmpId])

  // Resolve all features for active employee
  const employeeFeatureList = useMemo(() => {
    if (!selectedEmployee) return []
    return FEATURE_MASTER.map((feat) => {
      const resolution = resolveAccess(
        selectedEmployee,
        feat.code,
        settings.companyType
      )
      return {
        ...feat,
        resolution,
      }
    })
  }, [selectedEmployee, settings.companyType])

  // Filtered by search
  const filteredFeatures = useMemo(() => {
    return employeeFeatureList.filter((f) => {
      const q = featureSearch.toLowerCase()
      return (
        f.code.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.module.toLowerCase().includes(q)
      )
    })
  }, [employeeFeatureList, featureSearch])

  // Active trace details for clicked feature
  const activeFeatureDetail = useMemo(() => {
    if (!selectedFeatureCode) return null
    return employeeFeatureList.find((f) => f.code === selectedFeatureCode) || null
  }, [selectedFeatureCode, employeeFeatureList])

  // Handle Temporary Grant Submit
  const handleApplyTemporaryGrant = () => {
    if (!selectedFeatureCode || !selectedEmployee) return

    const now = new Date()
    const validToDate = new Date(now.getTime() + grantDays * 86400000)
    const validToIso = validToDate.toISOString().split('T')[0]

    updateEmployeeOverride(
      selectedEmployee.id,
      selectedFeatureCode,
      {
        state: 'Allow',
        validTo: validToIso,
        permissions: ['view', 'create'],
        scope: 'Branch',
      },
      grantReason
    )

    AuditLogService.addLog({
      actorName: settings.currentUser.name,
      actorRole: settings.role,
      action: 'Temporary Feature Grant Authorized',
      module: 'Permissions',
      targetType: 'Employee',
      targetId: selectedEmployee.id,
      targetName: `${selectedEmployee.name} (${selectedFeatureCode})`,
      featureCode: selectedFeatureCode,
      beforeValue: 'Default Policy',
      afterValue: `Allow (Valid until ${validToIso})`,
      reason: grantReason || `Temporary ${grantDays}-day grant authorized by HR`,
    })

    showToast({
      type: 'success',
      title: 'Temporary Access Granted',
      message: `${selectedFeatureCode} granted to ${selectedEmployee.name} for ${grantDays} days (until ${validToIso}).`,
    })

    setIsGrantSheetOpen(false)
  }

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      <MobileHeader
        title="Feature Access Quick View"
        subtitle="Entitlement Explainer & Temporary Grants"
        showBack={true}
        onBack={() => navigate('/hr/dashboard')}
      />

      <div className="p-4 space-y-4 flex-1 flex flex-col">
        {/* Employee Picker Card */}
        <div className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Target Employee</span>
            <span className="text-primary">{selectedEmployee?.branch}</span>
          </label>

          <select
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-muted/40 border border-border text-xs font-bold text-foreground focus:outline-hidden focus:border-primary"
          >
            {scopedEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.id}) — {emp.designation} [{emp.profileType || 'Staff'}]
              </option>
            ))}
          </select>

          {selectedEmployee && (
            <div className="flex items-center gap-2.5 pt-1 text-xs">
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">
                  {selectedEmployee.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  Profile: {selectedEmployee.profileType || 'Standard'} • {selectedEmployee.department}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Feature Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={featureSearch}
            onChange={(e) => setFeatureSearch(e.target.value)}
            placeholder="Search features (e.g. PUNCH, EXPENSE, VISIT)..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
          />
        </div>

        {/* Features Matrix List */}
        <div className="space-y-2 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
            Effective Capabilities ({filteredFeatures.length})
          </span>

          <div className="space-y-2">
            {filteredFeatures.map((item) => {
              const isAllowed = item.resolution.allowed

              return (
                <div
                  key={item.code}
                  onClick={() => setSelectedFeatureCode(item.code)}
                  className="p-3.5 rounded-2xl bg-card border border-border shadow-2xs flex items-center justify-between cursor-pointer active:scale-[0.99] transition hover:border-primary/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-foreground truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground font-semibold">
                        {item.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span>Module: {item.module}</span>
                      <span>•</span>
                      <span>Scope: {item.resolution.scope}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        isAllowed
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isAllowed ? 'Allowed' : 'Denied'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* WHY DOES X HAVE THIS? VERTICAL TIMELINE TRACE BOTTOM SHEET */}
      <BottomSheet
        isOpen={Boolean(activeFeatureDetail)}
        onClose={() => setSelectedFeatureCode(null)}
        title="Entitlement Trace Explainer"
      >
        {activeFeatureDetail && (
          <div className="space-y-4 pb-4">
            {/* Header Feature Badge */}
            <div className="p-3.5 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  {activeFeatureDetail.name} ({activeFeatureDetail.code})
                </h4>
                <p className="text-xs text-muted-foreground">
                  Evaluation for {selectedEmployee?.name}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  activeFeatureDetail.resolution.allowed
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                }`}
              >
                {activeFeatureDetail.resolution.allowed ? 'Allowed' : 'Denied'}
              </span>
            </div>

            {/* "Why does X have this?" Vertical Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Why does {selectedEmployee?.name?.split(' ')[0]} have this?
              </span>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-4">
                {activeFeatureDetail.resolution.trace.map((step, idx) => {
                  const isDecisive = step.status === 'decisive'
                  const isOverridden = step.status === 'overridden'

                  return (
                    <div key={idx} className="relative flex items-start gap-3">
                      {/* Timeline dot and line */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDecisive
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'bg-muted border border-border text-muted-foreground'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        {idx < activeFeatureDetail.resolution.trace.length - 1 && (
                          <div className="w-0.5 h-10 bg-border my-1" />
                        )}
                      </div>

                      {/* Content block */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">
                            {step.level} Level
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              step.state === 'Allow'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-rose-500/10 text-rose-600'
                            }`}
                          >
                            {step.state}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {step.reason || 'Inherited base organizational profile'}
                        </p>
                        {isDecisive && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/10 text-primary">
                            ★ Decisive Layer
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Temporary Grant Action Button */}
            <button
              type="button"
              onClick={() => setIsGrantSheetOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Clock className="w-4 h-4" />
              <span>Allow for N Days (Temporary Grant)</span>
            </button>
          </div>
        )}
      </BottomSheet>

      {/* QUICK TEMPORARY GRANT BOTTOM SHEET */}
      <BottomSheet
        isOpen={isGrantSheetOpen}
        onClose={() => setIsGrantSheetOpen(false)}
        title="Authorise Temporary Grant"
      >
        <div className="space-y-4 pb-4">
          <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-1">
            <p className="font-bold">
              Granting <strong>{selectedFeatureCode}</strong> to <strong>{selectedEmployee?.name}</strong>.
            </p>
            <p className="text-[11px] text-muted-foreground">
              This creates a time-bounded override in the access resolver and automatically logs to the enterprise audit trail.
            </p>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Select Grant Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setGrantDays(days)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    grantDays === days
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-card border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {days} {days === 1 ? 'Day' : 'Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              Business Justification / Reason *
            </label>
            <textarea
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              placeholder="e.g. Special client on-site deployment authorization..."
              rows={2}
              className="w-full p-3 rounded-xl bg-card border border-border text-xs text-foreground focus:outline-hidden focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsGrantSheetOpen(false)}
              className="py-3 px-4 rounded-xl border border-border text-foreground font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyTemporaryGrant}
              className="py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition"
            >
              Grant Access
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
