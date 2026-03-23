import type { DefaultSession, DefaultJWT } from 'next-auth'
import type { Role } from '@/app/generated/prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: Role
      isActive: boolean
    } & DefaultSession['user']
  }

  interface User {
    role: Role
    isActive: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: Role
    isActive: boolean
  }
}
