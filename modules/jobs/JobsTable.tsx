'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuthenticatedUser } from '@/modules/auth/useAuthenticatedUser'
import type { JobCard } from './jobTypes'

const JobReadModal = dynamic(() => import('./JobReadModal'), { ssr: false })

const statusConfig = {
  TODO: { label: 'A fazer', dotClassName: 'bg-white' },
  IN_PROGRESS: { label: 'Em andamento', dotClassName: 'bg-blue-400' },
  IN_REVIEW: { label: 'Em revisao', dotClassName: 'bg-amber-400' },
  DONE: { label: 'Concluido', dotClassName: 'bg-emerald-400' },
} as const

const contentTypeLabels = {
  POST: 'Post',
  STORY: 'Story',
  REELS: 'Reels',
  CAROUSEL: 'Carrossel',
  ADS: 'Ads',
} as const

function formatDeadline(deadline: string): { label: string; className: string } {
  const date = new Date(deadline)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  if (diffDays < 0) return { label: `! ${label}`, className: 'text-red-400 font-medium' }
  if (diffDays <= 3) return { label, className: 'text-amber-400' }
  return { label, className: 'text-[#525252]' }
}

type JobTableCard = JobCard

type FilterMode = 'mine' | 'all' | 'done'

const TAB_LABELS: Record<FilterMode, string> = {
  mine: 'Minha Pauta',
  all: 'Todos',
  done: 'Concluídos',
}

function filterCards(cards: JobTableCard[], filter: FilterMode, userId: string | undefined): JobTableCard[] {
  if (filter === 'mine') return cards.filter((card) => card.status !== 'DONE' && card.assignedUserId === userId)
  if (filter === 'all') return cards.filter((card) => card.status !== 'DONE')
  return cards.filter((card) => card.status === 'DONE')
}

function sortForDisplay(cards: JobTableCard[], filter: FilterMode): JobTableCard[] {
  if (filter === 'done') {
    return [...cards].sort((a, b) => String(b.deadline ?? '').localeCompare(String(a.deadline ?? '')))
  }
  return [...cards].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  })
}

type Props = { cards: JobTableCard[] }

export default function JobsTable({ cards: initialCards }: Props) {
  const user = useAuthenticatedUser()
  const isOwner = user?.role === 'OWNER'
  const [cards] = useState(initialCards)
  const [filter, setFilter] = useState<FilterMode>('mine')
  const [selectedCard, setSelectedCard] = useState<JobTableCard | null>(null)

  const filteredCards = filterCards(cards, filter, user?.id)
  const sortedCards = sortForDisplay(filteredCards, filter)

  const visibleTabs: FilterMode[] = isOwner ? ['mine', 'all', 'done'] : ['mine', 'done']

  return (
    <div>
      <div className="mb-6 flex w-fit gap-1 rounded-lg border border-[#2A2A2A] p-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={[
              'rounded-md px-5 py-2 text-sm font-medium transition-colors duration-150',
              filter === tab
                ? 'bg-[#1A1A1A] text-[#FAFAFA]'
                : 'text-[#525252] hover:text-[#A3A3A3]',
            ].join(' ')}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {sortedCards.length === 0 ? (
        <p className="py-16 text-center text-base text-[#525252]">Nenhum card encontrado</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#1A1A1A]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0D0D0D]">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
                  Job / Etapa
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
                  Prazo
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
                  Cliente
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
                  Tipo
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {sortedCards.map((card) => {
                const status = statusConfig[card.status]
                const deadline = card.deadline ? formatDeadline(String(card.deadline)) : null

                return (
                  <tr
                    key={card.id}
                    onClick={() => setSelectedCard(card)}
                    className="cursor-pointer transition-colors hover:bg-[#0D0D0D]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-[#FAFAFA]">{card.title}</span>
                        <span className="text-xs text-[#525252]">
                          {card.column.board.name} / {card.column.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {deadline ? (
                        <span className={`text-sm font-medium ${deadline.className}`}>
                          {deadline.label}
                        </span>
                      ) : (
                        <span className="text-sm text-[#2A2A2A]">-</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-[#A3A3A3]">{card.column.board.client.name}</span>
                    </td>

                    <td className="px-5 py-4">
                      {card.contentType ? (
                        <span className="rounded-md bg-[#1A1A1A] px-2.5 py-1 text-xs font-semibold text-[#A3A3A3]">
                          {contentTypeLabels[card.contentType]}
                        </span>
                      ) : (
                        <span className="text-sm text-[#2A2A2A]">-</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${status.dotClassName}`} />
                        <span className="text-sm text-[#A3A3A3]">{status.label}</span>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedCard && <JobReadModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  )
}
