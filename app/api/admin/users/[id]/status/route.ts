import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import {
  ensureCanChangeAdminState,
  managedUserSelect,
} from '@/services/adminUserService'
import { updateManagedUserStatusSchema } from '@/utils/schemas'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdminSession()
  if (auth.response) return auth.response

  const { id } = await params

  if (auth.session.user.id === id) {
    return NextResponse.json(
      { error: 'VocÃª nÃ£o pode desativar sua prÃ³pria conta' },
      { status: 400 },
    )
  }

  const body = await request.json()
  const parsed = updateManagedUserStatusSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados invÃ¡lidos' },
      { status: 400 },
    )
  }

  try {
    await ensureCanChangeAdminState({
      targetUserId: id,
      nextIsActive: parsed.data.isActive,
    })

    const user = await prismaClient.user.update({
      where: { id },
      data: { isActive: parsed.data.isActive },
      select: managedUserSelect,
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof Error && error.message.includes('nÃ£o encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar status' },
      { status: 400 },
    )
  }
}
