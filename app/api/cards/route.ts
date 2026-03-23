import { NextResponse } from 'next/server'
import { prismaClient } from '@/services/prismaClient'
import { createActivityLog } from '@/services/activityLogService'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { createCardSchema } from '@/utils/schemas'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const columnId = searchParams.get('columnId')

  if (!columnId) {
    return NextResponse.json({ error: 'columnId is required' }, { status: 400 })
  }

  const cards = await prismaClient.card.findMany({
    where: { columnId },
    orderBy: { order: 'asc' },
    include: {
      assignedUser: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(cards)
}

export async function POST(request: Request) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const session = auth.session
  const body = await request.json()
  const parsed = createCardSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 400 },
    )
  }

  try {
    const card = await prismaClient.card.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        objective: parsed.data.objective,
        references: parsed.data.references,
        driveLink: parsed.data.driveLink,
        cta: parsed.data.cta,
        status: parsed.data.status,
        priority: parsed.data.priority,
        contentType: parsed.data.contentType ?? null,
        platform: parsed.data.platform,
        effort: parsed.data.effort ?? null,
        stage: parsed.data.stage ?? null,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
        order: parsed.data.order,
        columnId: parsed.data.columnId,
        assignedUserId: parsed.data.assignedUserId ?? null,
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
        column: { select: { boardId: true } },
      },
    })

    if (session?.user?.id) {
      await createActivityLog({
        message: `${session.user.name} criou "${card.title}"`,
        userId: session.user.id,
        boardId: card.column.boardId,
        cardId: card.id,
      }).catch(() => {})
    }

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao criar card'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
