import Link from 'next/link'
import { notFound } from 'next/navigation'
import { canEditWorkspace } from '@/modules/auth/permissions'
import { getAuthSession } from '@/modules/auth/server'
import ClientHtmlPreview from '@/modules/clients/ClientHtmlPreview'
import ClientStrategicProfile from '@/modules/clients/ClientStrategicProfile'
import BoardManager from '@/modules/clients/BoardManager'
import { prismaClient } from '@/services/prismaClient'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ClientProfilePage({ params }: Props) {
  const { id } = await params
  const session = await getAuthSession()
  const canEdit = canEditWorkspace(session?.user?.role)

  const client = await prismaClient.client.findUnique({
    where: { id },
    include: {
      boards: {
        orderBy: { createdAt: 'desc' },
        include: {
          columns: { include: { cards: { select: { id: true } } } },
        },
      },
    },
  })

  if (!client) notFound()

  const hasProfile = [
    client.niche,
    client.toneOfVoice,
    client.contentFrequency,
    client.mainObjective,
    client.targetAudience,
    client.restrictions,
    client.differentials,
    client.operationalGuidelines,
  ].some((field) => field.trim() !== '')

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-8 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <Link
              href="/clients"
              className="text-sm text-[#525252] transition-colors hover:text-[#A3A3A3]"
            >
              Clientes
            </Link>
            <span className="text-[#2A2A2A]">/</span>
            <h1 className="text-xl font-semibold text-[#FAFAFA]">{client.name}</h1>
          </div>
          {client.description && <p className="text-sm text-[#A3A3A3]">{client.description}</p>}
        </div>

        {canEdit && (
          <Link
            href={`/clients/${id}/edit`}
            className="rounded-lg border border-[#2A2A2A] px-5 py-2.5 text-sm font-medium text-[#A3A3A3] transition-colors hover:border-[#BC0319] hover:text-[#FAFAFA]"
          >
            Editar cliente
          </Link>
        )}
      </header>

      <div className="flex flex-col gap-10">
        <BoardManager clientId={id} initialBoards={client.boards} readOnly={!canEdit} />

        {hasProfile && (
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
              Perfil Estrategico
            </h2>
            <ClientStrategicProfile profile={client} />
          </section>
        )}

        {client.customHtml && (
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
              Perfil HTML
            </h2>
            <ClientHtmlPreview html={client.customHtml} />
          </section>
        )}
      </div>
    </main>
  )
}
