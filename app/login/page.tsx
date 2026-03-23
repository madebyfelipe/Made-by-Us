'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setError('E-mail ou senha inválidos.')
      return
    }

    router.push('/')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <div className="w-full max-w-sm rounded-2xl border border-[#2A2A2A] bg-[#141414] p-8">
        <Logo width={140} height={36} className="mb-4" />
        <p className="mb-8 text-sm text-[#525252]">Acesse sua conta para continuar.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm text-[#A3A3A3]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none placeholder:text-[#525252] focus:border-[#BC0319]"
              placeholder="seu@email.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm text-[#A3A3A3]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none placeholder:text-[#525252] focus:border-[#BC0319]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 rounded-lg bg-[#BC0319] py-2.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#D4031E] disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
