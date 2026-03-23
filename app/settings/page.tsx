import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/modules/auth/authOptions'
import SettingsForm from '@/modules/settings/SettingsForm'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const user = {
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    role: session.user.role,
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-[#1A1A1A] bg-[#141414] p-8 shadow-2xl">
        <h1 className="mb-8 text-xl font-semibold text-[#FAFAFA]">Configurações</h1>
        <SettingsForm user={user} />
      </div>
    </main>
  )
}
