'use client'

import { useState } from 'react'
import type { Role } from '@/app/generated/prisma/client'
import { getRoleLabel } from '@/modules/auth/permissions'

type Props = {
  user: { name: string; email: string; role: Role }
}

const inputClass =
  'w-full rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder-[#525252] outline-none focus:border-[#BC0319] transition-colors'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#BC0319]">
      {children}
    </p>
  )
}

function PasswordSection() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
    setSuccess(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      return setError('As senhas não coincidem')
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Erro ao alterar senha')
      setSuccess(true)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="password"
        value={form.currentPassword}
        onChange={(event) => handleChange('currentPassword', event.target.value)}
        placeholder="Senha atual"
        className={inputClass}
      />
      <input
        type="password"
        value={form.newPassword}
        onChange={(event) => handleChange('newPassword', event.target.value)}
        placeholder="Nova senha (mín. 8 caracteres)"
        className={inputClass}
      />
      <input
        type="password"
        value={form.confirmPassword}
        onChange={(event) => handleChange('confirmPassword', event.target.value)}
        placeholder="Confirmar nova senha"
        className={inputClass}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {success && <p className="text-xs text-emerald-400">Senha alterada com sucesso</p>}
      <button
        type="submit"
        disabled={saving}
        className="w-fit rounded-lg bg-[#BC0319] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#D4031E] disabled:opacity-50"
      >
        {saving ? 'Salvando...' : 'Alterar senha'}
      </button>
    </form>
  )
}

function ThemeSection() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem('theme') as 'dark' | 'light' | null) ?? 'dark'
  })

  function applyTheme(next: 'dark' | 'light') {
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <div className="w-fit rounded-lg border border-[#2A2A2A] p-1">
      {(['dark', 'light'] as const).map((option) => (
        <button
          key={option}
          onClick={() => applyTheme(option)}
          className={[
            'rounded-md px-4 py-1.5 text-xs font-medium transition-colors duration-150',
            theme === option
              ? 'bg-[#1A1A1A] text-[#FAFAFA]'
              : 'text-[#525252] hover:text-[#A3A3A3]',
          ].join(' ')}
        >
          {option === 'dark' ? 'Escuro' : 'Claro'}
        </button>
      ))}
    </div>
  )
}

export default function SettingsForm({ user }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle>Conta</SectionTitle>
        <div className="flex flex-col gap-2 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#525252]">Nome</span>
            <span className="text-sm text-[#FAFAFA]">{user.name}</span>
          </div>
          <div className="border-t border-[#1A1A1A]" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#525252]">E-mail</span>
            <span className="text-sm text-[#A3A3A3]">{user.email}</span>
          </div>
          <div className="border-t border-[#1A1A1A]" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#525252]">Perfil</span>
            <span className="rounded-full bg-[#1A1A1A] px-2.5 py-0.5 text-xs font-medium text-[#A3A3A3]">
              {getRoleLabel(user.role)}
            </span>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Senha</SectionTitle>
        <PasswordSection />
      </section>

      <section>
        <SectionTitle>Aparência</SectionTitle>
        <ThemeSection />
      </section>
    </div>
  )
}
