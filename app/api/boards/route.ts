import { NextResponse } from 'next/server'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import type { CreateBoardInput } from '@/types'

// TODO: validate session (Etapa 4)

const DEFAULT_COLUMNS = ['Backlog', 'Em andamento', 'Revisão', 'Concluído']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  const boards = await prismaClient.board.findMany({
    where: clientId ? { clientId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true } },
      columns: { select: { id: true } },
    },
  })

  return NextResponse.json(boards)
}

export async function POST(request: Request) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const body = (await request.json()) as CreateBoardInput

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (!body.clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  }

  const board = await prismaClient.$transaction(async (tx) => {
    const createdBoard = await tx.board.create({
      data: { name: body.name.trim(), clientId: body.clientId },
    })

    await tx.column.createMany({
      data: DEFAULT_COLUMNS.map((name, index) => ({
        name,
        order: index,
        boardId: createdBoard.id,
      })),
    })

    return tx.board.findUnique({
      where: { id: createdBoard.id },
      include: { columns: { orderBy: { order: 'asc' } } },
    })
  })

  return NextResponse.json(board, { status: 201 })
}
