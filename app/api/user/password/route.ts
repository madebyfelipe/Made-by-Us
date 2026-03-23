import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAuthenticatedSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres'),
})

export async function POST(request: Request) {
  const auth = await requireAuthenticatedSession()
  if (auth.response) return auth.response

  const session = auth.session
  const body = await request.json()
  const parsed = changePasswordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 400 },
    )
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await prismaClient.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.password)
  if (!passwordMatch) {
    return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prismaClient.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  return NextResponse.json({ success: true })
}
