export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <div className="mb-2 h-9 w-40 animate-pulse rounded-lg bg-[#141414]" />
          <div className="h-4 w-36 animate-pulse rounded bg-[#1A1A1A]" />
        </div>
        <div className="h-4 w-28 animate-pulse rounded bg-[#1A1A1A]" />
      </div>

      {[1, 2].map((i) => (
        <div key={i} className="mb-10">
          <div className="mb-4 h-3 w-24 animate-pulse rounded bg-[#1A1A1A]" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-20 w-52 animate-pulse rounded-xl bg-[#141414]" />
            ))}
          </div>
        </div>
      ))}
    </main>
  )
}
