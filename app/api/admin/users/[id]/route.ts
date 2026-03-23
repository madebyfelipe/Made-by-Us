import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import {
  ensureCanChangeAdminState,
  managedUserSelect,
} from '@/services/adminUserService'
import { updateManagedUserSchema } from '@/utils/schemas'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireAdminSession()
  if (auth.response) return auth.response

  const { id } = await params
  const body = await request.json()
  const parsed = updateManagedUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados invÃ¡lidos' },
      { status: 400 },
    )
  }

  const existingByEmail = await prismaClient.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  })

  if (existingByEmail && existingByEmail.id !== id) {
    return NextResponse.json({ error: 'E-mail jÃ¡ estÃ¡ em uso' }, { status: 409 })
  }

  try {
    await ensureCanChangeAdminState({
      targetUserId: id,
      nextRole: parsed.data.role,
    })

    const user = await prismaClient.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
      },
      select: managedUserSelect,
    })

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof Error && error.message.includes('nÃ£o encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao atualizar usuÃ¡rio' },
      { status: 400 },
    )
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireAdminSession()
  if (auth.response) return auth.response

  const { id } = await params

  if (auth.session.user.id === id) {
    return NextResponse.json(
      { error: 'VocÃª nÃ£o pode excluir sua prÃ³pria conta' },
      { status: 400 },
    )
  }

  try {
    await ensureCanChangeAdminState({ targetUserId: id, deleting: true })

    await prismaClient.user.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('nÃ£o encontrado')) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao excluir usuÃ¡rio' },
      { status: 400 },
    )
  }
}
