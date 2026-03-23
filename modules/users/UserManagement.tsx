'use client'

import { useState } from 'react'
import type { Role } from '@/app/generated/prisma/client'
import { getRoleLabel, isAdminRole } from '@/modules/auth/permissions'
import type { ManagedUser } from '@/services/adminUserService'

type Props = {
  initialUsers: ManagedUser[]
  currentUserId: string
}

type EditorMode = 'create' | 'edit' | 'password' | null

type UserFormState = {
  name: string
  email: string
  role: Role
  password: string
}

const emptyForm: UserFormState = {
  name: '',
  email: '',
  role: 'MEMBER',
  password: '',
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function UserEditor({
  mode,
  form,
  error,
  saving,
  onClose,
  onSubmit,
  onChange,
}: {
  mode: Exclude<EditorMode, null>
  form: UserFormState
  error: string
  saving: boolean
  onClose: () => void
  onSubmit: (event: React.FormEvent) => void
  onChange: <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => void
}) {
  const isPasswordMode = mode === 'password'
  const title =
    mode === 'create' ? 'Novo usuário' : mode === 'edit' ? 'Editar usuário' : 'Redefinir senha'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#FAFAFA]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#525252] transition-colors hover:text-[#FAFAFA]"
          >
            Fechar
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {!isPasswordMode && (
            <>
              <label className="flex flex-col gap-1.5 text-sm text-[#A3A3A3]">
                Nome
                <input
                  value={form.name}
                  onChange={(event) => onChange('name', event.target.value)}
                  className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none focus:border-[#BC0319]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-[#A3A3A3]">
                E-mail
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none focus:border-[#BC0319]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm text-[#A3A3A3]">
                Papel
                <select
                  value={form.role}
                  onChange={(event) => onChange('role', event.target.value as Role)}
                  className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none focus:border-[#BC0319]"
                >
                  <option value="OWNER">Admin</option>
                  <option value="MEMBER">Colaborador</option>
                </select>
              </label>
            </>
          )}

          {(mode === 'create' || isPasswordMode) && (
            <label className="flex flex-col gap-1.5 text-sm text-[#A3A3A3]">
              Senha
              <input
                type="password"
                value={form.password}
                onChange={(event) => onChange('password', event.target.value)}
                minLength={8}
                className="rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2.5 text-sm text-[#FAFAFA] outline-none focus:border-[#BC0319]"
              />
            </label>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:text-[#FAFAFA]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#BC0319] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#D4031E] disabled:opacity-50"
            >
              {saving ? 'Salvando...' : isPasswordMode ? 'Redefinir senha' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UserManagement({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState(initialUsers)
  const [editorMode, setEditorMode] = useState<EditorMode>(null)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setSelectedUser(null)
    setForm(emptyForm)
    setError('')
    setEditorMode('create')
  }

  function openEdit(user: ManagedUser) {
    setSelectedUser(user)
    setForm({ name: user.name, email: user.email, role: user.role, password: '' })
    setError('')
    setEditorMode('edit')
  }

  function openPassword(user: ManagedUser) {
    setSelectedUser(user)
    setForm((prev) => ({ ...prev, password: '' }))
    setError('')
    setEditorMode('password')
  }

  function closeEditor() {
    setEditorMode(null)
    setSelectedUser(null)
    setForm(emptyForm)
    setError('')
  }

  function setField<K extends keyof UserFormState>(key: K, value: UserFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleEditorSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (editorMode === 'create') {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Erro ao criar usuário')
        setUsers((prev) => [data, ...prev])
      }

      if (editorMode === 'edit' && selectedUser) {
        const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
          }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Erro ao atualizar usuário')
        setUsers((prev) => prev.map((user) => (user.id === data.id ? data : user)))
      }

      if (editorMode === 'password' && selectedUser) {
        const response = await fetch(`/api/admin/users/${selectedUser.id}/password`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: form.password }),
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error ?? 'Erro ao redefinir senha')
      }

      closeEditor()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(user: ManagedUser) {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Erro ao atualizar status')
      setUsers((prev) => prev.map((item) => (item.id === data.id ? data : item)))
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser(user: ManagedUser) {
    const confirmed = window.confirm(`Excluir ${user.name}? Essa ação é permanente.`)
    if (!confirmed) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Erro ao excluir usuário')
      }

      setUsers((prev) => prev.filter((item) => item.id !== user.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-8 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#FAFAFA]">Usuários</h1>
          <p className="mt-1 text-sm text-[#525252]">
            Gerencie acessos administrativos e colaboradores.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-[#BC0319] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#D4031E]"
        >
          Novo usuário
        </button>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#1A1A1A] bg-[#141414]">
        <table className="w-full">
          <thead className="bg-[#0D0D0D]">
            <tr className="text-left text-xs uppercase tracking-widest text-[#525252]">
              <th className="px-5 py-4">Usuário</th>
              <th className="px-5 py-4">Papel</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Criado em</th>
              <th className="px-5 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1A1A1A]">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId

              return (
                <tr key={user.id}>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-[#FAFAFA]">
                        {user.name}
                        {isCurrentUser ? ' (você)' : ''}
                      </span>
                      <span className="text-sm text-[#525252]">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        isAdminRole(user.role)
                          ? 'bg-[#BC0319]/15 text-[#F87171]'
                          : 'bg-[#1A1A1A] text-[#A3A3A3]',
                      ].join(' ')}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={[
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        user.isActive
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-[#1A1A1A] text-[#737373]',
                      ].join(' ')}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#A3A3A3]">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="rounded-md border border-[#2A2A2A] px-3 py-1.5 text-xs text-[#A3A3A3] transition-colors hover:border-[#BC0319] hover:text-[#FAFAFA]"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openPassword(user)}
                        className="rounded-md border border-[#2A2A2A] px-3 py-1.5 text-xs text-[#A3A3A3] transition-colors hover:border-[#BC0319] hover:text-[#FAFAFA]"
                      >
                        Senha
                      </button>
                      <button
                        type="button"
                        disabled={isCurrentUser || saving}
                        onClick={() => toggleActive(user)}
                        className="rounded-md border border-[#2A2A2A] px-3 py-1.5 text-xs text-[#A3A3A3] transition-colors hover:border-[#BC0319] hover:text-[#FAFAFA] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {user.isActive ? 'Desativar' : 'Reativar'}
                      </button>
                      <button
                        type="button"
                        disabled={isCurrentUser || saving}
                        onClick={() => deleteUser(user)}
                        className="rounded-md border border-red-900/60 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editorMode && (
        <UserEditor
          mode={editorMode}
          form={form}
          error={error}
          saving={saving}
          onClose={closeEditor}
          onSubmit={handleEditorSubmit}
          onChange={setField}
        />
      )}
    </main>
  )
}
