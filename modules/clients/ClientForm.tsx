'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormData = {
  name: string
  description: string
  niche: string
  toneOfVoice: string
  mainObjective: string
  platforms: string[]
  contentFrequency: string
  targetAudience: string
  restrictions: string
  differentials: string
  operationalGuidelines: string
  customHtml: string
}

type Props = {
  mode: 'create' | 'edit'
  clientId?: string
  initialData?: Partial<Omit<FormData, 'platforms'>> & { platforms?: string[] | string }
}

const PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
]

const defaultForm: FormData = {
  name: '',
  description: '',
  niche: '',
  toneOfVoice: '',
  mainObjective: '',
  platforms: [],
  contentFrequency: '',
  targetAudience: '',
  restrictions: '',
  differentials: '',
  operationalGuidelines: '',
  customHtml: '',
}

const inputClass =
  'rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#525252] outline-none focus:border-[#BC0319] transition-colors'

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#BC0319]">{label}</p>
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

function MultiChip({
  options,
  values,
  onChange,
}: {
  options: { value: string; label: string }[]
  values: string[]
  onChange: (values: string[]) => void
}) {
  function toggle(val: string) {
    onChange(values.includes(val) ? values.filter((v) => v !== val) : [...values, val])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={[
            'rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
            values.includes(opt.value)
              ? 'bg-[#BC0319] text-white'
              : 'border border-[#2A2A2A] bg-[#0A0A0A] text-[#525252] hover:border-[#3A3A3A] hover:text-[#A3A3A3]',
          ].join(' ')}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function buildInitialForm(
  initial: Partial<Omit<FormData, 'platforms'>> & { platforms?: string[] | string },
): FormData {
  return {
    ...defaultForm,
    ...initial,
    platforms:
      typeof initial.platforms === 'string'
        ? (initial.platforms as string).split(',').filter(Boolean)
        : (initial.platforms ?? []),
  }
}

export default function ClientForm({ mode, clientId, initialData = {} }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(() => buildInitialForm(initialData))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Nome é obrigatório')

    setSaving(true)
    setError(null)

    const payload = { ...form, platforms: form.platforms.join(',') }

    try {
      const url = mode === 'create' ? '/api/clients' : `/api/clients/${clientId}`
      const method = mode === 'create' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Erro ao salvar cliente')

      router.push(`/clients/${mode === 'create' ? data.id : clientId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">

      {/* ─── Identidade ─── */}
      <FormSection label="Identidade">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Nome do cliente"
              autoFocus
              className={inputClass}
            />
          </Field>
          <Field label="Nicho">
            <input
              type="text"
              value={form.niche}
              onChange={(e) => set('niche', e.target.value)}
              placeholder="Ex: Contabilidade B2B, Moda feminina..."
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Descrição curta">
          <input
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Uma linha sobre o cliente"
            className={inputClass}
          />
        </Field>
        <Field label="Tom de voz">
          <input
            type="text"
            value={form.toneOfVoice}
            onChange={(e) => set('toneOfVoice', e.target.value)}
            placeholder="Ex: Direto e técnico, Descontraído e próximo..."
            className={inputClass}
          />
        </Field>
      </FormSection>

      {/* ─── Estratégia ─── */}
      <FormSection label="Estratégia">
        <Field label="Objetivo principal">
          <textarea
            value={form.mainObjective}
            onChange={(e) => set('mainObjective', e.target.value)}
            rows={2}
            placeholder="O que esse cliente precisa alcançar com o conteúdo..."
            className={`${inputClass} resize-none`}
          />
        </Field>
        <Field label="Público-alvo">
          <input
            type="text"
            value={form.targetAudience}
            onChange={(e) => set('targetAudience', e.target.value)}
            placeholder="Ex: Donos de pequenas empresas, 30–50 anos, Sul e Sudeste"
            className={inputClass}
          />
        </Field>
        <Field label="Plataformas">
          <MultiChip
            options={PLATFORM_OPTIONS}
            values={form.platforms}
            onChange={(v) => set('platforms', v)}
          />
        </Field>
        <Field label="Frequência de conteúdo">
          <input
            type="text"
            value={form.contentFrequency}
            onChange={(e) => set('contentFrequency', e.target.value)}
            placeholder="Ex: 3 posts + 5 stories por semana"
            className={inputClass}
          />
        </Field>
      </FormSection>

      {/* ─── Operacional ─── */}
      <FormSection label="Operacional">
        <Field label="Diferenciais">
          <textarea
            value={form.differentials}
            onChange={(e) => set('differentials', e.target.value)}
            rows={2}
            placeholder="O que diferencia esse cliente da concorrência..."
            className={`${inputClass} resize-none`}
          />
        </Field>
        <Field label="Restrições">
          <textarea
            value={form.restrictions}
            onChange={(e) => set('restrictions', e.target.value)}
            rows={2}
            placeholder="Assuntos, palavras ou abordagens a evitar..."
            className={`${inputClass} resize-none`}
          />
        </Field>
        <Field label="Diretrizes operacionais">
          <textarea
            value={form.operationalGuidelines}
            onChange={(e) => set('operationalGuidelines', e.target.value)}
            rows={3}
            placeholder="Processos, aprovações, contatos, observações gerais..."
            className={`${inputClass} resize-none`}
          />
        </Field>
      </FormSection>

      {/* ─── Perfil HTML ─── */}
      <FormSection label="Perfil HTML (opcional)">
        <Field label="HTML customizado">
          <textarea
            value={form.customHtml}
            onChange={(e) => set('customHtml', e.target.value)}
            rows={10}
            placeholder="<h1>Conteúdo personalizado...</h1>"
            className={`${inputClass} resize-y font-mono text-xs`}
            spellCheck={false}
          />
        </Field>
      </FormSection>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#BC0319] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-[#525252] transition-colors hover:text-[#A3A3A3]"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
