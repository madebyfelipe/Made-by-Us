import { NextResponse } from 'next/server'
import { prismaClient } from '@/services/prismaClient'

type RouteParams = { params: Promise<{ id: string }> }

// TODO: validate session (Etapa 4)

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  const logs = await prismaClient.activityLog.findMany({
    where: { boardId: id },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(logs)
}
