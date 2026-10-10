import { FEATURE_MAP, FEATURE_MASTER } from '@/access/features'
import { clearAccessCache, getEffectiveAccess, resolveAccess } from '@/access/resolver'
import type {
  AccessResolutionResult,
  ActionPermission,
  DataScope,
} from '@/access/types'
import { useDemo } from '@/context/DemoContext'
import { useFeatureControl } from '@/context/FeatureControlContext'
import type { MockEmployee } from '@/mock/employees'
import { useMemo } from 'react'

export function useAccess() {
  const { settings } = useDemo()
  const { employees, companyToggles, profiles } = useFeatureControl()

  // Match active demo employee from reactive FeatureControl employees list
  const currentEmployee: MockEmployee = useMemo(() => {
    // 1. Try finding by active role & employee type
    const match = employees.find(
      (e) => e.profileType === settings.employeeType
    )
    if (match) return match

    // 2. Fallback
    if (settings.role === 'Manager') {
      return employees.find((e) => e.profileType === 'Manager') || employees[1]
    }
    if (settings.role === 'HR Admin') {
      return employees[0] // Sarah Jenkins
    }

    return employees[2] // Aarav Patel
  }, [employees, settings.role, settings.employeeType])

  // Memoized effective map using current reactive settings
  const effectiveAccess = useMemo(() => {
    return getEffectiveAccess(currentEmployee, settings.companyType)
  }, [currentEmployee, settings.companyType, companyToggles, profiles, employees])

  const hasFeature = (code: string): boolean => {
    const res = effectiveAccess[code]
    return Boolean(res?.allowed)
  }

  const can = (permission: ActionPermission, code: string): boolean => {
    const res = effectiveAccess[code]
    if (!res || !res.allowed) return false
    return res.permissions.includes(permission)
  }

  const getScope = (code: string): DataScope => {
    return effectiveAccess[code]?.scope || 'Self'
  }

  const getTrace = (code: string): AccessResolutionResult | undefined => {
    return effectiveAccess[code]
  }

  return {
    currentEmployee,
    effectiveAccess,
    hasFeature,
    can,
    getScope,
    getTrace,
    allFeatures: FEATURE_MASTER,
    clearCache: clearAccessCache,
  }
}
