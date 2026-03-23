import { NextResponse } from 'next/server'
import { prismaClient } from '@/services/prismaClient'
import { createActivityLog } from '@/services/activityLogService'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import type { MoveCardInput } from '@/types'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const session = auth.session
  const body = (await request.json()) as MoveCardInput

  if (!body.targetColumnId) {
    return NextResponse.json({ error: 'targetColumnId is required' }, { status: 400 })
  }

  if (body.order === undefined || body.order < 0) {
    return NextResponse.json({ error: 'order is required' }, { status: 400 })
  }

  const card = await prismaClient.card.findUnique({ where: { id } })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  const isMovingColumns = card.columnId !== body.targetColumnId

  const targetColumn = isMovingColumns
    ? await prismaClient.column.findUnique({
        where: { id: body.targetColumnId },
        select: { name: true, boardId: true },
      })
    : null

  const updatedCard = await prismaClient.$transaction(async (tx) => {
    if (isMovingColumns) {
      await tx.card.updateMany({
        where: { columnId: card.columnId, order: { gt: card.order } },
        data: { order: { decrement: 1 } },
      })

      await tx.card.updateMany({
        where: { columnId: body.targetColumnId, order: { gte: body.order } },
        data: { order: { increment: 1 } },
      })
    } else {
      if (body.order > card.order) {
        await tx.card.updateMany({
          where: { columnId: card.columnId, order: { gt: card.order, lte: body.order } },
          data: { order: { decrement: 1 } },
        })
      } else if (body.order < card.order) {
        await tx.card.updateMany({
          where: { columnId: card.columnId, order: { gte: body.order, lt: card.order } },
          data: { order: { increment: 1 } },
        })
      }
    }

    return tx.card.update({
      where: { id },
      data: { columnId: body.targetColumnId, order: body.order },
      include: {
        assignedUser: { select: { id: true, name: true } },
        column: { select: { id: true, name: true } },
      },
    })
  })

  if (session?.user?.id && isMovingColumns && targetColumn) {
    await createActivityLog({
      message: `${session.user.name} moveu "${card.title}" para "${targetColumn.name}"`,
      userId: session.user.id,
      boardId: targetColumn.boardId,
      cardId: card.id,
    }).catch(() => {})
  }

  return NextResponse.json(updatedCard)
}
