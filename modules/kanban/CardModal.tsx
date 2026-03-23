'use client'

import { useEffect, useState } from 'react'
import type {
  ActivityLog,
  CardCommentWithAuthor,
  CardStatus,
  CardWithAssignedUser,
  ContentType,
  Effort,
  Priority,
  ProductionStage,
} from '@/types'
import {
  canEditWorkspace,
  canSubmitCardForReview,
  getRoleLabel,
} from '@/modules/auth/permissions'
import { useAuthenticatedUser } from '@/modules/auth/useAuthenticatedUser'

type UserOption = { id: string; name: string }

type SidebarHistoryItem = ActivityLog & {
  user: { id: string; name: string | null } | null
}

type SidebarData = {
  comments: CardCommentWithAuthor[]
  history: SidebarHistoryItem[]
}

type CardModalCard = Omit<
  CardWithAssignedUser,
  'deadline' | 'createdAt' | 'updatedAt' | 'assignedUser'
> & {
  deadline: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  assignedUser: { id: string; name: string | null } | null
  column?: unknown
}

type SidebarTab = 'comments' | 'history'

const contentTypeOptions: { value: ContentType; label: string }[] = [
  { value: 'POST', label: 'Post' },
  { value: 'STORY', label: 'Story' },
  { value: 'REELS', label: 'Reels' },
  { value: 'CAROUSEL', label: 'Carrossel' },
  { value: 'ADS', label: 'Ads' },
]

const platformOptions = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
]

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
]

const statusOptions: { value: CardStatus; label: string }[] = [
  { value: 'TODO', label: 'A fazer' },
  { value: 'IN_PROGRESS', label: 'Em progresso' },
  { value: 'IN_REVIEW', label: 'Em revisao' },
  { value: 'DONE', label: 'Concluido' },
]

const effortOptions: { value: Effort; label: string }[] = [
  { value: 'LOW', label: 'Baixo' },
  { value: 'MEDIUM', label: 'Medio' },
  { value: 'HIGH', label: 'Alto' },
]

const stageOptions: { value: ProductionStage; label: string }[] = [
  { value: 'ROTEIRO', label: 'Roteiro' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'EDICAO', label: 'Edicao' },
  { value: 'REVISAO', label: 'Revisao' },
  { value: 'APROVACAO', label: 'Aprovacao' },
]

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#525252]">
        {label}
      </p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-[#A3A3A3]">{label}</label>
      {children}
    </div>
  )
}

type ChipOption<T extends string> = { value: T; label: string }

function ChipSelector<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
}: {
  options: ChipOption<T>[]
  value: T | null
  onChange: (value: T | null) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === option.value ? null : option.value)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
            disabled ? 'cursor-not-allowed opacity-50' : '',
            value === option.value
              ? 'bg-[#BC0319] text-white'
              : 'border border-[#2A2A2A] bg-[#0A0A0A] text-[#525252] hover:border-[#3A3A3A] hover:text-[#A3A3A3]',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function MultiChipSelector({
  options,
  values,
  onChange,
  disabled = false,
}: {
  options: { value: string; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
  disabled?: boolean
}) {
  function toggle(value: string) {
    if (disabled) return
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => toggle(option.value)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
            disabled ? 'cursor-not-allowed opacity-50' : '',
            values.includes(option.value)
              ? 'bg-[#BC0319] text-white'
              : 'border border-[#2A2A2A] bg-[#0A0A0A] text-[#525252] hover:border-[#3A3A3A] hover:text-[#A3A3A3]',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

type FormState = {
  title: string
  objective: string
  cta: string
  description: string
  references: string
  driveLink: string
  priority: Priority
  status: CardStatus
  contentType: ContentType | null
  platforms: string[]
  effort: Effort | null
  stage: ProductionStage | null
  deadline: string
  assignedUserId: string
}

function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().slice(0, 10)
}

function buildInitialForm(card: CardModalCard | null): FormState {
  if (!card) {
    return {
      title: '',
      objective: '',
      cta: '',
      description: '',
      references: '',
      driveLink: '',
      priority: 'MEDIUM',
      status: 'TODO',
      contentType: null,
      platforms: [],
      effort: null,
      stage: null,
      deadline: '',
      assignedUserId: '',
    }
  }

  return {
    title: card.title,
    objective: card.objective,
    cta: card.cta,
    description: card.description,
    references: card.references,
    driveLink: card.driveLink,
    priority: card.priority,
    status: card.status,
    contentType: card.contentType ?? null,
    platforms: card.platform ? card.platform.split(',').map((item) => item.trim()).filter(Boolean) : [],
    effort: card.effort ?? null,
    stage: card.stage ?? null,
    deadline: toDateInputValue(card.deadline),
    assignedUserId: card.assignedUserId ?? '',
  }
}

type Props = {
  mode: 'create' | 'edit'
  columnId: string
  card: CardModalCard | null
  readOnly?: boolean
  onClose: () => void
  onCardCreated: (card: CardWithAssignedUser) => void
  onCardUpdated: (card: CardWithAssignedUser) => void
  onCardDeleted: (cardId: string) => void
}

const inputClass =
  'rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#525252] outline-none transition-colors focus:border-[#BC0319] disabled:cursor-not-allowed disabled:opacity-60'

const selectClass =
  'rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA] outline-none transition-colors focus:border-[#BC0319] disabled:cursor-not-allowed disabled:opacity-60'

function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function mergeUpdatedCard(currentCard: CardModalCard, nextCard: Partial<CardWithAssignedUser>) {
  return {
    ...currentCard,
    ...nextCard,
    assignedUser: nextCard.assignedUser ?? currentCard.assignedUser,
    ...('column' in currentCard ? { column: currentCard.column } : {}),
  } as CardWithAssignedUser
}

export default function CardModal({
  mode,
  columnId,
  card,
  readOnly = false,
  onClose,
  onCardCreated,
  onCardUpdated,
  onCardDeleted,
}: Props) {
  const user = useAuthenticatedUser()
  const [form, setForm] = useState<FormState>(() => buildInitialForm(mode === 'edit' ? card : null))
  const [users, setUsers] = useState<UserOption[]>([])
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [mentionUserIds, setMentionUserIds] = useState<string[]>([])
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('comments')
  const [sidebarData, setSidebarData] = useState<SidebarData>({ comments: [], history: [] })
  const [sidebarLoading, setSidebarLoading] = useState(false)

  const role = user?.role
  const isAdmin = canEditWorkspace(role)
  const canSave = !readOnly && isAdmin
  const canDelete = !readOnly && isAdmin && mode === 'edit'
  const canComment = !readOnly && mode === 'edit' && !!user
  const canSubmitReview = !readOnly && mode === 'edit' && !isAdmin && canSubmitCardForReview(role)

  useEffect(() => {
    setForm(buildInitialForm(mode === 'edit' ? card : null))
    setError(null)
    setConfirmingDelete(false)
  }, [mode, card])

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.json())
      .then(setUsers)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (mode !== 'edit' || !card) {
      setSidebarData({ comments: [], history: [] })
      return
    }

    void loadSidebarData(card.id)
  }, [mode, card])

  async function loadSidebarData(cardId: string) {
    setSidebarLoading(true)
    try {
      const response = await fetch(`/api/cards/${cardId}/comments`)
      if (!response.ok) throw new Error('Erro ao carregar comentarios')
      const data = await parseJsonResponse<SidebarData>(response)
      if (!data) throw new Error('Resposta invalida ao carregar comentarios')
      setSidebarData(data)
    } catch {
      setSidebarData({ comments: [], history: [] })
    } finally {
      setSidebarLoading(false)
    }
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function fieldDisabled(_key: keyof FormState) {
    if (readOnly) return true
    if (isAdmin) return false
    return true
  }

  function buildPayload() {
    if (!isAdmin) {
      return { driveLink: form.driveLink }
    }

    return {
      title: form.title,
      objective: form.objective,
      cta: form.cta,
      description: form.description,
      references: form.references,
      driveLink: form.driveLink,
      priority: form.priority,
      status: form.status,
      contentType: form.contentType,
      platform: form.platforms.join(','),
      effort: form.effort,
      stage: form.stage,
      deadline: form.deadline || null,
      assignedUserId: form.assignedUserId || null,
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSave) return
    if ((mode === 'create' || isAdmin) && !form.title.trim()) return setError('Titulo e obrigatorio')

    setSaving(true)
    setError(null)

    try {
      if (mode === 'create') {
        const response = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...buildPayload(), columnId, order: 9999 }),
        })
        const createData = await response.json()
        if (!response.ok) throw new Error(createData.error ?? 'Erro ao criar card')
        onCardCreated(createData as CardWithAssignedUser)
      } else {
        const response = await fetch(`/api/cards/${card!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload()),
        })
        const updateData = await response.json()
        if (!response.ok) throw new Error(updateData.error ?? 'Erro ao salvar card')
        onCardUpdated(mergeUpdatedCard(card!, updateData as Partial<CardWithAssignedUser>))
      }

      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteConfirmed() {
    if (!canDelete) return

    setSaving(true)
    try {
      const response = await fetch(`/api/cards/${card!.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir card')
      onCardDeleted(card!.id)
      onClose()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao excluir')
      setSaving(false)
      setConfirmingDelete(false)
    }
  }

  async function handleSubmitForReview() {
    if (!card || !canSubmitReview) return

    setSubmittingReview(true)
    setError(null)

    try {
      const response = await fetch(`/api/cards/${card.id}/submit-review`, { method: 'PATCH' })
      const responseBody = await response.json()
      if (!response.ok) throw new Error(responseBody.error ?? 'Erro ao concluir job')
      onCardUpdated(mergeUpdatedCard(card, responseBody as Partial<CardWithAssignedUser>))
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro ao concluir job')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleCommentSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!card || !canComment || !commentText.trim()) return

    setCommenting(true)
    setCommentError(null)

    try {
      const response = await fetch(`/api/cards/${card.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText.trim(),
          mentionUserIds,
        }),
      })

      const responseBody = await parseJsonResponse<{ error?: string }>(response)
      if (!response.ok) throw new Error(responseBody?.error ?? 'Erro ao comentar')

      setCommentText('')
      setMentionUserIds([])
      await loadSidebarData(card.id)
      setSidebarTab('comments')
    } catch (submitError) {
      setCommentError(submitError instanceof Error ? submitError.message : 'Erro ao comentar')
    } finally {
      setCommenting(false)
    }
  }

  const title = readOnly ? 'Visualizar card' : mode === 'create' ? 'Novo card' : 'Editar card'
  const roleLabel = user ? getRoleLabel(user.role) : null
  const mentionOptions = users
    .filter((item) => item.id !== user?.id)
    .map((item) => ({ value: item.id, label: item.name }))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414] shadow-2xl lg:flex-row">
        <div className="flex min-h-0 flex-1 flex-col border-b border-[#2A2A2A] lg:border-b-0 lg:border-r">
          <div className="flex items-start justify-between border-b border-[#2A2A2A] px-5 py-4">
            <div>
              <h2 className="text-sm font-medium text-[#FAFAFA]">{title}</h2>
              {mode === 'edit' && card && (
                <p className="mt-1 text-xs text-[#525252]">
                  {roleLabel ? `${roleLabel}: ` : ''}
                  {isAdmin
                    ? 'edicao completa liberada.'
                    : 'voce pode comentar e concluir para revisao.'}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#525252] transition-colors hover:text-[#FAFAFA]"
            >
              x
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-6">
                <FormSection label="Identificacao">
                  <Field label="Titulo *">
                    <input
                      type="text"
                      value={form.title}
                      disabled={fieldDisabled('title')}
                      onChange={(event) => set('title', event.target.value)}
                      placeholder="Titulo do card"
                      autoFocus
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Tipo de conteudo">
                    <ChipSelector
                      options={contentTypeOptions}
                      value={form.contentType}
                      disabled={fieldDisabled('contentType')}
                      onChange={(value) => set('contentType', value)}
                    />
                  </Field>
                  <Field label="Plataforma">
                    <MultiChipSelector
                      options={platformOptions}
                      values={form.platforms}
                      disabled={fieldDisabled('platforms')}
                      onChange={(value) => set('platforms', value)}
                    />
                  </Field>
                </FormSection>

                <FormSection label="Execucao">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Field label="Responsavel">
                      <select
                        value={form.assignedUserId}
                        disabled={fieldDisabled('assignedUserId')}
                        onChange={(event) => set('assignedUserId', event.target.value)}
                        className={selectClass}
                      >
                        <option value="">Sem responsavel</option>
                        {users.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Deadline">
                      <input
                        type="date"
                        value={form.deadline}
                        disabled={fieldDisabled('deadline')}
                        onChange={(event) => set('deadline', event.target.value)}
                        className={`${inputClass} [color-scheme:dark]`}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Field label="Prioridade">
                      <select
                        value={form.priority}
                        disabled={fieldDisabled('priority')}
                        onChange={(event) => set('priority', event.target.value as Priority)}
                        className={selectClass}
                      >
                        {priorityOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select
                        value={form.status}
                        disabled={fieldDisabled('status')}
                        onChange={(event) => set('status', event.target.value as CardStatus)}
                        className={selectClass}
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Esforco">
                      <select
                        value={form.effort ?? ''}
                        disabled={fieldDisabled('effort')}
                        onChange={(event) => set('effort', (event.target.value as Effort) || null)}
                        className={selectClass}
                      >
                        <option value="">-</option>
                        {effortOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <Field label="Etapa de producao">
                    <ChipSelector
                      options={stageOptions}
                      value={form.stage}
                      disabled={fieldDisabled('stage')}
                      onChange={(value) => set('stage', value)}
                    />
                  </Field>
                </FormSection>

                <FormSection label="Estrategia">
                  <Field label="Objetivo">
                    <textarea
                      value={form.objective}
                      disabled={fieldDisabled('objective')}
                      onChange={(event) => set('objective', event.target.value)}
                      rows={2}
                      placeholder="O que esse conteudo precisa alcancar..."
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                  <Field label="CTA">
                    <input
                      type="text"
                      value={form.cta}
                      disabled={fieldDisabled('cta')}
                      onChange={(event) => set('cta', event.target.value)}
                      placeholder="Ex: Clique no link..."
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Direcao criativa">
                    <textarea
                      value={form.description}
                      disabled={fieldDisabled('description')}
                      onChange={(event) => set('description', event.target.value)}
                      rows={3}
                      placeholder="Contexto, tom, estetica e detalhes..."
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                </FormSection>

                <FormSection label="Referencias">
                  <Field label="Referencias e inspiracoes">
                    <textarea
                      value={form.references}
                      disabled={fieldDisabled('references')}
                      onChange={(event) => set('references', event.target.value)}
                      rows={2}
                      placeholder="Links, descricoes e exemplos..."
                      className={`${inputClass} resize-none`}
                    />
                  </Field>
                  <Field label="Link do Drive">
                    <input
                      type="text"
                      value={form.driveLink}
                      disabled={fieldDisabled('driveLink')}
                      onChange={(event) => set('driveLink', event.target.value)}
                      placeholder="https://drive.google.com/..."
                      className={inputClass}
                    />
                  </Field>
                </FormSection>

                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#2A2A2A] px-5 py-4 md:flex-row md:items-center md:justify-between">
              {canDelete ? (
                <div className="flex items-center gap-2">
                  {confirmingDelete ? (
                    <>
                      <span className="text-xs text-[#A3A3A3]">Confirmar exclusao?</span>
                      <button
                        type="button"
                        onClick={handleDeleteConfirmed}
                        disabled={saving}
                        className="text-xs font-medium text-red-400 transition-colors hover:text-red-300 disabled:opacity-50"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmingDelete(false)}
                        className="text-xs text-[#525252] transition-colors hover:text-[#A3A3A3]"
                      >
                        Cancelar
                      </button>
                    </>
                  ) : canDelete ? (
                    <button
                      type="button"
                      onClick={() => setConfirmingDelete(true)}
                      className="text-xs text-[#525252] transition-colors hover:text-red-400"
                    >
                      Excluir card
                    </button>
                  ) : null}
                </div>
              ) : (
                <div />
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm text-[#525252] transition-colors hover:text-[#A3A3A3]"
                >
                  {readOnly ? 'Fechar' : 'Cancelar'}
                </button>
                {canSubmitReview && (
                  <button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={submittingReview}
                    className="rounded-lg border border-[#BC0319] px-4 py-2 text-sm font-medium text-[#FAFAFA] transition-colors hover:bg-[#BC0319]/10 disabled:opacity-50"
                  >
                    {submittingReview ? 'Concluindo...' : 'Concluir'}
                  </button>
                )}
                {canSave && (
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#BC0319] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <aside className="flex min-h-0 w-full flex-col lg:w-[360px]">
          <div className="border-b border-[#2A2A2A] px-5 py-4">
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setSidebarTab('comments')}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  sidebarTab === 'comments'
                    ? 'bg-[#BC0319] text-white'
                    : 'bg-[#0D0D0D] text-[#A3A3A3] hover:text-[#FAFAFA]',
                ].join(' ')}
              >
                Comentarios
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('history')}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  sidebarTab === 'history'
                    ? 'bg-[#BC0319] text-white'
                    : 'bg-[#0D0D0D] text-[#A3A3A3] hover:text-[#FAFAFA]',
                ].join(' ')}
              >
                Historico
              </button>
            </div>
            <p className="text-xs text-[#525252]">
              {mode === 'edit'
                ? 'Observacoes, marcacoes e rastreio das alteracoes do job.'
                : 'Crie o card para liberar comentarios e historico.'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {mode !== 'edit' || !card ? (
              <p className="text-sm text-[#525252]">
                Comentarios e historico ficam disponiveis depois que o card e criado.
              </p>
            ) : sidebarTab === 'comments' ? (
              <div className="flex flex-col gap-5">
                {canComment && (
                  <form onSubmit={handleCommentSubmit} className="flex flex-col gap-3">
                    <textarea
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      rows={4}
                      placeholder="Deixe uma observacao e marque quem precisa ver isso..."
                      className={`${inputClass} resize-none`}
                    />
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#525252]">
                        Marcar usuarios
                      </span>
                      <MultiChipSelector
                        options={mentionOptions}
                        values={mentionUserIds}
                        onChange={setMentionUserIds}
                      />
                    </div>
                    {commentError && <p className="text-xs text-red-400">{commentError}</p>}
                    <button
                      type="submit"
                      disabled={commenting || !commentText.trim()}
                      className="w-full rounded-lg bg-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#FAFAFA] transition-colors hover:bg-[#222222] disabled:opacity-50"
                    >
                      {commenting ? 'Publicando...' : 'Publicar comentario'}
                    </button>
                  </form>
                )}

                {sidebarLoading ? (
                  <p className="text-sm text-[#525252]">Carregando comentarios...</p>
                ) : sidebarData.comments.length === 0 ? (
                  <p className="text-sm text-[#525252]">Nenhum comentario ainda.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {sidebarData.comments.map((comment) => {
                      const mentionNames = comment.mentionUserIds
                        .map((id) => users.find((item) => item.id === id)?.name)
                        .filter(Boolean) as string[]

                      return (
                        <div
                          key={comment.id}
                          className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] px-4 py-3"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-[#FAFAFA]">
                                {comment.author.name ?? comment.author.email ?? 'Usuario'}
                              </p>
                              <p className="text-[11px] text-[#525252]">
                                {formatDateTime(comment.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#A3A3A3]">
                            {comment.content}
                          </p>
                          {mentionNames.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {mentionNames.map((name) => (
                                <span
                                  key={`${comment.id}-${name}`}
                                  className="rounded-full border border-[#BC0319]/30 bg-[#BC0319]/10 px-2.5 py-1 text-[11px] text-[#F5B3BB]"
                                >
                                  @{name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : sidebarLoading ? (
              <p className="text-sm text-[#525252]">Carregando historico...</p>
            ) : sidebarData.history.length === 0 ? (
              <p className="text-sm text-[#525252]">Nenhuma alteracao registrada ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {sidebarData.history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] px-4 py-3"
                  >
                    <p className="text-sm leading-relaxed text-[#A3A3A3]">{item.message}</p>
                    <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-[#525252]">
                      <span>{item.user?.name ?? 'Sistema'}</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
