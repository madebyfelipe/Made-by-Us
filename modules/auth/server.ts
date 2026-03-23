import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { authOptions } from '@/modules/auth/authOptions'
import { canEditWorkspace, canManageUsers } from '@/modules/auth/permissions'

type SessionGuardResult =
  | { session: Session; response?: never }
  | { session?: never; response: NextResponse }

export async function getAuthSession() {
  return getServerSession(authOptions)
}

export async function requireAuthenticatedSession(): Promise<SessionGuardResult> {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  if (!session.user.isActive) {
    return {
      response: NextResponse.json({ error: 'User is inactive' }, { status: 403 }),
    }
  }

  return { session }
}

export async function requireAdminSession(): Promise<SessionGuardResult> {
  const result = await requireAuthenticatedSession()

  if (result.response) return result

  if (!canManageUsers(result.session.user.role)) {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return result
}

export async function requireWorkspaceWriteSession(): Promise<SessionGuardResult> {
  const result = await requireAuthenticatedSession()

  if (result.response) return result

  if (!canEditWorkspace(result.session.user.role)) {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return result
}
