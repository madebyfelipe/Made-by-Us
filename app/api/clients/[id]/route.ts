import { NextResponse } from 'next/server'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import { updateClientSchema } from '@/utils/schemas'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  const client = await prismaClient.client.findUnique({
    where: { id },
    include: {
      boards: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const { id } = await params
  const body = await request.json()
  const parsed = updateClientSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados invÃ¡lidos' },
      { status: 400 },
    )
  }

  const client = await prismaClient.client.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(client)
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const { id } = await params

  await prismaClient.client.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
