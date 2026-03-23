import Link from 'next/link'
import { canEditWorkspace } from '@/modules/auth/permissions'
import { getAuthSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'

export const dynamic = 'force-dynamic'

type ClientWithStats = Awaited<ReturnType<typeof fetchClientsWithStats>>[number]

async function fetchClientsWithStats() {
  return prismaClient.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      boards: {
        include: {
          columns: {
            include: {
              cards: {
                select: {
                  id: true,
                  status: true,
                  assignedUser: { select: { name: true } },
                },
              },
            },
          },
          activityLogs: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
        },
      },
    },
  })
}

function computeOpenTaskCount(client: ClientWithStats): number {
  return client.boards
    .flatMap((board) => board.columns.flatMap((col) => col.cards))
    .filter((card) => card.status !== 'DONE').length
}

function computeLastActivity(client: ClientWithStats): Date | null {
  const dates = client.boards
    .flatMap((board) => board.activityLogs)
    .map((log) => new Date(log.createdAt))

  if (dates.length === 0) return null
  return new Date(Math.max(...dates.map((d) => d.getTime())))
}

function computeMainResponsible(client: ClientWithStats): string | null {
  const allCards = client.boards.flatMap((board) =>
    board.columns.flatMap((col) => col.cards),
  )

  const countByName = new Map<string, number>()
  for (const card of allCards) {
    if (card.assignedUser) {
      const current = countByName.get(card.assignedUser.name) ?? 0
      countByName.set(card.assignedUser.name, current + 1)
    }
  }

  if (countByName.size === 0) return null
  return [...countByName.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

function formatRelativeDate(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `${diffDays}d atrás`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem atrás`
  return `${Math.floor(diffDays / 30)}m atrás`
}

export default async function ClientsPage() {
  const session = await getAuthSession()
  const clients = await fetchClientsWithStats()
  const canEdit = canEditWorkspace(session?.user?.role)

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-8 py-10">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#FAFAFA]">Clientes</h1>
        {canEdit && (
          <Link
            href="/clients/new"
            className="rounded-lg bg-[#BC0319] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#D4031E]"
          >
            Novo cliente
          </Link>
        )}
      </header>

      <div className="flex flex-col gap-3">
        {clients.map((client) => {
          const openTasks = computeOpenTaskCount(client)
          const lastActivity = computeLastActivity(client)
          const responsible = computeMainResponsible(client)

          return (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="flex items-center justify-between rounded-xl border border-[#2A2A2A] bg-[#141414] px-6 py-5 transition-all duration-150 hover:border-[#BC0319] hover:bg-[#1A1A1A]"
            >
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-[#FAFAFA]">{client.name}</p>
                {client.description && (
                  <p className="text-sm text-[#A3A3A3]">{client.description}</p>
                )}
              </div>

              <div className="flex items-center gap-8">
                {responsible && (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-[#525252]">
                      Responsável
                    </span>
                    <span className="text-sm text-[#A3A3A3]">{responsible}</span>
                  </div>
                )}

                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-xs font-medium uppercase tracking-wide text-[#525252]">
                    Em aberto
                  </span>
                  <span
                    className={`text-sm font-semibold ${openTasks > 0 ? 'text-[#BC0319]' : 'text-[#525252]'}`}
                  >
                    {openTasks} {openTasks === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                </div>

                {lastActivity && (
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-xs font-medium uppercase tracking-wide text-[#525252]">
                      Atividade
                    </span>
                    <span className="text-sm text-[#A3A3A3]">
                      {formatRelativeDate(lastActivity)}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )
        })}

        {clients.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-[#2A2A2A] bg-[#141414] py-20 text-center">
            <p className="text-base text-[#A3A3A3]">Nenhum cliente cadastrado ainda.</p>
            {canEdit && (
              <Link
                href="/clients/new"
                className="rounded-lg bg-[#BC0319] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#D4031E]"
              >
                Criar primeiro cliente
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
