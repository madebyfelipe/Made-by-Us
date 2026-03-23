import { NextResponse } from 'next/server'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import { createClientSchema } from '@/utils/schemas'

export async function GET() {
  const clients = await prismaClient.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: { boards: { select: { id: true } } },
  })

  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const body = await request.json()
  const parsed = createClientSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados invÃ¡lidos' },
      { status: 400 },
    )
  }

  const client = await prismaClient.client.create({ data: parsed.data })

  return NextResponse.json(client, { status: 201 })
}
