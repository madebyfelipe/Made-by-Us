import { buildStrategicProfileFields, type StrategicProfileSource } from './strategicProfile'

type Props = {
  profile: StrategicProfileSource
  compact?: boolean
}

export default function ClientStrategicProfile({ profile, compact = false }: Props) {
  const fields = buildStrategicProfileFields(profile)

  if (fields.length === 0) {
    return (
      <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] px-5 py-4 text-sm text-[#525252]">
        Nenhum briefing estratégico preenchido para este cliente.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] divide-y divide-[#1A1A1A]">
      {fields.map((field) => (
        <div
          key={field.label}
          className={compact ? 'flex flex-col gap-1 px-5 py-4' : 'flex gap-8 px-6 py-4'}
        >
          <span
            className={
              compact
                ? 'text-xs font-semibold uppercase tracking-widest text-[#525252]'
                : 'w-44 shrink-0 text-sm font-medium text-[#525252]'
            }
          >
            {field.label}
          </span>
          <span className="text-sm leading-relaxed text-[#A3A3A3]">{field.value}</span>
        </div>
      ))}
    </div>
  )
}
