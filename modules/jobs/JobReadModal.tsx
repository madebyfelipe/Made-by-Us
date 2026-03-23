'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ClientStrategicProfile from '@/modules/clients/ClientStrategicProfile'
import type { JobCard } from './jobTypes'

type Props = {
  card: JobCard
  onClose: () => void
}

type Tab = 'details' | 'briefing'

const priorityLabels = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
} as const

const statusLabels = {
  TODO: 'A fazer',
  IN_PROGRESS: 'Em andamento',
  IN_REVIEW: 'Em revisao',
  DONE: 'Concluido',
} as const

const effortLabels = {
  LOW: 'Baixo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
} as const

const stageLabels = {
  ROTEIRO: 'Roteiro',
  DESIGN: 'Design',
  EDICAO: 'Edicao',
  REVISAO: 'Revisao',
  APROVACAO: 'Aprovacao',
} as const

const contentTypeLabels = {
  POST: 'Post',
  STORY: 'Story',
  REELS: 'Reels',
  CAROUSEL: 'Carrossel',
  ADS: 'Ads',
} as const

function formatDisplayDate(date: string | null, includeTime = false): string {
  if (!date) return 'Sem prazo'

  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

function formatPlatforms(platforms: string): string {
  if (!platforms.trim()) return 'Nao informado'

  return platforms
    .split(',')
    .map((platform) => platform.trim())
    .filter(Boolean)
    .map((platform) => platform.charAt(0).toUpperCase() + platform.slice(1))
    .join(', ')
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#525252]">
        {label}
      </span>
      <span className="text-sm leading-relaxed text-[#FAFAFA]">{value}</span>
    </div>
  )
}

function LongTextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] px-4 py-4">
      <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-[#525252]">
        {label}
      </span>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#A3A3A3]">
        {value.trim() || 'Nao informado'}
      </p>
    </div>
  )
}

export default function JobReadModal({ card, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('details')

  const detailRows = useMemo(
    () => [
      { label: 'Cliente', value: card.column.board.client.name },
      { label: 'Board', value: card.column.board.name },
      { label: 'Coluna', value: card.column.name },
      { label: 'Status', value: statusLabels[card.status] },
      { label: 'Prioridade', value: priorityLabels[card.priority] },
      { label: 'Etapa', value: card.stage ? stageLabels[card.stage] : 'Nao informada' },
      { label: 'Prazo', value: formatDisplayDate(card.deadline) },
      { label: 'Responsavel', value: card.assignedUser?.name ?? 'Sem responsavel' },
      {
        label: 'Tipo de conteudo',
        value: card.contentType ? contentTypeLabels[card.contentType] : 'Nao informado',
      },
      { label: 'Plataformas', value: formatPlatforms(card.platform) },
      { label: 'Esforco', value: card.effort ? effortLabels[card.effort] : 'Nao informado' },
      { label: 'Ultima atualizacao', value: formatDisplayDate(card.updatedAt, true) },
    ],
    [card],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#2A2A2A] px-6 py-5">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#BC0319]">
              Job
            </p>
            <h2 className="text-xl font-semibold text-[#FAFAFA]">{card.title}</h2>
            <p className="mt-2 text-sm text-[#A3A3A3]">
              {card.column.board.client.name} / {card.column.board.name} / {card.column.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-[#525252] transition-colors hover:text-[#FAFAFA]"
          >
            x
          </button>
        </div>

        <div className="border-b border-[#1A1A1A] px-6 py-3">
          <div className="flex gap-2">
            {[
              { id: 'details', label: 'Detalhes' },
              { id: 'briefing', label: 'Briefing do cliente' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as Tab)}
                className={[
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-[#BC0319] text-white'
                    : 'bg-[#0D0D0D] text-[#A3A3A3] hover:text-[#FAFAFA]',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {activeTab === 'details' ? (
            <div className="flex flex-col gap-5">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {detailRows.map((row) => (
                  <DetailRow key={row.label} label={row.label} value={row.value} />
                ))}
              </div>

              <LongTextBlock label="CTA" value={card.cta} />
              <LongTextBlock label="Objetivo" value={card.objective} />
              <LongTextBlock label="Descricao" value={card.description} />
              <LongTextBlock label="Referencias" value={card.references} />
              <LongTextBlock label="Drive" value={card.driveLink} />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#A3A3A3]">
                Briefing preenchido no perfil do cliente para orientar a producao deste job.
              </p>
              <ClientStrategicProfile profile={card.column.board.client} compact />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-6 py-4">
          <Link
            href={`/boards/${card.column.board.id}`}
            className="rounded-lg border border-[#2A2A2A] px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:border-[#BC0319] hover:text-[#FAFAFA]"
          >
            Abrir board
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#BC0319] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#A30215]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
