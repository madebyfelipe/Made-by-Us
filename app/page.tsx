import Link from 'next/link'
import { prismaClient } from '@/services/prismaClient'
import Logo from '@/components/Logo'

export default async function DashboardPage() {
  const clients = await prismaClient.client.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      boards: {
        orderBy: { createdAt: 'desc' },
        include: {
          columns: {
            include: { cards: { select: { id: true } } },
          },
        },
      },
    },
  })

  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <Logo width={140} height={36} className="mb-2" />
          <p className="text-sm text-[#525252]">Produção de conteúdo</p>
        </div>
        <Link
          href="/clients"
          className="text-xs text-[#525252] transition-colors hover:text-[#A3A3A3]"
        >
          Gerenciar clientes →
        </Link>
      </header>

      <div className="flex flex-col gap-10">
        {clients.map((client) => (
          <section key={client.id}>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-widest text-[#525252]">
              {client.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              {client.boards.map((board) => {
                const cardCount = board.columns.reduce(
                  (sum, col) => sum + col.cards.length,
                  0,
                )
                return (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="flex w-52 flex-col gap-2 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 transition-colors hover:border-[#BC0319]"
                  >
                    <span className="text-sm font-medium text-[#FAFAFA]">{board.name}</span>
                    <span className="text-xs text-[#525252]">
                      {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                    </span>
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
          <p className="text-sm text-[#525252]">Nenhum cliente cadastrado.</p>
        )}
      </div>
    </main>
  )
}
