import { NextResponse } from 'next/server'
import { canEditWorkspace } from '@/modules/auth/permissions'
import { requireAuthenticatedSession, requireWorkspaceWriteSession } from '@/modules/auth/server'
import { createActivityLogs } from '@/services/activityLogService'
import { canUpdateCardPayload } from '@/services/cardPermissionService'
import { prismaClient } from '@/services/prismaClient'
import { updateCardSchema } from '@/utils/schemas'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params

  const card = await prismaClient.card.findUnique({
    where: { id },
    include: {
      assignedUser: { select: { id: true, name: true } },
      column: { select: { id: true, name: true, boardId: true } },
    },
  })

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 })
  }

  return NextResponse.json(card)
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params
  const auth = await requireCardUpdateSession()
  if (auth.response) return auth.response

  const session = auth.session
  const body = await request.json()
  const parsed = updateCardSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 400 },
    )
  }

  const data = parsed.data
  if (!canUpdateCardPayload(session.user.role, data as Record<string, unknown>)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const currentCard = await prismaClient.card.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { id: true, name: true } },
        column: { select: { boardId: true } },
      },
    })

    if (!currentCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const card = await prismaClient.card.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.objective !== undefined && { objective: data.objective }),
        ...(data.references !== undefined && { references: data.references }),
        ...(data.driveLink !== undefined && { driveLink: data.driveLink }),
        ...(data.cta !== undefined && { cta: data.cta }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.platform !== undefined && { platform: data.platform }),
        ...(data.contentType !== undefined && { contentType: data.contentType ?? null }),
        ...(data.effort !== undefined && { effort: data.effort ?? null }),
        ...(data.stage !== undefined && { stage: data.stage ?? null }),
        ...(data.deadline !== undefined && {
          deadline: data.deadline ? new Date(data.deadline) : null,
        }),
        ...(data.assignedUserId !== undefined && {
          assignedUserId: data.assignedUserId ?? null,
        }),
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
        column: { select: { boardId: true } },
      },
    })

    await createActivityLogs(
      buildCardChangeMessages({
        actorName: session.user.name ?? 'Usuário',
        previous: currentCard,
        next: card,
        payload: data as Record<string, unknown>,
      }).map((message) => ({
        message,
        userId: session.user.id,
        boardId: card.column.boardId,
        cardId: card.id,
      })),
    )

    return NextResponse.json(card)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno ao salvar card'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const { id } = await params

  await prismaClient.card.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}

async function requireCardUpdateSession() {
  const auth = await requireAuthenticatedSession()
  if (auth.response) return auth

  if (!canEditWorkspace(auth.session.user.role) && auth.session.user.role !== 'MEMBER') {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return auth
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'vazio'
  if (value instanceof Date) return value.toLocaleDateString('pt-BR')
  return String(value)
}

function buildCardChangeMessages(params: {
  actorName: string
  previous: {
    title: string
    description: string
    objective: string
    references: string
    driveLink: string
    cta: string
    status: string
    priority: string
    contentType: string | null
    platform: string
    effort: string | null
    stage: string | null
    deadline: Date | null
    assignedUser: { id: string; name: string } | null
  }
  next: {
    title: string
    description: string
    objective: string
    references: string
    driveLink: string
    cta: string
    status: string
    priority: string
    contentType: string | null
    platform: string
    effort: string | null
    stage: string | null
    deadline: Date | null
    assignedUser: { id: string; name: string } | null
  }
  payload: Record<string, unknown>
}) {
  const fieldLabels: Record<string, string> = {
    title: 'título',
    description: 'descrição',
    objective: 'objetivo',
    references: 'referências',
    driveLink: 'link do Drive',
    cta: 'CTA',
    status: 'status',
    priority: 'prioridade',
    contentType: 'tipo de conteúdo',
    platform: 'plataforma',
    effort: 'esforço',
    stage: 'etapa',
    deadline: 'prazo',
    assignedUserId: 'responsável',
  }

  const beforeValues: Record<string, unknown> = {
    title: params.previous.title,
    description: params.previous.description,
    objective: params.previous.objective,
    references: params.previous.references,
    driveLink: params.previous.driveLink,
    cta: params.previous.cta,
    status: params.previous.status,
    priority: params.previous.priority,
    contentType: params.previous.contentType,
    platform: params.previous.platform,
    effort: params.previous.effort,
    stage: params.previous.stage,
    deadline: params.previous.deadline,
    assignedUserId: params.previous.assignedUser?.name ?? null,
  }

  const afterValues: Record<string, unknown> = {
    title: params.next.title,
    description: params.next.description,
    objective: params.next.objective,
    references: params.next.references,
    driveLink: params.next.driveLink,
    cta: params.next.cta,
    status: params.next.status,
    priority: params.next.priority,
    contentType: params.next.contentType,
    platform: params.next.platform,
    effort: params.next.effort,
    stage: params.next.stage,
    deadline: params.next.deadline,
    assignedUserId: params.next.assignedUser?.name ?? null,
  }

  const messages = Object.keys(params.payload)
    .filter((key) => params.payload[key] !== undefined)
    .filter((key) => formatValue(beforeValues[key]) !== formatValue(afterValues[key]))
    .map(
      (key) =>
        `${params.actorName} alterou ${fieldLabels[key] ?? key} de "${formatValue(beforeValues[key])}" para "${formatValue(afterValues[key])}" em "${params.next.title}"`,
    )

  return messages.length > 0 ? messages : [`${params.actorName} atualizou "${params.next.title}"`]
}
