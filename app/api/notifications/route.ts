import { NextResponse } from 'next/server'
import { requireAuthenticatedSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'

export async function GET() {
  const auth = await requireAuthenticatedSession()
  if (auth.response) return auth.response

  const session = auth.session

  const [cards, mentions] = await Promise.all([
    prismaClient.card.findMany({
      where: { assignedUserId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
        contentType: true,
        column: {
          select: {
            name: true,
            board: {
              select: {
                id: true,
                name: true,
                client: { select: { name: true } },
              },
            },
          },
        },
      },
    }),
    prismaClient.cardComment.findMany({
      where: { mentionUserIds: { has: session.user.id } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { name: true } },
        card: {
          select: {
            id: true,
            title: true,
            column: {
              select: {
                board: {
                  select: {
                    id: true,
                    name: true,
                    client: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    }),
  ])

  return NextResponse.json({ cards, mentions })
}
