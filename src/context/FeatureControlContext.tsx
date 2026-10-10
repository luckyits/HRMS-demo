import { EMPLOYEE_TYPE_PROFILES } from '@/access/profiles'
import { clearAccessCache } from '@/access/resolver'
import type { EmployeeProfileDefinition, FeatureGrant } from '@/access/types'
import { MOCK_COMPANIES } from '@/mock/companies'
import { MOCK_EMPLOYEES, type MockEmployee } from '@/mock/employees'
import { AuditLogService } from '@/services/auditLogService'
import React, { createContext, useContext, useEffect, useState } from 'react'

const COMPANY_TOGGLES_KEY = 'hrms_feature_company_toggles'
const PROFILES_KEY = 'hrms_feature_profiles'
const EMPLOYEES_KEY = 'hrms_feature_employees'

interface FeatureControlContextType {
  // Company Toggles
  companyToggles: Record<string, Record<string, FeatureGrant>> // companyId -> { [featureCode]: FeatureGrant }
  updateCompanyToggle: (companyId: string, featureCode: string, grant: Partial<FeatureGrant>, reason: string) => void

  // Profiles
  profiles: Record<string, EmployeeProfileDefinition>
  updateProfileFeature: (profileKey: string, featureCode: string, state: 'ON' | 'OPTIONAL' | 'OFF', locked?: boolean, reason?: string) => void
  createCustomProfile: (profile: EmployeeProfileDefinition, reason: string) => void
  cloneProfile: (sourceKey: string, newKey: string, newName: string, reason: string) => void

  // Employees & Overrides
  employees: MockEmployee[]
  updateEmployeeOverride: (employeeId: string, featureCode: string, grant: FeatureGrant | null, reason: string) => void
  bulkUpdateEmployeeOverride: (employeeIds: string[], featureCode: string, grant: FeatureGrant | null, reason: string) => void

  // Reset
  resetFeatureControlData: () => void
}

const FeatureControlContext = createContext<FeatureControlContextType | undefined>(undefined)

export const FeatureControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Company Toggles state
  const [companyToggles, setCompanyToggles] = useState<Record<string, Record<string, FeatureGrant>>>(() => {
    try {
      const stored = localStorage.getItem(COMPANY_TOGGLES_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    const initial: Record<string, Record<string, FeatureGrant>> = {}
    MOCK_COMPANIES.forEach((c) => {
      initial[c.id] = { ...c.featureToggles }
    })
    return initial
  })

  // 2. Profiles state
  const [profiles, setProfiles] = useState<Record<string, EmployeeProfileDefinition>>(() => {
    try {
      const stored = localStorage.getItem(PROFILES_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return { ...EMPLOYEE_TYPE_PROFILES }
  })

  // 3. Employees with overrides
  const [employees, setEmployees] = useState<MockEmployee[]>(() => {
    try {
      const stored = localStorage.getItem(EMPLOYEES_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return [...MOCK_EMPLOYEES]
  })

  // Persistence
  useEffect(() => {
    localStorage.setItem(COMPANY_TOGGLES_KEY, JSON.stringify(companyToggles))
  }, [companyToggles])

  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees))
  }, [employees])

  // Company Toggle Update
  const updateCompanyToggle = (
    companyId: string,
    featureCode: string,
    grant: Partial<FeatureGrant>,
    reason: string
  ) => {
    const company = MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0]
    const beforeState = companyToggles[companyId]?.[featureCode]?.state || 'Inherit'
    const beforeLocked = companyToggles[companyId]?.[featureCode]?.locked || false

    const newGrant: FeatureGrant = {
      state: grant.state ?? beforeState,
      locked: grant.locked ?? beforeLocked,
      validFrom: grant.validFrom,
      validTo: grant.validTo,
      permissions: grant.permissions,
      scope: grant.scope,
    }

    setCompanyToggles((prev) => ({
      ...prev,
      [companyId]: {
        ...(prev[companyId] || {}),
        [featureCode]: newGrant,
      },
    }))

    // Clear resolver cache
    clearAccessCache()

    // Log to Audit Log
    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Company Feature Toggle Modified',
      targetType: 'Company',
      targetId: companyId,
      targetName: company.name,
      featureCode,
      beforeValue: `${beforeState} (Locked: ${beforeLocked})`,
      afterValue: `${newGrant.state} (Locked: ${Boolean(newGrant.locked)})`,
      reason: reason || 'Company-level organizational feature switch',
    })
  }

  // Profile Feature Update
  const updateProfileFeature = (
    profileKey: string,
    featureCode: string,
    state: 'ON' | 'OPTIONAL' | 'OFF',
    locked = false,
    reason = 'Profile permission matrix adjustment'
  ) => {
    const profile = profiles[profileKey]
    if (!profile) return

    const beforeState = profile.features[featureCode] || 'OFF'

    setProfiles((prev) => ({
      ...prev,
      [profileKey]: {
        ...prev[profileKey],
        features: {
          ...prev[profileKey].features,
          [featureCode]: state,
        },
      },
    }))

    // Invalidate access cache
    clearAccessCache()

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Profile Feature Rule Modified',
      targetType: 'Profile',
      targetId: profileKey,
      targetName: profile.name,
      featureCode,
      beforeValue: beforeState,
      afterValue: `${state} (Locked: ${locked})`,
      reason,
    })
  }

  // Create Custom Profile
  const createCustomProfile = (profile: EmployeeProfileDefinition, reason: string) => {
    setProfiles((prev) => ({
      ...prev,
      [profile.profileKey]: profile,
    }))
    clearAccessCache()

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Custom Profile Created',
      targetType: 'Profile',
      targetId: profile.profileKey,
      targetName: profile.name,
      featureCode: 'ALL',
      beforeValue: 'Non-existent',
      afterValue: 'Active Profile Definition',
      reason: reason || 'Created new organizational profile template',
    })
  }

  // Clone Profile
  const cloneProfile = (
    sourceKey: string,
    newKey: string,
    newName: string,
    reason: string
  ) => {
    const source = profiles[sourceKey]
    if (!source) return

    const cloned: EmployeeProfileDefinition = {
      profileKey: newKey,
      name: newName,
      features: { ...source.features },
      defaultPermissions: source.defaultPermissions ? { ...source.defaultPermissions } : undefined,
      defaultScope: source.defaultScope ? { ...source.defaultScope } : undefined,
    }

    createCustomProfile(cloned, reason || `Cloned from ${source.name}`)
  }

  // Update Individual Employee Override
  const updateEmployeeOverride = (
    employeeId: string,
    featureCode: string,
    grant: FeatureGrant | null,
    reason: string
  ) => {
    const emp = employees.find((e) => e.id === employeeId)
    if (!emp) return

    const beforeValue = emp.featureOverrides?.[featureCode]
      ? `${emp.featureOverrides[featureCode].state} (Locked: ${Boolean(emp.featureOverrides[featureCode].locked)})`
      : 'Inherit'

    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id !== employeeId) return e

        const overrides = { ...(e.featureOverrides || {}) }
        if (!grant || grant.state === 'Inherit') {
          delete overrides[featureCode]
        } else {
          overrides[featureCode] = grant
        }

        return {
          ...e,
          featureOverrides: overrides,
        }
      })
    )

    clearAccessCache()

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: grant ? 'Individual Employee Override Applied' : 'Employee Override Cleared (Inherited)',
      targetType: 'Employee',
      targetId: emp.id,
      targetName: emp.name,
      featureCode,
      beforeValue,
      afterValue: grant
        ? `${grant.state} (Locked: ${Boolean(grant.locked)}, ValidTo: ${grant.validTo || 'Permanent'})`
        : 'Inherit (Profile defaults)',
      reason: reason || 'Individual personnel access adjustment',
    })
  }

  // Bulk Employee Override
  const bulkUpdateEmployeeOverride = (
    employeeIds: string[],
    featureCode: string,
    grant: FeatureGrant | null,
    reason: string
  ) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (!employeeIds.includes(e.id)) return e

        const overrides = { ...(e.featureOverrides || {}) }
        if (!grant || grant.state === 'Inherit') {
          delete overrides[featureCode]
        } else {
          overrides[featureCode] = grant
        }

        return {
          ...e,
          featureOverrides: overrides,
        }
      })
    )

    clearAccessCache()

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Bulk Employee Override Applied',
      targetType: 'Bulk Employee',
      targetId: `${employeeIds.length} Members`,
      targetName: `${employeeIds.length} Employees Selected`,
      featureCode,
      beforeValue: 'Various',
      afterValue: grant ? `${grant.state} (Bulk)` : 'Inherit',
      reason: reason || `Bulk update applied across ${employeeIds.length} employees`,
    })
  }

  const resetFeatureControlData = () => {
    localStorage.removeItem(COMPANY_TOGGLES_KEY)
    localStorage.removeItem(PROFILES_KEY)
    localStorage.removeItem(EMPLOYEES_KEY)
    AuditLogService.clearLogs()

    const initialToggles: Record<string, Record<string, FeatureGrant>> = {}
    MOCK_COMPANIES.forEach((c) => {
      initialToggles[c.id] = { ...c.featureToggles }
    })

    setCompanyToggles(initialToggles)
    setProfiles({ ...EMPLOYEE_TYPE_PROFILES })
    setEmployees([...MOCK_EMPLOYEES])
    clearAccessCache()
  }

  return (
    <FeatureControlContext.Provider
      value={{
        companyToggles,
        updateCompanyToggle,
        profiles,
        updateProfileFeature,
        createCustomProfile,
        cloneProfile,
        employees,
        updateEmployeeOverride,
        bulkUpdateEmployeeOverride,
        resetFeatureControlData,
      }}
    >
      {children}
    </FeatureControlContext.Provider>
  )
}

export function useFeatureControl() {
  const context = useContext(FeatureControlContext)
  if (!context) {
    throw new Error('useFeatureControl must be used within a FeatureControlProvider')
  }
  return context
}
