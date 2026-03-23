'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@/components/Logo'
import NotificationBell from '@/components/NotificationBell'
import UserAvatarMenu from '@/components/UserAvatarMenu'
import { canManageUsers } from '@/modules/auth/permissions'
import { useAuthenticatedUser } from '@/modules/auth/useAuthenticatedUser'

const NAV_LINKS = [
  { label: 'Jobs', href: '/jobs' },
  { label: 'Clientes', href: '/clients' },
]

export default function AppHeader() {
  const pathname = usePathname()
  const user = useAuthenticatedUser()

  if (pathname === '/login') return null

  const navLinks = canManageUsers(user?.role)
    ? [...NAV_LINKS, { label: 'Usuários', href: '/admin/users' }]
    : NAV_LINKS

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-[#1A1A1A] bg-[#0A0A0A] px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center">
          <Logo width={100} height={26} />
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150',
                  active ? 'text-[#BC0319]' : 'text-[#A3A3A3] hover:text-[#FAFAFA]',
                ].join(' ')}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <UserAvatarMenu />
      </div>
    </header>
  )
}
