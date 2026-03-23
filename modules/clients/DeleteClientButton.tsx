'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  clientId: string
  clientName: string
}

export default function DeleteClientButton({ clientId, clientName }: Props) {
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmedDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/clients/${clientId}`, { method: 'DELETE' })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erro ao excluir cliente')
      }

      router.push('/clients')
      router.refresh()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao excluir cliente')
      setIsDeleting(false)
      setIsConfirming(false)
    }
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        {error && <span className="text-xs text-red-400">{error}</span>}
        <span className="text-sm text-[#A3A3A3]">Excluir &quot;{clientName}&quot;?</span>
        <button
          type="button"
          onClick={() => setIsConfirming(false)}
          disabled={isDeleting}
          className="rounded-lg border border-[#2A2A2A] px-4 py-2.5 text-sm text-[#525252] transition-colors hover:text-[#A3A3A3] disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirmedDelete}
          disabled={isDeleting}
          className="rounded-lg bg-[#BC0319] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-40"
        >
          {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsConfirming(true)}
      className="rounded-lg border border-[#2A2A2A] px-5 py-2.5 text-sm font-medium text-[#525252] transition-colors hover:border-red-800 hover:text-red-400"
    >
      Excluir cliente
    </button>
  )
}
