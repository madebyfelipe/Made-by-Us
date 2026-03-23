import type { Role } from '@/app/generated/prisma/client'
import { canEditWorkspace, canSubmitCardForReview, canUpdateCardDriveLink } from '@/modules/auth/permissions'

const collaboratorEditableFields = new Set(['driveLink'])

export function canUpdateCardField(role: Role, field: string): boolean {
  if (canEditWorkspace(role)) return true
  return canUpdateCardDriveLink(role) && collaboratorEditableFields.has(field)
}

export function canUpdateCardPayload(
  role: Role,
  payload: Record<string, unknown>,
): boolean {
  if (canEditWorkspace(role)) return true

  const changedKeys = Object.keys(payload).filter((key) => payload[key] !== undefined)
  return changedKeys.length > 0 && changedKeys.every((key) => canUpdateCardField(role, key))
}

export function canUserSubmitCardForReview(role: Role): boolean {
  return canSubmitCardForReview(role)
}
