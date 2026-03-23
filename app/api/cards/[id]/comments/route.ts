import { NextResponse } from 'next/server'
import { requireAuthenticatedSession } from '@/modules/auth/server'
import { createActivityLog } from '@/services/activityLogService'
import { createCardComment, getCardSidebarData } from '@/services/cardCommentService'
import { prismaClient } from '@/services/prismaClient'
import { createCardCommentSchema } from '@/utils/schemas'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await requireAuthenticatedSession()
  if (auth.response) return auth.response

  const { id } = await params
  return NextResponse.json(await getCardSidebarData(id))
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const auth = await requireAuthenticatedSession()
    if (auth.response) return auth.response

    const { id } = await params
    const body = await request.json()
    const parsed = createCardCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Dados invalidos' },
        { status: 400 },
      )
    }

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

    const mentionUserIds = [...new Set(parsed.data.mentionUserIds ?? [])].filter(Boolean)

    const comment = await createCardComment({
      content: parsed.data.content.trim(),
      cardId: card.id,
      authorId: auth.session.user.id,
      mentionUserIds,
    })

    await createActivityLog({
      message: `${auth.session.user.name ?? 'Usuario'} comentou em "${card.title}"`,
      userId: auth.session.user.id,
      boardId: card.column.boardId,
      cardId: card.id,
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao criar comentario'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
