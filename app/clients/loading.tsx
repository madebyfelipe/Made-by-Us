export default function ClientsLoading() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="mb-2 h-9 w-40 animate-pulse rounded-lg bg-[#141414]" />
          <div className="h-4 w-48 animate-pulse rounded bg-[#1A1A1A]" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-lg bg-[#141414]" />
      </div>

      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-[#141414]" />
        ))}
      </div>
    </main>
  )
}
