'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  onRenameRequested: () => void
  onDeleteRequested: () => void
}

export default function ColumnMenu({ onRenameRequested, onDeleteRequested }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  function handleRename() {
    setIsOpen(false)
    onRenameRequested()
  }

  function handleDelete() {
    setIsOpen(false)
    onDeleteRequested()
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-5 w-5 items-center justify-center rounded text-[#525252] opacity-0 transition-all duration-150 group-hover:opacity-100 hover:bg-[#2A2A2A] hover:text-[#A3A3A3]"
        aria-label="Opções da coluna"
      >
        <span className="text-xs leading-none">⋯</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-6 z-20 min-w-36 rounded-lg border border-[#2A2A2A] bg-[#141414] py-1 shadow-lg">
          <button
            onClick={handleRename}
            className="w-full px-3 py-2 text-left text-xs text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-[#FAFAFA]"
          >
            Renomear
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-xs text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-[#BC0319]"
          >
            Excluir
          </button>
        </div>
      )}
    </div>
  )
}
