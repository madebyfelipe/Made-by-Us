import type {
  CardStatus,
  Priority,
  ContentType,
  Effort,
  ProductionStage,
} from '@/app/generated/prisma/client'

export type JobCard = {
  id: string
  title: string
  description: string
  objective: string
  references: string
  driveLink: string
  cta: string
  status: CardStatus
  priority: Priority
  contentType: ContentType | null
  platform: string
  effort: Effort | null
  stage: ProductionStage | null
  deadline: string | null
  order: number
  columnId: string
  assignedUserId: string | null
  createdAt: string
  updatedAt: string
  assignedUser: { id: string; name: string } | null
  column: {
    id: string
    name: string
    board: {
      id: string
      name: string
      client: {
        id: string
        name: string
        niche: string
        toneOfVoice: string
        contentFrequency: string
        mainObjective: string
        targetAudience: string
        restrictions: string
        differentials: string
        operationalGuidelines: string
      }
    }
  }
}
