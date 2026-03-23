import Link from 'next/link'
import { notFound } from 'next/navigation'
import { canEditWorkspace } from '@/modules/auth/permissions'
import { getAuthSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import KanbanBoard from '@/modules/kanban/KanbanBoard'
import ActivityLogPanel from '@/modules/activity/ActivityLogPanel'
import type { BoardWithColumnsAndCards } from '@/types'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: Props) {
  const { id } = await params
  const session = await getAuthSession()
  const canEdit = canEditWorkspace(session?.user?.role)

  const board = await prismaClient.board.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, description: true } },
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
      activityLogs: {
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: { user: { select: { name: true } } },
      },
    },
  })

  if (!board) notFound()

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col bg-[#0A0A0A]">
      <header className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/clients/${board.client.id}`}
            className="text-sm font-medium text-[#525252] transition-colors hover:text-[#A3A3A3]"
          >
            {board.client.name}
          </Link>
          <span className="text-[#2A2A2A]">/</span>
          <h1 className="text-sm font-semibold text-[#FAFAFA]">{board.name}</h1>
          {board.client.description && (
            <>
              <span className="text-[#2A2A2A]">·</span>
              <span className="text-sm text-[#525252]">{board.client.description}</span>
            </>
          )}
        </div>

        <Link
          href={`/clients/${board.client.id}`}
          className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-sm font-medium text-[#A3A3A3] transition-all duration-150 hover:border-[#BC0319] hover:text-[#FAFAFA]"
        >
          Ver cliente
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <KanbanBoard
            board={board as unknown as BoardWithColumnsAndCards}
            readOnly={!canEdit}
          />
        </div>
        <ActivityLogPanel logs={board.activityLogs} />
      </div>
    </div>
  )
}
