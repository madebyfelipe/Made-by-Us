export default function BoardLoading() {
  return (
    <div className="flex h-screen flex-col bg-[#0A0A0A]">
      <div className="flex items-center gap-2 border-b border-[#1A1A1A] px-6 py-4">
        <div className="h-4 w-20 animate-pulse rounded bg-[#1A1A1A]" />
        <span className="text-[#2A2A2A]">/</span>
        <div className="h-4 w-32 animate-pulse rounded bg-[#1A1A1A]" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 gap-5 overflow-hidden p-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex w-64 shrink-0 flex-col gap-3">
              <div className="h-3 w-20 animate-pulse rounded bg-[#1A1A1A]" />
              <div className="flex flex-col gap-2">
                {Array.from({ length: i % 2 === 0 ? 2 : 3 }).map((_, j) => (
                  <div key={j} className="h-16 animate-pulse rounded-lg bg-[#141414]" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="w-60 shrink-0 border-l border-[#1A1A1A]" />
      </div>
    </div>
  )
}
