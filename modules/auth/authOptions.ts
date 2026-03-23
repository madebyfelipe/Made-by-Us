import type { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prismaClient } from '@/services/prismaClient'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prismaClient.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) return null
        if (!user.isActive) return null

        const passwordMatches = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatches) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isActive = user.isActive
      } else if (token.id) {
        const currentUser = await prismaClient.user.findUnique({
          where: { id: token.id },
          select: { role: true, isActive: true },
        })

        if (currentUser) {
          token.role = currentUser.role
          token.isActive = currentUser.isActive
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      session.user.isActive = token.isActive
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
}
