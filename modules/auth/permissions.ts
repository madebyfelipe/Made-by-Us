import type { Role } from '@/app/generated/prisma/client'

export const ADMIN_ROLE: Role = 'OWNER'
export const COLLABORATOR_ROLE: Role = 'MEMBER'

export function isAdminRole(role?: Role | null): boolean {
  return role === ADMIN_ROLE
}

export function isCollaboratorRole(role?: Role | null): boolean {
  return role === COLLABORATOR_ROLE
}

export function canManageUsers(role?: Role | null): boolean {
  return isAdminRole(role)
}

export function canEditWorkspace(role?: Role | null): boolean {
  return isAdminRole(role)
}

export function canUpdateCardDriveLink(role?: Role | null): boolean {
  return isAdminRole(role) || isCollaboratorRole(role)
}

export function canSubmitCardForReview(role?: Role | null): boolean {
  return isAdminRole(role) || isCollaboratorRole(role)
}

export function getRoleLabel(role: Role): string {
  return isAdminRole(role) ? 'Admin' : 'Colaborador'
}
