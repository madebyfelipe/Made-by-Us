'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { canManageUsers } from '@/modules/auth/permissions'
import { useAuthenticatedUser } from '@/modules/auth/useAuthenticatedUser'

export default function UserAvatarMenu() {
  const user = useAuthenticatedUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const initials = user.name ? user.name.charAt(0).toUpperCase() : '?'

  function handleSettings() {
    setOpen(false)
    router.push('/settings')
  }

  function handleUsers() {
    setOpen(false)
    router.push('/admin/users')
  }

  async function handleSignOut() {
    setOpen(false)
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#BC0319] text-sm font-semibold text-white transition-opacity hover:opacity-80"
        aria-label="Menu do usuário"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-44 rounded-xl border border-[#2A2A2A] bg-[#141414] py-1 shadow-xl">
          <div className="border-b border-[#2A2A2A] px-4 py-2.5">
            <p className="text-xs font-medium text-[#FAFAFA]">{user.name}</p>
            <p className="mt-0.5 text-[10px] text-[#525252]">{user.email}</p>
          </div>

          <button
            onClick={handleSettings}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-[#FAFAFA]"
          >
            Configurações
          </button>

          {canManageUsers(user.role) && (
            <button
              onClick={handleUsers}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-[#FAFAFA]"
            >
              Usuários
            </button>
          )}

          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[#A3A3A3] transition-colors hover:bg-[#1A1A1A] hover:text-[#BC0319]"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  )
}
