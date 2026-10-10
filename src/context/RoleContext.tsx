import { INITIAL_USER_ROLE_ASSIGNMENTS, SYSTEM_ROLES } from '@/roles/defaults'
import type { RoleDefinition, RoleFeatureRule, UserRoleAssignment } from '@/roles/types'
import { AuditLogService } from '@/services/auditLogService'
import React, { createContext, useContext, useEffect, useState } from 'react'

const ROLES_STORAGE_KEY = 'hrms_system_roles_data'
const ASSIGNMENTS_STORAGE_KEY = 'hrms_user_role_assignments'

interface RoleContextType {
  roles: RoleDefinition[]
  assignments: UserRoleAssignment[]
  createRole: (role: Omit<RoleDefinition, 'id' | 'memberCount' | 'isSystem'>, reason: string) => RoleDefinition
  updateRolePermissions: (roleId: string, featureRules: Record<string, RoleFeatureRule>, reason: string) => void
  assignRoleToUser: (assignment: Omit<UserRoleAssignment, 'id'>, reason: string) => void
  removeRoleAssignment: (assignmentId: string, reason: string) => void
  getRoleById: (roleId: string) => RoleDefinition | undefined
  getAssignmentsForEmployee: (employeeId: string) => UserRoleAssignment[]
  resetRolesData: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    try {
      const stored = localStorage.getItem(ROLES_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return SYSTEM_ROLES
  })

  const [assignments, setAssignments] = useState<UserRoleAssignment[]>(() => {
    try {
      const stored = localStorage.getItem(ASSIGNMENTS_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return INITIAL_USER_ROLE_ASSIGNMENTS
  })

  useEffect(() => {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles))
  }, [roles])

  useEffect(() => {
    localStorage.setItem(ASSIGNMENTS_STORAGE_KEY, JSON.stringify(assignments))
  }, [assignments])

  const createRole = (
    roleData: Omit<RoleDefinition, 'id' | 'memberCount' | 'isSystem'>,
    reason: string
  ): RoleDefinition => {
    const newRole: RoleDefinition = {
      ...roleData,
      id: `ROLE-CUSTOM-${Date.now().toString().slice(-4)}`,
      isSystem: false,
      memberCount: 0,
    }

    setRoles((prev) => [...prev, newRole])

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Custom Role Created',
      targetType: 'Profile',
      targetId: newRole.id,
      targetName: newRole.name,
      featureCode: 'ALL',
      beforeValue: 'Non-existent',
      afterValue: `Role ${newRole.name} (${newRole.code})`,
      reason: reason || 'Created new specialized administrative role',
    })

    return newRole
  }

  const updateRolePermissions = (
    roleId: string,
    featureRules: Record<string, RoleFeatureRule>,
    reason: string
  ) => {
    const role = roles.find((r) => r.id === roleId)
    if (!role) return

    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, featureRules } : r))
    )

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Role Permission Matrix Updated',
      targetType: 'Profile',
      targetId: role.id,
      targetName: role.name,
      featureCode: 'MATRIX',
      beforeValue: `${Object.keys(role.featureRules).length} Features Configured`,
      afterValue: `${Object.keys(featureRules).length} Features Configured`,
      reason: reason || 'Updated role actions and scope matrix',
    })
  }

  const assignRoleToUser = (
    assignmentData: Omit<UserRoleAssignment, 'id'>,
    reason: string
  ) => {
    const newAssignment: UserRoleAssignment = {
      ...assignmentData,
      id: `URA-${Date.now().toString().slice(-4)}`,
    }

    setAssignments((prev) => {
      // If primary role, set other assignments for this user to secondary
      const list = assignmentData.isPrimary
        ? prev.map((a) =>
            a.employeeId === assignmentData.employeeId ? { ...a, isPrimary: false } : a
          )
        : prev
      return [...list, newAssignment]
    })

    // Update member count
    setRoles((prev) =>
      prev.map((r) =>
        r.id === assignmentData.roleId
          ? { ...r, memberCount: r.memberCount + 1 }
          : r
      )
    )

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Role Assigned to Personnel',
      targetType: 'Employee',
      targetId: assignmentData.employeeId,
      targetName: assignmentData.employeeName,
      featureCode: 'ROLE_ASSIGNMENT',
      beforeValue: 'Previous Role Set',
      afterValue: `Assigned Role: ${assignmentData.roleName} (Primary: ${assignmentData.isPrimary})`,
      reason: reason || 'User role assignment change',
    })
  }

  const removeRoleAssignment = (assignmentId: string, reason: string) => {
    const target = assignments.find((a) => a.id === assignmentId)
    if (!target) return

    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId))

    setRoles((prev) =>
      prev.map((r) =>
        r.id === target.roleId
          ? { ...r, memberCount: Math.max(0, r.memberCount - 1) }
          : r
      )
    )

    AuditLogService.addLog({
      actorName: 'Sarah Jenkins',
      actorRole: 'HR Admin',
      action: 'Role Assignment Revoked',
      targetType: 'Employee',
      targetId: target.employeeId,
      targetName: target.employeeName,
      featureCode: 'ROLE_REVOKE',
      beforeValue: target.roleName,
      afterValue: 'Revoked',
      reason: reason || 'Role membership removed',
    })
  }

  const getRoleById = (roleId: string) => {
    return roles.find((r) => r.id === roleId)
  }

  const getAssignmentsForEmployee = (employeeId: string) => {
    return assignments.filter((a) => a.employeeId === employeeId)
  }

  const resetRolesData = () => {
    localStorage.removeItem(ROLES_STORAGE_KEY)
    localStorage.removeItem(ASSIGNMENTS_STORAGE_KEY)
    setRoles(SYSTEM_ROLES)
    setAssignments(INITIAL_USER_ROLE_ASSIGNMENTS)
  }

  return (
    <RoleContext.Provider
      value={{
        roles,
        assignments,
        createRole,
        updateRolePermissions,
        assignRoleToUser,
        removeRoleAssignment,
        getRoleById,
        getAssignmentsForEmployee,
        resetRolesData,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRoles() {
  const context = useContext(RoleContext)
  if (!context) {
    throw new Error('useRoles must be used within a RoleProvider')
  }
  return context
}
