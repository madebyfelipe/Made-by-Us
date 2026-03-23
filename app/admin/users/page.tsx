import { redirect } from 'next/navigation'
import { canManageUsers } from '@/modules/auth/permissions'
import { getAuthSession } from '@/modules/auth/server'
import UserManagement from '@/modules/users/UserManagement'
import { managedUserSelect } from '@/services/adminUserService'
import { prismaClient } from '@/services/prismaClient'

export default async function AdminUsersPage() {
  const session = await getAuthSession()

  if (!session?.user?.id) {
    redirect('/login')
  }

  if (!canManageUsers(session.user.role)) {
    redirect('/')
  }

  const users = await prismaClient.user.findMany({
    select: managedUserSelect,
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  return <UserManagement initialUsers={users} currentUserId={session.user.id} />
}
