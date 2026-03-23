import { NextResponse } from 'next/server'
import { prismaClient } from '@/services/prismaClient'

export async function GET() {
  const users = await prismaClient.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(users)
}
