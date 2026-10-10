import type { ActionPermission, DataScope } from '@/access/types'

export interface RoleFeatureRule {
  permissions: ActionPermission[]
  scope: DataScope
  customScopeRule?: string
}

export interface RoleDefinition {
  id: string
  name: string
  code: string
  description: string
  isSystem: boolean
  memberCount: number
  featureRules: Record<string, RoleFeatureRule>
}

export interface UserRoleAssignment {
  id: string
  employeeId: string
  employeeName: string
  employeeEmail: string
  department: string
  branch: string
  roleId: string
  roleName: string
  isPrimary: boolean
  validFrom?: string
  validTo?: string
  customScopeOverride?: string
}
