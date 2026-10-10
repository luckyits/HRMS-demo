import type { ActionPermission } from '@/access/types'
import { useAccess } from '@/access/useAccess'
import { useDemo } from '@/context/DemoContext'
import { useRoles } from '@/context/RoleContext'
import React from 'react'

interface CanProps {
  action: ActionPermission // view, create, edit, delete-cancel, approve, export, configure, view-sensitive, act-on-behalf
  feature: string          // E.g. LEAVE, PAYROLL, PUNCH, EXPENSE
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * <Can action="approve" feature="LEAVE">
 * Checks if the active user role is authorized to perform the action on the given feature.
 */
export const Can: React.FC<CanProps> = ({
  action,
  feature,
  fallback = null,
  children,
}) => {
  const { settings } = useDemo()
  const { can, hasFeature } = useAccess()
  const { roles } = useRoles()

  // 1. Basic feature entitlement check
  if (!hasFeature(feature)) {
    return <>{fallback}</>
  }

  // 2. HR Admin has full administrative override
  if (settings.role === 'HR Admin') {
    return <>{children}</>
  }

  // 3. Map active role to RoleDefinition permissions
  const matchingRole = roles.find(
    (r) =>
      r.name.toLowerCase() === settings.role.toLowerCase() ||
      (settings.role === 'Manager' && r.code === 'MANAGER') ||
      (settings.role === 'Employee' && r.code === 'EMPLOYEE')
  )

  if (matchingRole && matchingRole.featureRules[feature]) {
    const isPermitted = matchingRole.featureRules[feature].permissions.includes(action)
    if (isPermitted) {
      return <>{children}</>
    }
  }

  // 4. Fallback to access engine action resolution
  if (can(action, feature)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}
