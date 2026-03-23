'use client'

import { useSession } from 'next-auth/react'
import type { Role } from '@/app/generated/prisma/client'

type AuthenticatedUser = {
  id: string
  name: string | null
  email: string | null
  role: Role
  isActive: boolean
}

export function useAuthenticatedUser(): AuthenticatedUser | null {
  const { data: session, status } = useSession()

  if (status !== 'authenticated' || !session?.user) return null

  return {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    role: session.user.role,
    isActive: session.user.isActive,
  }
}
