'use client'

import { useState } from 'react'
import { parseCardTemplate, type ParsedCard } from './parseCardTemplate'
import type { CardWithAssignedUser } from '@/types'

type Column = { id: string; name: string }

type Props = {
  columns: Column[]
  onClose: () => void
  onCardsCreated: (cards: CardWithAssignedUser[]) => void
}

type Step = 'input' | 'review'

const priorityLabels: Record<string, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

const priorityColors: Record<string, string> = {
  LOW: 'text-[#525252]',
  MEDIUM: 'text-blue-400',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400',
}

const contentTypeLabels: Record<string, string> = {
  POST: 'Post',
  STORY: 'Story',
  REELS: 'Reels',
  CAROUSEL: 'Carrossel',
  ADS: 'Ads',
}

const TEMPLATE_HINT =
  'Campos aceitos: titulo, tipo de conteudo, plataformas, status, prioridade, etapa de producao, esforco, prazo, objetivo, cta, descricao, referencias, link do drive.'

const PLACEHOLDER = `titulo: Post de lancamento do produto X
tipo de conteudo: post
plataformas: instagram, linkedin
status: em andamento
prioridade: alta
etapa de producao: design
esforco: medio
prazo: 2026-04-10
objetivo: Apresentar o produto para a audiencia e gerar cliques.
cta: Compre agora com 20% de desconto
descricao: Visual clean, fundo claro, copy direta e foco em beneficios.
referencias: https://exemplo.com/ref1
link do drive: https://drive.google.com/...

---

titulo: Story de bastidores - semana 14
tipo de conteudo: story
plataformas: instagram, tiktok
status: todo
prioridade: media
objetivo: Aproximar a marca do publico com conteudo humanizado.
descricao: Mostrar rotina de producao com tom espontaneo.
referencias: Bastidores da gravacao de quinta-feira`

export default function QuickCreateModal({ columns, onClose, onCardsCreated }: Props) {
  const [step, setStep] = useState<Step>('input')
  const [text, setText] = useState('')
  const [parsedCards, setParsedCards] = useState<ParsedCard[]>([])
  const [selectedColumnId, setSelectedColumnId] = useState(columns[0]?.id ?? '')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  function handleParse() {
    setParseError(null)

    const cards = parseCardTemplate(text)
    if (cards.length === 0) {
      setParseError('Nenhum card encontrado. Verifique se o texto tem pelo menos "titulo: ...".')
      return
    }

    setParsedCards(cards)
    setStep('review')
  }

  async function handleCreate() {
    if (!selectedColumnId) return

    setIsCreating(true)
    setError(null)

    const createdCards: CardWithAssignedUser[] = []

    try {
      for (const card of parsedCards) {
        const response = await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: card.title,
            objective: card.objective,
            description: card.description,
            references: card.references,
            driveLink: card.driveLink,
            cta: card.cta,
            priority: card.priority,
            status: card.status,
            contentType: card.contentType,
            platform: card.platforms.join(','),
            effort: card.effort,
            stage: card.stage,
            deadline: card.deadline || null,
            columnId: selectedColumnId,
            order: 9999,
            assignedUserId: null,
          }),
        })

        if (!response.ok) {
          throw new Error(`Erro ao criar card "${card.title}"`)
        }

        createdCards.push(await response.json())
      }

      onCardsCreated(createdCards)
      onClose()
    } catch (creationError) {
      setError(creationError instanceof Error ? creationError.message : 'Erro ao criar cards')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="flex w-full max-w-2xl flex-col rounded-xl border border-[#2A2A2A] bg-[#141414] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#2A2A2A] px-5 py-4">
          <div>
            <h2 className="text-sm font-medium text-[#FAFAFA]">Criar cards por texto</h2>
            <p className="mt-0.5 text-xs text-[#525252]">
              {step === 'input'
                ? 'Use o template abaixo e separe multiplos cards com ---'
                : `${parsedCards.length} ${parsedCards.length === 1 ? 'card identificado' : 'cards identificados'} - revise antes de criar`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#525252] transition-colors hover:text-[#FAFAFA]"
          >
            x
          </button>
        </div>

        {step === 'input' ? (
          <div className="flex flex-col gap-4 p-5">
            <div className="rounded-lg border border-[#1A1A1A] bg-[#0D0D0D] px-4 py-3 text-xs leading-relaxed text-[#A3A3A3]">
              {TEMPLATE_HINT}
            </div>

            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={PLACEHOLDER}
              rows={16}
              autoFocus
              className="w-full resize-none rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-3 font-mono text-xs text-[#FAFAFA] placeholder-[#3A3A3A] outline-none transition-colors focus:border-[#BC0319]"
            />
            {parseError && <p className="text-xs text-red-400">{parseError}</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3 overflow-y-auto p-5" style={{ maxHeight: '420px' }}>
            {parsedCards.map((card, index) => (
              <div
                key={`${card.title}-${index}`}
                className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-[#FAFAFA]">{card.title}</p>
                  <div className="flex shrink-0 items-center gap-2">
                    {card.contentType && (
                      <span className="rounded bg-[#1A1A1A] px-1.5 py-0.5 text-[10px] text-[#525252]">
                        {contentTypeLabels[card.contentType]}
                      </span>
                    )}
                    <span className={`text-xs font-medium ${priorityColors[card.priority]}`}>
                      {priorityLabels[card.priority]}
                    </span>
                  </div>
                </div>

                {card.objective && (
                  <p className="text-xs text-[#A3A3A3]">
                    <span className="text-[#525252]">Objetivo: </span>
                    {card.objective}
                  </p>
                )}

                {(card.platforms.length > 0 || card.deadline) && (
                  <p className="mt-0.5 text-xs text-[#525252]">
                    {card.platforms.join(', ')}
                    {card.platforms.length > 0 && card.deadline ? ' · ' : ''}
                    {card.deadline}
                  </p>
                )}
              </div>
            ))}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-5 py-4">
          {step === 'review' ? (
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#525252]">Coluna</label>
              <select
                value={selectedColumnId}
                onChange={(event) => setSelectedColumnId(event.target.value)}
                className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-1.5 text-xs text-[#FAFAFA] outline-none focus:border-[#BC0319]"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 'review' && (
              <button
                type="button"
                onClick={() => setStep('input')}
                className="rounded-lg px-4 py-2 text-sm text-[#525252] transition-colors hover:text-[#A3A3A3]"
              >
                Voltar
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-[#525252] transition-colors hover:text-[#A3A3A3]"
            >
              Cancelar
            </button>
            {step === 'input' ? (
              <button
                type="button"
                onClick={handleParse}
                disabled={!text.trim()}
                className="rounded-lg bg-[#BC0319] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-40"
              >
                Processar texto
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="rounded-lg bg-[#BC0319] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-40"
              >
                {isCreating
                  ? 'Criando...'
                  : `Criar ${parsedCards.length} ${parsedCards.length === 1 ? 'card' : 'cards'}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
