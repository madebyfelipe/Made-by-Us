import { NextResponse } from 'next/server'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'

type RouteParams = { params: Promise<{ id: string }> }

// TODO: validate session (Etapa 4)

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  const column = await prismaClient.column.findUnique({
    where: { id },
    include: {
      cards: {
        orderBy: { order: 'asc' },
        include: {
          assignedUser: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!column) {
    return NextResponse.json({ error: 'Column not found' }, { status: 404 })
  }

  return NextResponse.json(column)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const { id } = await params
  const body = (await request.json()) as { name?: string; order?: number }

  const column = await prismaClient.column.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.order !== undefined && { order: body.order }),
    },
  })

  return NextResponse.json(column)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const { id } = await params

  await prismaClient.column.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
