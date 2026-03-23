import { NextResponse } from 'next/server'
import { requireAuthenticatedSession } from '@/modules/auth/server'
import { createActivityLog } from '@/services/activityLogService'
import { canUserSubmitCardForReview } from '@/services/cardPermissionService'
import { prismaClient } from '@/services/prismaClient'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(_request: Request, { params }: RouteParams) {
  const auth = await requireAuthenticatedSession()
  if (auth.response) return auth.response

  if (!canUserSubmitCardForReview(auth.session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  const card = await prismaClient.card.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      column: { select: { boardId: true } },
    },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const owner =
    (await prismaClient.user.findFirst({
      where: { email: 'alo@madebyfelipe.com.br', role: 'OWNER', isActive: true },
      select: { id: true, name: true },
    })) ??
    (await prismaClient.user.findFirst({
      where: { role: 'OWNER', isActive: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true },
    }))

  if (!owner) {
    return NextResponse.json(
      { error: 'Nenhum owner ativo encontrado para revisão' },
      { status: 400 },
    )
  }

  const updated = await prismaClient.card.update({
    where: { id },
    data: {
      status: 'IN_REVIEW',
      stage: 'REVISAO',
      assignedUserId: owner.id,
    },
    include: {
      assignedUser: { select: { id: true, name: true } },
      column: { select: { id: true, name: true, boardId: true } },
    },
  })

  await createActivityLog({
    message: `${auth.session.user.name} concluiu "${card.title}" e enviou para revisão com ${owner.name}`,
    userId: auth.session.user.id,
    boardId: card.column.boardId,
    cardId: card.id,
  }).catch(() => {})

  return NextResponse.json(updated)
}
