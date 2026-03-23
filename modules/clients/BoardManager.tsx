'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Board, Column, Card } from '@/types'

type BoardWithCardCount = Board & {
  columns: (Column & { cards: Pick<Card, 'id'>[] })[]
}

type Props = {
  clientId: string
  initialBoards: BoardWithCardCount[]
  readOnly?: boolean
}

type EditingState =
  | { type: 'none' }
  | { type: 'creating' }
  | { type: 'renaming'; boardId: string; currentName: string }

function countCards(board: BoardWithCardCount): number {
  return (board.columns ?? []).reduce((sum, col) => sum + (col.cards?.length ?? 0), 0)
}

export default function BoardManager({
  clientId,
  initialBoards,
  readOnly = false,
}: Props) {
  const router = useRouter()
  const [boards, setBoards] = useState(initialBoards)
  const [editing, setEditing] = useState<EditingState>({ type: 'none' })
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function startCreating() {
    if (readOnly) return
    setNameInput('')
    setError(null)
    setEditing({ type: 'creating' })
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function startRenaming(board: BoardWithCardCount) {
    if (readOnly) return
    setNameInput(board.name)
    setError(null)
    setEditing({ type: 'renaming', boardId: board.id, currentName: board.name })
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function cancelEditing() {
    setEditing({ type: 'none' })
    setNameInput('')
    setError(null)
  }

  async function createBoard() {
    const name = nameInput.trim()
    if (!name || readOnly) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, clientId }),
      })

      if (!response.ok) throw new Error('Erro ao criar board')

      const newBoard = await response.json()
      const normalizedBoard: BoardWithCardCount = { ...newBoard, columns: newBoard.columns ?? [] }
      setBoards((prev) => [normalizedBoard, ...prev])
      setEditing({ type: 'none' })
      setNameInput('')
      router.refresh()
    } catch {
      setError('Não foi possível criar o board.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function renameBoard(boardId: string) {
    const name = nameInput.trim()
    if (!name || readOnly) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) throw new Error('Erro ao renomear board')

      setBoards((prev) => prev.map((board) => (board.id === boardId ? { ...board, name } : board)))
      setEditing({ type: 'none' })
      setNameInput('')
    } catch {
      setError('Não foi possível renomear o board.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function deleteBoard(boardId: string) {
    if (readOnly) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/boards/${boardId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Erro ao excluir board')

      setBoards((prev) => prev.filter((board) => board.id !== boardId))
      setPendingDeleteId(null)
      router.refresh()
    } catch {
      setError('Não foi possível excluir o board.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent, action: () => void) {
    if (event.key === 'Enter') action()
    if (event.key === 'Escape') cancelEditing()
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-widest text-[#525252]">Boards</h2>
        {!readOnly && (
          <button
            onClick={startCreating}
            className="rounded-lg bg-[#BC0319] px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 hover:bg-[#D4031E]"
          >
            + Novo board
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

      <div className="flex flex-wrap gap-3">
        {!readOnly && editing.type === 'creating' && (
          <div className="flex w-52 flex-col gap-3 rounded-xl border border-[#BC0319] bg-[#141414] p-4">
            <input
              ref={inputRef}
              value={nameInput}
              onChange={(event) => setNameInput(event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, createBoard)}
              placeholder="Nome do board"
              className="w-full rounded border border-[#2A2A2A] bg-[#0A0A0A] px-2 py-1.5 text-sm text-[#FAFAFA] placeholder-[#525252] outline-none focus:border-[#BC0319]"
            />
            <div className="flex gap-2">
              <button
                onClick={createBoard}
                disabled={isSubmitting || !nameInput.trim()}
                className="flex-1 rounded bg-[#BC0319] py-1 text-xs font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-40"
              >
                {isSubmitting ? 'Criando…' : 'Criar'}
              </button>
              <button
                onClick={cancelEditing}
                className="flex-1 rounded border border-[#2A2A2A] py-1 text-xs text-[#525252] transition-colors hover:text-[#A3A3A3]"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {boards.map((board) => {
          const cardCount = countCards(board)
          const isRenaming = editing.type === 'renaming' && editing.boardId === board.id
          const isConfirmingDelete = pendingDeleteId === board.id

          if (!readOnly && isRenaming) {
            return (
              <div
                key={board.id}
                className="flex w-52 flex-col gap-3 rounded-xl border border-[#BC0319] bg-[#141414] p-4"
              >
                <input
                  ref={inputRef}
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, () => renameBoard(board.id))}
                  className="w-full rounded border border-[#2A2A2A] bg-[#0A0A0A] px-2 py-1.5 text-sm text-[#FAFAFA] outline-none focus:border-[#BC0319]"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => renameBoard(board.id)}
                    disabled={isSubmitting || !nameInput.trim()}
                    className="flex-1 rounded bg-[#BC0319] py-1 text-xs font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-40"
                  >
                    {isSubmitting ? 'Salvando…' : 'Salvar'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="flex-1 rounded border border-[#2A2A2A] py-1 text-xs text-[#525252] transition-colors hover:text-[#A3A3A3]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )
          }

          if (!readOnly && isConfirmingDelete) {
            return (
              <div
                key={board.id}
                className="flex w-52 flex-col gap-3 rounded-xl border border-red-900 bg-[#141414] p-4"
              >
                <p className="text-xs text-[#A3A3A3]">
                  Excluir <span className="font-medium text-[#FAFAFA]">{board.name}</span>?
                  Todos os cards serão removidos.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteBoard(board.id)}
                    disabled={isSubmitting}
                    className="flex-1 rounded bg-red-900 py-1 text-xs font-medium text-red-200 transition-colors hover:bg-red-800 disabled:opacity-40"
                  >
                    {isSubmitting ? 'Excluindo…' : 'Excluir'}
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(null)}
                    className="flex-1 rounded border border-[#2A2A2A] py-1 text-xs text-[#525252] transition-colors hover:text-[#A3A3A3]"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={board.id}
              className="group relative flex w-52 flex-col gap-2 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4 transition-all duration-150 hover:border-[#3A3A3A] hover:bg-[#1A1A1A]"
            >
              <Link href={`/boards/${board.id}`} className="flex flex-1 flex-col gap-2">
                <span className="text-sm font-medium text-[#FAFAFA]">{board.name}</span>
                <span className="text-xs text-[#525252]">
                  {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                </span>
              </Link>

              {!readOnly && (
                <div className="mt-1 flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <button
                    onClick={() => startRenaming(board)}
                    title="Renomear"
                    className="rounded px-2 py-0.5 text-[10px] text-[#525252] transition-colors hover:bg-[#2A2A2A] hover:text-[#A3A3A3]"
                  >
                    Renomear
                  </button>
                  <button
                    onClick={() => setPendingDeleteId(board.id)}
                    title="Excluir"
                    className="rounded px-2 py-0.5 text-[10px] text-[#525252] transition-colors hover:bg-red-950 hover:text-red-400"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {boards.length === 0 && editing.type === 'none' && (
          <p className="text-sm text-[#525252]">Nenhum board ainda.</p>
        )}
      </div>
    </section>
  )
}
