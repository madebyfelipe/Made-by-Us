import { NextResponse } from 'next/server'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import type { CreateColumnInput } from '@/types'

// TODO: validate session (Etapa 4)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const boardId = searchParams.get('boardId')

  if (!boardId) {
    return NextResponse.json({ error: 'boardId is required' }, { status: 400 })
  }

  const columns = await prismaClient.column.findMany({
    where: { boardId },
    orderBy: { order: 'asc' },
    include: {
      cards: { orderBy: { order: 'asc' } },
    },
  })

  return NextResponse.json(columns)
}

export async function POST(request: Request) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const body = (await request.json()) as CreateColumnInput

  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (!body.boardId) {
    return NextResponse.json({ error: 'boardId is required' }, { status: 400 })
  }

  const column = await prismaClient.column.create({
    data: {
      name: body.name.trim(),
      order: body.order ?? 0,
      boardId: body.boardId,
    },
  })

  return NextResponse.json(column, { status: 201 })
}
