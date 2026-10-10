export type ActionPermission = 
  | 'view' 
  | 'create' 
  | 'edit' 
  | 'delete-cancel' 
  | 'approve' 
  | 'export' 
  | 'configure' 
  | 'view-sensitive' 
  | 'act-on-behalf'

export type DataScope = 
  | 'Self' 
  | 'Direct reports' 
  | 'Team' 
  | 'Department' 
  | 'Branch' 
  | 'Entity' 
  | 'All'

export type AssignmentLevel = 
  | 'Plan' 
  | 'Company' 
  | 'Branch' 
  | 'Department' 
  | 'Designation' 
  | 'Profile' 
  | 'Employee'

export type AssignmentState = 'Inherit' | 'Allow' | 'Deny' | 'Optional'

export interface FeatureDefinition {
  code: string
  name: string
  module: string
  icon: string
  depends_on?: string[]
  is_core?: boolean
  description?: string
}

export interface FeatureGrant {
  state: AssignmentState
  locked?: boolean
  validFrom?: string // ISO date
  validTo?: string   // ISO date
  permissions?: ActionPermission[]
  scope?: DataScope
}

export interface AccessTraceItem {
  level: AssignmentLevel
  state: AssignmentState
  locked: boolean
  validFrom?: string
  validTo?: string
  isExpired?: boolean
  status: 'skipped' | 'overridden' | 'decisive' | 'ignored'
  reason: string
}

export interface AccessResolutionResult {
  allowed: boolean
  decidedByLevel: AssignmentLevel | 'Default'
  trace: AccessTraceItem[]
  permissions: ActionPermission[]
  scope: DataScope
  featureCode: string
}

export interface EmployeeProfileDefinition {
  profileKey: string
  name: string
  features: Record<string, 'ON' | 'OPTIONAL' | 'OFF'>
  defaultPermissions?: Record<string, ActionPermission[]>
  defaultScope?: Record<string, DataScope>
}
