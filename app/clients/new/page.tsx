import { redirect } from 'next/navigation'
import { canEditWorkspace } from '@/modules/auth/permissions'
import { getAuthSession } from '@/modules/auth/server'
import ClientForm from '@/modules/clients/ClientForm'

export default async function NewClientPage() {
  const session = await getAuthSession()

  if (!canEditWorkspace(session?.user?.role)) {
    redirect('/clients')
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#1A1A1A] bg-[#141414] p-8 shadow-2xl">
        <h1 className="mb-8 text-xl font-semibold text-[#FAFAFA]">Novo cliente</h1>
        <ClientForm mode="create" />
      </div>
    </main>
  )
}
