import { NextResponse } from 'next/server'
import { prismaClient } from '@/services/prismaClient'
import { createActivityLog } from '@/services/activityLogService'
import { requireAdminSession } from '@/modules/auth/server'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params
  const auth = await requireAdminSession()
  if (auth.response) return auth.response

  const session = auth.session

  const card = await prismaClient.card.findUnique({
    where: { id },
    include: { column: { select: { boardId: true } } },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  if (card.status === 'DONE') {
    return NextResponse.json({ error: 'Card is already done' }, { status: 400 })
  }

  const lastColumn = await prismaClient.column.findFirst({
    where: { boardId: card.column.boardId },
    orderBy: { order: 'desc' },
    select: { id: true, name: true },
  })

  if (!lastColumn) {
    return NextResponse.json({ error: 'No columns found for this board' }, { status: 400 })
  }

  const lastCardInColumn = await prismaClient.card.findFirst({
    where: { columnId: lastColumn.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const targetOrder = lastCardInColumn ? lastCardInColumn.order + 1 : 0
  const isMovingColumns = card.columnId !== lastColumn.id

  const updatedCard = await prismaClient.$transaction(async (tx) => {
    if (isMovingColumns) {
      await tx.card.updateMany({
        where: { columnId: card.columnId, order: { gt: card.order } },
        data: { order: { decrement: 1 } },
      })
    }

    return tx.card.update({
      where: { id },
      data: {
        status: 'DONE',
        columnId: lastColumn.id,
        order: targetOrder,
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
        column: { select: { id: true, name: true } },
      },
    })
  })

  if (session?.user?.id) {
    await createActivityLog({
      message: `${session.user.name} concluiu "${card.title}"${isMovingColumns ? ` e moveu para "${lastColumn.name}"` : ''}`,
      userId: session.user.id,
      boardId: card.column.boardId,
      cardId: card.id,
    }).catch(() => {})
  }

  return NextResponse.json(updatedCard)
}
