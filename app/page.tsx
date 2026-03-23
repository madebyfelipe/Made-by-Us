import Link from 'next/link'
import { prismaClient } from '@/services/prismaClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const clients = await prismaClient.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      boards: {
        orderBy: { createdAt: 'desc' },
        include: {
          columns: {
            include: {
              cards: { select: { id: true, status: true } },
            },
          },
        },
      },
    },
  })

  return (
    <main className="dashboard-main-bg min-h-screen bg-[#0A0A0A] px-8 py-10">
      <header className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#FAFAFA]">Início</h1>
        <Link
          href="/clients"
          className="text-sm text-[#A3A3A3] transition-colors duration-150 hover:text-[#FAFAFA]"
        >
          Gerenciar clientes →
        </Link>
      </header>

      <div className="flex flex-col gap-12">
        {clients.map((client) => (
          <section key={client.id}>
            <h2 className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
              {client.name}
            </h2>
            <div className="flex flex-wrap gap-4">
              {client.boards.map((board) => {
                const allCards = board.columns.flatMap((col) => col.cards)
                const openCount = allCards.filter((c) => c.status !== 'DONE').length
                const doneCount = allCards.filter((c) => c.status === 'DONE').length

                return (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="flex w-64 flex-col gap-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-5 transition-all duration-150 hover:border-[#BC0319] hover:bg-[#1A1A1A]"
                  >
                    <span className="text-base font-medium text-[#FAFAFA]">{board.name}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        {openCount} abertas
                      </span>
                      <span className="flex items-center gap-1.5 text-[#525252]">
                        <span className="h-2 w-2 rounded-full bg-emerald-600" />
                        {doneCount} concluídas
                      </span>
                    </div>
                  </Link>
                )
              })}

              {client.boards.length === 0 && (
                <p className="text-sm text-[#525252]">Nenhum board ainda.</p>
              )}
            </div>
          </section>
        ))}

        {clients.length === 0 && (
          <div className="flex flex-col items-center gap-5 rounded-xl border border-[#2A2A2A] bg-[#141414] py-20 text-center">
            <p className="text-base text-[#A3A3A3]">Nenhum cliente cadastrado ainda.</p>
            <Link
              href="/clients"
              className="rounded-lg bg-[#BC0319] px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#D4031E]"
            >
              Gerenciar clientes
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
