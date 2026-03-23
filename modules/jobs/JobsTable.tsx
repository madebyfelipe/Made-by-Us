'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useAuthenticatedUser } from '@/modules/auth/useAuthenticatedUser'
import type { JobCard } from './jobTypes'

const JobReadModal = dynamic(() => import('@/modules/jobs/JobReadModal'), { ssr: false })

const statusConfig = {
  TODO: { label: 'A fazer', dotClassName: 'bg-[#525252]' },
  IN_PROGRESS: { label: 'Em andamento', dotClassName: 'bg-amber-400' },
  IN_REVIEW: { label: 'Em revisao', dotClassName: 'bg-blue-400' },
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

type Props = { cards: JobCard[] }

export default function JobsTable({ cards: initialCards }: Props) {
  const user = useAuthenticatedUser()
  const isOwner = user?.role === 'OWNER'
  const [filter, setFilter] = useState<'mine' | 'all'>('mine')
  const [selectedCard, setSelectedCard] = useState<JobCard | null>(null)

  const visibleCards =
    filter === 'mine'
      ? initialCards.filter((card) => card.assignedUserId === user?.id)
      : initialCards

  const sortedCards = [
    ...visibleCards
      .filter((card) => card.status !== 'DONE')
      .sort((firstCard, secondCard) => {
        if (!firstCard.deadline && !secondCard.deadline) return 0
        if (!firstCard.deadline) return 1
        if (!secondCard.deadline) return -1

        return new Date(firstCard.deadline).getTime() - new Date(secondCard.deadline).getTime()
      }),
    ...visibleCards
      .filter((card) => card.status === 'DONE')
      .sort((firstCard, secondCard) =>
        (secondCard.deadline ?? '').localeCompare(firstCard.deadline ?? ''),
      ),
  ]

  return (
    <div>
      {isOwner && (
        <div className="mb-6 flex w-fit gap-1 rounded-lg border border-[#2A2A2A] p-1">
          {(['mine', 'all'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={[
                'rounded-md px-5 py-2 text-sm font-medium transition-colors duration-150',
                filter === option
                  ? 'bg-[#1A1A1A] text-[#FAFAFA]'
                  : 'text-[#525252] hover:text-[#A3A3A3]',
              ].join(' ')}
            >
              {option === 'mine' ? 'Minha Pauta' : 'Todos'}
            </button>
          ))}
        </div>
      )}

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
                const deadline = card.deadline ? formatDeadline(card.deadline) : null

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
                        <span className={`h-2 w-2 rounded-full ${status.dotClassName}`} />
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
