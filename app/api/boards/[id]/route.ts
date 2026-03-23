import { NextResponse } from 'next/server'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'

type RouteParams = { params: Promise<{ id: string }> }

// TODO: validate session (Etapa 4)

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  const board = await prismaClient.board.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true } },
      columns: {
        orderBy: { order: 'asc' },
        include: {
          cards: {
            orderBy: { order: 'asc' },
            include: {
              assignedUser: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  })

  if (!board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404 })
  }

  return NextResponse.json(board)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const { id } = await params
  const { name } = (await request.json()) as { name: string }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const board = await prismaClient.board.update({
    where: { id },
    data: { name: name.trim() },
  })

  return NextResponse.json(board)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const { id } = await params

  await prismaClient.board.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
