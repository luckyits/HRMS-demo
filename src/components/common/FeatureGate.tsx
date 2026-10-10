import type { ActionPermission } from '@/access/types'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import type { CompanyType, Role } from '@/types'
import React from 'react'

interface FeatureGateProps {
  children: React.ReactNode
  feature?: string // E.g. 'VISIT', 'PAYROLL', 'EXPENSE'
  permission?: ActionPermission // E.g. 'view', 'create', 'approve'
  allowedRoles?: Role[]
  allowedCompanyTypes?: CompanyType[]
  fallback?: React.ReactNode
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  children,
  feature,
  permission,
  allowedRoles,
  allowedCompanyTypes,
  fallback = null,
}) => {
  const { settings } = useDemo()
  const { hasFeature, can } = useAccess()

  // 1. Role match check
  if (allowedRoles && !allowedRoles.includes(settings.role)) {
    return <>{fallback}</>
  }

  // 2. Company template check
  if (allowedCompanyTypes && !allowedCompanyTypes.includes(settings.companyType)) {
    return <>{fallback}</>
  }

  // 3. Feature entitlement check
  if (feature) {
    if (!hasFeature(feature)) {
      return <>{fallback}</>
    }

    // 4. Action permission check
    if (permission && !can(permission, feature)) {
      return <>{fallback}</>
    }
  }

  return <>{children}</>
}
