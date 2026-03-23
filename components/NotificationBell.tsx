'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { CardStatus, ContentType } from '@/app/generated/prisma/client'

type NotificationCard = {
  id: string
  title: string
  status: CardStatus
  deadline: string | null
  contentType: ContentType | null
  column: {
    name: string
    board: {
      id: string
      name: string
      client: { name: string }
    }
  }
}

type MentionNotification = {
  id: string
  content: string
  createdAt: string
  author: { name: string | null }
  card: {
    id: string
    title: string
    column: {
      board: {
        id: string
        name: string
        client: { name: string }
      }
    }
  }
}

type NotificationsPayload = {
  cards: NotificationCard[]
  mentions: MentionNotification[]
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationsPayload>({
    cards: [],
    mentions: [],
  })
  const [loaded, setLoaded] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleOpen() {
    const next = !open
    setOpen(next)
    if (next && !loaded) {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = (await response.json()) as NotificationsPayload
        setNotifications(data)
      }
      setLoaded(true)
    }
  }

  const pendingCount =
    notifications.cards.filter((card) => card.status !== 'DONE').length + notifications.mentions.length

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#525252] transition-colors hover:text-[#A3A3A3]"
        aria-label="Notificacoes"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {pendingCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#BC0319] text-[8px] font-bold text-white">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-[#2A2A2A] bg-[#141414] shadow-xl">
          {!loaded ? (
            <div className="px-4 py-6 text-center text-xs text-[#525252]">Carregando...</div>
          ) : (
            <>
              <div className="border-b border-[#2A2A2A] px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#525252]">
                  Minha Pauta
                </p>
              </div>

              {notifications.cards.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs text-[#525252]">
                  Nenhum card atribuido a voce
                </div>
              ) : (
                <ul className="max-h-48 overflow-y-auto">
                  {notifications.cards.map((card) => (
                    <li key={card.id}>
                      <Link
                        href={`/boards/${card.column.board.id}`}
                        onClick={() => setOpen(false)}
                        className="flex flex-col gap-0.5 px-4 py-3 transition-colors hover:bg-[#1A1A1A]"
                      >
                        <span className="line-clamp-1 text-xs font-medium text-[#FAFAFA]">
                          {card.title}
                        </span>
                        <span className="text-[10px] text-[#525252]">
                          {card.column.board.client.name} · {card.column.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="border-y border-[#2A2A2A] px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#525252]">
                  Menções
                </p>
              </div>

              {notifications.mentions.length === 0 ? (
                <div className="px-4 py-4 text-center text-xs text-[#525252]">
                  Nenhuma observacao marcada para voce
                </div>
              ) : (
                <ul className="max-h-48 overflow-y-auto">
                  {notifications.mentions.map((mention) => (
                    <li key={mention.id}>
                      <Link
                        href={`/boards/${mention.card.column.board.id}`}
                        onClick={() => setOpen(false)}
                        className="flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-[#1A1A1A]"
                      >
                        <span className="text-[11px] font-medium text-[#FAFAFA]">
                          {mention.author.name ?? 'Alguem'} comentou em {mention.card.title}
                        </span>
                        <span className="line-clamp-2 text-[10px] text-[#A3A3A3]">
                          {mention.content}
                        </span>
                        <span className="text-[10px] text-[#525252]">
                          {mention.card.column.board.client.name} · {new Date(mention.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="border-t border-[#2A2A2A] px-4 py-2">
            <Link
              href="/jobs"
              onClick={() => setOpen(false)}
              className="text-[10px] text-[#525252] transition-colors hover:text-[#A3A3A3]"
            >
              Ver todos os jobs →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
