'use client'

import { memo } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { CardWithAssignedUser, Priority, CardStatus, ContentType } from '@/types'

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  LOW: { label: 'Baixa', className: 'bg-[#1A1A1A] text-[#525252]' },
  MEDIUM: { label: 'Média', className: 'bg-blue-950 text-blue-400' },
  HIGH: { label: 'Alta', className: 'bg-orange-950 text-orange-400' },
  URGENT: { label: 'Urgente', className: 'bg-red-950 text-[#BC0319]' },
}

const statusConfig: Record<CardStatus, { label: string; dotClassName: string }> = {
  TODO: { label: 'A fazer', dotClassName: 'bg-[#525252]' },
  IN_PROGRESS: { label: 'Em andamento', dotClassName: 'bg-amber-400' },
  IN_REVIEW: { label: 'Em revisão', dotClassName: 'bg-blue-400' },
  DONE: { label: 'Concluído', dotClassName: 'bg-emerald-400' },
}

const platformAbbreviations: Record<string, string> = {
  instagram: 'IG',
  linkedin: 'LI',
  tiktok: 'TT',
  youtube: 'YT',
}

const contentTypeConfig: Record<ContentType, { label: string; icon: React.ReactNode }> = {
  POST: {
    label: 'Post',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-3 w-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="2.5" width="14" height="11" rx="1.5" />
        <polyline points="1,10 5,6.5 8,9 11,7 15,11" />
      </svg>
    ),
  },
  STORY: {
    label: 'Story',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-3 w-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="1" width="8" height="14" rx="1.5" />
        <circle cx="8" cy="12.5" r="0.75" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  REELS: {
    label: 'Reels',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-3 w-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="8" cy="8" r="6.5" />
        <polygon points="6.5,5.5 11.5,8 6.5,10.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  CAROUSEL: {
    label: 'Carrossel',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-3 w-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="9" height="9" rx="1.2" />
        <rect x="6" y="3" width="9" height="9" rx="1.2" />
      </svg>
    ),
  },
  ADS: {
    label: 'Ads',
    icon: (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        className="h-3 w-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 10.5V6.5a1 1 0 0 1 1-1h1l5-3v11l-5-3H3a1 1 0 0 1-1-1Z" />
        <path d="M12 6a3 3 0 0 1 0 4" />
        <line x1="6" y1="12.5" x2="8" y2="15" />
      </svg>
    ),
  },
}

function UserInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2A2A2A] text-xs font-medium text-[#A3A3A3]">
      {initials}
    </span>
  )
}

function DeadlineBadge({ deadline }: { deadline: Date | string }) {
  const date = new Date(deadline)
  const isOverdue = date < new Date()
  const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  return (
    <span className={`text-xs font-medium ${isOverdue ? 'text-[#BC0319]' : 'text-[#A3A3A3]'}`}>
      {isOverdue ? '! ' : ''}
      {label}
    </span>
  )
}

function ContentTypeBadge({ type }: { type: ContentType }) {
  const config = contentTypeConfig[type]

  return (
    <span className="flex items-center gap-1 rounded bg-[#1E1E1E] px-2 py-0.5 text-xs font-medium text-[#A3A3A3]">
      {config.icon}
      {config.label}
    </span>
  )
}

function PlatformBadges({ platform }: { platform: string }) {
  const platforms = platform.split(',').filter(Boolean)
  if (platforms.length === 0) return null

  return (
    <>
      {platforms.map((platformName) => (
        <span
          key={platformName}
          className="rounded bg-[#1A1A1A] px-1.5 py-0.5 text-xs font-medium text-[#525252]"
        >
          {platformAbbreviations[platformName] ?? platformName.slice(0, 2).toUpperCase()}
        </span>
      ))}
    </>
  )
}

type Props = {
  card: CardWithAssignedUser
  isOverlay?: boolean
  readOnly?: boolean
  onCardClick?: (card: CardWithAssignedUser) => void
}

export default memo(function KanbanCard({
  card,
  isOverlay = false,
  readOnly = false,
  onCardClick,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: 'card' },
    disabled: readOnly || isOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = priorityConfig[card.priority]
  const status = statusConfig[card.status]
  const hasTypeMeta = card.contentType || card.platform

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => !isDragging && !isOverlay && onCardClick?.(card)}
      className={[
        'select-none rounded-xl border border-[#2A2A2A] bg-[#141414] p-3.5',
        readOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
        'transition-all duration-150',
        isDragging ? 'opacity-30' : 'hover:border-[#BC0319] hover:bg-[#1A1A1A]',
        isOverlay ? 'rotate-1 scale-105 shadow-2xl' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${status.dotClassName}`} />
        <span className="text-xs font-medium text-[#525252]">{status.label}</span>
      </div>

      <p className="mb-3 line-clamp-3 text-sm font-medium leading-snug text-[#FAFAFA]">
        {card.title}
      </p>

      {hasTypeMeta && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {card.contentType && <ContentTypeBadge type={card.contentType} />}
          {card.platform && <PlatformBadges platform={card.platform} />}
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${priority.className}`}>
            {priority.label}
          </span>
          {card.deadline && <DeadlineBadge deadline={card.deadline} />}
        </div>

        {card.assignedUser && <UserInitials name={card.assignedUser.name} />}
      </div>
    </div>
  )
})
