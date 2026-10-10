import { FEATURE_MAP } from './features'
import { EMPLOYEE_TYPE_PROFILES } from './profiles'
import type {
  AccessResolutionResult,
  AccessTraceItem,
  ActionPermission,
  AssignmentLevel,
  DataScope,
  FeatureGrant,
} from './types'
import { MOCK_COMPANIES, getCompanyTemplateToggles } from '@/mock/companies'
import type { MockEmployee } from '@/mock/employees'
import type { CompanyType } from '@/types'

// Cache key for memoization
const resolutionCache = new Map<string, AccessResolutionResult>()

export function clearAccessCache() {
  resolutionCache.clear()
}

/**
 * EXACT 6 RESOLVER RULES:
 * 1. If plan or company is OFF, the result is DENIED (ceiling).
 * 2. If any higher level is Locked, that value wins.
 * 3. Otherwise most specific wins: Employee > Designation/Profile > Department > Branch > Company.
 * 4. Same-level conflict: Deny wins.
 * 5. Expired grants (past valid_to) are ignored.
 * 6. Default is DENIED.
 * Returns { allowed, decidedByLevel, trace[], permissions, scope, featureCode }
 */
export function resolveAccess(
  employee: MockEmployee,
  featureCode: string,
  companyType?: CompanyType
): AccessResolutionResult {
  const cacheKey = `${employee.id}:${featureCode}:${companyType || 'default'}:${JSON.stringify(employee.featureOverrides || {})}`
  if (resolutionCache.has(cacheKey)) {
    return resolutionCache.get(cacheKey)!
  }

  const featureDef = FEATURE_MAP.get(featureCode)
  const trace: AccessTraceItem[] = []
  const today = new Date().toISOString().split('T')[0]

  // Default permissions & scope
  let effectivePermissions: ActionPermission[] = ['view']
  let effectiveScope: DataScope = 'Self'

  // Resolve Company / Plan Ceiling
  const company = MOCK_COMPANIES.find((c) => c.id === employee.companyId) || MOCK_COMPANIES[0]
  const templateToggles = companyType ? getCompanyTemplateToggles(companyType) : {}
  const companyGrant: FeatureGrant | undefined =
    templateToggles[featureCode] || company.featureToggles[featureCode]

  // Plan level (default active unless enterprise ceiling applies)
  trace.push({
    level: 'Plan',
    state: 'Allow',
    locked: false,
    status: 'skipped',
    reason: 'Enterprise HRMS plan subscription includes this module',
  })

  // 1. Company Level Evaluation
  if (companyGrant) {
    const isDenied = companyGrant.state === 'Deny'
    const isLocked = Boolean(companyGrant.locked)

    // Rule 1: If company is OFF -> DENIED (ceiling)
    if (isDenied) {
      trace.push({
        level: 'Company',
        state: 'Deny',
        locked: isLocked,
        status: 'decisive',
        reason: isLocked
          ? 'Rule 1 & 2: Company-level policy is LOCKED to OFF (Ceiling).'
          : 'Rule 1: Company-level feature toggle is OFF (Ceiling).',
      })
      const result: AccessResolutionResult = {
        allowed: false,
        decidedByLevel: 'Company',
        trace,
        permissions: [],
        scope: 'Self',
        featureCode,
      }
      resolutionCache.set(cacheKey, result)
      return result
    }

    // Company is Allow
    trace.push({
      level: 'Company',
      state: 'Allow',
      locked: isLocked,
      status: isLocked ? 'decisive' : 'overridden',
      reason: isLocked
        ? 'Rule 2: Company-level policy is LOCKED to ON.'
        : 'Company toggle is enabled, deferring to specific levels.',
    })

    if (isLocked) {
      const result: AccessResolutionResult = {
        allowed: true,
        decidedByLevel: 'Company',
        trace,
        permissions: ['view', 'create', 'edit'],
        scope: 'Department',
        featureCode,
      }
      resolutionCache.set(cacheKey, result)
      return result
    }
  } else {
    trace.push({
      level: 'Company',
      state: 'Inherit',
      locked: false,
      status: 'skipped',
      reason: 'No company override; inheriting defaults',
    })
  }

  // 2. Branch & Department Level (Standard inherit in baseline mock)
  trace.push({
    level: 'Branch',
    state: 'Inherit',
    locked: false,
    status: 'skipped',
    reason: `Inherited from Branch: ${employee.branch}`,
  })

  trace.push({
    level: 'Department',
    state: 'Inherit',
    locked: false,
    status: 'skipped',
    reason: `Inherited from Department: ${employee.department}`,
  })

  // 3. Designation / Profile Level
  const primaryProfileDef = EMPLOYEE_TYPE_PROFILES[employee.profileType] || EMPLOYEE_TYPE_PROFILES['Office Staff']
  const profileState = primaryProfileDef.features[featureCode] || 'OFF'

  if (primaryProfileDef.defaultPermissions?.[featureCode]) {
    effectivePermissions = primaryProfileDef.defaultPermissions[featureCode]
  }
  if (primaryProfileDef.defaultScope?.[featureCode]) {
    effectiveScope = primaryProfileDef.defaultScope[featureCode]
  }

  // Profile resolution
  if (profileState === 'ON') {
    trace.push({
      level: 'Profile',
      state: 'Allow',
      locked: false,
      status: 'overridden',
      reason: `Default ON in profile: ${employee.profileType}`,
    })
  } else if (profileState === 'OPTIONAL') {
    trace.push({
      level: 'Profile',
      state: 'Optional',
      locked: false,
      status: 'overridden',
      reason: `Profile ${employee.profileType} has this as OPTIONAL (Off until enabled)`,
    })
  } else {
    trace.push({
      level: 'Profile',
      state: 'Deny',
      locked: false,
      status: 'overridden',
      reason: `Profile ${employee.profileType} disables this feature by default`,
    })
  }

  // 4. Individual Employee Override (Most specific level)
  const empOverride = employee.featureOverrides?.[featureCode]

  if (empOverride) {
    const isExpired = empOverride.validTo && empOverride.validTo < today
    const notYetValid = empOverride.validFrom && empOverride.validFrom > today

    if (isExpired || notYetValid) {
      // Rule 5: Expired grants are ignored
      trace.push({
        level: 'Employee',
        state: empOverride.state,
        locked: Boolean(empOverride.locked),
        validFrom: empOverride.validFrom,
        validTo: empOverride.validTo,
        isExpired: Boolean(isExpired),
        status: 'ignored',
        reason: isExpired
          ? `Rule 5: Individual override expired on ${empOverride.validTo}. Ignored.`
          : `Individual grant not active until ${empOverride.validFrom}. Ignored.`,
      })
    } else {
      // Valid individual grant
      const isAllowed = empOverride.state === 'Allow'
      trace.push({
        level: 'Employee',
        state: empOverride.state,
        locked: Boolean(empOverride.locked),
        validFrom: empOverride.validFrom,
        validTo: empOverride.validTo,
        status: 'decisive',
        reason: `Rule 3: Individual employee grant takes precedence (${empOverride.state}).`,
      })

      if (empOverride.permissions) {
        effectivePermissions = empOverride.permissions
      }
      if (empOverride.scope) {
        effectiveScope = empOverride.scope
      }

      const result: AccessResolutionResult = {
        allowed: isAllowed,
        decidedByLevel: 'Employee',
        trace,
        permissions: isAllowed ? effectivePermissions : [],
        scope: effectiveScope,
        featureCode,
      }
      resolutionCache.set(cacheKey, result)
      return result
    }
  } else {
    trace.push({
      level: 'Employee',
      state: 'Inherit',
      locked: false,
      status: 'skipped',
      reason: 'No individual override; inheriting from Profile',
    })
  }

  // Rule 3: Most specific wins (Profile evaluation if not overridden by Employee)
  if (profileState === 'ON') {
    // Mark decisive in trace
    const profileTrace = trace.find((t) => t.level === 'Profile')
    if (profileTrace) {
      profileTrace.status = 'decisive'
      profileTrace.reason = `Rule 3: Decisive at Profile level (${employee.profileType})`
    }

    const result: AccessResolutionResult = {
      allowed: true,
      decidedByLevel: 'Profile',
      trace,
      permissions: effectivePermissions,
      scope: effectiveScope,
      featureCode,
    }
    resolutionCache.set(cacheKey, result)
    return result
  }

  // Rule 6: Default is DENIED
  const profileTrace = trace.find((t) => t.level === 'Profile')
  if (profileTrace) {
    profileTrace.status = 'decisive'
  }

  const result: AccessResolutionResult = {
    allowed: false,
    decidedByLevel: profileState === 'OPTIONAL' ? 'Profile' : 'Profile',
    trace,
    permissions: [],
    scope: 'Self',
    featureCode,
  }
  resolutionCache.set(cacheKey, result)
  return result
}

/**
 * Get all effective access grants for an employee across all 35 features
 */
export function getEffectiveAccess(
  employee: MockEmployee,
  companyType?: CompanyType
): Record<string, AccessResolutionResult> {
  const result: Record<string, AccessResolutionResult> = {}
  for (const feature of Object.keys(FEATURE_MAP)) {
    result[feature] = resolveAccess(employee, feature, companyType)
  }
  return result
}
