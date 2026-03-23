'use client'

import { useState } from 'react'

type LogEntry = {
  id: string
  message: string
  createdAt: Date
  user: { name: string }
}

type Props = {
  logs: LogEntry[]
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ActivityLogPanel({ logs }: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={[
        'flex h-full shrink-0 flex-col border-l border-[#1A1A1A] bg-[#0A0A0A] transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-72',
      ].join(' ')}
    >
      <div
        className={[
          'border-b border-[#1A1A1A]',
          isCollapsed
            ? 'flex flex-1 flex-col items-center gap-4 px-2 py-4'
            : 'flex items-center justify-between px-4 py-4',
        ].join(' ')}
      >
        {isCollapsed ? (
          <>
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              title="Expandir atividade"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#141414] text-sm text-[#A3A3A3] transition-colors hover:border-[#BC0319] hover:text-[#FAFAFA]"
            >
              {'<'}
            </button>
            <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#525252] [writing-mode:vertical-rl] [transform:rotate(180deg)]">
              Atividade
            </span>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
                Atividade
              </h3>
              <p className="mt-1 text-xs text-[#525252]">
                {logs.length === 0
                  ? 'Sem movimentacoes recentes'
                  : `${logs.length} eventos recentes`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              title="Recolher atividade"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A2A] bg-[#141414] text-sm text-[#A3A3A3] transition-colors hover:border-[#BC0319] hover:text-[#FAFAFA]"
            >
              {'>'}
            </button>
          </>
        )}
      </div>

      {!isCollapsed && (
        <div className="flex flex-1 flex-col overflow-y-auto">
          {logs.length === 0 ? (
            <p className="p-5 text-sm text-[#525252]">Nenhuma atividade ainda.</p>
          ) : (
            logs.map((log, index) => (
              <div
                key={log.id}
                className={[
                  'flex flex-col gap-1 border-b border-[#111111] px-4 py-3 last:border-b-0',
                  index % 2 === 0 ? 'bg-[#111111]' : 'bg-[#050505]',
                ].join(' ')}
              >
                <p className="text-xs font-medium uppercase tracking-widest text-[#525252]">
                  {log.user.name}
                </p>
                <p className="text-sm leading-snug text-[#A3A3A3]">{log.message}</p>
                <span className="text-xs text-[#525252]">{formatDate(log.createdAt)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  )
}
