import { prismaClient } from '@/services/prismaClient'

export async function createCardComment(params: {
  content: string
  cardId: string
  authorId: string
  mentionUserIds?: string[]
}) {
  return prismaClient.cardComment.create({
    data: {
      content: params.content,
      cardId: params.cardId,
      authorId: params.authorId,
      mentionUserIds: params.mentionUserIds ?? [],
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  })
}

export async function getCardSidebarData(cardId: string) {
  const [comments, history] = await Promise.all([
    prismaClient.cardComment.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prismaClient.activityLog.findMany({
      where: { cardId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    }),
  ])

  return { comments, history }
}
