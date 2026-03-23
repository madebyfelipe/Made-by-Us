import type { Prisma, Role } from '@/app/generated/prisma/client'
import { prismaClient } from '@/services/prismaClient'

export const managedUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect

export type ManagedUser = Prisma.UserGetPayload<{
  select: typeof managedUserSelect
}>

export async function ensureManagedUserExists(userId: string) {
  return prismaClient.user.findUnique({
    where: { id: userId },
    select: managedUserSelect,
  })
}

export async function ensureCanChangeAdminState(input: {
  targetUserId: string
  nextRole?: Role
  nextIsActive?: boolean
  deleting?: boolean
}) {
  const user = await ensureManagedUserExists(input.targetUserId)

  if (!user) {
    throw new Error('UsuÃ¡rio nÃ£o encontrado')
  }

  const willStopBeingActiveAdmin =
    user.role === 'OWNER' &&
    user.isActive &&
    (input.deleting || input.nextRole === 'MEMBER' || input.nextIsActive === false)

  if (!willStopBeingActiveAdmin) {
    return user
  }

  const activeAdminCount = await prismaClient.user.count({
    where: { role: 'OWNER', isActive: true },
  })

  if (activeAdminCount <= 1) {
    throw new Error('NÃ£o Ã© possÃ­vel remover o Ãºltimo admin ativo')
  }

  return user
}
