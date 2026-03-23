'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import type { BoardWithColumnsAndCards, CardWithAssignedUser } from '@/types'

const CardModal = dynamic(() => import('./CardModal'), { ssr: false })
const QuickCreateModal = dynamic(() => import('./QuickCreateModal'), { ssr: false })

type Column = BoardWithColumnsAndCards['columns'][number]

type ModalState =
  | { mode: 'create'; columnId: string }
  | { mode: 'edit'; card: CardWithAssignedUser }
  | { mode: 'quick-create' }

type Props = {
  board: BoardWithColumnsAndCards
  readOnly?: boolean
}

export default function KanbanBoard({ board, readOnly = false }: Props) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState<Column[]>(
    board.columns.map((column) => ({
      ...column,
      cards: [...column.cards].sort((a, b) => a.order - b.order),
    })),
  )
  const [activeCard, setActiveCard] = useState<CardWithAssignedUser | null>(null)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [modalState, setModalState] = useState<ModalState | null>(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  const columnsRef = useRef(columns)
  columnsRef.current = columns
  const previousColumnsRef = useRef<Column[]>(columns)
  const pointerXRef = useRef<number | null>(null)
  const scrollFrameRef = useRef<number | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    if (!activeCard && !activeColumn) {
      pointerXRef.current = null

      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = null
      }

      return
    }

    const EDGE_THRESHOLD = 120
    const MAX_SCROLL_STEP = 22

    const tick = () => {
      const scrollArea = scrollAreaRef.current
      const pointerX = pointerXRef.current

      if (!scrollArea || pointerX === null) {
        scrollFrameRef.current = requestAnimationFrame(tick)
        return
      }

      const bounds = scrollArea.getBoundingClientRect()
      let nextStep = 0

      if (pointerX < bounds.left + EDGE_THRESHOLD) {
        const distance = Math.max(pointerX - bounds.left, 0)
        nextStep = -Math.ceil(((EDGE_THRESHOLD - distance) / EDGE_THRESHOLD) * MAX_SCROLL_STEP)
      } else if (pointerX > bounds.right - EDGE_THRESHOLD) {
        const distance = Math.max(bounds.right - pointerX, 0)
        nextStep = Math.ceil(((EDGE_THRESHOLD - distance) / EDGE_THRESHOLD) * MAX_SCROLL_STEP)
      }

      if (nextStep !== 0) {
        scrollArea.scrollLeft += nextStep
      }

      scrollFrameRef.current = requestAnimationFrame(tick)
    }

    scrollFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = null
      }
    }
  }, [activeCard, activeColumn])

  function findColumnByCardId(currentColumns: Column[], cardId: string): Column | undefined {
    return currentColumns.find((column) => column.cards.some((card) => card.id === cardId))
  }

  function handleDragStart({ active }: DragStartEvent) {
    if (readOnly) return

    previousColumnsRef.current = columnsRef.current

    if (active.data.current?.type === 'column') {
      const column = columnsRef.current.find((item) => item.id === active.id)
      setActiveColumn(column ?? null)
      return
    }

    const column = findColumnByCardId(columnsRef.current, active.id as string)
    setActiveCard(column?.cards.find((card) => card.id === active.id) ?? null)
  }

  function handleDragMove({ activatorEvent }: DragMoveEvent) {
    if (!('clientX' in activatorEvent)) return
    pointerXRef.current = activatorEvent.clientX
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (readOnly || !over || active.data.current?.type === 'column') return

    const activeId = active.id as string
    const overId = over.id as string

    setColumns((prev) => {
      const activeColumn = findColumnByCardId(prev, activeId)
      if (!activeColumn) return prev

      const overColumn = prev.find((column) => column.id === overId) ?? findColumnByCardId(prev, overId)

      if (!overColumn || activeColumn.id === overColumn.id) return prev

      const movingCard = activeColumn.cards.find((card) => card.id === activeId)
      if (!movingCard) return prev

      const overIndex = overColumn.cards.findIndex((card) => card.id === overId)
      const insertAt = overIndex >= 0 ? overIndex : overColumn.cards.length

      return prev.map((column) => {
        if (column.id === activeColumn.id) {
          return { ...column, cards: column.cards.filter((card) => card.id !== activeId) }
        }
        if (column.id === overColumn.id) {
          const updated = [...column.cards]
          updated.splice(insertAt, 0, { ...movingCard, columnId: overColumn.id })
          return { ...column, cards: updated }
        }
        return column
      })
    })
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (readOnly) return

    if (active.data.current?.type === 'column') {
      setActiveColumn(null)
      if (over && active.id !== over.id) {
        await handleColumnDragEnd(active.id as string, over.id as string)
      } else {
        setColumns(previousColumnsRef.current)
      }
      return
    }

    setActiveCard(null)

    if (!over) {
      setColumns(previousColumnsRef.current)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string
    const current = columnsRef.current

    const activeColumn = findColumnByCardId(current, activeId)
    if (!activeColumn) return

    const activeIndex = activeColumn.cards.findIndex((card) => card.id === activeId)
    const overIndex = activeColumn.cards.findIndex((card) => card.id === overId)

    let finalColumns = current
    if (overIndex !== -1 && activeIndex !== overIndex) {
      finalColumns = current.map((column) => {
        if (column.id !== activeColumn.id) return column
        return {
          ...column,
          cards: arrayMove(column.cards, activeIndex, overIndex).map((card, index) => ({
            ...card,
            order: index,
          })),
        }
      })
      setColumns(finalColumns)
    }

    const finalColumn = findColumnByCardId(finalColumns, activeId)
    if (!finalColumn) return

    const finalOrder = finalColumn.cards.findIndex((card) => card.id === activeId)

    try {
      const response = await fetch(`/api/cards/${activeId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetColumnId: finalColumn.id, order: finalOrder }),
      })
      if (!response.ok) throw new Error('Failed to persist card move')
    } catch {
      setColumns(previousColumnsRef.current)
    }
  }

  async function handleColumnDragEnd(activeId: string, overId: string) {
    const current = columnsRef.current
    const activeIndex = current.findIndex((column) => column.id === activeId)
    const overIndex = current.findIndex((column) => column.id === overId)

    if (activeIndex === -1 || overIndex === -1) return

    const reordered = arrayMove(current, activeIndex, overIndex).map((column, index) => ({
      ...column,
      order: index,
    }))
    setColumns(reordered)

    try {
      const response = await fetch('/api/columns/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: reordered.map(({ id, order }) => ({ id, order })),
        }),
      })
      if (!response.ok) throw new Error('Failed to persist column reorder')
    } catch {
      setColumns(previousColumnsRef.current)
    }
  }

  async function handleAddColumn() {
    const name = newColumnName.trim()
    if (!name || readOnly) return

    setIsAddingColumn(false)
    setNewColumnName('')

    const order = columnsRef.current.length
    const optimisticId = `temp-${Date.now()}`
    const optimisticColumn: Column = {
      id: optimisticId,
      name,
      order,
      boardId: board.id,
      createdAt: new Date(),
      cards: [],
    }

    setColumns((prev) => [...prev, optimisticColumn])

    try {
      const response = await fetch('/api/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, order, boardId: board.id }),
      })
      if (!response.ok) throw new Error('Failed to create column')
      const created = await response.json()
      setColumns((prev) =>
        prev.map((column) => (column.id === optimisticId ? { ...column, ...created } : column)),
      )
    } catch {
      setColumns((prev) => prev.filter((column) => column.id !== optimisticId))
    }
  }

  const handleRenameColumn = useCallback(async (columnId: string, newName: string) => {
    const snapshot = columnsRef.current
    setColumns((prev) =>
      prev.map((column) => (column.id === columnId ? { ...column, name: newName } : column)),
    )

    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      })
      if (!response.ok) throw new Error('Failed to rename column')
    } catch {
      setColumns(snapshot)
    }
  }, [])

  const handleDeleteColumn = useCallback(async (columnId: string) => {
    const snapshot = columnsRef.current
    setColumns((prev) => prev.filter((column) => column.id !== columnId))

    try {
      const response = await fetch(`/api/columns/${columnId}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete column')
    } catch {
      setColumns(snapshot)
    }
  }, [])

  const handleCardCreated = useCallback((card: CardWithAssignedUser) => {
    setColumns((prev) =>
      prev.map((column) =>
        column.id === card.columnId ? { ...column, cards: [...column.cards, card] } : column,
      ),
    )
  }, [])

  const handleCardUpdated = useCallback((updatedCard: CardWithAssignedUser) => {
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        cards: column.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
      })),
    )
  }, [])

  const handleCardDeleted = useCallback((cardId: string) => {
    setColumns((prev) =>
      prev.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    )
  }, [])

  const handleCardsCreated = useCallback((cards: CardWithAssignedUser[]) => {
    setColumns((prev) =>
      prev.map((column) => {
        const newCards = cards.filter((card) => card.columnId === column.id)
        return newCards.length > 0 ? { ...column, cards: [...column.cards, ...newCards] } : column
      }),
    )
  }, [])

  const handleAddCard = useCallback((columnId: string) => {
    if (readOnly) return
    setModalState({ mode: 'create', columnId })
  }, [readOnly])

  const handleCardClick = useCallback((card: CardWithAssignedUser) => {
    setModalState({ mode: 'edit', card })
  }, [])

  return (
    <>
      {!readOnly && (
        <div className="flex items-center justify-end border-b border-[#1A1A1A] px-6 py-2">
          <button
            onClick={() => setModalState({ mode: 'quick-create' })}
            className="rounded-lg border border-[#2A2A2A] px-3 py-1.5 text-xs text-[#A3A3A3] transition-all duration-150 hover:border-[#BC0319] hover:text-[#FAFAFA]"
          >
            + Criar via texto
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={columns.map((column) => column.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div ref={scrollAreaRef} className="flex h-full gap-5 overflow-x-auto p-6">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                readOnly={readOnly}
                onAddCard={handleAddCard}
                onCardClick={handleCardClick}
                onRenameColumn={handleRenameColumn}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {!readOnly &&
              (isAddingColumn ? (
                <div className="flex w-72 shrink-0 flex-col gap-2">
                  <input
                    autoFocus
                    value={newColumnName}
                    onChange={(event) => setNewColumnName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleAddColumn()
                      if (event.key === 'Escape') {
                        setIsAddingColumn(false)
                        setNewColumnName('')
                      }
                    }}
                    placeholder="Nome da coluna"
                    className="rounded-lg border border-[#BC0319]/60 bg-[#141414] px-3 py-2 text-sm text-[#FAFAFA] outline-none placeholder:text-[#525252]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddColumn}
                      className="rounded-lg bg-[#BC0319] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#A30215]"
                    >
                      Criar
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingColumn(false)
                        setNewColumnName('')
                      }}
                      className="rounded-lg px-3 py-1.5 text-xs text-[#525252] transition-colors hover:text-[#A3A3A3]"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="flex h-fit w-72 shrink-0 items-center gap-2 rounded-xl border border-dashed border-[#2A2A2A] px-4 py-3 text-sm text-[#525252] transition-colors hover:border-[#BC0319] hover:text-[#BC0319]"
                >
                  <span className="text-base leading-none">+</span>
                  Nova coluna
                </button>
              ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={null}>
          {activeCard && <KanbanCard card={activeCard} isOverlay />}
          {activeColumn && (
            <div className="w-72 rounded-xl border border-[#BC0319]/30 bg-[#141414] p-3 opacity-90 shadow-xl">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A3A3A3]">
                {activeColumn.name}
              </h3>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modalState && modalState.mode !== 'quick-create' && (
        <CardModal
          mode={modalState.mode}
          columnId={modalState.mode === 'create' ? modalState.columnId : modalState.card.columnId}
          card={modalState.mode === 'edit' ? modalState.card : null}
          readOnly={readOnly}
          onClose={() => setModalState(null)}
          onCardCreated={handleCardCreated}
          onCardUpdated={handleCardUpdated}
          onCardDeleted={handleCardDeleted}
        />
      )}

      {!readOnly && modalState?.mode === 'quick-create' && (
        <QuickCreateModal
          columns={columns.map((column) => ({ id: column.id, name: column.name }))}
          onClose={() => setModalState(null)}
          onCardsCreated={handleCardsCreated}
        />
      )}
    </>
  )
}
