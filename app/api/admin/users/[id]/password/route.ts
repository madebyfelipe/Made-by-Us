import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { requireAdminSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import { resetManagedUserPasswordSchema } from '@/utils/schemas'

type RouteParams = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: RouteParams) {
  const auth = await requireAdminSession()
  if (auth.response) return auth.response

  const { id } = await params
  const body = await request.json()
  const parsed = resetManagedUserPasswordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados invÃ¡lidos' },
      { status: 400 },
    )
  }

  const existingUser = await prismaClient.user.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existingUser) {
    return NextResponse.json({ error: 'UsuÃ¡rio nÃ£o encontrado' }, { status: 404 })
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 12)

  await prismaClient.user.update({
    where: { id },
    data: { password: hashedPassword },
  })

  return NextResponse.json({ success: true })
}
