import JobsTable from '@/modules/jobs/JobsTable'
import { prismaClient } from '@/services/prismaClient'

export default async function JobsPage() {
  const cards = await prismaClient.card.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      objective: true,
      references: true,
      driveLink: true,
      cta: true,
      status: true,
      priority: true,
      contentType: true,
      platform: true,
      effort: true,
      stage: true,
      deadline: true,
      order: true,
      columnId: true,
      assignedUserId: true,
      createdAt: true,
      updatedAt: true,
      assignedUser: { select: { id: true, name: true } },
      column: {
        select: {
          id: true,
          name: true,
          board: {
            select: {
              id: true,
              name: true,
              client: {
                select: {
                  id: true,
                  name: true,
                  niche: true,
                  toneOfVoice: true,
                  contentFrequency: true,
                  mainObjective: true,
                  targetAudience: true,
                  restrictions: true,
                  differentials: true,
                  operationalGuidelines: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const serializedCards = cards.map((card) => ({
    ...card,
    deadline: card.deadline ? card.deadline.toISOString() : null,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[#FAFAFA]">Jobs</h1>
        <span className="text-sm text-[#525252]">{serializedCards.length} cards no total</span>
      </div>

      <JobsTable cards={serializedCards} />
    </main>
  )
}
