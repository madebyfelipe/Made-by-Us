'use client'

import { memo, useState, useRef, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import KanbanCard from './KanbanCard'
import ColumnMenu from './ColumnMenu'
import type { BoardWithColumnsAndCards, CardWithAssignedUser } from '@/types'

type Column = BoardWithColumnsAndCards['columns'][number]

type Props = {
  column: Column
  readOnly?: boolean
  onAddCard: (columnId: string) => void
  onCardClick: (card: CardWithAssignedUser) => void
  onRenameColumn: (columnId: string, newName: string) => void
  onDeleteColumn: (columnId: string) => void
  onComplete?: (cardId: string) => void
}

export default memo(function KanbanColumn({
  column,
  readOnly = false,
  onAddCard,
  onCardClick,
  onRenameColumn,
  onDeleteColumn,
  onComplete,
}: Props) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(column.name)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: column.id, disabled: readOnly })
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: 'column' }, disabled: readOnly })

  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.select()
    }
  }, [isRenaming])

  function handleRenameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') commitRename()
    if (event.key === 'Escape') cancelRename()
  }

  function commitRename() {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== column.name) {
      onRenameColumn(column.id, trimmed)
    }
    setIsRenaming(false)
  }

  function cancelRename() {
    setRenameValue(column.name)
    setIsRenaming(false)
  }

  function handleDeleteConfirmed() {
    setIsConfirmingDelete(false)
    onDeleteColumn(column.id)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setSortableRef} style={style} className="group flex w-72 shrink-0 flex-col gap-3">
      {isConfirmingDelete ? (
        <div className="flex flex-col gap-2 rounded-lg border border-[#BC0319]/30 bg-[#1A1A1A] px-3 py-2">
          <p className="text-xs text-[#A3A3A3]">
            Excluir <span className="font-semibold text-[#FAFAFA]">{column.name}</span>?
            {column.cards.length > 0 && (
              <span className="mt-0.5 block text-[#525252]">
                {column.cards.length} card{column.cards.length > 1 ? 's' : ''} serão excluídos.
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteConfirmed}
              className="rounded px-2 py-1 text-xs text-[#BC0319] transition-colors hover:bg-[#BC0319]/10"
            >
              Confirmar
            </button>
            <button
              onClick={() => setIsConfirmingDelete(false)}
              className="rounded px-2 py-1 text-xs text-[#525252] transition-colors hover:text-[#A3A3A3]"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <div
            {...attributes}
            {...listeners}
            className={readOnly ? 'flex flex-1 items-center' : 'flex flex-1 cursor-grab items-center active:cursor-grabbing'}
          >
            {isRenaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={commitRename}
                className="w-full rounded px-1 text-sm font-semibold uppercase tracking-wider text-[#FAFAFA] outline-none ring-1 ring-[#BC0319]/60"
              />
            ) : (
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#A3A3A3]">
                {column.name}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span
              className={`text-sm font-semibold transition-colors duration-150 ${
                column.cards.length > 0 ? 'text-[#BC0319]' : 'text-[#2A2A2A]'
              }`}
            >
              {column.cards.length}
            </span>
            {!readOnly && (
              <ColumnMenu
                onRenameRequested={() => setIsRenaming(true)}
                onDeleteRequested={() => setIsConfirmingDelete(true)}
              />
            )}
          </div>
        </div>
      )}

      <div
        ref={setDropRef}
        className={[
          'flex min-h-28 flex-col gap-2.5 rounded-xl p-2 transition-all duration-150',
          isOver && !readOnly ? 'bg-[#1A1A1A] ring-1 ring-[#BC0319]/40' : 'bg-transparent',
        ].join(' ')}
      >
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              readOnly={readOnly}
              onCardClick={onCardClick}
              onComplete={onComplete}
            />
          ))}
        </SortableContext>

        {column.cards.length === 0 && !isOver && !readOnly && (
          <button
            onClick={() => onAddCard(column.id)}
            className="flex items-center justify-center rounded-lg border border-dashed border-[#2A2A2A] py-5 text-sm text-[#2A2A2A] transition-colors duration-150 hover:border-[#BC0319] hover:text-[#BC0319]"
          >
            + Novo card
          </button>
        )}
      </div>

      {!readOnly && column.cards.length > 0 && (
        <button
          onClick={() => onAddCard(column.id)}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-[#525252] transition-colors hover:text-[#A3A3A3]"
        >
          <span className="text-base leading-none">+</span>
          Novo card
        </button>
      )}
    </div>
  )
})
