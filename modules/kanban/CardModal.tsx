'use client'

import { useState, useEffect } from 'react'
import type {
  CardWithAssignedUser,
  Priority,
  CardStatus,
  ContentType,
  Effort,
  ProductionStage,
} from '@/types'

type UserOption = { id: string; name: string }

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
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'URGENT', label: 'Urgente' },
]

const statusOptions: { value: CardStatus; label: string }[] = [
  { value: 'TODO', label: 'A fazer' },
  { value: 'IN_PROGRESS', label: 'Em progresso' },
  { value: 'IN_REVIEW', label: 'Em revisão' },
  { value: 'DONE', label: 'Concluído' },
]

const effortOptions: { value: Effort; label: string }[] = [
  { value: 'LOW', label: 'Baixo' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'HIGH', label: 'Alto' },
]

const stageOptions: { value: ProductionStage; label: string }[] = [
  { value: 'ROTEIRO', label: 'Roteiro' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'EDICAO', label: 'Edição' },
  { value: 'REVISAO', label: 'Revisão' },
  { value: 'APROVACAO', label: 'Aprovação' },
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
}: {
  options: ChipOption<T>[]
  value: T | null
  onChange: (value: T | null) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(value === option.value ? null : option.value)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
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
}: {
  options: { value: string; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
}) {
  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => toggle(option.value)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
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

function buildInitialForm(card: CardWithAssignedUser | null): FormState {
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
    platforms: card.platform ? card.platform.split(',') : [],
    effort: card.effort ?? null,
    stage: card.stage ?? null,
    deadline: toDateInputValue(card.deadline),
    assignedUserId: card.assignedUserId ?? '',
  }
}

type Props = {
  mode: 'create' | 'edit'
  columnId: string
  card: CardWithAssignedUser | null
  readOnly?: boolean
  onClose: () => void
  onCardCreated: (card: CardWithAssignedUser) => void
  onCardUpdated: (card: CardWithAssignedUser) => void
  onCardDeleted: (cardId: string) => void
}

const inputClass =
  'rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#525252] outline-none focus:border-[#BC0319] transition-colors'

const selectClass =
  'rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA] outline-none focus:border-[#BC0319] transition-colors'

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
  const [form, setForm] = useState<FormState>(() => buildInitialForm(mode === 'edit' ? card : null))
  const [users, setUsers] = useState<UserOption[]>([])
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.json())
      .then(setUsers)
      .catch(() => {})
  }, [])

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function buildPayload() {
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
    if (readOnly) return
    if (!form.title.trim()) return setError('Título é obrigatório')

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
        onCardUpdated(updateData as CardWithAssignedUser)
      }
      onClose()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteConfirmed() {
    if (readOnly) return

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

  const title =
    readOnly ? 'Visualizar card' : mode === 'create' ? 'Novo card' : 'Editar card'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex w-full max-w-xl flex-col rounded-xl border border-[#2A2A2A] bg-[#141414] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-5 py-4">
          <h2 className="text-sm font-medium text-[#FAFAFA]">{title}</h2>
          <button onClick={onClose} className="text-[#525252] transition-colors hover:text-[#FAFAFA]">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={readOnly} className="border-0 p-0">
            <div className="flex max-h-[72vh] flex-col gap-6 overflow-y-auto px-5 py-5">
              <FormSection label="Identificação">
                <Field label="Título *">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) => set('title', event.target.value)}
                    placeholder="Título do card"
                    autoFocus
                    className={inputClass}
                  />
                </Field>
                <Field label="Tipo de conteúdo">
                  <ChipSelector
                    options={contentTypeOptions}
                    value={form.contentType}
                    onChange={(value) => set('contentType', value)}
                  />
                </Field>
                <Field label="Plataforma">
                  <MultiChipSelector
                    options={platformOptions}
                    values={form.platforms}
                    onChange={(value) => set('platforms', value)}
                  />
                </Field>
              </FormSection>

              <FormSection label="Execução">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Responsável">
                    <select
                      value={form.assignedUserId}
                      onChange={(event) => set('assignedUserId', event.target.value)}
                      className={selectClass}
                    >
                      <option value="">Sem responsável</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Deadline">
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(event) => set('deadline', event.target.value)}
                      className={`${inputClass} [color-scheme:dark]`}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Prioridade">
                    <select
                      value={form.priority}
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
                  <Field label="Esforço">
                    <select
                      value={form.effort ?? ''}
                      onChange={(event) => set('effort', (event.target.value as Effort) || null)}
                      className={selectClass}
                    >
                      <option value="">—</option>
                      {effortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Etapa de produção">
                  <ChipSelector
                    options={stageOptions}
                    value={form.stage}
                    onChange={(value) => set('stage', value)}
                  />
                </Field>
              </FormSection>

              <FormSection label="Estratégia">
                <Field label="Objetivo">
                  <textarea
                    value={form.objective}
                    onChange={(event) => set('objective', event.target.value)}
                    rows={2}
                    placeholder="O que esse conteúdo precisa alcançar..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>
                <Field label="CTA (call to action)">
                  <input
                    type="text"
                    value={form.cta}
                    onChange={(event) => set('cta', event.target.value)}
                    placeholder="Ex: Arraste para cima, Clique no link..."
                    className={inputClass}
                  />
                </Field>
                <Field label="Direção criativa">
                  <textarea
                    value={form.description}
                    onChange={(event) => set('description', event.target.value)}
                    rows={3}
                    placeholder="Contexto, tom, estética, detalhes de execução..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>
              </FormSection>

              <FormSection label="Referências">
                <Field label="Referências e inspirações">
                  <textarea
                    value={form.references}
                    onChange={(event) => set('references', event.target.value)}
                    rows={2}
                    placeholder="Links, descrições, exemplos..."
                    className={`${inputClass} resize-none`}
                  />
                </Field>
                <Field label="Link do Drive">
                  <input
                    type="text"
                    value={form.driveLink}
                    onChange={(event) => set('driveLink', event.target.value)}
                    placeholder="https://drive.google.com/..."
                    className={inputClass}
                  />
                </Field>
              </FormSection>

              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
          </fieldset>

          <div className="flex items-center justify-between border-t border-[#2A2A2A] px-5 py-4">
            {!readOnly && mode === 'edit' ? (
              <div className="flex items-center gap-2">
                {confirmingDelete ? (
                  <>
                    <span className="text-xs text-[#A3A3A3]">Confirmar exclusão?</span>
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
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="text-xs text-[#525252] transition-colors hover:text-red-400"
                  >
                    Excluir card
                  </button>
                )}
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-[#525252] transition-colors hover:text-[#A3A3A3]"
              >
                {readOnly ? 'Fechar' : 'Cancelar'}
              </button>
              {!readOnly && (
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
    </div>
  )
}
