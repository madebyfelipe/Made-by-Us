import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdminSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import { managedUserSelect } from '@/services/adminUserService'
import { createUserSchema } from '@/utils/schemas'

export async function GET() {
  const auth = await requireAdminSession()
  if (auth.response) return auth.response

  const users = await prismaClient.user.findMany({
    select: managedUserSelect,
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(users)
}

export async function POST(request: Request) {
  const auth = await requireAdminSession()
  if (auth.response) return auth.response

  const body = await request.json()
  const parsed = createUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados invÃ¡lidos' },
      { status: 400 },
    )
  }

  const existingUser = await prismaClient.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'E-mail jÃ¡ estÃ¡ em uso' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  const user = await prismaClient.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
      isActive: true,
    },
    select: managedUserSelect,
  })

  return NextResponse.json(user, { status: 201 })
}
