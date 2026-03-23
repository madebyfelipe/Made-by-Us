import type {
  User,
  Client,
  Board,
  Column,
  Card,
  ActivityLog,
  CardComment,
  Role,
  CardStatus,
  Priority,
  ContentType,
  Effort,
  ProductionStage,
} from '@/app/generated/prisma/client'

// ─── Re-export Base Types ─────────────────────────────────────────────────────

export type { User, Client, Board, Column, Card, ActivityLog, CardComment }

// ─── Re-export Enums ──────────────────────────────────────────────────────────

export type { Role, CardStatus, Priority, ContentType, Effort, ProductionStage }

// ─── Composite Types (with relations) ────────────────────────────────────────

export type ColumnWithCards = Column & {
  cards: Card[]
}

export type CardWithAssignedUser = Card & {
  assignedUser: User | null
}

export type BoardWithColumns = Board & {
  columns: ColumnWithCards[]
}

export type BoardWithColumnsAndCards = Board & {
  columns: (Column & {
    cards: CardWithAssignedUser[]
  })[]
}

export type CardCommentWithAuthor = CardComment & {
  author: Pick<User, 'id' | 'name' | 'email'>
}

// ─── Input Types (API payloads — without id/timestamps) ──────────────────────

export type CreateCardInput = {
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
}

export type UpdateCardInput = Partial<Omit<CreateCardInput, 'columnId' | 'order'>>

export type MoveCardInput = {
  targetColumnId: string
  order: number
}

export type CreateClientInput = {
  name: string
  description: string
  niche: string
  toneOfVoice: string
  mainObjective: string
  platforms: string
  contentFrequency: string
  targetAudience: string
  restrictions: string
  differentials: string
  operationalGuidelines: string
  customHtml: string
}

export type UpdateClientInput = Partial<CreateClientInput>

export type CreateBoardInput = {
  name: string
  clientId: string
}

export type CreateColumnInput = {
  name: string
  order: number
  boardId: string
}

export type ReorderColumnsInput = {
  updates: { id: string; order: number }[]
}
