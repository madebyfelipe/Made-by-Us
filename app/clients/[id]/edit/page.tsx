import { notFound, redirect } from 'next/navigation'
import { canEditWorkspace } from '@/modules/auth/permissions'
import { getAuthSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import ClientForm from '@/modules/clients/ClientForm'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: Props) {
  const { id } = await params
  const session = await getAuthSession()

  if (!canEditWorkspace(session?.user?.role)) {
    redirect(`/clients/${id}`)
  }

  const client = await prismaClient.client.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      niche: true,
      toneOfVoice: true,
      mainObjective: true,
      platforms: true,
      contentFrequency: true,
      targetAudience: true,
      restrictions: true,
      differentials: true,
      operationalGuidelines: true,
      customHtml: true,
    },
  })

  if (!client) notFound()

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#1A1A1A] bg-[#141414] p-8 shadow-2xl">
        <h1 className="mb-8 text-xl font-semibold text-[#FAFAFA]">Editar cliente</h1>
        <ClientForm mode="edit" clientId={id} initialData={client} />
      </div>
    </main>
  )
}
