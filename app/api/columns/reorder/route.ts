import { NextResponse } from 'next/server'
import { requireWorkspaceWriteSession } from '@/modules/auth/server'
import { prismaClient } from '@/services/prismaClient'
import type { ReorderColumnsInput } from '@/types'

export async function PATCH(request: Request) {
  const auth = await requireWorkspaceWriteSession()
  if (auth.response) return auth.response

  const body = (await request.json()) as ReorderColumnsInput

  if (!Array.isArray(body.updates) || body.updates.length === 0) {
    return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
  }

  const updatedColumns = await prismaClient.$transaction(
    body.updates.map(({ id, order }) =>
      prismaClient.column.update({ where: { id }, data: { order } }),
    ),
  )

  return NextResponse.json(updatedColumns)
}
